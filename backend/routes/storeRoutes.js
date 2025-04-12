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
    body("name").notEmpty().withMessage("Name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("email")
      .isEmail()
      .optional({ nullable: true })
      .withMessage("Invalid email format"),
    body("owner_id").isInt().withMessage("Owner ID must be an integer"),
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

      // Check if the provided owner_id exists in the users table and has the role 'Owner'
      const userCheck = await pool.query(
        "SELECT id, role FROM users WHERE id = $1",
        [owner_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: "Owner id does not exist" });
      }

      if (userCheck.rows[0].role.toLowerCase() !== "owner") {
        return res
          .status(400)
          .json({
            message: "Provided owner id does not belong to an 'Owner' user",
          });
      }

      const newStore = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, address, owner_id]
      );

      res.status(201).json(newStore.rows[0]);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ message: error.message });
    }
  }
);
module.exports = router;
