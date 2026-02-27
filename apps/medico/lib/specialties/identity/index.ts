/**
 * @file identity/index.ts
 * @description Barrel export del módulo de identidad de especialidades.
 *
 * Exporta:
 * - Metadatos visuales de categorías (CATEGORY_META)
 * - Identidades de las 132 especialidades (ALL_SPECIALTY_IDENTITIES)
 * - Lookups O(1) por slug, masterId, categoría
 * - Sistema de mapeo bidireccional (masterIdToSlug, slugToMasterId, etc.)
 * - Resolución universal (resolveIdentity)
 * - Búsqueda y navegación jerárquica de especialidades
 */

// Category visual metadata
export {
  CATEGORY_META,
  getCategoryMeta,
  getAllCategoriesSorted,
  getCategoriesByLayout,
} from './category-meta';

// Identity definitions & lookups
export {
  ALL_SPECIALTY_IDENTITIES,
  IDENTITY_BY_SLUG,
  IDENTITY_BY_MASTER_ID,
  IDENTITIES_BY_CATEGORY,
} from './specialty-identities';

// Mapping & resolution
export {
  SPECIALTY_ID_MAPPING,
  masterIdToSlug,
  slugToMasterId,
  getIdentityBySlug,
  getIdentityByMasterId,
  getIdentityByName,
  resolveIdentity,
  searchIdentities,
  getSubSpecialties,
  getParentSpecialty,
  getSpecialtyTree,
} from './id-mapping';
