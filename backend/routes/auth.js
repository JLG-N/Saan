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

// POST /api/auth/signup { email, password, name }
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password, and name are required." });
    }

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const id = "user_" + crypto.randomBytes(6).toString("hex");
    const password_hash = bcrypt.hashSync(password, 10);

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
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

module.exports = router;
