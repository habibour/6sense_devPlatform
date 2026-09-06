# Phase 5 Plan: Public Free Deployment

Implements `docs/specs/phase-5-deployment/spec.md`. Depends on Phase 4 being complete.

## Steps

1. **Provision the database**: create a Neon free Postgres project; obtain its `DATABASE_URL` (includes `?sslmode=require`). Treated as a secret throughout — never committed, only pasted into Render's dashboard and used in local shell commands.
2. **Backend first** (fixes its URL before the frontend needs it): create a Render Web Service from `server/` — Build Command `npm install && npx prisma generate && npx prisma migrate deploy`, Start Command `npm start`, env vars `DATABASE_URL`/`JWT_SECRET`/`JWT_EXPIRES_IN=1d`/`CORS_ORIGIN` (temporary placeholder). `PORT` left unset (Render injects it). Verify `/health` and `/api-docs`.
3. **Seed once, locally, against Neon** (Render's free tier has no Shell access): `DATABASE_URL="<neon-url>" npx prisma migrate deploy` then `DATABASE_URL="<neon-url>" node prisma/seed.js` from `server/`. Confirmed: "Seeded 16 posts across 6 demo users."
4. **Frontend**: create a Render Static Site from `client/` — Build Command `npm install && npm run build`, Publish Directory `dist`, env var `VITE_API_BASE_URL=<backend-url>/api` set before the first build.
5. **SPA fallback attempt #1 (failed)**: added `client/public/_redirects` (`/*    /index.html   200`), the Netlify convention. Deployed and tested — the file itself was served correctly at `/_redirects`, but real routes like `/login` still 404'd with Render's own generic 404 page, proving the rewrite wasn't applied. Confirmed via Render's own docs (`render.com/docs/redirects-rewrites`) that static sites only support dashboard-configured rules, not a `_redirects` file.
6. **SPA fallback attempt #2 (worked)**: removed `client/public/_redirects`; added a Redirect/Rewrite rule via the Render dashboard (Static Site → Settings → Redirects/Rewrites → Source `/*`, Destination `/index.html`, Action Rewrite). Verified `/login` and `/posts/<fake-id>` both return 200 with the React app shell after this.
7. **Close the CORS loop**: updated the backend's `CORS_ORIGIN` to the frontend's real deployed origin (no trailing slash), redeployed, verified no CORS errors against the live frontend.
8. **Docs**: `docs/adr/0010-deployment-platform.md` (platform choice + the `_redirects` correction), `README.md` (top-of-file live-demo badge, "Live Demo" section, "Deployment" section — all reflecting steps 5/6's corrected approach, not the abandoned one), `CLAUDE.md` (new "Deployment" section + this phase added to "Current phases").
9. **End-to-end verification against production**: registered a brand-new account via the live API, logged in as a seeded demo user, created a post, added a comment, added a reaction — confirmed each persisted correctly on refetch (`commentCount`, `likeCount`, `score` all updated as expected). Cleaned up the smoke-test post/comment/reaction/account afterward via a one-off Prisma script against Neon so the persistent feed stays at exactly the 16 original seeded posts plus any genuine visitor activity.

## Verification
- `curl https://sixsense-devplatform.onrender.com/health` → `{"success":true,"data":{"status":"ok"}}`.
- `curl https://sixsense-devplatform.onrender.com/api-docs` → 200 (after following the swagger-ui trailing-slash redirect).
- CORS: a request with `Origin: https://sixsense-devplatform-client.onrender.com` gets back a matching `access-control-allow-origin` header.
- `GET /api/posts` returns exactly 16 posts (the seeded count) once smoke-test data is cleaned up.
- Register → login → create post → comment → react, all via direct API calls, each persists on refetch.
- `curl https://sixsense-devplatform-client.onrender.com/login` (and other deep routes) → 200 with the app shell, not Render's generic 404.

## Exit Criteria
Both services are live, the database is seeded exactly once and persists real visitor activity on top, CORS is closed to the exact frontend origin, SPA client-side routing survives a direct load/refresh, and `README.md`/`CLAUDE.md`/the new ADR all describe the deployment as it actually works — not the abandoned `_redirects` approach.
