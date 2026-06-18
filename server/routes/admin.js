const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET all users
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id AS id, name, email, role, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE user
router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE user role
router.patch("/users/:id/role", authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query(
      "UPDATE users SET role = ? WHERE user_id = ?",
      [req.body.role, req.params.id]
    );
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all events
router.get("/events", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.event_id AS id, e.title, e.category, e.event_date,
             e.base_price, e.status,
             v.name AS venue_name, v.city,
             u.name AS organizer_name
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      JOIN users u ON e.created_by = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE event
router.delete("/events/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE event_id = ?", [req.params.id]);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE event status
router.patch("/events/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query(
      "UPDATE events SET status = ? WHERE event_id = ?",
      [req.body.status, req.params.id]
    );
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all bookings
router.get("/bookings", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.booking_id AS id, b.total_amount, b.status, b.booked_at,
             u.name AS user_name, u.email AS user_email,
             e.title AS event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN events e ON b.event_id = e.event_id
      ORDER BY b.booked_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;