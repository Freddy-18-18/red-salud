/**
 * @file spirometry-reference-data.ts
 * @description Simplified GLI-2012 reference equations and spirometry classification.
 * All labels in Venezuelan Spanish.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SpirometryValues {
  fvc: number | null;      // L
  fev1: number | null;     // L
  fev1Fvc: number | null;  // ratio (0-1)
  pef: number | null;      // L/s
  fef2575: number | null;  // L/s
}

export interface SpirometrySet {
  pre: SpirometryValues;
  post: SpirometryValues;
}

export interface PredictedValues {
  fvc: number;
  fev1: number;
  fev1Fvc: number;
  pef: number;
  fef2575: number;
}

export interface PatientDemographics {
  age: number;        // years
  sex: 'male' | 'female';
  heightCm: number;
}

export type SeverityLevel =
  | 'normal'
  | 'mild'
  | 'moderate'
  | 'moderately_severe'
  | 'severe'
  | 'very_severe';

export type Pattern = 'normal' | 'obstructive' | 'restrictive' | 'mixed';

export interface SpirometryInterpretation {
  pattern: Pattern;
  severity: SeverityLevel;
  bronchodilatorResponse: boolean;
  summary: string;
}

// ============================================================================
// SEVERITY CLASSIFICATION (ATS/ERS based on FEV1 % predicted)
// ============================================================================

export const SEVERITY_CLASSIFICATION: Array<{
  level: SeverityLevel;
  label: string;
  minPercent: number;
  maxPercent: number;
  color: string;
}> = [
  { level: 'normal', label: 'Normal', minPercent: 80, maxPercent: 200, color: '#22c55e' },
  { level: 'mild', label: 'Leve', minPercent: 70, maxPercent: 79, color: '#84cc16' },
  { level: 'moderate', label: 'Moderada', minPercent: 60, maxPercent: 69, color: '#eab308' },
  { level: 'moderately_severe', label: 'Moderada-Severa', minPercent: 50, maxPercent: 59, color: '#f97316' },
  { level: 'severe', label: 'Severa', minPercent: 35, maxPercent: 49, color: '#ef4444' },
  { level: 'very_severe', label: 'Muy severa', minPercent: 0, maxPercent: 34, color: '#991b1b' },
];

export const PATTERN_LABELS: Record<Pattern, string> = {
  normal: 'Normal',
  obstructive: 'Obstructivo',
  restrictive: 'Restrictivo',
  mixed: 'Mixto',
};

// ============================================================================
// GLI-2012 SIMPLIFIED PREDICTED VALUES
// ============================================================================

/**
 * Calculate predicted spirometry values using simplified GLI-2012 equations.
 * These are approximations for clinical use.
 */
export function calculatePredicted(demographics: PatientDemographics): PredictedValues {
  const { age, sex, heightCm } = demographics;
  const heightM = heightCm / 100;

  if (sex === 'male') {
    return {
      fvc: Math.max(0.5, -0.000143 * age * age + 0.00018 * age + 5.76 * heightM - 3.72),
      fev1: Math.max(0.5, -0.000172 * age * age - 0.00070 * age + 4.30 * heightM - 2.49),
      fev1Fvc: Math.max(0.5, 0.87 - 0.002 * age),
      pef: Math.max(1, -0.0007 * age * age + 0.05 * age + 5.46 * heightM - 1.0),
      fef2575: Math.max(0.5, -0.0006 * age * age + 0.007 * age + 3.01 * heightM - 1.13),
    };
  }

  return {
    fvc: Math.max(0.5, -0.000119 * age * age + 0.00020 * age + 4.43 * heightM - 2.89),
    fev1: Math.max(0.5, -0.000136 * age * age - 0.00040 * age + 3.38 * heightM - 1.79),
    fev1Fvc: Math.max(0.5, 0.89 - 0.002 * age),
    pef: Math.max(1, -0.0005 * age * age + 0.03 * age + 4.12 * heightM - 0.8),
    fef2575: Math.max(0.5, -0.0005 * age * age + 0.005 * age + 2.36 * heightM - 0.74),
  };
}

/**
 * Calculate % predicted for a value.
 */
export function percentPredicted(actual: number | null, predicted: number): number | null {
  if (actual == null || predicted <= 0) return null;
  return Math.round((actual / predicted) * 100);
}

