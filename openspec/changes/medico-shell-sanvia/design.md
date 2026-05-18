# Design — medico-shell-sanvia

Phase 1 AppShell rework for `apps/medico/web`. Concrete architecture for the shell skeleton, sidebar, mobile chrome, user menu, and `<PageHeader>` slot system. Individual doctor practice ONLY — no clinic/org features.

## Component tree

```
DashboardLayout (server: app/dashboard/layout.tsx)
  ├─ supabase.auth.getUser() (existing)
  ├─ Fetch doctor_profiles + specialty + profile (existing)
  └─ <DashboardShell doctorName email avatarUrl specialtyName specialtySlug sacsEspecialidad>   ['use client']
        ├─ <DesktopSidebar collapsed onToggle doctorName email avatarUrl specialtyName>   (lg+ only, fixed)
        │     ├─ <SidebarHeader logo title collapseButton>              (logo + collapse chevron)
        │     ├─ <SidebarNav>                                           (scrollable; uses NAV_GROUPS + NavGroup + NavLink)
        │     │     ├─ <NavGroup label="Principal">
        │     │     │     └─ <NavLink ... /> × N
        │     │     └─ <NavGroup label="Configuración">
        │     │           └─ <NavLink ... /> × N  (verificación shows "Próximamente" badge)
        │     └─ <SidebarFooter>
        │           └─ <UserMenuDropdown doctorName email avatarUrl collapsed>
        │                 ├─ DropdownTrigger: avatar + name + email (or only avatar when collapsed)
        │                 └─ DropdownContent:
        │                       ├─ Header: avatar + name + email + sacs badge
        │                       ├─ Mi perfil                → /dashboard/configuracion
        │                       ├─ Verificación SACS        → /dashboard/verificacion
        │                       ├─ ── separator ──
        │                       ├─ Tema (RadioGroup flat: Claro / Oscuro / Auto)
        │                       ├─ ── separator ──
        │                       ├─ Configuración            → /dashboard/configuracion
        │                       └─ Cerrar sesión            → useAuth().signOut() + router.push('/auth/login')
        ├─ <MobileTopBar onOpenSheet>                                   (lg:hidden, sticky top, hamburger)
        ├─ <MobileSidebarSheet open onClose ...nav-props>               (lg:hidden, Radix Sheet, mirrors desktop nav)
        ├─ <main lg:pl-72  /  lg:pl-16>                                 (left padding switches with collapse state)
        │     └─ {page renders <PageHeader> + body content}
        └─ <MobileBottomNav>                                            (lg:hidden, fixed bottom, 5 items, safe-area)
```

## File layout

### New files
| Path | Purpose |
|------|---------|
| `apps/medico/web/src/components/shell/dashboard-shell.tsx` | Client component orchestrating shell layout; replaces deleted file. |
| `apps/medico/web/src/components/shell/desktop-sidebar.tsx` | Desktop sidebar (lg+), fixed positioned. |
| `apps/medico/web/src/components/shell/mobile-top-bar.tsx` | Mobile sticky header (logo + hamburger). |
| `apps/medico/web/src/components/shell/mobile-sidebar-sheet.tsx` | Radix Sheet wrapping nav for mobile. |
| `apps/medico/web/src/components/shell/mobile-bottom-nav.tsx` | Bottom nav 5 items, lg:hidden, fixed. |
| `apps/medico/web/src/components/shell/page-header.tsx` | Slot-based PageHeader compound component. |
| `apps/medico/web/src/components/shell/user-menu-dropdown.tsx` | Avatar dropdown in sidebar footer. |
| `apps/medico/web/src/components/shell/nav-data.ts` | Static `NAV_GROUPS` + `BOTTOM_NAV_ITEMS`. Source of truth for desktop + mobile nav. |
| `apps/medico/web/src/components/shell/nav-link.tsx` | Reusable `<NavLink>` with active state, collapsed/tooltip mode, badge. |
| `apps/medico/web/src/components/shell/nav-group.tsx` | Reusable `<NavGroup>` heading + items wrapper. |
| `apps/medico/web/src/components/shell/types.ts` | `NavLinkData`, `NavGroupData`, `DashboardShellProps`, `PageHeaderProps`. |
| `apps/medico/web/src/components/shell/index.ts` | Barrel: re-exports `DashboardShell` and `PageHeader`. |
| `apps/medico/web/src/hooks/use-sidebar-collapsed.ts` | Custom hook: localStorage-backed collapse state, SSR-safe. |

