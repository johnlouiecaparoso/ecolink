-- MRV (Monitoring, Reporting, Verification) module.
--
-- Developers submit periodic monitoring reports with activity data + evidence.
-- The platform computes proposed emission reductions SERVER-SIDE (so the client
-- can never dictate a credit amount). A verifier reviews and approves Verified
-- Emission Reductions (VERs); only approved VERs mint carbon credits (handled
-- by the decouple/mint migration that follows this one).

-- ───────────────────────── helper: current user's role ─────────────────────
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- staff = verifier or admin (uses the existing role canonicaliser)
create or replace function public.is_mrv_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.canonicalize_notification_role(public.current_user_role()) in ('verifier', 'admin')
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_mrv_staff() to authenticated;

-- ───────────────────────── methodology factors ─────────────────────────────
-- Emission-reduction factor (tCO2e per unit of activity) per project type.
-- Prototype values aligned with the Philippine grid factor used by the carbon
-- calculator; tune these as official DENR/CCC methodologies are adopted.
create table if not exists public.methodology_factors (
  id uuid primary key default gen_random_uuid(),
  project_type text not null,
  metric_key text not null,
  label text not null,
  unit text not null,
  factor numeric not null,
  description text,
  created_at timestamptz not null default now(),
  unique (project_type, metric_key)
);

insert into public.methodology_factors (project_type, metric_key, label, unit, factor, description) values
  ('Biochar & Bio-briquettes', 'biochar_tonnes', 'Biochar produced', 'tonnes', 2.5, 'Carbon sequestered per tonne of biochar'),
  ('Biochar & Bio-briquettes', 'briquettes_tonnes', 'Bio-briquettes produced', 'tonnes', 1.5, 'Fossil fuel displaced per tonne of briquettes'),
  ('Biomass-to-Energy (WTE)', 'energy_kwh', 'Energy generated', 'kWh', 0.000532, 'Grid emissions displaced (PH grid 0.532 kgCO2e/kWh)'),
  ('Biomass-to-Energy (WTE)', 'waste_tonnes', 'Waste processed', 'tonnes', 0.45, 'Avoided landfill emissions per tonne of waste'),
  ('Reforestation & Agroforestry', 'area_hectares', 'Area under restoration', 'hectares', 5.0, 'Annual sequestration per hectare'),
  ('Reforestation & Agroforestry', 'trees_planted', 'Trees planted', 'trees', 0.02, 'Annual sequestration per surviving tree'),
  ('Renewable Energy', 'energy_kwh', 'Clean energy generated', 'kWh', 0.000532, 'Grid emissions displaced (PH grid 0.532 kgCO2e/kWh)'),
  ('Methane Avoidance', 'methane_tonnes', 'Methane captured/avoided', 'tonnes', 28.0, 'CH4 to CO2e (GWP 28)'),
  ('Methane Avoidance', 'waste_tonnes_diverted', 'Waste diverted', 'tonnes', 0.5, 'Avoided methane per tonne diverted'),
  ('Industrial Decarbonization', 'emissions_reduced_tco2e', 'Direct emissions reduced', 'tCO2e', 1.0, 'Directly measured reductions'),
  ('Industrial Decarbonization', 'energy_saved_kwh', 'Energy saved', 'kWh', 0.000532, 'Grid emissions avoided through efficiency'),
  ('Coastal & Watershed Protection', 'area_hectares', 'Area protected/restored', 'hectares', 8.0, 'Blue-carbon sequestration per hectare')
on conflict (project_type, metric_key) do nothing;

alter table public.methodology_factors enable row level security;

drop policy if exists methodology_factors_read on public.methodology_factors;
create policy methodology_factors_read on public.methodology_factors
  for select to authenticated using (true);

-- ───────────────────────── monitoring reports ──────────────────────────────
create table if not exists public.monitoring_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  period_type text not null default 'yearly' check (period_type in ('quarterly', 'yearly')),
  period_start date,
  period_end date,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  proposed_vers numeric not null default 0,
  notes text,
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_monitoring_reports_project on public.monitoring_reports(project_id);
create index if not exists idx_monitoring_reports_status on public.monitoring_reports(status);

create table if not exists public.monitoring_activity_data (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monitoring_reports(id) on delete cascade,
  metric_key text not null,
  value numeric not null default 0,
  unit text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_data_report on public.monitoring_activity_data(report_id);

create table if not exists public.monitoring_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monitoring_reports(id) on delete cascade,
  file_url text not null,
  file_type text,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists idx_evidence_report on public.monitoring_evidence(report_id);

-- ───────────────────────── verified emission reductions ────────────────────
create table if not exists public.verified_emission_reductions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monitoring_reports(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  approved_quantity numeric not null default 0,
  vintage_year integer,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_vers_project on public.verified_emission_reductions(project_id);
create index if not exists idx_vers_report on public.verified_emission_reductions(report_id);

-- ───────────────────────── helpers for RLS scoping ─────────────────────────
-- true if the current user owns the project that a report belongs to
create or replace function public.owns_report_project(p_report_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.monitoring_reports r
    join public.projects p on p.id = r.project_id
    where r.id = p_report_id and p.user_id = auth.uid()
  )
$$;

grant execute on function public.owns_report_project(uuid) to authenticated;

-- ───────────────────────── RLS policies ────────────────────────────────────
alter table public.monitoring_reports enable row level security;
alter table public.monitoring_activity_data enable row level security;
alter table public.monitoring_evidence enable row level security;
alter table public.verified_emission_reductions enable row level security;

-- monitoring_reports: project owner (developer) or staff
drop policy if exists mrv_reports_select on public.monitoring_reports;
create policy mrv_reports_select on public.monitoring_reports
  for select to authenticated
  using (
    public.is_mrv_staff()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists mrv_reports_insert on public.monitoring_reports;
create policy mrv_reports_insert on public.monitoring_reports
  for insert to authenticated
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists mrv_reports_update on public.monitoring_reports;
create policy mrv_reports_update on public.monitoring_reports
  for update to authenticated
  using (
    public.is_mrv_staff()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  )
  with check (
    public.is_mrv_staff()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists mrv_reports_delete on public.monitoring_reports;
create policy mrv_reports_delete on public.monitoring_reports
  for delete to authenticated
  using (
    public.is_mrv_staff()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- activity data + evidence: scoped through the parent report
drop policy if exists mrv_activity_all on public.monitoring_activity_data;
create policy mrv_activity_all on public.monitoring_activity_data
  for all to authenticated
  using (public.is_mrv_staff() or public.owns_report_project(report_id))
  with check (public.is_mrv_staff() or public.owns_report_project(report_id));

drop policy if exists mrv_evidence_all on public.monitoring_evidence;
create policy mrv_evidence_all on public.monitoring_evidence
  for all to authenticated
  using (public.is_mrv_staff() or public.owns_report_project(report_id))
  with check (public.is_mrv_staff() or public.owns_report_project(report_id));

-- VERs: readable by project owner + staff; only staff may write
drop policy if exists mrv_vers_select on public.verified_emission_reductions;
create policy mrv_vers_select on public.verified_emission_reductions
  for select to authenticated
  using (
    public.is_mrv_staff()
    or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

drop policy if exists mrv_vers_write on public.verified_emission_reductions;
create policy mrv_vers_write on public.verified_emission_reductions
  for all to authenticated
  using (public.is_mrv_staff())
  with check (public.is_mrv_staff());

-- ───────────────────────── server-side ER calculation ──────────────────────
-- Computes proposed emission reductions for a report from its activity data and
-- the project's methodology factors, stores it on the report, and returns it.
create or replace function public.calculate_report_vers(p_report_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_type text;
  v_total numeric := 0;
begin
  select p.category
    into v_project_type
  from public.monitoring_reports r
  join public.projects p on p.id = r.project_id
  where r.id = p_report_id;

  if v_project_type is null then
    return 0;
  end if;

  select coalesce(sum(ad.value * mf.factor), 0)
    into v_total
  from public.monitoring_activity_data ad
  join public.methodology_factors mf
    on mf.metric_key = ad.metric_key
   and mf.project_type = v_project_type
  where ad.report_id = p_report_id;

  update public.monitoring_reports
    set proposed_vers = v_total,
        updated_at = now()
  where id = p_report_id;

  return v_total;
end;
$$;

grant execute on function public.calculate_report_vers(uuid) to authenticated;
