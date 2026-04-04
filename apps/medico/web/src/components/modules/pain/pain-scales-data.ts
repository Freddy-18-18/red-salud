/**
 * @file pain-scales-data.ts
 * @description Pain assessment scales: VAS, NRS, Wong-Baker FACES, BPI, McGill, DN4.
 * All labels in Venezuelan Spanish.
 */

// ============================================================================
// TYPES
// ============================================================================

export type PainScaleType = 'vas' | 'nrs' | 'faces' | 'bpi' | 'mcgill' | 'dn4';

export interface PainPoint {
  id: string;
  x: number; // 0-100 relative position
  y: number; // 0-100 relative position
  intensity: number; // 0-10
  type: PainType;
  label?: string;
}

export type PainType =
  | 'sharp'    // Punzante
  | 'burning'  // Quemante
  | 'aching'   // Sordo
  | 'throbbing'// Pulsátil
  | 'tingling' // Hormigueo
  | 'numbness' // Adormecimiento
  | 'cramping' // Calambre
  | 'shooting'; // Lancinante

export const PAIN_TYPE_LABELS: Record<PainType, string> = {
  sharp: 'Punzante',
  burning: 'Quemante',
  aching: 'Sordo/Continuo',
  throbbing: 'Pulsátil',
  tingling: 'Hormigueo',
  numbness: 'Adormecimiento',
  cramping: 'Calambre',
  shooting: 'Lancinante',
};

// ============================================================================
// NRS (Numeric Rating Scale) — 0 to 10
// ============================================================================

export const NRS_LABELS: Array<{ value: number; label: string; color: string }> = [
  { value: 0, label: 'Sin dolor', color: '#22c55e' },
  { value: 1, label: 'Mínimo', color: '#4ade80' },
  { value: 2, label: 'Leve', color: '#84cc16' },
  { value: 3, label: 'Leve-Moderado', color: '#a3e635' },
  { value: 4, label: 'Moderado', color: '#eab308' },
  { value: 5, label: 'Moderado', color: '#f59e0b' },
  { value: 6, label: 'Moderado-Severo', color: '#f97316' },
  { value: 7, label: 'Severo', color: '#ef4444' },
  { value: 8, label: 'Muy severo', color: '#dc2626' },
  { value: 9, label: 'Insoportable', color: '#b91c1c' },
  { value: 10, label: 'Peor dolor posible', color: '#991b1b' },
];

// ============================================================================
// VAS (Visual Analog Scale) — 0 to 100
// ============================================================================

export function vasToNrs(vas: number): number {
  return Math.round(vas / 10);
}

export function nrsToVas(nrs: number): number {
  return nrs * 10;
}

export function getVasColor(vas: number): string {
  const nrs = vasToNrs(vas);
  return NRS_LABELS[Math.min(nrs, 10)].color;
}

// ============================================================================
// WONG-BAKER FACES — 6 faces (0, 2, 4, 6, 8, 10)
// ============================================================================

export const FACES_SCALE: Array<{
  value: number;
  label: string;
  emoji: string;
  color: string;
  /** SVG path data for a simplified face */
  mouthPath: string;
  eyeType: 'happy' | 'neutral' | 'sad' | 'cry';
}> = [
  {
    value: 0,
    label: 'Sin dolor',
    emoji: '😊',
    color: '#22c55e',
    mouthPath: 'M 12 22 Q 20 30 28 22',
    eyeType: 'happy',
  },
  {
    value: 2,
    label: 'Duele un poco',
    emoji: '🙂',
    color: '#84cc16',
    mouthPath: 'M 12 24 Q 20 28 28 24',
    eyeType: 'neutral',
  },
  {
    value: 4,
    label: 'Duele un poco más',
    emoji: '😐',
    color: '#eab308',
    mouthPath: 'M 12 25 L 28 25',
    eyeType: 'neutral',
  },
  {
    value: 6,
    label: 'Duele aún más',
    emoji: '😟',
    color: '#f97316',
    mouthPath: 'M 12 27 Q 20 23 28 27',
    eyeType: 'sad',
  },
  {
    value: 8,
    label: 'Duele mucho',
    emoji: '😢',
    color: '#ef4444',
    mouthPath: 'M 12 28 Q 20 22 28 28',
    eyeType: 'cry',
  },
  {
    value: 10,
    label: 'El peor dolor',
    emoji: '😭',
    color: '#991b1b',
    mouthPath: 'M 12 30 Q 20 20 28 30',
    eyeType: 'cry',
  },
];

// ============================================================================
// BPI (Brief Pain Inventory) — severity + interference
// ============================================================================

export const BPI_SEVERITY_ITEMS = [
  { id: 'worst', label: 'Peor dolor en las últimas 24h' },
  { id: 'least', label: 'Menor dolor en las últimas 24h' },
  { id: 'average', label: 'Dolor promedio' },
  { id: 'now', label: 'Dolor ahora mismo' },
] as const;

export const BPI_INTERFERENCE_ITEMS = [
  { id: 'activity', label: 'Actividad general' },
  { id: 'mood', label: 'Estado de ánimo' },
  { id: 'walking', label: 'Capacidad de caminar' },
  { id: 'work', label: 'Trabajo normal' },
  { id: 'relations', label: 'Relaciones con otros' },
  { id: 'sleep', label: 'Sueño' },
  { id: 'enjoyment', label: 'Disfrute de la vida' },
] as const;

// ============================================================================
// McGILL PAIN QUESTIONNAIRE (Short Form) — 15 descriptors
// ============================================================================

export const MCGILL_DESCRIPTORS = [
  { id: 'throbbing', label: 'Pulsátil', group: 'sensory' },
  { id: 'shooting', label: 'Lancinante', group: 'sensory' },
  { id: 'stabbing', label: 'Punzante', group: 'sensory' },
  { id: 'sharp', label: 'Agudo', group: 'sensory' },
  { id: 'cramping', label: 'Tipo calambre', group: 'sensory' },
  { id: 'gnawing', label: 'Corrosivo', group: 'sensory' },
  { id: 'hot_burning', label: 'Quemante', group: 'sensory' },
  { id: 'aching', label: 'Continuo/Sordo', group: 'sensory' },
  { id: 'heavy', label: 'Pesado', group: 'sensory' },
  { id: 'tender', label: 'Sensible al tacto', group: 'sensory' },
  { id: 'splitting', label: 'Desgarrante', group: 'sensory' },
  { id: 'tiring', label: 'Agotador', group: 'affective' },
  { id: 'sickening', label: 'Nauseabundo', group: 'affective' },
  { id: 'fearful', label: 'Atemorizante', group: 'affective' },
  { id: 'punishing', label: 'Castigante/Cruel', group: 'affective' },
] as const;

export type McGillSeverity = 0 | 1 | 2 | 3;
export const MCGILL_SEVERITY_LABELS: Record<McGillSeverity, string> = {
  0: 'Ninguno',
  1: 'Leve',
  2: 'Moderado',
  3: 'Severo',
};

// ============================================================================
// DN4 (Douleur Neuropathique 4) — Neuropathic pain screening
// ============================================================================

export const DN4_ITEMS = [
  // Interview questions
  { id: 'burning', label: '¿El dolor tiene características de quemazón?', group: 'interview' },
  { id: 'cold', label: '¿El dolor tiene sensación de frío doloroso?', group: 'interview' },
  { id: 'electric', label: '¿El dolor tiene sensación de descargas eléctricas?', group: 'interview' },
  // Associated symptoms
  { id: 'tingling', label: '¿El dolor se asocia con hormigueo?', group: 'interview' },
  { id: 'pins_needles', label: '¿El dolor se asocia con pinchazos?', group: 'interview' },
  { id: 'numbness', label: '¿El dolor se asocia con adormecimiento?', group: 'interview' },
  { id: 'itching', label: '¿El dolor se asocia con picazón?', group: 'interview' },
  // Examination
  { id: 'hypoesthesia_touch', label: 'Hipoestesia al tacto', group: 'examination' },
  { id: 'hypoesthesia_pinprick', label: 'Hipoestesia al pinchazo', group: 'examination' },
  { id: 'allodynia', label: 'Dolor provocado por el roce (alodinia)', group: 'examination' },
] as const;

/**
 * DN4 score ≥ 4/10 suggests neuropathic pain.
 */
export function interpretDN4(score: number): { isNeuropathic: boolean; label: string } {
  if (score >= 4) {
    return { isNeuropathic: true, label: 'Probable dolor neuropático' };
  }
  return { isNeuropathic: false, label: 'No sugestivo de dolor neuropático' };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get NRS severity category.
 */
export function getNRSSeverity(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Sin dolor', color: '#22c55e' };
  if (score <= 3) return { label: 'Leve', color: '#84cc16' };
  if (score <= 6) return { label: 'Moderado', color: '#f97316' };
  return { label: 'Severo', color: '#ef4444' };
}

/**
 * Calculate BPI severity score (mean of 4 severity items).
 */
export function calculateBPISeverity(scores: Record<string, number>): number {
  const items = BPI_SEVERITY_ITEMS.map((i) => scores[i.id] ?? 0);
  return Math.round((items.reduce((a, b) => a + b, 0) / items.length) * 10) / 10;
}

/**
 * Calculate BPI interference score (mean of 7 interference items).
 */
export function calculateBPIInterference(scores: Record<string, number>): number {
  const items = BPI_INTERFERENCE_ITEMS.map((i) => scores[i.id] ?? 0);
  return Math.round((items.reduce((a, b) => a + b, 0) / items.length) * 10) / 10;
}
