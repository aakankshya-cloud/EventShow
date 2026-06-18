const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all events
router.get("/", async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = `
      SELECT e.event_id AS id, e.title, e.category, e.description,
             e.event_date, e.base_price, e.status,
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
             e.event_date, e.base_price, e.status,
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

module.exports = router;