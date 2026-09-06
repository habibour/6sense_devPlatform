# ADR 0005: Ranking score computed at read time from denormalized counters

## Status
Accepted

## Context
Posts need a rank score: `score = (likeCount - dislikeCount) + commentCount * 2` (see PRD section 4). Two implementation options exist: (a) store `rankScore` as a column on `Post`, recomputed on every write that affects it (new comment, new/changed reaction), or (b) store only the raw counters (`likeCount`, `dislikeCount`, `commentCount`) and compute `score` in the service layer whenever posts are listed.

## Decision
Store `likeCount`, `dislikeCount`, and `commentCount` as denormalized integer columns on `Post`, updated transactionally alongside the reaction/comment write that changes them. Compute `score` in `posts.service.ts` at list time from those columns, and sort in application code (`score DESC, createdAt DESC`).

## Consequences
- Avoids a second write path (recomputing and persisting `rankScore`) that could drift from the underlying counters if a code path forgets to update it — fewer places for a consistency bug to hide.
- The counters themselves are still kept accurate via Prisma `$transaction` calls wrapping the counter increment/decrement alongside the Reaction/Comment write, so reads stay cheap (no `COUNT()` aggregation queries per post).
- Sorting happens in application code rather than a raw SQL `ORDER BY` expression, which is simpler to read and adequate at this dataset size; if post volume grew large enough for this to matter, the next step would be a raw SQL expression index or a materialized view — not needed for this assignment's scope, called out as a known limitation in the README.
