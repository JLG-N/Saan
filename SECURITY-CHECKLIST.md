# Security checklist

Evidence is based on the tracked project files and local Git history available during this review. Hosting, database, and GitHub settings cannot be confirmed from the repository alone.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` ignores backend and frontend environment files; only `.env.example` templates are allow-listed, and no real `.env` is tracked. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | `backend/.env.example` contains placeholder server settings, and `frontend/.env.example` contains an empty optional API origin; neither contains credentials. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Current application source reads the database URL and JWT signing key from the environment; no demo login or real credential is included in the current seed or login screen. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | No | I searched commit diffs for those terms; history includes the demo credential and credential-related setup text, so it is not clean. |
| 5 | Any credential that was ever committed has been rotated | No | Current local JWT configuration was rotated, but rotation of any historical or hosted database credentials cannot be verified here. |
| 6 | Production credentials live only in my hosting provider's environment settings | No | The source reads `DATABASE_URL` and `JWT_SECRET` from environment variables, but production hosting settings are not accessible for verification. |

## GitHub Actions

There are no tracked GitHub Actions workflow files in this repository.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | N/A | No tracked workflow YAML files exist. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | No tracked workflow YAML files exist. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | N/A | No tracked workflows or workflow run logs are available to check. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | N/A | No tracked workflows or artifact uploads exist. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | N/A | No tracked workflow YAML files exist. |
| 12 | Secret scanning and push protection are enabled on the repository | No | Repository security settings could not be inspected from this environment. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Route queries bind user values with PostgreSQL placeholders; `backend/routes/spots.js` builds only placeholder positions dynamically. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | The connection uses TLS, but certificate verification is currently disabled in `backend/db.js` because the configured Supabase endpoint presents a self-signed certificate chain; verify the Supabase CA and enable certificate validation before production. Network allowlists also need dashboard verification. |
| 15 | The database user the app connects as has only the permissions it needs | No | The connection uses `DATABASE_URL` in `backend/db.js`; the configured database role and grants are not available for review. |
| 16 | Seed and sample data is invented, not real people's data | No | `backend/seed.js` contains venue names, addresses, descriptions, ratings, and remote image URLs; their source/licensing and whether all details are invented are not documented. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | `backend/server.js` mounts only auth, spots, plans, shared-plan, and health routes; the seed operation is a separate CLI script, not an HTTP route. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `backend/routes/auth.js` implements signup/login and issues JWTs; `backend/middleware/auth.js` verifies them. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | No | `backend/schema.sql` does not enable RLS; the API enforces user scoping, but database-level RLS has not been configured or tested. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | The project uses application login, not a Zero Trust gate or shared app password. |
| 21 | The gate covers every route, including the ones that only change data | Yes | Plan routes are guarded by `router.use(requireAuth)` in `backend/routes/plans.js`; review creation and deletion use `requireAuth` in `backend/routes/spots.js`, and deletion is constrained to the authenticated user's review. Public spot browsing and shared-plan viewing are read-only. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | `JWT_SECRET` is required from the environment in `backend/config.js`; the current seed and login UI do not create or prefill a demo account. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | Auth and route fields are validated server-side; JSON request bodies are limited to 10 KB and review comments to 500 characters. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | User text is rendered through React JSX in the screens/components; no `dangerouslySetInnerHTML` usage was found. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | `backend/server.js` returns a generic error message to clients; detailed errors are logged server-side. |
| 26 | CORS is not a wildcard on routes that change data | Yes | `backend/server.js` only enables CORS for the exact `CORS_ORIGIN`; production startup requires that origin to be configured. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | Recent Git commit author metadata includes an email address that appears personal; confirm whether it is intended for public history. |
| 28 | No classmate's personal data in the repository | Yes | No classmate personal information was identified in tracked source or seed data; the local database itself is not part of this repository. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Both lockfiles pin packages from `registry.npmjs.org`; `.gitignore` excludes `node_modules/` and generated `dist/`; `npm audit` reports zero vulnerabilities for both apps. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | No | Seed data references remote Unsplash images; the repository does not document asset ownership, license, or attribution. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | No | GitHub CLI/repository settings were not available for verification, so visibility and its review after the latest push are unknown. |

## Anything I found and fixed

The API now restricts browser CORS to a configured origin, uses TLS for PostgreSQL connections, limits JSON request size, and enforces the review-comment length on the server. PostgreSQL certificate verification is currently disabled to accommodate the self-signed certificate chain presented by the configured Supabase endpoint; configure and verify the correct Supabase CA before production. Environment templates are placeholders only; local environment files and generated dependency/build directories are ignored. Startup requires a random JWT secret of at least 32 bytes. The local JWT secret was rotated, which invalidates tokens previously issued by this local configuration. Vite was updated to patched version 6.4.4; production dependency audits for both apps report zero vulnerabilities.
