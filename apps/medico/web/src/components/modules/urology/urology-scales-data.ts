/**
 * @file urology-scales-data.ts
 * @description Reference data for urology assessments: IPSS, PSA ranges,
 * Gleason/ISUP grading, and uroflowmetry normals.
 * All labels in Venezuelan Spanish.
 */

// ============================================================================
// IPSS (International Prostate Symptom Score)
// ============================================================================

export interface IPSSQuestion {
  id: number;
  text: string;
  options: string[];
}

/**
 * 7 symptom questions scored 0-5 each.
 * Total: 0-35.
 */
export const IPSS_QUESTIONS: IPSSQuestion[] = [
  {
    id: 1,
    text: 'Durante el último mes, ¿cuántas veces ha tenido la sensación de no vaciar completamente la vejiga al terminar de orinar?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 2,
    text: 'Durante el último mes, ¿cuántas veces ha tenido que orinar de nuevo en menos de 2 horas después de haber orinado?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 3,
    text: 'Durante el último mes, ¿cuántas veces ha notado que al orinar paraba y comenzaba de nuevo varias veces?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 4,
    text: 'Durante el último mes, ¿cuántas veces ha tenido dificultad para aguantar las ganas de orinar?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 5,
    text: 'Durante el último mes, ¿cuántas veces ha notado que el chorro de orina es poco fuerte?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 6,
    text: 'Durante el último mes, ¿cuántas veces ha tenido que hacer fuerza para comenzar a orinar?',
    options: ['Ninguna', 'Menos de 1 de cada 5 veces', 'Menos de la mitad de las veces', 'Aproximadamente la mitad de las veces', 'Más de la mitad de las veces', 'Casi siempre'],
  },
  {
    id: 7,
    text: 'Durante el último mes, ¿cuántas veces ha tenido que levantarse por la noche para orinar (desde que se acostó hasta que se levantó por la mañana)?',
    options: ['Ninguna', '1 vez', '2 veces', '3 veces', '4 veces', '5 o más veces'],
  },
];

/**
 * Quality of Life question, scored 0-6.
 */
export const IPSS_QOL_QUESTION = {
  text: 'Si tuviera que pasar el resto de su vida con los síntomas prostáticos tal y como los tiene ahora, ¿cómo se sentiría?',
  options: [
    'Encantado',
    'Muy satisfecho',
    'Más bien satisfecho',
    'Tan satisfecho como insatisfecho',
    'Más bien insatisfecho',
    'Muy insatisfecho',
    'Fatal',
  ],
};

export type IPSSSeverity = 'mild' | 'moderate' | 'severe';

export interface IPSSSeverityRange {
  level: IPSSSeverity;
  label: string;
  min: number;
  max: number;
  color: string;
}

export const IPSS_SEVERITY_RANGES: IPSSSeverityRange[] = [
  { level: 'mild', label: 'Leve', min: 0, max: 7, color: '#22c55e' },
  { level: 'moderate', label: 'Moderado', min: 8, max: 19, color: '#eab308' },
  { level: 'severe', label: 'Severo', min: 20, max: 35, color: '#ef4444' },
];

export function classifyIPSS(totalScore: number): IPSSSeverityRange {
  for (const range of IPSS_SEVERITY_RANGES) {
    if (totalScore >= range.min && totalScore <= range.max) return range;
  }
  return IPSS_SEVERITY_RANGES[2]; // severe fallback
}

export const QOL_LABELS: string[] = [
  'Encantado',
  'Muy satisfecho',
  'Más bien satisfecho',
  'Indiferente',
  'Insatisfecho',
  'Muy insatisfecho',
  'Fatal',
];

// ============================================================================
// PSA REFERENCE RANGES
// ============================================================================

export interface PSARange {
  ageMin: number;
  ageMax: number;
  upperLimit: number;
  label: string;
}

export const PSA_REFERENCE_RANGES: PSARange[] = [
  { ageMin: 40, ageMax: 49, upperLimit: 2.5, label: '40-49 años' },
  { ageMin: 50, ageMax: 59, upperLimit: 3.5, label: '50-59 años' },
  { ageMin: 60, ageMax: 69, upperLimit: 4.5, label: '60-69 años' },
  { ageMin: 70, ageMax: 79, upperLimit: 6.5, label: '70-79 años' },
];

export function getPSAReferenceForAge(age: number): PSARange | null {
  return PSA_REFERENCE_RANGES.find((r) => age >= r.ageMin && age <= r.ageMax) ?? null;
}

export type PSAZone = 'normal' | 'elevated' | 'concerning';

export function classifyPSA(value: number, age: number): { zone: PSAZone; label: string; color: string } {
  const ref = getPSAReferenceForAge(age);
  if (!ref) {
    // Outside known ranges
    if (value <= 4.0) return { zone: 'normal', label: 'Normal', color: '#22c55e' };
    if (value <= 10.0) return { zone: 'elevated', label: 'Elevado', color: '#eab308' };
    return { zone: 'concerning', label: 'Preocupante', color: '#ef4444' };
  }

  if (value <= ref.upperLimit) return { zone: 'normal', label: 'Normal', color: '#22c55e' };
  if (value <= ref.upperLimit * 2) return { zone: 'elevated', label: 'Elevado', color: '#eab308' };
  return { zone: 'concerning', label: 'Preocupante', color: '#ef4444' };
}

/**
 * PSA velocity: change in ng/mL per year between two measurements.
 * Concerning if > 0.75 ng/mL/year.
 */
