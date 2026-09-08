# Crump Solutions Group

Parent company site for LMS & e-learning engineering, IT infrastructure, event technology, and event management — including [CRUMP360](https://crump360.com) and Crump Studio.

## Stack

Next.js App Router · TypeScript · Tailwind · Prisma (Studio) · Vitest · pnpm

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

- Marketing site: `/`
- Crump Studio (internal production): `/studio` — requires Postgres (`pnpm db:migrate:deploy && pnpm db:seed`)

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next.js |
| `pnpm typecheck` / `lint` / `test` / `build` | Quality gates |
| `pnpm db:seed` | Seed LMS + characters (Studio) |
| `pnpm mcp` | MCP stdio server |
