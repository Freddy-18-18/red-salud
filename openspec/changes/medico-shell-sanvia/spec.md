# Spec — medico-shell-sanvia

## Overview

Phase 1 of the medico app shell rework. This spec defines the observable behavior of the AppShell — sidebar, top bar, page header, mobile chrome, user menu — for individual doctor practice users on `apps/medico/web`. It targets the three production-blocking shell defects identified in the proposal: sidebar that scrolls with the page, missing contextual header and user menu, and phantom `/dashboard/medico/<slug>/*` links. No business logic, no capability engine, no per-specialty work in scope.

## Functional Requirements

### FR-1: Sidebar viewport-anchored

**The sidebar MUST stay anchored to the viewport, not the document.**

#### Scenarios

- **GIVEN** a doctor is on `/dashboard` with content longer than viewport height on a viewport ≥1024px
  **WHEN** they scroll the page down
  **THEN** the sidebar visibly stays in the same screen position
  **AND** only the main content area scrolls.

- **GIVEN** the sidebar nav list is taller than the viewport
  **WHEN** the doctor scrolls inside the sidebar
  **THEN** the sidebar nav scrolls internally
  **AND** the page content does not scroll
  **AND** the sidebar footer (user menu) remains visible at the bottom.

- **GIVEN** any dashboard page with content shorter than the viewport
  **WHEN** the page renders
  **THEN** the sidebar fills the full viewport height (`h-screen` equivalent)
  **AND** there is no whitespace below the sidebar.

- **GIVEN** a viewport <1024px
  **WHEN** the page renders
  **THEN** the desktop sidebar is NOT visible
  **AND** the mobile top bar + bottom nav are visible instead (see FR-5).

### FR-2: PageHeader is present and contextual

**Each of the 11 dashboard pages MUST render a `<PageHeader>` with a page-specific title and supporting context.**

The 11 pages: `/dashboard`, `/dashboard/agenda`, `/dashboard/pacientes`, `/dashboard/consulta`, `/dashboard/recetas`, `/dashboard/mensajes`, `/dashboard/modulos`, `/dashboard/modulos/[moduleKey]`, `/dashboard/estadisticas`, `/dashboard/configuracion`, `/dashboard/verificacion`.

#### Scenarios

- **GIVEN** the doctor navigates to `/dashboard`
  **WHEN** the page mounts
  **THEN** a `<PageHeader>` is visible above the page body
  **AND** the title reads a doctor-friendly greeting or "Inicio".

- **GIVEN** the doctor navigates to `/dashboard/agenda`
  **WHEN** the page mounts
  **THEN** the `<PageHeader>` title reads "Agenda"
  **AND** the breadcrumb shows `Inicio › Agenda`.

- **GIVEN** the doctor navigates to `/dashboard/modulos/[moduleKey]` with a valid module slug
  **WHEN** the page mounts
  **THEN** the `<PageHeader>` shows the module name as title
  **AND** the breadcrumb shows `Inicio › Módulos › <Module Name>`.

- **GIVEN** the doctor navigates to `/dashboard/configuracion`
  **WHEN** the page mounts
  **THEN** a `<PageHeader>` with title "Configuración" is rendered
  **AND** the breadcrumb shows `Inicio › Configuración`.

- **GIVEN** any of the 11 dashboard pages
  **WHEN** an action affordance is relevant (e.g., "Nueva consulta", "Nueva receta")
  **THEN** the action is rendered inside the `<PageHeader>` Actions slot
  **AND** is right-aligned within the header.

### FR-3: Sidebar collapse/expand

**The doctor MUST be able to collapse the desktop sidebar to icon-only mode and that state MUST persist across reloads.**

#### Scenarios

- **GIVEN** an expanded sidebar (`w-72`) on viewport ≥1024px
  **WHEN** the doctor clicks the collapse toggle
  **THEN** the sidebar transitions to icon-only width (`w-16`)
  **AND** nav labels are hidden
  **AND** hovering an icon shows a tooltip with the label
  **AND** the main content area widens accordingly.

- **GIVEN** a collapsed sidebar
  **WHEN** the doctor clicks the expand toggle
  **THEN** the sidebar returns to `w-72`
  **AND** nav labels become visible
  **AND** the main content area shrinks accordingly.

- **GIVEN** the doctor toggled the sidebar to collapsed
  **WHEN** they reload the page
  **THEN** the sidebar starts collapsed without a visible flash from expanded → collapsed
  **AND** localStorage key `medico:sidebar-collapsed` reads `true`.

- **GIVEN** a first-time user with no `medico:sidebar-collapsed` value in localStorage
  **WHEN** they load `/dashboard` on viewport ≥1024px
  **THEN** the sidebar starts EXPANDED.

