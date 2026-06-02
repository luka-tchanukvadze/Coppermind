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
- **Follow a feed** of what your friends are reading and shelving, so you never miss what they are into.
- **Add friends** and see what they are reading right now.
- **Discuss** a book in its own thread.
- **Chat live**, with read state and who is online.
- **Get recommendations** from what your friends read and the genres you love.

## For the curious: how it is built

This part is for the technically minded, but I have tried to keep it readable.

**Live chat that is actually correct.** This was the hardest part, and most of the care went here, not just making it look fine in a quick demo:

- **Messages never flicker or vanish.** A message you send appears instantly, and when the server confirms it the app quietly reconciles the two with no jarring refresh. Scroll up to read old messages and new arrivals will not yank you around.
- **History loads as you scroll up**, and it is careful never to skip or duplicate a message, even two sent in the very same millisecond.
- **"Online" status is honest.** Open the app in two tabs and your friends do not see you flicker online twice. Presence is worked out from all your open connections, not guessed.
- **One small piece of bookkeeping powers three features at once**: unread counts, read state, and the new-friend-request badge, with no extra clutter.

**Book search that does not fall over.** Search pulls from the Google Books catalog. If Google is slow or down, it retries a couple of times, then quietly falls back to a second source (Open Library) so you still get results instead of an error. It also picks the sharpest available cover image and cleans up the data before showing it.

**Recommendations in three layers.** Instead of a black-box algorithm, suggestions are built in tiers that each fill in when the one above runs out: first books your friends are reading, then more of the genres you read most, then what is popular overall. The results are cached for a short while so the page stays fast and does not recompute on every visit.

**Built to stay calm under pressure.** Errors shown to users stay generic, so the app never leaks internal details or reveals which emails have accounts. Login and signup are rate limited to blunt brute-force and spam. Slow or failing external services are caught and handled rather than left to crash a request.

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

## Running it yourself

Curious about the setup or want to run it locally? Reach out and I will walk you through it.

## Why "Coppermind"

A _Stormlight Archive_ reference. A coppermind is where you store memories so you do not lose them. Felt right for a place to keep what you read.
