# Tasks — medico-shell-sanvia

## Summary
- Total tasks: 33
- Estimated total effort: 2.0 days (1 dev)
- Critical path length: 24 tasks
- Critical path: T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008 → T-009 → T-010 → T-011 → T-012 → T-013 → T-014..T-024 (page migrations, parallelizable) → T-026..T-029 → T-031 → T-032

## Implementation phases
- Phase A (Foundation: types, data, hook): T-001 → T-003
- Phase B (Leaf components): T-004 → T-007
- Phase C (Layout components): T-008 → T-011
- Phase D (Shell composition + barrel + layout wiring): T-012 → T-014
- Phase E (Page migrations to PageHeader): T-015 → T-025
- Phase F (Cleanup / deletions): T-026 → T-029
- Phase G (Verification): T-030 → T-033

## Task list

### T-001. Create shell types
- **Goal**: Define TypeScript contracts for nav data and shell props.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/types.ts`
- **Acceptance criteria**:
  - [ ] Exports `NavLinkData` (key, label, href, icon: LucideIcon, badge?, disabled?)
  - [ ] Exports `NavGroupData` (key, label, items: NavLinkData[])
  - [ ] Exports `BottomNavItemData` (key, label, href, icon: LucideIcon, cta?: boolean)
  - [ ] Exports `DashboardShellProps` (doctorName, email, avatarUrl: string | null, specialtyName, specialtySlug: string | null, sacsEspecialidad: string | null, userId, children: ReactNode)
  - [ ] Exports `PageHeaderBreadcrumbItem` ({ label: string; href?: string })
  - [ ] Zero runtime exports (types only)
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: none
- **Estimated effort**: XS
- **Commit message**: `feat(medico/web): add shell types module`

### T-002. Create static nav-data
- **Goal**: Centralise NAV_GROUPS and BOTTOM_NAV_ITEMS for the Fase 1 static nav.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/nav-data.ts`
- **Acceptance criteria**:
  - [ ] Imports types from `./types`
  - [ ] Exports `NAV_GROUPS: NavGroupData[]` with exactly two groups: `principal` and `configuracion`
  - [ ] `principal` items: Inicio, Agenda, Pacientes, Consulta, Recetas, Mensajes (6 items, lucide icons Home/Calendar/Users/Stethoscope/Pill/MessageSquare)
  - [ ] `configuracion` items: Estadísticas, Verificación (badge `Próximamente`), Configuración (3 items, BarChart3/ShieldCheck/Settings)
  - [ ] Exports `BOTTOM_NAV_ITEMS: BottomNavItemData[]` with 5 items: Inicio, Pacientes, Atender (cta=true, href=/dashboard/consulta), Recetas, Perfil (href=/dashboard/configuracion)
  - [ ] Zero `/dashboard/medico/` URLs anywhere in this file
  - [ ] Zero references to clinic/sedes/personal/hospitalizacion/quirofano
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001
- **Estimated effort**: S
- **Commit message**: `feat(medico/web): add static nav data for shell`

### T-003. Create useSidebarCollapsed hook
- **Goal**: SSR-safe localStorage-backed sidebar collapse state with try/catch.
- **Files**:
  - CREATE: `apps/medico/web/src/hooks/use-sidebar-collapsed.ts`
- **Acceptance criteria**:
  - [ ] Exports `useSidebarCollapsed()` returning `{ collapsed: boolean; toggle: () => void; setCollapsed: (v: boolean) => void }`
  - [ ] Initial state is `false` (SSR-safe; no `window` access during render)
  - [ ] Reads localStorage key `medico:sidebar-collapsed` inside `useEffect` ('1' → true, anything else → false)
  - [ ] Writes `'1'` or `'0'` to localStorage on every state change
  - [ ] All localStorage access wrapped in try/catch; failure does not throw
  - [ ] No imports from `apps/*` (other apps)
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: none
- **Estimated effort**: S
- **Commit message**: `feat(medico/web): add useSidebarCollapsed hook`

