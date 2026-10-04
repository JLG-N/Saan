const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:token", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id,
              p.title,
              u.name AS owner_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', s.id,
                    'name', s.name,
                    'category', s.category,
                    'address', s.address,
                    'avg_rating', s.avg_rating,
                    'price_range', s.price_range,
                    'order_index', ps.order_index
                  ) ORDER BY ps.order_index ASC
                ) FILTER (WHERE s.id IS NOT NULL),
                '[]'::json
              ) AS spots
       FROM plans p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN plan_spots ps ON ps.plan_id = p.id
       LEFT JOIN spots s ON s.id = ps.spot_id
       WHERE p.share_token = $1
       GROUP BY p.id, p.title, u.name`,
      [req.params.token]
    );

    const plan = rows[0];
    if (!plan) {
      return res.status(404).json({ error: "This plan link isn't valid or is no longer shared." });
    }

    res.set("Cache-Control", "no-store");
    res.json({
      plan: {
        title: plan.title,
        ownerFirstName: (plan.owner_name || "").trim().split(/\s+/)[0] || null,
        spots: plan.spots || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