### Modified files
| Path | Change |
|------|--------|
| `apps/medico/web/src/app/dashboard/layout.tsx` | Import `<DashboardShell>` from `@/components/shell` (new path); pass `email` (from `user.email`) in addition to existing props. |
| `apps/medico/web/src/components/dashboard/sidebar.tsx` | Stop calling `getSpecialtyMenuGroups()` and rendering `specialtyGroups` block; remove `moduleNavItems` block; keep file usable until layout migration is done, then it becomes orphan and gets deleted. |
| `apps/medico/web/src/app/dashboard/page.tsx` | Replace inline `<h1>` greeting block with `<PageHeader>` (Title + Meta + Actions for "Actualizar" button). |
| `apps/medico/web/src/app/dashboard/agenda/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/pacientes/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/consulta/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/recetas/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/mensajes/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/modulos/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/modulos/[moduleKey]/page.tsx` | `<h1>` → `<PageHeader>` (with `<PageHeader.Breadcrumb>`). |
| `apps/medico/web/src/app/dashboard/estadisticas/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/configuracion/page.tsx` | `<h1>` → `<PageHeader>`. |
| `apps/medico/web/src/app/dashboard/verificacion/page.tsx` | `<h1>` → `<PageHeader>`. |

Total dashboard pages migrated: **11** (`/dashboard`, `/agenda`, `/pacientes`, `/consulta`, `/recetas`, `/mensajes`, `/modulos`, `/modulos/[moduleKey]`, `/estadisticas`, `/configuracion`, `/verificacion`).

### Deleted files
| Path | Reason |
|------|--------|
| `apps/medico/web/src/app/dashboard/dashboard-shell.tsx` | Replaced by `components/shell/dashboard-shell.tsx`. Verified: only imported by `app/dashboard/layout.tsx`. |
| `apps/medico/web/src/components/dashboard/layout/dashboard-sidebar.tsx` | TODO stub (17 LOC), unused outside of itself. |
| `apps/medico/web/src/components/dashboard/sidebar.tsx` | After all imports flip to `<DashboardShell>` from new path, this file becomes orphan. Delete in same change to avoid dead code. |

## Types

```typescript
// apps/medico/web/src/components/shell/types.ts
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavLinkData {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;          // e.g., "Próximamente"
  disabled?: boolean;      // visual disable for "Próximamente" entries
}

export interface NavGroupData {
  key: string;
  label: string;           // e.g., "Principal"
  items: NavLinkData[];
}

export interface DashboardShellProps {
  doctorName: string;
  email: string;
  avatarUrl: string | null;
  specialtyName: string;
  specialtySlug: string | null;     // kept for downstream pages, NOT used by shell
  sacsEspecialidad: string | null;  // ditto
  userId: string;                   // kept for downstream pages
  children: ReactNode;
}

export interface PageHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface PageHeaderBreadcrumbItem {
  label: string;
  href?: string;
}
```

## Key APIs

### `useSidebarCollapsed()` hook
```typescript
// apps/medico/web/src/hooks/use-sidebar-collapsed.ts
export function useSidebarCollapsed(): {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
};
// On mount: read localStorage 'medico:sidebar-collapsed' (string '1' = true).
// Initial render returns false (SSR-safe). Hydrates from storage in useEffect.
// On toggle/setCollapsed: write localStorage.
// Wrapped in try/catch to survive privacy mode where storage throws.
```

### `<PageHeader>` compound component
```tsx
// apps/medico/web/src/components/shell/page-header.tsx
<PageHeader>
  <PageHeader.Breadcrumb items={[{label: 'Pacientes', href: '/dashboard/pacientes'}, {label: 'María Pérez'}]} />
  <PageHeader.Title>María Pérez · 34a · F</PageHeader.Title>
  <PageHeader.Meta>HTA controlada · Alergia penicilina</PageHeader.Meta>
  <PageHeader.Actions>
    <Button variant="outline">Pausar</Button>
    <Button variant="primary">Finalizar</Button>
  </PageHeader.Actions>
</PageHeader>
```

