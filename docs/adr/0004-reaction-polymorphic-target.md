# ADR 0004: Reactions as a polymorphic target, integrity enforced in the service layer

## Status
Accepted

## Context
Reactions (like/dislike) apply to both posts and comments. The suggested data model (assignment section 5) models `Reaction` with `targetType` (post | comment) and `targetId`, plus a uniqueness constraint of one reaction per user per target. Prisma (and relational schemas generally) cannot express a single foreign key column that points to rows in either of two different tables (`Post` or `Comment`) depending on a discriminator column — there is no native polymorphic FK.

## Decision
Model `Reaction` with `targetType: TargetType` (`POST` | `COMMENT`) and `targetId: String` (no FK relation on `targetId`), plus `@@unique([userId, targetType, targetId])` to enforce one reaction per user per target at the database level. Target existence (does a post/comment with that id actually exist) is verified in `reactions.service.ts` before insert, not by a database constraint.

## Consequences
- The one-reaction-per-user-per-target rule is still DB-enforced (the part that matters most for correctness — preventing duplicate/racing reactions).
- Referential integrity of `targetId` pointing to a real row is an application-level responsibility: the service must look up the target by `targetType` before writing, and reject with 404 if it doesn't exist. This is a known, accepted trade-off of the polymorphic-target pattern in a relational schema, documented in the root README's "known limitations."
- If reactions needed to extend to more target types later (e.g., reacting to a profile), no schema migration is needed — just a new `TargetType` enum value and a new service-side existence check.
