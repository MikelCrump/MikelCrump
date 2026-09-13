# CRUMP360

Events management and LMS — gatherings and courses on one learning path.

## Sites

| URL | Purpose |
|-----|---------|
| **[crump360.com](https://crump360.com)** | Product — plans, seats, and the app (`/start`, `/dashboard`, …) |
| **[crumpusa.org/crump360](https://crumpusa.org/crump360)** | Marketing — brand story, events, and course catalog |

## Features

- **Start** — plan tiers + seat picker (placeholder pricing)
- **Events** — summits, workshops, clinics with registration and capacity
- **Learn** — course catalog, modules, lesson player, progress
- **Dashboard** — learner home with continue path
- **Teach / Admin** — instructor and operator consoles

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · Zustand (local learner state)
- Vercel + GitHub

## Local development

```bash
npm install
npm run dev
```

- Marketing: [http://localhost:3000/crump360](http://localhost:3000/crump360)
- Product start: [http://localhost:3000/start](http://localhost:3000/start)

## Deploy

See [DEPLOY.md](./DEPLOY.md). Production project: `crump360` on Vercel.
