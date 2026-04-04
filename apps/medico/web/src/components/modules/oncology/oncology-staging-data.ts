/**
 * @file oncology-staging-data.ts
 * @description Generic TNM staging, ECOG/Karnofsky performance status, RECIST criteria,
 * and common cancer types. All labels in Venezuelan Spanish.
 */

// ============================================================================
// TYPES
// ============================================================================

export type TCategory = 'Tx' | 'T0' | 'Tis' | 'T1' | 'T2' | 'T3' | 'T4';
export type NCategory = 'Nx' | 'N0' | 'N1' | 'N2' | 'N3';
export type MCategory = 'Mx' | 'M0' | 'M1';
export type OverallStage = '0' | 'I' | 'IA' | 'IB' | 'II' | 'IIA' | 'IIB' | 'III' | 'IIIA' | 'IIIB' | 'IIIC' | 'IV' | 'IVA' | 'IVB';
export type HistologicGrade = 'GX' | 'G1' | 'G2' | 'G3' | 'G4';
export type ECOGScore = 0 | 1 | 2 | 3 | 4 | 5;
export type KarnofskyScore = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
export type RECISTResponse = 'CR' | 'PR' | 'SD' | 'PD';

export type CycleStatus = 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
export type SideEffectGrade = 1 | 2 | 3 | 4;

// ============================================================================
// TNM CLASSIFICATION
// ============================================================================

export const T_CATEGORIES: Array<{ value: TCategory; label: string; description: string }> = [
  { value: 'Tx', label: 'Tx', description: 'Tumor primario no evaluable' },
  { value: 'T0', label: 'T0', description: 'Sin evidencia de tumor primario' },
  { value: 'Tis', label: 'Tis', description: 'Carcinoma in situ' },
  { value: 'T1', label: 'T1', description: 'Tumor ≤2 cm' },
  { value: 'T2', label: 'T2', description: 'Tumor 2-5 cm' },
  { value: 'T3', label: 'T3', description: 'Tumor >5 cm' },
  { value: 'T4', label: 'T4', description: 'Tumor con invasión directa' },
];

export const N_CATEGORIES: Array<{ value: NCategory; label: string; description: string }> = [
  { value: 'Nx', label: 'Nx', description: 'Ganglios no evaluables' },
  { value: 'N0', label: 'N0', description: 'Sin metástasis ganglionares' },
  { value: 'N1', label: 'N1', description: 'Metástasis en 1-3 ganglios' },
  { value: 'N2', label: 'N2', description: 'Metástasis en 4-9 ganglios' },
  { value: 'N3', label: 'N3', description: 'Metástasis en ≥10 ganglios' },
];

export const M_CATEGORIES: Array<{ value: MCategory; label: string; description: string }> = [
  { value: 'Mx', label: 'Mx', description: 'Metástasis a distancia no evaluable' },
  { value: 'M0', label: 'M0', description: 'Sin metástasis a distancia' },
  { value: 'M1', label: 'M1', description: 'Metástasis a distancia presente' },
];

export const HISTOLOGIC_GRADES: Array<{ value: HistologicGrade; label: string; description: string }> = [
  { value: 'GX', label: 'GX', description: 'Grado no evaluable' },
  { value: 'G1', label: 'G1', description: 'Bien diferenciado' },
  { value: 'G2', label: 'G2', description: 'Moderadamente diferenciado' },
  { value: 'G3', label: 'G3', description: 'Pobremente diferenciado' },
  { value: 'G4', label: 'G4', description: 'Indiferenciado' },
];

// ============================================================================
// STAGE GROUPING (Generic — simplified AJCC 8th)
// ============================================================================

interface StageRule {
  stage: OverallStage;
  t: TCategory[];
  n: NCategory[];
  m: MCategory[];
}

const STAGE_RULES: StageRule[] = [
  { stage: '0', t: ['Tis'], n: ['N0'], m: ['M0'] },
  { stage: 'I', t: ['T1'], n: ['N0'], m: ['M0'] },
  { stage: 'IIA', t: ['T2'], n: ['N0'], m: ['M0'] },
  { stage: 'IIB', t: ['T3'], n: ['N0'], m: ['M0'] },
  { stage: 'IIIA', t: ['T1', 'T2'], n: ['N1', 'N2'], m: ['M0'] },
  { stage: 'IIIB', t: ['T3', 'T4'], n: ['N1', 'N2'], m: ['M0'] },
  { stage: 'IIIC', t: ['T1', 'T2', 'T3', 'T4'], n: ['N3'], m: ['M0'] },
  { stage: 'IV', t: ['Tx', 'T0', 'Tis', 'T1', 'T2', 'T3', 'T4'], n: ['Nx', 'N0', 'N1', 'N2', 'N3'], m: ['M1'] },
];

/**
 * Determine overall stage from TNM.
 */
export function calculateOverallStage(t: TCategory, n: NCategory, m: MCategory): OverallStage {
  for (const rule of STAGE_RULES) {
    if (rule.t.includes(t) && rule.n.includes(n) && rule.m.includes(m)) {
      return rule.stage;
    }
  }
  // Fallback
  if (m === 'M1') return 'IV';
  if (n === 'N3') return 'IIIC';
  if (t === 'T4') return 'IIIB';
  return 'II';
}

export const STAGE_COLORS: Record<string, string> = {
  '0': '#22c55e',
  'I': '#4ade80',
  'IA': '#4ade80',
  'IB': '#86efac',
  'II': '#eab308',
  'IIA': '#eab308',
  'IIB': '#f59e0b',
  'III': '#f97316',
  'IIIA': '#f97316',
  'IIIB': '#ef4444',
  'IIIC': '#dc2626',
  'IV': '#991b1b',
  'IVA': '#991b1b',
  'IVB': '#7f1d1d',
};