- **GIVEN** localStorage is unavailable (e.g., Safari private mode)
  **WHEN** the page loads
  **THEN** the sidebar defaults to expanded
  **AND** no error is surfaced to the user
  **AND** toggling still works for the current session.

### FR-4: User menu in sidebar footer

**The sidebar footer MUST contain a dropdown menu with the doctor's identity and account actions.**

#### Scenarios

- **GIVEN** an expanded sidebar
  **WHEN** the page renders
  **THEN** the footer shows the doctor's avatar, full name, and email
  **AND** the area is clickable as a dropdown trigger.

- **GIVEN** a collapsed sidebar
  **WHEN** the page renders
  **THEN** the footer shows only the avatar
  **AND** the avatar is clickable as a dropdown trigger
  **AND** hovering it shows a tooltip with the doctor's name.

- **GIVEN** the user-menu trigger
  **WHEN** the doctor clicks it
  **THEN** a dropdown opens with: "Mi perfil", "Verificación SACS", "Tema" submenu, "Configuración", divider, "Cerrar sesión".

- **GIVEN** the user menu is open
  **WHEN** the doctor clicks "Mi perfil"
  **THEN** the dropdown closes
  **AND** the app navigates to the profile route.

- **GIVEN** the user menu is open
  **WHEN** the doctor opens the "Tema" submenu
  **THEN** options for light, dark, and system are visible
  **AND** selecting one updates the theme immediately
  **AND** the choice persists across reloads.

- **GIVEN** the user menu is open
  **WHEN** the doctor clicks "Cerrar sesión"
  **THEN** the logout flow defined in FR-8 runs.

- **GIVEN** the user menu is open
  **WHEN** the doctor presses Escape OR clicks outside the menu
  **THEN** the dropdown closes without performing any action.

### FR-5: Mobile shell

**On viewports <1024px, the doctor MUST get a mobile top bar, hamburger Sheet menu, and a bottom nav with 5 items.**

The mobile Sheet is a SEPARATE component from the desktop sidebar; both share `nav-data.ts` and sub-components like `<NavLink>`/`<NavGroup>`.

#### Scenarios

- **GIVEN** a viewport <1024px
  **WHEN** any dashboard page renders
  **THEN** a sticky top bar (`sticky top-0`) is visible with the brand logo on the left and a hamburger button on the right
  **AND** a fixed bottom nav (`fixed bottom-0`) is visible with 5 items: Inicio, Pacientes, Atender (CTA), Recetas, Perfil.

- **GIVEN** a viewport ≥1024px
  **WHEN** any dashboard page renders
  **THEN** neither the mobile top bar nor the bottom nav are visible.

- **GIVEN** the mobile top bar is visible
  **WHEN** the doctor taps the hamburger
  **THEN** a Sheet slides in containing the same primary navigation as the desktop sidebar
  **AND** the Sheet contains the same user-menu surface (avatar, name, email, logout).

- **GIVEN** the mobile Sheet is open
  **WHEN** the doctor taps any nav link
  **THEN** the Sheet closes
  **AND** the app navigates to the linked route.

- **GIVEN** the mobile Sheet is open
  **WHEN** the doctor taps the close button OR taps the backdrop
  **THEN** the Sheet closes without navigating.

- **GIVEN** the mobile bottom nav is visible
  **WHEN** the doctor taps "Atender"
  **THEN** the app navigates to `/dashboard/consulta` (Fase 1 target; will be re-pointed in Fase 5).

- **GIVEN** the mobile bottom nav is visible
  **WHEN** the doctor taps "Inicio", "Pacientes", "Recetas", or "Perfil"
  **THEN** the app navigates to the corresponding `/dashboard/*` route
  **AND** the active item is visually distinguished from the others.

- **GIVEN** mobile shell is visible
  **WHEN** the page content scrolls
  **THEN** the top bar remains pinned to the top
  **AND** the bottom nav remains pinned to the bottom
  **AND** the page content does not get hidden behind the bottom nav (sufficient bottom padding on the main scroll container).

### FR-6: Phantom links removed

**The sidebar MUST NOT render any `/dashboard/medico/<slug>/*` URLs.**

#### Scenarios

- **GIVEN** a doctor with any specialty (e.g., medico1 medicina general, medico4 infectología) is logged in
  **WHEN** they view the desktop sidebar
  **THEN** no nav item resolves to a URL matching `/dashboard/medico/`
  **AND** no nav item label corresponds to specialty-derived menu groups (e.g., "Pacientes Generales", "Historias", "Recetas Generales") that previously came from `getSpecialtyMenuGroups()`.

