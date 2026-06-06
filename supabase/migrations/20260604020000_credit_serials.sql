-- Carbon unit serial numbers (traceability / anti-double-counting).
--
-- Every issuance (VER), trade (transaction) and retirement gets a unique,
-- human-readable serial. Serials make each carbon unit traceable through its
-- lifecycle (issued → traded → retired) as required for a credible registry.
--
-- Format: <PREFIX>-<YEAR>-<8-digit sequence>, e.g. ECO-VER-2026-00000042.

create sequence if not exists public.credit_serial_seq;

create or replace function public.generate_credit_serial(p_prefix text)
returns text
language sql
volatile
set search_path = public
as $$
  select p_prefix || '-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.credit_serial_seq')::text, 8, '0')
$$;

-- Generic BEFORE INSERT trigger: assigns a serial (prefix from trigger arg).
create or replace function public.set_credit_serial()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.serial_number is null then
    new.serial_number := public.generate_credit_serial(tg_argv[0]);
  end if;
  return new;
end;
$$;

-- ── verified_emission_reductions ──
alter table public.verified_emission_reductions
  add column if not exists serial_number text;

drop trigger if exists trg_ver_serial on public.verified_emission_reductions;
create trigger trg_ver_serial
before insert on public.verified_emission_reductions
for each row execute function public.set_credit_serial('ECO-VER');

-- ── credit_transactions ──
alter table public.credit_transactions
  add column if not exists serial_number text;

drop trigger if exists trg_txn_serial on public.credit_transactions;
create trigger trg_txn_serial
before insert on public.credit_transactions
for each row execute function public.set_credit_serial('ECO-TXN');

-- ── credit_retirements ──
alter table public.credit_retirements
  add column if not exists serial_number text;

alter table public.credit_retirements
  add column if not exists status text default 'completed';

drop trigger if exists trg_ret_serial on public.credit_retirements;
create trigger trg_ret_serial
before insert on public.credit_retirements
for each row execute function public.set_credit_serial('ECO-RET');

-- Some base tables have a shared update_updated_at_column() trigger that sets
-- NEW.updated_at on every UPDATE. If the column is missing, the trigger errors
-- when we run the backfill below — so ensure updated_at exists first.
alter table public.verified_emission_reductions
  add column if not exists updated_at timestamptz default now();
alter table public.credit_transactions
  add column if not exists updated_at timestamptz default now();
alter table public.credit_retirements
  add column if not exists updated_at timestamptz default now();

-- Backfill existing rows so historical records are also traceable.
update public.verified_emission_reductions
  set serial_number = public.generate_credit_serial('ECO-VER')
  where serial_number is null;

update public.credit_transactions
  set serial_number = public.generate_credit_serial('ECO-TXN')
  where serial_number is null;

update public.credit_retirements
  set serial_number = public.generate_credit_serial('ECO-RET')
  where serial_number is null;

-- Enforce uniqueness once populated.
create unique index if not exists uq_ver_serial
  on public.verified_emission_reductions(serial_number);
create unique index if not exists uq_txn_serial
  on public.credit_transactions(serial_number);
create unique index if not exists uq_ret_serial
  on public.credit_retirements(serial_number);

grant execute on function public.generate_credit_serial(text) to authenticated;
