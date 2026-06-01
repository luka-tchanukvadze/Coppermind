# Coppermind

**Goodreads, without the noise.** A calm, real-time reading app: shelve your books, keep private notes, follow friends, argue about plot twists, and chat live - all self-hosted, all yours.

🔗 **Live:** [coppermind.tchanu.com](https://coppermind.tchanu.com)

---

## What it does

- **Your shelf** - track what you want to read, are reading, and finished. Search it instantly.
- **Notes** - jot quotes and thoughts on any book. Keep them private, or let friends see them.
- **Friends** - send requests, see who's online, peek at each other's shelves.
- **Discussions** - start a thread about a book, reply, like, share.
- **Live chat** - real-time DMs with typing indicators, presence, and unread badges.
- **Recommendations** - what your friends are reading, picks from your genres, and what's trending.

Built to feel quiet and fast, not gamified and loud.

## How it's built

Two apps, one repo.

**Frontend** - Next.js 15 (App Router) + React 19, Tailwind v4, TanStack Query, react-hook-form + Zod. Deployed on Vercel.

**Backend** - Express 5 + TypeScript, Prisma + PostgreSQL, Redis (cache + rate limiting), Socket.IO for everything real-time. JWT auth in httpOnly cookies.

**Infra** - the interesting part: the backend runs in Docker **on a Raspberry Pi at home**, exposed through a Cloudflare Tunnel. Push to `master`, GitHub Actions builds an ARM64 image, and Watchtower on the Pi auto-pulls and restarts it. Migrations run on boot. No cloud server bill.

```
Vercel (frontend)  ──►  Cloudflare Tunnel  ──►  Raspberry Pi (Docker: API + Postgres + Redis)
```

## Repo layout

```
backend/    Express API, Prisma schema + migrations, Socket.IO
frontend/   Next.js app - app/ (pages), components/, lib/api (one file per resource)
Dockerfile  backend image (built by CI, run on the Pi)
```

## Run it locally

Needs Postgres + Redis. Set `backend/.env` (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, ...).

```bash
# backend
npm install
npx prisma migrate dev --schema=./backend/prisma/schema.prisma
npm run dev

# frontend
cd frontend && npm install && npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Why "Coppermind"

A *Stormlight Archive* reference - a coppermind stores memories perfectly. Felt right for a place to keep what you read.
