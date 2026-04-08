// ============================================================================
// EEG MONTAGES & REFERENCE DATA
// Standard 10-20 system electrode positions, montages, and pattern definitions
// ============================================================================

// ============================================================================
// ELECTRODE POSITIONS (International 10-20 System)
// ============================================================================

export interface ElectrodePosition {
  /** Electrode label (e.g., 'Fp1', 'C3') */
  id: string;
  /** Full name */
  name: string;
  /** SVG top-down X coordinate (0-100 normalized) */
  x: number;
  /** SVG top-down Y coordinate (0-100 normalized) */
  y: number;
  /** Hemisphere: 'left' | 'right' | 'midline' */
  hemisphere: 'left' | 'right' | 'midline';
  /** Region */
  region: 'frontal' | 'central' | 'parietal' | 'occipital' | 'temporal';
}

export const ELECTRODES_10_20: ElectrodePosition[] = [
  // Frontal polar
  { id: 'Fp1', name: 'Frontopolar izquierdo', x: 37, y: 12, hemisphere: 'left', region: 'frontal' },
  { id: 'Fp2', name: 'Frontopolar derecho', x: 63, y: 12, hemisphere: 'right', region: 'frontal' },

  // Frontal
  { id: 'F3', name: 'Frontal izquierdo', x: 32, y: 30, hemisphere: 'left', region: 'frontal' },
  { id: 'F4', name: 'Frontal derecho', x: 68, y: 30, hemisphere: 'right', region: 'frontal' },
  { id: 'F7', name: 'Frontal temporal izquierdo', x: 16, y: 28, hemisphere: 'left', region: 'frontal' },
  { id: 'F8', name: 'Frontal temporal derecho', x: 84, y: 28, hemisphere: 'right', region: 'frontal' },
  { id: 'Fz', name: 'Frontal línea media', x: 50, y: 28, hemisphere: 'midline', region: 'frontal' },

  // Central
  { id: 'C3', name: 'Central izquierdo', x: 30, y: 50, hemisphere: 'left', region: 'central' },
  { id: 'C4', name: 'Central derecho', x: 70, y: 50, hemisphere: 'right', region: 'central' },
  { id: 'Cz', name: 'Central línea media (vertex)', x: 50, y: 50, hemisphere: 'midline', region: 'central' },

  // Temporal
  { id: 'T3', name: 'Temporal medio izquierdo', x: 10, y: 50, hemisphere: 'left', region: 'temporal' },
  { id: 'T4', name: 'Temporal medio derecho', x: 90, y: 50, hemisphere: 'right', region: 'temporal' },
  { id: 'T5', name: 'Temporal posterior izquierdo', x: 16, y: 72, hemisphere: 'left', region: 'temporal' },
  { id: 'T6', name: 'Temporal posterior derecho', x: 84, y: 72, hemisphere: 'right', region: 'temporal' },

  // Parietal
  { id: 'P3', name: 'Parietal izquierdo', x: 32, y: 70, hemisphere: 'left', region: 'parietal' },
  { id: 'P4', name: 'Parietal derecho', x: 68, y: 70, hemisphere: 'right', region: 'parietal' },
  { id: 'Pz', name: 'Parietal línea media', x: 50, y: 70, hemisphere: 'midline', region: 'parietal' },

  // Occipital
  { id: 'O1', name: 'Occipital izquierdo', x: 37, y: 88, hemisphere: 'left', region: 'occipital' },
  { id: 'O2', name: 'Occipital derecho', x: 63, y: 88, hemisphere: 'right', region: 'occipital' },
];

export const ELECTRODE_IDS = ELECTRODES_10_20.map((e) => e.id);

// ============================================================================
// MONTAGES
// ============================================================================

export interface MontageChannel {
  /** Display label */
  label: string;
  /** Positive electrode */
  positive: string;
  /** Negative electrode (reference) */
  negative: string;
}

export interface Montage {
  id: string;
  name: string;
  description: string;
  channels: MontageChannel[];
}

/** Bipolar longitudinal ("double banana") montage */
export const BIPOLAR_LONGITUDINAL: Montage = {
  id: 'bipolar_longitudinal',
  name: 'Bipolar Longitudinal (Doble Banana)',
  description: 'Cadenas longitudinales anteroposterior, estándar clínico más utilizado',
  channels: [
    // Left temporal chain
    { label: 'Fp1-F7', positive: 'Fp1', negative: 'F7' },
    { label: 'F7-T3', positive: 'F7', negative: 'T3' },
    { label: 'T3-T5', positive: 'T3', negative: 'T5' },
    { label: 'T5-O1', positive: 'T5', negative: 'O1' },
    // Left parasagittal chain
    { label: 'Fp1-F3', positive: 'Fp1', negative: 'F3' },
    { label: 'F3-C3', positive: 'F3', negative: 'C3' },
    { label: 'C3-P3', positive: 'C3', negative: 'P3' },
    { label: 'P3-O1', positive: 'P3', negative: 'O1' },
    // Midline chain
    { label: 'Fz-Cz', positive: 'Fz', negative: 'Cz' },
    { label: 'Cz-Pz', positive: 'Cz', negative: 'Pz' },
    // Right parasagittal chain
    { label: 'Fp2-F4', positive: 'Fp2', negative: 'F4' },
    { label: 'F4-C4', positive: 'F4', negative: 'C4' },
    { label: 'C4-P4', positive: 'C4', negative: 'P4' },
    { label: 'P4-O2', positive: 'P4', negative: 'O2' },
    // Right temporal chain
    { label: 'Fp2-F8', positive: 'Fp2', negative: 'F8' },
    { label: 'F8-T4', positive: 'F8', negative: 'T4' },
    { label: 'T4-T6', positive: 'T4', negative: 'T6' },
    { label: 'T6-O2', positive: 'T6', negative: 'O2' },
  ],
};

/** Bipolar transverse montage */
export const BIPOLAR_TRANSVERSE: Montage = {
  id: 'bipolar_transverse',
  name: 'Bipolar Transversal',
  description: 'Cadenas transversales de izquierda a derecha',
  channels: [
    // Frontal transverse
    { label: 'F7-Fp1', positive: 'F7', negative: 'Fp1' },
    { label: 'Fp1-Fp2', positive: 'Fp1', negative: 'Fp2' },
    { label: 'Fp2-F8', positive: 'Fp2', negative: 'F8' },
    // Frontal-central transverse
    { label: 'F7-F3', positive: 'F7', negative: 'F3' },
    { label: 'F3-Fz', positive: 'F3', negative: 'Fz' },
    { label: 'Fz-F4', positive: 'Fz', negative: 'F4' },
    { label: 'F4-F8', positive: 'F4', negative: 'F8' },
    // Central transverse
    { label: 'T3-C3', positive: 'T3', negative: 'C3' },
    { label: 'C3-Cz', positive: 'C3', negative: 'Cz' },
    { label: 'Cz-C4', positive: 'Cz', negative: 'C4' },
    { label: 'C4-T4', positive: 'C4', negative: 'T4' },
    // Parietal transverse
    { label: 'T5-P3', positive: 'T5', negative: 'P3' },
    { label: 'P3-Pz', positive: 'P3', negative: 'Pz' },
    { label: 'Pz-P4', positive: 'Pz', negative: 'P4' },
    { label: 'P4-T6', positive: 'P4', negative: 'T6' },
    // Occipital transverse
    { label: 'T5-O1', positive: 'T5', negative: 'O1' },
    { label: 'O1-O2', positive: 'O1', negative: 'O2' },
    { label: 'O2-T6', positive: 'O2', negative: 'T6' },
  ],
};

/** Referential (ear reference) montage */
export const REFERENTIAL_EAR: Montage = {
  id: 'referential_ear',
  name: 'Referencial (Oreja)',
  description: 'Todos los electrodos referenciados a electrodos auriculares (A1/A2)',
  channels: [
    { label: 'Fp1-A1', positive: 'Fp1', negative: 'A1' },
    { label: 'Fp2-A2', positive: 'Fp2', negative: 'A2' },
    { label: 'F3-A1', positive: 'F3', negative: 'A1' },
    { label: 'F4-A2', positive: 'F4', negative: 'A2' },
    { label: 'C3-A1', positive: 'C3', negative: 'A1' },
    { label: 'C4-A2', positive: 'C4', negative: 'A2' },
    { label: 'P3-A1', positive: 'P3', negative: 'A1' },
    { label: 'P4-A2', positive: 'P4', negative: 'A2' },
    { label: 'O1-A1', positive: 'O1', negative: 'A1' },
    { label: 'O2-A2', positive: 'O2', negative: 'A2' },
    { label: 'F7-A1', positive: 'F7', negative: 'A1' },
    { label: 'F8-A2', positive: 'F8', negative: 'A2' },
    { label: 'T3-A1', positive: 'T3', negative: 'A1' },
    { label: 'T4-A2', positive: 'T4', negative: 'A2' },
    { label: 'T5-A1', positive: 'T5', negative: 'A1' },
    { label: 'T6-A2', positive: 'T6', negative: 'A2' },
    { label: 'Fz-A1A2', positive: 'Fz', negative: 'A1A2' },
    { label: 'Cz-A1A2', positive: 'Cz', negative: 'A1A2' },
    { label: 'Pz-A1A2', positive: 'Pz', negative: 'A1A2' },
  ],
};

/** Average reference montage */
export const AVERAGE_REFERENCE: Montage = {
  id: 'average_reference',
  name: 'Referencia Promedio',
  description: 'Cada electrodo referenciado al promedio de todos los electrodos',
  channels: ELECTRODE_IDS.map((id) => ({
    label: `${id}-AVG`,
    positive: id,
    negative: 'AVG',
  })),
};

export const STANDARD_MONTAGES: Montage[] = [
  BIPOLAR_LONGITUDINAL,
  BIPOLAR_TRANSVERSE,
  REFERENTIAL_EAR,
  AVERAGE_REFERENCE,
];

// ============================================================================
// NORMAL RHYTHMS
// ============================================================================

export interface EegRhythm {
  id: string;
  name: string;
  /** Spanish display name */
  label: string;
  /** Frequency band in Hz */
  frequencyRange: [number, number];
  /** Typical amplitude range in microvolts */
  amplitudeRange: [number, number];
  /** Primary distribution regions */
  distribution: string[];
  /** Clinical significance */
  significance: string;
}

export const NORMAL_RHYTHMS: EegRhythm[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    label: 'Ritmo Alfa',
    frequencyRange: [8, 13],
    amplitudeRange: [20, 100],
    distribution: ['O1', 'O2', 'P3', 'P4'],
    significance: 'Ritmo posterior dominante en vigilia relajada con ojos cerrados. Atenua con apertura ocular.',
  },
  {
    id: 'beta',
    name: 'Beta',
    label: 'Ritmo Beta',
    frequencyRange: [13, 30],
    amplitudeRange: [5, 30],
    distribution: ['Fp1', 'Fp2', 'F3', 'F4', 'Fz'],
    significance: 'Predominio frontal, asociado a vigilia activa, medicación (benzodiacepinas), ansiedad.',
  },
  {
    id: 'theta',
    name: 'Theta',
    label: 'Ritmo Theta',
    frequencyRange: [4, 7],
    amplitudeRange: [20, 100],
    distribution: ['F3', 'F4', 'Fz', 'C3', 'C4', 'Cz'],
    significance: 'Normal en somnolencia y sueño ligero. Anormal si prominente en vigilia en adultos.',
  },
  {
    id: 'delta',
    name: 'Delta',
    label: 'Ritmo Delta',
    frequencyRange: [0.5, 4],
    amplitudeRange: [20, 200],
    distribution: ['F3', 'F4', 'Fz', 'C3', 'C4'],
    significance: 'Normal en sueño profundo (etapas N3). Anormal en vigilia, sugiere encefalopatía o lesión focal.',
  },
];

// ============================================================================
// ABNORMAL PATTERNS
// ============================================================================

export type AbnormalPatternSeverity = 'mild' | 'moderate' | 'severe';

export interface AbnormalPattern {
  id: string;
  name: string;
  /** Spanish display name */
  label: string;
  /** Category for grouping */
  category: 'epileptiform' | 'slowing' | 'periodic' | 'other';
  /** Severity/clinical urgency */
  severity: AbnormalPatternSeverity;
  /** Clinical description */
  description: string;
}

export const ABNORMAL_PATTERNS: AbnormalPattern[] = [
  // Epileptiform discharges
  {
    id: 'spikes',
    name: 'Spikes',
    label: 'Puntas',
    category: 'epileptiform',
    severity: 'moderate',
    description: 'Transientes agudos de 20-70 ms, marcador de irritabilidad cortical y potencial epileptogénico.',
  },
  {
    id: 'sharp_waves',
    name: 'Sharp waves',
    label: 'Ondas agudas',
    category: 'epileptiform',
    severity: 'moderate',
    description: 'Transientes de 70-200 ms, similar significado a las puntas pero mayor duración.',
  },
  {
    id: 'spike_and_wave',
    name: 'Spike-and-wave',
    label: 'Punta-onda',
    category: 'epileptiform',
    severity: 'severe',
    description: 'Complejos punta seguida de onda lenta. A 3 Hz: epilepsia ausencia. Generalizado o focal.',
  },
  {
    id: 'polyspikes',
    name: 'Polyspikes',
    label: 'Polipuntas',
    category: 'epileptiform',
    severity: 'severe',
    description: 'Múltiples puntas sucesivas, asociadas a epilepsia mioclónica juvenil y otras epilepsias generalizadas.',
  },
  {
    id: 'electrographic_seizure',
    name: 'Electrographic seizure',
    label: 'Crisis electrografica',
    category: 'epileptiform',
    severity: 'severe',
    description: 'Patrón ictal sostenido con evolución en frecuencia, morfología o distribución. Urgencia neurológica.',
  },

  // Slowing
  {
    id: 'focal_slowing',
    name: 'Focal slowing',
    label: 'Enlentecimiento focal',
    category: 'slowing',
    severity: 'mild',
    description: 'Actividad lenta theta/delta localizada. Sugiere disfunción cortical focal (lesión, isquemia).',
  },
  {
    id: 'generalized_slowing',
    name: 'Generalized slowing',
    label: 'Enlentecimiento generalizado',
    category: 'slowing',
    severity: 'moderate',
    description: 'Actividad lenta difusa. Indica encefalopatía difusa (metabólica, tóxica, infecciosa).',
  },

  // Periodic patterns
  {
    id: 'firda',
    name: 'FIRDA',
    label: 'FIRDA',
    category: 'periodic',
    severity: 'moderate',
    description: 'Actividad rítmica delta intermitente frontal. Encefalopatía difusa o lesiones profundas de línea media.',
  },
  {
    id: 'tirda',
    name: 'TIRDA',
    label: 'TIRDA',
    category: 'periodic',
    severity: 'moderate',
    description: 'Actividad rítmica delta intermitente temporal. Fuerte asociación con epilepsia del lóbulo temporal.',
  },
  {
    id: 'pleds',
    name: 'PLEDs / LPDs',
    label: 'Descargas periódicas lateralizadas (LPDs)',
    category: 'periodic',
    severity: 'severe',
    description: 'Descargas periódicas unilaterales. Asociadas a lesiones agudas (ACV, encefalitis herpética) y alto riesgo de crisis.',
  },
  {
    id: 'gpeds',
    name: 'GPEDs / GPDs',
    label: 'Descargas periódicas generalizadas (GPDs)',
    category: 'periodic',
    severity: 'severe',
    description: 'Descargas periódicas bilaterales. Encefalopatías severas, anoxia, priones (CJD), status epiléptico.',
  },
  {
    id: 'burst_suppression',
    name: 'Burst suppression',
    label: 'Brote-supresion',
    category: 'periodic',
    severity: 'severe',
    description: 'Alternancia de brotes de actividad con periodos de supresión. Encefalopatía severa, anestesia profunda, hipotermia.',
  },

  // Other
  {
    id: 'triphasic_waves',
    name: 'Triphasic waves',
    label: 'Ondas trifasicas',
    category: 'other',
    severity: 'moderate',
    description: 'Ondas con tres fases y gradiente anteroposterior. Encefalopatía metabólica (hepática, renal, urémica).',
  },
  {
    id: 'breach_rhythm',
    name: 'Breach rhythm',
    label: 'Ritmo de brecha',
    category: 'other',
    severity: 'mild',
    description: 'Actividad aumentada sobre defecto óseo (craneotomía). Hallazgo benigno post-quirúrgico.',
  },
];

// ============================================================================
// ELECTRODE ACTIVITY STATUS (for electrode map)
// ============================================================================

export type ElectrodeActivity = 'normal' | 'slowing' | 'epileptiform' | 'suppression';

export const ELECTRODE_ACTIVITY_CONFIG: Record<
  ElectrodeActivity,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  normal: {
    label: 'Normal',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  slowing: {
    label: 'Enlentecimiento',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  epileptiform: {
    label: 'Epileptiforme',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  suppression: {
    label: 'Supresion',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#C4B5FD',
  },
};

// ============================================================================
// BACKGROUND ACTIVITY GRADING
// ============================================================================

export interface BackgroundGrade {
  id: string;
  label: string;
  description: string;
}

export const BACKGROUND_GRADES: BackgroundGrade[] = [
  { id: 'normal', label: 'Normal', description: 'Ritmo posterior dominante alfa 8-13 Hz, reactivo, simétrico, con gradiente AP conservado.' },
  { id: 'mildly_abnormal', label: 'Levemente anormal', description: 'Ritmo posterior lento (7-8 Hz) o ligeramente asimétrico, o exceso leve de theta difuso.' },
  { id: 'moderately_abnormal', label: 'Moderadamente anormal', description: 'Ritmo posterior <7 Hz o pobremente organizado, exceso de theta/delta difuso significativo.' },
  { id: 'severely_abnormal', label: 'Severamente anormal', description: 'Sin ritmo posterior identificable, predominio delta difuso, atenuación severa o brote-supresión.' },
];

// ============================================================================
// ENCEPHALOPATHY GRADING (Synek)
// ============================================================================

export interface EncephalopathyGrade {
  grade: number;
  label: string;
  description: string;
  prognosis: string;
}

export const ENCEPHALOPATHY_GRADES: EncephalopathyGrade[] = [
  { grade: 1, label: 'Grado I - Theta predominante', description: 'Exceso de actividad theta generalizada con algo de alfa preservado.', prognosis: 'Buen pronóstico' },
  { grade: 2, label: 'Grado II - Delta predominante', description: 'Predominio de actividad delta con theta intermezclada.', prognosis: 'Pronóstico reservado' },
  { grade: 3, label: 'Grado III - Patrones periódicos', description: 'Descargas periódicas (tripásicas, GPDs) sobre base lenta.', prognosis: 'Pronóstico desfavorable' },
  { grade: 4, label: 'Grado IV - Brote-supresión', description: 'Patrón de brote-supresión.', prognosis: 'Pronóstico pobre' },
  { grade: 5, label: 'Grado V - Supresión', description: 'Actividad suprimida o silencio electrocerebral.', prognosis: 'Pronóstico muy pobre' },
];

// ============================================================================
// RECORDING STATES
// ============================================================================

export type RecordingState = 'awake' | 'drowsy' | 'asleep' | 'sedated';

export const RECORDING_STATES: Array<{ value: RecordingState; label: string }> = [
  { value: 'awake', label: 'Vigilia' },
  { value: 'drowsy', label: 'Somnolencia' },
  { value: 'asleep', label: 'Sueño' },
  { value: 'sedated', label: 'Sedado' },
];

// ============================================================================
// ACTIVATION PROCEDURES
// ============================================================================

export type ActivationProcedure = 'hyperventilation' | 'photic_stimulation' | 'sleep_deprivation' | 'sleep_recording';

export const ACTIVATION_PROCEDURES: Array<{ value: ActivationProcedure; label: string; abbreviation: string }> = [
  { value: 'hyperventilation', label: 'Hiperventilacion', abbreviation: 'HV' },
  { value: 'photic_stimulation', label: 'Estimulacion fotica', abbreviation: 'EF' },
  { value: 'sleep_deprivation', label: 'Privacion de sueño', abbreviation: 'PS' },
  { value: 'sleep_recording', label: 'Registro de sueño', abbreviation: 'RS' },
];

// ============================================================================
// IMPRESSION SEVERITY
// ============================================================================

export type EegImpressionSeverity = 'normal' | 'mildly_abnormal' | 'moderately_abnormal' | 'severely_abnormal';

export const IMPRESSION_SEVERITY_OPTIONS: Array<{
  value: EegImpressionSeverity;
  label: string;
  color: string;
}> = [
  { value: 'normal', label: 'Normal', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'mildly_abnormal', label: 'Levemente anormal', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'moderately_abnormal', label: 'Moderadamente anormal', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'severely_abnormal', label: 'Severamente anormal', color: 'bg-red-100 text-red-700 border-red-300' },
];
