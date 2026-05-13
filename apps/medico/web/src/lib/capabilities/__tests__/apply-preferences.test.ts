import { describe, expect, it } from 'vitest';
import { applyPreferences } from '../apply-preferences';
import type { DoctorModulePreferenceRow, MedicoModule } from '../types';

function mod(
  key: string,
  displayOrder: number,
  displayGroup: MedicoModule['displayGroup'] = 'clinica',
): MedicoModule {
  return {
    key,
    label: key,
    icon: 'Puzzle',
    route: `/dashboard/modulos/${key}`,
    displayGroup,
    displayOrder,
    minVerification: 'sacs',
    minPlan: 'starter',
  };
}

function pref(
  module_id: string,
  overrides: Partial<DoctorModulePreferenceRow> = {},
): DoctorModulePreferenceRow {
  return {
    id: `pref-${module_id}`,
    doctor_id: 'doc-1',
    module_id,
    is_enabled: true,
    custom_order: null,
    custom_settings: null,
    pinned_to_dashboard: false,
    ...overrides,
  };
}

describe('applyPreferences (spec R2)', () => {
  it('R2-A: is_enabled=false removes the module from the result', () => {
    const modules = [mod('recetas', 50), mod('lab-orders', 100), mod('mensajes', 200)];
    const prefs = [pref('lab-orders', { is_enabled: false })];
    const result = applyPreferences(modules, prefs);
    expect(result.map((m) => m.key)).toEqual(['recetas', 'mensajes']);
  });

  it('R2-B: custom_order replaces default displayOrder and re-sorts the array', () => {
    const modules = [mod('recetas', 50), mod('lab-orders', 100), mod('mensajes', 200)];
    const prefs = [
      pref('recetas', { custom_order: 10 }),
      pref('lab-orders', { custom_order: 5 }),
      pref('mensajes', { custom_order: 20 }),
    ];
    const result = applyPreferences(modules, prefs);
    expect(result.map((m) => m.key)).toEqual(['lab-orders', 'recetas', 'mensajes']);
  });

  it('R2-C: pinned_to_dashboard=true sets pinned flag on the module', () => {
    const modules = [mod('chronic-mgmt', 100)];
    const prefs = [pref('chronic-mgmt', { pinned_to_dashboard: true })];
    const result = applyPreferences(modules, prefs);
    expect(result[0]?.pinned).toBe(true);
  });

  it('R2-D: modules without any preference row keep their default order and no pinned flag', () => {
    const modules = [mod('inicio', 10), mod('agenda', 20)];
    const result = applyPreferences(modules, []);
    expect(result.map((m) => m.key)).toEqual(['inicio', 'agenda']);
    expect(result[0]?.pinned).toBeUndefined();
    expect(result[1]?.pinned).toBeUndefined();
  });

  it('R2-E: stable secondary sort by key when custom_order ties exist', () => {
    const modules = [mod('b', 10), mod('a', 10), mod('c', 10)];
    const result = applyPreferences(modules, []);
    expect(result.map((m) => m.key)).toEqual(['a', 'b', 'c']);
  });

  it('R2-F: combined disable + pin + reorder (realistic scenario)', () => {
    const modules = [
      mod('chronic-mgmt', 100),
      mod('lab-orders', 200),
      mod('referrals', 300),
      mod('preventive-screening', 400),
    ];
    const prefs = [
      pref('lab-orders', { is_enabled: false }),
      pref('chronic-mgmt', { pinned_to_dashboard: true, custom_order: 5 }),
      pref('referrals', { custom_order: 50 }),
    ];
    const result = applyPreferences(modules, prefs);
    expect(result.map((m) => m.key)).toEqual([
      'chronic-mgmt',
      'referrals',
      'preventive-screening',
    ]);
    expect(result.find((m) => m.key === 'chronic-mgmt')?.pinned).toBe(true);
  });

  it('R2-G: preference for a module NOT in the resolved set is ignored', () => {
    const modules = [mod('inicio', 10)];
    const prefs = [pref('module-that-does-not-exist', { is_enabled: false })];
    const result = applyPreferences(modules, prefs);
    expect(result).toHaveLength(1);
  });
});