export function calculatePSAVelocity(
  psa1: number,
  date1: string,
  psa2: number,
  date2: string,
): number | null {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const yearsDiff = Math.abs(d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
  if (yearsDiff < 0.01) return null; // too close
  return (psa2 - psa1) / yearsDiff;
}

/**
 * PSA density: PSA / prostate volume (mL).
 * Concerning if > 0.15.
 */
export function calculatePSADensity(psa: number, prostateVolumeMl: number): number | null {
  if (prostateVolumeMl <= 0) return null;
  return psa / prostateVolumeMl;
}

/**
 * Free/Total PSA ratio interpretation.
 * < 10% = high cancer risk, 10-25% = moderate, > 25% = low risk.
 */
export function interpretFreeTotalRatio(ratio: number): { label: string; color: string } {
  if (ratio < 10) return { label: 'Alto riesgo', color: '#ef4444' };
  if (ratio <= 25) return { label: 'Riesgo moderado', color: '#eab308' };
  return { label: 'Bajo riesgo', color: '#22c55e' };
}

// ============================================================================
// GLEASON / ISUP GRADING
// ============================================================================

export interface GleasonGrade {
  isupGroup: number;
  gleasonPattern: string;
  label: string;
  description: string;
  color: string;
}

export const GLEASON_GRADES: GleasonGrade[] = [
  { isupGroup: 1, gleasonPattern: '3+3=6', label: 'Grupo 1', description: 'Bien diferenciado', color: '#22c55e' },
  { isupGroup: 2, gleasonPattern: '3+4=7', label: 'Grupo 2', description: 'Moderadamente diferenciado (favorable)', color: '#84cc16' },
  { isupGroup: 3, gleasonPattern: '4+3=7', label: 'Grupo 3', description: 'Moderadamente diferenciado (desfavorable)', color: '#eab308' },
  { isupGroup: 4, gleasonPattern: '4+4=8', label: 'Grupo 4', description: 'Pobremente diferenciado', color: '#f97316' },
  { isupGroup: 5, gleasonPattern: '9-10', label: 'Grupo 5', description: 'Indiferenciado', color: '#ef4444' },
];

// ============================================================================
// UROFLOWMETRY NORMAL VALUES
// ============================================================================

export type FlowPattern = 'bell' | 'plateau' | 'intermittent' | 'indeterminate';

export const FLOW_PATTERN_LABELS: Record<FlowPattern, string> = {
  bell: 'Campana (normal)',
  plateau: 'Meseta (obstructivo)',
  intermittent: 'Intermitente',
  indeterminate: 'Indeterminado',
};

export interface UroflowmetryValues {
  qmax: number | null;         // mL/s — peak flow rate
  qavg: number | null;         // mL/s — average flow rate
  voidedVolume: number | null;  // mL
  timeToQmax: number | null;    // seconds
  flowTime: number | null;      // seconds
  voidingTime: number | null;   // seconds
  pvr: number | null;           // mL — post-void residual
}

export interface QmaxClassification {
  label: string;
  color: string;
  level: 'normal' | 'equivocal' | 'obstructed';
}

export function classifyQmax(qmax: number): QmaxClassification {
  if (qmax > 15) return { label: 'Normal', color: '#22c55e', level: 'normal' };
  if (qmax >= 10) return { label: 'Equívoco', color: '#eab308', level: 'equivocal' };
  return { label: 'Obstructivo', color: '#ef4444', level: 'obstructed' };
}

/**
 * Classify PVR (post-void residual).
 * < 50 mL = normal, 50-100 = mild, 100-200 = moderate, > 200 = significant.
 */
export function classifyPVR(pvr: number): { label: string; color: string } {
  if (pvr < 50) return { label: 'Normal', color: '#22c55e' };
  if (pvr < 100) return { label: 'Leve', color: '#84cc16' };
  if (pvr < 200) return { label: 'Moderado', color: '#eab308' };
  return { label: 'Significativo', color: '#ef4444' };
}

/**
 * Generate a simulated flow curve for SVG rendering.
 * Returns [time, flow] points.
 */
export function generateFlowCurve(
  values: UroflowmetryValues,
  pattern: FlowPattern,
): Array<[number, number]> {
  const qmax = values.qmax ?? 15;
  const flowTime = values.flowTime ?? 20;
  const timeToQmax = values.timeToQmax ?? flowTime * 0.3;
  const points: Array<[number, number]> = [];
  const steps = 40;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * flowTime;
    let flow: number;

    switch (pattern) {
      case 'bell': {
        // Normal bell-shaped curve
        if (t <= timeToQmax) {
          // Rising phase
          const frac = t / timeToQmax;
          flow = qmax * Math.sin((frac * Math.PI) / 2);
        } else {
          // Descending phase
          const frac = (t - timeToQmax) / (flowTime - timeToQmax);
          flow = qmax * Math.cos((frac * Math.PI) / 2);
        }
        break;
      }
      case 'plateau': {
        // Plateau pattern (obstructive)
        const ramp = flowTime * 0.15;
        if (t < ramp) {
          flow = qmax * (t / ramp);
        } else if (t > flowTime - ramp) {
          flow = qmax * ((flowTime - t) / ramp);
        } else {
          flow = qmax * (0.85 + Math.random() * 0.15);
        }
        break;
      }
      case 'intermittent': {
        // Intermittent flow with gaps
        const base = t <= timeToQmax
          ? qmax * (t / timeToQmax)
          : qmax * (1 - (t - timeToQmax) / (flowTime - timeToQmax));
        const mod = Math.sin(t * 1.5) > 0.2 ? 1 : 0.1;
        flow = base * mod;
        break;
      }
      default: {
        // Indeterminate — irregular
        const base2 = t <= timeToQmax
          ? qmax * (t / timeToQmax)
          : qmax * (1 - (t - timeToQmax) / (flowTime - timeToQmax));
        flow = base2 * (0.5 + Math.random() * 0.5);
        break;
      }
    }

    points.push([t, Math.max(0, flow)]);
  }

  return points;
}
