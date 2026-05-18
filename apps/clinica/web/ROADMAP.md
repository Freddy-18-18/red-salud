# Clinica Web — Roadmap & Estado

Documento vivo. Actualizar al cerrar cada sesion.

**Ultima actualizacion:** 2026-05-01
**Stack:** Next.js 15 + Supabase + RLS multi-tenant
**Estado:** Foundation (Fase 1) lista. Marketing publico + Operations pendientes.

---

## Vision

SaaS multi-tenant para clinicas (NO consultorios individuales — esos viven en
`apps/medico/web`). Un dominio (`clinica.redsalud.app`), tres audiencias en la
misma codebase:

1. **SaaS marketing/sales** (root paths) — vende a clinicas
2. **Perfil publico de cada clinica** (`/c/[slug]`) — lo que ven sus pacientes
3. **Panel autenticado** (`/dashboard/[slug]/*`) — gestion interna

Espectro de tenants: clinica especializada pequena → red hospitalaria
multi-sucursal. Modulos opt-in por organizacion.

---

## ✅ Hecho — Fase 1 Foundation

### Base de datos (Supabase prod project `hwckkfiirldgundbcjsp`)

**Migracion aplicada:** `supabase/migrations/20260501100000_clinica_multitenant_foundation.sql`

| Tabla | Proposito |
|-------|-----------|
| `organizations` | Tenant raiz con `branding` jsonb, plan, trial, slug, custom_domain |
| `organization_locations` | Sedes (1..N por org) con capacidades operativas |
| `organization_members` | User ↔ org con role + scope opcional por sede |
| `organization_modules` | Feature flags por org (que modulos tiene prendidos) |
| `organization_invites` | Invitaciones con token (email + role + sede) |
| `module_catalog` | Catalogo central de 21 modulos (4 core, 6 ops, 6 specialty, 5 enterprise) |

**Enums:**
- `organization_type` (6): specialty_clinic, multi_specialty_clinic, hospital_network, medical_center, diagnostic_center, rehabilitation_center
- `organization_status` (4): pending_setup, active, suspended, archived
- `organization_plan` (5): trial, starter, professional, enterprise, custom
- `organization_role` (10): owner, admin, finance, operations, medical_lead, doctor, secretary, nurse, inventory, viewer
- `invite_status` (4): pending, accepted, revoked, expired

**Helper functions (SECURITY DEFINER, evitan recursion RLS):**
- `current_user_organizations()` → set de org_id donde el user es member activo
- `has_org_role(org_id, roles[])` → boolean
- `is_org_member(org_id)` → boolean
- `create_organization(name, slug, type, primary_specialty)` → atomic create + auto-assign owner + enable core modules

**RLS:** estricto en TODAS las tablas, policies por SELECT/INSERT/UPDATE/DELETE.

### Tipos (`packages/types/src/organization.ts`)

- Interfaces completas: Organization, OrganizationLocation, OrganizationMember, OrganizationInvite, OrganizationModule, ModuleCatalogEntry, OrganizationBranding, etc.
- Inputs: CreateOrganizationInput, UpdateOrganizationInput, CreateOrganizationLocationInput, UpdateOrganizationLocationInput, InviteMemberInput
- **9 CLINIC_PROFILE_TEMPLATES** (presets para onboarding):
  - specialty-dental, specialty-ophthalmology, specialty-aesthetic, specialty-dermatology, specialty-fertility
  - multi-specialty
  - hospital-network
  - diagnostic-center, rehabilitation-center
- Helpers: ROLE_HIERARCHY, ROLE_LABELS, ORGANIZATION_TYPE_LABELS, canManageOrganization, canManageMembers, canManageLocations, canViewFinance

**IMPORTANTE:** `CreateLocationInput` ya existe en `clinic.ts` (legacy de paciente/web), por eso usamos prefijo `CreateOrganizationLocationInput` para evitar colision.

### App (`apps/clinica/web/`)

