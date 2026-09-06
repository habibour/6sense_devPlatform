# ADR 0001: PostgreSQL + Prisma over MongoDB

## Status
Accepted

## Context
The assignment requires one of PostgreSQL, MongoDB, or an equivalent. The domain has clear relational structure: posts have many comments, comments can reply to comments (self-referential parent/child), reactions belong to a user and a target with a uniqueness constraint (one reaction per user per target), and users have many skills and experiences.

## Decision
Use PostgreSQL as the database and Prisma as the ORM/migration tool.

## Consequences
- Foreign keys, self-referential relations (comment replies), and a composite unique constraint (`userId, targetType, targetId` on `Reaction`) are enforced at the database level where possible, catching bugs earlier than application-level checks alone.
- Prisma migrations give a reproducible, versioned schema history and a typed client, reducing a class of runtime bugs (typos in field names, wrong types).
- Reactions still need a small amount of application-level integrity (see ADR 0004) because Prisma cannot express a true polymorphic foreign key across two possible parent tables (Post or Comment).
- Local development requires a running Postgres instance, addressed via Docker Compose (see Phase 0 plan) rather than requiring a manual local install.
