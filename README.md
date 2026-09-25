# Saan Backend

A small Express API backed by SQLite, matching the schema from the project proposal: `spots`, `plans`, `plan_spots`, `reviews` — plus a `users` table for login.

## Setup

```bash
npm install
npm run seed    # creates saan.db and fills it with 12 spots + a demo account
npm start        # starts the API on http://localhost:3001
```

**Demo login:** `demo@saan.app` / `password123` — comes pre-loaded with one plan (Saturday Coffee Crawl) so there's something to see immediately.

To reset everything, delete `saan.db` (and the `saan.db-wal` / `saan.db-shm` files next to it, if present) and run `npm run seed` again.

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

A plan's `status` is computed automatically: `draft` with zero spots, `ready` with one or more.

## Project structure

```
saan-backend/
├── server.js         entry point — wires up middleware and routes
├── db.js             opens saan.db, creates tables if missing
├── seed.js           one-time fill of demo data
├── middleware/
│   └── auth.js       verifies the JWT on protected routes
└── routes/
    ├── auth.js
    ├── spots.js
    └── plans.js
```

## Connecting the frontend

The React app currently holds its data in `useState`. To point it at this API instead:

1. Start this server (`npm start`, default port `3001`).
2. In the frontend, replace the seed-data arrays with `fetch` calls to `http://localhost:3001/api/...`, storing the returned JWT (e.g. in a `token` state variable) and attaching it as an `Authorization` header on every plans/review request.
3. CORS is already enabled on the server, so a frontend running on a different port (e.g. Vite's default `5173`) can call it directly.

Happy to wire that fetch layer into the existing `saan-app.jsx` if you want it done for you rather than as an exercise.
