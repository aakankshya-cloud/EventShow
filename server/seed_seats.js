// seed_seats.js
// Place this file inside your server/ folder and run: node seed_seats.js

require("dotenv").config();
const pool = require("./config/db");

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

async function seedSeats() {
  try {
    // Get all sections that have no seats yet
    const [sections] = await pool.query(`
      SELECT ss.section_id, ss.section_name, ss.total_seats
      FROM seat_sections ss
      LEFT JOIN seats s ON s.section_id = ss.section_id
      WHERE s.seat_id IS NULL
    `);

    if (sections.length === 0) {
      console.log("✅ All sections already have seats. Nothing to do.");
      process.exit(0);
    }

    console.log(`Found ${sections.length} section(s) with no seats. Seeding...`);

    for (const section of sections) {
      const { section_id, section_name, total_seats } = section;

      // Figure out rows x cols from total_seats
      // Try to make a roughly square-ish grid, max 26 rows (A-Z)
      let rows, cols;
      if (total_seats <= 26) {
        rows = total_seats;
        cols = 1;
      } else {
        cols = Math.ceil(Math.sqrt(total_seats));
        rows = Math.ceil(total_seats / cols);
        if (rows > 26) { rows = 26; cols = Math.ceil(total_seats / rows); }
      }

      const seats = [];
      let count = 0;
      outer: for (let r = 0; r < rows; r++) {
        const letter = LETTERS[r];
        for (let c = 1; c <= cols; c++) {
          if (count >= total_seats) break outer;
          seats.push([section_id, `${letter}${c}`, "available"]);
          count++;
        }
      }

      // Bulk insert in chunks of 100
      const CHUNK = 100;
      for (let i = 0; i < seats.length; i += CHUNK) {
        const chunk = seats.slice(i, i + CHUNK);
        await pool.query(
          "INSERT INTO seats (section_id, seat_number, status) VALUES ?",
          [chunk]
        );
      }

      console.log(`  ✓ Section "${section_name}" (id=${section_id}): inserted ${seats.length} seats`);
    }

    console.log("\n✅ Done! All seats seeded.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedSeats();