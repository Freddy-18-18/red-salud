import { describe, expect, it } from 'vitest';
import {
  calculateBMI,
  calculateCockcroftGault,
  calculateEGFR,
  calculateFramingham,
} from '../calculators';

describe('calculateBMI', () => {
  it('classifies normal weight (BMI 22)', () => {
    const r = calculateBMI(70, 178);
    expect(r?.bmi).toBeCloseTo(22.09, 1);
    expect(r?.category).toBe('normal');
  });

  it('classifies underweight (<18.5)', () => {
    const r = calculateBMI(45, 170);
    expect(r?.category).toBe('bajo_peso');
  });

  it('classifies overweight (25-29.9)', () => {
    const r = calculateBMI(80, 170);
    expect(r?.category).toBe('sobrepeso');
  });

  it('classifies obesidad I (30-34.9)', () => {
    const r = calculateBMI(95, 170);
    expect(r?.category).toBe('obesidad_1');
  });

  it('classifies obesidad III (≥40)', () => {
    const r = calculateBMI(130, 170);
    expect(r?.category).toBe('obesidad_3');
  });

  it('returns null on invalid input', () => {
    expect(calculateBMI(0, 170)).toBeNull();
    expect(calculateBMI(70, 0)).toBeNull();
  });
});

describe('calculateEGFR (CKD-EPI 2021)', () => {
  it('returns G1 for healthy young adult', () => {
    // Reference: 30yo male, creat 0.9 → ~115 mL/min
    const r = calculateEGFR({ creatinineMgDl: 0.9, ageYears: 30, sex: 'male' });
    expect(r?.egfr).toBeGreaterThan(100);
    expect(r?.stage).toBe('G1');
  });

  it('returns G3a for moderate CKD elderly', () => {
    const r = calculateEGFR({ creatinineMgDl: 1.5, ageYears: 70, sex: 'female' });
    expect(r?.stage).toMatch(/G3/);
  });

  it('returns G5 for severely elevated creatinine', () => {
    const r = calculateEGFR({ creatinineMgDl: 6, ageYears: 60, sex: 'male' });
    expect(r?.stage).toBe('G5');
  });

  it('returns null on invalid input', () => {
    expect(calculateEGFR({ creatinineMgDl: 0, ageYears: 30, sex: 'male' })).toBeNull();
  });
});

describe('calculateFramingham', () => {
  it('returns intermediate risk for typical 55yo male diabetic smoker', () => {
    const r = calculateFramingham({
      ageYears: 55,
      sex: 'male',
      totalCholesterol: 213,
      hdl: 50,
      systolicBP: 120,
      treatedHTN: false,
      smoker: true,
      diabetes: true,
    });
    expect(r).not.toBeNull();
    expect(['intermediate', 'high']).toContain(r!.category);
  });

  it('returns low risk for healthy 30yo female non-smoker', () => {
    const r = calculateFramingham({
      ageYears: 30,
      sex: 'female',
      totalCholesterol: 180,
      hdl: 65,
      systolicBP: 110,
      treatedHTN: false,
      smoker: false,
      diabetes: false,
    });
    expect(r?.category).toBe('low');
  });

  it('returns null below age 30 or above 79', () => {
    expect(calculateFramingham({
      ageYears: 25, sex: 'male', totalCholesterol: 180, hdl: 50,
      systolicBP: 120, treatedHTN: false, smoker: false, diabetes: false,
    })).toBeNull();
  });
});

describe('calculateCockcroftGault', () => {
  it('calculates clearance for a typical adult male', () => {
    // 50yo male, 80kg, creat 1.0 → ((140-50)*80)/(72*1) = 100
    expect(calculateCockcroftGault({
      ageYears: 50, weightKg: 80, sex: 'male', creatinineMgDl: 1.0,
    })).toBe(100);
  });

  it('applies 0.85 multiplier for females', () => {
    // Same patient as female → 85
    expect(calculateCockcroftGault({
      ageYears: 50, weightKg: 80, sex: 'female', creatinineMgDl: 1.0,
    })).toBe(85);
  });

  it('returns null on invalid input', () => {
    expect(calculateCockcroftGault({
      ageYears: 0, weightKg: 80, sex: 'male', creatinineMgDl: 1.0,
    })).toBeNull();
  });
});