API surface:
- `PageHeader` — root flex container, renders breadcrumbs row above title row.
- `PageHeader.Breadcrumb` — uses `@red-salud/design-system` `Breadcrumbs` with explicit `items`.
- `PageHeader.Title` — semantic `<h1 className="text-2xl font-bold tracking-tight">`.
- `PageHeader.Meta` — small secondary text below title (`text-sm text-muted-foreground`).
- `PageHeader.Actions` — right-aligned slot for buttons; mobile drops to second row.

Implementation pattern (named exports attached to function, no Context — slot lookup via `React.Children.toArray` filtering by `displayName`).

### `<UserMenuDropdown>` props
```typescript
// apps/medico/web/src/components/shell/user-menu-dropdown.tsx
interface UserMenuDropdownProps {
  doctorName: string;
  email: string;
  avatarUrl: string | null;
  specialtyName?: string;
  collapsed?: boolean;             // when sidebar is collapsed → trigger shows only avatar
}

// Uses DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
//      DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup,
//      DropdownMenuRadioItem  from @red-salud/design-system
// Calls useAuth().signOut() on logout
// Calls useTheme() (from @red-salud/design-system theme-context) for theme radio
```

### `<DashboardShell>` props
```typescript
// apps/medico/web/src/components/shell/dashboard-shell.tsx
'use client';
export function DashboardShell(props: DashboardShellProps): JSX.Element;
// Internally: useSidebarCollapsed() + useState for mobile sheet open.
// Renders: DesktopSidebar + MobileTopBar + MobileSidebarSheet + main + MobileBottomNav.
```

## Static nav structure (Fase 1 — pre capability engine)

```typescript
// apps/medico/web/src/components/shell/nav-data.ts
import {
  Home, Calendar, Users, Stethoscope, Pill, MessageSquare,
  BarChart3, ShieldCheck, Settings,
} from 'lucide-react';
import type { NavGroupData, NavLinkData } from './types';

export const NAV_GROUPS: NavGroupData[] = [
  {
    key: 'principal',
    label: 'Principal',
    items: [
      { key: 'inicio',    label: 'Inicio',     href: '/dashboard',           icon: Home },
      { key: 'agenda',    label: 'Agenda',     href: '/dashboard/agenda',    icon: Calendar },
      { key: 'pacientes', label: 'Pacientes',  href: '/dashboard/pacientes', icon: Users },
      { key: 'consulta',  label: 'Consulta',   href: '/dashboard/consulta',  icon: Stethoscope },
      { key: 'recetas',   label: 'Recetas',    href: '/dashboard/recetas',   icon: Pill },
      { key: 'mensajes',  label: 'Mensajes',   href: '/dashboard/mensajes',  icon: MessageSquare },
    ],
  },
  {
    key: 'configuracion',
    label: 'Configuración',
    items: [
      { key: 'estadisticas',  label: 'Estadísticas',  href: '/dashboard/estadisticas',  icon: BarChart3 },
      { key: 'verificacion',  label: 'Verificación',  href: '/dashboard/verificacion',  icon: ShieldCheck, badge: 'Próximamente' },
      { key: 'configuracion', label: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavLinkData[] = [
  { key: 'inicio',    label: 'Inicio',     href: '/dashboard',           icon: Home },
  { key: 'pacientes', label: 'Pacientes',  href: '/dashboard/pacientes', icon: Users },
  { key: 'atender',   label: 'Atender',    href: '/dashboard/consulta',  icon: Stethoscope },  // CTA central, visually emphasized
  { key: 'recetas',   label: 'Recetas',    href: '/dashboard/recetas',   icon: Pill },
  { key: 'perfil',    label: 'Perfil',     href: '/dashboard/configuracion', icon: Settings },
];
```

## Layout CSS strategy

Tailwind 4 utility classes; no CSS modules.

