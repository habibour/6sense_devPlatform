# Phase 5 Spec: Public Free Deployment

Maps to `docs/plans/phase-5-deployment/plan.md`. Depends on Phase 4 being complete — this phase hosts the already-built, already-restyled app; it introduces no product features.

## Goal
Make the app reachable at a public URL, for free, so anyone can browse a populated feed instantly and can register/log in for real — no local setup required. This is a **hosting-only** phase: no application code changes beyond what's strictly required to make the existing app deployable (a corrected SPA-routing config; everything else is Render/Neon dashboard configuration and docs).

## Deliverables & Acceptance Criteria

### 1. Database
A Neon free serverless Postgres instance holds the production data. Schema migrations are applied via `prisma migrate deploy` (idempotent, safe to re-run); `server/prisma/seed.js` — which is destructive — is run exactly **once**, manually, from a local machine against the Neon connection string, never as part of an automated deploy step. Real visitor registrations/posts/comments/reactions accumulate on top of the seed data indefinitely (no scheduled reset).

### 2. Backend
A Render free Web Service, live at `https://sixsense-devplatform.onrender.com`, built from `server/` with:
- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start Command: `npm start`
- Env vars: `DATABASE_URL` (Neon), `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, `CORS_ORIGIN` (the deployed frontend's exact origin, no trailing slash). `PORT` is left unset — Render injects it.

`/health` and `/api-docs` are both reachable; accepted tradeoff: the free tier spins down after 15 min idle, so the first request after that takes ~30-60s.

### 3. Frontend
A Render free Static Site, live at `https://sixsense-devplatform-client.onrender.com`, built from `client/` with:
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Env var: `VITE_API_BASE_URL` set to the backend's `/api` URL — baked in at build time.

**SPA fallback routing**: Render's static sites do **not** honor a Netlify-style `_redirects` file — this was tried first, deployed, and confirmed broken (`/login` and other real client-side routes 404'd with Render's own generic 404 page, not the React app). The working fix is a dashboard-configured Redirect/Rewrite rule (Source `/*`, Destination `/index.html`, Action Rewrite). This is the only reason any doc/config file changed hands twice in this phase — see `docs/adr/0010-deployment-platform.md`'s Consequences section for the record of what was tried first.

### 4. CORS
`server/src/app.js`'s single-origin `CORS_ORIGIN` is set to the frontend's real deployed origin after both services exist (resolves the chicken-and-egg ordering: backend created first so its URL is known before the frontend's build-time `VITE_API_BASE_URL` needs it, then the backend's `CORS_ORIGIN` is corrected once the frontend's URL is known).

### 5. Docs
- ADR `docs/adr/0010-deployment-platform.md` records the Render+Neon choice, the accepted cold-start tradeoff, the "seed once, persist forever" decision, and the `_redirects`-doesn't-work correction.
- `README.md`: a prominent live-demo badge at the very top of the file, a "Live Demo" section (cold-start heads-up, seeded demo credentials), and a "Deployment" section documenting the exact reproducible steps.
- `CLAUDE.md`: a "Deployment" section pointing at the live URLs and the ADR, and this phase added to the "Current phases" list.

### 6. Verification performed
Registration, login (as a seeded demo user), post creation, commenting, and reacting were all exercised directly against the production API (not just locally) and confirmed to persist correctly in Neon on refetch; the SPA rewrite fix was confirmed by directly loading a deep client-side route after the dashboard rule was added. Smoke-test data created during verification was cleaned up afterward so the persistent feed only contains the original 16 seeded posts plus genuine visitor activity.

## Out of Scope
No CI/CD pipeline beyond Render's own git-push-to-deploy, no custom domain, no scheduled/automatic reseeding, no uptime pinger (optional mitigation for the cold-start tradeoff, left to the user to configure if wanted), no staging environment — one production-like environment only.
