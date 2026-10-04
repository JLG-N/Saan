# AI usage

This project was built with AI assistance. This file is the record of it. It is graded as the finals badge, and it is worth 100 points.

Start it in week 1 and keep it up as you go. The commit history of this file is part of the evidence: a file written all at once the night before the deadline looks exactly like what it is.

## 1. How I used AI

### 2026-09-30 - Database schema and share-token setup

- **Tool:** GitHub Copilot
- **What I asked for:** "Create the Postgres schema for plans and a share_token column with the right constraints for public share links."
- **What it gave back:** A draft `schema.sql` change and a plan for adding the `share_token` column to the `plans` table.
- **What I kept, what I changed, and why:** I kept the schema concept and the share-token approach, but I tightened the final column naming and checked that it fit the rest of the app's data model. I also made the final database decisions myself, because the schema directly affects how plans, user ownership, and public sharing behave.
- **Commit:** https://github.com/JLG-N/Saan/commit/7aaf142

### 2026-09-30 - Public share route scaffold

- **Tool:** GitHub Copilot
- **What I asked for:** "Write an Express route for a public share endpoint so a shared plan can be read without a login."
- **What it gave back:** A `GET /api/shared/:token` route and a basic lookup function for a plan by token.
- **What I kept, what I changed, and why:** I kept the route structure and the idea of a public share URL, but I tightened the output so it only returned safe public data and failed cleanly if the token was invalid or revoked. This kept the share feature from exposing unnecessary user data.
- **Commit:** https://github.com/JLG-N/Saan/commit/3fc5b28

### 2026-09-30 - Share-link logic for plan creation and revocation

- **Tool:** GitHub Copilot
- **What I asked for:** "Add share/revoke functionality to the plan API so a user can enable or disable a public plan link."
- **What it gave back:** Route handlers for `POST /api/plans/:id/share` and `DELETE /api/plans/:id/share` plus helper logic.
- **What I kept, what I changed, and why:** I kept the API shape, but I tightened the permission checks and made sure the old token is invalidated immediately when sharing is turned off. That mattered because the shared link is effectively a public URL and should not stay active when the owner removes it.
- **Commit:** https://github.com/JLG-N/Saan/commit/42e4107

### 2026-09-30 - Plan CRUD route generation

- **Tool:** GitHub Copilot
- **What I asked for:** "Generate the planning routes for create, list, reorder, and delete, using JWT auth and user-scoped data."
- **What it gave back:** A first pass of `backend/routes/plans.js` with CRUD handlers and database queries.
- **What I kept, what I changed, and why:** I kept the general route structure, but I rewrote the query conditions so they were scoped to the logged-in user rather than any plan id in the table. That was important for preventing cross-user access.
- **Commit:** https://github.com/JLG-N/Saan/commit/01209c0

### 2026-09-30 - API docs and contract cleanup

- **Tool:** GitHub Copilot
- **What I asked for:** "Update the README with the share-related routes and the request/response structure."
- **What it gave back:** A draft API reference for the public and private routes.
- **What I kept, what I changed, and why:** I kept the general structure but corrected the auth and visibility rules so the documentation matched the final behavior. The docs needed to be explicit about which routes were public and which required a JWT.
- **Commit:** https://github.com/JLG-N/Saan/commit/5b531d5

### 2026-10-04 - Final auth and flow pass

- **Tool:** GitHub Copilot
- **What I asked for:** "Review the app flow for auth, plan creation, plan detail, and public share behavior and suggest fixes for edge cases."
- **What it gave back:** A final pass over the backend route flow, state logic, and suggested fixes for validation and edge cases.
- **What I kept, what I changed, and why:** I kept the ideas around consistent auth and cleaner flow, but I still made the final edits by hand. This was the point where I used AI as a second opinion rather than the source of truth.
- **Commit:** https://github.com/JLG-N/Saan/commit/710fea3

## 2. Where the AI got it wrong

### Case 1 - Too much data returned from the public share route

- **What it gave me:** A first draft that returned the entire plan object and nested row data for a shared plan.
- **What was wrong with it:** It exposed more than the public share feature needed and included internal metadata that should not be visible outside the plan owner.
- **What I did instead:** I restricted the public route to a minimal view: plan title, owner's first name, and the ordered spots, and I enforced 404s for invalid or revoked tokens.
- **Commit:** https://github.com/JLG-N/Saan/commit/3fc5b28

### Case 2 - Missing user-scoping in plan updates

- **What it gave me:** A route pattern that looked up a plan by `id` and updated it without enough guardrails against cross-user access.
- **What was wrong with it:** That was a real security issue; a user should only be able to edit their own plans.
- **What I did instead:** I kept the route structure but added explicit user checks against the current JWT user id and narrowed the SQL so each update was limited to the correct owner.
- **Commit:** https://github.com/JLG-N/Saan/commit/01209c0

### Case 3 - Share token was treated as valid without checking share state

- **What it gave me:** An early idea that treated the token as valid as soon as it existed, without confirming whether the plan was still share-enabled.
- **What was wrong with it:** A stale or revoked link could still be used if the share status was not checked explicitly.
- **What I did instead:** I kept the share flow pattern but added a real permission check in the database and route logic so a token only works while the plan is intentionally shared.
- **Commit:** https://github.com/JLG-N/Saan/commit/42e4107

## 3. Who wrote what

### Written by me

- **File:** `backend/schema.sql`
- **Commit:** https://github.com/JLG-N/Saan/commit/7aaf142
- **What it does and why it is built this way:** This file defines the database structure for `users`, `spots`, `plans`, `plan_spots`, `reviews`, and the `share_token` field. I set this up myself because the app depends on a consistent data model for ownership, ordering, and public sharing. Without the schema being correct, the API and frontend would not agree on what data exists.

- **File:** `frontend/src/App.jsx`
- **Commit:** https://github.com/JLG-N/Saan/commit/710fea3
- **What it does and why it is built this way:** This is the app shell: it handles the main screen flow, auth state, route switching, plan actions, and public-share view logic. I built this in the frontend because the user journey and screen transitions are part of the product experience, not the backend.

- **File:** `frontend/src/screens/PlanDetailScreen.jsx`
- **Commit:** https://github.com/JLG-N/Saan/commit/a261774
- **What it does and why it is built this way:** This screen shows the active itinerary, lets the user manage spots, and handles ordering and sharing actions from the front-end perspective. I built it this way because the user experience for planning and editing is a UI concern, not a database one.

### The AI-written part I understand best

- **File:** `backend/routes/plans.js`
- **Commit:** https://github.com/JLG-N/Saan/commit/01209c0
- **What it does and why we kept it:** This file handles creating plans, listing plans, deleting plans, reordering spots, and toggling sharing. It validates the JWT, scopes each database action to the logged-in user, and manages public-share state. We kept it because this is exactly the kind of server-side responsibility that belongs in the backend, and the AI gave a strong first pass that I checked and tightened before leaving it in place.
