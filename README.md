# Coppermind

**A calm, social reading platform for people who actually talk about books.** Keep a shelf, write your thoughts next to each book, and talk them over with friends in real time.

🔗 Live at [coppermind.tchanu.com](https://coppermind.tchanu.com)

---

## What it is

A quiet corner of the internet for readers. You add books to your shelf - want to read, reading, or finished - and write notes that stay private or get shared. You add friends, see what they are reading, start a discussion about a book, and message each other live, like texting.

No points, no streaks, no feed shouting for attention. It is meant to feel like a good library: calm, personal, yours.

## Why I built it

I love Goodreads for keeping track of what I read. But I always wished it felt more modern, that it let me keep my own notes right next to each book, and that it made it easier to actually talk about books with other people. So I decided to build the version I wanted to use: calm, fresh, and made for the conversation, not just the list.

## What you can do

- **Shelve your books** and track where you are with each one.
- **Keep notes** on a book, private to you or shared with friends.
- **Add friends** and see what they are reading right now.
- **Discuss** a book in its own thread.
- **Chat live**, with read state and who is online.
- **Get recommendations** from what your friends read and the genres you love.

## For the curious: how it is built

This part is for the technically minded, but I have tried to keep it readable.

Most of the work went into the **live chat being genuinely correct**, not just looking fine in a quick demo:

- **Messages never flicker or vanish.** A message you send appears instantly, and when the server confirms it the app quietly reconciles the two with no jarring refresh. Scroll up to read old messages and new arrivals will not yank you around.
- **History loads as you scroll up**, and it is careful never to skip or duplicate a message, even two sent in the very same millisecond.
- **"Online" status is honest.** Open the app in two tabs and your friends do not see you flicker online twice. Presence is worked out from all your open connections, not guessed.
- **One small piece of bookkeeping powers three features at once**: unread counts, read state, and the new-friend-request badge, with no extra clutter.

A few other touches: book search pulls from Google Books and quietly falls back to another source if that is slow, and errors shown to users stay generic, so the app never leaks internal details or reveals which emails have accounts.

## How it runs

The part I am proudest of: **there is no rented cloud server.** The whole backend runs on a small Raspberry Pi at home.

When I push new code, it is built automatically and the Pi quietly updates itself to the new version, with no manual steps. The site reaches the outside world through a secure tunnel, so my home network is never directly exposed - no open ports, no visible home address. The part you see in the browser is hosted separately on Vercel for speed.

```
push new code
      │
      ▼
 built automatically
      │
      ▼
 Raspberry Pi at home  ──secure tunnel──►  the internet
```

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

A _Stormlight Archive_ reference. A coppermind is where you store memories so you do not lose them. Felt right for a place to keep what you read.
