# Coppermind

**Goodreads for people who actually want to talk about the book.** Shelve what you read, keep your notes with it, and argue plot twists with friends in real time.

🔗 Live at [coppermind.tchanu.com](https://coppermind.tchanu.com) - served from a Raspberry Pi in my apartment.

---

## What it is

A social reading app. You keep a shelf (want to read / reading / finished), write notes on each book that are private or shared per entry, add friends, start discussions, and message them live. The catalog comes from Google Books with an Open Library fallback. Recommendations are three tiers: what your friends are reading, then your top genres, then what's popular.

It's meant to feel quiet. No streaks, no points, no algorithmic feed shouting at you.

## The part worth reading the code for

Most of the work went into the live chat being *correct*, not just working in a demo.

- **Optimistic send, no flicker.** The client mints a `clientMessageId`, the server echoes it back, and the socket handler reconciles three cases against the query cache - swap the optimistic row, skip a duplicate, or append an incoming one. It never refetches the thread, so messages you scrolled up to read don't vanish under you.
- **Pagination that doesn't lose messages.** History pages in on scroll-up with a `(createdAt, id)` keyset cursor. Sorting on the timestamp alone silently drops messages that land in the same millisecond; the id tiebreaker closes that. Scroll position is anchored before paint, so the viewport never jumps when older messages load.
- **Presence that survives multiple tabs.** A user maps to a *set* of sockets. Their state (online / away / offline) is derived from that set rather than stored, and events only fire on a real transition, so opening a second tab doesn't spam your friends with "came online."
- **One marker, three features.** A single "last saw this at" timestamp per relationship drives unread message counts, read state, and the Facebook-style friend-request badge - no separate read-receipt tables.

Elsewhere: the rate limiter fails open (if Redis dies, login and search keep serving instead of 500ing), book search retries then falls back Google to Open Library, and the error handler returns generic messages in production so it can't leak internals or let someone probe which emails are registered.

## How it runs

The interesting half. There's no cloud server.

```
push to master
      │
      ▼
GitHub Actions ── build linux/arm64 image ──► GHCR
                                               │
                                       Watchtower pulls
                                               ▼
          Raspberry Pi (Docker): Express + Postgres + Redis
                                               │
                                     Cloudflare Tunnel
                                               ▼
                                       api.tchanu.com
```

The frontend is on Vercel (`coppermind.tchanu.com`). The backend is a Docker container on a Raspberry Pi at home, reachable only through a Cloudflare Tunnel - no open ports, home IP never exposed. Push to `master`, CI builds the ARM64 image, Watchtower on the Pi pulls and restarts it, and migrations run on container boot. The auth cookie is scoped to the parent domain so it stays first-party across both subdomains.

## Stack

**Backend** - Express 5, TypeScript, Prisma + PostgreSQL, Redis, Socket.IO, JWT in an httpOnly cookie.
**Frontend** - Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui, TanStack Query, react-hook-form + Zod.

## Run it locally

Needs Postgres and Redis. Put `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` in `backend/.env`.

```bash
# backend
npm install
npx prisma migrate dev --schema=./backend/prisma/schema.prisma
npm run dev

# frontend
cd frontend && npm install && npm run dev
```

## Why "Coppermind"

A *Stormlight Archive* reference. A coppermind is where you store memories so you don't lose them. Felt right for a place to keep what you read.
