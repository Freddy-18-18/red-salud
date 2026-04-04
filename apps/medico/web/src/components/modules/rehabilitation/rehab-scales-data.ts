// ============================================================================
// REHABILITATION SCALES DATA
// Embedded functional assessment scales for physical therapy
// ============================================================================

// ============================================================================
// BARTHEL INDEX (0-100)
// ============================================================================

export interface BarthelItem {
  id: string;
  label: string;
  options: Array<{ value: number; label: string }>;
}

export const BARTHEL_ITEMS: BarthelItem[] = [
  {
    id: 'feeding',
    label: 'Alimentación',
    options: [
      { value: 0, label: 'Incapaz' },
      { value: 5, label: 'Necesita ayuda' },
      { value: 10, label: 'Independiente' },
    ],
  },
  {
    id: 'bathing',
    label: 'Baño',
    options: [
      { value: 0, label: 'Dependiente' },
      { value: 5, label: 'Independiente' },
    ],
  },
  {
    id: 'grooming',
    label: 'Aseo personal',
    options: [
      { value: 0, label: 'Necesita ayuda' },
      { value: 5, label: 'Independiente' },
    ],
  },
  {
    id: 'dressing',
    label: 'Vestirse',
    options: [
      { value: 0, label: 'Dependiente' },
      { value: 5, label: 'Necesita ayuda' },
      { value: 10, label: 'Independiente' },
    ],
  },
  {
    id: 'bowels',
    label: 'Control intestinal',
    options: [
      { value: 0, label: 'Incontinente' },
      { value: 5, label: 'Accidente ocasional' },
      { value: 10, label: 'Continente' },
    ],
  },
  {
    id: 'bladder',
    label: 'Control vesical',
    options: [
      { value: 0, label: 'Incontinente' },
      { value: 5, label: 'Accidente ocasional' },
      { value: 10, label: 'Continente' },
    ],
  },
  {
    id: 'toilet',
    label: 'Uso del inodoro',
    options: [
      { value: 0, label: 'Dependiente' },
      { value: 5, label: 'Necesita ayuda' },
      { value: 10, label: 'Independiente' },
    ],
  },
  {
    id: 'transfer',
    label: 'Transferencias (cama-silla)',
    options: [
      { value: 0, label: 'Incapaz' },
      { value: 5, label: 'Gran ayuda (1-2 personas)' },
      { value: 10, label: 'Mínima ayuda' },
      { value: 15, label: 'Independiente' },
    ],
  },
  {
    id: 'mobility',
    label: 'Movilidad',
    options: [
      { value: 0, label: 'Inmóvil' },
      { value: 5, label: 'Independiente en silla de ruedas' },
      { value: 10, label: 'Camina con ayuda' },
      { value: 15, label: 'Independiente' },
    ],
  },
  {
    id: 'stairs',
    label: 'Escaleras',
    options: [
      { value: 0, label: 'Incapaz' },
      { value: 5, label: 'Necesita ayuda' },
      { value: 10, label: 'Independiente' },
    ],
  },
];

export const BARTHEL_MAX_SCORE = 100;

export function classifyBarthel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Dependencia total', color: '#EF4444' };
  if (score <= 40) return { label: 'Dependencia severa', color: '#F97316' };
  if (score <= 60) return { label: 'Dependencia moderada', color: '#EAB308' };
  if (score <= 80) return { label: 'Dependencia leve', color: '#3B82F6' };
  return { label: 'Independiente', color: '#22C55E' };
}

// ============================================================================
// FIM — Functional Independence Measure (18-126)
// ============================================================================

export interface FimItem {
  id: string;
  label: string;
  subscale: 'motor' | 'cognitive';
}

export const FIM_LEVELS = [
  { value: 1, label: 'Asistencia total' },
  { value: 2, label: 'Asistencia máxima' },
  { value: 3, label: 'Asistencia moderada' },
  { value: 4, label: 'Asistencia mínima' },
  { value: 5, label: 'Supervisión' },
  { value: 6, label: 'Independencia modificada' },
  { value: 7, label: 'Independencia completa' },
] as const;

