const { Pool } = require("pg");

// Supabase gives you this connection string under
// Project Settings -> Database -> Connection string (URI). Put it in .env
// as DATABASE_URL. See README.md for the full setup steps.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and paste in your Supabase connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase's pooled connection (port 6543, pgbouncer) and direct connection
  // (port 5432) both sit behind a proxy that needs TLS but uses a
  // self-signed-looking chain from Node's perspective -- this is the standard
  // setting for connecting from a server you don't manage the cert for.
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error:", err);
});

module.exports = pool;
