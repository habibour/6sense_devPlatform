# Agentic Software Engineer — Intern Assignment

**Position:** Intern — Agentic Software Engineer  
**Duration:** Complete and submit within the stated deadline  
**Stack:** Full-stack (Frontend \+ Backend)  
**Evaluation:** Work on only what you can. Your submission will be rated on **both** frontend and backend related work. Equal effort across FE and BE is expected for a strong score.

---

## 1\. Role Overview

We are hiring interns who can build real software **with** AI coding agents — not only write code by hand. You will design, instruct, review, and validate AI-generated code while owning both the frontend and backend of a small product.

This assignment simulates that workflow: ship a working developer community app, document how you used AI tools, and demonstrate that you can debug, structure, and ship production-minded code.

---

## 2\. Assignment Concept — Dev Community

Build a **developer community** platform where:

| Capability | Description |
| :---- | :---- |
| **Posts** | Developers can create and view posts |
| **Comments** | Other developers can comment on posts |
| **Comment replies** | Developers can reply to comments (threaded / nested replies) |
| **Reactions** | Like / dislike on **posts** and **comments**, with visible reaction counts |
| **Profiles** | Developers can **add and update** their **skills** and **experiences** so others can view them |
| **Ranking** | Posts are ranked using comments and reactions (see scoring below) |

**Guiding principle:** Prefer a small, complete, well-structured product over many half-finished features. Show equal care for API design **and** UI/UX. You should contribute to **both frontend and backend**.

---

## 3\. Technical Requirements

### 3.1 Database

Use **one** of:

- MongoDB  
- PostgreSQL  
- Equivalent (state clearly in the README)

### 3.2 Backend

- **Node.js** or a Node.js framework (e.g. Express, NestJS, Fastify)  
- RESTful APIs (or clearly documented equivalent)  
- Consistent **request / response format** across endpoints  
- **Swagger / OpenAPI** for API documentation

### 3.3 Frontend

- **React** or a React framework (e.g. Next.js, Vite \+ React)  
- Screens / flows for auth (if implemented), feed, post detail, comments/replies, reactions, and developer profile (skills & experiences)  
- Clear loading, empty, and error states  
- Responsive enough for desktop and mobile browser use

### 3.4 Repository & delivery

| Rule | Detail |
| :---- | :---- |
| Source control | Everything must be pushed to **GitHub** |
| Default branch | **`main`** must represent the final, runnable code |
| README | Include project description, architecture overview, setup steps, env vars, and how to run locally |

---

## 4\. Feature Scope (Equal FE \+ BE Effort)

Treat the lists below as the **core** assignment. Aim to complete both columns.

### 4.1 Backend (core)

| \# | Feature | Notes |
| :---- | :---- | :---- |
| B1 | Auth (register / login) | Issue access tokens; protect mutating routes |
| B2 | Developer profile | CRUD (or create \+ update) for skills and experiences |
| B3 | Posts | Create, list, get by id; support ranking |
| B4 | Comments | Create and list on a post |
| B5 | Comment replies | Reply to a comment (parent/child relationship) |
| B6 | Reactions | Like / dislike on posts **and** comments; store reaction counts or compute them |
| B7 | Post ranking | Rank posts by comments \+ reactions (document the formula) |
| B8 | Swagger | Document all public APIs |
| B9 | Request / response shape | Consistent request/response envelopes across endpoints |

**Suggested ranking formula (you may refine; document yours):**

score \= (likes \- dislikes) \+ (comment\_count \* weight)

Example: `weight = 2`. Higher score → higher rank. Tie-break by `createdAt` (newest first).

### 4.2 Frontend (core)

| \# | Feature | Notes |
| :---- | :---- | :---- |
| F1 | Auth UI | Register / login; persist session; logout |
| F2 | Feed / ranked posts | List posts ordered by your ranking rules; show reaction counts & comment counts |
| F3 | Post create \+ detail | Create a post; open a post and see full content |
| F4 | Comments & replies | View comments; add comment; reply to a comment |
| F5 | Reactions UI | Like / dislike on posts and comments; update counts without a full page reload |
| F6 | Profile | View another developer; edit own skills & experiences |
| F7 | API integration | Typed or clearly structured client calls; handle API errors from the shared error format |
| F8 | Polish | Loading / empty / error states; basic responsive layout |

### 4.3 Bonus (higher score if done well)

| Bonus | Description |
| :---- | :---- |
| Refresh tokens | Users (developers) can stay logged in / refresh sessions using a **refresh token** flow |
| Unit tests | Jest (or equivalent) covering **services** / business logic |
| Extra UX | Optimistic reactions, pagination, search/filter posts, markdown in posts |

