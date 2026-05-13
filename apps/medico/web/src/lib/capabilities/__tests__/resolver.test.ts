import { describe, expect, it, vi } from 'vitest';
import { resolveDoctorModules, type ResolverDeps } from '../resolver';
import type {
  CapabilityModuleRow,
  DoctorModulePreferenceRow,
} from '../types';
import type { PostgradoMappingRow } from '../normalize-postgrado';

const MAPPING: PostgradoMappingRow[] = [
  { sacs_name_pattern: 'INFECTOLOGÍA PEDIÁTRICA', postgrado_slug: 'infectologia-pediatrica', confidence: 'exact' },
  { sacs_name_pattern: 'PEDIATRÍA Y PUERICULTURA', postgrado_slug: 'pediatria', confidence: 'exact' },
];

function row(
  source_type: CapabilityModuleRow['source_type'],
  source_value: string,
  module_key: string,
  display_group: CapabilityModuleRow['display_group'] = 'clinica',
  display_order = 100,
): CapabilityModuleRow {
  return {
    id: `${source_type}:${source_value}:${module_key}`,
    source_type,
    source_value,
    module_key,
    display_group,
    display_order,
    min_verification: 'sacs',
    min_plan: 'starter',
  };
}

const ALWAYS_ON_ROWS: CapabilityModuleRow[] = [
  row('always-on', '*', 'inicio', 'clinica', 10),
  row('always-on', '*', 'agenda', 'clinica', 20),
  row('always-on', '*', 'mensajes', 'comunicacion', 10),
];

function makeDeps(overrides: Partial<ResolverDeps> = {}): ResolverDeps {
  return {
    fetchProfile: async () => ({
      specialty_slug: 'medicina-general',
      sacs_verified: true,
      postgrados_raw: [],
      plan: 'starter',
      certs: [],
    }),
    fetchPostgradoMapping: async () => MAPPING,
    fetchCapabilityModules: async () => ALWAYS_ON_ROWS,
    fetchPreferences: async () => [],
    ...overrides,
  };
}

