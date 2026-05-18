-- =============================================================================
-- Analytics + Metrics + Alerts schema
-- =============================================================================
-- Powers the admin panel dashboards, cross-app analytics, automated alerts,
-- and the AI daily digest. Designed for a one-person company that needs
-- automation to scale beyond what one human can monitor.
--
-- Design rules:
--   * analytics_events is append-only and high-volume. RLS denies all reads
--     to authenticated/anon — only service role queries it.
--   * Inserts are allowed for authenticated users (so apps can emit events).
--     Anonymous events can be emitted via service role from a server route.
--   * Pre-aggregations (metrics_daily_*) are NEVER queried from product code
--     except by the admin panel. They are refreshed by Edge Functions on cron.
--   * No PII in payload — IDs only. Apps that emit must enforce this.

-- -----------------------------------------------------------------------------
-- 1. analytics_events — raw event stream
-- -----------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id            bigserial primary key,
  occurred_at   timestamptz not null default now(),
  event_name    text not null,
  app_source    text not null,
  actor_id      uuid,
  actor_role    text,
  session_id    text,
  resource_type text,
  resource_id   text,
  payload       jsonb,
  ip_address    inet,
  user_agent    text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text
);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_actor_idx
  on public.analytics_events (actor_id, occurred_at desc);
create index if not exists analytics_events_app_source_idx
  on public.analytics_events (app_source, occurred_at desc);
create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

comment on table public.analytics_events is
  'High-volume append-only event stream. NEVER store PII in payload — IDs only.';

alter table public.analytics_events enable row level security;

-- Authenticated users can insert their OWN events (actor_id must match auth.uid())
drop policy if exists analytics_events_insert_own on public.analytics_events;
create policy analytics_events_insert_own
  on public.analytics_events for insert
  to authenticated
  with check (actor_id = auth.uid() or actor_id is null);

-- Anonymous: cannot insert directly. Apps proxy anonymous events via server routes.
-- No select policies → only service role can read.

revoke all on public.analytics_events from anon;
grant insert on public.analytics_events to authenticated;
grant usage, select on sequence public.analytics_events_id_seq to authenticated;

-- -----------------------------------------------------------------------------
-- 2. metrics_daily_global — global KPIs by day
-- -----------------------------------------------------------------------------
create table if not exists public.metrics_daily_global (
  date                  date primary key,
  total_users           integer not null default 0,
  new_users             integer not null default 0,
  active_users          integer not null default 0,
  mau                   integer not null default 0,
  dau                   integer not null default 0,
  total_appointments    integer not null default 0,
  appointments_completed integer not null default 0,
  appointments_cancelled integer not null default 0,
  appointments_no_show  integer not null default 0,
  revenue_usd           numeric(14,2) not null default 0,
  revenue_ves           numeric(18,2) not null default 0,
  new_payments          integer not null default 0,
  refreshed_at          timestamptz not null default now()
);

create index if not exists metrics_daily_global_date_idx
  on public.metrics_daily_global (date desc);

alter table public.metrics_daily_global enable row level security;
revoke all on public.metrics_daily_global from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. metrics_daily_by_app — per-app activity by day
-- -----------------------------------------------------------------------------
create table if not exists public.metrics_daily_by_app (
  date          date not null,
  app_source    text not null,
  sessions      integer not null default 0,
  unique_users  integer not null default 0,
  events        integer not null default 0,
  errors        integer not null default 0,
  refreshed_at  timestamptz not null default now(),
  primary key (date, app_source)
);

create index if not exists metrics_daily_by_app_date_idx
  on public.metrics_daily_by_app (date desc);

alter table public.metrics_daily_by_app enable row level security;
revoke all on public.metrics_daily_by_app from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. metrics_doctor_performance — per-doctor monthly snapshot
-- -----------------------------------------------------------------------------
create table if not exists public.metrics_doctor_performance (
  doctor_id           uuid not null references auth.users(id) on delete cascade,
  month               date not null,            -- first day of the month
  appointments_count  integer not null default 0,
  completed           integer not null default 0,
  cancelled           integer not null default 0,
  no_show             integer not null default 0,
  revenue_usd         numeric(14,2) not null default 0,
  revenue_ves         numeric(18,2) not null default 0,
  avg_rating          numeric(3,2),
  reviews_count       integer not null default 0,
  new_patients        integer not null default 0,
  refreshed_at        timestamptz not null default now(),
  primary key (doctor_id, month)
);

