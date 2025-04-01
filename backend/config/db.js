require("dotenv").config();
const { Pool } = require("pg");

const isRender = process.env.RENDER === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => console.log("✅ PostgreSQL Connected"));
pool.on("error", (err) => console.error("❌ PostgreSQL Error:", err));

// ✅ Test query to check connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database Query Error:", err);
  } else {
    console.log("🕒 Database Time:", res.rows[0].now);
  }
});

module.exports = pool;
