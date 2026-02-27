// ============================================
// SPECIALTY COMPONENT FACTORY
// Dynamic component loading for specialty modules
// ============================================

import { lazy, ComponentType } from 'react';
import type { SpecialtyConfig, SpecialtyModule } from './types';

/**
 * Dynamic import cache
 * Stores dynamically loaded specialty components
 */
const COMPONENT_CACHE = new Map<string, ComponentType>();

/**
 * Componentes especializados mapeados de forma estática para Turbopack
 */
const COMPONENT_MAP: Record<string, any> = {
  // Dashboards
  'dashboard:odontologia': () => import('@/components/dashboard/medico/odontologia/odontologia-dashboard'),
  'dashboard:cardiologia': () => import('@/components/dashboard/medico/cardiology/cardiologia-dashboard'),
  'dashboard:cardiology': () => import('@/components/dashboard/medico/cardiology/cardiologia-dashboard'),
  'dashboard:pediatria': () => import('@/components/dashboard/medico/pediatria/pediatria-dashboard'),
  'dashboard:pediatrics': () => import('@/components/dashboard/medico/pediatria/pediatria-dashboard'),
  'dashboard:neurologia': () => import('@/components/dashboard/medico/neurologia/neurologia-dashboard'),
  'dashboard:oftalmologia': () => import('@/components/dashboard/medico/oftalmologia/oftalmologia-dashboard'),
  'dashboard:traumatologia': () => import('@/components/dashboard/medico/traumatologia/traumatologia-dashboard'),
  'dashboard:ginecologia': () => import('@/components/dashboard/medico/ginecologia/ginecologia-dashboard'),

  // Módulos Odontología - only components that exist in paciente app
  'module:periodontograma': () => import('@/components/dashboard/medico/odontologia/periodontogram/periodontogram-professional'),
  // 'module:odontograma-facial': () => import('@/app/dashboard/medico/odontologia/3d/page'),
  // 'module:dental-imaging-ai': () => import('@/app/dashboard/medico/odontologia/imaging/page'),
  // 'module:practice-growth': () => import('@/app/dashboard/medico/odontologia/growth/page'),
  // 'module:rcm-dental': () => import('@/app/dashboard/medico/odontologia/rcm/page'),

  // Widgets Odontología
  'widget:odontologia:odontogram': () => import('@/components/dashboard/medico/odontologia/widgets/odontogram-widget'),
  'widget:odontologia:ai-imaging': () => import('@/components/dashboard/medico/odontologia/widgets/ai-imaging-widget'),
  'widget:odontologia:eligibility': () => import('@/components/dashboard/medico/odontologia/widgets/eligibility-widget'),
  'widget:odontologia:practice-growth': () => import('@/components/dashboard/medico/odontologia/widgets/practice-growth-widget'),

  // Widgets Cardiología
  'widget:cardiologia:patient-status': () => import('@/components/dashboard/medico/cardiology/widgets/patient-status-widget'),
  'widget:cardiologia:upcoming-procedures': () => import('@/components/dashboard/medico/cardiology/widgets/upcoming-procedures-widget'),
  'widget:cardiologia:ecg-queue': () => import('@/components/dashboard/medico/cardiology/widgets/ecg-queue-widget'),
  'widget:cardiologia:critical-alerts': () => import('@/components/dashboard/medico/cardiology/widgets/critical-alerts-widget'),

  // Widgets Pediatría
  'widget:pediatria:well-child-schedule': () => import('@/components/dashboard/medico/pediatria/widgets/well-child-schedule-widget'),
  'widget:pediatria:vaccination-tracker': () => import('@/components/dashboard/medico/pediatria/widgets/vaccination-tracker-widget'),
  'widget:pediatria:growth-alerts': () => import('@/components/dashboard/medico/pediatria/widgets/growth-alerts-widget'),
  'widget:pediatria:appointment-reminders': () => import('@/components/dashboard/medico/pediatria/widgets/appointment-reminders-widget'),
};

/**
 * Load a specialty dashboard component dynamically
 */