create index if not exists metrics_doctor_performance_month_idx
  on public.metrics_doctor_performance (month desc);

alter table public.metrics_doctor_performance enable row level security;
revoke all on public.metrics_doctor_performance from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. system_alerts — automated alerts from cron rules
-- -----------------------------------------------------------------------------
create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');

create table if not exists public.system_alerts (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  rule_name     text not null,
  severity      public.alert_severity not null,
  message       text not null,
  payload       jsonb,
  resolved_at   timestamptz,
  resolved_by   uuid references auth.users(id) on delete set null,
  resolution_notes text
);

create index if not exists system_alerts_unresolved_idx
  on public.system_alerts (created_at desc)
  where resolved_at is null;
create index if not exists system_alerts_rule_idx
  on public.system_alerts (rule_name, created_at desc);
create index if not exists system_alerts_severity_idx
  on public.system_alerts (severity, created_at desc)
  where resolved_at is null;

comment on table public.system_alerts is
  'Automated alerts from cron rules. Founder reads these instead of dashboards.';

alter table public.system_alerts enable row level security;

drop policy if exists system_alerts_select_admin on public.system_alerts;
create policy system_alerts_select_admin
  on public.system_alerts for select to authenticated
  using (public.is_admin(auth.uid()));

revoke all on public.system_alerts from anon;
grant select on public.system_alerts to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Aggregation function: refresh_metrics_daily_global(target_date)
-- -----------------------------------------------------------------------------
create or replace function public.refresh_metrics_daily_global(target_date date default current_date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  day_start timestamptz := target_date::timestamptz at time zone 'America/Caracas';
  day_end   timestamptz := (target_date + 1)::timestamptz at time zone 'America/Caracas';
  mau_start timestamptz := (target_date - interval '30 days')::timestamptz;
  total_users_count int;
  new_users_count int;
  active_users_count int;
  mau_count int;
  dau_count int;
  appt_total int;
  appt_completed int;
  appt_cancelled int;
  appt_no_show int;
  rev_usd numeric;
  rev_ves numeric;
  new_pay int;
begin
  select count(*) into total_users_count
    from public.profiles
   where created_at < day_end and (deleted_at is null or deleted_at >= day_end);

  select count(*) into new_users_count
    from public.profiles
   where created_at >= day_start and created_at < day_end;

  select count(distinct actor_id) into active_users_count
    from public.analytics_events
   where occurred_at >= day_start and occurred_at < day_end and actor_id is not null;

  select count(distinct actor_id) into mau_count
    from public.analytics_events
   where occurred_at >= mau_start and occurred_at < day_end and actor_id is not null;

  dau_count := active_users_count;

  select
    count(*) filter (where true),
    count(*) filter (where status = 'completed'),
    count(*) filter (where status = 'cancelled'),
    count(*) filter (where status = 'no_show')
  into appt_total, appt_completed, appt_cancelled, appt_no_show
  from public.appointments
  where scheduled_at >= day_start and scheduled_at < day_end;

  select
    coalesce(sum(amount) filter (where currency = 'USD' and status = 'approved'), 0),
    coalesce(sum(amount) filter (where currency = 'VES' and status = 'approved'), 0),
    count(*) filter (where status = 'approved')
  into rev_usd, rev_ves, new_pay
  from public.payments
  where created_at >= day_start and created_at < day_end;

  insert into public.metrics_daily_global (
    date, total_users, new_users, active_users, mau, dau,
    total_appointments, appointments_completed, appointments_cancelled, appointments_no_show,
    revenue_usd, revenue_ves, new_payments, refreshed_at
  ) values (
    target_date, total_users_count, new_users_count, active_users_count, mau_count, dau_count,
    appt_total, appt_completed, appt_cancelled, appt_no_show,
    rev_usd, rev_ves, new_pay, now()
  )
  on conflict (date) do update set
    total_users            = excluded.total_users,
    new_users              = excluded.new_users,
    active_users           = excluded.active_users,
    mau                    = excluded.mau,
    dau                    = excluded.dau,
    total_appointments     = excluded.total_appointments,
    appointments_completed = excluded.appointments_completed,
    appointments_cancelled = excluded.appointments_cancelled,
    appointments_no_show   = excluded.appointments_no_show,
    revenue_usd            = excluded.revenue_usd,
    revenue_ves            = excluded.revenue_ves,
    new_payments           = excluded.new_payments,
    refreshed_at           = excluded.refreshed_at;
end;
$$;

-- -----------------------------------------------------------------------------
-- 7. Aggregation function: refresh_metrics_daily_by_app(target_date)
-- -----------------------------------------------------------------------------
create or replace function public.refresh_metrics_daily_by_app(target_date date default current_date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  day_start timestamptz := target_date::timestamptz at time zone 'America/Caracas';
  day_end   timestamptz := (target_date + 1)::timestamptz at time zone 'America/Caracas';
begin
  insert into public.metrics_daily_by_app (date, app_source, sessions, unique_users, events, errors, refreshed_at)
  select
    target_date,
    app_source,
    count(distinct session_id) filter (where session_id is not null),
    count(distinct actor_id)    filter (where actor_id is not null),
    count(*),
    count(*) filter (where event_name = 'error.client'),
    now()
  from public.analytics_events
  where occurred_at >= day_start and occurred_at < day_end
  group by app_source
  on conflict (date, app_source) do update set
    sessions     = excluded.sessions,
    unique_users = excluded.unique_users,
    events       = excluded.events,
    errors       = excluded.errors,
    refreshed_at = excluded.refreshed_at;
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. live_kpis() — fast view-style function for the dashboard
-- -----------------------------------------------------------------------------
create or replace function public.live_kpis()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  today_start timestamptz := date_trunc('day', now() at time zone 'America/Caracas') at time zone 'America/Caracas';
  month_start timestamptz := date_trunc('month', now() at time zone 'America/Caracas') at time zone 'America/Caracas';
  thirty_days_ago timestamptz := now() - interval '30 days';
begin
  select jsonb_build_object(
    'total_users',        (select count(*) from public.profiles where deleted_at is null),
    'new_users_today',    (select count(*) from public.profiles where created_at >= today_start and deleted_at is null),
    'doctors_active_30d', (
      select count(distinct doctor_id)
      from public.appointments
      where created_at >= thirty_days_ago
    ),
    'doctors_sacs_verified', (select count(*) from public.profiles where role = 'medico' and sacs_verified = true and deleted_at is null),
    'appointments_today', (
      select count(*) from public.appointments
      where scheduled_at >= today_start and scheduled_at < today_start + interval '1 day'
    ),
    'appointments_pending', (
      select count(*) from public.appointments
      where scheduled_at >= now() and (status is null or status = 'pending' or status = 'confirmed')
    ),
    'revenue_month_usd',  (
      select coalesce(sum(amount), 0) from public.payments
      where created_at >= month_start and currency = 'USD' and status = 'approved'
    ),
    'revenue_month_ves',  (
      select coalesce(sum(amount), 0) from public.payments
      where created_at >= month_start and currency = 'VES' and status = 'approved'
    ),
    'alerts_open',        (select count(*) from public.system_alerts where resolved_at is null),
    'alerts_critical',    (select count(*) from public.system_alerts where resolved_at is null and severity in ('high','critical'))
  ) into result;
  return result;
end;
$$;

revoke execute on function public.live_kpis() from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 9. Grants for service_role to call refresh functions
-- -----------------------------------------------------------------------------
-- Service role bypasses RLS; functions are SECURITY DEFINER so they always run with elevated rights.
grant execute on function public.refresh_metrics_daily_global(date) to service_role;
grant execute on function public.refresh_metrics_daily_by_app(date) to service_role;
grant execute on function public.live_kpis()                        to service_role;
