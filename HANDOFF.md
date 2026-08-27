# TableFlow / Tables — Developer Handoff

**Product name in UI:** Tables (formerly TableFlow)  
**Package name:** `tableflow-app`  
**Working tree absolute path (handoff agent):** `/workspace`  
**Handoff branch:** `handoff`  
**Intended private repo:** `https://github.com/MikelCrump/tableflow` (create if missing; agent token could not `createRepository`)  
**Existing pushable remote during handoff:** `https://github.com/MikelCrump/MikelCrump`  
**Live Vercel project (do not modify for this handoff):** `mikelcrumps-projects/tableflow`  
**Known production URLs:**  
- Standalone / alias historically: `https://tableflow-reawaken.vercel.app`, `https://workspace-omega-gray.vercel.app`  
- Mounted under Command Center: `https://reawakencommandcenter.com/apps/tableflow` (`NEXT_PUBLIC_BASE_PATH=/apps/tableflow`)

---

## 1. What the app does (features → routes)

Spreadsheet-style **bases → tables → records → forms**, with cloud sync via Supabase when configured, otherwise browser local/demo data.

| Feature | Route(s) | Notes |
|--------|----------|--------|
| Home / workspace overview | `/` | Lists bases, stats, create base |
| Base detail (tables & forms list) | `/base/[baseId]` | |
| Spreadsheet grid (CRUD cells/fields/rows) | `/base/[baseId]/table/[tableId]` | CSV import/export in toolbar |
| Form builder | `/base/[baseId]/table/[tableId]/form/[formId]` | Field toggles, settings, live preview, publish, embed snippet |
| Public embeddable form | `/embed/[formId]` | Unauthenticated; published forms only |
| Settings (data mode + Airtable sync) | `/settings` | Airtable merge button |
| Team page | `/settings/team` | **Redirects to `/settings`** — team invites removed; access follows Command Center |
| Login | `/login` | Email/password + Google OAuth |
| Signup | `/signup` | Email/password |
| Auth callback | `/auth/callback` | OAuth / magic-link exchange |
| Health check | `/api/health` | Public |
| Workspace bootstrap + hydrate | `/api/workspace` | Auth required |
| Published form GET/POST | `/api/forms/[formId]` | Public (rate-limited POST) |
| Airtable → Tables sync | `/api/airtable/sync` | Auth + `@reawakenusa.org` |

**Client-side only (no dedicated route):** Command Center auth bridge (copies Supabase session from `localStorage` → cookies), theme sync (`cc-theme`), realtime grid updates via Supabase Realtime.

With `NEXT_PUBLIC_BASE_PATH=/apps/tableflow`, all of the above are served under that prefix (e.g. `/apps/tableflow/login`).

---

## 2. Framework / layout

| Item | Value |
|------|--------|
| Framework | **Next.js 16.3.3** (App Router) |
| React | **19.2.8** |
| Language | TypeScript 5 |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`) |
| State | Zustand 5 |
| UI primitives | Radix UI + lucide-react |
| Package manager | **npm** (`package-lock.json` present) |
| Monorepo? | **No** — single Next app at repo root |

### Top-level layout

```
/
  package.json
  next.config.ts          # optional basePath, CSP frame-ancestors
  src/
    app/                  # App Router pages + API routes
    components/           # UI, grid, forms, layout, theme
    hooks/
    lib/                  # store, supabase, airtable, csv, theme, sync
    middleware.ts         # auth gate
  supabase/migrations/    # SQL to run in Supabase SQL editor
  scripts/sync-airtable.ts
  HANDOFF.md
  .env.example
```

---

## 3. Data layer

### Backend

- **Supabase** (Postgres + Auth + Realtime) — shared project historically: `izterlcgwtguotdxyaza` (“Reawaken-Command-Center”).
- Connection:
  - Browser / SSR user client: `@supabase/ssr` + anon key (`src/lib/supabase/client.ts`, `server.ts`).
  - Server admin: service role (`src/lib/supabase/admin.ts`) for form submit, workspace provision, Airtable sync upserts.
- Without Supabase env vars, app runs in **local mode** (Zustand + seed/demo data; no cloud).

### Domain model (app types)

`workspaces` → `bases` → `tf_tables` (fields/views as JSONB) → `tf_records` (values JSONB)  
Forms: `tf_forms` linked to `base_id` + `table_id`.  
Membership: `workspace_members` (+ `profiles` on `auth.users`).

Shared org workspace id used in code: **`ws-reawaken`** (`SHARED_WORKSPACE_ID` / `DEMO_WORKSPACE`).

### Schema — paste of migrations (verbatim)

#### `supabase/migrations/001_initial_schema.sql`

```sql
-- TableFlow initial schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "pgcrypto";

