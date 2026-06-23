const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware } = require("../middleware/auth");

// GET my bookings
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.booking_id AS id, b.total_amount, b.status, b.booked_at,
             e.title AS event_title, e.event_date,
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

    const [result] = await conn.query(
      "INSERT INTO bookings (user_id, event_id, total_amount, status) VALUES (?, ?, ?, 'pending')",
      [req.user.id, event_id, total_amount]
    );
    const booking_id = result.insertId;

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

    await conn.query(
      "INSERT INTO payments (booking_id, gateway_ref, amount, status, paid_at) VALUES (?, ?, ?, 'success', NOW())",
      [booking_id, `PAY-${Date.now()}`, total_amount]
    );

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

// REFUND — cancel booking, free seats, mark payment failed
router.post("/:id/refund", authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check booking exists and belongs to this user
    const [rows] = await conn.query(
      "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = rows[0];

    if (booking.status === "cancelled") {
      conn.release();
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // 2. Check event hasn't already happened
    const [eventRows] = await conn.query(
      `SELECT e.event_date FROM events e
       JOIN bookings b ON b.event_id = e.event_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );

    if (eventRows.length > 0) {
      const eventDate = new Date(eventRows[0].event_date);
      if (eventDate < new Date()) {
        conn.release();
        return res.status(400).json({ message: "Cannot refund a booking for a past event" });
      }
    }

    // 3. Free up the seats
    const [seatRows] = await conn.query(
      "SELECT seat_id FROM booking_seats WHERE booking_id = ?",
      [req.params.id]
    );

    for (const { seat_id } of seatRows) {
      await conn.query(
        "UPDATE seats SET status = 'available' WHERE seat_id = ?",
        [seat_id]
      );
    }

    // 4. Mark booking as cancelled
    await conn.query(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?",
      [req.params.id]
    );

    // 5. Mark payment as failed (refunded)
    await conn.query(
      "UPDATE payments SET status = 'failed' WHERE booking_id = ?",
      [req.params.id]
    );

    await conn.commit();
    conn.release();

    res.json({
      message: "Refund processed. Booking cancelled and seats released.",
      refund_amount: booking.total_amount,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ message: "Refund failed. Please try again." });
  }
});

module.exports = router;