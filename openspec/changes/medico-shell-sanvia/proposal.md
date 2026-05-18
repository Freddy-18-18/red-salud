# Proposal — medico-shell-sanvia

> Phase 1 of the medico app shell rework. Scope is **strictly the AppShell** — sidebar, top bar, page header, mobile chrome, user menu. No business logic, no capability engine, no per-specialty work.

## Why

The `apps/medico/web` dashboard shell has three production-blocking defects that surface the moment a verified doctor logs in. (1) The desktop sidebar is a flex child with no positioning anchor, so it scrolls with the page instead of staying fixed to the viewport — content past the fold loses navigation entirely. (2) There is no top contextual header and no user-menu surface anywhere in the shell, which means the doctor cannot reach logout, profile, or theme controls — `LogOut` is even imported in `sidebar.tsx` but never rendered. (3) The sidebar paints ~10 phantom links per specialty (`/dashboard/medico/<slug>/*`) that all 404 because the route tree does not exist. Together these issues make the shell visually broken AND functionally misleading on a doctor's first session, blocking confidence to ship the medico app to real users.

## What

Concrete, testable deliverables for Fase 1:

- **Fixed desktop sidebar** anchored to the viewport (`fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col`) with content scrolling independently.
- **Sidebar collapse** toggle between `w-72` (expanded with labels) and `w-16` (icon-only with tooltips), with state persisted in `localStorage` under key `medico:sidebar-collapsed`.
- **Sidebar footer user-menu** dropdown: avatar + full_name + email header, "Mi perfil", "Verificación SACS", Theme submenu (Claro / Oscuro / Auto), "Configuración", divider, "Cerrar sesión".
- **`<PageHeader>` slot-based component** at `apps/medico/web/src/components/shell/page-header.tsx` exposing `PageHeader.Title`, `PageHeader.Breadcrumb`, `PageHeader.Actions`, `PageHeader.Meta`.
- **Migration of all 11 dashboard pages** to use `<PageHeader>` instead of ad-hoc `<h1>` blocks.
- **Mobile top-bar** (`sticky top-0 z-30 lg:hidden`) with logo + hamburger that opens a Radix `Sheet` containing the same nav as the desktop sidebar.
- **Mobile bottom-nav** (`fixed bottom-0 inset-x-0 z-30 lg:hidden`) with 5 items: Inicio · Pacientes · Atender (CTA central, prominent) · Recetas · Perfil.
- **Phantom-link neutralization**: stop calling `getSpecialtyMenuGroups()` from the sidebar's "specialty-groups" rendering block. The function and the 100+ specialty override files stay untouched (Fase 2 cleanup).
- **`/dashboard/verificacion` "Próximamente" badge** rendered next to its sidebar entry, keeping the route visible.
- **Logout via `@red-salud/auth-sdk`** `signOut()` from the auth provider, never direct Supabase.
- **Cleanup**: delete the stale `components/dashboard/layout/dashboard-sidebar.tsx` stub and drop the dead `themeColor` const at `dashboard-shell.tsx:43`.

## Who benefits