- **GIVEN** the same doctor opens the mobile Sheet
  **WHEN** they inspect the nav list
  **THEN** the same condition holds — no `/dashboard/medico/*` links are present.

- **GIVEN** any doctor on any specialty
  **WHEN** the sidebar renders
  **THEN** the visible nav contains exactly the temporary 4-group static structure defined for Fase 1 (Principal + Configuración groupings only)
  **AND** does not branch on specialty.

### FR-7: Verificación badge

**The sidebar entry for "Verificación" MUST display a visible status badge indicating it is in development.**

#### Scenarios

- **GIVEN** the sidebar is expanded
  **WHEN** the page renders
  **THEN** the "Verificación" nav item shows a badge with text "Próximamente" (or "En desarrollo") next to its label
  **AND** the badge is visually distinguishable (e.g., muted color or design-system Badge variant).

- **GIVEN** the sidebar is collapsed
  **WHEN** the page renders
  **THEN** the "Verificación" icon shows a small dot or badge marker (no text, since label is hidden)
  **AND** the tooltip on hover includes "Próximamente".

- **GIVEN** the doctor clicks the "Verificación" nav item
  **WHEN** the click is handled
  **THEN** the app navigates to `/dashboard/verificacion`
  **AND** the badge does NOT block navigation (it is purely informational).

### FR-8: Logout via auth-sdk

**Logout MUST go through `@red-salud/auth-sdk`, not direct Supabase calls.**

#### Scenarios

- **GIVEN** the doctor is signed in and the user menu is open
  **WHEN** they click "Cerrar sesión"
  **THEN** the handler calls `useAuth().signOut()` from `@red-salud/auth-sdk`
  **AND** on success, the app redirects to `/auth/login`
  **AND** the session cookie(s) are cleared
  **AND** subsequent navigation to any `/dashboard/*` route is blocked by middleware.

- **GIVEN** the logout call fails (network error or `signOut()` rejects)
  **WHEN** the handler resolves the failure
  **THEN** a toast error is shown with text equivalent to "No se pudo cerrar sesión"
  **AND** the doctor remains logged in
  **AND** the user menu is closed.

- **GIVEN** the mobile Sheet is open and the doctor taps "Cerrar sesión"
  **WHEN** the handler runs
  **THEN** the same logout flow as above runs identically.

### FR-9: No clinic/org features leak

**The shell MUST NOT expose any UI surfaces tied to clinic, multi-org, or hospital workflows.**

#### Scenarios

- **GIVEN** a doctor on any dashboard page
  **WHEN** the desktop sidebar renders
  **THEN** no nav items reference: "Sedes", "Personal", "Hospitalización", "Quirófano", "Multi-org", "Organización", "RCM", or "Reclamos".

- **GIVEN** the same doctor opens the mobile Sheet OR the mobile bottom nav
  **WHEN** the nav lists render
  **THEN** the same condition holds.

- **GIVEN** the user-menu dropdown is open
  **WHEN** the items are listed
  **THEN** no item references clinic/org workflows.

- **GIVEN** any of the 11 dashboard pages
  **WHEN** the `<PageHeader>` renders
  **THEN** breadcrumbs and titles do not reference clinic/org concepts.

## Non-Functional Requirements

### NFR-1: Performance

- Shell hydration MUST NOT cause a visible layout shift when the collapse state loads from localStorage.
- The sidebar MUST be visible on first paint; doctor data is fetched server-side in `app/dashboard/layout.tsx` and passed as props (no client-side waterfall for shell chrome).
- Theme transitions MUST NOT trigger a flash of incorrect theme on initial load.

### NFR-2: Accessibility

- The sidebar collapse/expand button MUST have an aria-label that reflects state ("Contraer barra lateral" / "Expandir barra lateral").
- The user-menu dropdown MUST be keyboard-navigable (Tab, Arrow keys, Enter, Escape) per Radix dropdown semantics.
- The mobile bottom nav MUST have `aria-label="Navegación principal"`.
- The "Cerrar sesión" control MUST have an accessible name "Cerrar sesión".
- The hamburger button MUST have aria-label "Abrir menú".
- Tooltips on collapsed-sidebar icons MUST be reachable via keyboard focus, not only hover.
- All icon-only buttons MUST have text alternatives via aria-label.

### NFR-3: Theming

- All shell components MUST respect the design-system theme tokens (light/dark/system).
- No hardcoded color literals in shell components — only design-system tokens (e.g., `bg-card`, `text-foreground`, `border-border`).
- The "Tema" submenu in the user menu MUST switch themes globally and persist the choice.

### NFR-4: Browser support

- Latest 2 versions of Chrome, Firefox, Safari, Edge on desktop.
- Mobile Safari iOS 15+ and Chrome Android 100+.
- The shell MUST function (with degraded persistence) when localStorage is unavailable.

