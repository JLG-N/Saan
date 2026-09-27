const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/spots?category=Café&q=coffee — public, no login required to browse
router.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    let sql = "SELECT * FROM spots WHERE 1=1";
    const params = [];

    if (category && category !== "All") {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND name ILIKE $${params.length}`;
    }

    const { rows } = await db.query(sql, params);
    res.json({ spots: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/spots/:id — includes its reviews
router.get("/:id", async (req, res, next) => {
  try {
    const { rows: spots } = await db.query("SELECT * FROM spots WHERE id = $1", [req.params.id]);
    const spot = spots[0];
    if (!spot) return res.status(404).json({ error: "Spot not found." });

    const { rows: reviews } = await db.query(
      `SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at, users.name AS user_name
       FROM reviews JOIN users ON users.id = reviews.user_id
       WHERE reviews.spot_id = $1 ORDER BY reviews.created_at DESC`,
      [req.params.id]
    );

    res.json({ spot, reviews });
  } catch (err) {
    next(err);
  }
});

// POST /api/spots/:id/reviews { rating, comment } — requires login
router.post("/:id/reviews", requireAuth, async (req, res, next) => {
  try {
    const { rows: spots } = await db.query("SELECT * FROM spots WHERE id = $1", [req.params.id]);
    const spot = spots[0];
    if (!spot) return res.status(404).json({ error: "Spot not found." });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be a number from 1 to 5." });
    }

    const id = "rev_" + crypto.randomBytes(6).toString("hex");
    await db.query(
      "INSERT INTO reviews (id, spot_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
      [id, req.params.id, req.userId, rating, comment || null]
    );

    // recompute avg_rating so it stays honest
    const { rows: avgRows } = await db.query(
      "SELECT AVG(rating) AS avg FROM reviews WHERE spot_id = $1",
      [req.params.id]
    );
    const avg = Number(avgRows[0].avg);
    await db.query("UPDATE spots SET avg_rating = $1 WHERE id = $2", [
      Math.round(avg * 10) / 10,
      req.params.id,
    ]);

    const { rows: reviewRows } = await db.query("SELECT * FROM reviews WHERE id = $1", [id]);
    res.status(201).json({ review: reviewRows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
