# Phase 3 Plan: Polish & Docs

Implements `docs/specs/phase-3-polish-and-docs/spec.md`. Depends on Phase 1 + Phase 2 being functionally complete.

## Steps

1. **Consistency audit**: walk every page from Phase 2 (`FeedPage`, `PostDetailPage`, `NewPostPage`, `ProfilePage`, `LoginPage`, `RegisterPage`) and confirm each has a real loading state, empty state (where applicable), and error state — not a placeholder. Fix any gap found directly (this phase produces fixes, not just a checklist).
2. **Responsive pass**: resize the browser to ~375px width and check the feed, post detail (with comments/replies), and profile pages for overflow, clipped text, or unusable tap targets on reaction buttons and forms; adjust Tailwind classes as needed.
3. **Root `README.md`**: write the full document covering — project name/description; tech stack table; architecture overview (client ↔ REST API ↔ Postgres, layered backend, monorepo layout referencing `docs/` for deeper rationale); local setup steps (`git clone` → `docker compose up -d` → `cd server && npm install && cp .env.example .env && npx prisma migrate dev && npm run dev` → `cd client && npm install && cp .env.example .env && npm run dev` → open `http://localhost:5174`); environment variable names + one-line descriptions for both `server/.env.example` and `client/.env.example`; Swagger URL; ranking formula (reproduced from PRD) + short rationale (from ADR 0005); AI usage summary + link to `AI_USAGE.md`; assumptions/known limitations (pulled from ADRs 0004, 0005, 0007, plus simple pagination).
4. **`AI_USAGE.md`**: write which AI tools were used and for what parts of the build (scaffolding, boilerplate CRUD, Swagger annotations, etc.); the actual workflow used (PRD → ADRs → per-phase spec → per-phase plan → implementation), with 3-5 representative prompts actually used; concrete examples of what was reviewed/rejected/rewritten during the build; at least one specific bug or bad AI suggestion caught and how it was fixed (name the actual thing — e.g., a missed transaction, a route-ordering bug, an incorrect counter update) — this must be pulled from what actually happened during Phase 0-2, not invented.
5. **Final end-to-end smoke test**: from a clean checkout (or `docker compose down -v && docker compose up -d` + fresh `prisma migrate dev` to simulate one), run through the full journey listed in the Phase 3 spec's acceptance section, including opening Swagger and executing one authenticated call.
6. **Final commit(s)** on `main` with the completed docs and any polish fixes.

## Verification
Every checkbox in `docs/specs/phase-3-polish-and-docs/spec.md` (README checklist + AI_USAGE checklist) is checked off against the actual files, and the end-to-end journey completes without any undocumented manual step.

## Exit Criteria
`main` is the final, runnable, documented state of the project, ready to submit per the assignment's section 10.
