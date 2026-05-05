# Coppermind

> **Work in progress.** Backend is functional, frontend is mid-integration. Many features are stubbed against dummy data and will be wired to the real API as they go.

Goodreads, without the noise. A full-stack reading app with shelves, public notes, friend connections, discussion threads, and live chat - self-hosted, real-time, fully owned.

## Stack

**Backend** - Express 5, TypeScript, Prisma 7 (with `@prisma/adapter-pg`), PostgreSQL 16, Redis 7, Socket.IO, JWT auth in httpOnly cookies, bcryptjs, Nodemailer/SendGrid.

**Frontend** - Next.js 15 (App Router), React 19, Tailwind v4, shadcn-style primitives (Radix + cva), TanStack Query, react-hook-form + Zod, Sonner toasts, lucide-react.

**Infra** - Docker, GitHub Actions builds an ARM64 image and pushes to GHCR on every `master` push. A Raspberry Pi runs the backend stack via docker-compose; Watchtower auto-pulls and restarts on new images. Migrations run automatically on container startup.

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

Push to `master`. GitHub Actions builds the image, pushes to GHCR, Watchtower on the Pi pulls and restarts. Migrations run on container startup.

## Why "Coppermind"

Stormlight Archive reference. Storage Feruchemy stores memories.