### NFR-5: Domain isolation

- The shell MUST NOT import from any other `apps/*` directory.
- Shared chrome primitives come from `@red-salud/design-system`; auth from `@red-salud/auth-sdk`; types from `@red-salud/types`.

## Edge cases & error states

- **Doctor with no `avatar_url`**: the user-menu avatar shows initials in `<Avatar>` fallback (e.g., "MS" for "Marianella Suarez").
- **Doctor with no specialty assigned**: the sidebar shows the doctor's specialty as the generic label "Médico"; no specialty-specific groups are rendered (consistent with Fase 1 phantom-link removal).
- **Doctor with extremely long full name (>30 characters)**: the user-menu trigger truncates the name with ellipsis; the full name is visible inside the dropdown header.
- **Doctor with extremely long email**: the email truncates with ellipsis in the trigger; full value visible in dropdown header.
- **localStorage unavailable** (Safari private mode, blocked storage): sidebar defaults to expanded, toggling works in-memory for the session, no error surfaced.
- **`@red-salud/auth-sdk` `signOut()` fails**: toast error "No se pudo cerrar sesión"; user remains logged in; menu closes.
- **Network offline**: shell still renders from cached server data; mobile bottom-nav links continue to function via client-side router.
- **First-time user (no localStorage value)**: sidebar starts EXPANDED on desktop ≥1024px.
- **SSR vs client mismatch on collapse state**: server renders expanded by default; client snaps to localStorage value after hydration without layout shift visible to user.
- **Doctor with `verified=false` or `sacs_verified=false`**: shell still renders fully; verification status is not gated by the shell (gating belongs to other layers); the "Verificación" sidebar entry remains accessible with its "Próximamente" badge.
- **Module slug `[moduleKey]` invalid or unknown**: PageHeader falls back to a generic "Módulo" title; breadcrumb shows `Inicio › Módulos › <slug>`.
- **Viewport resized across 1024px breakpoint**: shell swaps between desktop and mobile chrome reactively; no broken intermediate state.

## Out of scope

- Capability-driven sidebar groups (Fase 2).
- `module_catalog` cleanup and `medgen-*` key registration (Fase 2).
- 100+ specialty override file cleanup (Fase 2).
- `offline_patients` integration (Fase 3).
- Single-page consultation redesign (Fase 4).
- Real "Bandeja de pacientes hoy" route — the bottom-nav "Atender" CTA temporarily points to `/dashboard/consulta` and will be re-pointed in Fase 5.

## Validation checklist (for sdd-verify phase)

- [ ] Sidebar uses `fixed` (or `sticky top-0 h-screen`) so it does not scroll with the document — verify via grep on `apps/medico/web/src/components/shell/`.
- [ ] Main wrapper applies `lg:pl-72` or `lg:pl-16` based on collapse state.
- [ ] `<PageHeader>` rendered in all 11 dashboard `page.tsx` files — verify via grep `<PageHeader`.
- [ ] No reference to `apps/clinica/` or any other `apps/*` from `apps/medico/`.
- [ ] Logout calls `useAuth().signOut()` from `@red-salud/auth-sdk` — grep zero `supabase.auth.signOut()` in `apps/medico/web/src/components/shell/`.
- [ ] Phantom URLs `/dashboard/medico/medicina-general/*` not rendered — verify via DOM snapshot in Playwright with medico1.
- [ ] Bottom nav fixed `bottom-0` and visible only `lg:hidden`.
- [ ] Top mobile bar `sticky top-0` and visible only `lg:hidden`.
- [ ] localStorage key `medico:sidebar-collapsed` written on toggle.
- [ ] "Verificación" entry has badge text "Próximamente" or "En desarrollo".
- [ ] Old `apps/medico/web/src/app/dashboard/dashboard-shell.tsx` deleted from disk (no wrapper).
- [ ] Stale `apps/medico/web/src/components/dashboard/layout/dashboard-sidebar.tsx` deleted from disk.
- [ ] `themeColor` const at the old `dashboard-shell.tsx:43` removed.
- [ ] `getSpecialtyMenuGroups()` no longer called from any sidebar render path.
- [ ] No clinic/org strings ("Sedes", "Personal", "Hospitalización", "Quirófano", "Multi-org", "RCM") rendered anywhere in shell.
- [ ] Mobile Sheet is a SEPARATE component from `DesktopSidebar`; both consume the same `nav-data.ts`.
- [ ] Sub-components `<NavLink>`/`<NavGroup>` are shared between desktop and mobile.
- [ ] Bottom-nav "Atender" CTA targets `/dashboard/consulta`.
