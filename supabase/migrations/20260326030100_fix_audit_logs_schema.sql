create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete set null,
  action text not null,
  resource_type text null,
  resource_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text null,
  user_agent text null,
  created_at timestamptz not null default now()
);

alter table public.audit_logs add column if not exists resource_type text;
alter table public.audit_logs add column if not exists resource_id uuid;
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists ip_address text;
alter table public.audit_logs add column if not exists user_agent text;
alter table public.audit_logs add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'table_name'
  ) then
    execute '
      update public.audit_logs
      set resource_type = coalesce(resource_type, table_name)
      where resource_type is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'record_id'
  ) then
    execute '
      update public.audit_logs
      set resource_id = coalesce(resource_id, record_id)
      where resource_id is null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'old_values'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'new_values'
  ) then
    execute '
      update public.audit_logs
      set metadata = coalesce(
        nullif(metadata, ''{}''::jsonb),
        jsonb_strip_nulls(jsonb_build_object(''old_values'', old_values, ''new_values'', new_values)),
        ''{}''::jsonb
      )
    ';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'old_values'
  ) then
    execute '
      update public.audit_logs
      set metadata = coalesce(
        nullif(metadata, ''{}''::jsonb),
        jsonb_strip_nulls(jsonb_build_object(''old_values'', old_values)),
        ''{}''::jsonb
      )
    ';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'audit_logs'
      and column_name = 'new_values'
  ) then
    execute '
      update public.audit_logs
      set metadata = coalesce(
        nullif(metadata, ''{}''::jsonb),
        jsonb_strip_nulls(jsonb_build_object(''new_values'', new_values)),
        ''{}''::jsonb
      )
    ';
  end if;
end
$$;

alter table public.audit_logs enable row level security;

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;
create policy "Authenticated users can insert audit logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    user_id is null
    or auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );
