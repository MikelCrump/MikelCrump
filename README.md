# Crump Studio

Internal web app for scaling AI lecturer video production: script in → consistent-face clips + joined audio out.

## Status

Phases **1–7 complete** on mock providers.

## Locked decisions

| Concern | Choice |
| --- | --- |
| Auth | **Clerk** (keys later) |
| Storage | **Vercel Blob** |
| Video | **mock** default + stubs for **Runway, Kling, Veo, Pika** |
| Audio | **mock** default + **ElevenLabs** stub |

## Stack

Next.js App Router · TypeScript strict · Tailwind · Prisma/Postgres · Zod · Vitest · React Flow · MCP SDK · pnpm

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

MCP (stdio): `pnpm mcp` — see [docs/MCP.md](./docs/MCP.md).

## Life Ops (Mikel Crump)

Personal dashboard at **`/life`**: Tesla, Govee, Plaid, Renpho, Resideo AC, RustDesk, AI credits (Claude ×2, GrokBot ×2, Cursor, Grok), Apple TV / Roku, batteries, weather, commute suggestions, and simple automations.

- Setup + env keys: [docs/LIFE_OPS.md](./docs/LIFE_OPS.md)
- Connections UI: `/life/connections`
- Automations UI: `/life/automations`

Set keys in `.env` with `LIFE_FORCE_MOCK=0`. See [docs/LIFE_OPS.md](./docs/LIFE_OPS.md) for what each backend needs.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next.js |
| `pnpm typecheck` / `lint` / `test` / `build` | Quality gates |
| `pnpm db:seed` | Seed LMS + characters |
| `pnpm mcp` | MCP stdio server |
