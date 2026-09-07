<p align="center">
  <a href="https://sixsense-devplatform-client.onrender.com/">
    <img src="docs/assets/live-demo-banner.svg" width="600" alt="Live Demo — built and deployed end-to-end. Click to open sixsense-devplatform-client.onrender.com" />
  </a>
</p>

<p align="center">
  <a href="https://sixsense-devplatform-client.onrender.com/">
    <img src="client/src/assets/logo.svg" width="72" alt="DevCommunity logo — click to open the live demo" />
  </a>
</p>

# Dev Community Platform

A developer community app — posts, threaded comments, like/dislike reactions, a ranked feed, and developer profiles (skills + experience). Built for the 6sense Agentic Software Engineer intern take-home assignment (see `Agentic Engineering Intern Assignement.md` and `docs/PRD.md` for product intent).

## Screenshots

**Ranked feed**
![Feed](docs/screenshots/feed.jpg)

**Post detail + threaded comments**
![Post detail](docs/screenshots/post-detail.jpg)

**Developer profile (skills + experience)**
![Profile](docs/screenshots/profile.jpg)

**New post**
![New post](docs/screenshots/new-post.jpg)

## Live Demo

**Live app:** [sixsense-devplatform-client.onrender.com](https://sixsense-devplatform-client.onrender.com/) (also linked at the very top of this README).

The backend runs on Render's free tier and the database on Neon's free tier. The backend spins down after 15 minutes of inactivity, so **the first request may take 30-60 seconds** while it wakes back up — please be patient on first load.

Try it:
- Browse the feed instantly — it's pre-seeded with 6 demo users, 16 posts, comments, and reactions (same data shown in the screenshots below).
- Log in as any seeded demo user (see the [Testing the app](#testing-the-app) table for emails; all of them share the password `Password123!`), or register your own account — either way you can post, comment, and react for real. See [Deployment](#deployment) for how this is hosted and how to reproduce it.

## Tech stack

| Layer | Choice |
|---|---|
| Database | PostgreSQL 16, run locally via Docker Compose |
| Backend | Node.js + Express, plain JavaScript (CommonJS), Prisma ORM, layered `routes → controllers → services` |
| Frontend | Vite + React SPA, JavaScript/JSX, React Router, TanStack Query, Tailwind CSS |
| Testing | Jest unit tests for the backend services layer (see [Tests](#tests)) |

See `docs/adr/` for the reasoning behind each of these choices. Icons are from `lucide-react` (ADR 0009); the logo is a hand-authored SVG mark at `client/src/assets/logo.svg`.

## Architecture overview

### Request lifecycle
Every request flows through the same layers regardless of endpoint — routes only wire path/method/middleware, controllers parse and delegate, services hold all business logic and are the only layer that talks to Prisma:

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#eaf5f5", "primaryBorderColor": "#008080", "primaryTextColor": "#004c4c", "lineColor": "#006666", "secondaryColor": "#b2d8d8", "tertiaryColor": "#ffffff", "fontFamily": "Inter, ui-sans-serif, sans-serif", "clusterBkg": "#f7fbfb", "clusterBorder": "#66b2b2", "edgeLabelBackground": "#ffffff"}}}%%
flowchart TD
    subgraph Client["Browser — React SPA (Vite)"]
        UI["Pages & components"] --> RQ["TanStack Query"] --> AX["Axios client<br/>client/src/api/client.js<br/>sends Authorization: Bearer JWT"]
    end

    AX -->|"HTTPS request"| CORS

    subgraph API["Express API — server/src"]
        CORS["cors middleware<br/>origin = CORS_ORIGIN"] --> RT["routes/*.routes.js<br/>path + method + middleware wiring only"]
        RT --> AUTH{"requireAuth?<br/>middlewares/auth.js"}
        AUTH -->|"yes: verifies JWT"| CTRL
        AUTH -->|"no: public route"| CTRL["controllers/*.controller.js<br/>parse request, call a service"]
        CTRL --> SVC["services/*.service.js<br/>ranking, reaction counters,<br/>comment threading, auth logic"]
        SVC --> PRISMA["database/prisma.js<br/>single PrismaClient instance"]
        CTRL --> RESP["utils/apiResponse.js / ApiError.js<br/>consistent success/error envelope"]
    end

    PRISMA -->|"SQL via Prisma Client"| DB[("PostgreSQL<br/>schema.prisma = source of truth")]
    RESP -->|"JSON response"| AX

    classDef decision fill:#fdf3e7,stroke:#c98a2b,color:#7a4a10,stroke-width:1.5px;
    classDef store fill:#b2d8d8,stroke:#004c4c,color:#003939,stroke-width:1.5px;
    class AUTH decision;
    class DB store;
```

### Production deployment topology
The [Live Demo](#live-demo) runs on Render (frontend + backend) and Neon (database) — see [Deployment](#deployment) for the reproducible steps and `docs/adr/0010-deployment-platform.md` for the reasoning:

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#eaf5f5", "primaryBorderColor": "#008080", "primaryTextColor": "#004c4c", "lineColor": "#006666", "secondaryColor": "#b2d8d8", "tertiaryColor": "#ffffff", "fontFamily": "Inter, ui-sans-serif, sans-serif", "clusterBkg": "#f7fbfb", "clusterBorder": "#66b2b2", "edgeLabelBackground": "#ffffff"}}}%%
flowchart LR
    V(["Visitor's browser"])

    subgraph Render["Render — free tier"]
        FE["Static Site (client/)<br/>vite build → dist/<br/>sixsense-devplatform-client.onrender.com"]
        BE["Web Service (server/)<br/>npm start<br/>sixsense-devplatform.onrender.com"]
    end

    NEON[("Neon<br/>serverless Postgres<br/>scales to zero, auto-wakes")]

    V -->|"GET /"| FE
    FE -->|"fetch VITE_API_BASE_URL/api/*<br/>Authorization: Bearer JWT"| BE
    BE -->|"DATABASE_URL (sslmode=require)"| NEON

    classDef entry fill:#ffffff,stroke:#66b2b2,stroke-width:1.5px,color:#004c4c;
    classDef store fill:#b2d8d8,stroke:#004c4c,color:#003939,stroke-width:1.5px;
    class V entry;
    class NEON store;
```

Two things that don't show up as boxes but matter: the frontend's SPA client-side routes (e.g. `/login`, `/posts/:id`) are served via a Render dashboard Redirect/Rewrite rule (`/*` → `/index.html`), not a repo file — Render doesn't support Netlify's `_redirects` convention; and the backend's free instance spins down after 15 minutes idle, so the first request after a quiet period takes ~30-60s to wake.

Locally the same request lifecycle runs against `docker-compose.yml`'s Postgres container instead of Neon (see [Local setup](#local-setup) below).

Monorepo layout:

```
6sense_devPlatform/
  server/             Express + JavaScript + Prisma API  (server/prisma/schema.prisma, server/prisma/seed.js, server/src/...)
  client/             Vite + React SPA (JavaScript/JSX)  (client/src/...)
  docs/               spec-driven docs: PRD, ADRs, per-phase specs and plans
    screenshots/      app screenshots used in this README (feed, post detail, profile, new post)
  docker-compose.yml
```

Every API endpoint (`server/src/routes`) is thin — it wires path/method/middleware only. `controllers/` parse the request and call a `services/` function; business logic (ranking, reaction counters, comment threading) lives in services, which call Prisma directly via `server/src/database/prisma.js`. Every response uses one consistent envelope (see `docs/PRD.md` section 3, item B9/F7):

```json
Success: { "success": true, "data": {}, "message": "optional" }
Error:   { "success": false, "statusCode": 400, "message": "Human-readable error", "errors": [] }
```

Deeper rationale for each architectural decision is in `docs/adr/000N-*.md`; what each phase had to deliver and how it was built is in `docs/specs/` and `docs/plans/`.

## Local setup

### Prerequisites

- **Docker Desktop** (or any Docker Engine + Compose v2) — running before step 1. Check with `docker --version` and `docker compose version`. **No Docker?** Skip step 2 and use [an alternative Postgres](#no-docker-alternative-ways-to-run-postgres) instead — Docker is only used to run Postgres, nothing else in this project needs it.
- **Node.js 18+** and **npm** — check with `node -v` and `npm -v`.
- **git**.
- Ports **5433** (Postgres), **4000** (API), and **5174** (Vite dev server) free on your machine. If one is taken, see [Troubleshooting](#troubleshooting) below.

### Step 1 — clone the repo

```bash
git clone <this-repo-url>
cd 6sense_devPlatform
```

### Step 2 — start Postgres

```bash
docker compose up -d
```

This starts a single `postgres:16-alpine` container (`dev_community_db`) on host port **5433**, with a named volume (`pgdata`) so data survives container restarts. Verify it's up with `docker compose ps` — `STATUS` should say `Up`. No `.env` file is needed for this step; `docker-compose.yml` has working defaults (`devcommunity`/`devcommunity`/`devcommunity`) that already match `server/.env.example`.

#### No Docker? Alternative ways to run Postgres

The app only needs *a* reachable Postgres 14+ database — it doesn't care whether it came from Docker. Skip `docker compose up -d` and pick one:

**Option A — free cloud Postgres (fastest, no install at all).** Sign up for a free instance on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app), create a database, and copy the connection string it gives you. Most of these require `?sslmode=require` on the URL.

**Option B — install Postgres locally.**
- macOS: `brew install postgresql@16 && brew services start postgresql@16`
- Ubuntu/Debian: `sudo apt install postgresql && sudo systemctl start postgresql`
- Windows: the installer from [postgresql.org/download](https://www.postgresql.org/download/windows/)

Then create a role and database matching the app's defaults (or use your own and adjust `DATABASE_URL` accordingly):

```bash
createuser -s devcommunity          # -s = superuser, simplest for local dev
createdb -O devcommunity devcommunity
psql -c "ALTER USER devcommunity WITH PASSWORD 'devcommunity';"
```

**Either way**, once you have a connection string, set it directly in `server/.env` after copying `.env.example` in step 3 below — e.g.:

```
DATABASE_URL=postgresql://devcommunity:devcommunity@localhost:5432/devcommunity   # local install, default port
# or the connection string your cloud provider gave you
```

Everything from step 3 onward (`npx prisma migrate dev`, seeding, `npm run dev`) works identically regardless of where Postgres is actually running.

**Security note:** a cloud connection string carries your database's real credentials. `server/.env` is already git-ignored (see `.gitignore`) so it won't be committed by normal use — but never paste a real connection string into a commit, issue, chat log, or anywhere else public, and rotate the database password immediately if one is ever exposed.

### Step 3 — backend (Express API)

```bash
cd server
npm install
cp .env.example .env       # then open .env and fill in JWT_SECRET (see below); other defaults already match docker-compose.yml
npx prisma migrate dev     # creates the schema in Postgres; prompts for a migration name only if you've changed schema.prisma
npm run prisma:seed        # optional but recommended: populates demo users/posts — see "Testing the app" below
npm run dev                # starts on http://localhost:4000, auto-restarts on file changes (node --watch)
```

`JWT_SECRET` has no default and the server refuses to boot without it (see `src/config/env.js`) — set it to any long random string, e.g. generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. You should see `Server listening on http://localhost:4000` in the terminal once it's up; leave this terminal running.

> 🌱 **Run the seed script.** A fresh clone starts with an empty database. Run `npm run prisma:seed` (shown above) before opening the app, or the feed will be empty. It populates 6 demo users and 16 long-form posts with comments and reactions, so the app looks like a real, active platform from the first page load — see [Testing the app](#testing-the-app) for login credentials and a full walkthrough.

If you're just running the app rather than changing `schema.prisma`, `npx prisma migrate deploy` applies the existing migrations non-interactively (no migration-name prompt) — use that instead of `migrate dev` if you want a fully scripted setup.

### Step 4 — frontend (React SPA)

Open a **second terminal** (keep the backend running in the first):

```bash
cd client
npm install
cp .env.example .env       # default VITE_API_BASE_URL already points at http://localhost:4000/api
npm run dev                # starts on http://localhost:5174 (Vite picks the next free port if taken)
```

### Step 5 — open the app

Go to **http://localhost:5174** in a browser. You should see the `devcommunity` navbar and a "TOP POSTS" feed (empty if you skipped seeding — see [Testing the app](#testing-the-app)).

### Windows (PowerShell) notes

All the commands above work as-is in PowerShell (`cp`, `npm`, `npx` are all available), with a few native alternatives:

- **Writing `.env` in one shot** instead of `cp .env.example .env` + hand-editing — useful when you already have a full connection string (e.g. from Neon/Supabase):
  ```powershell
  @"
  PORT=4000
  DATABASE_URL=<your connection string>
  JWT_SECRET=<a long random string>
  JWT_EXPIRES_IN=1d
  CORS_ORIGIN=http://localhost:5174
  "@ | Set-Content server\.env
  "VITE_API_BASE_URL=http://localhost:4000/api" | Set-Content client\.env
  ```
- **`curl` equivalent** for the sanity-check in [Troubleshooting](#troubleshooting): `Invoke-WebRequest http://localhost:4000/api/posts -UseBasicParsing`.
- If Vite doesn't bind where you expect, force it explicitly: `npm run dev -- --host localhost`.

### Available scripts

| Location | Script | What it does |
|---|---|---|
| `server/` | `npm run dev` | Start the API with auto-restart on file changes |
| `server/` | `npm start` | Start the API once, no watch (production-style) |
| `server/` | `npm run prisma:generate` | Regenerate the Prisma client after editing `schema.prisma` |
| `server/` | `npm run prisma:migrate` | Create/apply a migration from `schema.prisma` changes |
| `server/` | `npm run prisma:seed` | Wipe and repopulate the DB with demo data (also runs via `npx prisma db seed` / `prisma migrate reset`) |
| `server/` | `npm run lint` | ESLint over the backend |
| `server/` | `npm test` | Jest unit tests for the services layer (see [Tests](#tests)) |
| `client/` | `npm run dev` | Start the Vite dev server |
| `client/` | `npm run build` | Production build to `client/dist` |
| `client/` | `npm run preview` | Serve the production build locally |
| `client/` | `npm run lint` | oxlint over the frontend |

### Stopping and resetting

```bash
# Stop the dev servers: Ctrl+C in each terminal.

# Stop Postgres but keep its data:
docker compose stop

# Stop and remove the container (data volume persists):
docker compose down

# Also wipe all Postgres data (start completely fresh):
docker compose down -v

# Reset just the schema/data without touching Docker (re-applies migrations, then re-seeds):
cd server && npx prisma migrate reset
```

### Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Backend logs `Missing required environment variable(s): ...` and exits | `server/.env` wasn't created from `.env.example`, or `JWT_SECRET` is still blank. |
| `npx prisma migrate dev` fails to connect | Postgres isn't up yet — run `docker compose ps` and `docker compose up -d`; confirm `DATABASE_URL` in `server/.env` still points at port `5433`. |
| Frontend loads but the feed spins forever / requests fail in the browser console | Backend isn't running, or `CORS_ORIGIN` in `server/.env` doesn't match the port Vite actually started on (check the frontend terminal's `Local:` URL). |
| `Error: listen EADDRINUSE` on `4000` or `5174` | Something else is already using that port — stop it, or for the frontend just let Vite pick the next free port and update `CORS_ORIGIN` / `VITE_API_BASE_URL` to match. |
| `docker compose up -d` fails with a port conflict on `5433` | Another Postgres instance is already bound to `5433` — stop it, or change the host port mapping in `docker-compose.yml` and `DATABASE_URL` together. |

## Environment variables

`server/.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `DATABASE_URL` | Postgres connection string (matches `docker-compose.yml`, host port 5433) |
| `JWT_SECRET` | Secret used to sign JWT access tokens — use a long random string |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `1d`, `12h`) |
| `CORS_ORIGIN` | Allowed origin for CORS — the frontend dev server URL |

`client/.env.example`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:4000/api`) |

## Deployment

The [Live Demo](#live-demo) above is deployed for free on Render (backend Web Service + frontend Static Site) and Neon (Postgres). See `docs/adr/0010-deployment-platform.md` for the reasoning behind this choice, including the accepted cold-start tradeoff and why the seed script is never run automatically. To reproduce:

1. **Database** — create a free [Neon](https://neon.tech) Postgres project; copy its connection string (includes `?sslmode=require`).
2. **Backend** — Render Web Service, root directory `server`:
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
   - Env vars: `DATABASE_URL` (the Neon string), `JWT_SECRET` (a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`), `JWT_EXPIRES_IN=1d`, `CORS_ORIGIN` (set to the frontend's URL once known — see step 4; a placeholder works until then). Don't set `PORT` manually — Render injects it.
3. **Seed the database once, manually, from your machine** (not via Render, which has no Shell access on the free tier):
   ```bash
   cd server
   DATABASE_URL="<neon-connection-string>" npx prisma migrate deploy
   DATABASE_URL="<neon-connection-string>" node prisma/seed.js
   ```
   This is destructive on the target database (wipes and recreates the demo data) — run it exactly once against a fresh Neon database. After that, real visitor registrations/posts/comments accumulate on top of it; the seed script is never run again or wired into any deploy step.
4. **Frontend** — Render Static Site, root directory `client`:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Env var: `VITE_API_BASE_URL=https://<backend-service-name>.onrender.com/api` — set this **before** the first build, since it's baked into the bundle at build time (see `client/src/api/client.js`).
   - SPA routing: Render static sites don't honor a Netlify-style `_redirects` file — add a Redirect/Rewrite rule instead (Static Site → Settings → Redirects/Rewrites → Source `/*`, Destination `/index.html`, Action **Rewrite**), so React Router's client-side routes don't 404 on a direct load or refresh.
5. **Close the CORS loop** — once the frontend's Render URL is known, update the backend's `CORS_ORIGIN` env var to that exact URL (no trailing slash) and let Render redeploy the backend.

Optional: point a free uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org)) at `https://<backend-service-name>.onrender.com/health` every ~10 minutes to reduce how often visitors hit the cold-start delay. Not required — the app works fine without it, just with an occasional 30-60s first load.

## API docs (Swagger)

With the server running, open **`http://localhost:4000/api-docs`** for the full OpenAPI 3.0 spec, grouped by resource (Users, Reactions, Posts, Comments, Auth). Use the **Authorize** button with a JWT from `POST /auth/login` or `POST /auth/register` to try authenticated endpoints directly from the UI.

## Tests

```bash
cd server
npm test
```

35 Jest tests across 6 suites cover the `services/` layer's business logic — ranking (score computation, tie-breaks, pagination), the reaction create/no-op/switch/remove state machine and its counter updates, comment creation/threading validation, register/login (real password hashing + JWT round-trip), and profile skill dedup + experience ownership checks. Only the Prisma client is mocked (via `server/tests/mockPrisma.js`); no real database or `.env` file is needed — `npm test` works right after `npm install` on a clean checkout. Routes/controllers are thin wiring with no logic of their own (see `CLAUDE.md`'s backend layering), so they're covered by manual/Swagger testing instead. See `docs/adr/0008-jest-service-unit-tests.md` for the full rationale.

## Testing the app

> **New here?** Run `npm run prisma:seed` first (see Step 3 above) — everything below assumes a seeded database.

`npm run prisma:seed` (run once, from `server/`, after migrating) wipes and repopulates the database with 6 demo users, 16 posts, comments, and reactions — the same kind of data shown in the screenshots above. It's safe to re-run any time; it deletes existing rows first, so only use it against your local dev database.

| Name | Email | Password |
|---|---|---|
| Maria Alvarez | `maria.alvarez@example.com` | `Password123!` |
| Jordan Lee | `jordan.lee@example.com` | `Password123!` |
| Priya Nair | `priya.nair@example.com` | `Password123!` |
| Sam Okafor | `sam.okafor@example.com` | `Password123!` |
| Alex Kim | `alex.kim@example.com` | `Password123!` |
| Chen Wu | `chen.wu@example.com` | `Password123!` |

Log in as any of them, or skip the seed and click **Register** to create your own account — either way you land in the same place:

- **The feed is global, not per-user.** Every logged-in (or logged-out) visitor sees the same ranked list of *all* posts from *all* authors — there's no "your posts" view. Logging in doesn't change what's visible, only what you can do: react, comment, create a post, and edit your own profile. Logged-out visitors can browse the feed and post detail read-only ("Log in to react").
- Reactions are one-per-user-per-target (post or comment), enforced by the backend. The like/dislike button reflects your own prior reaction (fetched via `GET /reactions/me/:targetType/:targetId`) and survives page reloads/navigation. Everyone sees the same aggregate `likeCount`/`dislikeCount`/`commentCount` regardless of who's logged in.
- A freshly registered account starts with an empty profile (no skills, no experience, no posts) — those are edited from the profile page.

If you skip `prisma:seed` entirely, the database starts empty and the feed has nothing in it until someone creates a post.

### Step-by-step feature walkthrough

With both servers running and the DB seeded:

1. **Browse the feed (logged out).** Open `http://localhost:5174` — you'll see the ranked "TOP POSTS" list with like/dislike/comment counts. Reaction buttons are disabled and read "Log in to react".
2. **Log in.** Click **Login** (top right), enter one of the demo emails/`Password123!` from the table above. The navbar swaps to **New post / \<Your name\> / Logout**.
3. **Open a post.** Click any post title to see its full body, reaction counts, and threaded comments.
4. **React.** Click the heart (like) or thumbs-down (dislike) button on the post (or on any comment) — the count updates immediately; clicking your own active reaction again removes it, clicking the other one switches it (one reaction per user per target). Reload the page — the highlight survives, since it's fetched from the server.
5. **Comment.** Type in "Add a comment" and click **Post comment** — it appears at the bottom of the thread. Click **Reply** under an existing comment to add a threaded reply.
6. **Create a post.** Click **New post** in the navbar, fill in Title/Body, submit — you're taken to the new post, and it appears in the feed ranked by the formula below.
7. **Edit your profile.** Click your name in the navbar to open your profile: add/remove skills via the "Add a skill" input, and add a work experience entry (title, company, dates, description) via **+ Add experience**; existing entries have **Edit**/**Delete**.
8. **View someone else's profile.** Click any other author's name (e.g. from a post) to see their profile read-only — skill/experience editing controls only appear on your own profile.
9. **Log out.** Click **Logout** — you're returned to the logged-out feed view; everything you created remains visible to everyone.

You can also drive the same flows directly against the API via Swagger (see below) instead of the UI.

## Ranking formula

Posts in the feed are ordered by:

```
score = (likeCount - dislikeCount) + commentCount * 2
```

Ties break by newest (`createdAt` descending). Comments are weighted 2x a single reaction, so posts that spark discussion surface even without heavy like counts, while a strongly-liked, low-comment post can still rank well.

`likeCount`, `dislikeCount`, and `commentCount` are denormalized integer columns on `Post`, updated transactionally alongside the write that changes them (a new comment, a new/changed reaction). `score` is computed and sorted in the service layer at read time rather than stored and recomputed on every write — this avoids a second write path that could drift out of sync with the underlying counters. See `docs/adr/0005-ranking-computed-at-read-time.md` for the full rationale.

## AI usage

This project was built with Claude Code, following a spec-driven workflow (PRD → ADRs → per-phase spec → per-phase plan → implementation) — see `AI_USAGE.md` for the full write-up, including representative prompts, what was reviewed/rejected/rewritten, and a specific bug caught during the build.

## Assumptions and known limitations

- **Reaction target integrity is enforced in the service layer, not by a database foreign key.** `Reaction.targetId` can point to either a `Post` or a `Comment` (a polymorphic target), which Prisma/relational schemas can't express as a single FK. The one-reaction-per-user-per-target rule *is* enforced at the database level (`@@unique([userId, targetType, targetId])`); target existence is checked in `reactions.service.js` before insert. See `docs/adr/0004-reaction-polymorphic-target.md`.
- **Ranking is sorted in application code, not via a SQL `ORDER BY` expression or materialized view.** Adequate at this dataset size; would need revisiting if post volume grew large. See `docs/adr/0005-ranking-computed-at-read-time.md`.
- **Auth is access-token-only — no refresh token flow.** A single JWT is issued on register/login with a relatively long expiry (`1d` by default) so a reviewer's session doesn't expire mid-review. No silent refresh, no token rotation. See `docs/adr/0007-auth-jwt-no-refresh-this-pass.md`.
- **Pagination is simple `page`/`limit` query params**, not cursor-based or infinite-scroll.
- Deferred out of scope for this pass (see `docs/PRD.md` section 6): optimistic reaction updates, search/filter, markdown rendering in posts.
