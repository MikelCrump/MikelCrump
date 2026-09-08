# Crump Studio

Internal web app for scaling AI lecturer video production: script in → consistent-face clips + joined audio out.

## Phase 1 (current)

Scaffold only: Next.js App Router, TypeScript strict, Tailwind, Prisma + PostgreSQL, Vitest, Zod env validation, seed data, and a project list home page.

## Stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS
- Prisma ORM + PostgreSQL (local / Vercel Postgres / Neon)
- Zod env validation (`src/env.ts`)
- Vitest
- pnpm

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL to your local Postgres
pnpm install
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm build` | Prisma generate + Next build |
| `pnpm test` | Vitest |
| `pnpm db:seed` | Seed LMS + characters + sample project |

## Open decisions (confirm before Phase 2)

1. Auth: Clerk vs NextAuth email allowlist
2. File/asset storage: Vercel Blob vs S3
3. Real video-generation APIs (Runway, Kling, Veo, Pika, …) — until then, `VIDEO_PROVIDER=mock`
