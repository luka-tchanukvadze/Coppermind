# The decisions that mattered

Back to the [overview](README.md).

## Redis does three unrelated jobs

Not one cache - three separate concerns that happen to share a store:

1. **Rate-limit counters**, kept in Redis so they survive restarts and would work
   across multiple backend instances.
2. **The book catalog**, cached as a single snapshot. The catalog is small and
   changes rarely, so serving list, genre-filter, and genre-counts from one
   cached blob (filtered in memory) beats hitting Postgres on every page view. A
   lock prevents a cache stampede when the snapshot expires.
3. **Per-user recommendations**, with **cascade invalidation**: adding a book
   changes not just my recommendations but my friends' too (I just entered or
   left their "friends who have this" pool), so a write clears my cache *and*
   every friend's.

The point: caching is applied where reads dominate and data is slow-changing, and
deliberately *not* everywhere.

## Messaging: HTTP writes, sockets notify

The write always goes through a normal HTTP request (validated, transactional).
The socket only **pushes a notification** of that write to the other person and to
the sender's own other tabs - it never carries the write itself. This keeps the
source of truth in the database and the realtime layer disposable.

Sending optimistically shows the message immediately using a client-generated id.
The server echoes that id back over the socket so the sender's tab can swap the
optimistic row for the real one without a flicker.

## Paging chat history with a compound cursor

Older messages page on `(createdAt, id)` together, not on `createdAt` alone.
Paging on the timestamp by itself silently drops any messages that share the same
millisecond - which happens constantly with fast typing or seeded data. The id
tiebreaker closes that gap. This is the kind of bug that is invisible by hand and
obvious in a test.

## Presence is multi-tab by design

Each user maps to a **set** of live sockets, not a single one, so opening a second
tab does not knock the first offline. A user's status (online / away / offline) is
*derived* from all their sockets, and friends are only notified when the derived
status actually changes - not on every tab event.

## "Delete for me" is one-way

Deleting a conversation stamps only *my* participant row. It disappears from my
list but stays in the other person's, and reappears for me if they message again.
Nothing is actually deleted. Letting someone delete a conversation out of another
person's account is simply not a thing the product should allow.

## Ownership checks in a single query

Instead of "fetch the row, check it is mine, then write", ownership is enforced in
one statement: an update/delete scoped by both the record id *and* the user id,
then a check that a row was actually affected. One round trip does the
authorization and the write together.

## The feed is written, not computed

Rather than joining five tables on every feed load, an `Activity` row is written
when something happens (fire-and-forget, so it never slows the real action).
Reading the feed is then one indexed query with a single joined fetch, and cursor
pagination on top.

## Frontend: clear the cache on every auth change

Mostly a backend story, but the frontend has one invariant worth calling out.

The app keeps a single client-side query cache for the whole tab, and the cache
keys are not scoped per user. On their own those two facts are a data-leak
waiting to happen: log out of one account and into another in the same tab, and
the first account's cached feed, chats, and profile could flash on screen before
anything refetches.

The rule that makes it correct: **every login, signup, and logout clears the
cache.** It is a small line of code guarding a subtle correctness bug - the kind
that never shows up in a quick demo and would quietly leak one user's data to the
next. Worth writing down so it is never removed by accident.