// ============================================================================
// PERFORMANCE STATUS
// ============================================================================

export const ECOG_SCALE: Array<{ score: ECOGScore; label: string; description: string }> = [
  { score: 0, label: 'ECOG 0', description: 'Completamente activo, sin restricciones' },
  { score: 1, label: 'ECOG 1', description: 'Restringido en actividad física extenuante' },
  { score: 2, label: 'ECOG 2', description: 'Ambulatorio, capaz de autocuidado, >50% del tiempo despierto' },
  { score: 3, label: 'ECOG 3', description: 'Capacidad limitada de autocuidado, >50% en cama/silla' },
  { score: 4, label: 'ECOG 4', description: 'Completamente incapacitado, confinado a cama/silla' },
  { score: 5, label: 'ECOG 5', description: 'Fallecido' },
];

export const KARNOFSKY_SCALE: Array<{ score: KarnofskyScore; description: string }> = [
  { score: 100, description: 'Normal, sin quejas ni evidencia de enfermedad' },
  { score: 90, description: 'Actividad normal, signos/síntomas menores' },
  { score: 80, description: 'Actividad normal con esfuerzo, algunos signos/síntomas' },
  { score: 70, description: 'Autocuidado, incapaz de actividad normal o trabajo' },
  { score: 60, description: 'Requiere asistencia ocasional' },
  { score: 50, description: 'Requiere asistencia considerable y atención médica frecuente' },
  { score: 40, description: 'Incapacitado, requiere cuidado y asistencia especiales' },
  { score: 30, description: 'Severamente incapacitado, hospitalización indicada' },
  { score: 20, description: 'Muy enfermo, hospitalización necesaria, tratamiento de soporte' },
  { score: 10, description: 'Moribundo, procesos fatales en rápida progresión' },
  { score: 0, description: 'Fallecido' },
];

/**
 * Convert ECOG to approximate Karnofsky.
 */
export function ecogToKarnofsky(ecog: ECOGScore): KarnofskyScore {
  const map: Record<ECOGScore, KarnofskyScore> = {
    0: 100, 1: 80, 2: 60, 3: 40, 4: 20, 5: 0,
  };
  return map[ecog];
}

// ============================================================================
// RECIST 1.1
// ============================================================================

export const RECIST_CRITERIA: Array<{ response: RECISTResponse; label: string; description: string; color: string }> = [
  { response: 'CR', label: 'Respuesta completa', description: 'Desaparición de todas las lesiones diana', color: '#22c55e' },
  { response: 'PR', label: 'Respuesta parcial', description: 'Reducción ≥30% en suma de diámetros', color: '#3b82f6' },
  { response: 'SD', label: 'Enfermedad estable', description: 'Ni suficiente reducción ni aumento', color: '#eab308' },
  { response: 'PD', label: 'Progresión', description: 'Aumento ≥20% en suma de diámetros o nuevas lesiones', color: '#ef4444' },
];

// ============================================================================
// COMMON CANCER TYPES
// ============================================================================

export const CANCER_TYPES: Array<{ value: string; label: string }> = [
  { value: 'breast', label: 'Mama' },
  { value: 'lung', label: 'Pulmón' },
  { value: 'colorectal', label: 'Colorrectal' },
  { value: 'prostate', label: 'Próstata' },
  { value: 'gastric', label: 'Gástrico' },
  { value: 'cervical', label: 'Cuello uterino' },
  { value: 'endometrial', label: 'Endometrio' },
  { value: 'ovarian', label: 'Ovario' },
  { value: 'pancreatic', label: 'Páncreas' },
  { value: 'hepatocellular', label: 'Hepatocelular' },
  { value: 'bladder', label: 'Vejiga' },
  { value: 'renal', label: 'Renal' },
  { value: 'thyroid', label: 'Tiroides' },
  { value: 'melanoma', label: 'Melanoma' },
  { value: 'lymphoma_hodgkin', label: 'Linfoma Hodgkin' },
  { value: 'lymphoma_nhl', label: 'Linfoma No Hodgkin' },
  { value: 'leukemia_all', label: 'Leucemia linfoblástica aguda' },
  { value: 'leukemia_aml', label: 'Leucemia mieloide aguda' },
  { value: 'head_neck', label: 'Cabeza y cuello' },
  { value: 'esophageal', label: 'Esófago' },
  { value: 'brain', label: 'Cerebro/SNC' },
  { value: 'sarcoma', label: 'Sarcoma' },
  { value: 'other', label: 'Otro' },
];

// ============================================================================
// SIDE EFFECT GRADING (CTCAE simplified)
// ============================================================================

export const SIDE_EFFECT_GRADES: Array<{ grade: SideEffectGrade; label: string; color: string }> = [
  { grade: 1, label: 'Grado 1 — Leve', color: '#84cc16' },
  { grade: 2, label: 'Grado 2 — Moderado', color: '#eab308' },
  { grade: 3, label: 'Grado 3 — Severo', color: '#ef4444' },
  { grade: 4, label: 'Grado 4 — Amenaza vital', color: '#991b1b' },
];

export const COMMON_SIDE_EFFECTS = [
  'Náuseas/Vómitos',
  'Neutropenia',
  'Anemia',
  'Trombocitopenia',
  'Fatiga',
  'Alopecia',
  'Mucositis',
  'Diarrea',
  'Neuropatía periférica',
  'Hepatotoxicidad',
  'Nefrotoxicidad',
  'Cardiotoxicidad',
  'Dermatitis',
  'Anorexia',
  'Dolor',
] as const;
