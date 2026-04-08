// ============================================================================
// RHEUMATOLOGY SCALES DATA — Validated clinical instruments
// DAS28, HAQ-DI, CDAI, ACR response criteria, 28-joint map
// All labels in Spanish for Venezuelan medical practice
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface JointPosition {
  id: string;
  label: string;
  /** SVG x coordinate (front view, viewBox 400x600) */
  x: number;
  /** SVG y coordinate */
  y: number;
  /** Side: left or right */
  side: 'left' | 'right';
  /** Joint group for quick-select */
  group: 'shoulder' | 'elbow' | 'wrist' | 'mcp' | 'pip' | 'knee';
}

export type JointStatus = 'none' | 'tender' | 'swollen' | 'both';

export interface JointAssessment {
  jointId: string;
  status: JointStatus;
}

export interface DAS28Result {
  tjc28: number;
  sjc28: number;
  esr?: number;
  crp?: number;
  vasPatient: number;
  score: number;
  marker: 'ESR' | 'CRP';
  activityLevel: DAS28ActivityLevel;
}

export type DAS28ActivityLevel = 'remission' | 'low' | 'moderate' | 'high';

export interface DAS28ActivityBand {
  level: DAS28ActivityLevel;
  label: string;
  min: number;
  max: number;
  color: string;
  badgeClass: string;
}

export interface HAQCategory {
  id: string;
  label: string;
  questions: HAQQuestion[];
}

export interface HAQQuestion {
  id: string;
  text: string;
}

export interface HAQResult {
  categoryScores: Record<string, number>;
  totalDI: number;
  interpretation: string;
}

export interface CDAIResult {
  tjc28: number;
  sjc28: number;
  vasPatient: number;
  vasEvaluator: number;
  score: number;
  activityLevel: DAS28ActivityLevel;
}

export interface ACRResponse {
  baseline: { tjc: number; sjc: number };
  current: { tjc: number; sjc: number };
  acr20: boolean;
  acr50: boolean;
  acr70: boolean;
}

export interface RheumatologyAssessment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  assessment_type: 'das28' | 'haq' | 'cdai' | 'joint-map';
  joints: Record<string, JointStatus>;
  das28_result?: DAS28Result | null;
  haq_result?: HAQResult | null;
  cdai_result?: CDAIResult | null;
  notes: string | null;
  assessment_date: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DAS28 ACTIVITY BANDS
// ============================================================================

export const DAS28_BANDS: DAS28ActivityBand[] = [
  {
    level: 'remission',
    label: 'Remision',
    min: 0,
    max: 2.6,
    color: '#22C55E',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    level: 'low',
    label: 'Actividad Baja',
    min: 2.6,
    max: 3.2,
    color: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    level: 'moderate',
    label: 'Actividad Moderada',
    min: 3.2,
    max: 5.1,
    color: '#F97316',
    badgeClass: 'bg-orange-100 text-orange-700',
  },
  {
    level: 'high',
    label: 'Actividad Alta',
    min: 5.1,
    max: 10,
    color: '#EF4444',
    badgeClass: 'bg-red-100 text-red-700',
  },
];

export const CDAI_BANDS: DAS28ActivityBand[] = [
  {
    level: 'remission',
    label: 'Remision',
    min: 0,
    max: 2.8,
    color: '#22C55E',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    level: 'low',
    label: 'Actividad Baja',
    min: 2.8,
    max: 10,
    color: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    level: 'moderate',
    label: 'Actividad Moderada',
    min: 10,
    max: 22,
    color: '#F97316',
    badgeClass: 'bg-orange-100 text-orange-700',
  },
  {
    level: 'high',
    label: 'Actividad Alta',
    min: 22,
    max: 76,
    color: '#EF4444',
    badgeClass: 'bg-red-100 text-red-700',
  },
];

// ============================================================================
// 28-JOINT MAP POSITIONS (Front view, viewBox 400x600)
// ============================================================================