export const FIM_ITEMS: FimItem[] = [
  // Motor subscale (13 items, max 91)
  { id: 'eating', label: 'Alimentación', subscale: 'motor' },
  { id: 'grooming', label: 'Aseo personal', subscale: 'motor' },
  { id: 'bathing', label: 'Baño', subscale: 'motor' },
  { id: 'dressing_upper', label: 'Vestido superior', subscale: 'motor' },
  { id: 'dressing_lower', label: 'Vestido inferior', subscale: 'motor' },
  { id: 'toileting', label: 'Uso del inodoro', subscale: 'motor' },
  { id: 'bladder', label: 'Control vesical', subscale: 'motor' },
  { id: 'bowel', label: 'Control intestinal', subscale: 'motor' },
  { id: 'bed_transfer', label: 'Transferencia cama/silla', subscale: 'motor' },
  { id: 'toilet_transfer', label: 'Transferencia inodoro', subscale: 'motor' },
  { id: 'shower_transfer', label: 'Transferencia ducha/bañera', subscale: 'motor' },
  { id: 'locomotion', label: 'Locomoción', subscale: 'motor' },
  { id: 'stairs', label: 'Escaleras', subscale: 'motor' },
  // Cognitive subscale (5 items, max 35)
  { id: 'comprehension', label: 'Comprensión', subscale: 'cognitive' },
  { id: 'expression', label: 'Expresión', subscale: 'cognitive' },
  { id: 'social_interaction', label: 'Interacción social', subscale: 'cognitive' },
  { id: 'problem_solving', label: 'Resolución de problemas', subscale: 'cognitive' },
  { id: 'memory', label: 'Memoria', subscale: 'cognitive' },
];

export const FIM_MOTOR_MAX = 91;
export const FIM_COGNITIVE_MAX = 35;
export const FIM_TOTAL_MAX = 126;

export function classifyFim(total: number): { label: string; color: string } {
  if (total <= 36) return { label: 'Dependencia completa', color: '#EF4444' };
  if (total <= 72) return { label: 'Dependencia moderada', color: '#F97316' };
  if (total <= 108) return { label: 'Dependencia leve', color: '#EAB308' };
  return { label: 'Independencia', color: '#22C55E' };
}

// ============================================================================
// VAS PAIN SCALE (0-10)
// ============================================================================

export const VAS_MAX = 10;

export function classifyVas(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Sin dolor', color: '#22C55E' };
  if (score <= 3) return { label: 'Dolor leve', color: '#84CC16' };
  if (score <= 6) return { label: 'Dolor moderado', color: '#EAB308' };
  if (score <= 8) return { label: 'Dolor severo', color: '#F97316' };
  return { label: 'Dolor insoportable', color: '#EF4444' };
}

// ============================================================================
// ROM — Range of Motion Reference Values
// ============================================================================

export interface RomMovement {
  id: string;
  label: string;
  normalMin: number;
  normalMax: number;
}

export interface RomJoint {
  id: string;
  label: string;
  movements: RomMovement[];
}

export const ROM_JOINTS: RomJoint[] = [
  {
    id: 'shoulder',
    label: 'Hombro',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 180 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 60 },
      { id: 'abduction', label: 'Abducción', normalMin: 0, normalMax: 180 },
      { id: 'adduction', label: 'Aducción', normalMin: 0, normalMax: 45 },
      { id: 'internal_rotation', label: 'Rotación interna', normalMin: 0, normalMax: 70 },
      { id: 'external_rotation', label: 'Rotación externa', normalMin: 0, normalMax: 90 },
    ],
  },
  {
    id: 'elbow',
    label: 'Codo',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 150 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 0 },
      { id: 'pronation', label: 'Pronación', normalMin: 0, normalMax: 80 },
      { id: 'supination', label: 'Supinación', normalMin: 0, normalMax: 80 },
    ],
  },
  {
    id: 'wrist',
    label: 'Muñeca',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 80 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 70 },
      { id: 'radial_deviation', label: 'Desviación radial', normalMin: 0, normalMax: 20 },
      { id: 'ulnar_deviation', label: 'Desviación cubital', normalMin: 0, normalMax: 30 },
    ],
  },
  {
    id: 'hip',
    label: 'Cadera',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 120 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 30 },
      { id: 'abduction', label: 'Abducción', normalMin: 0, normalMax: 45 },
      { id: 'adduction', label: 'Aducción', normalMin: 0, normalMax: 30 },
      { id: 'internal_rotation', label: 'Rotación interna', normalMin: 0, normalMax: 35 },
      { id: 'external_rotation', label: 'Rotación externa', normalMin: 0, normalMax: 45 },
    ],
  },
  {
    id: 'knee',
    label: 'Rodilla',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 135 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 0 },
    ],
  },
  {
    id: 'ankle',
    label: 'Tobillo',
    movements: [
      { id: 'dorsiflexion', label: 'Dorsiflexión', normalMin: 0, normalMax: 20 },
      { id: 'plantarflexion', label: 'Flexión plantar', normalMin: 0, normalMax: 50 },
      { id: 'inversion', label: 'Inversión', normalMin: 0, normalMax: 35 },
      { id: 'eversion', label: 'Eversión', normalMin: 0, normalMax: 15 },
    ],
  },
  {
    id: 'cervical',
    label: 'Cervical',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 45 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 45 },
      { id: 'lateral_flexion', label: 'Flexión lateral', normalMin: 0, normalMax: 45 },
      { id: 'rotation', label: 'Rotación', normalMin: 0, normalMax: 60 },
    ],
  },
  {
    id: 'lumbar',
    label: 'Lumbar',
    movements: [
      { id: 'flexion', label: 'Flexión', normalMin: 0, normalMax: 60 },
      { id: 'extension', label: 'Extensión', normalMin: 0, normalMax: 25 },
      { id: 'lateral_flexion', label: 'Flexión lateral', normalMin: 0, normalMax: 25 },
      { id: 'rotation', label: 'Rotación', normalMin: 0, normalMax: 30 },
    ],
  },
];

