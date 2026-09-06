# Northstar

Events management and LMS — gatherings and courses on one learning path.

## What it is

**Northstar** helps operators run events and learning together:

- **Events** — summits, workshops, clinics, retreats with registration and capacity
- **Learn** — course catalog, modules, lesson player, progress
- **Dashboard** — learner home with continue path
- **Teach** — instructor console for fill rates and catalog health

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · Zustand (local learner state)
- Designed for Vercel + GitHub

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/events` | Event catalog |
| `/events/[slug]` | Event detail + register |
| `/learn` | Course catalog |
| `/learn/[slug]` | Course overview |
| `/learn/[slug]/[lessonId]` | Lesson player |
| `/dashboard` | Learner home |
| `/progress` | Signal board |
| `/teach` | Instructor console |

## Deploy

```bash
npx vercel --prod
```

Or connect this GitHub repo in the Vercel dashboard and deploy the `cursor/northstar-events-lms-94db` branch (or merge to `main`).
