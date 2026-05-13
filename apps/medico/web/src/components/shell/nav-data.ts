/**
 * @file nav-data.ts
 * @description Static navigation catalogues for the medico AppShell (Phase 1).
 *
 * - `NAV_GROUPS`: rendered by both desktop sidebar and mobile sheet.
 * - `BOTTOM_NAV_ITEMS`: rendered only by the mobile bottom navigation.
 *
 * Phase 1 ships a deliberately specialty-agnostic structure: every doctor sees
 * the same chrome regardless of `specialty_id`. Capability-driven groups are
 * scheduled for Phase 2.
 *
 * The "Atender" CTA in `BOTTOM_NAV_ITEMS` temporarily targets
 * `/dashboard/consulta`; Fase 5 re-points it at the patient inbox.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

import {
  BarChart3,
  Calendar,
  Home,
  MessageSquare,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

import type { BottomNavItemData, NavGroupData } from './types';

/**
 * Sidebar groups (desktop sidebar + mobile sheet).
 *
 * Order matters: it determines visual stacking. `Verificación` carries the
 * `Próximamente` badge per FR-7 — link is still navigable, badge is informative.
 *
 * NOTE (Phase 2 — capability engine): when `FEATURE_CAPABILITY_ENGINE=true`,
 * the dashboard layout passes a dynamic resolved groups array instead; this
 * static set becomes the fallback for unverified doctors or degraded
 * resolution. Re-exported as `STATIC_NAV_GROUPS` for explicit naming.
 */
export const NAV_GROUPS: NavGroupData[] = [
  {
    key: 'principal',
    label: 'Principal',
    items: [
      {
        key: 'inicio',
        label: 'Inicio',
        href: '/dashboard',
        icon: Home,
      },
      {
        key: 'agenda',
        label: 'Agenda',
        href: '/dashboard/agenda',
        icon: Calendar,
      },
      {
        key: 'pacientes',
        label: 'Pacientes',
        href: '/dashboard/pacientes',
        icon: Users,
      },
      {
        key: 'consulta',
        label: 'Consulta',
        href: '/dashboard/consulta',
        icon: Stethoscope,
      },
      {
        key: 'recetas',
        label: 'Recetas',
        href: '/dashboard/recetas',
        icon: Pill,
      },
      {
        key: 'mensajes',
        label: 'Mensajes',
        href: '/dashboard/mensajes',
        icon: MessageSquare,
      },
    ],
  },
  {
    key: 'configuracion',
    label: 'Configuración',
    items: [
      {
        key: 'estadisticas',
        label: 'Estadísticas',
        href: '/dashboard/estadisticas',
        icon: BarChart3,
      },
      {
        key: 'verificacion',
        label: 'Verificación',
        href: '/dashboard/verificacion',
        icon: ShieldCheck,
        badge: 'Próximamente',
      },
      {
        key: 'configuracion',
        label: 'Configuración',
        href: '/dashboard/configuracion',
        icon: Settings,
      },
    ],
  },
];

/**
 * Explicit alias for the static nav source. Use this name in callers that mix
 * static + dynamic (e.g. `mergeWithStaticFallback`) to make the fallback
 * intent obvious. Same reference — not a copy.
 */
export const STATIC_NAV_GROUPS = NAV_GROUPS;

/**
 * Mobile bottom nav (5 items, fixed). Stays in `lg:hidden` territory; the
 * `atender` slot is the visual CTA per design.md.
 */
export const BOTTOM_NAV_ITEMS: BottomNavItemData[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    href: '/dashboard',
    icon: Home,
  },
  {
    key: 'pacientes',
    label: 'Pacientes',
    href: '/dashboard/pacientes',
    icon: Users,
  },
  {
    key: 'atender',
    label: 'Atender',
    href: '/dashboard/consulta',
    icon: Stethoscope,
  },
  {
    key: 'recetas',
    label: 'Recetas',
    href: '/dashboard/recetas',
    icon: Pill,
  },
  {
    key: 'perfil',
    label: 'Perfil',
    href: '/dashboard/configuracion',
    icon: User,
  },
];
