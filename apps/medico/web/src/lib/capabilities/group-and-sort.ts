/**
 * @file group-and-sort.ts
 * @description Group resolved modules by displayGroup and produce
 * server-safe ResolvedNavGroup[] for the sidebar.
 *
 * Spec R5 (doctor-capabilities):
 *   - 5 hardcoded major groups, fixed order (Clínica → Configuración).
 *   - Empty groups MUST be omitted.
 *   - Items sorted within group by displayOrder ascending.
 */

import {
  DISPLAY_GROUP_LABELS,
  DISPLAY_GROUP_ORDER,
  type DisplayGroup,
  type MedicoModule,
  type ResolvedNavGroup,
  type ResolvedNavItem,
} from './types';

function toNavItem(m: MedicoModule): ResolvedNavItem {
  return {
    key: m.key,
    label: m.label,
    href: m.route,
    icon: m.icon,
    ...(m.badge ? { badge: m.badge } : {}),
  };
}

export function groupAndSort(modules: MedicoModule[]): ResolvedNavGroup[] {
  if (modules.length === 0) return [];

  const buckets: Record<DisplayGroup, MedicoModule[]> = {
    clinica: [],
    analisis: [],
    comunicacion: [],
    crecimiento: [],
    configuracion: [],
  };

  for (const m of modules) {
    buckets[m.displayGroup].push(m);
  }

  const out: ResolvedNavGroup[] = [];
  for (const group of DISPLAY_GROUP_ORDER) {
    const items = buckets[group];
    if (items.length === 0) continue;
    items.sort((a, b) => a.displayOrder - b.displayOrder);
    out.push({
      key: group,
      label: DISPLAY_GROUP_LABELS[group],
      items: items.map(toNavItem),
    });
  }

  return out;
}
