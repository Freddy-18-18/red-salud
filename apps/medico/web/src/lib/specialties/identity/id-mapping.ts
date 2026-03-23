/**
 * @file id-mapping.ts
 * @description Sistema de mapeo bidireccional entre master-list IDs, slugs y nombres.
 *
 * Provee funciones O(1) para:
 * - master ID → slug         (e.g. 'car-1'  → 'cardiologia')
 * - slug → master ID         (e.g. 'cardiologia' → 'car-1')
 * - nombre → identity        (fuzzy & exact match)
 * - resolución universal     (acepta cualquier formato, devuelve IdentityResolution)
 */

import type { SpecialtyIdentity, SpecialtyIdMapping, IdentityResolution } from '@red-salud/types';
import {
  ALL_SPECIALTY_IDENTITIES,
  IDENTITY_BY_SLUG,
  IDENTITY_BY_MASTER_ID,
} from './specialty-identities';
import { getCategoryMeta } from './category-meta';

// ============================================================================
// Pre-computed maps
// ============================================================================

/** Mapa normalizado de nombre → SpecialtyIdentity */
const NAME_MAP: ReadonlyMap<string, SpecialtyIdentity> = new Map(
  ALL_SPECIALTY_IDENTITIES.flatMap((id) => {
    const entries: [string, SpecialtyIdentity][] = [
      [normalize(id.name), id],
      [normalize(id.shortName), id],
    ];
    // Add keywords as secondary lookup
    for (const kw of id.keywords) {
      entries.push([normalize(kw), id]);
    }
    return entries;
  })
);

/** SpecialtyIdMapping static object */
export const SPECIALTY_ID_MAPPING: SpecialtyIdMapping = {
  masterToSlug: Object.fromEntries(
    ALL_SPECIALTY_IDENTITIES.map((id) => [id.masterId, id.slug])
  ) as Record<string, string>,
  slugToMaster: Object.fromEntries(
    ALL_SPECIALTY_IDENTITIES.map((id) => [id.slug, id.masterId])
  ) as Record<string, string>,
  nameToSlug: Object.fromEntries(
    ALL_SPECIALTY_IDENTITIES.map((id) => [normalize(id.name), id.slug])
  ) as Record<string, string>,
};

// ============================================================================
// Core API
// ============================================================================

/**
 * Convierte un master ID (e.g. 'car-1') al slug canónico
 */
export function masterIdToSlug(masterId: string): string | undefined {
  return IDENTITY_BY_MASTER_ID.get(masterId)?.slug;
}

/**
 * Convierte un slug al master ID (e.g. 'cardiologia' → 'car-1')
 */
export function slugToMasterId(slug: string): string | undefined {
  return IDENTITY_BY_SLUG.get(slug)?.masterId;
}

/**
 * Obtiene la identidad completa por slug
 */
export function getIdentityBySlug(slug: string): SpecialtyIdentity | undefined {
  return IDENTITY_BY_SLUG.get(slug);
}

/**
 * Obtiene la identidad completa por master ID
 */
export function getIdentityByMasterId(masterId: string): SpecialtyIdentity | undefined {
  return IDENTITY_BY_MASTER_ID.get(masterId);
}

/**
 * Busca identidad por nombre (exact match normalizado)
 */
export function getIdentityByName(name: string): SpecialtyIdentity | undefined {
  return NAME_MAP.get(normalize(name));
}

/**
 * Resolución universal: acepta slug, masterId, nombre o keyword
 * y devuelve la identidad con nivel de confianza.
 */
export function resolveIdentity(input: string): IdentityResolution {
  const normalized = normalize(input);

  // 1. Exact slug match
  const bySlug = IDENTITY_BY_SLUG.get(input) ?? IDENTITY_BY_SLUG.get(normalized);
  if (bySlug) {
    return makeResolution(bySlug, 'exact');
  }

  // 2. Exact master ID match
  const byMaster = IDENTITY_BY_MASTER_ID.get(input);
  if (byMaster) {
    return makeResolution(byMaster, 'exact');
  }

  // 3. Name / keyword exact match
  const byName = NAME_MAP.get(normalized);
  if (byName) {
    return makeResolution(byName, 'keyword', normalized);
  }

  // 4. Fuzzy search — find the closest keyword
  const fuzzyResult = fuzzyMatch(normalized);
  if (fuzzyResult) {
    return makeResolution(fuzzyResult, 'fuzzy');
  }

  // 5. Fallback — use general medicine
  const fallback = IDENTITY_BY_SLUG.get('medicina-general')!;
  return makeResolution(fallback, 'fallback');
}

