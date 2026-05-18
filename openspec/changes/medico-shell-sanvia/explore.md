# Explore — medico-shell-sanvia

## Problem statement

The `apps/medico/web` dashboard shell has three production-blocking defects: (1) the desktop sidebar is a non-fixed flex child that scrolls with the page because no positioning class anchors it; (2) there is no top contextual page header and no user-menu surface, so the doctor cannot reach logout, profile, or theme controls without crawling the sidebar; and (3) the sidebar paints ~14 phantom links per specialty that all 404 because they point to a `/dashboard/medico/<slug>/*` route tree that does not exist on disk. Together these issues make the shell visually broken AND functionally misleading the very first time a verified doctor logs in.

## Current architecture (as-is)

### Files involved

- `apps/medico/web/src/app/layout.tsx` (29 LOC) — root layout, just `<html>` + `<body>` + `ThemeProvider`. Clean.
- `apps/medico/web/src/app/dashboard/layout.tsx` (59 LOC) — server layout. Auth check, fetches `doctor_profiles` + joined `specialty` + `profile`, hands props to `DashboardShell`.
- `apps/medico/web/src/app/dashboard/dashboard-shell.tsx` (67 LOC) — client component. Wraps `<DashboardSidebar />` and `<main>` in a `flex min-h-screen bg-gray-50` container. Has a `lg:hidden h-14` placeholder for the mobile hamburger but NO top bar. Calls `getSpecialtyExperienceConfig` to compute `specialtyConfig`, but `themeColor` is never used after being assigned (dead code).
- `apps/medico/web/src/components/dashboard/sidebar.tsx` (343 LOC) — the only sidebar implementation. Renders TWO aside elements (mobile drawer + desktop) plus a hamburger button. Imports `LogOut` from lucide but NEVER renders it. The desktop aside (lines 332-340) uses `hidden lg:flex flex-col bg-card border-r flex-shrink-0` with NO `sticky`, `fixed`, `h-screen`, or `top-0` — that is the scroll bug.
- `apps/medico/web/src/components/dashboard/layout/dashboard-sidebar.tsx` (17 LOC) — STALE backwards-compat stub that only exports `MenuItem`/`MenuGroup` types with a TODO header. Candidate for deletion.
- `apps/medico/web/src/lib/specialties/index.ts` (276 LOC) — main entry of the specialty system. Exposes `getSpecialtyExperienceConfig(context)` and `getSpecialtyMenuGroups(config)`. The latter walks `config.modules` and emits one nav-item per module using `module.route` VERBATIM as the href.
- `apps/medico/web/src/lib/specialties/configs/overrides/medicina-general.ts` (322 LOC) — defines 10 modules, ALL pointing to `/dashboard/medico/medicina-general/*` routes that do not exist. Plus `dashboardPath: '/dashboard/medico/medicina-general'` (also dead).
- `apps/medico/web/src/components/modules/module-registry.ts` (122 LOC) — a parallel module system. Maps module keys (e.g. `cardiology-ecg`, `dental-odontogram`) to lazy-loaded React components. **None of the medicina-general module keys (`medgen-consulta`, `medgen-preventivo`, etc.) appear in this registry.** This explains why the sidebar's "Módulos" section is empty for medicina-general: `isModuleRegistered` returns false for every `medgen-*` key.
- `apps/medico/web/src/app/dashboard/modulos/[moduleKey]/page.tsx` (227 LOC) — dynamic route. Reads `params.moduleKey`, looks it up via `isModuleRegistered`, renders via `ModuleRenderer`. Falls back to a "Módulo no disponible — `<key>` no está registrado" empty state when not found.
- `apps/medico/web/src/app/dashboard/modulos/page.tsx` (361 LOC) — the modules catalog grid. Real implementation.

### Layout flow (today)

1. `app/layout.tsx` → mounts `<html>` + `<body>` + `<ThemeProvider>`.
2. `app/dashboard/layout.tsx` → server check, redirects to `/auth/login` if unauthenticated. Fetches `profile + specialty + sacs_specialty`. Mounts `<DashboardShell>` with those props.
3. `dashboard-shell.tsx` → client component. Computes `specialtyConfig` from props. Renders `<DashboardSidebar>` and `<main>` inside `<div class="flex min-h-screen bg-gray-50">`.
4. `<DashboardSidebar>` renders BOTH a mobile drawer (`fixed inset-y-0 z-50 -translate-x-full`) and a desktop aside (`hidden lg:flex flex-col flex-shrink-0`) — only the desktop one shows on `lg+`.
5. `<main>` renders the page children inside `p-4 md:p-6 lg:p-8`. **No header, no breadcrumbs, no user-menu.**

