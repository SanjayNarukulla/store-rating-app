const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const authenticateUser = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin Only, with optional role filtering)
 * @access  Private (Admin)
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { role } = req.query;
    let query = "SELECT id, name, email, address,role FROM users";
    const values = [];

    if (role) {
      query += " WHERE role = $1";
      values.push(role);
    }

    const users = await pool.query(query, values);
    res.json(users.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user details (including store ratings if store owner)
 * @access  Private (Admin)
 */
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let userData = user.rows[0];

    if (userData.role === "Owner") {
      const store = await pool.query(
        "SELECT ratings FROM stores WHERE owner_id = $1",
        [id]
      );
      userData.ratings = store.rows.length ? store.rows[0].ratings : null;
    }

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (Admin Only)
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticateUser,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role").custom((value) => {
      const allowedRoles = ["Admin", "User", "Owner"];
      if (!allowedRoles.includes(value)) {
        throw new Error("Role must be Admin, User, or Owner");
      }
      return true;
    }),
    body("address").notEmpty().withMessage("Address is required"), // ✅ Added address validation
  ],
  async (req, res) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role, address } = req.body; // ✅ Include address

      console.log("Received request body:", req.body);

      const userExists = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address",
        [name, email, hashedPassword, role, address] // ✅ Store address
      );

      res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
