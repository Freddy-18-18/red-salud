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
}
