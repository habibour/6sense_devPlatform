# ADR 0003: Vite + React SPA over Next.js

## Status
Accepted

## Context
The assignment allows React or a React framework (Next.js, Vite + React). The app has no SEO requirement and no need for server-side rendering — it is a logged-in-and-anonymous-browsing community app whose data always comes from the Express API.

## Decision
Use Vite + React + TypeScript as a client-side single-page application, with React Router for navigation, TanStack Query for server-state fetching/caching, and Tailwind CSS for styling.

## Consequences
- Faster local dev loop (Vite's dev server) and a simpler mental model (one client bundle talking to one REST API) than adopting Next.js's routing/rendering conventions, which this app doesn't need.
- TanStack Query gives cache invalidation for free, which is how reactions and comment counts update without a full page reload (see Phase 2 spec) without hand-rolling optimistic state.
- If SEO or server rendering ever became a requirement, this would need to be revisited — noted here rather than designed around speculatively.
