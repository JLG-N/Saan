









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
  price_range TEXT NOT NULL,
  tagline     TEXT,
  neighborhood TEXT,
  tags        TEXT[] DEFAULT '{}',
  image_url   TEXT
);

ALTER TABLE spots ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS plans (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'draft',
  share_token TEXT UNIQUE 
);

ALTER TABLE plans ADD COLUMN IF NOT EXISTS share_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_share_token ON plans(share_token) WHERE share_token IS NOT NULL;

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
CREATE INDEX IF NOT EXISTS idx_plan_spots_plan_order ON plan_spots(plan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_reviews_spot_created ON reviews(spot_id, created_at DESC);
