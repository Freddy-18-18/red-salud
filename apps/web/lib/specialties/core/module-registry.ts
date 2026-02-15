// ============================================
// MODULE REGISTRY
// Central registry for all module definitions
// with runtime context validation
// ============================================

import type {
  ModuleDefinition,
  ModuleRuntimeContext,
  ModuleSearchFilter,
  ModuleSearchResult,
  ModuleValidationResult,
  ModuleGroup,
} from '@red-salud/types';
import { validateModule, filterMountableModules } from './module-validator';

// ============================================================================
// REGISTRY SINGLETON
// ============================================================================

const MODULE_REGISTRY = new Map<string, ModuleDefinition>();
let _initialized = false;

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Register a single module in the global registry.
 * Throws if a module with the same ID is already registered (prevents silent overwrite).
 */
export function registerModule(module: ModuleDefinition): void {
  if (MODULE_REGISTRY.has(module.id)) {
    console.warn(
      `[ModuleRegistry] Module "${module.id}" is already registered. Overwriting.`
    );
  }
  MODULE_REGISTRY.set(module.id, module);
}

/**
 * Register multiple modules at once.
 */
export function registerModules(modules: ModuleDefinition[]): void {
  for (const mod of modules) {
    registerModule(mod);
  }
}

// ============================================================================
// LOOKUP
// ============================================================================

/**
 * Get a module by its ID.
 */
export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.get(id);
}

/**
 * Check if a module ID exists in the registry.
 */
export function hasModule(id: string): boolean {
  return MODULE_REGISTRY.has(id);
}

/**
 * Get all registered module IDs.
 */
export function getAllModuleIds(): string[] {
  return Array.from(MODULE_REGISTRY.keys());
}

/**
 * Get all registered modules.
 */
export function getAllModules(): ModuleDefinition[] {
  return Array.from(MODULE_REGISTRY.values());
}

/**
 * Get the total count of registered modules.
 */
export function getModuleRegistrySize(): number {
  return MODULE_REGISTRY.size;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

/**
 * Search modules with filters.
 *
 * @example
 * ```ts
 * // Find all clinical modules for dental specialty
 * const { modules } = searchModules({
 *   group: 'clinical',
 *   specialtyId: 'dental',
 *   lifecycle: 'stable',
 * });
 * ```
 */
export function searchModules(filter: ModuleSearchFilter): ModuleSearchResult {
  let results = getAllModules();

  if (filter.group) {
    results = results.filter((m) => m.group === filter.group);
  }

  if (filter.lifecycle) {
    const statuses = Array.isArray(filter.lifecycle)
      ? filter.lifecycle
      : [filter.lifecycle];
    results = results.filter((m) => statuses.includes(m.lifecycle));
  }

  if (filter.enabledByDefault !== undefined) {
    results = results.filter((m) => m.enabledByDefault === filter.enabledByDefault);
  }

  if (filter.hasWidget !== undefined) {
    results = results.filter((m) =>
      filter.hasWidget ? m.widget?.enabled : !m.widget?.enabled
    );
  }

  if (filter.tags && filter.tags.length > 0) {
    results = results.filter((m) =>
      filter.tags!.some((tag) => m.tags?.includes(tag))
    );
  }

  if (filter.specialtyId) {
    results = results.filter((m) => {
      if (m.context.compatibleSpecialties.includes('*')) return true;
      return m.context.compatibleSpecialties.includes(filter.specialtyId!);
    });
  }

  if (filter.specialtyCategory) {
    results = results.filter((m) => {
      if (m.context.compatibleSpecialties.includes('*')) return true;
      if (m.context.compatibleCategories?.includes('*')) return true;
      return m.context.compatibleCategories?.includes(
        filter.specialtyCategory!
      );
    });
  }

  if (filter.platform) {
    results = results.filter((m) => {
      if (!m.context.supportedPlatforms || m.context.supportedPlatforms.length === 0)
        return true;
      return m.context.supportedPlatforms.includes(filter.platform!);
    });
  }

  if (filter.capability) {
    results = results.filter(
      (m) =>
        !m.context.requiredCapabilities ||
        m.context.requiredCapabilities.includes(filter.capability!)
    );
  }

  if (filter.role) {
    results = results.filter(
      (m) =>
        m.context.allowedRoles.length === 0 ||
        m.context.allowedRoles.includes(filter.role!)
    );
  }

  if (filter.search) {
    const search = filter.search.toLowerCase();
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search) ||
        m.id.toLowerCase().includes(search) ||
        m.tags?.some((t) => t.toLowerCase().includes(search))
    );
  }

  return {
    modules: results,
    totalRegistered: MODULE_REGISTRY.size,
    appliedFilters: filter,
  };
}