describe('resolveDoctorModules (end-to-end, specs R1+R2+R3+R5)', () => {
  it('R1-B end-to-end: specialty with no postgrados resolves always-on + specialty modules', async () => {
    const deps = makeDeps({
      fetchProfile: async () => ({
        specialty_slug: 'medicina-general',
        sacs_verified: true,
        postgrados_raw: [],
        plan: 'starter',
        certs: [],
      }),
      fetchCapabilityModules: async () => [
        ...ALWAYS_ON_ROWS,
        row('specialty', 'medicina-general', 'chronic-mgmt', 'clinica', 100),
      ],
    });
    const result = await resolveDoctorModules(deps, 'doc-1');
    const allKeys = result.navGroups.flatMap((g) => g.items.map((i) => i.key));
    expect(allKeys).toContain('chronic-mgmt');
    expect(allKeys).toContain('inicio');
    expect(result.verificationPending).toBe(false);
  });

  it('R1-A end-to-end: medico4 case — specialty + 2 postgrados → UNION resolved + deduped', async () => {
    const deps = makeDeps({
      fetchProfile: async () => ({
        specialty_slug: 'infectologia',
        sacs_verified: true,
        postgrados_raw: ['INFECTOLOGÍA PEDIÁTRICA', 'PEDIATRÍA Y PUERICULTURA'],
        plan: 'starter',
        certs: [],
      }),
      fetchCapabilityModules: async () => [
        ...ALWAYS_ON_ROWS,
        row('specialty', 'infectologia', 'lab-orders', 'analisis', 100),
        row('postgrado', 'infectologia-pediatrica', 'pediatrics-growth', 'clinica', 200),
        row('postgrado', 'pediatria', 'pediatrics-growth', 'clinica', 200),
        row('postgrado', 'pediatria', 'pediatrics-vaccination', 'clinica', 210),
      ],
    });
    const result = await resolveDoctorModules(deps, 'doc-4');
    const allKeys = result.navGroups.flatMap((g) => g.items.map((i) => i.key));
    expect(allKeys).toContain('lab-orders');
    expect(allKeys).toContain('pediatrics-growth');
    expect(allKeys).toContain('pediatrics-vaccination');
    const pgCount = allKeys.filter((k) => k === 'pediatrics-growth').length;
    expect(pgCount).toBe(1);
    expect(result.capabilities.postgrados).toEqual(['infectologia-pediatrica', 'pediatria']);
  });

  it('R3 end-to-end: medico1 manual mode (sacs_verified=false) → verificationPending=true, specialty modules still resolved', async () => {
    const deps = makeDeps({
      fetchProfile: async () => ({
        specialty_slug: 'medicina-general',
        sacs_verified: false,
        postgrados_raw: [],
        plan: 'starter',
        certs: [],
      }),
      fetchCapabilityModules: async () => [
        ...ALWAYS_ON_ROWS,
        row('specialty', 'medicina-general', 'chronic-mgmt', 'clinica', 100),
      ],
    });
    const result = await resolveDoctorModules(deps, 'doc-1');
    expect(result.verificationPending).toBe(true);
    const allKeys = result.navGroups.flatMap((g) => g.items.map((i) => i.key));
    expect(allKeys).toContain('chronic-mgmt');
  });

  it('R2 end-to-end: doctor preferences override displayOrder, drop disabled, set pinned', async () => {
    const deps = makeDeps({
      fetchCapabilityModules: async () => [
        ...ALWAYS_ON_ROWS,
        row('specialty', 'medicina-general', 'chronic-mgmt', 'clinica', 100),
        row('specialty', 'medicina-general', 'lab-orders', 'analisis', 100),
      ],
      fetchPreferences: async (): Promise<DoctorModulePreferenceRow[]> => [
        {
          id: 'p1',
          doctor_id: 'doc-1',
          module_id: 'lab-orders',
          is_enabled: false,
          custom_order: null,
          custom_settings: null,
          pinned_to_dashboard: false,
        },
        {
          id: 'p2',
          doctor_id: 'doc-1',
          module_id: 'chronic-mgmt',
          is_enabled: true,
          custom_order: null,
          custom_settings: null,
          pinned_to_dashboard: true,
        },
      ],
    });
    const result = await resolveDoctorModules(deps, 'doc-1');
    const allKeys = result.navGroups.flatMap((g) => g.items.map((i) => i.key));
    expect(allKeys).not.toContain('lab-orders');
    expect(result.pinnedModules.map((m) => m.key)).toContain('chronic-mgmt');
  });

  it('R5 end-to-end: returns 5-group structure in canonical order, empty groups omitted', async () => {
    const deps = makeDeps({
      fetchCapabilityModules: async () => [
        row('always-on', '*', 'inicio', 'clinica', 10),
        row('always-on', '*', 'mensajes', 'comunicacion', 10),
      ],
    });
    const result = await resolveDoctorModules(deps, 'doc-1');
    expect(result.navGroups.map((g) => g.key)).toEqual(['clinica', 'comunicacion']);
  });

  it('R4 end-to-end: unmapped postgrado is logged and skipped, resolution continues', async () => {
    const logger = vi.fn();
    const deps = makeDeps({
      fetchProfile: async () => ({
        specialty_slug: 'medicina-general',
        sacs_verified: true,
        postgrados_raw: ['INFECTOLOGÍA PEDIÁTRICA', 'POSTGRADO INEXISTENTE'],
        plan: 'starter',
        certs: [],
      }),
      logger,
    });
    const result = await resolveDoctorModules(deps, 'doc-1');
    expect(logger).toHaveBeenCalledWith(expect.stringContaining('POSTGRADO INEXISTENTE'));
    expect(result.capabilities.postgrados).toEqual(['infectologia-pediatrica']);
  });

  it('resolvedAt is an ISO timestamp', async () => {
    const result = await resolveDoctorModules(makeDeps(), 'doc-1');
    expect(result.resolvedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('null profile (deleted doctor) returns degraded empty result without throwing', async () => {
    const deps = makeDeps({
      fetchProfile: async () => null,
    });
    const result = await resolveDoctorModules(deps, 'doc-deleted');
    expect(result.navGroups).toEqual([]);
    expect(result.verificationPending).toBe(true);
  });

  describe('Spec R8: auto-badge for unregistered modules', () => {
    it('sets badge="Próximamente" on items whose module_key is not registered', async () => {
      const deps = makeDeps({
        fetchCapabilityModules: async () => [
          row('always-on', '*', 'inicio', 'clinica', 10),
          row('specialty', 'medicina-general', 'chronic-mgmt', 'clinica', 100),
        ],
        isModuleRegistered: (key) => key === 'inicio',
      });
      const result = await resolveDoctorModules(deps, 'doc-1');
      const allItems = result.navGroups.flatMap((g) => g.items);
      const inicio = allItems.find((i) => i.key === 'inicio');
      const chronic = allItems.find((i) => i.key === 'chronic-mgmt');
      expect(inicio?.badge).toBeUndefined();
      expect(chronic?.badge).toBe('Próximamente');
    });

    it('omits the badge when isModuleRegistered is not provided (degraded mode)', async () => {
      const deps = makeDeps({
        fetchCapabilityModules: async () => [
          row('always-on', '*', 'inicio', 'clinica', 10),
        ],
        isModuleRegistered: undefined,
      });
      const result = await resolveDoctorModules(deps, 'doc-1');
      const allItems = result.navGroups.flatMap((g) => g.items);
      expect(allItems[0]?.badge).toBeUndefined();
    });
  });
});
