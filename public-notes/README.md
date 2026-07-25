# Coppermind - architecture notes

A social reading app: shelves, per-book notes, discussions, a friends feed, and
real-time chat. These notes are a short tour of how it is built and, more
importantly, **why** the interesting parts are built the way they are.

- **[decisions.md](decisions.md)** - the design decisions that mattered
- **[scaling.md](scaling.md)** - where this design gives out, and what stays
  simple on purpose

## Stack

- **Backend:** Node + Express (TypeScript), Prisma over PostgreSQL, Redis,
  Socket.IO. A pure JSON API plus a websocket server - it renders no HTML.
- **Frontend:** Next.js (App Router) + React, Tailwind, TanStack Query. Deployed
  separately from the API.
- **Deploy:** the backend runs as a Docker container on a self-hosted Raspberry
  Pi. CI builds an ARM image, and the server auto-pulls the new one. Postgres and
  Redis run as their own containers alongside it.

A deliberate rule: **the frontend has no backend logic** - no Next API routes, no
server actions. Express owns everything. One backend, and the same API works for
the web app, a REST client, or a future mobile app.

## How a request flows

Every route passes through security headers, CORS, a body-size limit, and cookie
parsing before it reaches a handler. Auth-sensitive and search endpoints sit
behind rate limiting. Auth itself is a JWT in an **httpOnly cookie** (JavaScript
cannot read it, so an XSS bug cannot steal the token), checked on every request
by middleware that also confirms the user still exists and has not changed their
password since the token was issued.

## Data model

Twelve Prisma models. The ones worth knowing:

- **User, Book, UserBook** - a book is global; a UserBook is one person's shelf
  entry (progress, privacy) linking a user to a book.
- **FriendConnection** - one row with a requester, an addressee, and a status.
  Friendship is symmetric, so "my friends" means rows where I am on *either* side.
- **Conversation / Message / ConversationParticipant** - the participant row
  holds per-person state like "last read" and "cleared".
- **Activity** - a denormalized feed event, written when something happens.

## Quality gates

CI runs on every pull request: typecheck, lint, and an integration test suite
(Supertest driving the real Express app against a throwaway Postgres). The image
is only built and deployed after all of them pass, so a broken change never
reaches the server. Tests focus on the paths that would actually hurt if they
broke silently - auth, authorization boundaries, and a subtle pagination case
(see [decisions.md](decisions.md)) - rather than chasing a coverage number.
