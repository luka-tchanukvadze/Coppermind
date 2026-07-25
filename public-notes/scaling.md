# Scaling and deliberate simplicity

Back to the [overview](README.md).

## What breaks first at scale

At today's scale, none of this is a concern. It is a map of where the design
would strain first if the app grew, and how I would fix each part.

1. **More than one backend instance.** Presence and socket routing live in
   in-process memory, so two instances would be two separate realtime worlds. The
   fix is a Redis-backed socket adapter and moving presence into Redis - and this
   has to come before horizontal scaling is even possible.
2. **The conversation list.** It loads all of a user's threads and sorts in
   memory - fine at dozens, wrong at thousands. Fix: a denormalized
   "last message at" column and pagination in SQL.
3. **The single-snapshot catalog cache.** Great at hundreds of books, wasteful at
   hundreds of thousands. Fix: paginate and filter in SQL, cache per page.
4. **Feed fan-out on read.** Cost grows with friend count. A materialized
   per-user feed would move that work to write time.

None of these are solved by "add Kubernetes." Every real bottleneck here is a
data-modelling or state-location problem, and #1 gates the rest.

## Deliberately kept simple

Choices made on purpose, to match the project's actual scale:

- **No Kubernetes / microservices.** One app, one node. Orchestration would add
  complexity without solving any problem this app has.
- **Runs TypeScript directly** (via `tsx`) rather than compiling to JS. No build
  step to maintain, and startup cost is irrelevant for a long-lived server.
- **No staging environment.** With a single deploy target, the real safety is a
  PR-gated pipeline into `master`, not a second environment.

Knowing what _not_ to build is as much a part of the design as what is here.
