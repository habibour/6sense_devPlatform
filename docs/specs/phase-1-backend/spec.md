# Phase 1 Spec: Backend (full API)

Maps to `docs/plans/phase-1-backend/plan.md`. Depends on Phase 0 (schema, shared envelope/error handling, Prisma client).

## Goal
A complete, Swagger-documented REST API implementing auth, posts, comments/replies, reactions, and developer profiles, all using the shared success/error envelope from Phase 0.

## Response Envelope (applies to every endpoint below)
```
Success: { "success": true, "data": {...}, "message"?: "..." }
Error:   { "success": false, "statusCode": 400, "message": "...", "errors"?: [...] }
```

## Auth (B1)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | No | body: `{ name, email, password }` → `{ user, accessToken }`. 409 if email taken. |
| POST | `/api/auth/login` | No | body: `{ email, password }` → `{ user, accessToken }`. 401 on bad credentials. |

**Acceptance**: password is bcrypt-hashed, never returned in any response; JWT signed with `JWT_SECRET`, `sub` = user id; `requireAuth` middleware rejects missing/invalid/expired tokens with 401 in the standard error envelope.

## Developer Profile (B2)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/users/me` | Yes | full own profile incl. skills + experiences |
| GET | `/api/users/:id` | No | public profile view (name, bio, skills, experiences) — no email/passwordHash |
| PATCH | `/api/users/me` | Yes | update `name`/`bio` |
| PUT | `/api/users/me/skills` | Yes | body: `{ skills: string[] }`, replaces the full set |
| POST | `/api/users/me/experiences` | Yes | body: `{ title, company, from, to?, description? }` |
| PATCH | `/api/users/me/experiences/:experienceId` | Yes | partial update; 404 if not owned by caller |
| DELETE | `/api/users/me/experiences/:experienceId` | Yes | 404 if not owned by caller |

**Acceptance**: a user can never read/modify another user's private fields or mutate another user's skills/experiences (routes only ever act on the authenticated user's own id via `/me`).

## Posts (B3, B7)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/posts` | Yes | body: `{ title, body }` |
| GET | `/api/posts` | No | query: `page`, `limit`; returns posts sorted by rank |
| GET | `/api/posts/:id` | No | 404 if not found |

**Ranking acceptance criterion**: `GET /api/posts` returns each post with `likeCount`, `dislikeCount`, `commentCount`, and a computed `score = (likeCount - dislikeCount) + commentCount * 2`, sorted `score DESC, createdAt DESC` (see ADR 0005).

## Comments & Replies (B4, B5)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/posts/:id/comments` | Yes | body: `{ body, parentCommentId? }`. 404 if post or parent comment doesn't exist; 400 if `parentCommentId` belongs to a different post. |
| GET | `/api/posts/:id/comments` | No | returns all comments for the post (flat list including `parentCommentId`, ordered `createdAt asc`); the frontend builds the nested tree |

**Acceptance**: creating a comment with a `parentCommentId` increments the post's `commentCount` exactly once (a reply still counts toward the post's total); `commentCount` is updated in the same transaction as the comment insert.

## Reactions (B6)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/reactions` | Yes | body: `{ targetType: "POST"\|"COMMENT", targetId, type: "LIKE"\|"DISLIKE" }`. Upsert semantics — see below. |
| DELETE | `/api/reactions/:targetType/:targetId` | Yes | removes the caller's own reaction to that target, if any |

**Acceptance**:
- 404 if the target (post or comment) doesn't exist (service-layer check, see ADR 0004).
- If the caller has no existing reaction on that target, a new row is created and the target's counter (`likeCount` or `dislikeCount`) is incremented, in one transaction.
- If the caller already reacted with the same type, the request is idempotent (no duplicate row, no double-increment).
- If the caller already reacted with the opposite type, the existing row's `type` is updated and the target's counters are adjusted (old type decremented, new type incremented) in one transaction.
- DB-level uniqueness (`@@unique([userId, targetType, targetId])`) guarantees at most one reaction per user per target regardless of race conditions.

## Swagger (B8)
- Every route above is documented at `GET /api-docs` (Swagger UI), including request bodies, path/query params, response schemas for success and error, and which routes require the `bearerAuth` security scheme.
- **Acceptance**: a reviewer can open `/api-docs`, authorize with a token obtained from `/api/auth/login`, and successfully exercise every route listed above via "Try it out."

## Consistent Request/Response Shape (B9)
- **Acceptance**: every 2xx response across every route above uses `{ success: true, data, message? }`; every 4xx/5xx uses `{ success: false, statusCode, message, errors? }`. No route returns a bare object or array at the top level.
