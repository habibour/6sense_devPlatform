# AI Usage

## Tools used

**Claude Code** was the only AI tool used, for the entire build: repo scaffolding, schema/migration design, all backend and frontend code, Swagger annotations, the responsive/consistency pass, and this documentation. No other AI coding tool or code-generation service was used.

## Workflow: spec-driven, phase by phase

The project was built with an explicit spec-first discipline rather than "describe the app, generate everything":

1. **`docs/PRD.md`** was written first — product intent, feature list mapped to the assignment's own requirement table, the ranking formula, and an explicit out-of-scope section.
2. **`docs/adr/000N-*.md`** — one Architecture Decision Record per cross-cutting technical choice (Express vs. NestJS, the reaction polymorphic-target model, ranking computed at read time, JWT without refresh tokens, JS vs. TypeScript), each with Context/Decision/Consequences. A reversed decision gets a new addendum in the same ADR rather than silently rewriting history.
3. For each phase, a **`docs/specs/phase-N-*/spec.md`** (what must be delivered, contracts, acceptance criteria) was written and approved before a matching **`docs/plans/phase-N-*/plan.md`** (ordered technical steps, file paths, verification).
4. Implementation followed the plan step by step, with a commit roughly per step (visible in `git log`: Phase 0 foundation → Phase 1 backend → Phase 2 frontend steps 1–8 → Phase 3 polish).
5. When implementation diverged from a spec, the spec was updated to match reality before moving to the next phase (see the "Reconcile Phase 2 docs with the finished implementation" commit) — docs were kept from describing a version of the app that didn't exist.

### Representative prompts

- "Write `docs/PRD.md` for this take-home based on the assignment doc — feature table, ranking formula, explicit out-of-scope section per the assignment's own bonus guidance."
- "Before touching the backend, write ADRs for: Express vs. NestJS, how reactions model a polymorphic post-or-comment target, and whether ranking is a stored column or computed at read time."
- "Write `docs/specs/phase-1-backend/spec.md` covering every route contract and acceptance criteria from the PRD, then a matching plan.md with ordered implementation steps."
- "Implement Phase 1 plan step by step; after each step, run the server and hit the route with curl/Swagger before moving to the next step."
- "Phase 2 is 'done' — audit every page's loading/empty/error states against the phase-2 spec, fix any gaps directly, and reconcile the spec doc with what's actually built."

## What was personally reviewed, rejected, or rewritten

- **Language choice was overridden.** The backend was initially scaffolded in TypeScript (a reasonable default for a fresh Express+Prisma project), but that didn't match the user's established convention for other Express projects (plain JavaScript, CommonJS). This was caught and the entire backend was converted: all `.ts` files rewritten as `.js` with type annotations/interfaces stripped, `tsconfig.json` removed, `package.json` scripts changed from `tsx` to `node --watch`, TypeScript devDependencies dropped in favor of a plain `eslint.config.js`, and — critically — every doc that assumed TypeScript was updated too (`CLAUDE.md`, ADR 0002's file-tree section, ADR 0003, and the Phase 0/1/2/3 specs and plans), so the docs didn't drift from the code. See `docs/adr/0002-backend-express-javascript.md`'s "Addendum: JavaScript instead of TypeScript."
- **Folder layout was corrected mid-flight.** An early version of ADR 0002 proposed per-resource `modules/<resource>/{routes,controller,service,repository}` folders. This was rejected in favor of the flat, per-layer structure (`controllers/`, `services/`, `routes/`, one file per resource) that matches the user's other Express projects — including dropping the `repository/` layer entirely, since Prisma already provides that indirection via `database/prisma.js` and the extra layer wasn't earning its keep at this project's size.
- **Phase 3 consistency audit surfaced and fixed a real responsive bug**, not just a documentation pass: at a 375px viewport, the navbar's right-hand nav group (New post / username / Logout) overflowed the header and clipped "Logout" off-screen for a normal-length username. Fixed by adding `flex-shrink-0`/`whitespace-nowrap` to the nav items, truncating the username with a `max-w` cap, and tightening the container padding/gap at the mobile breakpoint — verified by rendering the app inside a real 375px-wide iframe (`window.resize` alone didn't change the actual rendered viewport in this environment) and confirming `scrollWidth === clientWidth` with no clipped text.
- **A post-shipping self-review caught a real UX gap in the reaction feature**, not just a nitpick: the like/dislike buttons' "active" highlight was local `useState(null)` in `ReactionButtons.jsx`, never fetched from the server. The one-reaction-per-user-per-target rule was correctly enforced end-to-end (DB unique constraint, service upsert/switch logic), but a user reloading the page or navigating away and back would see their own prior reaction as un-highlighted, even though it was still recorded. Root cause found by reading the component instead of trusting the earlier assumption that "the UI reflects your own reaction" (a claim written into an earlier README draft, then corrected once verified against the code). Fixed by adding `GET /reactions/me/:targetType/:targetId` (service, controller, route, Swagger doc) and a `useMyReaction` hook that seeds the local highlight state on mount, keeping the existing optimistic click behavior for the rest of the session.

## A specific bug/bad suggestion and how it was fixed

The clearest example is the TypeScript-vs-JavaScript scaffold described above: it wasn't a functional bug in generated code, but a bad default choice — the agent scaffolded the backend in a stack (TypeScript + `tsx` + `@types/*`) that didn't match the project's actual convention, adding a compile step and type-def dependencies that weren't wanted for a timeboxed assignment. It was caught during review of the initial scaffold (before feature work built on top of it), and fixed by converting the whole backend and every doc that referenced it back to plain JavaScript in a single dedicated commit, rather than leaving the mismatch to compound across later phases.
