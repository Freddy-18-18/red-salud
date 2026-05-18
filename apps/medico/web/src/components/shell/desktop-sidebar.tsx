'use client';

import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

import type { SidebarMode } from '../../hooks/use-sidebar-mode';

import { NAV_GROUPS } from './nav-data';
import { NavGroup } from './nav-group';
import { SidebarModeSwitcher } from './sidebar-mode-switcher';
import type { NavGroupData } from './types';

/**
 * @file desktop-sidebar.tsx
 * @description Desktop sidebar shell — Supabase-style three-mode rail.
 *
 * Three modes (see `useSidebarMode`):
 *   - `collapsed` → narrow icon-only rail, never expands on hover.
 *   - `expanded`  → wide panel always visible (icons + labels).
 *   - `hover`     → narrow icon rail; on mouse enter the panel expands as a
 *                   FLOATING OVERLAY (does not push the main content) with a
 *                   soft elevation shadow. On mouse leave it collapses.
 *
 * The mode switcher lives at the foot of the rail (in place of the legacy
 * user-menu, which moved to the global header).
 *
 * Mounted only on `lg+`. Mobile uses `MobileSidebarSheet`.
 */

const RAIL_WIDTH = 'w-14'; // 56px — Supabase-canonical icon-rail width.
const PANEL_WIDTH = 'w-64'; // 256px — expanded panel width.

export interface DesktopSidebarProps {
  /** Specialty display name (kept for backwards-compat; rendered as subtitle). */
  specialtyName?: string;
  /** Current sidebar mode. */
  mode: SidebarMode;
  /** Updates the mode (persisted). */
  onChangeMode: (next: SidebarMode) => void;
  /** Whether the panel should currently render expanded (derived in the hook). */
  isExpanded: boolean;
  /** Whether the panel is in floating-overlay state (mode='hover' && hovering). */
  isHoverExpanded: boolean;
  /** Mouse-enter handler (drives hover-expand for mode='hover'). */
  onMouseEnter: () => void;
  /** Mouse-leave handler. */
  onMouseLeave: () => void;
  /**
   * Dynamic nav groups (Phase 2 capability engine). When omitted, falls back
   * to static `NAV_GROUPS`.
   */
  groups?: NavGroupData[];
}

export function DesktopSidebar({
  specialtyName: _specialtyName,
  mode,
  onChangeMode,
  isExpanded,
  isHoverExpanded,
  onMouseEnter,
  onMouseLeave,
  groups,
}: DesktopSidebarProps): React.ReactElement {
  const resolvedGroups = groups ?? NAV_GROUPS;

  // The rail always occupies w-14 in the layout (so the main content reflows
  // ONLY when `mode='expanded'`). For `mode='hover'` and `mode='collapsed'`,
  // the rail occupies w-14; the expanded panel in `mode='hover'` floats over
  // the content with absolute positioning + shadow.
  const isOverlay = isHoverExpanded;

  // Resolved width applied to the rendered <aside>:
  //   - mode='expanded'                 → w-64 (rail occupies full width)
  //   - mode='hover' && hovering        → w-64 (floats over content)
  //   - mode='hover' && !hovering       → w-14 (rail only)
  //   - mode='collapsed'                → w-14 (rail only)
  const widthClass = isExpanded ? PANEL_WIDTH : RAIL_WIDTH;

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label="Navegación principal"
      className={[
        // Starts BELOW the global header (h-14 = 56px = top-14).
        'fixed top-14 bottom-0 left-0 hidden lg:flex flex-col',
        'border-r border-border bg-card',
        'transition-[width,box-shadow] duration-200 ease-out motion-reduce:transition-none',
        widthClass,
        // z-index: en modo flotante (hover-expanded) sube a z-40 para tapar
        // los sticky headers de página (ej: la fila de días del calendario
        // en /dashboard/agenda usa z-30 y sin esto se solapaba con el panel).
        // Modal/dialog usan z-50, así que el sidebar sigue quedando debajo.
        isOverlay ? 'z-40' : 'z-30',
        // Floating overlay for hover-expanded state: elevation shadow to make
        // it read as a temporary panel, not a layout shift.
        isOverlay ? 'shadow-xl shadow-foreground/10' : 'shadow-none',
      ].join(' ')}
    >
      {/* Brand mark — clickable, navigates to /dashboard (replaces the
          standalone "Inicio" nav item). */}
      <Link
        href="/dashboard"
        aria-label="Inicio del dashboard"
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3 transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </div>
        {isExpanded && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">
              Red-Salud
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              Consultorio Médico
            </span>
          </div>
        )}
      </Link>

      {/* Body: scrollable nav groups. Scrollbar hidden — overflow stays
          functional via wheel/touch but the visual chrome is gone. */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-3">
        <div className="space-y-3 px-2">
          {resolvedGroups.map((group) => (
            <NavGroup key={group.key} group={group} collapsed={!isExpanded} />
          ))}
        </div>
      </div>

      {/* Footer: sidebar mode switcher (replaces the legacy user-menu, which
          moved to the global header). */}
      <div className="border-t border-border p-2">
        <SidebarModeSwitcher
          expanded={isExpanded}
          mode={mode}
          onChange={onChangeMode}
        />
      </div>
    </aside>
  );
}
