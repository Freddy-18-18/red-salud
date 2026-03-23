/**
 * @file config-registry.test.ts
 * @description Tests unitarios para el auto-registry de configs y la fábrica.
 *
 * Verifica:
 * 1. Se generan las 132 configuraciones
 * 2. Cada config tiene campos requeridos
 * 3. Los overrides se aplican correctamente (odontologia, cardiologia, pediatria)
 * 4. La herencia de overrides funciona para sub-especialidades
 * 5. La fábrica genera configs coherentes
 * 6. El módulo bridge mantiene mapeos válidos
 *
 * @module Tests/Specialties
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_SPECIALTY_CONFIGS,
  getGeneratedConfig,
  getAllGeneratedConfigs,
  getGeneratedConfigsByCategory,
  getAllRegisteredSlugs,
  hasOverride,
  getRegisteredCount,
  SPECIALTY_OVERRIDES,
} from '../configs/index';
import { ALL_SPECIALTY_IDENTITIES } from '../identity/specialty-identities';
import type { SpecialtyConfig, SpecialtyModule } from '../core/types';

// ============================================================================
// TESTS — Auto-registry
// ============================================================================

describe('Config Registry — generateAllConfigs', () => {
  it('should generate exactly 132 specialty configs', () => {
    expect(getRegisteredCount()).toBe(132);
  });

  it('should match the count of ALL_SPECIALTY_IDENTITIES', () => {
    expect(getRegisteredCount()).toBe(ALL_SPECIALTY_IDENTITIES.length);
  });

  it('should register every identity slug', () => {
    const registeredSlugs = new Set(getAllRegisteredSlugs());
    for (const identity of ALL_SPECIALTY_IDENTITIES) {
      expect(registeredSlugs.has(identity.slug)).toBe(true);
    }
  });

  it('getAllGeneratedConfigs should return array of all configs', () => {
    const all = getAllGeneratedConfigs();
    expect(all).toHaveLength(132);
    expect(Array.isArray(all)).toBe(true);
  });
});

// ============================================================================
// TESTS — Config completeness
// ============================================================================

describe('Config Registry — Config completeness', () => {
  const allConfigs = getAllGeneratedConfigs();

  it('every config should have required identification fields', () => {
    for (const config of allConfigs) {
      expect(config.id).toBeTruthy();
      expect(config.name).toBeTruthy();
      expect(config.slug).toBeTruthy();
      expect(config.category).toBeTruthy();
    }
  });

  it('every config.id should equal config.slug', () => {
    for (const config of allConfigs) {
      expect(config.id).toBe(config.slug);
    }
  });

  it('every config should have at least one keyword', () => {
    for (const config of allConfigs) {
      expect(config.keywords.length).toBeGreaterThan(0);
    }
  });

  it('every config should have prioritizedKpis array', () => {
    for (const config of allConfigs) {
      expect(Array.isArray(config.prioritizedKpis)).toBe(true);
      expect(config.prioritizedKpis.length).toBeGreaterThan(0);
    }
  });

  it('every config should have a dashboardVariant', () => {
    for (const config of allConfigs) {
      expect(config.dashboardVariant).toBeTruthy();
    }
  });

  it('every config should have modules object', () => {
    for (const config of allConfigs) {
      expect(config.modules).toBeDefined();
      expect(typeof config.modules).toBe('object');
    }
  });

  it('every config should have a theme', () => {
    for (const config of allConfigs) {
      expect(config.theme).toBeDefined();
      expect(config.theme?.primaryColor).toBeTruthy();
      expect(config.theme?.icon).toBeTruthy();
    }
  });

  it('every config should have valid settings', () => {
    for (const config of allConfigs) {
      expect(config.settings).toBeDefined();
      expect(typeof config.settings?.defaultDuration).toBe('number');
      expect(config.settings!.defaultDuration!).toBeGreaterThan(0);
    }
  });

  it('every config should have kpiDefinitions', () => {
    for (const config of allConfigs) {
      expect(config.kpiDefinitions).toBeDefined();
      const defs = config.kpiDefinitions!;
      for (const [key, def] of Object.entries(defs)) {
        expect(def.label).toBeTruthy();
        expect(['percentage', 'currency', 'number', 'duration']).toContain(def.format);
        expect(['higher_is_better', 'lower_is_better']).toContain(def.direction);
      }
    }
  });
});

// ============================================================================
// TESTS — Module structure
// ============================================================================

describe('Config Registry — Module structure', () => {
  const allConfigs = getAllGeneratedConfigs();

  it('every module should have required fields', () => {
    for (const config of allConfigs) {
      const allModules = Object.values(config.modules)
        .flat()
        .filter(Boolean) as SpecialtyModule[];

      for (const mod of allModules) {
        expect(mod.key).toBeTruthy();
        expect(mod.label).toBeTruthy();
        expect(mod.icon).toBeTruthy();
        expect(mod.route).toBeTruthy();
        expect(mod.group).toBeTruthy();
      }
    }
  });

  it('every module route should start with /dashboard/medico/', () => {
    for (const config of allConfigs) {
      const allModules = Object.values(config.modules)
        .flat()
        .filter(Boolean) as SpecialtyModule[];

      for (const mod of allModules) {
        expect(mod.route).toMatch(/^\/dashboard\/medico\//);
      }
    }
  });

  it('module keys should be unique within a config', () => {
    for (const config of allConfigs) {
      const allModules = Object.values(config.modules)
        .flat()
        .filter(Boolean) as SpecialtyModule[];

      const keys = allModules.map((m) => m.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    }
  });
});

// ============================================================================
// TESTS — Overrides
// ============================================================================

describe('Config Registry — Overrides', () => {
  it('SPECIALTY_OVERRIDES should have 7 entries', () => {
    expect(SPECIALTY_OVERRIDES.size).toBe(7);
  });

  it('should have overrides for all 7 artisanal specialties', () => {
    expect(SPECIALTY_OVERRIDES.has('odontologia')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('cardiologia')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('pediatria')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('neurologia')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('traumatologia')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('oftalmologia')).toBe(true);
    expect(SPECIALTY_OVERRIDES.has('ginecologia')).toBe(true);
  });

  it('hasOverride() should correctly detect override specialties', () => {
    expect(hasOverride('odontologia')).toBe(true);
    expect(hasOverride('cardiologia')).toBe(true);
    expect(hasOverride('pediatria')).toBe(true);
    expect(hasOverride('neurologia')).toBe(true);
    expect(hasOverride('traumatologia')).toBe(true);
    expect(hasOverride('oftalmologia')).toBe(true);
    expect(hasOverride('ginecologia')).toBe(true);
    expect(hasOverride('medicina-general')).toBe(false);
    expect(hasOverride('dermatologia')).toBe(false);
  });

  describe('Odontología override', () => {
    const config = getGeneratedConfig('odontologia')!;

    it('should exist', () => {
      expect(config).toBeDefined();
    });

    it('should have dental category', () => {
      expect(config.category).toBe('dental');
    });

    it('should have custom theme from override', () => {
      const override = SPECIALTY_OVERRIDES.get('odontologia')!;
      if (override.theme) {
        expect(config.theme?.primaryColor).toBe(override.theme.primaryColor);
      }
    });

    it('should have custom widgets from override', () => {
      expect(config.widgets).toBeDefined();
      expect(config.widgets!.length).toBeGreaterThan(0);
    });

    it('should have custom modules from override', () => {
      // Override has clinical modules with dental-specific keys
      const clinicalModules = config.modules.clinical ?? [];
      expect(clinicalModules.length).toBeGreaterThan(0);
    });
  });

  describe('Cardiología override', () => {
    const config = getGeneratedConfig('cardiologia')!;

    it('should exist', () => {
      expect(config).toBeDefined();
    });

    it('should have medical category', () => {
      expect(config.category).toBe('medical');
    });

    it('should have custom widgets', () => {
      expect(config.widgets).toBeDefined();
      expect(config.widgets!.length).toBeGreaterThan(0);
    });
  });

  describe('Pediatría override', () => {
    const config = getGeneratedConfig('pediatria')!;

    it('should exist', () => {
      expect(config).toBeDefined();
    });

    it('should have pediatric category', () => {
      expect(config.category).toBe('pediatric');
    });

    it('should have custom widgets', () => {
      expect(config.widgets).toBeDefined();
      expect(config.widgets!.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TESTS — Override inheritance
// ============================================================================

describe('Config Registry — Override Inheritance', () => {
  const dentalSubSpecialties = [
    'ortodoncia',
    'endodoncia',
    'periodoncia',
    'implantologia-dental',
    'cirugia-oral-maxilofacial',
    'odontopediatria',
    'ortopedia-dentomaxilofacial',
    'prostodoncia',
  ];

  it('dental sub-specialties should inherit theme from odontologia', () => {
    const parentConfig = getGeneratedConfig('odontologia')!;

    for (const slug of dentalSubSpecialties) {
      const childConfig = getGeneratedConfig(slug);
      if (!childConfig) continue; // Skip if not in the 132 list

      // Should inherit parent theme (color, icon from parent override)
      expect(childConfig.theme?.primaryColor).toBe(parentConfig.theme?.primaryColor);
    }
  });

  it('dental sub-specialties should inherit widgets from odontologia', () => {
    const parentConfig = getGeneratedConfig('odontologia')!;
    const parentWidgetCount = parentConfig.widgets?.length ?? 0;

    for (const slug of dentalSubSpecialties) {
      const childConfig = getGeneratedConfig(slug);
      if (!childConfig) continue;

      // Should have the same widgets as parent
      expect(childConfig.widgets?.length).toBe(parentWidgetCount);
    }
  });

  it('dental sub-specialties should NOT inherit modules (use their own template)', () => {
    const parentConfig = getGeneratedConfig('odontologia')!;

    for (const slug of dentalSubSpecialties) {
      const childConfig = getGeneratedConfig(slug);
      if (!childConfig) continue;

      // Child slug is different from parent
      expect(childConfig.slug).not.toBe(parentConfig.slug);
      // Child's module routes should reference their own slug, not parent's
      const childModules = Object.values(childConfig.modules)
        .flat()
        .filter(Boolean) as SpecialtyModule[];

      for (const mod of childModules) {
        expect(mod.route).toContain(slug);
      }
    }
  });

  it('dental sub-specialties should keep their own KPIs', () => {
    const parentConfig = getGeneratedConfig('odontologia')!;

    for (const slug of dentalSubSpecialties) {
      const childConfig = getGeneratedConfig(slug);
      if (!childConfig) continue;

      // Child identity has its own prioritizedKpis — may differ from parent
      const childIdentity = ALL_SPECIALTY_IDENTITIES.find((i) => i.slug === slug);
      if (childIdentity) {
        // The child's KPIs should come from its identity, not the parent override
        expect(childConfig.prioritizedKpis).toEqual(childIdentity.prioritizedKpis);
      }
    }
  });

  it('non-sub-specialties without override should not inherit anything', () => {
    // Use a specialty that has NO override (e.g., dermatologia)
    const config = getGeneratedConfig('dermatologia')!;

    // Dermatologia has no override and is not a sub-specialty with override parent
    expect(config).toBeDefined();
    expect(config.widgets).toEqual([]); // No widgets from override
  });
});

// ============================================================================
// TESTS — getGeneratedConfig
// ============================================================================

describe('Config Registry — API', () => {
  it('getGeneratedConfig should return config by slug', () => {
    const config = getGeneratedConfig('cardiologia');
    expect(config).toBeDefined();
    expect(config!.slug).toBe('cardiologia');
  });

  it('getGeneratedConfig should return undefined for unknown slug', () => {
    const config = getGeneratedConfig('nonexistent');
    expect(config).toBeUndefined();
  });

  it('getGeneratedConfigsByCategory should filter correctly', () => {
    const generals = getGeneratedConfigsByCategory('general');
    expect(generals.length).toBeGreaterThan(0);

    for (const config of generals) {
      const identity = ALL_SPECIALTY_IDENTITIES.find((i) => i.slug === config.slug);
      expect(identity?.categoryId).toBe('general');
    }
  });

  it('getAllRegisteredSlugs should return string array', () => {
    const slugs = getAllRegisteredSlugs();
    expect(slugs.length).toBe(132);
    expect(slugs.every((s) => typeof s === 'string')).toBe(true);
  });
});

// ============================================================================
// TESTS — Config factory
// ============================================================================

describe('Config Factory — buildSpecialtyConfig', () => {
  it('should generate valid KPI format inference', () => {
    // Test format guessing via KPI definitions
    const config = getGeneratedConfig('medicina-general')!;
    const defs = config.kpiDefinitions!;

    // 'satisfaccion' → percentage
    if (defs['satisfaccion']) {
      expect(defs['satisfaccion'].format).toBe('percentage');
    }

    // 'pacientes-atendidos' → number
    if (defs['pacientes-atendidos']) {
      expect(defs['pacientes-atendidos'].format).toBe('number');
    }

    // 'tiempo-consulta' → duration
    if (defs['tiempo-consulta']) {
      expect(defs['tiempo-consulta'].format).toBe('duration');
    }
  });

  it('should generate valid KPI direction inference', () => {
    const config = getGeneratedConfig('medicina-general')!;
    const defs = config.kpiDefinitions!;

    // 'pacientes-atendidos' → higher_is_better
    if (defs['pacientes-atendidos']) {
      expect(defs['pacientes-atendidos'].direction).toBe('higher_is_better');
    }
  });

  it('should generate kpiKeyToLabel correctly', () => {
    const config = getGeneratedConfig('medicina-general')!;
    const defs = config.kpiDefinitions!;

    if (defs['pacientes-atendidos']) {
      expect(defs['pacientes-atendidos'].label).toBe('Pacientes Atendidos');
    }
  });

  it('should respect override KPI definitions over defaults', () => {
    const config = getGeneratedConfig('odontologia')!;
    const overrideDefs = SPECIALTY_OVERRIDES.get('odontologia')?.kpiDefinitions;

    if (overrideDefs) {
      // Config should use override definitions
      for (const key of Object.keys(overrideDefs)) {
        expect(config.kpiDefinitions?.[key]).toEqual(overrideDefs[key]);
      }
    }
  });

  it('should set telemedicine flag from identity', () => {
    const teleConfig = getGeneratedConfig('medicina-general')!;
    expect(teleConfig.settings?.supportsTelemedicine).toBe(true);

    // Find a non-sub-specialty without override that doesn't support telemedicine
    // (sub-specialties may inherit settings from parent override)
    const noTeleIdentity = ALL_SPECIALTY_IDENTITIES.find(
      (i) => !i.supportsTelemedicine && !i.isSubSpecialty
    );
    if (noTeleIdentity) {
      const noTeleConfig = getGeneratedConfig(noTeleIdentity.slug)!;
      expect(noTeleConfig.settings?.supportsTelemedicine).toBe(false);
    }
  });
});

// ============================================================================
// TESTS — Slug uniqueness
// ============================================================================

describe('Config Registry — Data integrity', () => {
  it('all slugs are unique', () => {
    const slugs = getAllRegisteredSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all config names are non-empty strings', () => {
    for (const config of getAllGeneratedConfigs()) {
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
    }
  });

  it('no config has empty keywords array', () => {
    for (const config of getAllGeneratedConfigs()) {
      expect(config.keywords.length).toBeGreaterThan(0);
    }
  });

  it('category values are valid SpecialtyCategory literals', () => {
    const validCategories = new Set([
      'surgical', 'medical', 'dental', 'diagnostic', 'pediatric',
      'obgyn', 'psychiatric', 'emergency', 'critical_care', 'primary_care',
      'allied', 'other',
    ]);

    for (const config of getAllGeneratedConfigs()) {
      expect(validCategories.has(config.category)).toBe(true);
    }
  });
});
