-- Saan schema for Supabase (Postgres).
-- Run this once in the Supabase SQL Editor (or via `psql`) before starting the
-- backend. It mirrors the old SQLite schema in db.js, translated to Postgres.
--
-- Note: RLS is left OFF on purpose. All access still goes through the
-- Express API using the Postgres connection string (service-level access),
-- not through Supabase's client libraries, so Supabase's row-level security
-- doesn't apply here — the Express routes are what enforce who can see or
-- change what.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spots (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  address     TEXT NOT NULL,
  avg_rating  REAL NOT NULL DEFAULT 0,
  price_range TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS plan_spots (
  id          TEXT PRIMARY KEY,
  plan_id     TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  spot_id     TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  spot_id    TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL,
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_spots_plan_id ON plan_spots(plan_id);
CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON reviews(spot_id);
