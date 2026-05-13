/**
 * @file calculators.ts
 * @description Pure clinical calculators for general medicine.
 * All functions: pure, deterministic, testable, no side effects.
 */

// ============================================================================
// BMI / IMC
// ============================================================================

export type BMICategory =
  | 'bajo_peso'
  | 'normal'
  | 'sobrepeso'
  | 'obesidad_1'
  | 'obesidad_2'
  | 'obesidad_3';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
}

const BMI_LABELS: Record<BMICategory, string> = {
  bajo_peso: 'Bajo peso',
  normal: 'Peso normal',
  sobrepeso: 'Sobrepeso',
  obesidad_1: 'Obesidad grado I',
  obesidad_2: 'Obesidad grado II',
  obesidad_3: 'Obesidad grado III (mórbida)',
};

export function calculateBMI(weightKg: number, heightCm: number): BMIResult | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = +(weightKg / (heightM * heightM)).toFixed(2);
  let category: BMICategory;
  if (bmi < 18.5) category = 'bajo_peso';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'sobrepeso';
  else if (bmi < 35) category = 'obesidad_1';
  else if (bmi < 40) category = 'obesidad_2';
  else category = 'obesidad_3';
  return { bmi, category, categoryLabel: BMI_LABELS[category] };
}

// ============================================================================
// eGFR (CKD-EPI 2021 simplified)
// ============================================================================

export interface EGFRInput {
  creatinineMgDl: number;
  ageYears: number;
  sex: 'male' | 'female';
}

export interface EGFRResult {
  egfr: number;
  stage: string;
  stageLabel: string;
}

/**
 * CKD-EPI 2021 (race-free) eGFR estimation.
 * Returns eGFR in mL/min/1.73m² and KDIGO stage.
 */
export function calculateEGFR(input: EGFRInput): EGFRResult | null {
  const { creatinineMgDl, ageYears, sex } = input;
  if (creatinineMgDl <= 0 || ageYears <= 0) return null;

  const kappa = sex === 'female' ? 0.7 : 0.9;
  const alpha = sex === 'female' ? -0.241 : -0.302;
  const minRatio = Math.min(creatinineMgDl / kappa, 1);
  const maxRatio = Math.max(creatinineMgDl / kappa, 1);
  const sexFactor = sex === 'female' ? 1.012 : 1;

  const egfr = 142 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.2) *
    Math.pow(0.9938, ageYears) * sexFactor;

  const rounded = +egfr.toFixed(1);
  let stage: string;
  let stageLabel: string;
  if (rounded >= 90) { stage = 'G1'; stageLabel = 'Función renal normal o aumentada'; }
  else if (rounded >= 60) { stage = 'G2'; stageLabel = 'Disminución leve'; }
  else if (rounded >= 45) { stage = 'G3a'; stageLabel = 'Disminución leve-moderada'; }
  else if (rounded >= 30) { stage = 'G3b'; stageLabel = 'Disminución moderada-grave'; }
  else if (rounded >= 15) { stage = 'G4'; stageLabel = 'Disminución grave'; }
  else { stage = 'G5'; stageLabel = 'Falla renal'; }

  return { egfr: rounded, stage, stageLabel };
}

// ============================================================================
// Framingham Risk Score (simplified, 10-year CV risk)
// ============================================================================

export interface FraminghamInput {
  ageYears: number;
  sex: 'male' | 'female';
  totalCholesterol: number; // mg/dL
  hdl: number;              // mg/dL
  systolicBP: number;       // mmHg
  treatedHTN: boolean;
  smoker: boolean;
  diabetes: boolean;
}

export interface FraminghamResult {
  riskPercent: number;
  category: 'low' | 'borderline' | 'intermediate' | 'high';
  categoryLabel: string;
}

const FRAMINGHAM_CATEGORY_LABEL: Record<FraminghamResult['category'], string> = {
  low: 'Riesgo bajo (<5%)',
  borderline: 'Riesgo limítrofe (5-7.5%)',
  intermediate: 'Riesgo intermedio (7.5-20%)',
  high: 'Riesgo alto (≥20%)',
};

export function calculateFramingham(input: FraminghamInput): FraminghamResult | null {
  const { ageYears, sex, totalCholesterol, hdl, systolicBP, treatedHTN, smoker, diabetes } = input;
  if (ageYears < 30 || ageYears > 79) return null;
  if (totalCholesterol <= 0 || hdl <= 0 || systolicBP <= 0) return null;

  // Simplified ACC/AHA pooled cohort equations approximation.
  const lnAge = Math.log(ageYears);
  const lnChol = Math.log(totalCholesterol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(systolicBP);

  let sum: number;
  let baseline: number;
  let meanCoeff: number;

  if (sex === 'male') {
    sum =
      12.344 * lnAge +
      11.853 * lnChol -
      2.664 * lnAge * lnChol -
      7.99 * lnHDL +
      1.769 * lnAge * lnHDL +
      (treatedHTN ? 1.797 : 1.764) * lnSBP +
      (smoker ? 7.837 - 1.795 * lnAge : 0) +
      (diabetes ? 0.658 : 0);
    baseline = 0.9144;
    meanCoeff = 61.18;
  } else {
    sum =
      -29.799 * lnAge +
      4.884 * Math.pow(lnAge, 2) +
      13.54 * lnChol -
      3.114 * lnAge * lnChol -
      13.578 * lnHDL +
      3.149 * lnAge * lnHDL +
      (treatedHTN ? 2.019 : 1.957) * lnSBP +
      (smoker ? 7.574 - 1.665 * lnAge : 0) +
      (diabetes ? 0.661 : 0);
    baseline = 0.9665;
    meanCoeff = -29.18;
  }

  const risk = 1 - Math.pow(baseline, Math.exp(sum - meanCoeff));
  const riskPercent = +(risk * 100).toFixed(1);

  let category: FraminghamResult['category'];
  if (riskPercent < 5) category = 'low';
  else if (riskPercent < 7.5) category = 'borderline';
  else if (riskPercent < 20) category = 'intermediate';
  else category = 'high';

  return {
    riskPercent: Math.max(0, Math.min(99, riskPercent)),
    category,
    categoryLabel: FRAMINGHAM_CATEGORY_LABEL[category],
  };
}

// ============================================================================
// Cockcroft-Gault Creatinine Clearance (drug dosing)
// ============================================================================

export interface CockcroftInput {
  ageYears: number;
  weightKg: number;
  sex: 'male' | 'female';
  creatinineMgDl: number;
}

export function calculateCockcroftGault(input: CockcroftInput): number | null {
  const { ageYears, weightKg, sex, creatinineMgDl } = input;
  if (ageYears <= 0 || weightKg <= 0 || creatinineMgDl <= 0) return null;
  const base = ((140 - ageYears) * weightKg) / (72 * creatinineMgDl);
  return +(sex === 'female' ? base * 0.85 : base).toFixed(1);
}
