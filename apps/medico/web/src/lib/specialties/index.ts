// ============================================
// SPECIALTY EXPERIENCE SYSTEM - Main Export
// ============================================

// Core types and interfaces
export * from './core/types';

// Registry - manages all specialty configurations
export * from './core/registry';

// Detector - auto-detects specialty from user profile
export * from './core/detector';

// Factory - dynamic component loading
export * from './core/factory';

// Module system - strict typed modules with context validation
export * from './core/module-validator';
export {
  registerModule,
  registerModules,
  getModulesForContext,
  getModulesForGroup,
  getWidgetModulesForContext,
  validateModuleInContext,
  getRegistryDiagnostics,
} from './core/module-registry';

// Module catalog - pre-built module definitions
export * from './modules/catalog';

// Identity system - 132 specialty identities, category meta, and mapping
export * from './identity';

// Config system — factory, templates, overrides, auto-registry
export {
  getGeneratedConfig,
  getAllGeneratedConfigs,
  getGeneratedConfigsByCategory,
  getAllRegisteredSlugs,
  hasOverride,
  getRegisteredCount,
} from './configs';

export { buildSpecialtyConfig } from './configs/config-factory';
export type { SpecialtyConfigOverride } from './configs/config-factory';

export {
  getLayoutTemplate,
  materializeModule,
  materializeLayout,
} from './configs/layout-templates';

export {
  odontologiaOverride,
  cardiologiaOverride,
  pediatriaOverride,
  SPECIALTY_OVERRIDES,
} from './configs/overrides';

// Data layer — KPI resolver
export { resolveKpis, type KpiResolutionResult } from './data';

// Legacy re-exports — resolve from the generated registry
import { getGeneratedConfig } from './configs';

/** @deprecated Use getGeneratedConfig('odontologia') or getSpecialtyConfig('odontologia') */
export const dentalConfig = getGeneratedConfig('odontologia')!;

/** @deprecated Use getGeneratedConfig('cardiologia') or getSpecialtyConfig('cardiologia') */
export const cardiologyConfig = getGeneratedConfig('cardiologia')!;

/** @deprecated Use getGeneratedConfig('pediatria') or getSpecialtyConfig('pediatria') */
export const pediatricsConfig = getGeneratedConfig('pediatria')!;

// ==================== MAIN API ====================

/**
 * Get the complete specialty experience configuration for a user context
 *
 * This is the main entry point for the specialty system.
 * It replaces the old getSpecialtyExperienceConfig() function.
 *
 * @param context - User profile and detection context
 * @returns The specialty configuration or default config
 *
 * @example
 * ```tsx
 * import { getSpecialtyExperienceConfig } from '@/lib/specialties';
 *
 * function DoctorDashboard({ profile }) {
 *   const config = getSpecialtyExperienceConfig({
 *     specialtyName: profile?.specialty?.name,
 *     subSpecialties: profile?.subespecialidades,
 *     sacsEspecialidad: profile?.sacs_especialidad,
 *   });
 *
 *   return (
 *     <DashboardLayout config={config}>
 *       <SpecialtyDashboard config={config} />
 *     </DashboardLayout>
 *   );
 * }
 * ```
 */
import { getSpecialtyForContext } from './core/detector';
import type { SpecialtyContext, SpecialtyConfig } from './core/types';

export function getSpecialtyExperienceConfig(
  context: SpecialtyContext
): SpecialtyConfig {
  const config = getSpecialtyForContext(context, true);

  if (!config) {
    // Return a minimal default config if nothing is found
    return {
      id: 'default',
      name: 'Médico',
      slug: 'medico',
      category: 'medical',
      keywords: [],
      dashboardVariant: 'default',
      modules: {},
      prioritizedKpis: [],
    };
  }

  return config;
}

/**
 * Check if a user context matches a specific specialty
 *
 * @example
 * ```tsx
 * const isDental = isSpecialtyMatch(profile, 'dental');
 * ```
 */
export function isSpecialtyMatch(
  context: SpecialtyContext,
  specialtyId: string
): boolean {
  const config = getSpecialtyForContext(context, false);
  return config?.id === specialtyId;
}

/**
 * Get menu groups for a specialty (for sidebar navigation)
 *
 * @example
 * ```tsx
 * const menuGroups = getSpecialtyMenuGroups(config);
 * // Returns: [
 * //   { label: 'Principal', items: [...] },
 * //   { label: 'Clínica', items: [...] },
 * //   { label: 'Finanzas', items: [...] },
 * // ]
 * ```
 */
export function getSpecialtyMenuGroups(
  config: SpecialtyConfig
): Array<{
  label: string;
  icon?: string;
  items: Array<{
    key: string;
    label: string;
    icon: string;
    route: string;
    badge?: string | number;
    description?: string;
  }>;
  order?: number;
}> {
  const groups: Array<{
    label: string;
    icon?: string;
    items: Array<{
      key: string;
      label: string;
      icon: string;
      route: string;
      badge?: string | number;
      description?: string;
    }>;
    order?: number;
  }> = [];

  // Group metadata for display order
  const groupMetadata: Record<
    string,
    { label: string; icon: string; order: number }
  > = {
    clinical: { label: 'Clínica', icon: 'Stethoscope', order: 1 },
    financial: { label: 'Finanzas', icon: 'DollarSign', order: 2 },
    lab: { label: 'Laboratorio', icon: 'FlaskConical', order: 3 },
    technology: { label: 'Tecnología', icon: 'Sparkles', order: 4 },
    communication: { label: 'Comunicación', icon: 'MessageCircle', order: 5 },
    growth: { label: 'Crecimiento', icon: 'TrendingUp', order: 6 },
    administrative: {
      label: 'Administración',
      icon: 'Settings',
      order: 7,
    },
    education: { label: 'Educación', icon: 'BookOpen', order: 8 },
  };

  // Build menu groups from config
  for (const [groupKey, modules] of Object.entries(config.modules)) {
    if (!modules || modules.length === 0) continue;

    const metadata = groupMetadata[groupKey];
    if (!metadata) continue;

    groups.push({
      label: metadata.label,
      icon: metadata.icon,
      order: metadata.order,
      items: modules
        .filter((m) => m.enabledByDefault !== false)
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .map((module) => ({
          key: module.key,
          label: module.label,
          icon: module.icon,
          route: module.route,
          description: module.settings?.description as string | undefined,
        })),
    });
  }

  // Sort by order
  groups.sort((a, b) => (a.order || 999) - (b.order || 999));

  return groups;
}

// ==================== LEGACY SUPPORT ====================

/**
 * @deprecated Use getSpecialtyExperienceConfig() instead
 */
export function isOdontologySpecialtyLegacy(specialtyName?: string | null): boolean {
  if (!specialtyName) return false;

  const keywords = [
    'odontologia',
    'odontología',
    'cirujano dentista',
    'doctor en odontologia',
    'doctor en odontología',
    'estomatologia',
    'estomatología',
    'odontologo',
    'odontólogo',
    'dental',
  ];

  const normalized = specialtyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  return keywords.some((keyword) => {
    const normalizedKeyword = keyword
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return (
      normalized === normalizedKeyword ||
      normalized.includes(normalizedKeyword) ||
      normalizedKeyword.includes(normalized)
    );
  });
}
