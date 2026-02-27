// ============================================
// SPECIALTY REGISTRY
// Central registry for all 132 specialty configurations
// ============================================

import { SpecialtyConfig, SpecialtyId, SpecialtyRegistry, LEGACY_ID_MAP } from './types';
import { ALL_SPECIALTY_CONFIGS } from '../configs';

/**
 * Global specialty registry
 * Initialized automatically with all 132 generated configs
 */
const REGISTRY: SpecialtyRegistry = new Map();

/**
 * Initialize the registry with all auto-generated specialty configurations.
 *
 * Uses the config factory system (configs/) which:
 * 1. Reads all 132 SpecialtyIdentity definitions
 * 2. Applies layout templates based on category dashboardLayout
 * 3. Layers specialty-specific overrides (dental, cardiology, pediatrics, etc.)
 */
function initializeRegistry(): void {
  // Register all 132 auto-generated configs
  for (const [slug, config] of ALL_SPECIALTY_CONFIGS) {
    REGISTRY.set(slug as SpecialtyId, config);
  }

  // Register legacy ID aliases for backwards compatibility
  for (const [legacyId, canonicalSlug] of Object.entries(LEGACY_ID_MAP)) {
    if (legacyId !== canonicalSlug && !REGISTRY.has(legacyId as SpecialtyId)) {
      const config = REGISTRY.get(canonicalSlug as SpecialtyId);
      if (config) {
        REGISTRY.set(legacyId as SpecialtyId, config);
      }
    }
  }
}

/**
 * Register a specialty configuration
 */
export function registerSpecialty(config: SpecialtyConfig): void {
  if (REGISTRY.has(config.id as SpecialtyId)) {
    console.warn(`[SpecialtyRegistry] Specialty "${config.id}" is already registered. Overwriting.`);
  }
  REGISTRY.set(config.id as SpecialtyId, config);
}

/**
 * Get a specialty configuration by ID (supports both legacy and canonical IDs)
 */
export function getSpecialtyConfig(id: string): SpecialtyConfig | undefined {
  // Try direct lookup first
  const direct = REGISTRY.get(id as SpecialtyId);
  if (direct) return direct;

  // Try legacy mapping
  const canonical = LEGACY_ID_MAP[id];
  if (canonical) {
    return REGISTRY.get(canonical as SpecialtyId);
  }

  return undefined;
}

/**
 * Get all registered specialty IDs (canonical slugs only, no legacy aliases)
 */
export function getAllSpecialtyIds(): SpecialtyId[] {
  const legacyIds = new Set(Object.keys(LEGACY_ID_MAP));
  return Array.from(REGISTRY.keys()).filter((id) => !legacyIds.has(id) || LEGACY_ID_MAP[id] === id);
}

/**
 * Get all registered specialty configurations (unique, no legacy duplicates)
 */
export function getAllSpecialties(): SpecialtyConfig[] {
  const seen = new Set<string>();
  const result: SpecialtyConfig[] = [];

  for (const config of REGISTRY.values()) {
    if (!seen.has(config.slug)) {
      seen.add(config.slug);
      result.push(config);
    }
  }

  return result;
}

/**
 * Get specialties by category
 */
export function getSpecialtiesByCategory(category: SpecialtyConfig['category']): SpecialtyConfig[] {
  return getAllSpecialties().filter(s => s.category === category);
}

/**
 * Check if a specialty ID exists in the registry
 */
export function hasSpecialty(id: string): boolean {
  return REGISTRY.has(id as SpecialtyId) || (id in LEGACY_ID_MAP && REGISTRY.has(LEGACY_ID_MAP[id] as SpecialtyId));
}

/**
 * Get the count of registered specialties (unique configs, no legacy duplicates)
 */
export function getRegistrySize(): number {
  return getAllSpecialties().length;
}

/**
 * Clear the registry (useful for testing)
 */
export function clearRegistry(): void {
  REGISTRY.clear();
}

/**
 * Reinitialize the registry
 */
export function reinitializeRegistry(): void {
  clearRegistry();
  initializeRegistry();
}

// Initialize on import
initializeRegistry();

// Export the registry for direct access if needed
export { REGISTRY as specialtyRegistry };
