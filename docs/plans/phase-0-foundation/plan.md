# Phase 0 Plan: Foundation

Implements `docs/specs/phase-0-foundation/spec.md`.

## Steps

1. **Repo init**: `git init` at repo root; create `.gitignore` (`node_modules/`, `dist/`, `.env`, `.env.local`, `.DS_Store`); create a root `README.md` stub (title + "under construction," fully written in Phase 3).
2. **Docker Compose**: create root `docker-compose.yml` with a single `postgres:16-alpine` service, named volume `pgdata`, env-driven `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` with defaults, port `5433:5432`.
3. **Backend scaffold**: `npm init` inside `server/`; install `express`, `typescript`, `ts-node-dev` (or `tsx`), `@types/node`, `@types/express`; `tsconfig.json` (strict mode on); `src/index.ts` + `src/app.ts` with a single `GET /health` route returning a hardcoded success shape. Verify `npm run dev` boots and `curl localhost:<PORT>/health` responds.
4. **Prisma init**: install `prisma`, `@prisma/client`; `npx prisma init`; author `server/prisma/schema.prisma` with the full model set (User, Skill, Experience, Post, Comment, Reaction, `TargetType`, `ReactionType` enums — see PRD/ADRs for field rationale). Set `DATABASE_URL` in `server/.env` (from `.env.example`) to point at the Compose Postgres.
5. **Run the DB + migrate**: `docker compose up -d`; `npx prisma migrate dev --name init`; confirm `prisma studio` or a quick script can see the empty tables.
6. **Prisma client singleton**: `server/src/database/prisma.ts` exporting one `new PrismaClient()` instance, imported everywhere else (never instantiate a second client).
7. **Env validation**: `server/src/config/env.ts` reads and validates `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` from `process.env`, throwing/exiting with a clear message if any required var is missing. Wire it to run at the top of `src/index.ts`.
8. **Shared error/response infra**:
   - `utils/ApiError.ts` — class `ApiError extends Error { statusCode: number; errors?: unknown[] }`.
   - `utils/apiResponse.ts` — `sendSuccess(res, data, message?, statusCode = 200)`.
   - `middlewares/asyncHandler.ts` — wraps `(req,res,next) => Promise<void>` handlers, forwarding rejections to `next`.
   - `middlewares/notFoundHandler.ts` — catches unmatched routes, responds with the error envelope, 404.
   - `middlewares/errorHandler.ts` — last-registered middleware; if `err instanceof ApiError` use its `statusCode`/`message`/`errors`, else default to 500 + generic message (never leak stack traces in the response body).
   - Wire all of the above into `app.ts` in the correct order (routes → `notFoundHandler` → `errorHandler`).
9. **Verify Phase 0 acceptance criteria**: hit `/health` (success envelope), add a temporary route that calls `next(new ApiError(400, "test"))` and confirm the error envelope shape, then remove the temp route.
10. **Commit**: first commit on `main` with the scaffold (docs/ from this planning session included).

## Verification
- `docker compose up -d` → healthy container.
- `npx prisma migrate dev` → succeeds, no pending migrations.
- `npm run dev` in `server/` → boots without errors.
- `GET /health` → `{ success: true, data: { status: "ok" } }`.
- Deliberate error route → `{ success: false, statusCode: 400, message: "test" }`.

## Exit Criteria to Move to Phase 1
Schema migrated, shared envelope/error infra in place and verified, backend boots cleanly. No feature routes yet — that's Phase 1.
