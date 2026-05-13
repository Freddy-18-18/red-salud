/**
 * @file apply-preferences.ts
 * @description Apply per-doctor `doctor_module_preferences` to resolved modules.
 *
 * Spec R2 (doctor-capabilities):
 *   - is_enabled=false → drop the module.
 *   - custom_order set → replace displayOrder.
 *   - pinned_to_dashboard=true → set pinned flag on the module entry.
 *
 * Pure function. No DB access. No side effects.
 */

import type { DoctorModulePreferenceRow, MedicoModule } from './types';

/**
 * Apply per-doctor overrides on top of resolved modules.
 * Drops disabled, applies custom_order, sets pinned flag.
 * Result is sorted by (displayOrder asc, key asc) for stable ordering.
 */
export function applyPreferences(
  modules: MedicoModule[],
  preferences: DoctorModulePreferenceRow[],
): MedicoModule[] {
  const prefByModuleId = new Map(preferences.map((p) => [p.module_id, p]));

  const overridden: MedicoModule[] = [];
  for (const m of modules) {
    const p = prefByModuleId.get(m.key);
    if (p && !p.is_enabled) continue;

    overridden.push({
      ...m,
      displayOrder: p?.custom_order ?? m.displayOrder,
      ...(p?.pinned_to_dashboard ? { pinned: true } : {}),
    });
  }

  overridden.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.key.localeCompare(b.key);
  });

  return overridden;
}
