const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, async (req, res) => {
  try {
    // Ensure only Admins can access this endpoint
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Fetch total counts from each table
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const storesCount = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsCount = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      totalUsers: usersCount.rows[0].count,
      totalStores: storesCount.rows[0].count,
      totalRatings: ratingsCount.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
