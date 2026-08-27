# TableFlow

An open, affordable Airtable alternative — spreadsheet databases, embeddable forms, CSV import/export, and team access.

Built for **Reawaken USA** to replace expensive Airtable subscriptions.

## Features

- **Bases & Tables** — Organize data with customizable field types
- **Spreadsheet Grid** — Click-to-edit cells, search, add/delete rows and columns
- **Form Builder** — Create public forms with live preview and embed codes
- **Embeddable Forms** — iframe embed for your website (e.g. reawakenusa.org/pastors)
- **CSV Import/Export** — Move data in and out like Excel
- **Team Management** — Role-based permissions (owner, admin, editor, commenter, viewer)
- **Supabase Backend** — PostgreSQL, auth, row-level security (optional — falls back to localStorage)
- **Instant Sync** — Supabase Realtime pushes grid changes live across tabs and team members

## Production deploy

See **[DEPLOY.md](./DEPLOY.md)** for the full checklist.

## Quick Start (Local Mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — works immediately with browser storage.

## Enable Cloud Sync (Supabase + Vercel)

### 1. Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a project
2. Open **SQL Editor** and run both migrations in order:

   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_enable_realtime.sql` (instant sync)

3. Under **Project Settings → API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Deploy to Vercel

```bash
npx vercel
```

Add the same four env vars in **Vercel → Project Settings → Environment Variables**.

Set **Site URL** and **Redirect URLs** in Supabase Auth settings to your Vercel domain (e.g. `https://your-app.vercel.app/auth/callback`).

### 4. Sign up

Visit `/signup`, create an account. On first login, TableFlow auto-provisions your workspace with the Pastor Partnerships demo data.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard |
| `/base/base-pastors/table/tbl-pastors` | Spreadsheet grid |
| `/base/base-pastors/table/tbl-pastors/form/form-pastors` | Form builder |
| `/embed/form-pastors` | Public embeddable form |
| `/settings/team` | Team & permissions |
| `/settings` | Backend connection status |

## Embed a Form

```html
<iframe
  src="https://your-app.vercel.app/embed/form-pastors"
  width="100%"
  height="800"
  frameborder="0"
  style="border:none;border-radius:12px;">
</iframe>
```

Public submissions go through `POST /api/forms/[formId]` — no auth required.

## Tech Stack

- Next.js 16 (App Router) on Vercel
- Supabase (PostgreSQL + Auth + RLS + **Realtime**)
- TypeScript, Tailwind CSS v4, Radix UI
- Zustand (client cache + localStorage fallback)

## License

Private — Reawaken USA
