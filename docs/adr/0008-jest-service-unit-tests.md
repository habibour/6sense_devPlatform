# ADR 0008: Jest unit tests for the services layer only

## Status
Accepted

## Context
The assignment lists Jest (or equivalent) unit tests covering services/business logic as a bonus item, explicitly deferred in PRD section 6 while the core FE+BE was built out. With the core complete, this was picked up. The question was scope: test everything (routes, controllers, middleware, frontend components), or target the layer the assignment actually names.

`routes/` are thin wiring (path/method/middleware only) and `controllers/` just parse-and-delegate (see root `CLAUDE.md`'s backend layering rules) — neither has business logic worth unit-testing in isolation, and testing them meaningfully would mean spinning up Express + a real or heavily-mocked Prisma client, closer to an integration test than the "services/business logic" the assignment calls out. `services/` is where the actual logic lives: ranking, the reaction upsert/switch/remove state machine, comment-thread validation (post/parent existence, cross-post parent rejection), and profile ownership checks.

## Decision
- Test only `server/src/services/*.service.js` and the pure `utils/ranking.js`, not routes/controllers, and not the frontend.
- Mock only the Prisma client (`database/prisma.js`) — the actual I/O boundary — via a shared `tests/mockPrisma.js` factory, so each test drives real service logic against controlled mock data instead of a real database. `auth.service` tests use the real `bcryptjs`/`jsonwebtoken` utilities rather than mocking them, since hashing/token round-tripping is itself worth verifying and neither touches the database.
- `server/tests/setup-env.js` (wired via `jest.config.js`'s `setupFiles`) populates the env vars `config/env.js` requires with dummy values before any module loads, so `npm test` passes on a clean checkout with no `server/.env` file present — verified by temporarily removing `.env` and re-running the suite.
- Test files live in `__tests__/` folders colocated with the code they cover (Jest's default convention), not a separate top-level test tree, matching this project's preference for flat, discoverable structure.

## Consequences
- 35 tests across 6 suites cover: ranking score computation, the reaction create/no-op/switch/remove state machine and its counter increments/decrements, post ranking + tie-break + pagination, comment creation/threading validation, register/login (including real password hashing and JWT round-trip), and profile skill dedup + experience ownership checks (a real 404-for-not-your-experience authorization test, not just a happy path).
- Routes/controllers remain covered only by manual/Swagger testing, not automated tests — an accepted gap given the assignment's own scoping language ("services/business logic").
- `npm test` is safe to run in CI or right after `npm install`, since it never touches a real Postgres instance and never depends on `server/.env` existing.
