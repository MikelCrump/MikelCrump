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
cp .env.example .env.local
# Add your Brevo API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Brevo setup

1. Create an API key in [Brevo → SMTP & API → API keys](https://app.brevo.com/settings/keys/api)
2. Set `BREVO_API_KEY` in `.env.local` (or Cloud Agent secrets)
3. Optionally set `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` (verified sender)
4. Open **Integrations** to confirm connection and send a test email

Without a key, email pages run in **demo mode** with sample data.

### Brevo API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/brevo/status` | GET | Connection + account info |
| `/api/brevo/templates` | GET | List transactional templates |
| `/api/brevo/templates/[id]` | GET | Template detail |
| `/api/brevo/campaigns` | GET/POST | List / create+schedule campaigns |
| `/api/brevo/send` | POST | Send transactional email |

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Radix UI + shadcn-style components
- Recharts
- `@getbrevo/brevo` SDK

## Roadmap

- [x] Brevo API integration (templates, send, scheduling)
- [x] Twilio API integration (SMS send, delivery tracking)
- [x] Supabase / Command Center CRM connection (needs service role key for live reads)
- [ ] ManyChat webhook sync
- [ ] Authentication and multi-tenant support
- [ ] Product packaging for resale
