const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const safeRole = role === "organizer" ? "organizer" : "user";

    await pool.query(
      "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, password_hash, phone || null, safeRole]
    );

    res.status(201).json({ message: "Account created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN ATTEMPT:", email, password);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );
    console.log("ROWS FOUND:", rows.length); 
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    console.log("STORED HASH:", user.password_hash);
    const match = await bcrypt.compare(password, user.password_hash);
    console.log("PASSWORD MATCH:", match);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id:    user.user_id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;