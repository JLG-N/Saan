const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

function validateEmail(value) {
  return typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/auth/signup { email, password, name }
router.post("/signup", async (req, res, next) => {
  try {
    const { email: rawEmail, password, name: rawName } = req.body || {};
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const name = typeof rawName === "string" ? rawName.trim() : "";

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (typeof password !== "string" || Buffer.byteLength(password, "utf8") < 8 ||
        Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Password must be between 8 and 72 bytes." });
    }
    if (!name || name.length > 80) {
      return res.status(400).json({ error: "Name must be between 1 and 80 characters." });
    }

    const existing = await db.query("SELECT id FROM users WHERE LOWER(email) = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const id = "user_" + crypto.randomBytes(6).toString("hex");
    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
      [id, email, password_hash, name]
    );

    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login { email, password }
router.post("/login", async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body || {};
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

    if (!validateEmail(email) || typeof password !== "string" ||
        !password || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "A valid email address and password are required." });
    }

    const { rows } = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — verifies a token is still good and returns the user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/me — permanently removes the authenticated user's account
router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT id FROM users WHERE id = $1", [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    await db.query("DELETE FROM users WHERE id = $1", [req.userId]);
    res.json({ ok: true, message: "Account deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
