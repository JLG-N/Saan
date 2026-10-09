const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function normalizeSearchTerm(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

router.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const params = [];
    let sql = "SELECT * FROM spots WHERE 1 = 1";

    if (category && category !== "All") {
      params.push(String(category));
      sql += ` AND category = $${params.length}`;
    }

    const search = normalizeSearchTerm(q);
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (
        name ILIKE $${params.length}
        OR address ILIKE $${params.length}
        OR neighborhood ILIKE $${params.length}
        OR tagline ILIKE $${params.length}
      )`;
    }

    sql += " ORDER BY avg_rating DESC, name ASC";

    const { rows } = await db.query(sql, params);
    res.json({ spots: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', r.id,
                    'user_id', r.user_id,
                    'rating', r.rating,
                    'comment', r.comment,
                    'created_at', r.created_at,
                    'user_name', u.name
                  ) ORDER BY r.created_at DESC
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::json
              ) AS reviews
       FROM spots s
       LEFT JOIN reviews r ON r.spot_id = s.id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [req.params.id]
    );

    const spot = rows[0];
    if (!spot) return res.status(404).json({ error: "Spot not found." });

    res.json({ spot: { ...spot, reviews: spot.reviews || [] } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reviews", requireAuth, async (req, res, next) => {
  let client;
  try {
    const { rating, comment } = req.body;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be a number from 1 to 5." });
    }
    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      return res.status(400).json({ error: "comment must be a string." });
    }
    if (typeof comment === "string" && comment.length > 500) {
      return res.status(400).json({ error: "comment must be 500 characters or fewer." });
    }

    client = await db.connect();
    await client.query("BEGIN");
    const { rows: spotRows } = await client.query(
      "SELECT id FROM spots WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (!spotRows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Spot not found." });
    }

    const id = "rev_" + crypto.randomBytes(6).toString("hex");
    const { rows } = await client.query(
      `INSERT INTO reviews (id, spot_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.params.id, req.userId, rating, comment?.trim() || null]
    );
    await client.query(
      `UPDATE spots
       SET avg_rating = (
         SELECT ROUND(AVG(rating)::numeric, 1)::real
         FROM reviews
         WHERE spot_id = $1
       )
       WHERE id = $1`,
      [req.params.id]
    );
    await client.query("COMMIT");

    res.status(201).json({ review: rows[0] });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Review transaction rollback failed:", rollbackError);
      }
    }
    next(err);
  } finally {
    client?.release();
  }
});

router.delete("/:id/reviews/:reviewId", requireAuth, async (req, res, next) => {
  let client;
  try {
    client = await db.connect();
    await client.query("BEGIN");

    const { rows: spotRows } = await client.query(
      "SELECT id FROM spots WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    if (!spotRows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Spot not found." });
    }

    const { rows: deletedRows } = await client.query(
      `DELETE FROM reviews
       WHERE id = $1 AND spot_id = $2 AND user_id = $3
       RETURNING id`,
      [req.params.reviewId, req.params.id, req.userId]
    );
    if (!deletedRows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Review not found." });
    }

    const { rows: updatedSpots } = await client.query(
      `UPDATE spots
       SET avg_rating = COALESCE(
         (
           SELECT ROUND(AVG(rating)::numeric, 1)::real
           FROM reviews
           WHERE spot_id = $1
         ),
         0
       )
       WHERE id = $1
       RETURNING avg_rating`,
      [req.params.id]
    );

    await client.query("COMMIT");
    res.json({ reviewId: deletedRows[0].id, avg_rating: updatedSpots[0].avg_rating });
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Review deletion transaction rollback failed:", rollbackError);
      }
    }
    next(err);
  } finally {
    client?.release();
  }
});

module.exports = router;
