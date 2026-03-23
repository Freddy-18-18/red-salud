/**
 * @file detector.test.ts
 * @description Tests for the specialty detector, including slug-based detection.
 */

import { describe, it, expect } from 'vitest';
import { detectSpecialty } from '../core/detector';

describe('Specialty Detector — Slug-based detection', () => {
  it('should return certain confidence when specialtySlug matches a registered config', () => {
    const result = detectSpecialty({ specialtySlug: 'cardiologia' });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('cardiologia');
    expect(result.confidence).toBe('certain');
    expect(result.matchedKeyword).toBe('slug:cardiologia');
  });

  it('should resolve odontologia slug', () => {
    const result = detectSpecialty({ specialtySlug: 'odontologia' });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('odontologia');
    expect(result.confidence).toBe('certain');
  });

  it('should resolve pediatria slug', () => {
    const result = detectSpecialty({ specialtySlug: 'pediatria' });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('pediatria');
    expect(result.confidence).toBe('certain');
  });

  it('should return not detected for unknown slug', () => {
    const result = detectSpecialty({ specialtySlug: 'unknown-specialty-xyz' });
    expect(result.detected).toBe(false);
    expect(result.specialtyId).toBeNull();
    expect(result.confidence).toBe('none');
  });

  it('should prioritize slug over keyword match', () => {
    const result = detectSpecialty({
      specialtySlug: 'cardiologia',
      specialtyName: 'Neurología',
    });
    expect(result.specialtyId).toBe('cardiologia');
    expect(result.confidence).toBe('certain');
    expect(result.matchedKeyword).toBe('slug:cardiologia');
  });

  it('should fall back to keyword match when slug is null', () => {
    const result = detectSpecialty({
      specialtySlug: null,
      specialtyName: 'Cardiología',
    });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('cardiologia');
    // Keyword match should be likely or certain depending on logic
    expect(['certain', 'likely']).toContain(result.confidence);
  });

  it('forceSpecialtyId should be checked after slug (slug wins)', () => {
    // Slug has higher priority than forceSpecialtyId? Actually per plan, forceSpecialtyId comes after slug.
    // But let's verify: slug is priority 0, forceSpecialtyId is priority 1.
    const result = detectSpecialty({
      specialtySlug: 'cardiologia',
      forceSpecialtyId: 'odontologia',
    });
    expect(result.specialtyId).toBe('cardiologia');
    expect(result.matchedKeyword).toBe('slug:cardiologia');
  });
});

describe('Specialty Detector — Existing detection (regression)', () => {
  it('should detect by forceSpecialtyId when no slug', () => {
    const result = detectSpecialty({ forceSpecialtyId: 'odontologia' });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('odontologia');
    expect(result.confidence).toBe('certain');
    expect(result.matchedKeyword).toBe('forced');
  });

  it('should detect by specialtyName keyword', () => {
    const result = detectSpecialty({ specialtyName: 'Cardiología' });
    expect(result.detected).toBe(true);
    expect(result.specialtyId).toBe('cardiologia');
  });

  it('should return not detected with empty context', () => {
    const result = detectSpecialty({});
    expect(result.detected).toBe(false);
    expect(result.specialtyId).toBeNull();
    expect(result.confidence).toBe('none');
  });
});
