# TableFlow

An open, affordable Airtable alternative — spreadsheet databases, embeddable forms, CSV import/export, and team access.

Built for **Reawaken USA** to replace expensive Airtable subscriptions while keeping the workflows you rely on.

## Features (v0.1 — UI First)

- **Bases & Tables** — Organize data in nested bases with customizable field types
- **Spreadsheet Grid** — Click-to-edit cells, search, add/delete rows and columns
- **Form Builder** — Create public forms with live preview and field toggles
- **Embeddable Forms** — Copy iframe code to embed on any website (e.g. reawakenusa.org/pastors)
- **CSV Import/Export** — Move data in and out like Excel
- **Team Management** — Invite members with role-based permissions (owner, admin, editor, commenter, viewer)
- **Demo Data** — Pre-loaded Pastor Partnership base matching your current form fields

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Key Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard with all bases |
| `/base/base-pastors` | Pastor Partnerships base |
| `/base/base-pastors/table/tbl-pastors` | Spreadsheet grid view |
| `/base/base-pastors/table/tbl-pastors/form/form-pastors` | Form builder |
| `/embed/form-pastors` | Embeddable public form |
| `/settings/team` | Team & permissions |

## Embed a Form

In the form builder, click **Embed** to copy:

```html
<iframe src="https://your-domain.com/embed/form-pastors" width="100%" height="800" frameborder="0" style="border:none;border-radius:12px;"></iframe>
```

## Data Storage

Currently uses **browser localStorage** for UI prototyping. Export CSV anytime from any table. Phase 2 will connect **Supabase** (PostgreSQL + auth) deployed on **Vercel**.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Zustand (state + persistence)

## License

Private — Reawaken USA