The desktop aside is a flex sibling of `<main>` inside a `flex min-h-screen` container. Because `<main>` grows tall with content, the parent flex container grows with it, the aside stretches to match (correct for flex behavior), but the aside scrolls AWAY because the page itself scrolls — there is no `sticky top-0 h-screen` or `fixed inset-y-0` to anchor it.

### Sidebar nav source of truth

The sidebar composes its nav from FOUR sources (priority order):

1. `CORE_NAV` (hardcoded in `sidebar.tsx:76-82`) — 5 links: Inicio, Agenda, Pacientes, Consulta, Recetas. All real, all 200.
2. `getSpecialtyMenuGroups(specialtyConfig)` (specialty-driven) — emits a group per `config.modules.<groupKey>`. Each item's href is `module.route` VERBATIM. **For medicina-general this produces 10 phantom links.**
3. Modules section — walks `config.modules` again, but uses href `/dashboard/modulos/${mod.key}` (the real dynamic route) and filters by `isModuleRegistered(mod.key)`. **For medicina-general this produces ZERO items because no `medgen-*` key is registered, only generic keys like `cardiology-ecg`, `dental-odontogram`.**
4. `CONFIG_NAV` (hardcoded in `sidebar.tsx:84-88`) — 3 links: Estadísticas, Verificación, Configuración. All real, all 200.

**The phantom links come exclusively from path #2.** They ship a clickable nav item with a route the user can never reach, breaking the "every link in the sidebar must be alive" expectation.

## Page audit

| Route | File | LOC | State | Notes |
|-------|------|-----|-------|-------|
| `/dashboard` | `app/dashboard/page.tsx` | 325 | real | Loads user, profile, specialty config; renders `KpiCard`, `TodayAgenda`, `SpecialtyWidgets`, `ExchangeRateWidget`. Has its own ad-hoc `<h1>` + quick actions block — no shared header. |
| `/dashboard/agenda` | `agenda/page.tsx` | 613 | real | Real appointment grid; uses `useDoctorAppointments` from `@red-salud/core`, full status workflow, calendar nav. |
| `/dashboard/pacientes` | `pacientes/page.tsx` | 120 | real | Lists derived patients from appointments via `PatientList` / `PatientDetail` components. Inline `<h1>Pacientes</h1>`. |
| `/dashboard/consulta` | `consulta/page.tsx` | 397 | real | SOAP editor, vital signs, diagnosis search, signature flow. |
| `/dashboard/recetas` | `recetas/page.tsx` | 471 | real | Prescription CRUD with patient picker, medication lines, signing. |
| `/dashboard/mensajes` | `mensajes/page.tsx` | 211 | real | Real messaging service, conversation list, thread view, realtime subscription. |
| `/dashboard/modulos` | `modulos/page.tsx` | 361 | real | Specialty modules catalog grid (active vs. explore). |
| `/dashboard/modulos/[moduleKey]` | `modulos/[moduleKey]/page.tsx` | 227 | real | Dynamic module renderer with breadcrumb + skeleton + 404 fallback. |
| `/dashboard/estadisticas` | `estadisticas/page.tsx` | 475 | real | Real KPI dashboard; pulls from `useSpecialtyKpis` + `useDoctorAppointments`. |
| `/dashboard/configuracion` | `configuracion/page.tsx` | 464 | real | Tabbed settings (profile / schedule / notifications / signature / theme), with `ScheduleManager`. |
| `/dashboard/verificacion` | `verificacion/page.tsx` | 31 | **placeholder** | Just a hardcoded "TODO" panel with "Verificación SACS" copy. No data flow. Ironically, all 5 test doctors except `medico1` are already SACS-verified in DB (`sacs_verified=true`) — page shows nothing. |

10 of 11 pages are real implementations. Only `verificacion/page.tsx` is a placeholder.

## Phantom links (to be cleaned)

