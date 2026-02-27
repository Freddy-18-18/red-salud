/**
 * @file configs/index.ts
 * @description Auto-registry de las 132 especialidades médicas.
 *
 * Genera SpecialtyConfig para cada SpecialtyIdentity usando:
 * 1. La SpecialtyIdentity de identity/specialty-identities.ts
 * 2. La SpecialtyCategoryMeta de identity/category-meta.ts
 * 3. Los LayoutTemplates de configs/layout-templates.ts
 * 4. Los overrides de configs/overrides/ cuando están disponibles
 *
 * Resultado: una Map<string, SpecialtyConfig> con las 132 especialidades.
 */

import type { SpecialtyConfig } from '../core/types';
import { ALL_SPECIALTY_IDENTITIES } from '../identity/specialty-identities';
import { CATEGORY_META } from '../identity/category-meta';
import { buildSpecialtyConfig, type SpecialtyConfigOverride } from './config-factory';
import { SPECIALTY_OVERRIDES } from './overrides';

// ============================================================================
// GENERACIÓN AUTOMÁTICA DE CONFIGS
// ============================================================================

/**
 * Genera todos los SpecialtyConfig a partir de las 132 identidades.
 * Se ejecuta una sola vez al importar este módulo.
 *
 * Incluye herencia de overrides: sub-especialidades con parentSlug
 * heredan theme y widgets del override padre si no tienen override propio.
 */
function generateAllConfigs(): Map<string, SpecialtyConfig> {
  const configs = new Map<string, SpecialtyConfig>();

  for (const identity of ALL_SPECIALTY_IDENTITIES) {
    const categoryMeta = CATEGORY_META[identity.categoryId];
    if (!categoryMeta) {
      console.warn(
        `[ConfigRegistry] No category meta found for "${identity.categoryId}" (specialty: ${identity.slug}). Skipping.`
      );
      continue;
    }

    // Buscar override directo para esta especialidad
    let override = SPECIALTY_OVERRIDES.get(identity.slug);

    // Herencia: si es sub-especialidad sin override propio, heredar del padre
    if (!override && identity.isSubSpecialty && identity.parentSlug) {
      const parentOverride = SPECIALTY_OVERRIDES.get(identity.parentSlug);
      if (parentOverride) {
        override = buildInheritedOverride(parentOverride, identity);
      }
    }

    // Construir config
    const config = buildSpecialtyConfig(identity, categoryMeta, override);

    configs.set(identity.slug, config);
  }

  return configs;
}

/**
 * Construye un override heredado para una sub-especialidad.
 *
 * Hereda del padre:
 * - theme (colores, icono)
 * - widgets (los mismos widgets del padre)
 * - settings parciales (appointment types, clinical templates flags)
 *
 * NO hereda (mantiene de la identidad propia):
 * - prioritizedKpis (cada sub-especialidad tiene los suyos)
 * - kpiDefinitions (se generan desde sus KPIs)
 * - modules (se generan desde el layout template + prefix propio)
 * - dashboardVariant / dashboardPath (usa su propio slug)
 */
function buildInheritedOverride(
  parentOverride: SpecialtyConfigOverride,
  _childIdentity: typeof ALL_SPECIALTY_IDENTITIES[number]
): SpecialtyConfigOverride {
  return {
    // Heredar theme visual del padre
    theme: parentOverride.theme,
    // Heredar widgets del padre (los mismos paneles)
    widgets: parentOverride.widgets,
    // Heredar settings del padre (appointment types, flags, etc.)
    settings: parentOverride.settings,
    // NO heredar: modules, prioritizedKpis, kpiDefinitions, dashboardVariant, dashboardPath
  };
}

// ============================================================================
// SINGLETON — se genera una sola vez
// ============================================================================

/** Todas las 132 configuraciones generadas */
export const ALL_SPECIALTY_CONFIGS: ReadonlyMap<string, SpecialtyConfig> = generateAllConfigs();

// ============================================================================
// API PÚBLICA
// ============================================================================

/**
 * Obtener la configuración de una especialidad por slug.
 *
 * @param slug - Slug de la especialidad: 'cardiologia', 'odontologia', etc.
 * @returns SpecialtyConfig o undefined si no existe
 *
 * @example
 * ```ts
 * const config = getGeneratedConfig('cardiologia');
 * console.log(config?.name); // 'Cardiología'
 * ```
 */
export function getGeneratedConfig(slug: string): SpecialtyConfig | undefined {
  return ALL_SPECIALTY_CONFIGS.get(slug);
}

/**
 * Obtener todas las configuraciones generadas como array.
 */
export function getAllGeneratedConfigs(): SpecialtyConfig[] {
  return Array.from(ALL_SPECIALTY_CONFIGS.values());
}

/**
 * Obtener configuraciones por categoría.
 *
 * @param categoryId - ID de categoría: 'cardiovascular', 'pediatria', etc.
 */
export function getGeneratedConfigsByCategory(categoryId: string): SpecialtyConfig[] {
  return Array.from(ALL_SPECIALTY_CONFIGS.values()).filter((c) => {
    // Buscar la identity para comparar categoryId
    const identity = ALL_SPECIALTY_IDENTITIES.find((i) => i.slug === c.slug);
    return identity?.categoryId === categoryId;
  });
}

/**
 * Obtener todos los slugs de especialidades registradas.
 */
export function getAllRegisteredSlugs(): string[] {
  return Array.from(ALL_SPECIALTY_CONFIGS.keys());
}

/**
 * Verificar si un slug tiene un override personalizado.
 */
export function hasOverride(slug: string): boolean {
  return SPECIALTY_OVERRIDES.has(slug);
}

/**
 * Obtener el conteo total de especialidades registradas.
 */
export function getRegisteredCount(): number {
  return ALL_SPECIALTY_CONFIGS.size;
}

// Re-export factory y overrides para acceso externo
export { buildSpecialtyConfig } from './config-factory';
export type { SpecialtyConfigOverride } from './config-factory';
export { getLayoutTemplate, materializeModule, materializeLayout } from './layout-templates';
export type { ModuleTemplate, LayoutTemplate } from './layout-templates';
export {
  SPECIALTY_OVERRIDES,
  odontologiaOverride,
  cardiologiaOverride,
  pediatriaOverride,
  PEDIATRIC_AGE_GROUPS,
  GROWTH_CHART_STANDARDS,
  VACCINATION_SCHEDULE,
  DEVELOPMENTAL_MILESTONES,
} from './overrides';