**Data layer (`src/lib/db/`):**
- `organizations.ts` — listMyOrganizations, getOrganizationById, getOrganizationBySlug, isSlugAvailable, createOrganizationRpc, updateOrganization, completeOnboarding, setOnboardingStep, getOrganizationOverview, getOrganizationKPIs
- `locations.ts` — listLocations, getLocation, createLocation, updateLocation, deactivateLocation, deleteLocation
- `members.ts` — listMembers, getCurrentUserMembership, updateMemberRole, deactivateMember, inviteMember, listPendingInvites, revokeInvite
- `modules.ts` — listModuleCatalog, listOrganizationModules, listEnabledModules, setModuleEnabled, bulkEnableModules

**React Query hooks (`src/lib/hooks/`):**
- `use-organization.ts` (10 hooks)
- `use-locations.ts` (5 hooks)
- `use-members.ts` (7 hooks)
- `use-modules.ts` (5 hooks)

**Providers (`src/lib/providers/`):**
- `query-provider.tsx` — QueryClient con defaults sanos
- `organization-provider.tsx` — context con org + locations + modules + role + helpers (isOwner, isAdmin, hasModule)
- `branding-provider.tsx` — aplica CSS vars del tenant on-mount

**Theming (`src/lib/theming/`):**
- `apply-branding.ts` — convierte hex a RGB triplet, inyecta `--brand-primary/secondary/accent`, `--brand-font`, y `data-density`

**Utils (`src/lib/utils/`):**
- `slug.ts` — slugify + isValidSlug

**Onboarding wizard (`src/app/onboarding/` + `src/components/onboarding/`):**
- `onboarding-wizard.tsx` — orquesta 8 pasos con estado local + RPC creation atomica
- 8 steps:
  1. `01-profile-step` — eleccion del template (9 perfiles)
  2. `02-basics-step` — nombre, slug (con check de disponibilidad), razon social, RIF, contacto
  3. `03-location-step` — primera sede + capacidad operativa (consultorios, camas, urgencias, etc.)
  4. `04-branding-step` — paleta, tipografia, densidad, terminologia con preview EN VIVO
  5. `05-modules-step` — selector de modulos con "recomendados" segun plantilla
  6. `06-team-step` — invitaciones con email + role
  7. `07-review-step` — resumen final
  8. `08-complete-step` — celebracion + redirect al dashboard

**Dashboard (`src/app/dashboard/` + `src/components/dashboard/`):**
- `/dashboard` — redirect a primera org del user (o `/onboarding` si no tiene)
- `/dashboard/[slug]/layout.tsx` — wraps con OrganizationProvider + BrandingProvider + DashboardShell
- `/dashboard/[slug]/page.tsx` — overview con KPIs, sedes, modulos
- `/dashboard/[slug]/locations/page.tsx` — CRUD de sedes
- `/dashboard/[slug]/staff/page.tsx` — listado + invitaciones
- `/dashboard/[slug]/settings/page.tsx` — 4 tabs (general, branding, modulos, dominio)
- `/dashboard/[slug]/[module]/page.tsx` — placeholder dinamico para modulos no implementados aun

**Componentes:**
- `dashboard-shell.tsx` — sidebar dinamico segun modulos activos + main content
- `org-switcher.tsx` — cambia entre orgs del user
- `trial-banner.tsx` — banner con dias restantes del trial
- `module-guard.tsx` — wrapper para paginas de modulos no-core
- `locations/location-form-dialog.tsx` — modal CRUD
- `staff/invite-dialog.tsx` — modal de invitacion

**Auth + middleware:**
- `middleware.ts` — protege rutas no-publicas, redirige a `/auth/login`
- `lib/supabase/{client,server}.ts` — typed cookies

### Verificado
- ✅ `pnpm --filter @red-salud/clinica-web typecheck` — clean
- ✅ Dev server arranca en `:3004` sin errores (Ready en 11.3s)
- ✅ Env wired (`.env.local` con NEXT_PUBLIC_SUPABASE_URL/ANON_KEY copiado de paciente/web)
- ✅ Schema verificado: 6 tablas + 21 modulos en catalog

