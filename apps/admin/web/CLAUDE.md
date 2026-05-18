# Red Salud Admin Web — Centro de Control Interno

## About This App
Internal control center for the Red Salud ecosystem. Used by ~5 internal employees (support, finance, ops). NEVER public-facing. Has cross-domain visibility intentionally — the only app allowed to bypass domain isolation, gated by `admin_roles` + service-role queries wrapped in audit.

## Tech Stack
- **Framework**: Next.js 15 (App Router) — port 3010
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 4
- **Auth**: Supabase Auth + custom `admin_roles` table (NOT `profiles.role`)
- **Data**: Supabase service role (server-only) for cross-domain reads, anon client only for the user's own session

## Commands
```bash
pnpm --filter @red-salud/admin-web dev         # http://localhost:3010
pnpm --filter @red-salud/admin-web build
pnpm --filter @red-salud/admin-web typecheck
pnpm --filter @red-salud/admin-web lint
```

## Required Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, never exposed to the browser
```

## Architecture
```
src/
  app/
    auth/login/                # public — login form
    dashboard/                 # protected — guarded by middleware + layout
    unauthorized/              # public — shown when user has no admin role
    api/health/                # public — health check
  lib/
    supabase/
      client.ts                # browser client (anon)
      server.ts                # SSR client (anon, with cookies)
      admin.ts                 # service-role client — server-only
    rbac/
      types.ts                 # AdminRoleType + Permission map
      check.ts                 # getAdminSession, requireAdmin, requirePermission
    audit/
      logger.ts                # writeAudit, withAudit
  components/
    shell/                     # sidebar, topbar
    dashboard/                 # KPI cards, charts
  middleware.ts                # session + admin_roles check on every request
```

## Security Rules — NON-NEGOTIABLE

1. **Service role NEVER reaches the browser.** Files that import `lib/supabase/admin` MUST be server-only (Server Components, Server Actions, Route Handlers). The `'server-only'` import in `admin.ts` enforces this at build time.
2. **Every cross-domain read/write MUST be wrapped via `withAudit`.** No direct calls to the admin client from product code.
3. **RBAC checks happen on the server, every time.** Never trust `permissions` in a Client Component for authorization — only for UI hiding.
4. **No anon access to admin tables.** RLS is enabled; only authenticated admins read their own rows, super_admin reads all. Writes only via service role.
5. **Audit log is append-only.** No delete/update policies. If you need to redact, do it through a documented procedure with a super_admin action that itself audits.
6. **Sessions are short.** 30-minute idle timeout (configured via `ADMIN_SESSION_TIMEOUT_MIN`).
7. **Headers**: `X-Robots-Tag: noindex, nofollow` is set on every response. The app must never be indexed.
8. **Deployment**: behind VPN / Cloudflare Access / IP allowlist. Subdomain `admin.*` only — never on the public marketing domain.

## Roles & Permissions

| Role        | What it sees / can do                                                |
|-------------|----------------------------------------------------------------------|
| super_admin | Everything. Grants/revokes admin roles.                              |
| support     | User search, impersonate (logged), reset password, cancel citas.     |
| finance     | Revenue, payouts, refunds, audit-of-finance-actions.                 |
| ops         | Feature flags, announcements, system settings, doctor management.    |
| read_only   | Dashboards only. No writes anywhere.                                 |

The full mapping is in `src/lib/rbac/types.ts → ROLE_PERMISSIONS`.

## Bootstrap (first super_admin)

`admin_roles` starts empty. To grant the first super admin:
1. Sign up the account through any client app (or directly in Supabase auth).
2. Run a one-shot SQL with the service role:
   ```sql
   insert into public.admin_roles (user_id, role_type, notes)
   values ('<auth.users.id>', 'super_admin', 'Bootstrap');
   ```
3. From that point on, all role grants happen from the admin UI (Empleados → Otorgar rol), and they are audited.

## Database

- Migration: `supabase/migrations/20260430000000_admin_panel_schema.sql`
- Tables: `admin_roles`, `admin_audit_log`
- Helper functions: `public.is_admin(uuid)`, `public.has_admin_role(uuid, admin_role_type)`

## Rules
- NEVER import from other apps. Use the service-role client to read cross-domain data, always wrapped in `withAudit`.
- The `user_role` enum on `profiles.role` does include `'admin'` (legacy from 2024), but it grants NOTHING in the admin panel. Source of truth for admin access is `public.admin_roles` only. Do not key any UI/RBAC off `profiles.role='admin'`.
- NEVER expose service role key in any `NEXT_PUBLIC_*` variable.
- NEVER skip the audit wrapper. If you find yourself thinking "this is just a read, no need to audit", you are wrong — admin reads of patient data ARE the most important thing to audit for HIPAA-style compliance.

## Verified DB facts (don't re-assume — these were validated against live DB on 2026-05-01)
- `payment_status` enum: `pending | approved | rejected` (NOT `succeeded|failed`).
- `appointment_status` enum: `pending | confirmed | completed | cancelled | waiting | in_progress | no_show` (NOT `scheduled`).
- `user_role` enum: `medico, paciente, farmacia, laboratorio, clinica, aseguradora, ambulancia, admin, corporate, auditor, gerente, administrador, contador, rrhh, soporte, analista, supervisor`.
- `payments.currency`: plain `text`, default `'VES'`, values are `'USD'` or `'VES'` (uppercase).
- `payments` uses `user_id` (NOT patient_id/doctor_id).
- `profiles.id` = `auth.users.id` (1:1).