Triggered by the medicina-general specialty config, these 10 routes paint in the sidebar but resolve to **404** (no `page.tsx`, no dynamic catcher at `/dashboard/medico/...`):

1. `/dashboard/medico/medicina-general/consulta`
2. `/dashboard/medico/medicina-general/preventivo`
3. `/dashboard/medico/medicina-general/cronicos`
4. `/dashboard/medico/medicina-general/derivaciones`
5. `/dashboard/medico/medicina-general/vacunacion`
6. `/dashboard/medico/medicina-general/historia-familiar`
7. `/dashboard/medico/medicina-general/laboratorio`
8. `/dashboard/medico/medicina-general/imagenologia`
9. `/dashboard/medico/medicina-general/calculadoras`
10. `/dashboard/medico/medicina-general/guias`

Plus `dashboardPath: '/dashboard/medico/medicina-general'` (also a 404, but never used as a sidebar link in the current code path; only available to widgets).

The same shape exists for **every other specialty override** under `lib/specialties/configs/overrides/*.ts` — there are 100+ override files. So the bug is not specific to medicina-general; it is a system-wide convention mismatch where overrides emit specialty-prefixed URLs but the app router only knows `/dashboard/modulos/[moduleKey]`.

> Caveat: the user-supplied count was "~15 phantom links" — actual is **10** for medicina-general. Different specialties may emit more or fewer. Worth confirming on the user's exact test account before quoting a number in the proposal.

## Sanvia pattern (target)

- Desktop sidebar uses `fixed inset-y-0 left-0 z-10 hidden sm:flex` so it never scrolls with the page.
- Main wrapper applies `sm:pl-72` (or `sm:pl-20` when collapsed) to compensate for the fixed sidebar width.
- Sidebar can collapse — toggle button swaps width tokens (`w-72` ↔ `w-20`) and persists state.
- Sidebar footer hosts a user-info row: avatar + name + email + chevron, opening a dropdown with `Profile / Settings / Theme / Logout`.
- Mobile (`< sm`): top header is `sticky top-0 z-30 sm:hidden`, hosts hamburger + page title + user avatar.
- Mobile bottom nav: `fixed bottom-0 sm:hidden`, 5 main routes only.
- Inside `<main>`, every page renders its own header section: `h1` + description, plus a right-aligned action slot (CTA buttons, filters, etc.). The current pages already do this ad-hoc — Sanvia formalizes it as a slot-based `<PageHeader>` component.

## Gaps to close in Fase 1

1. **Sidebar positioning** — switch desktop aside to `fixed inset-y-0 left-0 sm:flex` (Sanvia pattern), update `<main>` to apply `sm:pl-72` / collapsed-width compensation. Mobile drawer behavior already correct, leave as-is.
2. **Logout / user-menu surface** — add a sidebar footer dropdown (avatar + name + email + chevron) that exposes `Profile / Settings / Theme toggle / Logout`. Currently the `LogOut` icon is imported but never rendered, and there is NO sign-out path in the shell.
3. **Per-page contextual header** — introduce a slot-based `<PageHeader>` component (composition: `Title`, `Description`, `Breadcrumbs`, `Actions`, `Meta`). Each page mounts its own. The 10 real pages currently have ad-hoc `<h1>` + `<p>` blocks that should be migrated to it.
4. **Phantom-link cleanup** — stop calling `getSpecialtyMenuGroups` in the sidebar (or rewrite `getSpecialtyMenuGroups` to skip groups whose modules are not in `module-registry.ts`). The Modules section already gates by `isModuleRegistered`; the specialty-groups section does not.
5. **Specialty groups vs. registered modules** — for medicina-general, the override declares `medgen-consulta` etc. but the registry only knows generic keys. Need a decision: either register `medgen-*` keys (Fase 2 work) or stop emitting them in the sidebar.
6. **Mobile top-bar** — Sanvia spec wants a sticky mobile header with hamburger + page title + user avatar. Today there is only a 14px-tall spacer placeholder and a fixed hamburger button floating in the top-left corner. The page title is missing.
7. **Mobile bottom-nav** — not yet present at all. Sanvia spec requires it for the 5 main routes. Decide if this is in Fase 1 scope or deferred.
8. **`verificacion` placeholder** — not a shell concern, but the page is a TODO that the sidebar exposes; revisit whether it stays or hides until built.
9. **Stale stub deletion** — `components/dashboard/layout/dashboard-sidebar.tsx` is a 17-line backwards-compat shim with nothing real in it. Delete it as part of the cleanup.
10. **Dead `themeColor` in `dashboard-shell.tsx`** — line 43 computes it then never uses it. Either pipe it down to `<main>` for spec-color-aware page chrome, or drop the line.