-- Workspaces
create table if not exists workspaces (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

-- Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  avatar_color text not null default '#2563eb',
  created_at timestamptz not null default now()
);

-- Workspace membership
create table if not exists workspace_members (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('owner', 'admin', 'editor', 'commenter', 'viewer')),
  avatar_color text not null default '#2563eb',
  status text not null default 'active' check (status in ('active', 'pending')),
  invited_at timestamptz not null default now(),
  unique (workspace_id, email)
);

-- Bases
create table if not exists bases (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#6366f1',
  icon text,
  created_at timestamptz not null default now()
);

-- Tables (tf_tables avoids reserved word "tables")
create table if not exists tf_tables (
  id text primary key,
  base_id text not null references bases(id) on delete cascade,
  name text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  views jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Records
create table if not exists tf_records (
  id text primary key,
  table_id text not null references tf_tables(id) on delete cascade,
  values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Forms
create table if not exists tf_forms (
  id text primary key,
  table_id text not null references tf_tables(id) on delete cascade,
  base_id text not null references bases(id) on delete cascade,
  name text not null,
  description text,
  submit_button_text text,
  success_message text,
  field_ids jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_workspace_members_user on workspace_members(user_id);
create index if not exists idx_workspace_members_workspace on workspace_members(workspace_id);
create index if not exists idx_bases_workspace on bases(workspace_id);
create index if not exists idx_tf_tables_base on tf_tables(base_id);
create index if not exists idx_tf_records_table on tf_records(table_id);
create index if not exists idx_tf_forms_table on tf_forms(table_id);
create index if not exists idx_tf_forms_published on tf_forms(id) where published = true;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#2563eb')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: check workspace membership
create or replace function public.is_workspace_member(ws_id text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.workspace_role(ws_id text)
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from workspace_members
  where workspace_id = ws_id and user_id = auth.uid() and status = 'active'
  limit 1;
$$;

create or replace function public.can_edit(ws_id text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.workspace_role(ws_id) in ('owner', 'admin', 'editor'), false);
$$;

-- RLS
alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table workspace_members enable row level security;
alter table bases enable row level security;
alter table tf_tables enable row level security;
alter table tf_records enable row level security;
alter table tf_forms enable row level security;

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Workspaces
create policy "Members can view workspace" on workspaces for select using (public.is_workspace_member(id));
create policy "Owners can update workspace" on workspaces for update using (public.workspace_role(id) = 'owner');
create policy "Authenticated users can create workspace" on workspaces for insert with check (auth.uid() is not null);

-- Workspace members
create policy "Members can view team" on workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "Admins can manage team" on workspace_members for all using (
  public.workspace_role(workspace_id) in ('owner', 'admin')
);
create policy "Users can insert self as owner" on workspace_members for insert with check (
  user_id = auth.uid() and role = 'owner'
);

-- Bases
create policy "Members can view bases" on bases for select using (public.is_workspace_member(workspace_id));
create policy "Editors can manage bases" on bases for all using (public.can_edit(workspace_id));

-- Tables
create policy "Members can view tables" on tf_tables for select using (
  exists (select 1 from bases b where b.id = base_id and public.is_workspace_member(b.workspace_id))
);
create policy "Editors can manage tables" on tf_tables for all using (
  exists (select 1 from bases b where b.id = base_id and public.can_edit(b.workspace_id))
);

-- Records
create policy "Members can view records" on tf_records for select using (
  exists (
    select 1 from tf_tables t
    join bases b on b.id = t.base_id
    where t.id = table_id and public.is_workspace_member(b.workspace_id)
  )
);
create policy "Editors can manage records" on tf_records for all using (
  exists (
    select 1 from tf_tables t
    join bases b on b.id = t.base_id
    where t.id = table_id and public.can_edit(b.workspace_id)
  )
);

-- Forms (published forms readable by anyone for embed preview metadata)
create policy "Anyone can view published forms" on tf_forms for select using (published = true);
create policy "Members can view all forms" on tf_forms for select using (
  exists (select 1 from bases b where b.id = base_id and public.is_workspace_member(b.workspace_id))
);
create policy "Editors can manage forms" on tf_forms for all using (
  exists (select 1 from bases b where b.id = base_id and public.can_edit(b.workspace_id))
);

-- Realtime: run supabase/migrations/002_enable_realtime.sql after this file
```

#### `supabase/migrations/002_enable_realtime.sql`

```sql
-- Enable Supabase Realtime for instant sync across clients
-- Run after 001_initial_schema.sql

-- Full replica identity so DELETE events include old row data
alter table bases replica identity full;
alter table tf_tables replica identity full;
alter table tf_records replica identity full;
alter table tf_forms replica identity full;
alter table workspace_members replica identity full;

-- Add tables to the Realtime publication
alter publication supabase_realtime add table bases;
alter publication supabase_realtime add table tf_tables;
alter publication supabase_realtime add table tf_records;
alter publication supabase_realtime add table tf_forms;
alter publication supabase_realtime add table workspace_members;

-- Allow authenticated users to receive Realtime broadcasts (RLS still filters rows)
grant usage on schema public to authenticated;
grant select on bases to authenticated;
grant select on tf_tables to authenticated;
grant select on tf_records to authenticated;
grant select on tf_forms to authenticated;
grant select on workspace_members to authenticated;
```

**Note:** Production also uses Command Center’s `profiles` / `feature_access` tables (outside these migrations) for org access. Tables code joins users into `ws-reawaken` via `ensureSharedWorkspaceAccess` for `@reawakenusa.org` emails.

---

## 4. Auth model

- **Provider:** Supabase Auth.
- **Methods:** email/password (`/login`, `/signup`) and **Google OAuth** (login page).
- **Session storage:** `@supabase/ssr` **cookies** (Next middleware refreshes session).
- **Command Center bridge:** when mounted same-origin under CC, `CommandCenterAuthBridge` / `syncCommandCenterSession` copies CC’s Supabase session from `localStorage` into Tables cookies.
- **Middleware gate** (`src/middleware.ts`): if Supabase configured and no user → redirect to `/login`, except public paths below.
- **Public / unauthenticated:**
  - `/login`, `/signup`, `/auth/*`
  - `/embed/[formId]`
  - `/api/forms/[formId]` (GET published form + POST submit)
  - `/api/health`
- **Staff gating extras:** Airtable sync API requires authenticated user with `@reawakenusa.org` email. Org users are auto-joined to shared workspace `ws-reawaken`.
- **Team invites UI removed** — `/settings/team` redirects; do not treat in-app team roster as source of truth.

Supabase Auth must allow redirect URLs for:
- `https://<tables-host>/auth/callback`
- With basePath: `https://reawakencommandcenter.com/apps/tableflow/auth/callback`
- Wildcards already used in CC project: `https://reawakencommandcenter.com/**`

---

## 5. Third-party services & secrets

| Service | Purpose | Env vars |
|---------|---------|----------|
| **Supabase** | DB, Auth, Realtime | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Google OAuth** | Sign-in (configured in Supabase Auth providers, not as a Next env) | (Supabase dashboard) |
| **Vercel** | Hosting for project `tableflow` | Project env vars (not in repo) |
| **Airtable** | Optional direct import of CC source tables | `AIRTABLE_TOKEN` (+ optional `AIRTABLE_PASTORS_TOKEN`, `AIRTABLE_VOLUNTEERS_TOKEN`) |
| **Command Center edge functions** | Fallback Airtable read path when no PAT | Same Supabase URL; uses user JWT + anon key at runtime |

**Do not commit** `.env.local`, `.env.vercel`, or any PAT/service keys. `.gitignore` ignores `.env*` but allows `.env.example`.

---

## 6. Server-side code inventory

| Unit | Path | Role |
|------|------|------|
| Middleware | `src/middleware.ts` | Auth redirect / session cookie refresh |
| Health API | `src/app/api/health/route.ts` | Liveness + env presence flags |
| Workspace API | `src/app/api/workspace/route.ts` | Ensure membership, return workspace payload |
| Forms API | `src/app/api/forms/[formId]/route.ts` | GET published form; POST submit (admin client, IP rate limit 5/min) |
| Airtable sync API | `src/app/api/airtable/sync/route.ts` | GET catalog; POST merge into shared workspace |
| Auth callback | `src/app/auth/callback/route.ts` | OAuth code exchange |
| Airtable sync script | `scripts/sync-airtable.ts` | CLI one-shot import (service role + `AIRTABLE_TOKEN`) |
| In-memory rate limit | `src/lib/rate-limit.ts` | Used by form POST (not durable across instances) |
| Server actions | — | **None** |
| Edge functions in this repo | — | **None** (CC repo has `airtable-*` functions separately) |
| Cron jobs in this repo | — | **None** |

---

## 7. Local run (clean clone)

```bash
git clone <repo-url>
cd tableflow   # or whatever the clone directory is named
git checkout handoff

npm install

cp .env.example .env.local
# Fill at least NEXT_PUBLIC_APP_URL=http://localhost:3000
# For cloud mode, also fill Supabase URL + anon + service role
# Leave NEXT_PUBLIC_BASE_PATH empty for local root hosting

# One-time: in Supabase SQL editor, run
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_enable_realtime.sql
# Enable Google provider + redirect URLs if using OAuth

npm run dev
# open http://localhost:3000
```

**Without Supabase env:** app loads in local/demo mode (middleware skips auth).  
**With Supabase:** sign in; `@reawakenusa.org` users join `ws-reawaken`.  
**Airtable merge:** Settings → Sync, or `npx tsx scripts/sync-airtable.ts` with service role + `AIRTABLE_TOKEN`.

**Production under Command Center:** set `NEXT_PUBLIC_BASE_PATH=/apps/tableflow` and `NEXT_PUBLIC_APP_URL=https://reawakencommandcenter.com`, plus CC reverse-proxy rewrite `/apps/tableflow` → Tables Vercel deployment.

---

## 8. Half-finished / stubbed / known issues (blunt)

1. **Private handoff repo creation failed** from the agent (`gh` / GitHub App: `createRepository` 403). Code may live on `handoff` of `MikelCrump/MikelCrump` until `MikelCrump/tableflow` exists and is granted push.
2. **Not a full Airtable clone.** Grid editing, forms, CSV, and sync exist; no Airtable-parity views (kanban UI is typed but not a real product view), formulas, attachments pipeline, automations, or comments.
3. **Team / invites are dead.** UI removed; `/settings/team` redirects. `workspace_members` still in schema/store but org access is “CC users + shared workspace,” not invite emails.
4. **Seed / demo data still exists** (`src/lib/seed-data.ts`) and may seed empty workspaces. Pastor Airtable table was empty at last sync; leftover test form rows possible in `tbl-pastors`.
5. **Airtable pastors source empty** at last merge; other sources imported. Token was pasted in chat historically — **rotate `AIRTABLE_TOKEN`**.
6. **Rate limiting is in-memory** — ineffective across serverless instances / cold starts.
7. **Form POST uses service role** — intentional for public embeds, but bypasses RLS; validate field payloads more strictly if hardening.
8. **Command Center integration is split:** Tables lives in this repo; CC Tools tile / `vercel.json` rewrite lived in a **private CC codebase** and was deployed via Vercel from a recovered copy — **not** committed to a GitHub repo this agent can push. Merging “into another app” must re-create those rewrites + auth bridge assumptions.
9. **Branding inconsistency:** UI says “Tables”; package/repo historically “tableflow”; URL path still `/apps/tableflow`.
10. **Theme:** site toggle + `cc-theme` sync work; some older pages (login/signup) were lightly tokenized late — spot-check. Form **live preview** intentionally stays a light surface.
11. **`main` on origin may lag** feature branches (`cursor/tables-cc-polish-6b95` / `handoff` are ahead of `main` which stopped at production-realtime).
12. **No automated test suite** of note; no CI required by this package.json.
13. **Middleware deprecation warning** on Next 16 (“use proxy instead”) — still works as middleware today.
14. **Kanban / multi-view:** `ViewType` includes `"kanban"` but product UI is grid + form only.
15. **Signup** exists but production ops expect Google via Command Center — email signup may not match org policy.

---

## 9. Airtable source catalog (for sync)

Defined in `src/lib/airtable/catalog.ts` (base/table ids used by Command Center):

| Key | Tables base id | Airtable base (default) |
|-----|----------------|-------------------------|
| pastors | `base-pastors` / `tbl-pastors` | `appZNV1eZYtXLL2fl` |
| events | `base-events` / `tbl-events` | `app1kgBEQ6rLPjUIC` |
| volunteers | `base-volunteers` / `tbl-volunteers` | `appXqtm3LyLrHzFc4` |
| speaker_requests | `base-speakers` / `tbl-speaker-requests` | `app01STPbqmgj6Hfs` |
| contact_submissions | `base-inbound` / `tbl-contact` | `app1kgBEQ6rLPjUIC` |
| chapter_applications | `base-inbound` / `tbl-chapters` | `apphnGWTt9ruId8Wl` |

---

## 10. Contact / ownership context

- Owner: Mikel Crump (Operations), Reawaken USA  
- Related app: Reawaken Command Center (`reawakencommandcenter.com`)  
- This handoff document was generated for merging TableFlow into another app — do not assume Vercel project changes were made as part of the handoff steps.
