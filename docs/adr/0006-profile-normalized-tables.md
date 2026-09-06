# ADR 0006: Skills and experiences as normalized relational tables, not JSON columns

## Status
Accepted

## Context
A developer profile has a list of skills (simple strings) and a list of experiences (structured: title, company, from, to, description). The suggested data model (assignment section 5) shows these as arrays on `User`. Postgres/Prisma allows either normalized child tables or a JSON column holding an array.

## Decision
Model `Skill` and `Experience` as separate tables, each with a `userId` foreign key. `Skill` has a `@@unique([userId, name])` constraint. `Experience` has typed columns for `title`, `company`, `from` (DateTime), `to` (nullable DateTime), `description` (nullable).

## Consequences
- Adding/removing a single skill or experience is a single-row insert/delete/update, not a read-modify-write of a JSON array — avoids a class of race conditions and makes the API (`PUT /users/me/skills`, `POST/PATCH/DELETE /users/me/experiences/:id`) map cleanly to normal CRUD operations.
- The unique constraint on `(userId, name)` prevents duplicate skills at the database level instead of requiring application-level de-duplication logic.
- `from`/`to` as typed `DateTime` columns allow correct chronological sorting of experiences without parsing strings.
- Slightly more schema/migration surface than a single JSON column, judged worth it for the correctness and query benefits above at this scale.