Bonus items are optional. A clean core FE+BE beats unfinished bonus work.

---

## 5\. Suggested Data Model (non-binding)

You may adapt names and fields; keep relationships clear.

User / Developer

  \- id, name, email, passwordHash, createdAt, updatedAt

  \- skills\[\]

  \- experiences\[\]   // e.g. title, company, from, to, description

Post

  \- id, authorId, title, body, createdAt, updatedAt

  \- reactionCounts (or derived)

  \- commentCount (or derived)

  \- rankScore (stored or computed)

Comment

  \- id, postId, authorId, parentCommentId (nullable), body, createdAt

  \- reactionCounts (or derived)

Reaction

  \- id, userId, targetType (post | comment), targetId, type (like | dislike)

  \- unique constraint: one reaction per user per target

---

## 6\. API Expectations (illustrative)

Use consistent envelopes, for example:

| Success {   "success": true,   "data": {},   "message": "optional" } | Error {   "success": false,   "statusCode": 400,   "message": "Human-readable error",   "errors": \[\] } |
| :---- | :---- |

Document actual routes in Swagger. Suggested resource areas:

- `/auth/*`  
- `/developers` or `/users` (profile, skills, experiences)  
- `/posts` (create, list ranked, detail)  
- `/posts/:id/comments` and replies  
- `/reactions` or nested under posts/comments

---

## 7\. Agentic / AI Usage Requirement

This role is **Agentic Software Engineer**. Your process matters as much as the code.

In the README (or a short `AI_USAGE.md`), include:

1. Which AI tools you used (Cursor, Claude Code, ChatGPT, etc.)  
2. How you instructed the agent (example prompts or a short workflow)  
3. What you personally reviewed, rejected, or rewrote  
4. At least one bug or bad suggestion you caught and how you fixed it

Submissions that look entirely unreviewed AI dumps will score poorly.

---

## 8\. README Checklist

Your `README.md` on `main` must include:

- [ ] Project name and short description  
- [ ] Tech stack (FE, BE, DB)  
- [ ] Local setup (clone, env, install, migrate/seed if any, run FE & BE)  
- [ ] Environment variables (names only; **never** commit secrets)  
- [ ] How to open Swagger / API docs locally  
- [ ] Ranking formula explanation  
- [ ] AI usage notes (or link to `AI_USAGE.md`)  
- [ ] Assumptions and known limitations

---

## 9\. Evaluation Rubric

| Area | Weight | What we look for |
| :---- | :---- | :---- |
| Backend correctness & structure | 25% | Models, routes, auth, reactions, ranking, consistent APIs, Swagger |
| Frontend completeness & UX | 25% | Feed, post, comments/replies, reactions, profile; clear states |
| Full-stack integration | 15% | FE and BE actually work together end-to-end |
| Code quality & Git hygiene | 15% | Readable structure, sensible commits on `main` |
| Documentation | 10% | README quality, clear local setup, Swagger |
| Agentic workflow | 10% | Honest, useful AI usage write-up; evidence of review/validation |
| Bonus | up to \+10% | Refresh tokens, Jest service tests, extra polish |

**Partial submissions are accepted.** Incomplete work is fine if what you ship is coherent. You will still be scored on both FE and BE; imbalance or one-sided submissions will be reflected in the score.

---

## 10\. Submission Instructions

1. Create a **public** (or shared) GitHub repository.  
2. Ensure **`main`** contains the final code.  
3. Fill the README checklist (clear local run instructions).  
4. Submit:  
   - GitHub repository URL  
   - Your full name and contact email

---

## 11\. Academic Integrity & Collaboration

- You may use AI tools freely; you must **own** the result.  
- Do not submit another candidate’s repository.  
- Do not commit API keys, database passwords, or `.env` files with secrets.  
- Be ready to walk through your code and AI workflow in a short interview.

---

## 12\. Quick Start Advice (optional tips)

1. Scaffold BE \+ FE early; get a health-check endpoint working first.  
2. Implement auth → posts → comments → reactions → profile → ranking.  
3. Keep FE screens thin and drive them from real APIs (avoid fake-only UI).  
4. Write the ranking formula down before coding it.  
5. Use the AI agent for boilerplate; spend your time on design, edge cases, and review.

---

**Good luck.** We care more about clear thinking, solid full-stack delivery, and how you work with AI agents than about perfect pixel polish. }  
