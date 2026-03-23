/**
 * @file identity-system.test.ts
 * @description Tests para el sistema de identidades de especialidades.
 *
 * Verifica:
 * 1. Las 132 identidades están completas
 * 2. Relaciones parent-child son bidireccionales
 * 3. Slugs son únicos y válidos
 * 4. Keywords no están vacíos
 * 5. La función IDENTITY_BY_SLUG funciona correctamente
 *
 * @module Tests/Specialties
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_SPECIALTY_IDENTITIES,
  IDENTITY_BY_SLUG,
} from '../identity/specialty-identities';

// ============================================================================
// TESTS — Identity completeness
// ============================================================================

describe('Identity System — Completeness', () => {
  it('should have 132 identities', () => {
    expect(ALL_SPECIALTY_IDENTITIES.length).toBe(132);
  });

  it('every identity should have required fields', () => {
    for (const identity of ALL_SPECIALTY_IDENTITIES) {
      expect(identity.slug).toBeTruthy();
      expect(identity.masterId).toBeTruthy();
      expect(identity.name).toBeTruthy();
      expect(identity.shortName).toBeTruthy();
      expect(identity.description).toBeTruthy();
      expect(identity.categoryId).toBeTruthy();
      expect(identity.icon).toBeTruthy();
      expect(identity.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(identity.bgColor).toBeTruthy();
      expect(identity.gradient).toBeTruthy();
      expect(Array.isArray(identity.keywords)).toBe(true);
      expect(identity.keywords.length).toBeGreaterThan(0);
      expect(Array.isArray(identity.defaultModuleIds)).toBe(true);
      expect(Array.isArray(identity.prioritizedKpis)).toBe(true);
      expect(identity.prioritizedKpis.length).toBeGreaterThan(0);
      expect(Array.isArray(identity.defaultAppointmentTypes)).toBe(true);
      expect(typeof identity.defaultAppointmentDuration).toBe('number');
      expect(identity.defaultAppointmentDuration).toBeGreaterThan(0);
      expect(typeof identity.supportsTelemedicine).toBe('boolean');
      expect(typeof identity.requiresVerification).toBe('boolean');
      expect(typeof identity.isSubSpecialty).toBe('boolean');
    }
  });
});

// ============================================================================
// TESTS — Slug uniqueness
// ============================================================================

describe('Identity System — Slug uniqueness', () => {
  it('all slugs should be unique', () => {
    const slugs = ALL_SPECIALTY_IDENTITIES.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all masterIds should be unique', () => {
    const ids = ALL_SPECIALTY_IDENTITIES.map((i) => i.masterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('slugs should be URL-friendly (lowercase, hyphenated)', () => {
    for (const identity of ALL_SPECIALTY_IDENTITIES) {
      expect(identity.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

// ============================================================================
// TESTS — IDENTITY_BY_SLUG lookup
// ============================================================================

describe('Identity System — IDENTITY_BY_SLUG', () => {
  it('should be a Map with 132 entries', () => {
    expect(IDENTITY_BY_SLUG.size).toBe(132);
  });

  it('should resolve known slugs', () => {
    expect(IDENTITY_BY_SLUG.get('cardiologia')).toBeDefined();
    expect(IDENTITY_BY_SLUG.get('odontologia')).toBeDefined();
    expect(IDENTITY_BY_SLUG.get('pediatria')).toBeDefined();
    expect(IDENTITY_BY_SLUG.get('medicina-general')).toBeDefined();
  });

  it('should return undefined for unknown slugs', () => {
    expect(IDENTITY_BY_SLUG.get('nonexistent')).toBeUndefined();
  });

  it('every entry should match its key', () => {
    for (const [slug, identity] of IDENTITY_BY_SLUG) {
      expect(identity.slug).toBe(slug);
    }
  });
});

// ============================================================================
// TESTS — Parent/child relationships
// ============================================================================

describe('Identity System — Parent/child relationships', () => {
  it('every sub-specialty should have a valid parentSlug', () => {
    const subSpecialties = ALL_SPECIALTY_IDENTITIES.filter((i) => i.isSubSpecialty);

    for (const child of subSpecialties) {
      expect(child.parentSlug).toBeTruthy();
      // Parent should exist in the identity list
      const parent = IDENTITY_BY_SLUG.get(child.parentSlug!);
      expect(parent).toBeDefined();
    }
  });

  it('parents with childSlugs should have valid references', () => {
    const parents = ALL_SPECIALTY_IDENTITIES.filter(
      (i) => i.childSlugs && i.childSlugs.length > 0
    );

    for (const parent of parents) {
      for (const childSlug of parent.childSlugs!) {
        const child = IDENTITY_BY_SLUG.get(childSlug);
        expect(child).toBeDefined();
        expect(child?.isSubSpecialty).toBe(true);
        expect(child?.parentSlug).toBe(parent.slug);
      }
    }
  });

  it('non-sub-specialties should not have parentSlug', () => {
    const nonSub = ALL_SPECIALTY_IDENTITIES.filter((i) => !i.isSubSpecialty);

    for (const identity of nonSub) {
      expect(identity.parentSlug).toBeUndefined();
    }
  });

  it('parent specialties should not be marked as sub-specialties', () => {
    const parents = ALL_SPECIALTY_IDENTITIES.filter(
      (i) => i.childSlugs && i.childSlugs.length > 0
    );

    for (const parent of parents) {
      // Parents should not be sub-specialties themselves (no grandparent chain)
      expect(parent.isSubSpecialty).toBe(false);
    }
  });
});

// ============================================================================
// TESTS — Category distribution
// ============================================================================

describe('Identity System — Category distribution', () => {
  it('should have at least 20 unique categories', () => {
    const categories = new Set(
      ALL_SPECIALTY_IDENTITIES.map((i) => i.categoryId)
    );
    expect(categories.size).toBeGreaterThanOrEqual(20);
  });

  it('every category should have at least one identity', () => {
    const expectedCategories = [
      'general', 'cardiovascular', 'neurologia', 'digestivo',
      'respiratorio', 'renal', 'endocrino', 'reumatologia',
      'hematologia', 'infectologia', 'dermatologia', 'mental',
      'cirugia', 'traumatologia', 'oftalmologia', 'orl',
      'ginecologia', 'pediatria', 'plastica', 'vascular',
      'intensiva', 'diagnostico', 'anestesia', 'patologia',
      'rehabilitacion', 'odontologia',
    ];

    for (const category of expectedCategories) {
      const count = ALL_SPECIALTY_IDENTITIES.filter(
        (i) => i.categoryId === category
      ).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});
