// ============================================================================
// PSYCHIATRIC SCALES DATA — All validated clinical instruments
// All questions in Spanish for Venezuelan medical practice
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface ScaleOption {
  value: number;
  label: string;
}

export interface ScaleQuestion {
  id: string;
  text: string;
  options: ScaleOption[];
  /** If true, this question screens for suicide risk and must be flagged */
  isSuicideRisk?: boolean;
}

export interface SeverityBand {
  min: number;
  max: number;
  label: string;
  color: string;
  /** Tailwind bg class for badges */
  badgeClass: string;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  /** Type of assessment */
  type: 'self-report' | 'clinician-rated';
  /** Maximum possible score */
  maxScore: number;
  questions: ScaleQuestion[];
  severityBands: SeverityBand[];
  /** Clinical notes about this scale */
  notes?: string;
}

// ============================================================================
// STANDARD LIKERT OPTIONS
// ============================================================================

const PHQ9_GAD7_OPTIONS: ScaleOption[] = [
  { value: 0, label: 'Para nada' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

// ============================================================================
// PHQ-9 — Patient Health Questionnaire (Depression)
// ============================================================================

export const PHQ9: ScaleDefinition = {
  id: 'phq9',
  name: 'Cuestionario de Salud del Paciente',
  abbreviation: 'PHQ-9',
  description: 'Escala de tamizaje y medición de severidad de depresión',
  type: 'self-report',
  maxScore: 27,
  notes: 'La pregunta 9 evalúa ideación suicida. Cualquier puntuación >0 requiere evaluación inmediata de riesgo.',
  questions: [
    {
      id: 'phq9_1',
      text: 'Poco interés o placer en hacer cosas',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_2',
      text: 'Se ha sentido decaído/a, deprimido/a o sin esperanzas',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_3',
      text: 'Dificultad para dormir, mantenerse dormido/a o dormir demasiado',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_4',
      text: 'Se ha sentido cansado/a o con poca energía',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_5',
      text: 'Poco apetito o ha comido en exceso',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_6',
      text: 'Se ha sentido mal consigo mismo/a, que es un fracaso o que se ha fallado a sí mismo/a o a su familia',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_7',
      text: 'Dificultad para concentrarse en cosas como leer el periódico o ver televisión',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_8',
      text: 'Se ha movido o hablado tan lento que otras personas lo han notado, o al contrario, ha estado tan inquieto/a que se mueve mucho más de lo normal',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'phq9_9',
      text: 'Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera',
      options: PHQ9_GAD7_OPTIONS,
      isSuicideRisk: true,
    },
  ],
  severityBands: [
    { min: 0, max: 4, label: 'Mínima', color: '#22C55E', badgeClass: 'bg-emerald-100 text-emerald-700' },
    { min: 5, max: 9, label: 'Leve', color: '#EAB308', badgeClass: 'bg-yellow-100 text-yellow-700' },
    { min: 10, max: 14, label: 'Moderada', color: '#F97316', badgeClass: 'bg-orange-100 text-orange-700' },
    { min: 15, max: 19, label: 'Moderadamente severa', color: '#EF4444', badgeClass: 'bg-red-100 text-red-700' },
    { min: 20, max: 27, label: 'Severa', color: '#DC2626', badgeClass: 'bg-red-200 text-red-800' },
  ],
};

// ============================================================================
// GAD-7 — Generalized Anxiety Disorder
// ============================================================================

export const GAD7: ScaleDefinition = {
  id: 'gad7',
  name: 'Escala de Trastorno de Ansiedad Generalizada',
  abbreviation: 'GAD-7',
  description: 'Escala de tamizaje y medición de severidad de ansiedad',
  type: 'self-report',
  maxScore: 21,
  questions: [
    {
      id: 'gad7_1',
      text: 'Se ha sentido nervioso/a, ansioso/a o con los nervios de punta',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_2',
      text: 'No ha sido capaz de parar o controlar su preocupación',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_3',
      text: 'Se ha preocupado demasiado por motivos diferentes',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_4',
      text: 'Dificultad para relajarse',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_5',
      text: 'Se ha sentido tan inquieto/a que le ha sido difícil quedarse quieto/a',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_6',
      text: 'Se ha enfadado o irritado con facilidad',
      options: PHQ9_GAD7_OPTIONS,
    },
    {
      id: 'gad7_7',
      text: 'Ha tenido miedo como si algo terrible fuera a pasar',
      options: PHQ9_GAD7_OPTIONS,
    },
  ],
  severityBands: [
    { min: 0, max: 4, label: 'Mínima', color: '#22C55E', badgeClass: 'bg-emerald-100 text-emerald-700' },
    { min: 5, max: 9, label: 'Leve', color: '#EAB308', badgeClass: 'bg-yellow-100 text-yellow-700' },
    { min: 10, max: 14, label: 'Moderada', color: '#F97316', badgeClass: 'bg-orange-100 text-orange-700' },
    { min: 15, max: 21, label: 'Severa', color: '#EF4444', badgeClass: 'bg-red-100 text-red-700' },
  ],
};

// ============================================================================
// MADRS — Montgomery-Asberg Depression Rating Scale
// ============================================================================

const MADRS_OPTIONS_0_6: ScaleOption[] = [
  { value: 0, label: 'Sin dificultad / Normal' },
  { value: 1, label: '' },
  { value: 2, label: 'Leve' },
  { value: 3, label: '' },
  { value: 4, label: 'Moderado' },
  { value: 5, label: '' },
  { value: 6, label: 'Severo' },
];

export const MADRS: ScaleDefinition = {
  id: 'madrs',
  name: 'Escala de Depresión de Montgomery-Åsberg',
  abbreviation: 'MADRS',
  description: 'Escala de evaluación de depresión calificada por el clínico',
  type: 'clinician-rated',
  maxScore: 60,
  notes: 'Los ítems 8 y 9 evalúan contenido pesimista e ideación suicida respectivamente.',
  questions: [
    {
      id: 'madrs_1',
      text: 'Tristeza aparente — Representa el desánimo, melancolía y desesperanza reflejados en el habla, expresión facial y postura del paciente',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_2',
      text: 'Tristeza reportada — Representa el estado de ánimo depresivo reportado por el paciente, independientemente de si se refleja externamente',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_3',
      text: 'Tensión interna — Representa sentimientos de malestar mal definido, irritabilidad, agitación interna y tensión mental que llega hasta el pánico o la angustia',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_4',
      text: 'Sueño reducido — Representa la experiencia de duración o profundidad del sueño reducida comparada con el patrón normal del paciente',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_5',
      text: 'Apetito reducido — Representa la sensación de pérdida de apetito comparada con lo normal. Evalúe la pérdida del deseo de comer o la necesidad de forzarse para comer',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_6',
      text: 'Dificultad de concentración — Representa dificultades para organizar pensamientos, hasta la completa incapacidad de concentración',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_7',
      text: 'Lasitud — Representa la dificultad para iniciar actividades o la lentitud para comenzar y realizar actividades cotidianas',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_8',
      text: 'Incapacidad de sentir — Representa la experiencia subjetiva de interés reducido en el entorno o en actividades que normalmente dan placer',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_9',
      text: 'Pensamientos pesimistas — Representa pensamientos de culpa, inferioridad, autorreproche, pecaminosidad, remordimiento y ruina',
      options: MADRS_OPTIONS_0_6,
    },
    {
      id: 'madrs_10',
      text: 'Pensamientos suicidas — Representa el sentimiento de que la vida no vale la pena, de que una muerte natural sería bienvenida, pensamientos suicidas y preparativos para el suicidio',
      options: MADRS_OPTIONS_0_6,
      isSuicideRisk: true,
    },
  ],
  severityBands: [
    { min: 0, max: 6, label: 'Normal / Sin depresión', color: '#22C55E', badgeClass: 'bg-emerald-100 text-emerald-700' },
    { min: 7, max: 19, label: 'Depresión leve', color: '#EAB308', badgeClass: 'bg-yellow-100 text-yellow-700' },
    { min: 20, max: 34, label: 'Depresión moderada', color: '#F97316', badgeClass: 'bg-orange-100 text-orange-700' },
    { min: 35, max: 60, label: 'Depresión severa', color: '#EF4444', badgeClass: 'bg-red-100 text-red-700' },
  ],
};

// ============================================================================
// AUDIT — Alcohol Use Disorders Identification Test
// ============================================================================

export const AUDIT: ScaleDefinition = {
  id: 'audit',
  name: 'Test de Identificación de Trastornos por Uso de Alcohol',
  abbreviation: 'AUDIT',
  description: 'Instrumento de tamizaje para consumo problemático de alcohol desarrollado por la OMS',
  type: 'self-report',
  maxScore: 40,
  questions: [
    {
      id: 'audit_1',
      text: '¿Con qué frecuencia consume alguna bebida alcohólica?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Una o menos veces al mes' },
        { value: 2, label: 'De 2 a 4 veces al mes' },
        { value: 3, label: 'De 2 a 3 veces a la semana' },
        { value: 4, label: '4 o más veces a la semana' },
      ],
    },
    {
      id: 'audit_2',
      text: '¿Cuántas consumiciones de bebidas alcohólicas suele realizar en un día de consumo normal?',
      options: [
        { value: 0, label: '1 o 2' },
        { value: 1, label: '3 o 4' },
        { value: 2, label: '5 o 6' },
        { value: 3, label: '7 a 9' },
        { value: 4, label: '10 o más' },
      ],
    },
    {
      id: 'audit_3',
      text: '¿Con qué frecuencia toma 6 o más bebidas alcohólicas en un solo día?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_4',
      text: '¿Con qué frecuencia en el curso del último año ha sido incapaz de parar de beber una vez que había empezado?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_5',
      text: '¿Con qué frecuencia en el curso del último año no pudo hacer lo que se esperaba de usted porque había bebido?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_6',
      text: '¿Con qué frecuencia en el curso del último año ha necesitado beber en ayunas para recuperarse después de haber bebido mucho el día anterior?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_7',
      text: '¿Con qué frecuencia en el curso del último año ha tenido remordimientos o sentimientos de culpa después de haber bebido?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_8',
      text: '¿Con qué frecuencia en el curso del último año no ha podido recordar lo que sucedió la noche anterior porque había estado bebiendo?',
      options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Menos de una vez al mes' },
        { value: 2, label: 'Mensualmente' },
        { value: 3, label: 'Semanalmente' },
        { value: 4, label: 'A diario o casi a diario' },
      ],
    },
    {
      id: 'audit_9',
      text: '¿Usted o alguna otra persona ha resultado herida porque usted había bebido?',
      options: [
        { value: 0, label: 'No' },
        { value: 2, label: 'Sí, pero no en el curso del último año' },
        { value: 4, label: 'Sí, en el último año' },
      ],
    },
    {
      id: 'audit_10',
      text: '¿Algún familiar, amigo, médico o profesional sanitario ha mostrado preocupación por su consumo de bebidas alcohólicas o le ha sugerido que deje de beber?',
      options: [
        { value: 0, label: 'No' },
        { value: 2, label: 'Sí, pero no en el curso del último año' },
        { value: 4, label: 'Sí, en el último año' },
      ],
    },
  ],
  severityBands: [
    { min: 0, max: 7, label: 'Zona I — Bajo riesgo', color: '#22C55E', badgeClass: 'bg-emerald-100 text-emerald-700' },
    { min: 8, max: 15, label: 'Zona II — Consumo de riesgo', color: '#EAB308', badgeClass: 'bg-yellow-100 text-yellow-700' },
    { min: 16, max: 19, label: 'Zona III — Consumo perjudicial', color: '#F97316', badgeClass: 'bg-orange-100 text-orange-700' },
    { min: 20, max: 40, label: 'Zona IV — Posible dependencia', color: '#EF4444', badgeClass: 'bg-red-100 text-red-700' },
  ],
};

