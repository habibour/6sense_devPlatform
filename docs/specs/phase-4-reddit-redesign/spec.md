# Phase 4 Spec: Reddit-Style UI Redesign & Seed Expansion

Maps to `docs/plans/phase-4-reddit-redesign/plan.md`. Depends on Phase 3 being complete — this phase is a follow-on visual/content pass requested after the original assignment submission, not a fix to Phase 1-3 gaps.

## Goal
Make the app look and feel like a real, populated developer community platform — visually modeled on Reddit — instead of an unstyled functional scaffold, and give a fresh clone enough realistic demo content to make that first impression land. This is a **UI/content-only** phase: no Prisma schema changes, no new API endpoints, no new data concepts (no subreddits/communities, no karma, no search — the PRD's flat, single-feed model is unchanged).

## Deliverables & Acceptance Criteria

### 1. Design system
- A Tailwind v4 `@theme` token system in `client/src/index.css`: a `--color-brand-*` teal ramp anchored on 5 product-specified hex values, a `--color-chrome-*` neutral ramp (replacing stock Tailwind `slate`/`gray`), and two accent tokens — `--color-like` (red) and `--color-dislike` (brand teal) — kept separate from the brand ramp since "like" needs a universally recognizable red.
- `Inter` (UI) and `IBM Plex Mono` (existing monospace usage) loaded via Google Fonts in `client/index.html`.

### 2. Icons & logo
- `lucide-react` adopted as the one icon library (see ADR 0009), replacing hand-rolled inline SVGs in touched components.
- Reactions use a filled red `Heart` for like and a `ThumbsDown` for dislike (previously green/red up/down arrows).
- A hand-authored SVG logo mark (`client/src/assets/logo.svg`, plus a simplified `client/public/favicon.svg`) used in the navbar, login/register pages, and the README header.

### 3. Layout
- A new `AppShell` component (left nav rail + content + right sidebar) applied to the feed and post-detail pages, modeled on Reddit's chrome. Left rail links only to real routes (Home, My Profile); right sidebar is static "About" copy plus a real Create Post CTA — no invented data (member counts, fake nav items).
- Login, register, new-post, profile, and 404 keep a simpler centered/single-column treatment, matching how Reddit itself treats those page types.

### 4. Component restyle
- `PostCard` restructured into a two-column Reddit shape: vertical vote rail (heart/count/thumbs-down/count) + title/meta/body-preview/comment-count.
- `ReactionButtons` gains an `orientation` prop (vertical for cards, horizontal for detail/comments) and shows like/dislike counts separately (not a collapsed net score), since the API/spec expose both.
- Every other page and shared component (`Navbar`, `CommentThread`/`CommentForm`, `ProfilePage` + skills/experience, `EmptyState`/`ErrorBanner`/`LoadingSpinner`, `NotFoundPage`) recolored onto the new token system.

### 5. Seed data
- 10 additional long-form demo posts appended to `server/prisma/seed.js` (16 total), spanning realistic dev-community topics with varied, believable engagement (including at least one contested post with real dislikes, and a low-reaction "sleeper" carried by its comment thread) so the ranking algorithm produces a plausible mix on a fresh seed.

### 6. Docs
- `docs/specs/phase-2-frontend/spec.md`'s stale "no endpoint to check current reaction" note corrected (the endpoint exists and is used) — an independent, pre-existing doc bug found and fixed alongside this phase.
- Root `README.md`: logo banner, a prominent callout that a fresh clone must run `npm run prisma:seed` before the feed shows anything, corrected demo-post count, and screenshots recaptured from the restyled app.
- `CLAUDE.md` updated with the new frontend design-system conventions (tokens, icon library, `AppShell`) so future sessions build on them consistently.
- Explanatory comments added across the codebase (backend and frontend) — favoring the *why* behind non-obvious logic over restating *what* the code does, per this project's own comment convention (see `CLAUDE.md`).

## Out of Scope
Subreddits/communities, karma, search/filter, markdown rendering, optimistic reaction updates beyond what Phase 2 already had — none of these are introduced here; the PRD's out-of-scope section (§6) still governs.
