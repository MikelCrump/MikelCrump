# ReachFlow

A user-friendly email and SMS scheduling platform for teams. Built for **Brevo** (email), **Twilio** (SMS), **ManyChat** (lead gen), and CRM integration (Supabase/Vercel).

## Features (UI Phase)

- **Dashboard** — Campaign stats, performance charts, quick actions, activity feed
- **Email** — Template library with preview, campaign scheduling via Brevo
- **SMS** — Template library with mobile preview, campaign scheduling via Twilio
- **Automations** — Visual workflow builder (triggers, email, SMS, delays, conditions)
- **Contacts** — Lead and customer management with ManyChat/CRM source tracking
- **Integrations** — Connect Brevo, Twilio, ManyChat, Supabase CRM, Vercel CRM
- **Settings** — Workspace, sender defaults, team notifications

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Radix UI + shadcn-style components
- Recharts

## Roadmap

- [ ] Brevo API integration (templates, send, scheduling)
- [ ] Twilio API integration (SMS send, delivery tracking)
- [ ] ManyChat webhook sync
- [ ] Supabase/Vercel CRM connection
- [ ] Authentication and multi-tenant support
- [ ] Product packaging for resale
