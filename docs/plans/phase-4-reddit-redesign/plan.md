# Phase 4 Plan: Reddit-Style UI Redesign & Seed Expansion

Implements `docs/specs/phase-4-reddit-redesign/spec.md`. Depends on Phase 3 being complete.

## Steps

1. **Docs first**: add ADR 0009 (`lucide-react` as the icon library), a "Frontend Design System" section in `CLAUDE.md`, and fix the stale "no endpoint to check current reaction" line in `docs/specs/phase-2-frontend/spec.md` — before touching UI code, per this project's spec-driven convention.
2. **Design tokens**: add a Tailwind v4 `@theme` block to `client/src/index.css` (brand teal ramp from the 5 given hex values, a chrome neutral ramp, `like`/`dislike` accent tokens); load `Inter`/`IBM Plex Mono` via `client/index.html`.
3. **Icons**: `npm install lucide-react` in `client/`; swap hand-rolled inline SVGs for lucide icons in every touched component.
4. **Logo**: author `client/src/assets/logo.svg` and a simplified `client/public/favicon.svg`; wire into `Navbar`, `LoginPage`/`RegisterPage`, and the README header.
5. **Layout**: build `client/src/components/layout/AppShell.jsx` (left rail / content / right sidebar); apply to `FeedPage` and `PostDetailPage`.
6. **Component restyle**: rework `PostCard` (two-column vote-rail layout) and `ReactionButtons` (new `orientation` prop, heart/thumbs-down icons, separate like/dislike counts); recolor every other page/component (`Navbar`, `CommentThread`, `CommentForm`, `ProfilePage` + skills/experience editors, `EmptyState`/`ErrorBanner`/`LoadingSpinner`, `NotFoundPage`, `NewPostPage`/`PostForm`) off the new token system.
7. **Seed data**: append 10 long-form posts to `server/prisma/seed.js`'s `posts` array (16 total), with varied authors/timestamps/engagement so the ranking formula produces a believable mix.
8. **README**: add the logo banner, a prominent "run the seed script" callout, fix the hardcoded post count, and recapture the 4 screenshots from the restyled running app — one column, full width, so each is legible without a table.
9. **Verification**: `npm run lint` (client, oxlint) and `npm test` (server, Jest) both clean; manually exercise login/register/feed/post-detail/new-post/profile in the browser; confirm heart/thumbs-down reactions toggle, persist across reload, and match seeded state for a real logged-in user.
10. **Code comments pass**: go through the backend (`server/src`, `server/prisma/seed.js`) and frontend (`client/src`) and add explanatory comments favoring the *why* over restating *what*, per the convention now stated in `CLAUDE.md`.

## Verification
- `cd client && npm run lint` clean (only the pre-existing, unrelated `AuthContext.jsx` fast-refresh warning).
- `cd server && npm test` — all pre-existing Jest suites still pass (comment additions are non-functional).
- `npm run prisma:seed` logs "Seeded 16 posts across 6 demo users."
- Manual browser walkthrough of every page confirms the new palette/logo/icons render, the vote rail and sidebar appear at desktop width, and reactions persist across reload.

## Exit Criteria
`main` reflects the redesigned UI, expanded seed data, and updated docs, with no regression to Phase 1-3 functionality or test coverage.