- Verified doctors using the medico web app: their first login no longer presents broken navigation, dead links, or a missing logout button.
- Test users currently registered (per engram #148): `medico1` (Medicina General, unverified — used for unverified-doctor path), `medico2` (Medicina General, sacs_verified), `medico3` (Medicina Interna, sacs_verified), `medico4` (Infectología, sacs_verified), `medico5` (Urología, sacs_verified). All paths exercisable with these accounts during QA.
- Future Fase 2 capability-engine work: a clean shell is the substrate it plugs into.

## Approach (high-level)

### Architecture decisions

- **AppShell composition.** A single `<DashboardShell>` orchestrator composes:
  - `<DesktopSidebar>` (rendered only `lg:` and up, fixed to viewport)
  - `<MobileTopBar>` (rendered only below `lg:`, sticky)
  - `<MobileBottomNav>` (rendered only below `lg:`, fixed bottom)
  - `<main>` with a `lg:pl-72` (or `lg:pl-16` collapsed) wrapper and a `<PageHeader>` slot above the page's body
- **PageHeader pattern.** Slot-based compound component (`PageHeader.Title`, `PageHeader.Breadcrumb`, `PageHeader.Actions`, `PageHeader.Meta`). Lives in `apps/medico/web/src/components/shell/`, NOT in `@red-salud/design-system` — it is medico-specific contextual chrome, not a reusable primitive.
- **Sidebar groups source.** Temporary 4-group static structure (Principal · Configuración) hardcoded in the sidebar component until Fase 2's capability engine replaces it. The existing `CORE_NAV` and `CONFIG_NAV` constants in `sidebar.tsx` are the seed.
- **User menu.** Dropdown built on `@red-salud/design-system` `dropdown-menu` + `avatar`, anchored to the sidebar footer (or the mobile top-bar avatar). Theme toggle lives inside it as a submenu reusing the existing `theme-toggle` from design-system.
- **Logout.** Calls `signOut()` from the `useAuth()` hook in `@red-salud/auth-sdk` (provider context at `packages/auth-sdk/src/provider.tsx:95`). NEVER direct Supabase `signOut`.
- **Breakpoint.** Keep `lg:` (1024px). Tablet portrait (768–1023px) uses the mobile menu by design — only true desktop shows the fixed sidebar.

### Data flows

- Server side: `app/dashboard/layout.tsx` already fetches the doctor's `profile` + `doctor_profiles` + joined `specialty`. Hand `full_name`, `email`, `avatar_url`, `verified`, `sacs_verified` down to `<DashboardShell>` as props.
- Client side: `<DashboardShell>` reads `medico:sidebar-collapsed` from `localStorage` on mount (initial state `false` to avoid SSR hydration mismatch — sidebar starts expanded, then snaps to persisted state on the client).
- User menu reads name/email/avatar from props (no client fetch).
- Logout: dropdown item invokes `useAuth().signOut()`; `@red-salud/auth-sdk` handles cookie/session cleanup.

### Files to create

- `apps/medico/web/src/components/shell/dashboard-shell.tsx` — replacement orchestrator (new path, supersedes the current `app/dashboard/dashboard-shell.tsx`)
- `apps/medico/web/src/components/shell/desktop-sidebar.tsx`
- `apps/medico/web/src/components/shell/mobile-top-bar.tsx`
- `apps/medico/web/src/components/shell/mobile-bottom-nav.tsx`
- `apps/medico/web/src/components/shell/sidebar-user-menu.tsx`
- `apps/medico/web/src/components/shell/page-header.tsx` (compound component with `.Title`, `.Breadcrumb`, `.Actions`, `.Meta` subcomponents)
- `apps/medico/web/src/components/shell/use-sidebar-collapsed.ts` (small client hook backing `localStorage`)
- `apps/medico/web/src/components/shell/index.ts` (barrel)

### Files to modify

- `apps/medico/web/src/app/dashboard/layout.tsx` — pass through user fields to the new shell
- `apps/medico/web/src/app/dashboard/dashboard-shell.tsx` — either delete and re-export from `components/shell/`, or thin wrapper. Pick one in design phase.
- `apps/medico/web/src/components/dashboard/sidebar.tsx` — neutralize the "specialty-groups" rendering block (stop iterating `getSpecialtyMenuGroups`). Function itself is left intact for Fase 2.
- All 11 dashboard pages migrating to `<PageHeader>`:
  - `apps/medico/web/src/app/dashboard/page.tsx`
  - `apps/medico/web/src/app/dashboard/agenda/page.tsx`
  - `apps/medico/web/src/app/dashboard/pacientes/page.tsx`
  - `apps/medico/web/src/app/dashboard/consulta/page.tsx`
  - `apps/medico/web/src/app/dashboard/recetas/page.tsx`
  - `apps/medico/web/src/app/dashboard/mensajes/page.tsx`
  - `apps/medico/web/src/app/dashboard/modulos/page.tsx`
  - `apps/medico/web/src/app/dashboard/modulos/[moduleKey]/page.tsx`
  - `apps/medico/web/src/app/dashboard/estadisticas/page.tsx`
  - `apps/medico/web/src/app/dashboard/configuracion/page.tsx`
  - `apps/medico/web/src/app/dashboard/verificacion/page.tsx`

### Files to delete or deprecate

- **Delete**: `apps/medico/web/src/components/dashboard/layout/dashboard-sidebar.tsx` (17-LOC TODO stub, never imported by the new shell).
- **Drop dead code**: `themeColor` declaration at `apps/medico/web/src/app/dashboard/dashboard-shell.tsx:43`.
- **Mark for Fase 2** (do NOT touch in Fase 1): `dashboardPath` field in 100+ specialty overrides under `apps/medico/web/src/lib/specialties/configs/overrides/*.ts`. Capability engine cleanup territory.

## Success criteria

Each item is independently verifiable:

- [ ] Desktop sidebar stays anchored to the viewport — does not scroll with page content (visual: scroll any long page, sidebar must remain in place).
- [ ] Page content scrolls independently of the sidebar (visual: scrollbar lives in `<main>`, not on `<html>`).
- [ ] `<PageHeader>` renders consistently on all 11 dashboard pages (manually visit each route, confirm the header pattern).
- [ ] User can collapse/expand the sidebar via the toggle; collapsed state shows icon-only with tooltips on hover.
- [ ] Sidebar collapse state persists across full reloads (`localStorage` key `medico:sidebar-collapsed` set, value preserved after F5).
- [ ] No phantom links render in the sidebar — log into `medico1` (Medicina General) and confirm no `/dashboard/medico/medicina-general/*` entries appear.
- [ ] Mobile (<1024px width) shows the hamburger top-bar AND the bottom nav with exactly 5 items (Inicio · Pacientes · Atender · Recetas · Perfil).
- [ ] Mobile hamburger opens a `Sheet` containing the same nav groups as the desktop sidebar.
- [ ] User menu in the sidebar footer shows avatar + full_name + email; clicking opens a dropdown with Mi perfil / Verificación SACS / Tema / Configuración / divider / Cerrar sesión.
- [ ] "Cerrar sesión" calls `useAuth().signOut()` from `@red-salud/auth-sdk` — verifiable in a code grep: zero occurrences of `supabase.auth.signOut()` directly inside `apps/medico/web/src/components/shell/`.
- [ ] No `apps/medico/` source file imports from `apps/clinica/`, `apps/secretaria/`, `apps/farmacia/`, or any other app — verifiable in a code grep across `apps/medico/web/src/`.
- [ ] All 11 current dashboard pages still load without runtime errors after the migration.
- [ ] `/dashboard/verificacion` sidebar entry shows a "Próximamente" badge.
- [ ] Stale stub `components/dashboard/layout/dashboard-sidebar.tsx` is deleted from disk.
- [ ] Dead `themeColor` const at the old `dashboard-shell.tsx:43` is removed.

## Out of scope (deferred)

- Capability engine / SACS → modules matrix (Fase 2)
- `offline_patients` flow (Fase 3)
- Single-page consultation redesign (Fase 4)
- Cleanup of org-oriented modules in `module_catalog` — DB has 22 rows, all clinic-oriented (Fase 2)
- 100+ specialty override files cleanup, including the dead `dashboardPath` field (Fase 2)
- Registering `medgen-*` keys in `module-registry.ts` (Fase 2)

## Dependencies on prior work

- Existing `@red-salud/design-system` exports: `avatar`, `dropdown-menu`, `sheet`, `breadcrumbs`, `theme-toggle` (verified in `packages/design-system/src/index.ts` lines 16, 31, 50, 20, 60).
- Existing `@red-salud/auth-sdk` `signOut()` available via `useAuth()` provider context (`packages/auth-sdk/src/provider.tsx:95`).
- Server-side doctor data fetching in `app/dashboard/layout.tsx` (already fetches profile + doctor_profiles + specialty).
- Lucide-react for icons (already used throughout medico web).

## Risks

| Risk | Mitigation |
|------|------------|
| Tablet portrait (768–1023px) UX: sidebar hidden until 1024px → mobile menu used. | Documented as deliberate; copy in spec/design phase confirms intent. |
| 100+ specialty overrides keep `module.route = '/dashboard/medico/<slug>/...'` shape; future code that consumes `getSpecialtyMenuGroups()` could regress. | Keep the function's return contract intact. Only the sidebar render path stops calling it. |
| `theme-toggle` integration inside a dropdown trigger (Radix nested menus can be finicky). | Verify in design phase; fallback is a flat radio group inside the dropdown if nesting fails. |
| Persisted sidebar collapse state causing SSR/CSR hydration mismatch. | Initial server-render uses `false` (expanded); client effect reads `localStorage` after hydration and sets state. No flash on first paint other than a possible width snap. |
| Logout cookie cleanup behavior across subdomains. | Audited in design phase via auth-sdk; no behavioral change expected since `signOut()` is already the supported path. |

## Estimated effort

**2.5 to 3 working days for one engineer.**

| Day | Work |
|-----|------|
| 1 | Shell skeleton: `<DashboardShell>` + `<DesktopSidebar>` fixed positioning + collapse hook + `lg:pl-72`/`lg:pl-16` main padding wiring + delete stub + drop dead code. |
| 2 | `<PageHeader>` compound component + migration of all 11 dashboard pages. |
| 3 | Sidebar `<SidebarUserMenu>` dropdown (avatar/name/email + menu items + theme submenu + logout via auth-sdk) + `<MobileTopBar>` + `<MobileBottomNav>` + verificación "Próximamente" badge + phantom-link neutralization + visual QA across `medico1..5`. |
