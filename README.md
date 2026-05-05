# Coppermind

> **Work in progress.** Backend is functional, frontend is mid-integration. Many features are stubbed against dummy data and will be wired to the real API as they go.

A reading social app. Track what you're reading, keep notes beside the book, and talk about books with friends who actually read them. Goodreads, but quieter and built for people who actually read.

## Stack

**Backend** — Express 5, TypeScript, Prisma 7 (with `@prisma/adapter-pg`), PostgreSQL 16, Redis 7, Socket.IO, JWT auth in httpOnly cookies, bcryptjs, Nodemailer/SendGrid.

**Frontend** — Next.js 15 (App Router), React 19, Tailwind v4, shadcn-style primitives (Radix + cva), TanStack Query, react-hook-form + Zod, Sonner toasts, lucide-react.

**Infra** — Docker, GitHub Actions builds an ARM64 image and pushes to GHCR on every `master` push. A Raspberry Pi 4 runs the backend stack via docker-compose; Watchtower auto-pulls and restarts on new images. Migrations run automatically on container startup.

## Repo layout

```
.
├── backend/
│   ├── src/
│   │   ├── server.ts          entry point
│   │   ├── app.ts             express app + routes wiring
│   │   ├── prisma.ts          prisma client (uses pg.Pool adapter)
│   │   ├── redisClient.ts
│   │   ├── socket/            socket.io setup
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   ├── app/               next.js app router pages + layouts
│   │   ├── components/
│   │   │   ├── ui/            shadcn primitives
│   │   │   ├── shared/        cross-feature components
│   │   │   └── <feature>/     feature-scoped components
│   │   ├── lib/
│   │   │   ├── api/           one file per backend resource
│   │   │   ├── schemas/       zod schemas (form validation)
│   │   │   ├── mocks/         dummy data (will shrink as integration progresses)
│   │   │   ├── format.ts
│   │   │   └── utils.ts       cn() helper
│   │   └── types/
│   └── next.config.ts
├── Dockerfile                 backend image
├── docker-compose.yml         (Pi-side, not committed)
└── .github/workflows/build-image.yml
```

## Local development

### Backend

Needs Postgres + Redis running locally (or pointed at the Pi). Set `backend/.env` with `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, etc.

```bash
npm install
npx prisma migrate dev --schema=./backend/prisma/schema.prisma
npm run dev
```

Backend starts on port 5001.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on port 3000. Set `frontend/.env.local` with `BACKEND_URL` (the Pi's IP or `http://localhost:5001`). Next.js proxies `/api/*` to that URL so cookies stay same-origin.

## Deployment

Pushing to `master` triggers the workflow:

1. GitHub Actions builds the linux/arm64 image
2. Pushes to `ghcr.io/luka-tchanukvadze/coppermind-backend:latest`
3. Watchtower on the Pi polls every 5 min, pulls the new image, restarts the backend container
4. Container start runs `prisma migrate deploy` then boots the server

Frontend deployment isn't wired up yet — currently runs on the dev machine.

## Status / what's done

- ✅ Backend routes (users, books, user-books, friends, discussions, messages)
- ✅ Auth (signup, login, logout, password reset)
- ✅ Pi deployment loop (push → auto-deploy)
- ✅ Frontend UI (every page exists with dummy data)
- ✅ TanStack Query setup
- ✅ Signup wired end-to-end with Zod validation
- ✅ `useMe` query showing real user in the sidebar
- 🚧 Login + logout (backend done, frontend in progress)
- ⏳ Books, shelf, notes, discussions, friends, chat — wiring frontend to the real API
- ⏳ Google Books integration (search → save to db)
- ⏳ Cloudflare Tunnel for public access

## Why "Coppermind"

Stormlight Archive reference. Storage Feruchemy stores memories.
