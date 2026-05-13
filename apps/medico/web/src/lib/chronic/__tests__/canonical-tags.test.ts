import { describe, expect, it } from 'vitest';
import { CHRONIC_TAGS, softMatchTag, type ChronicTag } from '../canonical-tags';

describe('CHRONIC_TAGS', () => {
  it('exposes exactly the 9 canonical tags (R2)', () => {
    expect(CHRONIC_TAGS).toEqual([
      'HTA',
      'DM2',
      'DM1',
      'DISLIPIDEMIA',
      'OBESIDAD',
      'ERC',
      'EPOC',
      'HIPOTIROIDISMO',
      'HIPERTIROIDISMO',
    ]);
  });

  it('CHRONIC_TAGS is a readonly tuple at the type level', () => {
    const tags = CHRONIC_TAGS as readonly ChronicTag[];
    expect(tags.length).toBe(9);
  });
});

describe('softMatchTag (spec R2-B)', () => {
  describe('exact matches', () => {
    it.each(CHRONIC_TAGS)('returns %s when input is the canonical form', (tag) => {
      expect(softMatchTag(tag)).toBe(tag);
    });

    it('matches lowercase variants', () => {
      expect(softMatchTag('hta')).toBe('HTA');
      expect(softMatchTag('dm2')).toBe('DM2');
    });

    it('matches mixed-case with leading/trailing whitespace', () => {
      expect(softMatchTag('  Hta  ')).toBe('HTA');
    });
  });

  describe('legacy variants (HTA)', () => {
    it('maps "Hipertension" → HTA', () => {
      expect(softMatchTag('Hipertension')).toBe('HTA');
    });

    it('maps "Hipertensión Arterial" (with accent) → HTA', () => {
      expect(softMatchTag('Hipertensión Arterial')).toBe('HTA');
    });
  });

  describe('legacy variants (DM2/DM1)', () => {
    it('maps "Diabetes" → DM2 (default; explicit DM1 must be typed)', () => {
      expect(softMatchTag('Diabetes')).toBe('DM2');
    });

    it('maps "Diabetes Mellitus" → DM2', () => {
      expect(softMatchTag('Diabetes Mellitus')).toBe('DM2');
    });

    it('maps "DM Tipo 2" → DM2', () => {
      expect(softMatchTag('DM Tipo 2')).toBe('DM2');
    });

    it('maps "Diabetes Tipo 1" → DM1', () => {
      expect(softMatchTag('Diabetes Tipo 1')).toBe('DM1');
    });
  });

  describe('legacy variants (ERC, EPOC, etc.)', () => {
    it('maps "Enfermedad Renal Crónica" → ERC', () => {
      expect(softMatchTag('Enfermedad Renal Crónica')).toBe('ERC');
    });

    it('maps "Insuficiencia Renal" → ERC', () => {
      expect(softMatchTag('Insuficiencia Renal')).toBe('ERC');
    });

    it('maps "Enfermedad Pulmonar Obstructiva" → EPOC', () => {
      expect(softMatchTag('Enfermedad Pulmonar Obstructiva')).toBe('EPOC');
    });

    it('maps "Hipercolesterolemia" → DISLIPIDEMIA', () => {
      expect(softMatchTag('Hipercolesterolemia')).toBe('DISLIPIDEMIA');
    });

    it('maps "Sobrepeso" → OBESIDAD', () => {
      expect(softMatchTag('Sobrepeso')).toBe('OBESIDAD');
    });
  });

  describe('unknown / empty', () => {
    it('returns null for empty string', () => {
      expect(softMatchTag('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
      expect(softMatchTag('   ')).toBeNull();
    });

    it('returns null for unrecognized condition', () => {
      expect(softMatchTag('Migraña Crónica')).toBeNull();
    });
  });
});