export async function loadSpecialtyDashboard(
  specialtyId: string
): Promise<ComponentType | null> {
  const cacheKey = `dashboard:${specialtyId}`;

  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  try {
    const importFn = COMPONENT_MAP[cacheKey];

    if (importFn) {
      const module = await importFn();
      const DashboardComponent = module.default;
      COMPONENT_CACHE.set(cacheKey, DashboardComponent);
      return DashboardComponent;
    }

    console.error(`[SpecialtyFactory] Dashboard for "${specialtyId}" not found in COMPONENT_MAP. Static mapping is required for Turbopack.`);
    return null;
  } catch (error) {
    console.error(`[SpecialtyFactory] Failed to load dashboard for "${specialtyId}":`, error);
    return null;
  }
}

/**
 * Load a specialty module component dynamically
 */
export async function loadSpecialtyModule(
  module: SpecialtyModule
): Promise<ComponentType | null> {
  const cacheKey = `module:${module.key}`;

  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  try {
    const importFn = COMPONENT_MAP[cacheKey];

    if (importFn) {
      const importedModule = await importFn();
      const component = importedModule.default;
      COMPONENT_CACHE.set(cacheKey, component);
      return component;
    }

    console.error(`[SpecialtyFactory] Module "${module.key}" not found in COMPONENT_MAP. Static mapping is required for Turbopack.`);
    return null;
  } catch (error) {
    console.error(`[SpecialtyFactory] Failed to load module "${module.key}":`, error);
    return null;
  }
}

/**
 * Load a specialty widget component dynamically
 */
export async function loadSpecialtyWidget(
  widgetKey: string,
  specialtyId: string
): Promise<ComponentType | null> {
  const cacheKey = `widget:${specialtyId}:${widgetKey}`;

  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  try {
    const importFn = COMPONENT_MAP[cacheKey];

    if (importFn) {
      const importedModule = await importFn();
      const component = importedModule.default;
      COMPONENT_CACHE.set(cacheKey, component);
      return component;
    }

    console.error(`[SpecialtyFactory] Widget "${widgetKey}" for "${specialtyId}" not found in COMPONENT_MAP. Static mapping is required for Turbopack.`);
    return null;
  } catch (error) {
    console.error(`[SpecialtyFactory] Failed to load widget "${widgetKey}" for "${specialtyId}":`, error);
    return null;
  }
}

/**
 * Convert a route path to a component path
 *
 * Examples:
 * - /dashboard/medico/odontologia/periodontograma
 *   -> @/components/dashboard/medico/odontologia/periodontograma/page
 *
 * - /dashboard/medico/citas
 *   -> @/components/dashboard/medico/citas/page
 */
function routeToComponentPath(route: string): string {
  // This function is deprecated for use in dynamic imports
  // as Turbopack cannot statically analyze its output.
  throw new Error(`Turbopack static analysis requires explicit import blocks for route: ${route}`);
}

/**
 * Clear the component cache
 * Useful for testing or hot reload scenarios
 */
export function clearComponentCache(): void {
  COMPONENT_CACHE.clear();
}

/**
 * Preload components for a specialty
 * Call this to avoid loading delays when user navigates
 *
 * @param config - The specialty configuration
 */
export async function preloadSpecialtyComponents(
  config: SpecialtyConfig
): Promise<void> {
  const promises: Promise<unknown>[] = [];

  // Preload dashboard
  promises.push(loadSpecialtyDashboard(config.id));

  // Preload enabled modules
  for (const group of Object.values(config.modules)) {
    if (!group) continue;
    for (const module of group) {
      if (module.enabledByDefault !== false) {
        promises.push(loadSpecialtyModule(module));
      }
    }
  }

  // Preload required widgets
  for (const widget of config.widgets || []) {
    if (widget.required) {
      promises.push(loadSpecialtyWidget(widget.key, config.id));
    }
  }

  await Promise.allSettled(promises);
}

/**
 * Create a lazy-loaded specialty dashboard component
 * Use this in React components for code splitting
 *
 * @param specialtyId - The specialty ID
 * @returns A React component that lazy loads the dashboard
 */
export function createLazySpecialtyDashboard(
  specialtyId: string
): ComponentType {
  return lazy(() =>
    loadSpecialtyDashboard(specialtyId).then((component) => ({
      default: component || (() => null),
    }))
  );
}

/**
 * Create a lazy-loaded module component
 *
 * @param module - The specialty module configuration
 * @returns A React component that lazy loads the module
 */
export function createLazyModule(
  module: SpecialtyModule
): ComponentType {
  return lazy(() =>
    loadSpecialtyModule(module).then((component) => ({
      default: component || (() => null),
    }))
  );
}
