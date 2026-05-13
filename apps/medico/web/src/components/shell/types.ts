/**
 * @file types.ts
 * @description Shared type contracts for the medico AppShell (Phase 1).
 *
 * These types are pure data definitions used by the static navigation modules
 * (`nav-data.ts`), the `DashboardShell` orchestrator, and the leaf shell
 * components. No behavior lives here.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * A single navigation entry. Used by both the desktop sidebar and the mobile
 * Sheet (and indirectly by the bottom nav, which has its own narrowed shape).
 */
export interface NavLinkData {
  /** Stable client-side key (used for React `key`, never rendered). */
  key: string;
  /** Visible label, Spanish (es-VE). */
  label: string;
  /** Absolute pathname under `/dashboard/*`. */
  href: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Optional badge text shown next to the label (e.g. `Próximamente`). */
  badge?: string;
  /** When true, the link renders disabled (still navigable per FR-7 unless caller short-circuits). */
  disabled?: boolean;
  /**
   * When true, render an attention dot (R5 medico-shell-supabase-style spec).
   * Used by capability resolver to flag verificacion pending, SACS expired,
   * or other module-level signals. Defaults to false.
   */
  attention?: boolean;
}

/**
 * A labeled cluster of `NavLinkData` items rendered in the sidebar.
 * The label hides automatically when the sidebar is collapsed.
 */
export interface NavGroupData {
  /** Stable client-side key. */
  key: string;
  /** Visible label, Spanish (es-VE). */
  label: string;
  /** Items belonging to this group, rendered in order. */
  items: NavLinkData[];
}

/**
 * Bottom-nav item (mobile only). Same shape as `NavLinkData` but kept as a
 * named alias so downstream layouts can extend it later (e.g. with `cta`).
 */
export type BottomNavItemData = NavLinkData;

/**
 * One crumb in the `<PageHeader.Breadcrumb>` slot. When `href` is omitted, the
 * crumb renders as plain text (terminal segment).
 */
export interface PageHeaderBreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Props consumed by the `<DashboardShell>` orchestrator. The server layout
 * fetches doctor data and forwards it; the shell does NOT call Supabase.
 *
 * Phase 2 additions: when the capability engine is enabled,
 * `app/dashboard/layout.tsx` calls `resolveDoctorModules()` server-side and
 * forwards `navGroups` (ResolvedNavGroup, icons as strings) + `pinnedModules`.
 * When the flag is off OR the resolver degrades, both props are `undefined`
 * and the shell falls back to the static `NAV_GROUPS`.
 */
export interface DashboardShellProps {
  /** Doctor display name. Falls back to email upstream. */
  doctorName: string;
  /** Doctor email; rendered in the user-menu trigger / dropdown. */
  email: string;
  /** Absolute URL to the avatar image. `null` → initials fallback. */
  avatarUrl: string | null;
  /** Specialty display name (e.g. "Cardiología"). */
  specialtyName: string;
  /** Page tree rendered inside the shell's `<main>`. */
  children: ReactNode;
  /**
   * Dynamic nav groups from the capability resolver (Phase 2). Icons are
   * STRINGS at this boundary — the shell maps to LucideIcon via `nav-mapper.ts`.
   * Omit to fall back to static `NAV_GROUPS`.
   */
  navGroups?: import('@/lib/capabilities/types').ResolvedNavGroup[];
  /** Pinned-to-dashboard modules (Phase 2). Reserved for the dashboard page. */
  pinnedModules?: import('@/lib/capabilities/types').MedicoModule[];
  /** When true, render a banner pointing the doctor to complete SACS verification. */
  verificationPending?: boolean;
  /**
   * Active sede label for the GlobalHeader breadcrumb (Phase 2 +). When omitted
   * the breadcrumb degrades gracefully to a "Sin sede" placeholder.
   */
  sedeName?: string;
  /**
   * Current module label (e.g. "Pacientes", "Agenda") derived from the
   * pathname segment. Threaded into the GlobalHeader's third breadcrumb.
   */
  moduleLabel?: string;
  /**
   * Resolver attention flags driving the GlobalHeader Advisor red-dot and the
   * sidebar NavLink attention dots. When omitted, no attention indicators
   * render — safe degradation when the capability engine is OFF.
   */
  attention?: import('@/lib/capabilities/types').DoctorAttention;
}

/**
 * Props for the new GlobalHeader (Phase 2 of medico-shell-supabase-style).
 * Mounted under `FEATURE_NEW_SHELL=true` only — legacy shell does not render
 * this header. See `app-shell-medico` R6 + R7.
 */
export interface GlobalHeaderProps {
  /** Doctor display name shown as the first breadcrumb level. */
  doctorName: string;
  /**
   * Active sede label. When undefined, the breadcrumb shows "Sin sede" with
   * a disabled chevron — degrades gracefully until Phase 3 wires sedes data.
   */
  sedeName?: string;
  /** Current module label shown as the terminal breadcrumb. */
  moduleLabel: string;
  /**
   * Resolver-derived attention flags. When either flag is true, the Advisor
   * button renders a destructive-colored red dot.
   */
  attention?: import('@/lib/capabilities/types').DoctorAttention;
}
