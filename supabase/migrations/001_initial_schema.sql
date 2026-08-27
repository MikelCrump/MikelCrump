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
