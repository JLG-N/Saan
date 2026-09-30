const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth); // every plan route belongs to a logged-in user

async function getPlanWithSpots(planId) {
  const { rows: planRows } = await db.query("SELECT * FROM plans WHERE id = $1", [planId]);
  const plan = planRows[0];
  if (!plan) return null;

  const { rows: spots } = await db.query(
    `SELECT spots.*, plan_spots.order_index
     FROM plan_spots JOIN spots ON spots.id = plan_spots.spot_id
     WHERE plan_spots.plan_id = $1
     ORDER BY plan_spots.order_index ASC`,
    [planId]
  );

  return { ...plan, spots };
}

async function recomputeStatus(planId) {
  const { rows } = await db.query("SELECT COUNT(*) AS n FROM plan_spots WHERE plan_id = $1", [planId]);
  const status = Number(rows[0].n) > 0 ? "ready" : "draft";
  await db.query("UPDATE plans SET status = $1 WHERE id = $2", [status, planId]);
}

// GET /api/plans — only this user's plans
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    const plans = await Promise.all(rows.map((p) => getPlanWithSpots(p.id)));
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/plans { title }
router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "title is required." });
    }
    const id = "plan_" + crypto.randomBytes(6).toString("hex");
    await db.query(
      "INSERT INTO plans (id, title, user_id, status) VALUES ($1, $2, $3, 'draft')",
      [id, title.trim(), req.userId]
    );
    res.status(201).json({ plan: await getPlanWithSpots(id) });
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/:id
router.get("/:id", async (req, res, next) => {
  try {
    const plan = await getPlanWithSpots(req.params.id);
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

// PUT /api/plans/:id { title }
router.put("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    const { title } = req.body;
    if (title !== undefined) {
      await db.query("UPDATE plans SET title = $1 WHERE id = $2", [title.trim(), req.params.id]);
    }
    res.json({ plan: await getPlanWithSpots(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/plans/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    await db.query("DELETE FROM plans WHERE id = $1", [req.params.id]); // plan_spots cascade
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/plans/:id/spots { spotId } — appended to the end of the itinerary
router.post("/:id/spots", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    const { spotId } = req.body;
    const { rows: spotRows } = await db.query("SELECT * FROM spots WHERE id = $1", [spotId]);
    if (!spotRows[0]) return res.status(404).json({ error: "Spot not found." });

    const { rows: existing } = await db.query(
      "SELECT id FROM plan_spots WHERE plan_id = $1 AND spot_id = $2",
      [req.params.id, spotId]
    );
    if (existing[0]) return res.status(409).json({ error: "That spot is already in this plan." });

    const { rows: maxRows } = await db.query(
      "SELECT COALESCE(MAX(order_index), -1) AS max_index FROM plan_spots WHERE plan_id = $1",
      [req.params.id]
    );
    const nextIndex = Number(maxRows[0].max_index) + 1;

    const id = "ps_" + crypto.randomBytes(6).toString("hex");
    await db.query(
      "INSERT INTO plan_spots (id, plan_id, spot_id, order_index) VALUES ($1, $2, $3, $4)",
      [id, req.params.id, spotId, nextIndex]
    );

    await recomputeStatus(req.params.id);
    res.status(201).json({ plan: await getPlanWithSpots(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/plans/:id/spots/:spotId
router.delete("/:id/spots/:spotId", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    await db.query("DELETE FROM plan_spots WHERE plan_id = $1 AND spot_id = $2", [
      req.params.id,
      req.params.spotId,
    ]);
    await recomputeStatus(req.params.id);
    res.json({ plan: await getPlanWithSpots(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/plans/:id/share — turn on link sharing (idempotent: reuses the existing token)
router.post("/:id/share", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    if (plan.status !== "ready") {
      return res.status(400).json({ error: "Add at least one spot before sharing this plan." });
    }
    if (plan.share_token) return res.json({ shareToken: plan.share_token });

    const token = crypto.randomBytes(16).toString("base64url"); // 128 bits, unguessable
    // Only set it if still null, so two racing requests can't hand out different tokens.
    const { rows: updated } = await db.query(
      "UPDATE plans SET share_token = $1 WHERE id = $2 AND share_token IS NULL RETURNING share_token",
      [token, req.params.id]
    );
    if (updated[0]) return res.json({ shareToken: updated[0].share_token });
    const { rows: again } = await db.query("SELECT share_token FROM plans WHERE id = $1", [req.params.id]);
    res.json({ shareToken: again[0].share_token });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/plans/:id/share — turn sharing off; the old link stops working immediately
router.delete("/:id/share", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      return res.status(404).json({ error: "Plan not found." });
    }
    await db.query("UPDATE plans SET share_token = NULL WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PUT /api/plans/:id/reorder { spotIds: [...] } — full ordered list, in the order they should appear
router.put("/:id/reorder", async (req, res, next) => {
  const client = await db.connect();
  try {
    const { rows } = await client.query("SELECT * FROM plans WHERE id = $1", [req.params.id]);
    const plan = rows[0];
    if (!plan || plan.user_id !== req.userId) {
      client.release();
      return res.status(404).json({ error: "Plan not found." });
    }
    const { spotIds } = req.body;
    if (!Array.isArray(spotIds)) {
      client.release();
      return res.status(400).json({ error: "spotIds must be an array." });
    }

    try {
      await client.query("BEGIN");
      for (let index = 0; index < spotIds.length; index++) {
        await client.query(
          "UPDATE plan_spots SET order_index = $1 WHERE plan_id = $2 AND spot_id = $3",
          [index, req.params.id, spotIds[index]]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    res.json({ plan: await getPlanWithSpots(req.params.id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
