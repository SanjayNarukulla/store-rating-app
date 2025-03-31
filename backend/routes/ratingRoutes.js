const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ➤ Add or Update Rating (POST /api/ratings)
router.post(
  "/",
  authenticateUser,
  [
    body("store_id").isInt({ min: 1 }).withMessage("Invalid store ID"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { store_id, rating } = req.body;
    const userId = req.user.id;

    try {
      // Check if store exists
      const storeExists = await pool.query(
        "SELECT id FROM stores WHERE id = $1",
        [store_id]
      );
      if (storeExists.rows.length === 0) {
        return res.status(404).json({ message: "Store not found" });
      }

      // Check if the user already rated the store
      const existingRating = await pool.query(
        "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
        [userId, store_id]
      );

      let updatedRating;
      if (existingRating.rows.length > 0) {
        // Update rating
        updatedRating = await pool.query(
          `UPDATE ratings SET rating = $1 WHERE id = $2 RETURNING *`,
          [rating, existingRating.rows[0].id]
        );
      } else {
        // Insert new rating
        updatedRating = await pool.query(
          `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *`,
          [userId, store_id, rating]
        );
      }

      // Get updated average rating
      const avgRating = await pool.query(
        `SELECT AVG(rating) AS average_rating FROM ratings WHERE store_id = $1`,
        [store_id]
      );

      res.status(201).json({
        message:
          existingRating.rows.length > 0 ? "Rating updated" : "Rating added",
        rating: updatedRating.rows[0],
        average_rating: avgRating.rows[0].average_rating,
      });
    } catch (err) {
      console.error("Error adding/updating rating:", err);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  }
);

// ➤ Get Average Rating for a Store (GET /api/ratings/:storeId)
router.get("/:storeId", async (req, res) => {
  const { storeId } = req.params;

  try {
    // Check if store exists
    const storeExists = await pool.query(
      "SELECT id FROM stores WHERE id = $1",
      [storeId]
    );
    if (storeExists.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Calculate average rating
    const avgRating = await pool.query(
      `SELECT AVG(rating) AS average_rating FROM ratings WHERE store_id = $1`,
      [storeId]
    );

    res.json({ average_rating: avgRating.rows[0].average_rating || 0 });
  } catch (err) {
    console.error("Error fetching average rating:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

router.get("/owner/average-rating", authenticateUser, async (req, res) => {
  const ownerId = req.user.id;

  try {
    // Get store details for the owner
    const store = await pool.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [ownerId]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const storeId = store.rows[0].id;

    // Fetch average rating and user ratings
    const ratingsResult = await pool.query(
      `SELECT r.rating, u.name AS user_name 
       FROM ratings r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = $1`,
      [storeId]
    );

    // Calculate average rating
    const averageRating =
      ratingsResult.rows.length > 0
        ? ratingsResult.rows.reduce((sum, r) => sum + r.rating, 0) /
          ratingsResult.rows.length
        : 0;

    res.json({
      average_rating: averageRating.toFixed(1),
      ratings: ratingsResult.rows, // Sending user ratings
    });
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
