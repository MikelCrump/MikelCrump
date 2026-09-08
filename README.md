# Crump Studio

Internal web app for scaling AI lecturer video production: script in → consistent-face clips + joined audio out.

## Current phase

**Phase 2** — provider abstraction (Mock + stubs), SceneScript schema, Director Option Formatter.

## Stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS
- Prisma ORM + PostgreSQL (local / Vercel Postgres / Neon)
- Zod env validation (`src/env.ts`)
- Vitest
- pnpm

## Locked decisions

| Concern | Choice | Notes |
| --- | --- | --- |
| Auth | **Clerk** | Email allowlist in Clerk dashboard; keys optional until auth UI |
| Storage | **Vercel Blob** | `BLOB_READ_WRITE_TOKEN` when asset uploads land |
| Video APIs | **mock** (default) + stubs for **Runway, Kling, Veo, Pika** | Plug API keys later; keep `VIDEO_PROVIDER=mock` for E2E |
| Audio | **mock** (default) + **ElevenLabs** stub | `AUDIO_PROVIDER=mock\|elevenlabs` |

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

## Phase map

1. Scaffold ✓
2. Providers + SceneScript + Director Formatter ← you are here
3. LLM adapters + `/api/adapter/normalize`
4. Project CRUD + Wizard steps 1–5
5. Generate + poll + Wizard steps 6–8
6. Audio + Visual Canvas (React Flow)
7. MCP server + docs