// ============================================================================
// MMT — Manual Muscle Testing (0/5 to 5/5)
// ============================================================================

export interface MmtGrade {
  value: number;
  label: string;
  description: string;
  color: string;
}

export const MMT_GRADES: MmtGrade[] = [
  { value: 0, label: '0/5', description: 'Sin contracción visible', color: '#EF4444' },
  { value: 1, label: '1/5', description: 'Contracción visible sin movimiento', color: '#EF4444' },
  { value: 2, label: '2/5', description: 'Movimiento sin gravedad', color: '#F97316' },
  { value: 3, label: '3/5', description: 'Movimiento contra gravedad', color: '#EAB308' },
  { value: 4, label: '4/5', description: 'Movimiento contra resistencia moderada', color: '#22C55E' },
  { value: 5, label: '5/5', description: 'Fuerza normal', color: '#16A34A' },
];

export function getMmtColor(grade: number): string {
  if (grade <= 2) return '#EF4444';
  if (grade === 3) return '#EAB308';
  return '#22C55E';
}

export interface MuscleGroup {
  id: string;
  label: string;
  region: string;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  // Cuello
  { id: 'neck_flexors', label: 'Flexores del cuello', region: 'Cuello' },
  { id: 'neck_extensors', label: 'Extensores del cuello', region: 'Cuello' },
  // Hombro
  { id: 'deltoid', label: 'Deltoides', region: 'Hombro' },
  { id: 'supraspinatus', label: 'Supraespinoso', region: 'Hombro' },
  { id: 'infraspinatus', label: 'Infraespinoso', region: 'Hombro' },
  { id: 'pectoralis_major', label: 'Pectoral mayor', region: 'Hombro' },
  { id: 'latissimus_dorsi', label: 'Dorsal ancho', region: 'Hombro' },
  { id: 'trapezius', label: 'Trapecio', region: 'Hombro' },
  // Brazo
  { id: 'biceps', label: 'Bíceps', region: 'Brazo' },
  { id: 'triceps', label: 'Tríceps', region: 'Brazo' },
  { id: 'brachioradialis', label: 'Braquiorradial', region: 'Brazo' },
  // Antebrazo/Mano
  { id: 'wrist_flexors', label: 'Flexores de muñeca', region: 'Antebrazo' },
  { id: 'wrist_extensors', label: 'Extensores de muñeca', region: 'Antebrazo' },
  { id: 'grip', label: 'Prensión', region: 'Antebrazo' },
  // Tronco
  { id: 'abdominals', label: 'Abdominales', region: 'Tronco' },
  { id: 'erector_spinae', label: 'Erectores espinales', region: 'Tronco' },
  { id: 'obliques', label: 'Oblicuos', region: 'Tronco' },
  // Cadera
  { id: 'iliopsoas', label: 'Iliopsoas', region: 'Cadera' },
  { id: 'gluteus_maximus', label: 'Glúteo mayor', region: 'Cadera' },
  { id: 'gluteus_medius', label: 'Glúteo medio', region: 'Cadera' },
  { id: 'hip_adductors', label: 'Aductores de cadera', region: 'Cadera' },
  // Muslo
  { id: 'quadriceps', label: 'Cuádriceps', region: 'Muslo' },
  { id: 'hamstrings', label: 'Isquiotibiales', region: 'Muslo' },
  // Pierna
  { id: 'tibialis_anterior', label: 'Tibial anterior', region: 'Pierna' },
  { id: 'gastrocnemius', label: 'Gastrocnemio', region: 'Pierna' },
  { id: 'soleus', label: 'Sóleo', region: 'Pierna' },
  { id: 'peroneals', label: 'Peroneos', region: 'Pierna' },
];

