const express = require("express");
const db = require("../db");

// PUBLIC, read-only. No requireAuth here on purpose: the unguessable share
// token in the URL is the only credential. Only fields safe for strangers to
// see are returned -- no user id, email, or internal plan id.
const router = express.Router();

// GET /api/shared/:token
router.get("/:token", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT plans.id, plans.title, users.name AS owner_name
       FROM plans JOIN users ON users.id = plans.user_id
       WHERE plans.share_token = $1`,
      [req.params.token]
    );
    const plan = rows[0];
    if (!plan) return res.status(404).json({ error: "This plan link isn't valid or is no longer shared." });

    const { rows: spots } = await db.query(
      `SELECT spots.id, spots.name, spots.category, spots.address, spots.avg_rating, spots.price_range,
              plan_spots.order_index
       FROM plan_spots JOIN spots ON spots.id = plan_spots.spot_id
       WHERE plan_spots.plan_id = $1
       ORDER BY plan_spots.order_index ASC`,
      [plan.id]
    );

    res.set("Cache-Control", "no-store"); // revoking a link should take effect right away
    res.json({
      plan: {
        title: plan.title,
        ownerFirstName: (plan.owner_name || "").trim().split(/\s+/)[0] || null,
        spots,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