### Pendiente de testeo manual
- ⏳ Smoke test E2E end-to-end (login → onboarding 8 pasos → dashboard) — el user todavia no lo corrio

---

## 🔜 Pendiente — Fase 1.5 Public Pages (PROXIMO)

**Decision arquitectonica acordada:** unificar 3 audiencias en una codebase con
routing por path. NO subdominios (Fase 3).

```
clinica.redsalud.app/                          ← SAAS Marketing
                    /precios
                    /funcionalidades
                    /casos
                    /casos/[slug]               ← Por especialidad
                    /demo                       ← Showcase tenant real
                    /contacto
                    /legal/privacidad
                    /legal/terminos

clinica.redsalud.app/c/[slug]/                 ← Perfil PUBLICO de cada clinica
                    /c/[slug]/medicos
                    /c/[slug]/servicios
                    /c/[slug]/sedes
                    /c/[slug]/agendar           ← Booking publico (Fase 2)
```

**Decision pendiente del user:** confirmar `/c/[slug]` (recomendado) vs `/clinica/[slug]`.

### Marketing site (8 paginas)
- [ ] `/` — landing con hero + 3 audiencias + showcase tenants reales + pricing snippet
- [ ] `/precios` — 4 tiers con feature matrix
- [ ] `/funcionalidades` — overview de los 21 modulos agrupados
- [ ] `/casos` — index de casos de uso
- [ ] `/casos/[caso-slug]` — long-form por perfil (odonto, oftalmo, estetica, hospital)
- [ ] `/contacto` — form + WhatsApp directo + agendar demo
- [ ] `/legal/privacidad`
- [ ] `/legal/terminos`

### Public tenant pages (4 paginas + booking en Fase 2)
- [ ] `/c/[slug]` — perfil con branding del tenant + hero + servicios + sedes + medicos destacados
- [ ] `/c/[slug]/medicos` — listado completo de medicos (los del staff con role doctor/medical_lead)
- [ ] `/c/[slug]/servicios` — servicios ofrecidos (de `organizations.services` array)
- [ ] `/c/[slug]/sedes` — sedes con mapa + horarios

### Componentes shared a crear
- [ ] `components/marketing/marketing-header.tsx` — logo Red Salud + nav + CTA "Crea tu cuenta"
- [ ] `components/marketing/marketing-footer.tsx` — links legales, redes, otras apps
- [ ] `components/marketing/hero-section.tsx`
- [ ] `components/marketing/feature-card.tsx`
- [ ] `components/marketing/pricing-tier.tsx`
- [ ] `components/marketing/testimonial-card.tsx`
- [ ] `components/tenant-public/tenant-header.tsx` — logo del tenant + nav publico
- [ ] `components/tenant-public/tenant-footer.tsx` — "Powered by Red Salud" sutil
- [ ] `components/tenant-public/tenant-hero.tsx` — branding-aware

### Cambios cross-cutting necesarios
- [ ] **Middleware**: agregar `/c/`, `/precios`, `/funcionalidades`, `/casos`, `/contacto`, `/legal/`, `/demo` como public paths
- [ ] **Branding por contexto**:
  - Rutas marketing → branding fijo Red Salud (color corporativo, logo Red Salud)
  - Rutas `/c/[slug]` → branding del tenant via `applyBranding()` server-side
  - Rutas auth/dashboard → branding del tenant logueado (ya existe)
- [ ] **SSR del branding** para `/c/[slug]` (evitar FOUC)
- [ ] **Demo tenant seed** — crear UN tenant de showcase con datos realistas para `/demo` y para CTAs "Ver clinica funcionando"
- [ ] **"Powered by Red Salud" CTA** — en cada perfil publico, footer/banner que lleve a `/precios`

---

## 🔜 Pendiente — Fase 2 Operations

Modulos del dia-a-dia clinico. Cada uno es un modulo grande (no se hace en una sesion).

