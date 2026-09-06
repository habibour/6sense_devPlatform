# ADR 0007: JWT access-token-only auth for this pass, no refresh token flow

## Status
Accepted (superseded if the refresh-token bonus is picked up later)

## Context
The assignment lists a refresh-token flow as a bonus item, not part of the core scope (B1/F1). The core requirement is: register/login, issue access tokens, protect mutating routes, persist session client-side, logout. The assignment also states "a clean core FE+BE beats unfinished bonus work" and this project's scope decision (see PRD section 6) is to nail the core fully before attempting bonus items.

## Decision
Issue a single JWT access token on register/login (`jsonwebtoken`, secret from `JWT_SECRET` env var), with a relatively long expiry (`JWT_EXPIRES_IN=1d`) so a reviewer running the app doesn't get logged out mid-session. No refresh token, no refresh endpoint, no token rotation in this pass.

## Consequences
- Simpler auth middleware and frontend session handling: one token, stored in `localStorage`, attached as a `Bearer` header, cleared on logout — no silent-refresh logic on the client.
- A 1-day expiry is a conscious trade-off for a take-home demo, not a production-grade session policy; documented as a known limitation in the root README.
- If refresh tokens are added later, the plan is: add a `RefreshToken` model (`id, userId, tokenHash, expiresAt, createdAt`), a `POST /auth/refresh` endpoint, and rotate/blacklist on use — sized so it can be layered on without touching the existing access-token issuance code.