| Element | Classes |
|---------|---------|
| `<DashboardShell>` root | `flex min-h-screen w-full bg-muted/40` |
| `<DesktopSidebar>` | `fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-card border-r border-border transition-[width] duration-300 ${collapsed ? 'lg:w-16' : 'lg:w-72'}` |
| `<DesktopSidebar>` nav scroll body | `flex-1 overflow-y-auto px-3 py-4` |
| `<DesktopSidebar>` footer | `border-t border-border p-3` |
| `<main>` | `flex-1 ${collapsed ? 'lg:pl-16' : 'lg:pl-72'} transition-[padding] duration-300 flex flex-col min-w-0` |
| Page container (inside `<main>`) | `px-4 sm:px-6 lg:px-8 pt-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-8` |
| `<MobileTopBar>` | `sticky top-0 z-30 h-14 lg:hidden bg-background/95 backdrop-blur border-b flex items-center justify-between px-4` |
| `<MobileSidebarSheet>` | uses `Sheet` from `@red-salud/design-system`, side `left`, width `w-72` |
| `<MobileBottomNav>` | `fixed bottom-0 inset-x-0 z-30 lg:hidden bg-background border-t pb-[env(safe-area-inset-bottom)] grid grid-cols-5 h-16` |
| `<MobileBottomNav>` "Atender" CTA item | larger (`-mt-4` to lift above nav line) + filled primary background |
| `<NavLink>` active | `bg-primary/10 text-primary` (semantic, no per-specialty theme color) |
| `<NavLink>` collapsed | icon-only, `Tooltip` from design-system on hover showing label |
| `<PageHeader>` | `flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pb-4 mb-4 border-b border-border` |
| `<PageHeader.Title>` | `text-2xl font-bold tracking-tight text-foreground` |
| `<PageHeader.Meta>` | `text-sm text-muted-foreground` |
| `<PageHeader.Actions>` | `flex items-center gap-2 shrink-0` |
| `<PageHeader.Breadcrumb>` | wraps Breadcrumbs, `mb-1` |

## SSR/CSR hydration strategy

- `<DashboardShell>` is `'use client'` (state, localStorage).
- Server-rendered HTML uses `collapsed = false` (expanded). Client mounts, reads `localStorage['medico:sidebar-collapsed']`, calls `setCollapsed(true)` if set. There is a single-frame visual flash if user previously collapsed.
- Mitigation deferred to Fase 2: cookie-based collapse state read in server layout. Current trade-off accepted because collapse is non-critical chrome.
- `useSidebarCollapsed` returns `false` on first render to match server output, then hydrates in `useEffect`.

```typescript
// apps/medico/web/src/hooks/use-sidebar-collapsed.ts
const STORAGE_KEY = 'medico:sidebar-collapsed';
export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === '1') setCollapsedState(true);
    } catch { /* ignore */ }
  }, []);
  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); }
    catch { /* ignore */ }
  }, []);
  const toggle = useCallback(() => setCollapsed(prev => !prev), [setCollapsed]);
  // ... return values
}
```

## Theme toggle inside dropdown — Radix decision

