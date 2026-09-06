# Phase 2 Plan: Frontend (full SPA)

Implements `docs/specs/phase-2-frontend/spec.md`. Depends on Phase 1's API being complete and running.

## Folder Structure
```
client/src/
  api/{client,auth.api,users.api,posts.api,comments.api,reactions.api}.js
  context/AuthContext.jsx
  hooks/{usePosts,useComments,useReactions,useProfile}.js
  components/layout/{Navbar,PageContainer}.jsx
  components/common/{LoadingSpinner,EmptyState,ErrorBanner,Button}.jsx
  components/posts/{PostCard,PostForm}.jsx
  components/comments/{CommentThread,CommentForm}.jsx
  components/reactions/ReactionButtons.jsx
  components/profile/{SkillsEditor,ExperienceForm,ExperienceList}.jsx
  pages/{LoginPage,RegisterPage,FeedPage,PostDetailPage,NewPostPage,ProfilePage,NotFoundPage}.jsx
  routes/ProtectedRoute.jsx
```
No `types/` folder — plain JavaScript, no compile-time types. API response shapes are documented in `docs/specs/phase-1-backend/spec.md`; reach for that when writing a new API call instead of a shared type definition.

## Steps

1. **Scaffold**: `npm create vite@latest client -- --template react` (JavaScript template, not `react-ts`); install `react-router-dom`, `@tanstack/react-query`, `axios`, `tailwindcss` (+ config); set up `index.css` with Tailwind directives; `client/.env.example` with `VITE_API_BASE_URL`. Add `cors` middleware server-side (scoped to `CORS_ORIGIN`) if not already present from Phase 0/1, and confirm a fetch from the Vite dev server to `/health` succeeds (no CORS error).
2. **API client**: `api/client.js` — axios instance with `baseURL = import.meta.env.VITE_API_BASE_URL`; request interceptor injects `Authorization: Bearer <token>` from a module-level token holder; response interceptor unwraps `response.data.data` on success and throws a normalized `ApiClientError` (a plain `Error` subclass carrying `statusCode`/`message`/`errors`) on `success: false`. Then `api/auth.api.js`, `users.api.js`, `posts.api.js`, `comments.api.js`, `reactions.api.js` as thin wrappers calling `client`.
3. **Auth context + pages**: `context/AuthContext.jsx` (holds `{ user, token }`, rehydrates from `localStorage` on mount, exposes `login`, `register`, `logout`, updates the `client.js` token holder on change); `routes/ProtectedRoute.jsx` (redirects to `/login` if no token); `pages/LoginPage.jsx`, `pages/RegisterPage.jsx` with forms and inline error display from `ApiClientError.message`. Wire `App.jsx` routes and `main.jsx` providers (`QueryClientProvider`, `AuthProvider`, `BrowserRouter`). Verify: register → redirected to feed → refresh page → still logged in → logout → redirected out of protected routes.
4. **Feed**: `hooks/usePosts.js` (`usePostsList()` via `useQuery`), `components/posts/PostCard.jsx`, `pages/FeedPage.jsx` using `LoadingSpinner`/`EmptyState`/`ErrorBanner` from `components/common/`. Verify all three states by temporarily pointing `VITE_API_BASE_URL` at a bad port (error state), and against an empty DB (empty state).
5. **Post detail + create**: `pages/NewPostPage.jsx` (protected, `PostForm`, navigates to `/posts/:id` on success), `pages/PostDetailPage.jsx` (fetches post + comments), `hooks/useComments.js` (`useComments(postId)`, `useCreateComment()`), `components/comments/CommentThread.jsx` (recursive rendering by grouping the flat comment list into a tree via `parentCommentId` before render) and `CommentForm.jsx` (reusable for top-level + reply, toggled by an optional `parentCommentId` prop). Verify: create post → see it on feed and its detail page → add a comment → reply to that comment → nesting renders correctly.
6. **Reactions**: `hooks/useReactions.js` (`useReact()` mutation calling `POST /api/reactions` or `DELETE .../:targetType/:targetId`, `onSuccess: () => queryClient.invalidateQueries([...])` targeting the specific post/comment query), `components/reactions/ReactionButtons.jsx` wired into both `PostCard` and `CommentThread`. Verify: like/dislike updates counts in place with no full page reload (watch network tab — only the invalidated query refetches); toggling to the opposite reaction and removing a reaction both work.
7. **Profile**: `hooks/useProfile.js` (`useUser(id)`, `useUpdateProfile()`, `useSkills()`, `useExperiences()`), `pages/ProfilePage.jsx` (view mode always; edit controls — `SkillsEditor`, `ExperienceForm`/`ExperienceList` — rendered only when `userId === auth.user.id`). Verify: view own profile (edit controls visible) vs. a second registered user's profile (edit controls absent).
8. **Layout/nav + 404**: `components/layout/Navbar.jsx` (links + auth-aware login/logout), `PageContainer.jsx`, `pages/NotFoundPage.jsx` for unmatched routes.

## Verification
Manually walk: register → login persists across refresh → create post → comment → reply → like/dislike post and comment (counts update, no reload) → edit own skills/experience → view a second user's profile (no edit controls) — matches the Phase 2 spec's acceptance criteria per screen. Confirm loading/empty/error states on feed and post-detail specifically, since those are most likely to be skipped under time pressure.

## Exit Criteria to Move to Phase 3
Every screen in the Phase 2 spec exists, is wired to the real API (no mock data), and the reaction-without-reload requirement is confirmed via the network tab, not just visually.
