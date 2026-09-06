# ADR 0010: Render + Neon as the free-tier deployment platform

## Status
Accepted

## Context
This project needs a public, shareable demo link for take-home review — a live frontend and backend that anyone can visit without local setup, backed by a real seeded database, at zero cost. `server/` is a plain Node/Express app with no Dockerfile and no build step (CommonJS, `npm start` runs it directly); `client/` is a Vite/React SPA that compiles to static files (`npm run build` → `client/dist/`). The database is Postgres via Prisma (`server/prisma/schema.prisma`), currently only provisioned locally via `docker-compose.yml`, which isn't reachable from a public host. `server/src/app.js` locks CORS to a single configured origin string rather than an allowlist, and `client/src/api/client.js` bakes the API base URL in at frontend build time — both need each other's URL, so the two services can't be created in parallel.

## Decision
Deploy the backend as a Render free Web Service (Node runtime, no Dockerfile needed) and the frontend as a Render free Static Site (Vite build output), with a Neon free serverless Postgres instance as the database. The backend is created first so its URL is fixed, then the frontend is built against that known URL, then the backend's `CORS_ORIGIN` is updated to the now-known frontend URL and redeployed. Schema migrations run non-destructively on every backend deploy via `prisma migrate deploy` (Render's Build Command); `server/prisma/seed.js` is run exactly once, manually, from a local machine against the Neon connection string — never as part of an automated deploy step — so real visitor registrations and posts accumulate on top of the seed data indefinitely rather than being wiped on redeploy. Render's static sites don't honor a Netlify-style `_redirects` file, so the SPA fallback rewrite `react-router-dom`'s `BrowserRouter` needs is configured as a dashboard Redirect/Rewrite rule on the static site (`/*` → `/index.html`, action Rewrite) rather than a repo file.

## Consequences
- No new backend dependency or Dockerfile — Render builds directly from `server/package.json`'s existing `npm install`/`npm start` scripts, so the deploy config lives entirely in Render's dashboard settings rather than new infrastructure code.
- Render's free Web Service tier spins the backend down after 15 minutes of inactivity; the first request after idle takes roughly 30-60 seconds to cold-start. This is an accepted tradeoff for a free take-home demo rather than a defect — an optional free uptime pinger (e.g. UptimeRobot or cron-job.org hitting `/health` every ~10 minutes) can mitigate it but is not required.
- Neon's serverless Postgres scales to zero between connections and wakes automatically per-connection with no manual unpause step, so the database side has no equivalent cold-start action item.
- Because the seed script is destructive and deliberately never wired into any deploy step, restoring a pristine demo state later (if the seeded data gets cluttered by real visitor activity) is a manual, deliberate action, not automatic — accepted per the "seed once, persist forever" decision for this pass.