// ============================================================================
// C-SSRS — Columbia Suicide Severity Rating Scale (Screening)
// ============================================================================

export const CSSRS: ScaleDefinition = {
  id: 'cssrs',
  name: 'Escala Columbia de Severidad del Suicidio',
  abbreviation: 'C-SSRS',
  description: 'Tamizaje de ideación y conducta suicida',
  type: 'clinician-rated',
  maxScore: 6,
  notes: 'TODA respuesta positiva requiere evaluación clínica adicional. Las preguntas 3-6 indican alto riesgo.',
  questions: [
    {
      id: 'cssrs_1',
      text: '¿Ha deseado estar muerto/a o poder dormirse y no despertar?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
    {
      id: 'cssrs_2',
      text: '¿Ha tenido realmente pensamientos de suicidarse?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
    {
      id: 'cssrs_3',
      text: '¿Ha pensado en cómo llevaría esto a cabo (método, plan)?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
    {
      id: 'cssrs_4',
      text: '¿Ha tenido estos pensamientos y alguna intención de actuar en consecuencia?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
    {
      id: 'cssrs_5',
      text: '¿Ha comenzado a elaborar los detalles de cómo suicidarse o ha hecho algo para prepararse?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
    {
      id: 'cssrs_6',
      text: '¿Ha hecho alguna vez algo, empezado a hacer algo, o se ha preparado para hacer algo para terminar con su vida?',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' },
      ],
      isSuicideRisk: true,
    },
  ],
  severityBands: [
    { min: 0, max: 0, label: 'Sin riesgo identificado', color: '#22C55E', badgeClass: 'bg-emerald-100 text-emerald-700' },
    { min: 1, max: 2, label: 'Riesgo bajo — Ideación pasiva', color: '#EAB308', badgeClass: 'bg-yellow-100 text-yellow-700' },
    { min: 3, max: 4, label: 'Riesgo moderado — Ideación activa', color: '#F97316', badgeClass: 'bg-orange-100 text-orange-700' },
    { min: 5, max: 6, label: 'Riesgo alto — Plan o conducta suicida', color: '#EF4444', badgeClass: 'bg-red-100 text-red-700' },
  ],
};

// ============================================================================
// REGISTRY
// ============================================================================

export const PSYCHIATRIC_SCALES: Record<string, ScaleDefinition> = {
  phq9: PHQ9,
  gad7: GAD7,
  madrs: MADRS,
  audit: AUDIT,
  cssrs: CSSRS,
};

export const SCALE_LIST = Object.values(PSYCHIATRIC_SCALES);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate total score from responses map.
 */
export function calculateTotalScore(
  scaleId: string,
  responses: Record<string, number>,
): number {
  const scale = PSYCHIATRIC_SCALES[scaleId];
  if (!scale) return 0;
  return scale.questions.reduce((sum, q) => sum + (responses[q.id] ?? 0), 0);
}

/**
 * Get severity band for a given score.
 */
export function getSeverityBand(
  scaleId: string,
  score: number,
): SeverityBand | null {
  const scale = PSYCHIATRIC_SCALES[scaleId];
  if (!scale) return null;
  return scale.severityBands.find((b) => score >= b.min && score <= b.max) ?? null;
}

/**
 * Check if any suicide risk questions have positive responses.
 */
export function hasSuicideRisk(
  scaleId: string,
  responses: Record<string, number>,
): boolean {
  const scale = PSYCHIATRIC_SCALES[scaleId];
  if (!scale) return false;
  return scale.questions
    .filter((q) => q.isSuicideRisk)
    .some((q) => (responses[q.id] ?? 0) > 0);
}

/**
 * Get the completion percentage for a scale.
 */
export function getCompletionPercent(
  scaleId: string,
  responses: Record<string, number>,
): number {
  const scale = PSYCHIATRIC_SCALES[scaleId];
  if (!scale || scale.questions.length === 0) return 0;
  const answered = scale.questions.filter((q) => q.id in responses).length;
  return Math.round((answered / scale.questions.length) * 100);
}