// ============================================================================
// BERG BALANCE SCALE (0-56)
// ============================================================================

export interface BergItem {
  id: string;
  label: string;
  options: Array<{ value: number; label: string }>;
}

export const BERG_ITEMS: BergItem[] = [
  {
    id: 'sit_to_stand',
    label: 'De sentado a de pie',
    options: [
      { value: 0, label: 'Necesita asistencia moderada o máxima' },
      { value: 1, label: 'Necesita asistencia mínima' },
      { value: 2, label: 'Capaz usando las manos tras varios intentos' },
      { value: 3, label: 'Capaz independientemente usando las manos' },
      { value: 4, label: 'Capaz sin usar las manos y se estabiliza' },
    ],
  },
  {
    id: 'standing_unsupported',
    label: 'De pie sin apoyo',
    options: [
      { value: 0, label: 'Incapaz de estar 30 segundos sin asistencia' },
      { value: 1, label: 'Necesita varios intentos para 30 segundos' },
      { value: 2, label: 'Capaz de estar 30 segundos sin apoyo' },
      { value: 3, label: 'Capaz de estar 2 minutos con supervisión' },
      { value: 4, label: 'Capaz de estar 2 minutos de forma segura' },
    ],
  },
  {
    id: 'sitting_unsupported',
    label: 'Sentado sin apoyo',
    options: [
      { value: 0, label: 'Incapaz de sentarse 10 segundos sin apoyo' },
      { value: 1, label: 'Capaz de sentarse 10 segundos' },
      { value: 2, label: 'Capaz de sentarse 30 segundos' },
      { value: 3, label: 'Capaz de sentarse 2 minutos con supervisión' },
      { value: 4, label: 'Capaz de sentarse de forma segura 2 minutos' },
    ],
  },
  {
    id: 'stand_to_sit',
    label: 'De pie a sentado',
    options: [
      { value: 0, label: 'Necesita asistencia para sentarse' },
      { value: 1, label: 'Se sienta independientemente pero desciende sin control' },
      { value: 2, label: 'Usa piernas para controlar el descenso' },
      { value: 3, label: 'Controla el descenso usando las manos' },
      { value: 4, label: 'Se sienta de forma segura con uso mínimo de manos' },
    ],
  },
  {
    id: 'transfers',
    label: 'Transferencias',
    options: [
      { value: 0, label: 'Necesita dos personas para asistir o supervisar' },
      { value: 1, label: 'Necesita una persona para asistir' },
      { value: 2, label: 'Capaz con indicaciones verbales o supervisión' },
      { value: 3, label: 'Capaz con uso de manos' },
      { value: 4, label: 'Capaz de forma segura con uso mínimo de manos' },
    ],
  },
  {
    id: 'standing_eyes_closed',
    label: 'De pie con ojos cerrados',
    options: [
      { value: 0, label: 'Necesita ayuda para no caerse' },
      { value: 1, label: 'Incapaz de mantener ojos cerrados 3 segundos' },
      { value: 2, label: 'Capaz de mantener 3 segundos' },
      { value: 3, label: 'Capaz de mantener 10 segundos con supervisión' },
      { value: 4, label: 'Capaz de mantener 10 segundos de forma segura' },
    ],
  },
  {
    id: 'standing_feet_together',
    label: 'De pie con pies juntos',
    options: [
      { value: 0, label: 'Necesita ayuda y no puede mantener 15 segundos' },
      { value: 1, label: 'Necesita ayuda para posición pero mantiene 15 seg.' },
      { value: 2, label: 'Capaz de juntar pies pero no mantener 30 seg.' },
      { value: 3, label: 'Capaz independientemente 1 minuto con supervisión' },
      { value: 4, label: 'Capaz de juntar pies y mantener 1 minuto seguro' },
    ],
  },
  {
    id: 'reaching_forward',
    label: 'Alcanzar hacia adelante con brazo extendido',
    options: [
      { value: 0, label: 'Pierde el equilibrio al intentar / necesita apoyo' },
      { value: 1, label: 'Alcanza hacia adelante pero necesita supervisión' },
      { value: 2, label: 'Puede alcanzar >5 cm hacia adelante' },
      { value: 3, label: 'Puede alcanzar >12 cm hacia adelante' },
      { value: 4, label: 'Puede alcanzar >25 cm cómodamente' },
    ],
  },
  {
    id: 'pick_up_object',
    label: 'Recoger objeto del suelo',
    options: [
      { value: 0, label: 'Incapaz / necesita asistencia' },
      { value: 1, label: 'Incapaz de recoger, necesita supervisión al intentar' },
      { value: 2, label: 'Incapaz de recoger pero se acerca a 2-5 cm' },
      { value: 3, label: 'Capaz de recoger pero necesita supervisión' },
      { value: 4, label: 'Capaz de recoger de forma fácil y segura' },
    ],
  },
  {
    id: 'turning_look_behind',
    label: 'Girarse para mirar atrás',
    options: [
      { value: 0, label: 'Necesita asistencia para no perder equilibrio' },
      { value: 1, label: 'Necesita supervisión al girar' },
      { value: 2, label: 'Gira solo hacia un lado' },
      { value: 3, label: 'Mira hacia atrás solo un lado, peso mal distribuido' },
      { value: 4, label: 'Mira hacia atrás ambos lados, peso bien distribuido' },
    ],
  },
  {
    id: 'turn_360',
    label: 'Girar 360 grados',
    options: [
      { value: 0, label: 'Necesita asistencia al girar' },
      { value: 1, label: 'Necesita supervisión cercana o indicaciones' },
      { value: 2, label: 'Capaz de girar 360 de forma segura pero lenta' },
      { value: 3, label: 'Capaz de girar 360 de forma segura solo un lado en <4s' },
      { value: 4, label: 'Capaz de girar 360 seguro en <4s cada lado' },
    ],
  },
  {
    id: 'stool_stepping',
    label: 'Colocar pies alternos en escalón',
    options: [
      { value: 0, label: 'Necesita asistencia / incapaz' },
      { value: 1, label: 'Capaz de completar >2 pasos, necesita asistencia mínima' },
      { value: 2, label: 'Capaz de completar 4 pasos sin ayuda con supervisión' },
      { value: 3, label: 'Capaz de estar de pie y completar 8 pasos en >20s' },
      { value: 4, label: 'Capaz de completar 8 pasos en 20 segundos' },
    ],
  },
  {
    id: 'tandem_standing',
    label: 'De pie con un pie adelante (tándem)',
    options: [
      { value: 0, label: 'Pierde equilibrio al dar paso o pararse' },
      { value: 1, label: 'Necesita ayuda para dar paso pero mantiene 15 seg.' },
      { value: 2, label: 'Capaz de dar medio paso y mantener 30 seg.' },
      { value: 3, label: 'Capaz de colocar pie adelante y mantener 30 seg.' },
      { value: 4, label: 'Capaz de colocar pie en tándem y mantener 30 seg.' },
    ],
  },
  {
    id: 'one_leg_standing',
    label: 'De pie sobre una pierna',
    options: [
      { value: 0, label: 'Incapaz o necesita asistencia' },
      { value: 1, label: 'Intenta levantar pierna, incapaz >3 seg.' },
      { value: 2, label: 'Capaz de levantar pierna >3 segundos' },
      { value: 3, label: 'Capaz de levantar pierna >5 segundos' },
      { value: 4, label: 'Capaz de levantar pierna >10 segundos' },
    ],
  },
];

export const BERG_MAX_SCORE = 56;

export function classifyBerg(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Alto riesgo de caída', color: '#EF4444' };
  if (score <= 40) return { label: 'Riesgo moderado de caída', color: '#EAB308' };
  return { label: 'Bajo riesgo de caída', color: '#22C55E' };
}

// ============================================================================
// SCALE TYPES (for generic handling)
// ============================================================================

export type ScaleType = 'barthel' | 'fim' | 'berg' | 'vas';

export interface ScaleMetadata {
  id: ScaleType;
  label: string;
  maxScore: number;
  classify: (score: number) => { label: string; color: string };
}

export const SCALES: ScaleMetadata[] = [
  { id: 'barthel', label: 'Índice de Barthel', maxScore: BARTHEL_MAX_SCORE, classify: classifyBarthel },
  { id: 'fim', label: 'FIM', maxScore: FIM_TOTAL_MAX, classify: classifyFim },
  { id: 'berg', label: 'Escala de Berg', maxScore: BERG_MAX_SCORE, classify: classifyBerg },
  { id: 'vas', label: 'Escala Visual Analógica (EVA)', maxScore: VAS_MAX, classify: classifyVas },
];
