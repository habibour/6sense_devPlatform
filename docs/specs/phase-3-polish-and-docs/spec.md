# Phase 3 Spec: Polish & Docs

Maps to `docs/plans/phase-3-polish-and-docs/plan.md`. Depends on Phase 1 + Phase 2 being functionally complete.

## Goal
Close out the assignment's non-code requirements: a README that satisfies its exact checklist, an honest `AI_USAGE.md`, and a final consistency/responsiveness pass — plus a full end-to-end verification that everything actually works together from a clean checkout.

## Deliverables & Acceptance Criteria

### 1. Consistency pass
- Every page from Phase 2 is re-checked against its loading/empty/error-state requirements; any gaps found are fixed here rather than left as "mostly done."
- Responsive check at a mobile viewport width (~375px) across feed, post detail, and profile pages — no horizontal overflow, no unusable tap targets.

### 2. Root `README.md` — must satisfy every item in the assignment's checklist (section 8):
- [ ] Project name and short description
- [ ] Tech stack (FE, BE, DB) — explicitly states PostgreSQL, Express+TypeScript, Vite+React+TypeScript
- [ ] Local setup (clone → `docker compose up -d` → server install/env/migrate/run → client install/env/run)
- [ ] Environment variables (names only, from `server/.env.example` and `client/.env.example`, each with a one-line description)
- [ ] How to open Swagger/API docs locally (`http://localhost:<PORT>/api-docs`)
- [ ] Ranking formula explanation (reproduces the PRD's formula + rationale from ADR 0005)
- [ ] AI usage notes (or link to `AI_USAGE.md`)
- [ ] Assumptions and known limitations (reaction target integrity enforced in app layer not DB FK per ADR 0004; ranking sorted in-app not via SQL per ADR 0005; long-lived access token / no refresh per ADR 0007; simple page/limit pagination)

### 3. `AI_USAGE.md` — must satisfy every item in the assignment's requirement (section 7):
- [ ] Which AI tools were used (Claude Code) and for which parts of the build
- [ ] How the agent was instructed — the actual spec-driven workflow used (PRD → ADRs → per-phase specs/plans → implementation), with representative example prompts
- [ ] What was personally reviewed, rejected, or rewritten — concrete, not generic
- [ ] At least one specific bug or bad suggestion caught during the build and how it was fixed — must name the actual thing that went wrong

### 4. Final end-to-end acceptance test
From a clean checkout, the following journey works without manual intervention beyond the documented setup commands:
register → login persists across refresh → create a post → add a comment → reply to that comment → like the post → dislike a comment → counts update on screen without a full page reload → edit own skills and add an experience → view another (second) user's profile and confirm no edit controls appear → open Swagger and execute at least one authenticated call.

## Out of Scope
No new features are introduced in this phase — only fixes to bring already-built Phase 1/2 work up to its own spec, plus documentation.
