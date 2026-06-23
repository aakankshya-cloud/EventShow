const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware, organizerOnly } = require("../middleware/auth");

// GET all events (public, with filters)
router.get("/", async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = `
      SELECT e.event_id AS id, e.title, e.category, e.description,
             e.event_date, e.base_price, e.status, e.created_by,
             v.name AS venue_name, v.city
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.status = 'upcoming'
    `;
    const params = [];

    if (category) { query += " AND e.category = ?";  params.push(category); }
    if (city)     { query += " AND v.city = ?";       params.push(city);     }
    if (search)   { query += " AND e.title LIKE ?";   params.push(`%${search}%`); }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single event with sections
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.event_id AS id, e.title, e.category, e.description,
             e.event_date, e.base_price, e.status, e.created_by,
             v.name AS venue_name, v.city, v.address
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.event_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = rows[0];

    const [sections] = await pool.query(
      "SELECT section_id AS id, section_name, total_seats, price FROM seat_sections WHERE event_id = ?",
      [req.params.id]
    );

    event.sections = sections;
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET seats for a section
router.get("/:id/seats/:sectionId", async (req, res) => {
  try {
    const [seats] = await pool.query(
      "SELECT seat_id AS id, seat_number, status FROM seats WHERE section_id = ?",
      [req.params.sectionId]
    );
    res.json(seats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET events created by the logged-in organizer
router.get("/organizer/mine", authMiddleware, organizerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.event_id AS id, e.title, e.category, e.description,
             e.event_date, e.base_price, e.status,
             v.name AS venue_name, v.city
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.created_by = ?
      ORDER BY e.event_date ASC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE event (organizer only)
router.post("/", authMiddleware, organizerOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      title, category, description, event_date, base_price,
      venue_name, city, address,
      sections, // [{ section_name, total_seats, price }]
    } = req.body;

    if (!title || !category || !event_date || !base_price || !venue_name || !city) {
      conn.release();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate category against the enum to avoid a confusing SQL error
    const validCategories = ["concert", "movie", "sports", "plays"];
    if (!validCategories.includes(category)) {
      conn.release();
      return res.status(400).json({ message: `Category must be one of: ${validCategories.join(", ")}` });
    }

    await conn.beginTransaction();

    // Default sections (used below for both venue capacity calc and DB insert)
    const sectionList = sections && sections.length > 0 ? sections : [
      { section_name: "VIP",     total_seats: 20, price: Math.round(base_price * 2)   },
      { section_name: "Premium", total_seats: 36, price: Math.round(base_price * 1.4) },
      { section_name: "General", total_seats: 75, price: base_price },
    ];
    const totalCapacity = sectionList.reduce((sum, s) => sum + Number(s.total_seats), 0);

    // Create or reuse venue
    const [existingVenue] = await conn.query(
      "SELECT venue_id FROM venues WHERE name = ? AND city = ?",
      [venue_name, city]
    );

    let venueId;
    if (existingVenue.length > 0) {
      venueId = existingVenue[0].venue_id;
    } else {
      const [venueResult] = await conn.query(
        "INSERT INTO venues (name, city, address, total_capacity) VALUES (?, ?, ?, ?)",
        [venue_name, city, address || null, totalCapacity]
      );
      venueId = venueResult.insertId;
    }

    // Create event — created_by comes from the verified JWT, never trusted from the request body
    const [eventResult] = await conn.query(
      `INSERT INTO events (title, category, description, event_date, base_price, venue_id, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [title, category, description || "", event_date, base_price, venueId, req.user.id]
    );
    const eventId = eventResult.insertId;

    // Create seat sections + individual seats
    for (const sec of sectionList) {
      const [sectionResult] = await conn.query(
        "INSERT INTO seat_sections (event_id, section_name, total_seats, price) VALUES (?, ?, ?, ?)",
        [eventId, sec.section_name, sec.total_seats, sec.price]
      );
      const sectionId = sectionResult.insertId;

      const seatValues = [];
      for (let i = 1; i <= sec.total_seats; i++) {
        seatValues.push([sectionId, `${sec.section_name[0]}${i}`, "available"]);
      }
      if (seatValues.length > 0) {
        await conn.query(
          "INSERT INTO seats (section_id, seat_number, status) VALUES ?",
          [seatValues]
        );
      }
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ message: "Event created", event_id: eventId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ message: "Server error creating event" });
  }
});

// UPDATE event (only the organizer who created it, or admin)
router.put("/:id", authMiddleware, organizerOnly, async (req, res) => {
  try {
    const [existing] = await pool.query(
      "SELECT created_by FROM events WHERE event_id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (existing[0].created_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't own this event" });
    }

    const { title, category, description, event_date, base_price, status } = req.body;

    await pool.query(
      `UPDATE events
       SET title = ?, category = ?, description = ?, event_date = ?, base_price = ?, status = ?
       WHERE event_id = ?`,
      [title, category, description, event_date, base_price, status || "upcoming", req.params.id]
    );

    res.json({ message: "Event updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE event (only the organizer who created it, or admin)
router.delete("/:id", authMiddleware, organizerOnly, async (req, res) => {
  try {
    const [existing] = await pool.query(
      "SELECT created_by FROM events WHERE event_id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (existing[0].created_by !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You don't own this event" });
    }

    await pool.query("DELETE FROM events WHERE event_id = ?", [req.params.id]);
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;