const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const PLAN_WITH_SPOTS_QUERY = `
  SELECT plans.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', spots.id,
               'name', spots.name,
               'category', spots.category,
               'address', spots.address,
               'avg_rating', spots.avg_rating,
               'price_range', spots.price_range,
               'tagline', spots.tagline,
               'neighborhood', spots.neighborhood,
               'tags', spots.tags,
               'image_url', spots.image_url,
               'order_index', plan_spots.order_index
             ) ORDER BY plan_spots.order_index
           ) FILTER (WHERE spots.id IS NOT NULL),
           '[]'::json
         ) AS spots
  FROM plans
  LEFT JOIN plan_spots ON plan_spots.plan_id = plans.id
  LEFT JOIN spots ON spots.id = plan_spots.spot_id
`;

function normalizeTitle(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function getPlanById(planId, client = db) {
  const { rows } = await client.query("SELECT * FROM plans WHERE id = $1", [planId]);
  return rows[0] || null;
}

async function getPlanForUser(planId, userId, client = db) {
  const { rows } = await client.query("SELECT * FROM plans WHERE id = $1 AND user_id = $2", [
    planId,
    userId,
  ]);
  return rows[0] || null;
}

async function getPlanWithSpots(planId, client = db) {
  const { rows } = await client.query(
    `${PLAN_WITH_SPOTS_QUERY}
     WHERE plans.id = $1
     GROUP BY plans.id`,
    [planId]
  );
  return rows[0] || null;
}

async function recomputeStatus(planId, client = db) {
  const { rows } = await client.query(
    `UPDATE plans
     SET status = CASE
       WHEN EXISTS (SELECT 1 FROM plan_spots WHERE plan_id = $1)
         THEN 'ready'
       ELSE 'draft'
     END
     WHERE id = $1
     RETURNING status`,
    [planId]
  );
  return rows[0]?.status ?? "draft";
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `${PLAN_WITH_SPOTS_QUERY}
       WHERE plans.user_id = $1
       GROUP BY plans.id
       ORDER BY plans.created_at DESC`,
      [req.userId]
    );
    res.json({ plans: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const cleanedTitle = normalizeTitle(req.body.title);
    if (!cleanedTitle) {
      return res.status(400).json({ error: "title is required." });
    }

    const id = "plan_" + crypto.randomBytes(6).toString("hex");
    await db.query(
      "INSERT INTO plans (id, title, user_id, status) VALUES ($1, $2, $3, 'draft')",
      [id, cleanedTitle, req.userId]
    );

    res.status(201).json({ plan: await getPlanWithSpots(id) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `${PLAN_WITH_SPOTS_QUERY}
       WHERE plans.id = $1 AND plans.user_id = $2
       GROUP BY plans.id`,
      [req.params.id, req.userId]
    );
    const plan = rows[0];
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const plan = await getPlanForUser(req.params.id, req.userId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    const { title } = req.body;
    if (title !== undefined) {
      const cleanedTitle = normalizeTitle(title);
      if (!cleanedTitle) {
        return res.status(400).json({ error: "title is required." });
      }
      await db.query("UPDATE plans SET title = $1 WHERE id = $2", [cleanedTitle, req.params.id]);
    }

    res.json({ plan: await getPlanWithSpots(req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const plan = await getPlanForUser(req.params.id, req.userId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    await db.query("DELETE FROM plans WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/spots", async (req, res, next) => {
  const client = await db.connect();
  try {
    const plan = await getPlanForUser(req.params.id, req.userId, client);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    const { spotId } = req.body;
    if (typeof spotId !== "string" || !spotId.trim()) {
      return res.status(400).json({ error: "spotId is required." });
    }

    const { rows: spotRows } = await client.query("SELECT id FROM spots WHERE id = $1", [spotId]);
    if (!spotRows[0]) {
      return res.status(404).json({ error: "Spot not found." });
    }

    const id = "ps_" + crypto.randomBytes(6).toString("hex");
    const { rows: inserted } = await client.query(
      `WITH next_order AS (
         SELECT COALESCE(MAX(order_index), -1) + 1 AS next_index
         FROM plan_spots
         WHERE plan_id = $1
       )
       INSERT INTO plan_spots (id, plan_id, spot_id, order_index)
       SELECT $2, $1, $3, next_index
       FROM next_order
       WHERE NOT EXISTS (
         SELECT 1 FROM plan_spots WHERE plan_id = $1 AND spot_id = $3
       )
       RETURNING id`,
      [req.params.id, id, spotId]
    );

    if (!inserted[0]) {
      return res.status(409).json({ error: "That spot is already in this plan." });
    }

    await recomputeStatus(req.params.id, client);
    res.status(201).json({ plan: await getPlanWithSpots(req.params.id, client) });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

router.delete("/:id/spots/:spotId", async (req, res, next) => {
  try {
    const plan = await getPlanForUser(req.params.id, req.userId);
    if (!plan) {
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

router.post("/:id/share", async (req, res, next) => {
  try {
    const plan = await getPlanForUser(req.params.id, req.userId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }
    if (plan.status !== "ready") {
      return res.status(400).json({ error: "Add at least one spot before sharing this plan." });
    }
    if (plan.share_token) return res.json({ shareToken: plan.share_token });

    const token = crypto.randomBytes(16).toString("base64url");

    const { rows: updated } = await db.query(
      "UPDATE plans SET share_token = $1 WHERE id = $2 AND share_token IS NULL RETURNING share_token",
      [token, req.params.id]
    );
    if (updated[0]) return res.json({ shareToken: updated[0].share_token });

    const { rows: again } = await db.query("SELECT share_token FROM plans WHERE id = $1", [req.params.id]);
    return res.json({ shareToken: again[0].share_token });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/share", async (req, res, next) => {
  try {
    const plan = await getPlanForUser(req.params.id, req.userId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    await db.query("UPDATE plans SET share_token = NULL WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.put("/:id/reorder", async (req, res, next) => {
  const client = await db.connect();
  try {
    const plan = await getPlanForUser(req.params.id, req.userId, client);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    const { spotIds } = req.body;
    if (!Array.isArray(spotIds)) {
      return res.status(400).json({ error: "spotIds must be an array." });
    }

    const normalizedSpotIds = spotIds.filter((spotId) => typeof spotId === "string" && spotId.trim());
    if (normalizedSpotIds.length !== spotIds.length) {
      return res.status(400).json({ error: "spotIds must be non-empty strings." });
    }

    const { rows: matchingRows } = await client.query(
      "SELECT spot_id FROM plan_spots WHERE plan_id = $1 AND spot_id = ANY($2::text[])",
      [req.params.id, normalizedSpotIds]
    );
    if (matchingRows.length !== normalizedSpotIds.length) {
      return res.status(400).json({ error: "One or more spotIds do not belong to this plan." });
    }

    const rank = Array.from({ length: normalizedSpotIds.length }, (_, index) => index);
    await client.query(
      `WITH ordered AS (
         SELECT unnest($1::text[]) AS spot_id,
                unnest($2::int[]) AS order_index
       )
       UPDATE plan_spots AS ps
       SET order_index = ordered.order_index
       FROM ordered
       WHERE ps.plan_id = $3
         AND ps.spot_id = ordered.spot_id`,
      [normalizedSpotIds, rank, req.params.id]
    );

    res.json({ plan: await getPlanWithSpots(req.params.id, client) });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