// ============================================================================
// INTERPRETATION
// ============================================================================

/**
 * Determine severity from FEV1 % predicted.
 */
export function classifySeverity(fev1Percent: number): SeverityLevel {
  for (const s of SEVERITY_CLASSIFICATION) {
    if (fev1Percent >= s.minPercent && fev1Percent <= s.maxPercent) return s.level;
  }
  return fev1Percent >= 80 ? 'normal' : 'very_severe';
}

/**
 * Determine ventilatory pattern.
 */
export function classifyPattern(
  fev1FvcActual: number | null,
  fvcPercent: number | null,
  fev1FvcLLN: number,
): Pattern {
  if (fev1FvcActual == null || fvcPercent == null) return 'normal';

  const isObstructed = fev1FvcActual < fev1FvcLLN;
  const isRestricted = fvcPercent < 80;

  if (isObstructed && isRestricted) return 'mixed';
  if (isObstructed) return 'obstructive';
  if (isRestricted) return 'restrictive';
  return 'normal';
}

/**
 * Check bronchodilator response (ATS/ERS criteria).
 * Positive if FEV1 or FVC improves ≥12% AND ≥200mL.
 */
export function hasBronchodilatorResponse(pre: SpirometryValues, post: SpirometryValues): boolean {
  if (pre.fev1 != null && post.fev1 != null) {
    const changeFev1 = post.fev1 - pre.fev1;
    const percentChangeFev1 = (changeFev1 / pre.fev1) * 100;
    if (percentChangeFev1 >= 12 && changeFev1 >= 0.2) return true;
  }

  if (pre.fvc != null && post.fvc != null) {
    const changeFvc = post.fvc - pre.fvc;
    const percentChangeFvc = (changeFvc / pre.fvc) * 100;
    if (percentChangeFvc >= 12 && changeFvc >= 0.2) return true;
  }

  return false;
}

/**
 * Full interpretation of spirometry results.
 */
export function interpretSpirometry(
  values: SpirometrySet,
  predicted: PredictedValues,
): SpirometryInterpretation {
  const pre = values.pre;
  const fev1Percent = percentPredicted(pre.fev1, predicted.fev1);
  const fvcPercent = percentPredicted(pre.fvc, predicted.fvc);
  const fev1FvcLLN = predicted.fev1Fvc - 0.08; // Simplified LLN

  const pattern = classifyPattern(pre.fev1Fvc, fvcPercent, fev1FvcLLN);
  const severity = fev1Percent != null ? classifySeverity(fev1Percent) : 'normal';
  const bdResponse = hasBronchodilatorResponse(values.pre, values.post);

  let summary = '';
  const patternLabel = PATTERN_LABELS[pattern];
  const severityEntry = SEVERITY_CLASSIFICATION.find((s) => s.level === severity);

  if (pattern === 'normal') {
    summary = 'Espirometría dentro de límites normales.';
  } else {
    summary = `Patrón ${patternLabel.toLowerCase()}`;
    if (severityEntry && severity !== 'normal') {
      summary += ` de grado ${severityEntry.label.toLowerCase()}`;
    }
    summary += '.';
  }

  if (bdResponse) {
    summary += ' Respuesta significativa al broncodilatador.';
  }

  return { pattern, severity, bronchodilatorResponse: bdResponse, summary };
}

// ============================================================================
// FLOW-VOLUME CURVE REFERENCE
// ============================================================================

/**
 * Generate a simplified normal flow-volume curve envelope.
 * Returns points [volume, flow] for SVG rendering.
 */
export function generateNormalFlowVolumeCurve(
  predicted: PredictedValues,
): Array<[number, number]> {
  const fvc = predicted.fvc;
  const pef = predicted.pef;
  const points: Array<[number, number]> = [];

  // Inspiration (simplified)
  points.push([fvc, 0]);

  // Expiratory limb
  const peakVol = fvc * 0.15; // PEF at ~15% of FVC
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const vol = t * fvc;
    let flow: number;

    if (vol <= peakVol) {
      // Rising to PEF
      flow = pef * (vol / peakVol);
    } else {
      // Descending from PEF
      const remaining = (vol - peakVol) / (fvc - peakVol);
      flow = pef * (1 - remaining * 0.9);
    }

    points.push([vol, Math.max(0, flow)]);
  }

  return points;
}
