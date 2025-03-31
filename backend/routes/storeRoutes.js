const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stores = await pool.query(`SELECT * FROM stores`);
    res.json(stores.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/",
  authenticateUser,
  [
    body("name").notEmpty(),
    body("address").notEmpty(),
    body("email").isEmail().optional({ nullable: true }), // Email is optional now
    body("owner_id").isInt(), // Owner ID is now required
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (req.user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { name, email, address, owner_id } = req.body;

      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
        owner_id,
      ]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: "Owner id does not exist" });
      }

      const newStore = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, address, owner_id]
      );

      res.status(201).json(newStore.rows[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
