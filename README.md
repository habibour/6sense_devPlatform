# Dev Community Platform

A developer community app — posts, threaded comments, like/dislike reactions, a ranked feed, and developer profiles (skills + experience). Built for the 6sense Agentic Software Engineer intern take-home assignment (see `Agentic Engineering Intern Assignement.md` and `docs/PRD.md` for product intent).

## Tech stack

| Layer | Choice |
|---|---|
| Database | PostgreSQL 16, run locally via Docker Compose |
| Backend | Node.js + Express, plain JavaScript (CommonJS), Prisma ORM, layered `routes → controllers → services` |
| Frontend | Vite + React SPA, JavaScript/JSX, React Router, TanStack Query, Tailwind CSS |

See `docs/adr/` for the reasoning behind each of these choices.

## Architecture overview

```
Browser (React SPA, :5174)
   │  fetch, Bearer JWT
   ▼
Express REST API (:4000/api)
   │  routes → controllers → services
   ▼
PostgreSQL (Docker, :5433)  ←  Prisma schema.prisma (single source of truth for data models)
```

Monorepo layout:

```
6sense_project/
  server/     Express + JavaScript + Prisma API  (server/prisma/schema.prisma, server/src/...)
  client/     Vite + React SPA (JavaScript/JSX)  (client/src/...)
  docs/       spec-driven docs: PRD, ADRs, per-phase specs and plans
  docker-compose.yml
```

Every API endpoint (`server/src/routes`) is thin — it wires path/method/middleware only. `controllers/` parse the request and call a `services/` function; business logic (ranking, reaction counters, comment threading) lives in services, which call Prisma directly via `server/src/database/prisma.js`. Every response uses one consistent envelope (see `docs/PRD.md` section 3, item B9/F7):

```json
Success: { "success": true, "data": {}, "message": "optional" }
Error:   { "success": false, "statusCode": 400, "message": "Human-readable error", "errors": [] }
```

Deeper rationale for each architectural decision is in `docs/adr/000N-*.md`; what each phase had to deliver and how it was built is in `docs/specs/` and `docs/plans/`.

## Local setup

Prerequisites: Docker, Node.js 18+.

```bash
git clone <this-repo-url>
cd 6sense_project

# 1. Database
docker compose up -d

# 2. Backend
cd server
npm install
cp .env.example .env      # fill in JWT_SECRET; other defaults match docker-compose.yml
npx prisma migrate dev
npm run dev                # http://localhost:4000

# 3. Frontend (new terminal)
cd client
npm install
cp .env.example .env      # defaults already point at the backend above
npm run dev                # http://localhost:5174
```

Open `http://localhost:5174` in a browser.

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

## API docs (Swagger)

With the server running, open **`http://localhost:4000/api-docs`** for the full OpenAPI 3.0 spec, grouped by resource (Users, Reactions, Posts, Comments, Auth). Use the **Authorize** button with a JWT from `POST /auth/login` or `POST /auth/register` to try authenticated endpoints directly from the UI.

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
- Deferred out of scope for this pass (see `docs/PRD.md` section 6): Jest/unit tests for backend services, optimistic reaction updates, search/filter, markdown rendering in posts.
