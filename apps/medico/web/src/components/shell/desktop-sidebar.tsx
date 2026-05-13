'use client';

import { PanelLeftClose, PanelLeftOpen, Stethoscope } from 'lucide-react';

import { NAV_GROUPS } from './nav-data';
import { NavGroup } from './nav-group';
import type { NavGroupData } from './types';
import { UserMenuDropdown } from './user-menu-dropdown';

/**
 * @file desktop-sidebar.tsx
 * @description Desktop sidebar shell (T-008).
 *
 * Fixed-position rail rendered only at `lg+` breakpoints. Collapses between
 * `w-72` (expanded) and `w-16` (icon-only). Composes:
 *
 * - Header: brand mark + "Red Salud" wordmark + "Consultorio Médico" subtitle.
 *   The wordmark + subtitle hide when collapsed; only the mark remains visible.
 * - Body: scrollable list of `<NavGroup>` instances driven by `NAV_GROUPS`.
 * - Footer: `<UserMenuDropdown>` (always rendered; renders compact in collapsed mode).
 *
 * The collapse button uses `PanelLeftClose` / `PanelLeftOpen` icons and rotates
 * its `aria-label` between "Colapsar menú" and "Expandir menú" so screen
 * readers always know what the next click will do.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 *
 * ## medico-shell-supabase-style (Phase 1)
 * When `NEXT_PUBLIC_FEATURE_NEW_SHELL === 'true'`, the collapsed rail SHALL
 * shrink to `w-12` (48px) — Supabase-style icon rail. With the flag off or
 * missing, the legacy `w-16` (64px) collapsed width is preserved. See spec
 * `app-shell-medico` R1 + R8.
 */
const NEW_SHELL_COLLAPSED_WIDTH = 'lg:w-12';
const LEGACY_COLLAPSED_WIDTH = 'lg:w-16';

function isNewShellEnabled(): boolean {
  // Read at call time so vi.stubEnv works under jsdom; Next.js inlines
  // NEXT_PUBLIC_* at build time at runtime in the browser bundle.
  return process.env.NEXT_PUBLIC_FEATURE_NEW_SHELL === 'true';
}

export interface DesktopSidebarProps {
  /** Doctor display name (forwarded to the user menu). */
  doctorName: string;
  /** Doctor email (forwarded to the user menu). */
  email: string;
  /** Avatar URL or `null` to render initials fallback. */
  avatarUrl: string | null;
  /** Specialty display name. Reserved for future header use; not rendered in Phase 1. */
  specialtyName: string;
  /** Current collapse state. */
  collapsed: boolean;
  /** Callback fired when the user clicks the header collapse/expand button. */
  onToggleCollapse: () => void;
  /**
   * Dynamic nav groups (Phase 2 capability engine). When omitted, falls back
   * to the static `NAV_GROUPS`. The shell composes this via
   * `mergeWithStaticFallback(resolverResult.navGroups)`.
   */
  groups?: NavGroupData[];
}

export function DesktopSidebar({
  doctorName,
  email,
  avatarUrl,
  specialtyName: _specialtyName,
  collapsed,
  onToggleCollapse,
  groups,
}: DesktopSidebarProps): React.ReactElement {
  const resolvedGroups = groups ?? NAV_GROUPS;

  // Width transition is animated; `overflow-hidden` keeps wordmark/labels from
  // bleeding past the rail during the collapse animation.
  const collapsedWidthClass = isNewShellEnabled()
    ? NEW_SHELL_COLLAPSED_WIDTH
    : LEGACY_COLLAPSED_WIDTH;
  const widthClass = collapsed ? collapsedWidthClass : 'lg:w-72';

  const toggleAriaLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col',
        'border-r bg-background shadow-[1px_0_8px_0_rgba(0,0,0,0.04)]',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        widthClass,
      ].join(' ')}
    >
      {/* Header: brand + collapse toggle */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b bg-gradient-to-r from-primary/5 to-transparent px-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold leading-tight text-primary">Red Salud</span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              Consultorio Médico
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={toggleAriaLabel}
          className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ToggleIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body: scrollable nav groups + footer */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {resolvedGroups.map((group) => (
            <NavGroup key={group.key} group={group} collapsed={collapsed} />
          ))}
        </div>

        <div className="border-t bg-muted/20 p-3">
          <UserMenuDropdown
            doctorName={doctorName}
            email={email}
            avatarUrl={avatarUrl}
            collapsed={collapsed}
          />
        </div>
      </div>
    </aside>
  );
}
