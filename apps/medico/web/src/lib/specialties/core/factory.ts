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
// TODO: Add dynamic imports for specialty dashboard/widget components as they are migrated.
// Each key maps to a static import() for Turbopack compatibility.
// Original component paths (from monolith) documented below for reference:
//
// Dashboards:
//   'dashboard:odontologia'  -> '@/components/dashboard/odontologia/odontologia-dashboard'
//   'dashboard:cardiologia'  -> '@/components/dashboard/cardiology/cardiologia-dashboard'
//   'dashboard:pediatria'    -> '@/components/dashboard/pediatria/pediatria-dashboard'
//   'dashboard:neurologia'   -> '@/components/dashboard/neurologia/neurologia-dashboard'
//   'dashboard:oftalmologia' -> '@/components/dashboard/oftalmologia/oftalmologia-dashboard'
//   'dashboard:traumatologia'-> '@/components/dashboard/traumatologia/traumatologia-dashboard'
//   'dashboard:ginecologia'  -> '@/components/dashboard/ginecologia/ginecologia-dashboard'
//
// Modules (Odontologia):
//   'module:periodontograma'   -> '@/components/dashboard/odontologia/periodontogram/periodontogram-professional'
//   'module:odontograma-facial'-> '@/app/dashboard/odontologia/3d/page'
//   'module:dental-imaging-ai' -> '@/app/dashboard/odontologia/imaging/page'
//   'module:practice-growth'   -> '@/app/dashboard/odontologia/growth/page'
//   'module:rcm-dental'        -> '@/app/dashboard/odontologia/rcm/page'
//
const COMPONENT_MAP: Record<string, () => Promise<any>> = {
  // Components will be registered here as they are migrated
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
