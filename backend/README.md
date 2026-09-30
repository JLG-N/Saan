# Saan Backend

A small Express API backed by a Supabase (Postgres) database, matching the schema from the project proposal: `spots`, `plans`, `plan_spots`, `reviews` — plus a `users` table for login. The Express layer still does all the auth and access control; Supabase is only being used here for its hosted Postgres database, not its client SDK.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough).
2. **Run the schema.** Open the project's SQL Editor and run everything in `schema.sql` — that creates the five tables.
3. **Get your connection string.** Project Settings → Database → Connection string → URI. Use the "Transaction pooler" one (port `6543`) — it works from anywhere without extra network config.
4. **Configure the backend:**
   ```bash
   cp .env.example .env
   # paste your connection string into DATABASE_URL, set JWT_SECRET to any random string
   ```
5. **Install and run:**
   ```bash
   npm install
   npm run seed    # fills the Supabase tables with 12 spots + a demo account (safe to run once)
   npm start        # starts the API on http://localhost:3001
   ```

**Demo login:** `demo@saan.app` / `password123` — comes pre-loaded with one plan (Saturday Coffee Crawl) so there's something to see immediately.

To reset everything, delete the rows from the Supabase tables (Table Editor, or `TRUNCATE users, spots, plans, plan_spots, reviews CASCADE;` in the SQL Editor) and run `npm run seed` again.

## How auth works

Login and signup return a JWT. Send it back on every request that touches a specific user's data:

```
Authorization: Bearer <token>
```

Spots are public (no login needed to browse). Plans and posting a review require a valid token — the server reads the user id out of the token, so a plan is always scoped to whoever is logged in.

## API reference

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ email, password, name }` | Creates a user, returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET | `/api/auth/me` | — | Requires token. Confirms who you're logged in as |

### Spots
| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/api/spots` | — | Optional `?category=Café` and `?q=coffee` query params |
| GET | `/api/spots/:id` | — | Returns the spot plus its reviews |
| POST | `/api/spots/:id/reviews` | `{ rating, comment }` | Requires token. Recomputes the spot's `avg_rating` |

### Plans (all require a token; always scoped to the logged-in user)
| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/api/plans` | — | This user's plans, each with its ordered spots |
| POST | `/api/plans` | `{ title }` | Creates an empty draft plan |
| GET | `/api/plans/:id` | — | One plan with its ordered spots |
| PUT | `/api/plans/:id` | `{ title }` | Renames a plan |
| DELETE | `/api/plans/:id` | — | Deletes a plan and its plan_spots rows |
| POST | `/api/plans/:id/spots` | `{ spotId }` | Appends a spot to the end of the itinerary |
| DELETE | `/api/plans/:id/spots/:spotId` | — | Removes a spot from the plan |
| PUT | `/api/plans/:id/reorder` | `{ spotIds: [...] }` | Full ordered list — sets everyone's order_index at once |
| POST | `/api/plans/:id/share` | — | Turns on link sharing, returns `{ shareToken }`. Plan must have at least one spot. Idempotent |
| DELETE | `/api/plans/:id/share` | — | Turns sharing off; the old link 404s immediately |

### Shared plans (public — no token needed)
| Method | Route | Notes |
|---|---|---|
| GET | `/api/shared/:token` | Read-only view: plan title, owner's first name, ordered spots. 404 if the token is unknown or revoked |

Share links look like `http://localhost:5173/p/<token>`. **Upgrading an existing database:** re-run `schema.sql` in the Supabase SQL Editor — it adds the `share_token` column with `ADD COLUMN IF NOT EXISTS`.

A plan's `status` is computed automatically: `draft` with zero spots, `ready` with one or more.

## Project structure

```
saan-backend/
├── server.js         entry point — loads .env, wires up middleware and routes
├── db.js             opens a pg Pool to Supabase using DATABASE_URL
├── schema.sql         run once in Supabase's SQL Editor to create the tables
├── .env.example       copy to .env and fill in your Supabase connection string
├── seed.js            one-time fill of demo data
├── middleware/
│   └── auth.js         verifies the JWT on protected routes
└── routes/
    ├── auth.js
    ├── spots.js
    └── plans.js
```

## Frontend

The React app (`/frontend`) already talks to this API through `src/api/api.js`, storing the JWT from login/signup and sending it as an `Authorization` header on plans/review requests. `API_BASE` there points at `http://localhost:3001/api`, so nothing on the frontend needs to change for the Supabase switch — same routes, same response shapes, just a different database underneath.
