/**
 * @file build-module-preferences.ts
 * @description Convert the wizard's `selectedModules: string[]` into the row
 * shape Supabase expects for `doctor_module_preferences`.
 *
 * Background (Phase 7 fix): registration-steps.tsx:351-360 used to upsert a
 * single row with columns that DON'T EXIST on the table (`specialty_id`,
 * `enabled_modules`, `updated_at`) and `onConflict: 'doctor_id'`. The real
 * schema requires one row per module (composite unique on
 * `(doctor_id, module_id)`). This helper produces that shape.
 */

export interface ModulePreferenceInsertRow {
  doctor_id: string;
  module_id: string;
  is_enabled: boolean;
}

/**
 * Composite unique constraint name used for upserts.
 * Supabase `.upsert(rows, { onConflict: MODULE_PREFS_CONFLICT_KEY })`.
 */
export const MODULE_PREFS_CONFLICT_KEY = 'doctor_id,module_id' as const;

export function buildModulePreferenceRows(
  doctorId: string,
  selectedModules: string[],
): ModulePreferenceInsertRow[] {
  const seen = new Set<string>();
  const rows: ModulePreferenceInsertRow[] = [];
  for (const module_id of selectedModules) {
    if (seen.has(module_id)) continue;
    seen.add(module_id);
    rows.push({
      doctor_id: doctorId,
      module_id,
      is_enabled: true,
    });
  }
  return rows;
}
