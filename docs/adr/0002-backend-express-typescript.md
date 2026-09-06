# ADR 0002: Express + TypeScript layered architecture over NestJS

## Status
Accepted

## Context
The assignment allows Node.js or a Node.js framework (Express, NestJS, Fastify). The backend surface here is modest (~15 routes across 5 resource areas) and needs to be built within a take-home timeframe while still reading as production-minded.

## Decision
Use Express with TypeScript, organized into an explicit layered architecture: routes → controllers → services.

## Consequences
- Avoids NestJS's module/provider/decorator/DI boilerplate and its steeper setup cost, which would consume time better spent on feature completeness and review, per the assignment's own advice to "use the AI agent for boilerplate; spend your time on design, edge cases, and review."
- The routes/controllers/services split keeps business logic (services) separable from HTTP concerns (controllers), which is enough structure to keep the code readable and to make services straightforward to unit-test later if the Jest bonus is picked up.
- Swagger documentation is added via `swagger-jsdoc` annotations colocated with routes rather than NestJS's built-in decorator-based Swagger generation — slightly more manual, but avoids taking on the rest of the NestJS framework just for that feature.

## Addendum: folder layout (superseding the original per-resource module folders)
The original version of this decision organized each resource into its own `modules/<resource>/{routes,controller,service,repository}` folder. This is superseded: the project instead uses a **flat, per-layer folder structure** — `controllers/`, `services/`, `routes/`, `middlewares/`, `validators/`, one file per resource within each — matching a folder convention already established in the user's other Express projects, adapted for this stack:
- No `models/` folder (as the user's other projects have, for Mongoose): Prisma's `schema.prisma` is the single source of truth for data models here.
- No separate `repository/` layer: services call Prisma directly via `database/prisma.ts`; the extra indirection wasn't earning its keep at this project's size.
- `services/` is kept (not present in the reference project) because this app has real business logic — ranking computation, reaction upsert/counter transactions, comment threading — that shouldn't live in controllers.
See `CLAUDE.md` for the full current tree.
