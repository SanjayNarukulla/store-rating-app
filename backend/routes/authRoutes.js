const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const router = express.Router();

// User Registration Route
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("address").notEmpty(),
    body("role").optional().isIn(["Admin", "User", "Owner"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role = "User" } = req.body;
    let client;

    try {
      client = await pool.connect();

      // Check if email already exists
      const emailCheck = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      await client.query("BEGIN"); // Begin Transaction

      // Get next user ID
      const sequenceResult = await client.query(
        "SELECT nextval('users_id_seq') AS next_id"
      );
      const nextUserId = sequenceResult.rows[0].next_id;

      // Lock ID to prevent conflicts
      await client.query("SELECT pg_advisory_lock($1)", [nextUserId]);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      

      // Insert new user
      const newUser = await client.query(
        `INSERT INTO users (id, name, email, password, address, role) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nextUserId, name, email, hashedPassword, address, role]
      );

      // Unlock ID after success
      await client.query("SELECT pg_advisory_unlock($1)", [nextUserId]);
      await client.query("COMMIT"); // Commit Transaction
      res.status(201).json(newUser.rows[0]);
    } catch (err) {
      if (client) {
        await client.query("ROLLBACK"); 
        console.error("❌ Register Error:", err);// Rollback Transaction on Error
      }
      res
        .status(500)
        .json({ message: "Registration failed", error: err.message });
    } finally {
      if (client) client.release();
    }
  }
);

// User Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  let client;
  
  try {
    client = await pool.connect();
    const user = await client.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    if (!user.rows.length) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(password);
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    console.log(user.rows[0].password);
    console.log(validPassword);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
      
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const { password: hashedPassword, ...userWithoutPassword } = user.rows[0];
    
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
