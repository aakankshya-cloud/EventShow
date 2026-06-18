const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware, organizerOnly } = require("../middleware/auth");

// GET organizer's events
router.get("/events", authMiddleware, organizerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.event_id AS id, e.title, e.category, e.event_date,
              e.base_price, e.status, v.name AS venue_name, v.city
       FROM events e
       JOIN venues v ON e.venue_id = v.venue_id
       WHERE e.created_by = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE event
router.post("/events", authMiddleware, organizerOnly, async (req, res) => {
  const { venue_id, title, category, description, event_date, base_price } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO events (venue_id, created_by, title, category, description, event_date, base_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [venue_id, req.user.id, title, category, description, event_date, base_price]
    );
    res.status(201).json({ message: "Event created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE seat sections + seats for an event
// Body: { sections: [{ section_name, rows, seats_per_row, price }] }
router.post("/events/:id/sections", authMiddleware, organizerOnly, async (req, res) => {
  const eventId = req.params.id;
  const { sections } = req.body;

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ message: "sections array is required" });
  }

  // Verify this organizer owns the event
  const [ownership] = await pool.query(
    "SELECT event_id FROM events WHERE event_id = ? AND created_by = ?",
    [eventId, req.user.id]
  );
  if (ownership.length === 0) {
    return res.status(403).json({ message: "Not your event" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const sec of sections) {
      const { section_name, rows, seats_per_row, price } = sec;
      const total_seats = rows * seats_per_row;

      // Insert the section
      const [secResult] = await conn.query(
        "INSERT INTO seat_sections (event_id, section_name, total_seats, price) VALUES (?, ?, ?, ?)",
        [eventId, section_name, total_seats, price]
      );
      const sectionId = secResult.insertId;

      // Generate seats: A1, A2 … Z50
      const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, rows);
      const seatValues = [];
      for (const letter of rowLetters) {
        for (let col = 1; col <= seats_per_row; col++) {
          seatValues.push([sectionId, `${letter}${col}`, "available"]);
        }
      }

      // Bulk insert all seats for this section
      await conn.query(
        "INSERT INTO seats (section_id, seat_number, status) VALUES ?",
        [seatValues]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Sections and seats created" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to create seats" });
  } finally {
    conn.release();
  }
});

// UPDATE event
router.put("/events/:id", authMiddleware, organizerOnly, async (req, res) => {
  const { title, category, description, event_date, base_price, status } = req.body;
  try {
    await pool.query(
      `UPDATE events SET title=?, category=?, description=?, event_date=?, base_price=?, status=?
       WHERE event_id=? AND created_by=?`,
      [title, category, description, event_date, base_price, status, req.params.id, req.user.id]
    );
    res.json({ message: "Event updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE event
router.delete("/events/:id", authMiddleware, organizerOnly, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM events WHERE event_id = ? AND created_by = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all venues (for create event form)
router.get("/venues", authMiddleware, organizerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT venue_id AS id, name, city FROM venues"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;