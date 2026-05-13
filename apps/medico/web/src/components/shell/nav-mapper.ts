/**
 * @file nav-mapper.ts
 * @description Adapter between the server-safe ResolvedNavGroup[] (icons as
 * strings) and the shell's NavGroupData[] (icons as LucideIcon components).
 *
 * This boundary keeps `lib/capabilities/` free of React component imports so
 * the resolver runs server-side without dragging the icon module tree.
 */

import {
  Activity,
  BarChart3,
  Brain,
  BrainCircuit,
  Calculator,
  Calendar,
  ClipboardList,
  FileText,
  Fingerprint,
  FlaskConical,
  HeartPulse,
  Home,
  MessageSquare,
  Pill,
  Puzzle,
  Scan,
  Settings,
  Share2,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { ResolvedNavGroup } from '@/lib/capabilities/types';

import { STATIC_NAV_GROUPS } from './nav-data';
import type { NavGroupData, NavLinkData } from './types';

/**
 * String → LucideIcon mapping for every icon referenced by the capability
 * `module-catalog.ts`. Unknown strings fall back to `Puzzle`.
 *
 * Keep this in sync with `lib/capabilities/module-catalog.ts`.
 */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  Brain,
  BrainCircuit,
  Calculator,
  Calendar,
  ClipboardList,
  FileText,
  Fingerprint,
  FlaskConical,
  HeartPulse,
  Home,
  MessageSquare,
  Pill,
  Puzzle,
  Scan,
  Settings,
  Share2,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? Puzzle;
}

export function resolvedToNavGroups(resolved: ResolvedNavGroup[]): NavGroupData[] {
  return resolved.map((g) => ({
    key: g.key,
    label: g.label,
    items: g.items.map<NavLinkData>((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      icon: resolveIcon(item.icon),
      ...(item.badge ? { badge: item.badge } : {}),
    })),
  }));
}

/**
 * Returns dynamic groups when the resolver produced any, otherwise the static
 * fallback. An EMPTY resolved array also falls back — a degraded resolver
 * (e.g. null profile) should not render an empty sidebar.
 */
export function mergeWithStaticFallback(
  resolved: ResolvedNavGroup[] | undefined,
): NavGroupData[] {
  if (!resolved || resolved.length === 0) {
    return STATIC_NAV_GROUPS;
  }
  return resolvedToNavGroups(resolved);
}
