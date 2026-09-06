# Phase 0 Spec: Foundation

Maps to `docs/plans/phase-0-foundation/plan.md`.

## Goal
Stand up the repo, local database, backend skeleton, and shared conventions that every later phase depends on. No feature routes yet beyond a health check.

## Deliverables & Acceptance Criteria

### 1. Repository scaffolding
- Git repository initialized at the `6sense_project` root (independent of any enclosing repo).
- `.gitignore` excludes `node_modules/`, `dist/`, `.env`, `.env.local`, and editor/OS cruft.
- Root `README.md` exists as a stub (filled out fully in Phase 3) so `main` is never without one.

### 2. Local database
- `docker-compose.yml` at the repo root defines a single `postgres:16-alpine` service with a named volume for data persistence and env-driven credentials (defaults provided so `docker compose up -d` works with zero config).
- **Acceptance**: `docker compose up -d` starts a healthy Postgres container reachable at `localhost:5433` with the credentials in `server/.env.example`.

### 3. Database schema
- `server/prisma/schema.prisma` defines all models needed for the entire app (User, Skill, Experience, Post, Comment, Reaction, plus `TargetType`/`ReactionType` enums) — see the schema block in the approved plan / this phase's plan.md.
- **Acceptance**: `npx prisma migrate dev --name init` succeeds against the Dockerized Postgres and generates a working Prisma Client.

### 4. Backend skeleton
- `server/` is a JavaScript (Node.js/CommonJS) + Express project that boots with `npm run dev`.
- `GET /health` returns `{ success: true, data: { status: "ok" }, message: "..." }` (the shared success envelope).
- A deliberately-thrown error anywhere in the app returns `{ success: false, statusCode, message, errors? }` (the shared error envelope) via a single centralized `errorHandler` middleware — not ad-hoc per-route error handling.
- **Acceptance**: hitting `/health` and a route that throws both return correctly shaped JSON with correct HTTP status codes.

### 5. Shared conventions available for reuse in later phases
- `utils/ApiError.js` (a small error class carrying `statusCode`/`message`/`errors`)
- `utils/apiResponse.js` (`sendSuccess` helper)
- `middlewares/asyncHandler.js` (wraps async route handlers so thrown/rejected errors reach `errorHandler`)
- `middlewares/notFoundHandler.js` (404 fallback in the same envelope shape)
- `database/prisma.js` (single `PrismaClient` instance, imported everywhere — no ad-hoc `new PrismaClient()` per module)
- `config/env.js` (validates required env vars at boot; process exits with a clear message if any are missing)

## Out of Scope for This Phase
No auth, no resource routes (posts/comments/reactions/users), no frontend. Those are Phase 1 and Phase 2.

## Environment Variables Introduced
`server/.env.example`: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (the last three are declared now since `config/env.js` validates all required vars at once, even though JWT isn't used until Phase 1).
