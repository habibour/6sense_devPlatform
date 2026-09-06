# Phase 2 Plan: Frontend (full SPA)

Implements `docs/specs/phase-2-frontend/spec.md`. Depends on Phase 1's API being complete and running.

## Folder Structure
```
client/src/
  api/{client,auth.api,users.api,posts.api,comments.api,reactions.api}.ts
  types/api.ts
  context/AuthContext.tsx
  hooks/{usePosts,useComments,useReactions,useProfile}.ts
  components/layout/{Navbar,PageContainer}.tsx
  components/common/{LoadingSpinner,EmptyState,ErrorBanner,Button}.tsx
  components/posts/{PostCard,PostForm}.tsx
  components/comments/{CommentThread,CommentForm}.tsx
  components/reactions/ReactionButtons.tsx
  components/profile/{SkillsEditor,ExperienceForm,ExperienceList}.tsx
  pages/{LoginPage,RegisterPage,FeedPage,PostDetailPage,NewPostPage,ProfilePage,NotFoundPage}.tsx
  routes/ProtectedRoute.tsx
```

## Steps

1. **Scaffold**: `npm create vite@latest client -- --template react-ts`; install `react-router-dom`, `@tanstack/react-query`, `axios`, `tailwindcss` (+ config); set up `index.css` with Tailwind directives; `client/.env.example` with `VITE_API_BASE_URL`. Add `cors` middleware server-side (scoped to `CORS_ORIGIN`) if not already present from Phase 0/1, and confirm a fetch from the Vite dev server to `/health` succeeds (no CORS error).
2. **Types**: `types/api.ts` — `User`, `Skill`, `Experience`, `Post`, `Comment`, `Reaction`, `ApiSuccess<T>`, `ApiErrorShape` mirroring the backend envelope.
3. **API client**: `api/client.ts` — axios instance with `baseURL = import.meta.env.VITE_API_BASE_URL`; request interceptor injects `Authorization: Bearer <token>` from a module-level token holder; response interceptor unwraps `response.data.data` on success and throws a normalized `ApiClientError` on `success: false`. Then `api/auth.api.ts`, `users.api.ts`, `posts.api.ts`, `comments.api.ts`, `reactions.api.ts` as thin typed wrappers calling `client`.
4. **Auth context + pages**: `context/AuthContext.tsx` (holds `{ user, token }`, rehydrates from `localStorage` on mount, exposes `login`, `register`, `logout`, updates the `client.ts` token holder on change); `routes/ProtectedRoute.tsx` (redirects to `/login` if no token); `pages/LoginPage.tsx`, `pages/RegisterPage.tsx` with forms and inline error display from `ApiClientError.message`. Wire `App.tsx` routes and `main.tsx` providers (`QueryClientProvider`, `AuthProvider`, `BrowserRouter`). Verify: register → redirected to feed → refresh page → still logged in → logout → redirected out of protected routes.
5. **Feed**: `hooks/usePosts.ts` (`usePostsList()` via `useQuery`), `components/posts/PostCard.tsx`, `pages/FeedPage.tsx` using `LoadingSpinner`/`EmptyState`/`ErrorBanner` from `components/common/`. Verify all three states by temporarily pointing `VITE_API_BASE_URL` at a bad port (error state), and against an empty DB (empty state).
6. **Post detail + create**: `pages/NewPostPage.tsx` (protected, `PostForm`, navigates to `/posts/:id` on success), `pages/PostDetailPage.tsx` (fetches post + comments), `hooks/useComments.ts` (`useComments(postId)`, `useCreateComment()`), `components/comments/CommentThread.tsx` (recursive rendering by grouping the flat comment list into a tree via `parentCommentId` before render) and `CommentForm.tsx` (reusable for top-level + reply, toggled by an optional `parentCommentId` prop). Verify: create post → see it on feed and its detail page → add a comment → reply to that comment → nesting renders correctly.
7. **Reactions**: `hooks/useReactions.ts` (`useReact()` mutation calling `POST /api/reactions` or `DELETE .../:targetType/:targetId`, `onSuccess: () => queryClient.invalidateQueries([...])` targeting the specific post/comment query), `components/reactions/ReactionButtons.tsx` wired into both `PostCard` and `CommentThread`. Verify: like/dislike updates counts in place with no full page reload (watch network tab — only the invalidated query refetches); toggling to the opposite reaction and removing a reaction both work.
8. **Profile**: `hooks/useProfile.ts` (`useUser(id)`, `useUpdateProfile()`, `useSkills()`, `useExperiences()`), `pages/ProfilePage.tsx` (view mode always; edit controls — `SkillsEditor`, `ExperienceForm`/`ExperienceList` — rendered only when `userId === auth.user.id`). Verify: view own profile (edit controls visible) vs. a second registered user's profile (edit controls absent).
9. **Layout/nav + 404**: `components/layout/Navbar.tsx` (links + auth-aware login/logout), `PageContainer.tsx`, `pages/NotFoundPage.tsx` for unmatched routes.

## Verification
Manually walk: register → login persists across refresh → create post → comment → reply → like/dislike post and comment (counts update, no reload) → edit own skills/experience → view a second user's profile (no edit controls) — matches the Phase 2 spec's acceptance criteria per screen. Confirm loading/empty/error states on feed and post-detail specifically, since those are most likely to be skipped under time pressure.

## Exit Criteria to Move to Phase 3
Every screen in the Phase 2 spec exists, is wired to the real API (no mock data), and the reaction-without-reload requirement is confirmed via the network tab, not just visually.
