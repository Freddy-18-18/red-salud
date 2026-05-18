-- =============================================================================
-- Admin Panel Schema — internal control center
-- =============================================================================
-- This migration introduces the schema required by apps/admin/web.
-- The admin panel is the ONLY app that legitimately needs cross-domain visibility,
-- so we keep its tables isolated under explicit names and lock them down with RLS.
--
-- Design rules:
--   * Roles are NOT stored on profiles.role — that column already encodes the
--     domain role (paciente, medico, etc.). Instead we have a separate table
--     admin_roles that grants internal-team capabilities orthogonally.
--   * EVERY admin action lands in admin_audit_log. The service-role key is the
--     only thing that can write here, and writes happen exclusively through the
--     audit wrapper in lib/audit/withAudit.
--   * RLS is enabled on both tables. No anon access. Reads only via service role
--     or via authenticated users that already proved they are super_admin.

-- -----------------------------------------------------------------------------
-- admin_roles
-- -----------------------------------------------------------------------------
create type public.admin_role_type as enum (
  'super_admin',  -- full access, can grant/revoke other admin roles
  'support',      -- can view users, impersonate (logged), reset password
  'finance',      -- can view payments, payouts, invoices, revenue dashboards
  'ops',          -- can manage feature flags, announcements, system config
  'read_only'     -- dashboards only, no writes
);

create table if not exists public.admin_roles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  role_type       public.admin_role_type not null,
  granted_by      uuid references auth.users(id) on delete set null,
  granted_at      timestamptz not null default now(),
  revoked_at      timestamptz,
  notes           text,
  unique (user_id, role_type)
);

create index if not exists admin_roles_user_id_idx
  on public.admin_roles (user_id)
  where revoked_at is null;

create index if not exists admin_roles_role_type_idx
  on public.admin_roles (role_type)
  where revoked_at is null;

comment on table public.admin_roles is
  'Internal-team roles for the Red Salud admin panel. Decoupled from profiles.role.';

-- Helper function: is the given user an active admin (any role)?
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = uid
      and revoked_at is null
  );
$$;

-- Helper function: does the given user hold the given role right now?
create or replace function public.has_admin_role(uid uuid, role public.admin_role_type)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = uid
      and role_type = role
      and revoked_at is null
  );
$$;

-- -----------------------------------------------------------------------------
-- admin_audit_log
-- -----------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id              bigserial primary key,
  occurred_at     timestamptz not null default now(),
  actor_user_id   uuid references auth.users(id) on delete set null,
  actor_email     text,
  actor_role      public.admin_role_type,
  action          text not null,           -- e.g. 'user.view', 'user.impersonate', 'flag.toggle'
  resource_type   text,                    -- e.g. 'profile', 'appointment', 'feature_flag'
  resource_id     text,                    -- stringified id of the resource
  payload         jsonb,                   -- arbitrary context (filters used, fields changed)
  ip_address      inet,
  user_agent      text,
  request_id      text,                    -- correlate multiple log lines for one request
  status          text not null default 'success', -- 'success' | 'denied' | 'error'
  error_message   text
);

create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_user_id, occurred_at desc);

create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log (action, occurred_at desc);

create index if not exists admin_audit_log_resource_idx
  on public.admin_audit_log (resource_type, resource_id, occurred_at desc);

create index if not exists admin_audit_log_occurred_at_idx
  on public.admin_audit_log (occurred_at desc);

comment on table public.admin_audit_log is
  'Append-only audit trail for every admin-panel action. Writes only via service role.';

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.admin_roles      enable row level security;
alter table public.admin_audit_log  enable row level security;

-- admin_roles: super_admin can read all. Each admin can read their own row.
-- Writes are NEVER allowed from authenticated/anon — only service role.
drop policy if exists admin_roles_select_self on public.admin_roles;
create policy admin_roles_select_self
  on public.admin_roles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists admin_roles_select_super on public.admin_roles;
create policy admin_roles_select_super
  on public.admin_roles for select
  to authenticated
  using (public.has_admin_role(auth.uid(), 'super_admin'));

-- admin_audit_log: super_admin can read all. Other admins can read their own actions.
drop policy if exists admin_audit_log_select_self on public.admin_audit_log;
create policy admin_audit_log_select_self
  on public.admin_audit_log for select
  to authenticated
  using (actor_user_id = auth.uid());

drop policy if exists admin_audit_log_select_super on public.admin_audit_log;
create policy admin_audit_log_select_super
  on public.admin_audit_log for select
  to authenticated
  using (public.has_admin_role(auth.uid(), 'super_admin'));

-- No insert/update/delete policies for authenticated/anon → service role only.

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
revoke all on public.admin_roles      from anon;
revoke all on public.admin_audit_log  from anon;
grant select on public.admin_roles      to authenticated;
grant select on public.admin_audit_log  to authenticated;