### T-004. Create NavLink component
- **Goal**: Single sidebar link with active state, optional badge, collapsed icon-only mode + tooltip.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/nav-link.tsx`
- **Acceptance criteria**:
  - [ ] Client component (`'use client'`)
  - [ ] Props: `{ data: NavLinkData; collapsed?: boolean; onNavigate?: () => void }`
  - [ ] Uses `next/link` and `next/navigation`'s `usePathname` for active detection
  - [ ] Active style uses `bg-primary/10 text-primary` (semantic tokens — no per-specialty hex)
  - [ ] When `collapsed`, renders icon-only and wraps in tooltip showing `data.label` (+ badge text when present)
  - [ ] Renders badge inline when expanded and `data.badge` is set
  - [ ] Calls `onNavigate?.()` on click (used to close mobile sheet)
  - [ ] Imports tooltip primitives from `@red-salud/design-system`
  - [ ] Zero hardcoded colors
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add NavLink shell component`

### T-005. Create NavGroup component
- **Goal**: Render a labeled group of NavLinks; hide group label when sidebar is collapsed.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/nav-group.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Props: `{ group: NavGroupData; collapsed?: boolean; onNavigate?: () => void }`
  - [ ] Renders `group.label` as a small uppercase label only when not collapsed
  - [ ] Maps `group.items` through `<NavLink>`
  - [ ] Forwards `collapsed` and `onNavigate` to each `<NavLink>`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001, T-004
- **Estimated effort**: XS
- **Commit message**: `feat(medico/web): add NavGroup shell component`

### T-006. Create PageHeader compound component
- **Goal**: Compound `<PageHeader>` with `.Title`, `.Breadcrumb`, `.Meta`, `.Actions` slots used by every dashboard page.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/page-header.tsx`
- **Acceptance criteria**:
  - [ ] Exports `PageHeader` plus four slot subcomponents accessible as `PageHeader.Title`, `PageHeader.Breadcrumb`, `PageHeader.Meta`, `PageHeader.Actions`
  - [ ] `.Title` renders an `<h1>` styled with design-system typography tokens
  - [ ] `.Breadcrumb` accepts `items: PageHeaderBreadcrumbItem[]` and uses `Breadcrumbs` from `@red-salud/design-system`
  - [ ] `.Meta` renders `text-sm text-muted-foreground`
  - [ ] `.Actions` aligns right (e.g. `ml-auto` / flex layout) and accepts arbitrary children
  - [ ] Layout: breadcrumb on top, title row with actions on the right, meta below title
  - [ ] No hardcoded colors; uses design-system tokens
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add PageHeader compound component`

### T-007. Create UserMenuDropdown component
- **Goal**: Sidebar-footer dropdown with identity, theme picker, and logout via auth-sdk.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/user-menu-dropdown.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Props: `{ doctorName: string; email: string; avatarUrl: string | null; specialtyName?: string; sacsEspecialidad?: string | null; collapsed?: boolean }`
  - [ ] Trigger when expanded: avatar + truncated full name + truncated email; collapsed: avatar only with tooltip showing name
  - [ ] Dropdown content order: name+email+sacs label / `Mi perfil` / `Verificación SACS` / separator / `Tema` flat `DropdownMenuRadioGroup` (Claro/Oscuro/Auto) / separator / `Configuración` / `Cerrar sesión`
  - [ ] Uses `Avatar`, `DropdownMenu*`, `Separator` from `@red-salud/design-system`
  - [ ] `Tema` uses existing `useTheme()` from `@red-salud/design-system`
  - [ ] `Cerrar sesión` calls `useAuth().signOut()` from `@red-salud/auth-sdk`, then `router.push('/auth/login')` and `router.refresh()`
  - [ ] On signOut error: shows destructive toast with message `No se pudo cerrar sesión`; does NOT redirect
  - [ ] Avatar fallback uses initials when `avatarUrl` is null
  - [ ] Long names/emails truncated in trigger; full values shown in dropdown header
  - [ ] Zero `supabase.auth.signOut(` in this file
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
  - `rg "supabase.auth.signOut" apps/medico/web/src/components/shell` (expect zero matches)