// ============================================================================
// CONTEXT-AWARE MODULE RESOLUTION
// ============================================================================

/**
 * Get all modules that can mount in the given runtime context.
 * This is the primary API for rendering — it validates every module
 * and returns only those that pass all context checks.
 *
 * @example
 * ```ts
 * const { mountable, excluded } = getModulesForContext(runtimeContext);
 *
 * // Render sidebar with mountable modules
 * const sidebarItems = mountable.map(({ module }) => ({
 *   key: module.id,
 *   label: module.name,
 *   icon: module.icon,
 *   route: module.route,
 * }));
 *
 * // Log excluded for debugging
 * excluded.forEach(({ module, validation }) => {
 *   console.debug(`Module ${module.id} excluded:`, validation.errors);
 * });
 * ```
 */
export function getModulesForContext(context: ModuleRuntimeContext): {
  mountable: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>;
  excluded: Array<{ module: ModuleDefinition; validation: ModuleValidationResult }>;
} {
  return filterMountableModules(getAllModules(), context);
}

/**
 * Get only modules of a specific group that can mount.
 * Useful for rendering a single sidebar section.
 */
export function getModulesForGroup(
  group: ModuleGroup,
  context: ModuleRuntimeContext
): ModuleDefinition[] {
  const groupModules = getAllModules().filter((m) => m.group === group);
  const { mountable } = filterMountableModules(groupModules, context);
  return mountable
    .map(({ module: m }) => m)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/**
 * Get widget-capable modules that can mount.
 * For the dashboard grid.
 */
export function getWidgetModulesForContext(
  context: ModuleRuntimeContext
): Array<{ module: ModuleDefinition; validation: ModuleValidationResult }> {
  const widgetModules = getAllModules().filter((m) => m.widget?.enabled);
  const { mountable } = filterMountableModules(widgetModules, context);
  return mountable;
}

/**
 * Validate a single module against a context without the full search.
 */
export function validateModuleInContext(
  moduleId: string,
  context: ModuleRuntimeContext
): ModuleValidationResult | null {
  const mod = getModule(moduleId);
  if (!mod) return null;
  return validateModule(mod, context);
}

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Clear the registry (for testing).
 */
export function clearModuleRegistry(): void {
  MODULE_REGISTRY.clear();
  _initialized = false;
}

/**
 * Check if the registry has been initialized.
 */
export function isModuleRegistryInitialized(): boolean {
  return _initialized;
}

/**
 * Mark the registry as initialized.
 * Called after all modules have been registered.
 */
export function markModuleRegistryInitialized(): void {
  _initialized = true;
}

/**
 * Get a diagnostic report of the registry.
 * Useful for admin/debug panels.
 */
export function getRegistryDiagnostics(): {
  totalModules: number;
  byGroup: Record<string, number>;
  byLifecycle: Record<string, number>;
  withWidgets: number;
  initialized: boolean;
} {
  const all = getAllModules();

  const byGroup: Record<string, number> = {};
  const byLifecycle: Record<string, number> = {};
  let withWidgets = 0;

  for (const mod of all) {
    byGroup[mod.group] = (byGroup[mod.group] ?? 0) + 1;
    byLifecycle[mod.lifecycle] = (byLifecycle[mod.lifecycle] ?? 0) + 1;
    if (mod.widget?.enabled) withWidgets++;
  }

  return {
    totalModules: all.length,
    byGroup,
    byLifecycle,
    withWidgets,
    initialized: _initialized,
  };
}
