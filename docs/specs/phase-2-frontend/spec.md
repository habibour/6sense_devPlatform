# Phase 2 Spec: Frontend (full SPA)

Maps to `docs/plans/phase-2-frontend/plan.md`. Depends on Phase 1 (every screen below is driven by real API calls, never fake/mock-only data).

## Goal
A React SPA (JavaScript/JSX) covering every screen the assignment requires, each with real loading/empty/error states, talking to the Phase 1 API through one shared API client layer.

## Screens & Acceptance Criteria

### Auth (F1)
- `/login`, `/register` pages with forms; on success, store the returned `accessToken` + `user` (via `AuthContext`, persisted to `localStorage`) and redirect to the feed.
- Session persists across a full page refresh (token rehydrated from `localStorage` on app load).
- A visible logout action clears the token and returns to a logged-out state.
- **Error state**: invalid credentials / duplicate email show the API's `message` inline on the form, not a silent failure or console-only error.

### Feed (F2)
- `/` lists posts from `GET /api/posts`, already ranked by the backend; each `PostCard` shows title, author, `likeCount`/`dislikeCount`, `commentCount`, and score-derived ordering (no client-side re-sorting). The posts response only carries `authorId`; the author's display name is resolved per id via `useUser(authorId)` (`GET /api/users/:id`), cached/deduped by TanStack Query — same for comment authors under F4.
- **Loading state**: skeleton/spinner while the initial fetch is in flight.
- **Empty state**: distinct "no posts yet" message when the list is empty (not a blank page).
- **Error state**: distinct error banner if the fetch fails, with no stale/misleading content shown.

### Post detail + create (F3)
- `/posts/new` (protected — redirects to `/login` if unauthenticated) has a create-post form; on success, navigates to the new post's detail page.
- `/posts/:id` shows full post content plus its comment thread; 404/not-found state if the id doesn't resolve.

### Comments & replies (F4)
- Comment list loads from `GET /api/posts/:id/comments`; the flat list from the API is assembled client-side into a nested tree via `parentCommentId` and rendered recursively (`CommentThread`).
- A top-level "add comment" form and a per-comment "reply" action both exist; both are protected (require auth) and both use the same `POST /api/posts/:id/comments` call, differing only in whether `parentCommentId` is set.
- **Empty state**: "no comments yet" when a post has none.

### Reactions (F5)
- Like/dislike controls appear on every post (feed + detail) and every comment, showing live counts.
- Clicking like/dislike calls `POST /api/reactions`; the UI reflects the new count/state **without a full page reload** — implemented via TanStack Query cache invalidation of the relevant post/comment query, not a manual `window.location.reload()` or full re-fetch of unrelated data.
- Clicking an already-active reaction removes it (`DELETE /api/reactions/:targetType/:targetId`).
- Reaction controls are hidden or disabled (not merely non-functional) for unauthenticated visitors, with a clear affordance to log in.
- **Known API gap**: there is no endpoint to fetch "does the current user already have a reaction on X" — only `POST /api/reactions` and `DELETE /api/reactions/:targetType/:targetId` exist. The frontend tracks each reaction's "active" state client-side, per session (via component state), which resets on a page reload rather than persisting.

### Profile (F6)
- `/profile/:userId` shows a developer's name, bio, skills, and experiences via `GET /api/users/:id`.
- When `:userId` is the logged-in user's own id, edit affordances appear: an editable skills list (`SkillsEditor`, backed by `PUT /api/users/me/skills`) and experience CRUD (`ExperienceForm`/`ExperienceList`, backed by the `/api/users/me/experiences` endpoints).
- Viewing another user's profile never shows edit controls.

### API Integration (F7)
- All API calls go through one `api/client.js` (axios instance): base URL from `VITE_API_BASE_URL`, `Authorization: Bearer <token>` injected automatically when a token exists, and every non-2xx response normalized into a single `ApiClientError` (with `statusCode`, `message`, `errors`) shape that every page/hook can catch and render identically.
- No page hand-rolls its own fetch/error-parsing logic outside this client.

### Polish (F8)
- Every screen above has all three of: a loading state, an empty state (where applicable), and an error state — not just a happy path.
- Layout is usable at both a typical desktop width and a narrow (mobile) viewport: single-column feed on small screens, forms and nav that don't overflow or clip.

## Out of Scope for This Phase
Optimistic UI updates, pagination UI beyond a simple next/prev or page number, search/filter, markdown rendering — all deferred bonus/extra-UX items (see PRD section 6).
