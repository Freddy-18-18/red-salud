import { describe, expect, it } from 'vitest';
import { buildModulePreferenceRows } from '../build-module-preferences';

describe('buildModulePreferenceRows', () => {
  it('returns one row per selected module with the correct doctor_id', () => {
    const rows = buildModulePreferenceRows('doc-1', ['chronic-mgmt', 'lab-orders']);
    expect(rows).toEqual([
      { doctor_id: 'doc-1', module_id: 'chronic-mgmt', is_enabled: true },
      { doctor_id: 'doc-1', module_id: 'lab-orders', is_enabled: true },
    ]);
  });

  it('returns an empty array when no modules are selected', () => {
    expect(buildModulePreferenceRows('doc-1', [])).toEqual([]);
  });

  it('deduplicates repeated module ids (defensive)', () => {
    const rows = buildModulePreferenceRows('doc-1', [
      'chronic-mgmt',
      'lab-orders',
      'chronic-mgmt',
    ]);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.module_id)).toEqual(['chronic-mgmt', 'lab-orders']);
  });

  it('every row defaults is_enabled to true', () => {
    const rows = buildModulePreferenceRows('doc-1', ['lab-orders']);
    expect(rows[0]?.is_enabled).toBe(true);
  });

  it('does NOT include columns that have DB defaults (custom_order, custom_settings, pinned_to_dashboard, created_at, updated_at, id)', () => {
    const rows = buildModulePreferenceRows('doc-1', ['lab-orders']);
    const keys = Object.keys(rows[0] ?? {}).sort();
    expect(keys).toEqual(['doctor_id', 'is_enabled', 'module_id']);
  });

  it('exposes the canonical onConflict key for upserts', async () => {
    const { MODULE_PREFS_CONFLICT_KEY } = await import('../build-module-preferences');
    expect(MODULE_PREFS_CONFLICT_KEY).toBe('doctor_id,module_id');
  });
});
