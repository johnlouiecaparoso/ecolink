-- Phase 6: LGU tools, host endorsements, project risk/feasibility scoring,
-- and organization profiles.

-- ───────────────────────── organization profiles ───────────────────────────
alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists organization_type text;
alter table public.profiles add column if not exists organization_address text;

-- ───────────────────────── project risk/feasibility scoring ─────────────────
alter table public.projects add column if not exists feasibility_score integer;
alter table public.projects add column if not exists social_impact_score integer;
alter table public.projects add column if not exists climate_risk_rating text;

-- ───────────────────────── role helper ─────────────────────────────────────
create or replace function public.is_lgu()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.canonicalize_notification_role(public.current_user_role()) = 'lgu_user'
$$;

grant execute on function public.is_lgu() to authenticated;

-- ───────────────────────── LGU emissions / diversion records ────────────────
create table if not exists public.lgu_emissions_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  municipality text,
  period_label text,
  population integer,
  waste_generated_tonnes numeric not null default 0,
  waste_diverted_tonnes numeric not null default 0,
  baseline_emissions_tco2e numeric not null default 0,
  avoided_emissions_tco2e numeric not null default 0,
  net_emissions_tco2e numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lgu_records_user on public.lgu_emissions_records(user_id);

alter table public.lgu_emissions_records enable row level security;

drop policy if exists lgu_records_select on public.lgu_emissions_records;
create policy lgu_records_select on public.lgu_emissions_records
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists lgu_records_insert on public.lgu_emissions_records;
create policy lgu_records_insert on public.lgu_emissions_records
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists lgu_records_update on public.lgu_emissions_records;
create policy lgu_records_update on public.lgu_emissions_records
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists lgu_records_delete on public.lgu_emissions_records;
create policy lgu_records_delete on public.lgu_emissions_records
  for delete to authenticated
  using (user_id = auth.uid());

-- ───────────────────────── host (LGU) endorsements ─────────────────────────
create table if not exists public.project_endorsements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  lgu_user_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('endorsed', 'declined')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, lgu_user_id)
);

create index if not exists idx_endorsements_project on public.project_endorsements(project_id);

alter table public.project_endorsements enable row level security;

-- Readable by LGUs, admins, and the project owner.
drop policy if exists endorsements_select on public.project_endorsements;
create policy endorsements_select on public.project_endorsements
  for select to authenticated
  using (
    public.is_admin()
    or public.is_lgu()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Only LGU users may endorse, and only as themselves.
drop policy if exists endorsements_insert on public.project_endorsements;
create policy endorsements_insert on public.project_endorsements
  for insert to authenticated
  with check (public.is_lgu() and lgu_user_id = auth.uid());

drop policy if exists endorsements_update on public.project_endorsements;
create policy endorsements_update on public.project_endorsements
  for update to authenticated
  using (public.is_lgu() and lgu_user_id = auth.uid())
  with check (public.is_lgu() and lgu_user_id = auth.uid());
