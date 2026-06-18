const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

// GET my bookings
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.booking_id AS id, b.total_amount, b.status, b.booked_at,
             e.title AS event_title,
             v.name AS venue_name
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      JOIN venues v ON e.venue_id = v.venue_id
      WHERE b.user_id = ?
      ORDER BY b.booked_at DESC
    `, [req.user.id]);

    for (const booking of bookings) {
      const [seats] = await pool.query(`
        SELECT s.seat_number
        FROM booking_seats bs
        JOIN seats s ON bs.seat_id = s.seat_id
        WHERE bs.booking_id = ?
      `, [booking.id]);
      booking.seats = seats.map(s => s.seat_number);
    }

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE booking
router.post("/", authMiddleware, async (req, res) => {
  const { event_id, seat_ids, total_amount } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // create booking
    const [result] = await conn.query(
      "INSERT INTO bookings (user_id, event_id, total_amount, status) VALUES (?, ?, ?, 'pending')",
      [req.user.id, event_id, total_amount]
    );
    const booking_id = result.insertId;

    // insert each seat
    for (const seat_id of seat_ids) {
      await conn.query(
        "INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)",
        [booking_id, seat_id]
      );
      await conn.query(
        "UPDATE seats SET status = 'booked' WHERE seat_id = ?",
        [seat_id]
      );
    }

    // create payment record
    await conn.query(
      "INSERT INTO payments (booking_id, gateway_ref, amount, status, paid_at) VALUES (?, ?, ?, 'success', NOW())",
      [booking_id, `PAY-${Date.now()}`, total_amount]
    );

    // confirm booking
    await conn.query(
      "UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?",
      [booking_id]
    );

    await conn.commit();
    res.status(201).json({ message: "Booking confirmed", booking_id });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  } finally {
    conn.release();
  }
});

module.exports = router;