export const DAS28_JOINTS: JointPosition[] = [
  // ── Shoulders ────────────────────────────────────────────────
  { id: 'l_shoulder', label: 'Hombro Izq.', x: 115, y: 128, side: 'left', group: 'shoulder' },
  { id: 'r_shoulder', label: 'Hombro Der.', x: 285, y: 128, side: 'right', group: 'shoulder' },

  // ── Elbows ───────────────────────────────────────────────────
  { id: 'l_elbow', label: 'Codo Izq.', x: 82, y: 210, side: 'left', group: 'elbow' },
  { id: 'r_elbow', label: 'Codo Der.', x: 318, y: 210, side: 'right', group: 'elbow' },

  // ── Wrists ───────────────────────────────────────────────────
  { id: 'l_wrist', label: 'Muneca Izq.', x: 68, y: 280, side: 'left', group: 'wrist' },
  { id: 'r_wrist', label: 'Muneca Der.', x: 332, y: 280, side: 'right', group: 'wrist' },

  // ── MCPs (Metacarpofalangicas) 1-5 Left ─────────────────────
  { id: 'l_mcp1', label: 'MCF1 Izq.', x: 42, y: 310, side: 'left', group: 'mcp' },
  { id: 'l_mcp2', label: 'MCF2 Izq.', x: 50, y: 322, side: 'left', group: 'mcp' },
  { id: 'l_mcp3', label: 'MCF3 Izq.', x: 56, y: 330, side: 'left', group: 'mcp' },
  { id: 'l_mcp4', label: 'MCF4 Izq.', x: 62, y: 325, side: 'left', group: 'mcp' },
  { id: 'l_mcp5', label: 'MCF5 Izq.', x: 66, y: 318, side: 'left', group: 'mcp' },

  // ── MCPs 1-5 Right ───────────────────────────────────────────
  { id: 'r_mcp1', label: 'MCF1 Der.', x: 358, y: 310, side: 'right', group: 'mcp' },
  { id: 'r_mcp2', label: 'MCF2 Der.', x: 350, y: 322, side: 'right', group: 'mcp' },
  { id: 'r_mcp3', label: 'MCF3 Der.', x: 344, y: 330, side: 'right', group: 'mcp' },
  { id: 'r_mcp4', label: 'MCF4 Der.', x: 338, y: 325, side: 'right', group: 'mcp' },
  { id: 'r_mcp5', label: 'MCF5 Der.', x: 334, y: 318, side: 'right', group: 'mcp' },

  // ── PIPs (Interfalangicas Proximales) 1-5 Left ──────────────
  { id: 'l_pip1', label: 'IFP1 Izq.', x: 32, y: 330, side: 'left', group: 'pip' },
  { id: 'l_pip2', label: 'IFP2 Izq.', x: 40, y: 345, side: 'left', group: 'pip' },
  { id: 'l_pip3', label: 'IFP3 Izq.', x: 48, y: 354, side: 'left', group: 'pip' },
  { id: 'l_pip4', label: 'IFP4 Izq.', x: 54, y: 348, side: 'left', group: 'pip' },
  { id: 'l_pip5', label: 'IFP5 Izq.', x: 58, y: 340, side: 'left', group: 'pip' },

  // ── PIPs 1-5 Right ───────────────────────────────────────────
  { id: 'r_pip1', label: 'IFP1 Der.', x: 368, y: 330, side: 'right', group: 'pip' },
  { id: 'r_pip2', label: 'IFP2 Der.', x: 360, y: 345, side: 'right', group: 'pip' },
  { id: 'r_pip3', label: 'IFP3 Der.', x: 352, y: 354, side: 'right', group: 'pip' },
  { id: 'r_pip4', label: 'IFP4 Der.', x: 346, y: 348, side: 'right', group: 'pip' },
  { id: 'r_pip5', label: 'IFP5 Der.', x: 342, y: 340, side: 'right', group: 'pip' },

  // ── Knees ────────────────────────────────────────────────────
  { id: 'l_knee', label: 'Rodilla Izq.', x: 165, y: 400, side: 'left', group: 'knee' },
  { id: 'r_knee', label: 'Rodilla Der.', x: 235, y: 400, side: 'right', group: 'knee' },
];

export const JOINT_GROUPS = [
  { id: 'mcp', label: 'Todas MCFs' },
  { id: 'pip', label: 'Todas IFPs' },
  { id: 'shoulder', label: 'Hombros' },
  { id: 'elbow', label: 'Codos' },
  { id: 'wrist', label: 'Munecas' },
  { id: 'knee', label: 'Rodillas' },
] as const;

// ============================================================================
// HAQ-DI CATEGORIES AND QUESTIONS
// ============================================================================

export const HAQ_OPTIONS = [
  { value: 0, label: 'Sin dificultad' },
  { value: 1, label: 'Con alguna dificultad' },
  { value: 2, label: 'Con mucha dificultad' },
  { value: 3, label: 'Incapaz de hacerlo' },
] as const;

export const HAQ_CATEGORIES: HAQCategory[] = [
  {
    id: 'dressing',
    label: 'Vestirse y Arreglarse',
    questions: [
      { id: 'haq_d1', text: 'Vestirse solo/a, incluyendo abrocharse los botones y atarse los cordones' },
      { id: 'haq_d2', text: 'Lavarse el cabello' },
    ],
  },
  {
    id: 'arising',
    label: 'Levantarse',
    questions: [
      { id: 'haq_a1', text: 'Levantarse de una silla sin apoyabrazos' },
      { id: 'haq_a2', text: 'Acostarse y levantarse de la cama' },
    ],
  },
  {
    id: 'eating',
    label: 'Comer',
    questions: [
      { id: 'haq_e1', text: 'Cortar la carne' },
      { id: 'haq_e2', text: 'Llevarse a la boca un vaso o taza lleno de liquido' },
      { id: 'haq_e3', text: 'Abrir un carton de leche nuevo' },
    ],
  },
  {
    id: 'walking',
    label: 'Caminar',
    questions: [
      { id: 'haq_w1', text: 'Caminar fuera de casa en terreno plano' },
      { id: 'haq_w2', text: 'Subir 5 escalones' },
    ],
  },
  {
    id: 'hygiene',
    label: 'Higiene',
    questions: [
      { id: 'haq_h1', text: 'Lavarse y secarse el cuerpo entero' },
      { id: 'haq_h2', text: 'Sentarse y levantarse del inodoro' },
    ],
  },
  {
    id: 'reach',
    label: 'Alcanzar',
    questions: [
      { id: 'haq_r1', text: 'Alcanzar y bajar un objeto de 2 kg por encima de su cabeza' },
      { id: 'haq_r2', text: 'Agacharse para recoger ropa del suelo' },
    ],
  },
  {
    id: 'grip',
    label: 'Prension',
    questions: [
      { id: 'haq_g1', text: 'Abrir puertas de automoviles' },
      { id: 'haq_g2', text: 'Abrir frascos que ya han sido abiertos' },
      { id: 'haq_g3', text: 'Abrir y cerrar llaves de agua' },
    ],
  },
  {
    id: 'activities',
    label: 'Actividades',
    questions: [
      { id: 'haq_ac1', text: 'Hacer mandados e ir de compras' },
      { id: 'haq_ac2', text: 'Entrar y salir de un automovil' },
      { id: 'haq_ac3', text: 'Hacer quehaceres del hogar como aspirar o hacer jardineria' },
    ],
  },
];

export const HAQ_AIDS_DEVICES = [
  { id: 'aid_cane', label: 'Baston' },
  { id: 'aid_walker', label: 'Andadera' },
  { id: 'aid_crutches', label: 'Muletas' },
  { id: 'aid_wheelchair', label: 'Silla de ruedas' },
  { id: 'aid_special_chair', label: 'Silla especial' },
  { id: 'aid_jar_opener', label: 'Abridor de frascos' },
  { id: 'aid_long_handle', label: 'Utensilios de mango largo' },
  { id: 'aid_bath_bar', label: 'Barra de bano' },
  { id: 'aid_raised_toilet', label: 'Asiento elevado de inodoro' },
  { id: 'aid_bath_seat', label: 'Asiento de bano' },
  { id: 'aid_dressing_aids', label: 'Ayudas para vestirse (ganchos, cremalleras largas)' },
] as const;