/**
 * Busca todas las identidades cuyo nombre, shortName o keywords contengan el term
 */
export function searchIdentities(term: string, limit = 10): SpecialtyIdentity[] {
  const normalized = normalize(term);
  if (!normalized) return [];

  const scored: { identity: SpecialtyIdentity; score: number }[] = [];

  for (const identity of ALL_SPECIALTY_IDENTITIES) {
    let score = 0;

    // Exact name match
    if (normalize(identity.name) === normalized) {
      score = 100;
    } else if (normalize(identity.name).includes(normalized)) {
      score = 80;
    } else if (normalize(identity.shortName).includes(normalized)) {
      score = 70;
    } else {
      // Keyword match
      for (const kw of identity.keywords) {
        if (normalize(kw).includes(normalized)) {
          score = Math.max(score, 60);
        } else if (normalized.includes(normalize(kw))) {
          score = Math.max(score, 50);
        }
      }
    }

    // Slug partial match
    if (identity.slug.includes(normalized)) {
      score = Math.max(score, 55);
    }

    if (score > 0) {
      scored.push({ identity, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.identity);
}

/**
 * Obtiene todas las subespecialidades de una especialidad padre
 */
export function getSubSpecialties(parentSlug: string): SpecialtyIdentity[] {
  return ALL_SPECIALTY_IDENTITIES.filter((id) => id.parentSlug === parentSlug);
}

/**
 * Obtiene el padre de una subespecialidad
 */
export function getParentSpecialty(childSlug: string): SpecialtyIdentity | undefined {
  const child = IDENTITY_BY_SLUG.get(childSlug);
  if (!child?.parentSlug) return undefined;
  return IDENTITY_BY_SLUG.get(child.parentSlug);
}

/**
 * Obtiene el árbol completo de una especialidad (padre + hijos)
 */
export function getSpecialtyTree(slug: string): {
  root: SpecialtyIdentity;
  children: SpecialtyIdentity[];
} | undefined {
  const identity = IDENTITY_BY_SLUG.get(slug);
  if (!identity) return undefined;

  // Si es subespecialidad, ir al padre
  const root = identity.parentSlug
    ? IDENTITY_BY_SLUG.get(identity.parentSlug) ?? identity
    : identity;

  const children = ALL_SPECIALTY_IDENTITIES.filter((id) => id.parentSlug === root.slug);

  return { root, children };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Creates a properly typed IdentityResolution object
 */
function makeResolution(
  identity: SpecialtyIdentity,
  confidence: IdentityResolution['confidence'],
  matchedKeyword?: string
): IdentityResolution {
  const categoryMeta = getCategoryMeta(identity.categoryId);
  return {
    resolved: true,
    identity,
    categoryMeta: categoryMeta ?? null,
    confidence,
    matchedKeyword,
    alternatives: [],
  };
}

/**
 * Normaliza un string eliminando acentos, convirtiendo a minúsculas,
 * y simplificando espacios.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // Keep alphanumeric, spaces, hyphens
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy match: busca la identidad más parecida al input
 * usando distancia de Levenshtein simplificada.
 */
function fuzzyMatch(normalized: string): SpecialtyIdentity | undefined {
  let bestMatch: SpecialtyIdentity | undefined;
  let bestScore = 0;
  const threshold = 0.6; // Minimum similarity

  for (const identity of ALL_SPECIALTY_IDENTITIES) {
    const targets = [
      normalize(identity.name),
      normalize(identity.shortName),
      identity.slug.replace(/-/g, ' '),
      ...identity.keywords.map(normalize),
    ];

    for (const target of targets) {
      const similarity = computeSimilarity(normalized, target);
      if (similarity > bestScore && similarity >= threshold) {
        bestScore = similarity;
        bestMatch = identity;
      }
    }
  }

  return bestMatch;
}

/**
 * Calcula la similitud entre dos strings (0-1) usando coeficiente de Sørensen-Dice
 * sobre bigramas. Es más eficiente que Levenshtein para matching fuzzy.
 */
function computeSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.substring(i, i + 2);
    bigramsA.set(bigram, (bigramsA.get(bigram) ?? 0) + 1);
  }

  let intersections = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2);
    const count = bigramsA.get(bigram) ?? 0;
    if (count > 0) {
      bigramsA.set(bigram, count - 1);
      intersections++;
    }
  }

  return (2 * intersections) / (a.length - 1 + (b.length - 1));
}
