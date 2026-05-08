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
 * Phase 1 deliberately drops `userId`, `specialtySlug`, and `sacsEspecialidad`
 * — the new shell is specialty-agnostic per FR-9 and the validation checklist
 * (themeColor const removed, no per-specialty branching at the chrome layer).
 * Any per-specialty UX returns in Fase 2 via the capability engine.
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
}
