# CLAUDE.md — Dev Community Platform

## What this project is
A full-stack "developer community" app (posts, threaded comments, reactions, ranked feed, developer profiles) built for the 6sense Agentic Software Engineer intern take-home assignment. Spec: `Agentic Engineering Intern Assignement.md`. Product intent: `docs/PRD.md`.

## Tech Stack
- **Database**: PostgreSQL, run locally via Docker Compose (`docker-compose.yml`)
- **Backend**: Node.js + Express + JavaScript (CommonJS), Prisma ORM, layered architecture (routes → controllers → services), flat per-layer folders
- **Frontend**: Vite + React SPA (JavaScript/JSX), React Router, TanStack Query, Tailwind CSS

## Repository Layout
```
6sense_project/
  CLAUDE.md               # this file
  docs/                    # spec-driven development docs (see below)
  docker-compose.yml
  server/                  # Express + JavaScript + Prisma API
  client/                  # Vite + React SPA (JavaScript/JSX)
  README.md                # human-facing setup/run instructions
  AI_USAGE.md              # required AI-usage write-up for the assignment
```

### `server/` layout
```
server/
  prisma/
    schema.prisma
    migrations/
  src/
    app.js                  # express app assembly: middleware, routes, swagger mount
    index.js                # boots the server
    config/
      env.js                 # validates required env vars at boot
    database/
      prisma.js              # single PrismaClient instance, imported everywhere
    controllers/              # one file per resource: parse request, call service, sendSuccess
      auth.controller.js
      users.controller.js
      posts.controller.js
      comments.controller.js
      reactions.controller.js
    services/                 # business logic per resource (ranking, reaction counters, comment threading)
      auth.service.js
      users.service.js
      posts.service.js
      comments.service.js
      reactions.service.js
    routes/                   # one file per resource, path+method+middleware wiring only
      auth.routes.js
      users.routes.js
      posts.routes.js
      comments.routes.js
      reactions.routes.js
      index.js                # mounts every router under /api
    middlewares/
      auth.js                 # requireAuth
      errorHandler.js
      notFoundHandler.js
      asyncHandler.js
    validators/                # zod schemas, one file per resource
    utils/
      ApiError.js
      apiResponse.js
      jwt.js
      password.js
      ranking.js
    docs/
      swagger.js
```

This is a flat, per-layer structure (matches the user's established convention from other Express projects), not a nested `modules/<resource>/` layout — one folder per architectural layer, one file per resource within it. Modules use CommonJS (`require`/`module.exports`), matching that same convention. There is no `models/` folder: Prisma's `schema.prisma` is the single source of truth for data models, and `database/prisma.js` is the DB access point. There is no separate `repository/` layer: services call Prisma directly via `database/prisma.js` — that indirection wasn't earning its keep at this project's size. See `docs/adr/0002-backend-express-javascript.md` for the full rationale.

## How the Docs System Works
This project is built spec-driven. Before writing code for a phase, its spec and plan should exist and be current.

- **`docs/PRD.md`** — the single source of truth for *what the product is* and *why*. Update this first if product scope changes.
- **`docs/adr/000N-*.md`** — Architecture Decision Records. One file per cross-cutting technical decision (framework/library/schema-shape choices), using the template Title/Status/Context/Decision/Consequences. Add a new ADR for a new decision — never rewrite history in an existing one; if a decision is later reversed, add a new ADR that supersedes the old one and mark the old one's Status accordingly.
- **`docs/specs/phase-N-*/spec.md`** — what a phase must deliver: contracts (API shapes, screens) and acceptance criteria. Describes *what*, not *how*.
- **`docs/plans/phase-N-*/plan.md`** — how a phase gets built: ordered technical steps, file paths, verification steps. Describes *how*, not *what*.
- **Mapping**: a spec and its plan share the same phase folder name (e.g. `docs/specs/phase-1-backend/` ↔ `docs/plans/phase-1-backend/`) — that shared name is the only link between them, there is no separate index file.
- Current phases: `phase-0-foundation` (repo/DB/backend skeleton), `phase-1-backend` (full API), `phase-2-frontend` (full SPA), `phase-3-polish-and-docs` (consistency pass + README/AI_USAGE).
- If implementation diverges from a spec during a phase (a route shape changes, a screen gets simplified), update that phase's `spec.md` to match reality before moving on — the docs should never describe a version of the app that doesn't exist.

## Coding Conventions

### API response envelope (every endpoint, no exceptions)
```json
Success: { "success": true, "data": {}, "message": "optional" }
Error:   { "success": false, "statusCode": 400, "message": "Human-readable error", "errors": [] }
```
Use `utils/apiResponse.js#sendSuccess` and throw `utils/ApiError.js#ApiError` — never hand-write a response shape inline in a controller.

### Backend layering
`routes/` wire path+method+middleware only. `controllers/` parse the request and call a service — no business logic, no direct Prisma calls. `services/` hold business logic and call Prisma directly via `database/prisma.js` — services are what would be unit-tested if the Jest bonus is added later. Wrap every async route handler in `asyncHandler` so errors reach the centralized `errorHandler`.

### General
- Plain JavaScript (CommonJS on the backend, JSX on the frontend) — no build/type-check step; keep functions small and validate at the boundary with zod instead of relying on compile-time types.
- No secrets committed, ever. `.env.example` documents variable *names* only; real `.env` files are git-ignored.
- Prefer editing/extending an existing file over introducing a new pattern for the same kind of thing (e.g. every resource has the same routes/controller/service/validator file shape — follow it).
- Don't build ahead of the current phase's spec (no refresh tokens, no Jest tests, no optimistic UI, no pagination beyond page/limit) unless `docs/PRD.md`'s out-of-scope section is explicitly revised first.

## Running Locally
See root `README.md` for the full sequence. Short version: `docker compose up -d` → `cd server && npm install && npx prisma migrate dev && npm run dev` → `cd client && npm install && npm run dev` → Swagger at `http://localhost:<PORT>/api-docs`.

## Git
Everything lands on `main`; make sensible, scoped commits (roughly one per phase step, not one giant commit). No force-push, no rewriting shared history.
