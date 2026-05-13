import { describe, expect, it } from 'vitest';
import { evaluateSeverity, type AlertRange } from '../alert-evaluator';

const BP_RANGE: AlertRange = { min: 90, max: 140 };

describe('evaluateSeverity (spec R5)', () => {
  describe('in-range cases', () => {
    it('returns null when value is within [min, max]', () => {
      expect(evaluateSeverity(120, BP_RANGE)).toBeNull();
      expect(evaluateSeverity(90, BP_RANGE)).toBeNull();
      expect(evaluateSeverity(140, BP_RANGE)).toBeNull();
    });
  });

  describe('above max', () => {
    it('returns mild when excess ≤10% above max', () => {
      // 145 / 140 = 3.57% above
      expect(evaluateSeverity(145, BP_RANGE)).toBe('mild');
      // 154 / 140 = 10% above (boundary)
      expect(evaluateSeverity(154, BP_RANGE)).toBe('mild');
    });

    it('returns moderate when excess is 10-25% above max', () => {
      // 160 / 140 = 14.3% above
      expect(evaluateSeverity(160, BP_RANGE)).toBe('moderate');
      // 175 / 140 = 25% above (boundary)
      expect(evaluateSeverity(175, BP_RANGE)).toBe('moderate');
    });

    it('R5-A: returns severe when excess >25% above max (BP=180, no goal)', () => {
      // 180 / 140 = 28.6% above
      expect(evaluateSeverity(180, BP_RANGE)).toBe('severe');
    });
  });

  describe('below min', () => {
    it('returns mild when deficit ≤10% below min', () => {
      // 85 / 90 = 5.6% below
      expect(evaluateSeverity(85, BP_RANGE)).toBe('mild');
    });

    it('returns moderate when deficit is 10-25% below min', () => {
      // 78 / 90 = 13.3% below
      expect(evaluateSeverity(78, BP_RANGE)).toBe('moderate');
    });

    it('returns severe when deficit >25% below min', () => {
      // 60 / 90 = 33% below
      expect(evaluateSeverity(60, BP_RANGE)).toBe('severe');
    });
  });

  describe('goal override (R5-B)', () => {
    it('R5-B: uses active goal as effective max instead of range.max', () => {
      // value=135, goal=120, range=[90,140]
      // 135 / 120 = 12.5% above goal → moderate
      // Without goal, 135 is within range → null
      expect(evaluateSeverity(135, BP_RANGE, 120)).toBe('moderate');
    });

    it('mild when value just over goal but within original range', () => {
      // value=125, goal=120 → 4.17% above → mild
      // Without goal, 125 is in range → null
      expect(evaluateSeverity(125, BP_RANGE, 120)).toBe('mild');
    });

    it('still in range when value at or below goal', () => {
      expect(evaluateSeverity(120, BP_RANGE, 120)).toBeNull();
      expect(evaluateSeverity(115, BP_RANGE, 120)).toBeNull();
    });

    it('goal does not affect the lower bound — below min still triggers deficit alerts', () => {
      // value=80, range.min=90, goal=120 → deficit 11% below min → moderate
      expect(evaluateSeverity(80, BP_RANGE, 120)).toBe('moderate');
    });

    it('explicit null goal behaves identically to omitted goal', () => {
      expect(evaluateSeverity(180, BP_RANGE, null)).toBe('severe');
    });
  });

  describe('edge cases', () => {
    it('handles a range with zero min (e.g. Microalbuminuria 0-30)', () => {
      const range: AlertRange = { min: 0, max: 30 };
      expect(evaluateSeverity(35, range)).toBe('moderate'); // 35/30 = 16.7%
      expect(evaluateSeverity(45, range)).toBe('severe');   // 45/30 = 50%
      expect(evaluateSeverity(15, range)).toBeNull();
    });
  });
});
