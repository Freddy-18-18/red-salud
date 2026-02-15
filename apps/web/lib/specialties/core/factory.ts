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
 * Load a specialty dashboard component dynamically
 *
 * @param specialtyId - The specialty ID (e.g., 'dental', 'cardiology')
 * @returns The dashboard component for the specialty
 */
export async function loadSpecialtyDashboard(
  specialtyId: string
): Promise<ComponentType | null> {
  const cacheKey = `dashboard:${specialtyId}`;

  // Check cache first
  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  try {
    // Dynamic import based on specialty ID
    // This relies on Next.js dynamic imports
    const module = await import(
      /* webpackMode: "lazy" */
      `@/components/dashboard/medico/${specialtyId}/${specialtyId}-dashboard`
    );

    const DashboardComponent = module.default;

    // Cache the component
    COMPONENT_CACHE.set(cacheKey, DashboardComponent);

    return DashboardComponent;
  } catch (error) {
    console.error(
      `[SpecialtyFactory] Failed to load dashboard for "${specialtyId}":`,
      error
    );
    return null;
  }
}

/**
 * Load a specialty module component dynamically
 *
 * @param module - The specialty module configuration
 * @returns The module component or null if not found
 */
export async function loadSpecialtyModule(
  module: SpecialtyModule
): Promise<ComponentType | null> {
  const cacheKey = `module:${module.key}`;

  // Check cache first
  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  // If module has a specific component path, use it
  if (module.componentPath) {
    try {
      const importedModule = await import(/* webpackMode: "lazy" */ module.componentPath);
      const component = importedModule.default;

      COMPONENT_CACHE.set(cacheKey, component);
      return component;
    } catch (error) {
      console.error(
        `[SpecialtyFactory] Failed to load module at path "${module.componentPath}":`,
        error
      );
    }
  }

  // Otherwise, try to infer the path from the module key and route
  try {
    // Convert route to component path
    // e.g., "/dashboard/medico/odontologia/periodontograma"
    //      -> "@/components/dashboard/medico/odontologia/periodontogram/page"
    const componentPath = routeToComponentPath(module.route);
    const importedModule = await import(/* webpackMode: "lazy" */ componentPath);
    const component = importedModule.default;

    COMPONENT_CACHE.set(cacheKey, component);
    return component;
  } catch (error) {
    console.error(
      `[SpecialtyFactory] Failed to load module "${module.key}":`,
      error
    );
    return null;
  }
}

/**
 * Load a specialty widget component dynamically
 *
 * @param widgetKey - The widget identifier (e.g., 'morning-huddle', 'odontogram')
 * @param specialtyId - The specialty ID
 * @returns The widget component or null if not found
 */
export async function loadSpecialtyWidget(
  widgetKey: string,
  specialtyId: string
): Promise<ComponentType | null> {
  const cacheKey = `widget:${specialtyId}:${widgetKey}`;

  // Check cache first
  if (COMPONENT_CACHE.has(cacheKey)) {
    return COMPONENT_CACHE.get(cacheKey)!;
  }

  try {
    const componentPath = `@/components/dashboard/medico/${specialtyId}/widgets/${widgetKey}-widget`;
    const importedModule = await import(/* webpackMode: "lazy" */ componentPath);
    const component = importedModule.default;

    COMPONENT_CACHE.set(cacheKey, component);
    return component;
  } catch (error) {
    console.error(
      `[SpecialtyFactory] Failed to load widget "${widgetKey}" for "${specialtyId}":`,
      error
    );
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
  // Remove leading slash and split
  const segments = route.replace(/^\//, '').split('/');

  // Find the dashboard segment
  const dashboardIndex = segments.indexOf('dashboard');
  if (dashboardIndex === -1) {
    throw new Error(`Invalid route: ${route}`);
  }

  // Extract relevant segments after dashboard
  const routeSegments = segments.slice(dashboardIndex + 1);

  // Build component path
  // For routes like "medico/odontologia/periodontograma"
  // We want "@/components/dashboard/medico/odontologia/periodontograma/page"
  return `@/components/dashboard/${routeSegments.join('/')}/page`;
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