- **Depends on**: T-001
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add UserMenuDropdown component`

### T-008. Create DesktopSidebar component
- **Goal**: Viewport-anchored sidebar with header (logo + collapse chevron), scrollable nav, footer with user menu.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/desktop-sidebar.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Props: `{ collapsed: boolean; onToggle: () => void; doctorName: string; email: string; avatarUrl: string | null; specialtyName?: string; sacsEspecialidad?: string | null }`
  - [ ] Root element classes include `fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-card border-r transition-[width] duration-300`
  - [ ] Width swaps `lg:w-72` ↔ `lg:w-16` based on `collapsed`
  - [ ] Internal layout: SidebarHeader (logo + chevron toggle button) / SidebarNav (overflow-y-auto, renders `NAV_GROUPS` via `<NavGroup>`) / SidebarFooter (renders `<UserMenuDropdown>`)
  - [ ] Toggle button has `aria-label` `Contraer barra lateral` when expanded and `Expandir barra lateral` when collapsed
  - [ ] Sidebar nav scrolls internally; footer remains visible
  - [ ] Renders zero strings matching `/dashboard/medico/`
  - [ ] No imports from `apps/*` other than `@/`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-002, T-005, T-007
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add DesktopSidebar component`

### T-009. Create MobileTopBar component
- **Goal**: Sticky top bar (logo + hamburger) shown below `lg`.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/mobile-top-bar.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Props: `{ onOpenMenu: () => void }`
  - [ ] Root classes include `sticky top-0 z-30 h-14 lg:hidden bg-background/95 backdrop-blur border-b`
  - [ ] Renders logo on the left, hamburger button on the right
  - [ ] Hamburger button has `aria-label="Abrir menú"`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001
- **Estimated effort**: S
- **Commit message**: `feat(medico/web): add MobileTopBar component`

### T-010. Create MobileSidebarSheet component
- **Goal**: Radix Sheet that mirrors desktop nav for mobile and includes the user-menu surface.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/mobile-sidebar-sheet.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Props: `{ open: boolean; onClose: () => void; doctorName: string; email: string; avatarUrl: string | null; specialtyName?: string; sacsEspecialidad?: string | null }`
  - [ ] Uses Sheet primitives from `@red-salud/design-system` (or its underlying Radix wrapper)
  - [ ] Renders the same `NAV_GROUPS` via `<NavGroup>` (no specialty branching, no `/dashboard/medico/` URLs)
  - [ ] Tapping a `<NavLink>` triggers `onClose`
  - [ ] Includes `<UserMenuDropdown>` (or equivalent expanded user menu) inside the sheet footer
  - [ ] Tap on backdrop or close button calls `onClose` without navigating
  - [ ] Hidden on `lg+` (`lg:hidden` on root)
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-002, T-005, T-007
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add MobileSidebarSheet component`

### T-011. Create MobileBottomNav component
- **Goal**: Fixed 5-item bottom nav with safe-area inset; `Atender` is the visual CTA.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/mobile-bottom-nav.tsx`
- **Acceptance criteria**:
  - [ ] Client component
  - [ ] Root classes include `fixed bottom-0 inset-x-0 z-30 lg:hidden bg-background border-t pb-[env(safe-area-inset-bottom)] grid grid-cols-5 h-16`
  - [ ] Renders 5 items from `BOTTOM_NAV_ITEMS`
  - [ ] Active item visually distinguished (semantic active style, not per-specialty)
  - [ ] `Atender` item visually styled as CTA and href is `/dashboard/consulta`
  - [ ] Root has `aria-label="Navegación principal"`
  - [ ] Each item is a `next/link` with accessible label
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-002
- **Estimated effort**: S
- **Commit message**: `feat(medico/web): add MobileBottomNav component`

### T-012. Create DashboardShell orchestrator
- **Goal**: Compose desktop sidebar + mobile chrome + main content area; hold sheet-open state and collapse hook.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/dashboard-shell.tsx`
- **Acceptance criteria**:
  - [ ] Client component (`'use client'`)
  - [ ] Props: `DashboardShellProps` (from T-001), including `email` and `children`
  - [ ] Uses `useSidebarCollapsed()` for sidebar state
  - [ ] Holds local `useState` for mobile sheet open/close
  - [ ] Root classes `flex min-h-screen w-full bg-muted/40`
  - [ ] Renders `<DesktopSidebar>` (passes `collapsed`, `onToggle`)
  - [ ] Renders `<MobileTopBar>` and `<MobileSidebarSheet>` wired together
  - [ ] Main wrapper has `flex-1 transition-[padding] duration-300` and toggles `lg:pl-72` ↔ `lg:pl-16` based on `collapsed`
  - [ ] Page container has `pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-8` to clear mobile bottom nav
  - [ ] Renders `<MobileBottomNav>` at the bottom
  - [ ] Renders `{children}` inside main
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-003, T-008, T-009, T-010, T-011
- **Estimated effort**: M
- **Commit message**: `feat(medico/web): add DashboardShell orchestrator`

### T-013. Create shell barrel export
- **Goal**: Single import surface `@/components/shell` for layout + page consumers.
- **Files**:
  - CREATE: `apps/medico/web/src/components/shell/index.ts`
- **Acceptance criteria**:
  - [ ] Re-exports `DashboardShell` (default named export)
  - [ ] Re-exports `PageHeader`
  - [ ] Re-exports `NAV_GROUPS`, `BOTTOM_NAV_ITEMS`
  - [ ] Re-exports type symbols `NavLinkData`, `NavGroupData`, `DashboardShellProps`, `PageHeaderBreadcrumbItem`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-001, T-002, T-006, T-012
- **Estimated effort**: XS
- **Commit message**: `feat(medico/web): add shell barrel export`

### T-014. Wire DashboardShell into dashboard layout
- **Goal**: Replace the old shell import in `app/dashboard/layout.tsx` with the new `<DashboardShell>` and pass `email`.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/layout.tsx` (replace import path; pass `email` prop alongside existing doctor data; remove import of old `app/dashboard/dashboard-shell.tsx`)
- **Acceptance criteria**:
  - [ ] Imports `DashboardShell` from `@/components/shell`
  - [ ] No import line referencing `./dashboard-shell` or `app/dashboard/dashboard-shell`
  - [ ] Passes `email` (from server-side user) into `<DashboardShell>` props
  - [ ] Server component continues to fetch doctor data; only the client shell import path changed
  - [ ] Page renders without runtime errors at `/dashboard`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
  - `rg "dashboard-shell" apps/medico/web/src/app/dashboard/layout.tsx` (expect zero matches to old path)
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): wire new DashboardShell in dashboard layout`

### T-015. Migrate /dashboard page to PageHeader
- **Goal**: Replace inline `<h1>` with `<PageHeader>` greeting/Inicio title.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] Renders `<PageHeader>` with `<PageHeader.Title>` containing greeting or `Inicio`
  - [ ] No bare top-level `<h1>` outside `<PageHeader>`
  - [ ] No imports from other `apps/*`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard`

### T-016. Migrate /dashboard/agenda page to PageHeader
- **Goal**: Render PageHeader with title `Agenda` and breadcrumb `Inicio › Agenda`.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/agenda/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Agenda</PageHeader.Title>`
  - [ ] `<PageHeader.Breadcrumb items=[{label:'Inicio', href:'/dashboard'}, {label:'Agenda'}] />`
  - [ ] No bare top-level `<h1>` outside `<PageHeader>`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/agenda`

### T-017. Migrate /dashboard/pacientes page to PageHeader
- **Goal**: Render PageHeader with title `Pacientes` and breadcrumb to Inicio.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/pacientes/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Pacientes</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Pacientes`
  - [ ] Existing page-level CTAs moved into `<PageHeader.Actions>` slot if present
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/pacientes`

### T-018. Migrate /dashboard/consulta page to PageHeader
- **Goal**: Render PageHeader on consulta page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/consulta/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Consulta</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Consulta`
  - [ ] Existing page actions placed in `<PageHeader.Actions>`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/consulta`

### T-019. Migrate /dashboard/recetas page to PageHeader
- **Goal**: Render PageHeader on recetas page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/recetas/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Recetas</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Recetas`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/recetas`

### T-020. Migrate /dashboard/mensajes page to PageHeader
- **Goal**: Render PageHeader on mensajes page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/mensajes/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Mensajes</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Mensajes`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/mensajes`

### T-021. Migrate /dashboard/modulos page to PageHeader
- **Goal**: Render PageHeader on modules listing page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/modulos/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Módulos</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Módulos`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/modulos`

### T-022. Migrate /dashboard/modulos/[moduleKey] page to PageHeader
- **Goal**: Render dynamic-titled PageHeader for individual module routes.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/modulos/[moduleKey]/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] Title resolved from module catalog by `moduleKey`; falls back to `Módulo` for invalid slugs
  - [ ] Breadcrumb `Inicio › Módulos › <Module name or slug>`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/modulos/[moduleKey]`

### T-023. Migrate /dashboard/estadisticas page to PageHeader
- **Goal**: Render PageHeader on estadisticas page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/estadisticas/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Estadísticas</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Estadísticas`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/estadisticas`

### T-024. Migrate /dashboard/verificacion page to PageHeader
- **Goal**: Render PageHeader on verificacion page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/verificacion/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Verificación</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Verificación`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/verificacion`

### T-025. Migrate /dashboard/configuracion page to PageHeader
- **Goal**: Render PageHeader on configuracion page.
- **Files**:
  - MODIFY: `apps/medico/web/src/app/dashboard/configuracion/page.tsx`
- **Acceptance criteria**:
  - [ ] Imports `PageHeader` from `@/components/shell`
  - [ ] `<PageHeader.Title>Configuración</PageHeader.Title>`
  - [ ] Breadcrumb `Inicio › Configuración`
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-013
- **Estimated effort**: S
- **Commit message**: `refactor(medico/web): use PageHeader on /dashboard/configuracion`

### T-026. Verify no imports of old shell paths remain
- **Goal**: Prove orphan status of legacy shell files before deleting.
- **Files**:
  - (no edits)
- **Acceptance criteria**:
  - [ ] `rg "app/dashboard/dashboard-shell" apps/medico/web/src` returns 0 matches
  - [ ] `rg "components/dashboard/sidebar" apps/medico/web/src` returns 0 matches
  - [ ] `rg "components/dashboard/layout/dashboard-sidebar" apps/medico/web/src` returns 0 matches
  - [ ] If any match remains, fix the importer first and re-run; do NOT proceed to deletions
- **Verification command(s)**:
  - `rg "app/dashboard/dashboard-shell" apps/medico/web/src --files-with-matches`
  - `rg "components/dashboard/sidebar" apps/medico/web/src --files-with-matches`
  - `rg "components/dashboard/layout/dashboard-sidebar" apps/medico/web/src --files-with-matches`
- **Depends on**: T-014, T-015, T-016, T-017, T-018, T-019, T-020, T-021, T-022, T-023, T-024, T-025
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): verify orphan status of legacy shell files`

### T-027. Delete old app/dashboard/dashboard-shell.tsx
- **Goal**: Remove the legacy shell file now confirmed orphan.
- **Files**:
  - DELETE: `apps/medico/web/src/app/dashboard/dashboard-shell.tsx`
- **Acceptance criteria**:
  - [ ] File no longer exists on disk
  - [ ] `pnpm --filter @red-salud/medico-web typecheck` still passes
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-026
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): delete legacy dashboard-shell.tsx`

### T-028. Delete components/dashboard/sidebar.tsx
- **Goal**: Remove the legacy sidebar component (called `getSpecialtyMenuGroups`).
- **Files**:
  - DELETE: `apps/medico/web/src/components/dashboard/sidebar.tsx`
- **Acceptance criteria**:
  - [ ] File no longer exists on disk
  - [ ] `pnpm --filter @red-salud/medico-web typecheck` still passes
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-026
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): delete legacy components/dashboard/sidebar.tsx`

### T-029. Delete components/dashboard/layout/dashboard-sidebar.tsx
- **Goal**: Remove the TODO-stub sidebar file.
- **Files**:
  - DELETE: `apps/medico/web/src/components/dashboard/layout/dashboard-sidebar.tsx`
- **Acceptance criteria**:
  - [ ] File no longer exists on disk
  - [ ] If `apps/medico/web/src/components/dashboard/layout/` is empty after deletion, remove the directory
  - [ ] `pnpm --filter @red-salud/medico-web typecheck` still passes
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-026
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): delete legacy layout/dashboard-sidebar.tsx`

### T-030. Run typecheck across medico/web
- **Goal**: Confirm zero TS errors after the full migration.
- **Files**:
  - (no edits)
- **Acceptance criteria**:
  - [ ] `pnpm --filter @red-salud/medico-web typecheck` exits with code 0
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web typecheck`
- **Depends on**: T-027, T-028, T-029
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): typecheck after shell migration`

### T-031. Run lint across medico/web
- **Goal**: Confirm zero lint errors after the migration.
- **Files**:
  - (no edits)
- **Acceptance criteria**:
  - [ ] `pnpm --filter @red-salud/medico-web lint` exits with code 0
- **Verification command(s)**:
  - `pnpm --filter @red-salud/medico-web lint`
- **Depends on**: T-027, T-028, T-029
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): lint after shell migration`

### T-032. Grep guards (no cross-app imports, no direct supabase signOut, no clinic strings, no phantom links)
- **Goal**: Confirm domain isolation, auth-sdk usage, no clinic/org leakage, and zero phantom URLs in shell.
- **Files**:
  - (no edits)
- **Acceptance criteria**:
  - [ ] `rg "from ['\"]@/.*apps/" apps/medico/web/src` returns 0 matches
  - [ ] `rg "from ['\"]apps/" apps/medico/web/src` returns 0 matches
  - [ ] `rg "supabase\.auth\.signOut" apps/medico/web/src/components/shell` returns 0 matches
  - [ ] `rg -i "Sedes|Personal|Hospitalización|Quirófano|Multi-org|Organización|RCM|Reclamos" apps/medico/web/src/components/shell` returns 0 matches
  - [ ] `rg "/dashboard/medico/" apps/medico/web/src/components/shell` returns 0 matches
  - [ ] `rg "themeColor" apps/medico/web/src/components/shell` returns 0 matches
- **Verification command(s)**:
  - listed above
- **Depends on**: T-030, T-031
- **Estimated effort**: XS
- **Commit message**: `chore(medico/web): grep guards for shell domain isolation`

### T-033. Manual smoke + Playwright snapshot
- **Goal**: Confirm runtime behavior at desktop and mobile viewports for all 11 pages.
- **Files**:
  - (no edits — runtime verification only)
- **Acceptance criteria**:
  - [ ] Login as `medico1` and visit all 11 dashboard routes; zero console errors per route
  - [ ] At ≥1024px: sidebar fixed (does not move on scroll); collapse toggle works; localStorage `medico:sidebar-collapsed` persists across full reload
  - [ ] At <1024px: top bar pinned, bottom nav pinned, content not hidden behind bottom nav, hamburger opens Sheet, Sheet link navigates and closes
  - [ ] User-menu dropdown opens with Tab/Enter; Escape closes it
  - [ ] Theme submenu (flat radio group) switches Claro/Oscuro/Auto without errors
  - [ ] `Cerrar sesión` redirects to `/auth/login` and prevents `/dashboard` access until login
  - [ ] Phantom links: DOM contains zero `/dashboard/medico/medicina-general/` URLs (Playwright assertion)
  - [ ] `Verificación` shows `Próximamente` badge expanded; tooltip on collapsed
  - [ ] Visual snapshots captured at 375 / 768 / 1024 / 1440 for `/dashboard`, `/dashboard/pacientes`, `/dashboard/consulta`, `/dashboard/agenda`, `/dashboard/configuracion`, `/dashboard/verificacion`
- **Verification command(s)**:
  - manual + Playwright (per project conventions)
- **Depends on**: T-032
- **Estimated effort**: M
- **Commit message**: `test(medico/web): smoke + visual regression for new shell`

## Dependency graph

```
T-001 ──┬── T-002 ──┬── T-008 ──┐
        │           │           │
        ├── T-004 ──┴── T-005 ──┤
        │                       ├── T-012 ──── T-013 ──┬── T-014 ───┐
        ├── T-006 ──────────────┤                      │            │
        │                       │                      ├── T-015 ───┤
        └── T-007 ──────────────┤                      ├── T-016 ───┤
                                │                      ├── T-017 ───┤
T-003 ──────────────────────────┤                      ├── T-018 ───┤
                                │                      ├── T-019 ───┤
T-009 ──────────────────────────┤                      ├── T-020 ───┤
                                │                      ├── T-021 ───┤
T-010 ──────────────────────────┤                      ├── T-022 ───┤
                                │                      ├── T-023 ───┤
T-011 ──────────────────────────┘                      ├── T-024 ───┤
                                                       └── T-025 ───┤
                                                                    ▼
                                                               T-026 ──┬── T-027 ──┐
                                                                       ├── T-028 ──┤
                                                                       └── T-029 ──┤
                                                                                   ▼
                                                                            T-030 ─┬─ T-032 ── T-033
                                                                            T-031 ─┘
```

Notes:
- T-002, T-004, T-005, T-006, T-007 only need T-001 (types). They can run in parallel.
- T-009, T-011 only need T-001/T-002. They can run in parallel with T-008/T-010.
- T-015..T-025 (page migrations) depend only on T-013 — fully parallelizable across 11 lanes.
- T-027, T-028, T-029 are independent deletions; can run in any order after T-026.
- T-030 and T-031 are independent; either order.

## Definition of Done for the entire change
- [ ] All 17 spec validation checklist items pass (see `spec.md` Validation checklist)
- [ ] `pnpm --filter @red-salud/medico-web typecheck` exits 0
- [ ] `pnpm --filter @red-salud/medico-web lint` exits 0
- [ ] No grep matches for old shell paths in `apps/medico/web/src` (`app/dashboard/dashboard-shell`, `components/dashboard/sidebar`, `components/dashboard/layout/dashboard-sidebar`)
- [ ] No cross-app imports (`rg "from ['\"]@/.*apps/" apps/medico/web/src` and `rg "from ['\"]apps/" apps/medico/web/src` both return 0)
- [ ] Logout uses `@red-salud/auth-sdk` (no `supabase.auth.signOut` in `components/shell/`)
- [ ] All 11 dashboard pages render without console errors and use `<PageHeader>`
- [ ] Sidebar stays anchored on scroll at ≥1024px (manual test)
- [ ] localStorage `medico:sidebar-collapsed` persists across reloads
- [ ] Mobile bottom nav appears at <1024px viewport and is hidden at ≥1024px
- [ ] Zero `/dashboard/medico/<slug>/` URLs in DOM for any specialty (medico1..5)
- [ ] `Verificación` entry shows `Próximamente` badge (expanded) and dot+tooltip (collapsed)
- [ ] Theme picker is a flat `DropdownMenuRadioGroup` (Claro/Oscuro/Auto) — not a Radix Sub menu
- [ ] No clinic/org strings (`Sedes`, `Personal`, `Hospitalización`, `Quirófano`, `Multi-org`, `Organización`, `RCM`, `Reclamos`) in shell
- [ ] `themeColor` constant removed from shell