## Out of scope for Fase 1 (deferred)

- **Capability engine (Option C SACS → modules matrix)** — Fase 2.
- **`module_catalog` cleanup of org-oriented entries** — Fase 2. Today the table has 22 rows (NOT 21 as previously stated): `core` (4), `enterprise` (5), `operations` (6), `specialty` (6). The clinic-oriented ones (`locations`, `staff`, `multi_org`, `rcm`, `crm`, `international`, `hospitalization`, `surgery`, `emergency`, `inventory`, `metrics`, `resources`, `schedule`) belong to `apps/clinica/`, not `apps/medico/`. Medicina-individual modules (`medgen-*`, `dental-odontogram`, `cardiology-ecg`, etc.) are NOT in the table at all — they live in TS only. This is a Fase 2 reconciliation.
- **`offline_patients` doctor-owned roster + cedula sync** — Fase 3.
- **Single-page consultation with right summary panel** — Fase 4.

## Open questions

1. **Phantom links — quick fix vs. proper fix?** The fastest fix is to neuter `getSpecialtyMenuGroups` so it returns `[]` until Fase 2 wires the matrix. The proper fix is to register the `medgen-*` modules (and equivalents for other specialties) into `module-registry.ts` and rewrite override routes to `/dashboard/modulos/<key>`. Which one for Fase 1?
2. **PageHeader location** — does it live in `apps/medico/web/src/components/shell/page-header.tsx` (app-private) or in `@red-salud/design-system` (shared across apps)? Other apps (clinica, paciente) will likely want the same pattern.
3. **Mobile bottom-nav** — Fase 1 or defer? Sanvia spec includes it but desktop fix is the priority.
4. **`verificacion` page** — keep the placeholder visible in the sidebar, or hide the link until the page is real?
5. **Sidebar collapse persistence** — store collapsed state in `localStorage`, server-side cookie, or in-memory only? Affects whether the sidebar flickers on first paint.
6. **User-menu items** — final list? Suggested: Avatar, Name + email, Profile (→ `/dashboard/configuracion?tab=profile`), Theme toggle (already in sidebar footer today), Logout. Anything else?
7. **`dashboardPath` from overrides** — currently unused in the sidebar; is it intended for the dashboard CTA in `/dashboard/page.tsx`? If so, those URLs are also dead.

## Risks

- **Specialty override coupling** — over 100 override files declare `module.route` of the form `/dashboard/medico/<slug>/*`. Removing `getSpecialtyMenuGroups` is one-line; rewriting all the routes is one line per file but error-prone. Mitigation: leave the data alone for Fase 1, just stop calling the function from the sidebar.
- **Logout regression** — the current shell has NO logout path at all, so adding one is pure-additive risk-free, BUT must use `@red-salud/auth-sdk` (not direct supabase signOut) to keep cookie semantics consistent across apps.
- **Breakpoint shift `lg → sm`** — Sanvia uses `sm:` (640px); current shell uses `lg:` (1024px). Switching would expose the desktop sidebar on tablet portrait. Need a deliberate decision in the proposal — do not silently change the breakpoint.
- **`themeColor` propagation** — the active-state background on sidebar links uses inline `style={{ backgroundColor: themeColor }}`. If the sidebar moves into `@red-salud/design-system`, this couples the design-system to specialty config — keep it app-private OR pass `themeColor` as a prop.
- **`/dashboard/medico/...` route tree** — confirmed there is NO `apps/medico/web/src/app/dashboard/medico/` folder on disk. If anyone added one in a parallel branch, the cleanup will collide; verify no in-flight PRs touch this tree before Fase 1 lands.
- **Test-doctor data shape** — all 5 `medico*.test+*` accounts have `dashboard_config.onboarding_completed=true` and `verified=true` for medico2-5; medico1 is unverified. Use medico1 to test the unverified-doctor path of the shell, medico2-5 for the happy path.
