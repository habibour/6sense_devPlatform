# Phase 1 Plan: Backend (full API)

Implements `docs/specs/phase-1-backend/spec.md`. Depends on Phase 0 being complete.

## Folder Structure Added This Phase
Flat, per-layer folders (see `CLAUDE.md` for the full server tree) — one file per resource within each layer, no per-resource module folders and no repository layer:
```
server/src/
  utils/{password,jwt,ranking}.js
  validators/{auth,post,comment,reaction,profile}.validator.js
  middlewares/auth.js
  controllers/{auth,users,posts,comments,reactions}.controller.js
  services/{auth,users,posts,comments,reactions}.service.js
  routes/{auth,users,posts,comments,reactions}.routes.js
  routes/index.js        # mounts every router under /api
  docs/swagger.js
```

## Steps (build in this order; each step should be manually curl-verified before moving on)

1. **Password + JWT utils**: `utils/password.js` (`hashPassword`, `comparePassword` via bcryptjs, cost 10-12); `utils/jwt.js` (`signAccessToken({ sub, email })`, `verifyAccessToken(token)` using `JWT_SECRET`/`JWT_EXPIRES_IN`).
2. **Auth**: `validators/auth.validator.js` (zod: register/login schemas), `services/auth.service.js` (register: check email uniqueness → hash → create user → sign token; login: find by email → compare hash → sign token), `controllers/auth.controller.js`, `routes/auth.routes.js` (`POST /api/auth/register`, `POST /api/auth/login`). Verify via curl: register, then login, then confirm duplicate-email register returns 409.
3. **Auth middleware**: `middlewares/auth.js` — `requireAuth` reads `Authorization: Bearer <token>`, verifies, and attaches `req.user = { id, email }` directly (plain JS, no type augmentation needed), else `next(new ApiError(401, ...))`.
4. **Posts (no ranking yet)**: `validators/post.validator.js`, `services/posts.service.js` (`createPost`, `getPostById`, `listPosts` sorted `createdAt desc` for now — calls Prisma directly), `controllers/posts.controller.js`, `routes/posts.routes.js` (`POST /api/posts` behind `requireAuth`, `GET /api/posts`, `GET /api/posts/:id`). Verify via curl.
5. **Comments**: `validators/comment.validator.js` (body + optional `parentCommentId`), `services/comments.service.js` (`createComment`: validate post exists, if `parentCommentId` set validate it exists and belongs to the same post, then `prisma.$transaction` insert comment + increment `Post.commentCount`; `listComments`: flat list by `postId`, `createdAt asc`), `controllers/comments.controller.js`, `routes/comments.routes.js` (`POST`/`GET /api/posts/:id/comments`, `POST` behind `requireAuth`). Verify a top-level comment and a reply, confirm `commentCount` increments correctly for both.
6. **Reactions**: `validators/reaction.validator.js`, `services/reactions.service.js` (`upsertReaction`: verify target exists per `targetType` → look up existing reaction by the unique key → if none, insert + increment counter; if same type, no-op; if different type, update type + decrement old/increment new counter — all inside one `$transaction`; `removeReaction`: delete + decrement counter if it existed), `controllers/reactions.controller.js`, `routes/reactions.routes.js` (`POST /api/reactions`, `DELETE /api/reactions/:targetType/:targetId`, both behind `requireAuth`). Verify: like → counts up; like again (idempotent, no double count); switch to dislike → counts adjust correctly; delete → counts down.
7. **Ranking**: `utils/ranking.js` — `computeScore(likeCount, dislikeCount, commentCount, weight = 2)`. Wire into `services/posts.service.js listPosts`: fetch posts with counters, map in `score`, sort `score desc, createdAt desc` in JS, return paginated slice. Verify with a small manual dataset that ordering matches the formula.
8. **Users/profile**: `validators/profile.validator.js`, `services/users.service.js` (`getPublicProfile(id)` excludes email/passwordHash; `getOwnProfile(userId)`; `updateProfile(userId, {name,bio})`; `setSkills(userId, string[])` — replace-all via delete-then-createMany or diff-based upsert inside a transaction; `addExperience`/`updateExperience`/`deleteExperience` — each checks `experience.userId === userId` before mutating, 404 otherwise), `controllers/users.controller.js`, `routes/users.routes.js` (routes per spec table). Verify all CRUD paths plus the ownership-check 404 case.
9. **Mount routes**: `routes/index.js` combines every resource router and is mounted once in `app.js` under `/api`.
10. **Swagger**: install `swagger-jsdoc`, `swagger-ui-express`; `docs/swagger.js` defines the OpenAPI 3.0 base document (title, version, `servers: [{url: '/api'}]`, shared `components.securitySchemes.bearerAuth`, shared success/error envelope schemas), globs `apis: ['src/routes/*.routes.js']`. Add a `@swagger` JSDoc block above every route handler across all `*.routes.js` files documenting method/path/body/params/responses/security. Mount `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))` in `app.js`. Verify every route is visible and "Try it out" works end-to-end with a real bearer token.
11. **Full-route regression pass**: curl through every route in the spec table once more end-to-end (happy path + one 401 + one 400/404 per resource) before calling this phase done.

## Verification
Matches the spec's acceptance criteria per resource, plus: Swagger UI loads at `/api-docs` and every documented route is callable with a token obtained from `/api/auth/login`.

## Exit Criteria to Move to Phase 2
Every route in the Phase 1 spec table works, returns the correct envelope, Swagger documents all of them, and reaction/comment counters have been manually verified to stay accurate through create/switch/delete sequences.
