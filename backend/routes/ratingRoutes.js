const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * ✅ Get ratings given by the logged-in user
 * GET /api/ratings/user
 */
router.get("/user", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching ratings for user:", userId);

    // Disable caching for the response
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    const userRatingsResult = await pool.query(
      "SELECT store_id, rating FROM ratings WHERE user_id = $1",
      [userId]
    );

    const userRatings = {};
    userRatingsResult.rows.forEach((row) => {
      userRatings[row.store_id] = row.rating;
    });

    res.status(200).json(userRatings);
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});


/**
 * ✅ Get store owner's average rating + all user ratings
 * GET /api/ratings/owner/average-rating
 */
router.get("/owner/average-rating", authenticateUser, async (req, res) => {
  const ownerId = req.user.id;

  try {
    const store = await pool.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [ownerId]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const storeId = store.rows[0].id;

    const ratingsResult = await pool.query(
      `SELECT r.rating, u.name AS user_name 
       FROM ratings r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = $1`,
      [storeId]
    );

    const averageRating =
      ratingsResult.rows.length > 0
        ? ratingsResult.rows.reduce((sum, r) => sum + r.rating, 0) /
          ratingsResult.rows.length
        : 0;

    res.json({
      average_rating: averageRating.toFixed(1),
      ratings: ratingsResult.rows,
    });
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * ✅ Add or Update Rating
 * POST /api/ratings
 */
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
      const storeExists = await pool.query(
        "SELECT id FROM stores WHERE id = $1",
        [store_id]
      );
      if (storeExists.rows.length === 0) {
        return res.status(404).json({ message: "Store not found" });
      }

      const existingRating = await pool.query(
        "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
        [userId, store_id]
      );

      let updatedRating;
      if (existingRating.rows.length > 0) {
        updatedRating = await pool.query(
          `UPDATE ratings SET rating = $1 WHERE id = $2 RETURNING *`,
          [rating, existingRating.rows[0].id]
        );
      } else {
        updatedRating = await pool.query(
          `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *`,
          [userId, store_id, rating]
        );
      }

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

/**
 * ✅ Get average rating for a specific store
 * GET /api/ratings/:storeId
 * Note: This comes LAST to avoid route conflict
 */
router.get("/:storeId(\\d+)", async (req, res) => {
  const { storeId } = req.params;

  try {
    const storeExists = await pool.query(
      "SELECT id FROM stores WHERE id = $1",
      [storeId]
    );
    if (storeExists.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

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

module.exports = router;
