create table if not exists public.system_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  link text,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_system_notifications_user_created_at
  on public.system_notifications(user_id, created_at desc);

create index if not exists idx_system_notifications_user_unread
  on public.system_notifications(user_id, is_read)
  where is_read = false;

alter table public.system_notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.system_notifications;
create policy "Users can read own notifications"
  on public.system_notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.system_notifications;
create policy "Users can update own notifications"
  on public.system_notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated can insert notifications" on public.system_notifications;
create policy "Authenticated can insert notifications"
  on public.system_notifications for insert
  to authenticated
  with check (auth.uid() is not null);
