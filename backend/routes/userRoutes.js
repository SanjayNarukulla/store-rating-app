const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const authenticateUser = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin Only, with optional search and role filtering)
 * @access  Private (Admin)
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        ROUND(AVG(r.rating), 1) AS average_store_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY u.id, u.name, u.email, u.address, u.role
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});



/**
 * @route   GET /api/users/:id
 * @desc    Get user details (Admin only, includes store ratings if Owner)
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

    const userData = user.rows[0];

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
    body("address").notEmpty().withMessage("Address is required"),
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
      const { name, email, password, role, address } = req.body;

      const userExists = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address",
        [name, email, hashedPassword, role, address]
      );

      res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


router.put("/update-password", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    // Fetch user from DB
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in DB
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