- [ ] `schedule` — agenda compartida multi-medico/multi-sede con bloqueos, ausencias, reprogramacion, integracion Google Calendar
- [ ] `patients` — registro CENTRALIZADO de pacientes (de la clinica, no del medico). Diferente de `medico/web`
- [ ] `resources` — consultorios/equipos/salas. Reservas vinculadas a la agenda
- [ ] `inventory` — insumos medicos basicos + alertas de stock bajo
- [ ] `billing` — emision de comprobantes por consulta + integracion BCV
- [ ] `metrics` — KPIs operativos reales (occupancy, wait times, revenue por sede)

### Side tasks asociados
- [ ] Sistema de aceptacion de invites: ruta `/invites/[token]` que loguea/registra al user y crea el `organization_member`
- [ ] Email transaccional para invitaciones (Supabase invite emails o servicio externo)
- [ ] **Booking publico** (`/c/[slug]/agendar`) — usa el modulo schedule

---

## 🔜 Pendiente — Fase 3 Specialty + Enterprise

Modulos opt-in que se cobran extra.

**Specialty:**
- [ ] `hospitalization` — camas, internaciones, altas
- [ ] `emergency` — triaje y atencion de urgencias
- [ ] `surgery` — planificacion y gestion de cirugias
- [ ] `lab` — laboratorio interno integrado
- [ ] `imaging` — estudios de imagen
- [ ] `telemedicine` — consultas virtuales (integracion con paciente/web y medico/web)

**Enterprise:**
- [ ] `rcm` — revenue cycle management con aseguradoras
- [ ] `international` — turismo medico
- [ ] `crm` — campanas, recall, fidelizacion
- [ ] `ai` — sugerencias diagnosticas, summaries de consulta, prediccion no-show (con Gemini)
- [ ] `multi_org` — reporteria corporativa multi-organizacion (para redes hospitalarias con N orgs)

### Infra Fase 3
- [ ] **Custom domains** — `panel.miclinica.com` (auth) + `miclinica.com` (publico) via Cloudflare. SSL automatico, validacion DNS
- [ ] **Server-side branding inject (SSR)** para evitar FOUC en `/c/[slug]` y `/dashboard/[slug]`
- [ ] **Tests** — unit (vitest), e2e (playwright). Hoy hay cero
- [ ] **i18n** — preparado para paises mas alla de VE (timezone + currency ya estan en schema, falta UI)
- [ ] **Audit log** — quien hizo que en cada org (criticamente importante para enterprise)
- [ ] **Backup/export por tenant** — para que clinicas grandes puedan llevarse su data

---

## Decisiones tomadas (no re-discutir)

| Decision | Razon |
|----------|-------|
| `organization` (sin prefijo `clinic_`) | Aligned con Stripe/Linear/Vercel; reusable a futuro |
| DB compartida + RLS | Mas rapido, suficiente para 100s de tenants. Schema-per-tenant solo si llega un enterprise |
| Path-based routing (no subdomain en Fase 1) | Subdomain wildcard SSL es ops complejo. Path es trivial y SEO compuesto es mejor |
| `clinica/web` solo para clinicas con estructura | Consultorios individuales viven en `medico/web`. Limpia mucha complejidad |
| `module_catalog` en DB (no en codigo) | Permite agregar/desactivar modulos sin deploy |
| Trial de 30 dias por defecto | Hardcoded en `create_organization()` RPC |
| Onboarding atomic (RPC) | `create_organization()` crea org + member owner + enable core modules en una transaccion |
| Branding via CSS variables RGB triplet | Permite alpha (`rgb(var(--brand-primary) / 0.1)`). Mas flexible que hex |
| 9 templates de clinica | Cubren ~95% de los casos sin sobre-ingenierar |

---

## Comandos clave

```bash
# Dev
pnpm --filter @red-salud/clinica-web dev          # :3004

# Verificacion
pnpm --filter @red-salud/clinica-web typecheck

# Build
pnpm --filter @red-salud/clinica-web build

# Migracion (cuando hay cambios SQL)
# Aplicar via mcp__supabase__apply_migration al project hwckkfiirldgundbcjsp
```