// ============================================================================
// JOINT STATUS COLORS
// ============================================================================

export const JOINT_STATUS_COLORS: Record<JointStatus, string> = {
  none: '#D1D5DB',
  tender: '#EF4444',
  swollen: '#3B82F6',
  both: '#8B5CF6',
};

export const JOINT_STATUS_LABELS: Record<JointStatus, string> = {
  none: 'Normal',
  tender: 'Dolorosa',
  swollen: 'Inflamada',
  both: 'Dolorosa e inflamada',
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Count tender joints (status 'tender' or 'both') from joint map.
 */
export function countTenderJoints(joints: Record<string, JointStatus>): number {
  return Object.values(joints).filter((s) => s === 'tender' || s === 'both').length;
}

/**
 * Count swollen joints (status 'swollen' or 'both') from joint map.
 */
export function countSwollenJoints(joints: Record<string, JointStatus>): number {
  return Object.values(joints).filter((s) => s === 'swollen' || s === 'both').length;
}

/**
 * Calculate DAS28-ESR score.
 * Formula: 0.56 * sqrt(TJC28) + 0.28 * sqrt(SJC28) + 0.70 * ln(ESR) + 0.014 * VAS
 */
export function calculateDAS28ESR(
  tjc28: number,
  sjc28: number,
  esr: number,
  vasPatient: number,
): number {
  const score =
    0.56 * Math.sqrt(tjc28) +
    0.28 * Math.sqrt(sjc28) +
    0.70 * Math.log(Math.max(esr, 1)) +
    0.014 * vasPatient;
  return Math.round(score * 100) / 100;
}

/**
 * Calculate DAS28-CRP score.
 * Formula: 0.56 * sqrt(TJC28) + 0.28 * sqrt(SJC28) + 0.36 * ln(CRP + 1) + 0.014 * VAS + 0.96
 */
export function calculateDAS28CRP(
  tjc28: number,
  sjc28: number,
  crp: number,
  vasPatient: number,
): number {
  const score =
    0.56 * Math.sqrt(tjc28) +
    0.28 * Math.sqrt(sjc28) +
    0.36 * Math.log(crp + 1) +
    0.014 * vasPatient +
    0.96;
  return Math.round(score * 100) / 100;
}

/**
 * Get DAS28 activity level from score.
 */
export function getDAS28ActivityLevel(score: number): DAS28ActivityBand {
  if (score < 2.6) return DAS28_BANDS[0];
  if (score < 3.2) return DAS28_BANDS[1];
  if (score < 5.1) return DAS28_BANDS[2];
  return DAS28_BANDS[3];
}

/**
 * Calculate CDAI score.
 * Formula: TJC28 + SJC28 + Patient VAS (cm) + Evaluator VAS (cm)
 * Note: VAS inputs are 0-100mm, CDAI uses 0-10cm scale, so divide by 10.
 */
export function calculateCDAI(
  tjc28: number,
  sjc28: number,
  vasPatient: number,
  vasEvaluator: number,
): number {
  const score = tjc28 + sjc28 + vasPatient / 10 + vasEvaluator / 10;
  return Math.round(score * 10) / 10;
}

/**
 * Get CDAI activity level from score.
 */
export function getCDAIActivityLevel(score: number): DAS28ActivityBand {
  if (score <= 2.8) return CDAI_BANDS[0];
  if (score <= 10) return CDAI_BANDS[1];
  if (score <= 22) return CDAI_BANDS[2];
  return CDAI_BANDS[3];
}

/**
 * Calculate HAQ Disability Index.
 * For each category: highest score among questions in that category.
 * If aid/device is used for that category, minimum score is 2.
 * DI = average of all 8 category scores.
 */
export function calculateHAQDI(
  responses: Record<string, number>,
  aids: string[],
): HAQResult {
  const categoryScores: Record<string, number> = {};

  // Map aids to affected categories
  const aidCategoryMap: Record<string, string[]> = {
    aid_cane: ['walking'],
    aid_walker: ['walking'],
    aid_crutches: ['walking'],
    aid_wheelchair: ['walking'],
    aid_special_chair: ['arising'],
    aid_jar_opener: ['grip', 'eating'],
    aid_long_handle: ['reach', 'eating'],
    aid_bath_bar: ['hygiene'],
    aid_raised_toilet: ['hygiene'],
    aid_bath_seat: ['hygiene'],
    aid_dressing_aids: ['dressing'],
  };

  const categoryAidApplied = new Set<string>();
  for (const aid of aids) {
    const categories = aidCategoryMap[aid];
    if (categories) {
      for (const cat of categories) {
        categoryAidApplied.add(cat);
      }
    }
  }

  for (const category of HAQ_CATEGORIES) {
    let maxScore = 0;
    for (const question of category.questions) {
      const val = responses[question.id] ?? 0;
      if (val > maxScore) maxScore = val;
    }

    // If aid/device used and score < 2, bump to 2
    if (categoryAidApplied.has(category.id) && maxScore < 2) {
      maxScore = 2;
    }

    categoryScores[category.id] = maxScore;
  }

  const values = Object.values(categoryScores);
  const totalDI =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
      : 0;

  let interpretation = 'Discapacidad leve';
  if (totalDI <= 0.5) interpretation = 'Sin discapacidad significativa';
  else if (totalDI <= 1.0) interpretation = 'Discapacidad leve a moderada';
  else if (totalDI <= 2.0) interpretation = 'Discapacidad moderada a severa';
  else interpretation = 'Discapacidad severa';

  return { categoryScores, totalDI, interpretation };
}

/**
 * Calculate ACR response criteria.
 * ACR20/50/70: requires >= 20%/50%/70% improvement in BOTH tender + swollen joint counts
 * (Plus improvement in 3 of 5 additional measures — simplified here to core counts).
 */
export function calculateACRResponse(
  baselineTJC: number,
  baselineSJC: number,
  currentTJC: number,
  currentSJC: number,
): ACRResponse {
  const tjcImprovement =
    baselineTJC > 0
      ? ((baselineTJC - currentTJC) / baselineTJC) * 100
      : currentTJC === 0
        ? 100
        : 0;

  const sjcImprovement =
    baselineSJC > 0
      ? ((baselineSJC - currentSJC) / baselineSJC) * 100
      : currentSJC === 0
        ? 100
        : 0;

  const minImprovement = Math.min(tjcImprovement, sjcImprovement);

  return {
    baseline: { tjc: baselineTJC, sjc: baselineSJC },
    current: { tjc: currentTJC, sjc: currentSJC },
    acr20: minImprovement >= 20,
    acr50: minImprovement >= 50,
    acr70: minImprovement >= 70,
  };
}

/**
 * EULAR response criteria based on DAS28 change and current level.
 * Good: improvement > 1.2 AND current <= 3.2
 * Moderate: improvement > 1.2 AND current > 3.2, OR improvement 0.6-1.2 AND current <= 5.1
 * None: improvement < 0.6 OR (improvement 0.6-1.2 AND current > 5.1)
 */
export function getEULARResponse(
  previousDAS28: number,
  currentDAS28: number,
): { response: 'good' | 'moderate' | 'none'; label: string; color: string } {
  const improvement = previousDAS28 - currentDAS28;

  if (improvement > 1.2 && currentDAS28 <= 3.2) {
    return { response: 'good', label: 'Buena respuesta', color: '#22C55E' };
  }
  if (
    (improvement > 1.2 && currentDAS28 > 3.2) ||
    (improvement >= 0.6 && improvement <= 1.2 && currentDAS28 <= 5.1)
  ) {
    return { response: 'moderate', label: 'Respuesta moderada', color: '#F97316' };
  }
  return { response: 'none', label: 'Sin respuesta', color: '#EF4444' };
}

/**
 * Toggle joint status in cycle: none -> tender -> swollen -> both -> none
 */
export function cycleJointStatus(current: JointStatus): JointStatus {
  switch (current) {
    case 'none':
      return 'tender';
    case 'tender':
      return 'swollen';
    case 'swollen':
      return 'both';
    case 'both':
      return 'none';
  }
}
