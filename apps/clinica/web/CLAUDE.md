# Clinica Web — SaaS Multi-Tenant

## About This App
SaaS de gestion clinica multi-tenant. Cada `organization` es un tenant aislado:
clinica especializada, multi-especialidad o red hospitalaria. Aislamiento por
RLS en `organization_id`. NO esta destinada a consultorios individuales — esos
viven en `medico/web`.

## Tech Stack
- Next.js 15 (App Router) — port 3004
- TypeScript 5.6
- Tailwind CSS 4 (con CSS variables para theming por tenant)
- Supabase (RLS) + TanStack React Query
- `@red-salud/auth-sdk`, `@red-salud/types`, `@red-salud/api-client`

## Routing
- `/auth/login`, `/auth/register` — autenticacion
- `/onboarding` — wizard de 8 pasos para crear tenant
- `/dashboard` — redirect a la primera organizacion del usuario
- `/dashboard/[slug]` — overview de la organizacion
- `/dashboard/[slug]/locations` — sedes
- `/dashboard/[slug]/staff` — personal
- `/dashboard/[slug]/settings` — config (general, branding, modulos, dominio)
- `/dashboard/[slug]/[module]` — placeholder dinamico para todos los demas modulos

## Schema (live en Supabase)
- `organizations` — tenant raiz con branding jsonb
- `organization_locations` — sedes (1..N por org)
- `organization_members` — user ↔ org con role + scope opcional por sede
- `organization_modules` + `module_catalog` — feature flags por tenant
- `organization_invites` — invitaciones con token
- Helpers: `current_user_organizations()`, `has_org_role()`, `is_org_member()`,
  `create_organization()` (todas SECURITY DEFINER, evitan recursion RLS)

Migracion: `supabase/migrations/20260501100000_clinica_multitenant_foundation.sql`

## Roles (ENUM `organization_role`)
`owner`, `admin`, `finance`, `operations`, `medical_lead`, `doctor`, `secretary`,
`nurse`, `inventory`, `viewer`

## Modulos (21 en `module_catalog`)
- **core** (4): overview, locations, staff, settings — siempre activos
- **operations** (6): schedule, patients, resources, inventory, billing, metrics
- **specialty** (6): hospitalization, emergency, surgery, lab, imaging, telemedicine
- **enterprise** (5): rcm, international, crm, ai, multi_org

## Estructura
- `src/app/` — rutas Next.js
- `src/components/dashboard/` — shell, sidebar, trial banner, org switcher, module guard
- `src/components/onboarding/` — wizard + 8 step components
- `src/components/locations/`, `src/components/staff/` — UI por feature
- `src/lib/db/` — capa data Supabase: organizations, locations, members, modules
- `src/lib/hooks/` — React Query hooks por dominio
- `src/lib/providers/` — QueryProvider, OrganizationProvider, BrandingProvider
- `src/lib/theming/apply-branding.ts` — aplica CSS variables del branding a `:root`
- `src/lib/utils/slug.ts` — slugify + isValidSlug

## Theming por tenant
Cada org tiene `branding` jsonb: `logo_url`, `primary_color`, `secondary_color`,
`accent_color`, `font_family`, `ui_density` (compact/comfortable/spacious),
`terminology` (paciente/cita/consulta personalizables).

Las CSS variables `--brand-primary`, `--brand-accent`, `--brand-font` se inyectan
desde JS via `applyBranding()`. Densidad via `data-density` en `<html>`.

## Reglas
- NUNCA importar de otras apps
- TODA tabla nueva DEBE tener `organization_id` + RLS estricto
- Usar `useOrganizationContext()` para acceder a la org actual desde components
- Module guards: envolver paginas de modulos no-core con `<ModuleGuard moduleKey="...">`
- Nombres de tipos colision-safe: usar prefijo `Organization*` (ej:
  `CreateOrganizationLocationInput`, no `CreateLocationInput` — ese ya existe en clinic.ts legacy)

## Comandos
```bash
pnpm dev          # Dev server port 3004
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (CI gate)
```
