# Product Requirements Document — Dev Community Platform

## 1. Problem Statement

This product is built for the "Agentic Software Engineer" intern take-home assignment (see `../Agentic Engineering Intern Assignement.md`). The assignment simulates real work: design, instruct, review, and validate AI-generated code while owning both the frontend and backend of a small product. The concrete deliverable is a developer community platform, evaluated on backend correctness, frontend completeness, full-stack integration, code quality/Git hygiene, documentation, and the agentic workflow itself.

## 2. Target Users

Developers who want to share posts, discuss them via threaded comments, react to content, and maintain a public profile (skills + work experience) that other developers can browse.

## 3. Features

Mapped directly to the assignment's feature tables (section 4):

| ID | Feature | Description |
|---|---|---|
| B1/F1 | Auth | Register/login, JWT access token, persisted session, logout, protected mutating routes |
| B2/F6 | Developer profile | Create/update skills and experiences; view another developer's profile |
| B3/F2/F3 | Posts | Create, list (ranked), get by id; feed and post-detail screens |
| B4/F4 | Comments | Create and list comments on a post |
| B5/F4 | Comment replies | Threaded replies via parent/child relationship |
| B6/F5 | Reactions | Like/dislike on posts and comments, with visible counts, updating without a full page reload |
| B7 | Post ranking | Posts ranked by a documented formula combining reactions and comment volume |
| B8 | Swagger | All public APIs documented via OpenAPI/Swagger UI |
| B9/F7 | Consistent envelope | Every API response uses the same success/error shape; the frontend handles both uniformly |
| F8 | Polish | Loading, empty, and error states on every screen; responsive desktop/mobile layout |

## 4. Ranking Rule (product-level)

Posts in the feed are ordered by a score that rewards engagement:

```
score = (likeCount - dislikeCount) + commentCount * 2
```

Higher score ranks higher. Ties break by newest (`createdAt` descending). This rewards discussion (comments weighted 2x a single reaction) while still letting a strongly-liked, low-comment post rank well. The weight and formula are intentionally simple and documented so they can be tuned later without changing the product's meaning: "posts people engage with surface first."

## 5. Success Criteria

Mirrors the assignment's evaluation rubric (section 9): a working backend with correct auth/reactions/ranking and Swagger docs; a complete frontend covering feed/post/comments/replies/reactions/profile with clear UI states; the two actually integrated end-to-end; clean Git history; a README that lets a stranger run the project locally; and an honest AI-usage write-up showing real review, not an unreviewed dump.

## 6. Out of Scope (this pass)

Explicitly deferred per the assignment's bonus section and the project's own scoping decision to prioritize a complete core over a partial bonus set:

- Refresh token flow (access-token-only auth for now; see `adr/0007-auth-jwt-no-refresh-this-pass.md`)
- Jest/unit tests for backend services
- Extra UX: optimistic reaction updates, pagination beyond simple page/limit, search/filter, markdown rendering in posts

These may be picked up in a later pass once the core is solid, per the assignment's own guidance that "a clean core FE+BE beats unfinished bonus work."

## 7. Non-Functional Notes

- Single Postgres database, single Node/Express API, single React SPA — no microservices, no separate admin app.
- Local-first: everything must run with `docker compose up -d` plus two `npm run dev` processes, documented in the root README.
- No secrets committed; `.env.example` files document variable names only.