- **Decision**: use `<DropdownMenuRadioGroup>` flat (no submenu). Three `<DropdownMenuRadioItem>`: Claro / Oscuro / Auto.
- **Why**: nested Radix `Sub` menus interact poorly with portals on mobile (touch-tap propagation issues). Flat radio group is simpler, accessible, ships immediately.
- **Source of truth**: existing `useTheme()` from `@red-salud/design-system` (`lib/contexts/theme-context`). The dropdown reads `theme` and calls `setTheme('light' | 'dark' | 'system')`.
- Radio `value` mirrors theme name. The shipped `ThemeToggle` component itself is **not** used inside the dropdown (it's a standalone segmented control); we wire up our own radio items because we want the menu structure.

## Logout flow

```typescript
// inside <UserMenuDropdown>
'use client';
import { useAuth } from '@red-salud/auth-sdk';
import { useRouter } from 'next/navigation';
import { useToast } from '@red-salud/design-system';

const { signOut } = useAuth();
const router = useRouter();
const { toast } = useToast();

async function handleLogout() {
  try {
    await signOut();              // packages/auth-sdk/src/provider.tsx:95
    router.push('/auth/login');
    router.refresh();             // ensure server components re-evaluate auth
  } catch (err) {
    toast({ title: 'No se pudo cerrar sesión', variant: 'destructive' });
  }
}
```

Hard rule (verified by grep in success criteria): zero direct calls to `supabase.auth.signOut()` inside `components/shell/`.

## Phantom-link neutralization

- `getSpecialtyMenuGroups()` and the 100+ override files in `lib/specialties/overrides/*` are **not modified**. The function keeps returning data for any consumer; our new sidebar simply does not call it.
- `components/dashboard/sidebar.tsx`: deleted in this change because the new `<DesktopSidebar>` lives at `components/shell/desktop-sidebar.tsx`. Before deletion, verify with grep that no other file imports from `components/dashboard/sidebar.tsx`.
- New nav comes exclusively from `nav-data.ts` (static `NAV_GROUPS`).

## Trade-offs

| Decision | Pro | Con | Why we chose it |
|----------|-----|-----|-----------------|
| `lg:` (1024px) breakpoint for desktop sidebar | Tablet portrait gets full content; mobile chrome is consistent with phone | Sidebar hidden 768–1023px (iPad portrait) | 288px sidebar on iPad portrait crowds content; matches existing app patterns |
| `localStorage` for collapse state (not cookies) | Simple, fast, no roundtrip | Single-frame hydration flash if user collapsed previously | Cookie path is Fase 2; flash is non-critical |
| Compound `<PageHeader>` (slots) | Composable, explicit, no implicit context | More code per page than a `useHeader({title, ...})` hook | Easier to debug, no provider needed, matches Radix idioms |
| Separate `<DesktopSidebar>` and `<MobileSidebarSheet>` (not a single conditional component) | Clean responsibilities, no `if isMobile` spaghetti | Some structural duplication of the nav block | Both consume the same `NAV_GROUPS` + `<NavGroup>` + `<NavLink>` so duplication is visual/CSS only |
| Delete old `dashboard-shell.tsx` immediately (no compat wrapper) | Repo is clean, no zombie file | Risk if external module imports it | Verified: only consumer is `app/dashboard/layout.tsx`, which we update in same PR |
| Flat radio theme picker (not Radix Sub) | Predictable on mobile, less DOM, ships now | Looks slightly busier than a labeled submenu | Nested Sub portal issues on mobile are not worth the visual upgrade |
| Static `NAV_GROUPS` (not specialty-driven) | Phantom links solved at root; predictable for all 5 test doctors | Specialty-aware modules section disappears in Fase 1 | Fase 2 capability engine replaces this; specialty navigation is broken today, removing it is a strict improvement |
| Mobile bottom nav with central "Atender" CTA → `/dashboard/consulta` | Matches doctor mental model (the page where consultations happen) | Could be ambiguous if doctor reads "Atender" as "start a new consult" but lands on the list | Clarified copy on the page itself in Fase 2; ship with this href now |

## Test strategy

### Visual regression (manual; Playwright in Fase 2)
- Screenshots before vs after for: `/dashboard`, `/dashboard/pacientes`, `/dashboard/consulta`, `/dashboard/agenda`, `/dashboard/configuracion`, `/dashboard/verificacion`.
- Across breakpoints: 375 (iPhone SE), 768 (iPad portrait), 1024 (transition), 1440 (desktop).

### Behavior checks
- Sidebar fixed: scroll page → sidebar stays put.
- Collapse persistence: collapse → reload → sidebar returns collapsed.
- Logout: click "Cerrar sesión" → redirect to `/auth/login`, no auth-error.
- Phantom links: log in as `medico1` (Medicina General), verify no `/dashboard/medico/medicina-general/*` links visible anywhere.
- "Próximamente" badge: `/dashboard/verificacion` link in sidebar shows badge.
- Mobile menu: at 375px, hamburger opens Sheet, Sheet closes on link click, bottom nav present and clickable.
- Theme switch: in user menu, switching radio changes data-theme, persists to localStorage (existing behavior of `useTheme`).

### Static checks (CI)
- `pnpm typecheck` clean.
- `pnpm lint` clean.
- Grep guards (manual or as CI script):
  - `rg "supabase\.auth\.signOut" apps/medico/web/src/components/shell/` → 0 results.
  - `rg "from ['\"](?:apps/clinica|apps/farmacia|apps/paciente)" apps/medico/web/src/` → 0 results.
  - `rg "from ['\"]@/components/dashboard/sidebar['\"]" apps/medico/web/src/` → 0 results (orphan check before delete).

### Manual QA matrix (5 test doctors)
| Doctor | Specialty | Verified | Expected shell behavior |
|--------|-----------|----------|--------------------------|
| medico1 | Medicina General | unverified | Same shell, "Verificación · Próximamente" badge visible |
| medico2 | Medicina General | sacs_verified | Same shell, no specialty-only links |
| medico3 | Medicina Interna | sacs_verified | Same shell |
| medico4 | Infectología | sacs_verified | Same shell |
| medico5 | Urología | sacs_verified | Same shell |

Identical chrome across all 5 — Fase 1 is intentionally specialty-agnostic.

## Open questions for sdd-tasks

None blocking.
