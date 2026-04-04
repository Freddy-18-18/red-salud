// ============================================================================
// NEUROLOGY SCALES DATA
// Glasgow Coma Scale, NIHSS, Modified Rankin, MMSE
// ============================================================================

// ============================================================================
// GLASGOW COMA SCALE (3-15)
// ============================================================================

export interface GcsComponent {
  id: 'eye' | 'verbal' | 'motor';
  label: string;
  options: Array<{ value: number; label: string }>;
}

export const GCS_COMPONENTS: GcsComponent[] = [
  {
    id: 'eye',
    label: 'Apertura Ocular',
    options: [
      { value: 1, label: 'Sin apertura' },
      { value: 2, label: 'Al dolor' },
      { value: 3, label: 'Al comando verbal' },
      { value: 4, label: 'Espontanea' },
    ],
  },
  {
    id: 'verbal',
    label: 'Respuesta Verbal',
    options: [
      { value: 1, label: 'Sin respuesta' },
      { value: 2, label: 'Sonidos incomprensibles' },
      { value: 3, label: 'Palabras inapropiadas' },
      { value: 4, label: 'Confusa' },
      { value: 5, label: 'Orientada' },
    ],
  },
  {
    id: 'motor',
    label: 'Respuesta Motora',
    options: [
      { value: 1, label: 'Sin respuesta' },
      { value: 2, label: 'Extension (descerebrado)' },
      { value: 3, label: 'Flexion anormal (decorticado)' },
      { value: 4, label: 'Retiro al dolor' },
      { value: 5, label: 'Localiza el dolor' },
      { value: 6, label: 'Obedece ordenes' },
    ],
  },
];

export const GCS_MIN = 3;
export const GCS_MAX = 15;

export interface GcsSeverity {
  label: string;
  color: string;
}

export function classifyGcs(total: number): GcsSeverity {
  if (total >= 13) return { label: 'Leve', color: '#22C55E' };
  if (total >= 9) return { label: 'Moderado', color: '#EAB308' };
  return { label: 'Severo', color: '#EF4444' };
}

/**
 * Generate quick documentation string: "GCS 14 (E4 V4 M6)"
 */
export function formatGcsString(eye: number, verbal: number, motor: number): string {
  const total = eye + verbal + motor;
  return `GCS ${total} (E${eye} V${verbal} M${motor})`;
}

// ============================================================================
// NIHSS — National Institutes of Health Stroke Scale (0-42)
// ============================================================================

export interface NihssItem {
  id: string;
  number: string;
  label: string;
  options: Array<{ value: number; label: string }>;
}

export const NIHSS_ITEMS: NihssItem[] = [
  {
    id: '1a',
    number: '1a',
    label: 'Nivel de conciencia',
    options: [
      { value: 0, label: 'Alerta' },
      { value: 1, label: 'No alerta, responde a estimulacion menor' },
      { value: 2, label: 'No alerta, requiere estimulacion repetida' },
      { value: 3, label: 'Respuestas reflejas o sin respuesta' },
    ],
  },
  {
    id: '1b',
    number: '1b',
    label: 'Preguntas de orientacion (mes y edad)',
    options: [
      { value: 0, label: 'Ambas correctas' },
      { value: 1, label: 'Una correcta' },
      { value: 2, label: 'Ninguna correcta' },
    ],
  },
  {
    id: '1c',
    number: '1c',
    label: 'Ordenes motoras (cerrar ojos, empunar mano)',
    options: [
      { value: 0, label: 'Ambas correctas' },
      { value: 1, label: 'Una correcta' },
      { value: 2, label: 'Ninguna correcta' },
    ],
  },
  {
    id: '2',
    number: '2',
    label: 'Mirada conjugada',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Paralisis parcial de la mirada' },
      { value: 2, label: 'Desviacion forzada de la mirada' },
    ],
  },
  {
    id: '3',
    number: '3',
    label: 'Campos visuales',
    options: [
      { value: 0, label: 'Sin deficit' },
      { value: 1, label: 'Hemianopsia parcial' },
      { value: 2, label: 'Hemianopsia completa' },
      { value: 3, label: 'Hemianopsia bilateral (ceguera)' },
    ],
  },
  {
    id: '4',
    number: '4',
    label: 'Paralisis facial',
    options: [
      { value: 0, label: 'Movimientos normales simetricos' },
      { value: 1, label: 'Paralisis menor (pliegue nasolabial aplanado)' },
      { value: 2, label: 'Paralisis parcial (hemicara inferior)' },
      { value: 3, label: 'Paralisis completa (unilateral o bilateral)' },
    ],
  },
  {
    id: '5a',
    number: '5a',
    label: 'Fuerza brazo izquierdo (mantener 10 seg.)',
    options: [
      { value: 0, label: 'Sin caida' },
      { value: 1, label: 'Caida antes de 10 segundos' },
      { value: 2, label: 'Algun esfuerzo contra gravedad' },
      { value: 3, label: 'Sin esfuerzo contra gravedad, cae' },
      { value: 4, label: 'Sin movimiento' },
    ],
  },
  {
    id: '5b',
    number: '5b',
    label: 'Fuerza brazo derecho (mantener 10 seg.)',
    options: [
      { value: 0, label: 'Sin caida' },
      { value: 1, label: 'Caida antes de 10 segundos' },
      { value: 2, label: 'Algun esfuerzo contra gravedad' },
      { value: 3, label: 'Sin esfuerzo contra gravedad, cae' },
      { value: 4, label: 'Sin movimiento' },
    ],
  },
  {
    id: '6a',
    number: '6a',
    label: 'Fuerza pierna izquierda (mantener 5 seg.)',
    options: [
      { value: 0, label: 'Sin caida' },
      { value: 1, label: 'Caida antes de 5 segundos' },
      { value: 2, label: 'Algun esfuerzo contra gravedad' },
      { value: 3, label: 'Sin esfuerzo contra gravedad, cae' },
      { value: 4, label: 'Sin movimiento' },
    ],
  },
  {
    id: '6b',
    number: '6b',
    label: 'Fuerza pierna derecha (mantener 5 seg.)',
    options: [
      { value: 0, label: 'Sin caida' },
      { value: 1, label: 'Caida antes de 5 segundos' },
      { value: 2, label: 'Algun esfuerzo contra gravedad' },
      { value: 3, label: 'Sin esfuerzo contra gravedad, cae' },
      { value: 4, label: 'Sin movimiento' },
    ],
  },
  {
    id: '7',
    number: '7',
    label: 'Ataxia de extremidades',
    options: [
      { value: 0, label: 'Ausente' },
      { value: 1, label: 'Presente en una extremidad' },
      { value: 2, label: 'Presente en dos extremidades' },
    ],
  },
  {
    id: '8',
    number: '8',
    label: 'Sensibilidad',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Hipoestesia leve a moderada' },
      { value: 2, label: 'Anestesia severa o total' },
    ],
  },
  {
    id: '9',
    number: '9',
    label: 'Lenguaje',
    options: [
      { value: 0, label: 'Sin afasia' },
      { value: 1, label: 'Afasia leve a moderada' },
      { value: 2, label: 'Afasia severa (Broca/Wernicke)' },
      { value: 3, label: 'Mutismo o afasia global' },
    ],
  },
  {
    id: '10',
    number: '10',
    label: 'Disartria',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Leve a moderada' },
      { value: 2, label: 'Severa (ininteligible o mudo)' },
    ],
  },
  {
    id: '11',
    number: '11',
    label: 'Extincion / Inatención',
    options: [
      { value: 0, label: 'Sin alteracion' },
      { value: 1, label: 'Inatención en una modalidad' },
      { value: 2, label: 'Inatención severa o en mas de una modalidad' },
    ],
  },
];

export const NIHSS_MAX = 42;

export function classifyNihss(total: number): { label: string; color: string } {
  if (total === 0) return { label: 'Sin deficit', color: '#22C55E' };
  if (total <= 4) return { label: 'Deficit menor', color: '#84CC16' };
  if (total <= 15) return { label: 'Deficit moderado', color: '#EAB308' };
  if (total <= 20) return { label: 'Deficit moderado-severo', color: '#F97316' };
  return { label: 'Deficit severo', color: '#EF4444' };
}

// ============================================================================
// MODIFIED RANKIN SCALE (0-6)
// ============================================================================

export interface RankinLevel {
  value: number;
  label: string;
  description: string;
  color: string;
}

export const RANKIN_LEVELS: RankinLevel[] = [
  { value: 0, label: '0 — Sin sintomas', description: 'Sin sintomas en absoluto', color: '#22C55E' },
  { value: 1, label: '1 — Sin discapacidad significativa', description: 'Capaz de realizar todas las actividades habituales a pesar de los sintomas', color: '#84CC16' },
  { value: 2, label: '2 — Discapacidad leve', description: 'Incapaz de realizar todas las actividades previas, pero capaz de cuidar de si mismo sin asistencia', color: '#EAB308' },
  { value: 3, label: '3 — Discapacidad moderada', description: 'Requiere algo de ayuda, pero capaz de caminar sin asistencia', color: '#F97316' },
  { value: 4, label: '4 — Discapacidad moderada-severa', description: 'Incapaz de caminar sin asistencia e incapaz de atender sus necesidades corporales sin asistencia', color: '#EF4444' },
  { value: 5, label: '5 — Discapacidad severa', description: 'En cama, incontinente, requiere cuidado de enfermeria constante', color: '#DC2626' },
  { value: 6, label: '6 — Muerto', description: 'Muerto', color: '#1F2937' },
];

export const RANKIN_MAX = 6;

// ============================================================================
// MMSE — Mini-Mental State Examination (0-30)
// ============================================================================

export interface MmseItem {
  id: string;
  domain: string;
  label: string;
  maxScore: number;
  description: string;
}

export const MMSE_DOMAINS = [
  'Orientacion',
  'Registro',
  'Atencion y Calculo',
  'Evocacion',
  'Lenguaje',
] as const;

export const MMSE_ITEMS: MmseItem[] = [
  // Orientacion (10 puntos)
  { id: 'orient_time', domain: 'Orientacion', label: 'Orientacion temporal', maxScore: 5, description: 'Ano, estacion, mes, dia de la semana, fecha (1 punto c/u)' },
  { id: 'orient_place', domain: 'Orientacion', label: 'Orientacion espacial', maxScore: 5, description: 'Pais, estado, ciudad, hospital, piso (1 punto c/u)' },
  // Registro (3 puntos)
  { id: 'register', domain: 'Registro', label: 'Registro de 3 palabras', maxScore: 3, description: 'Repetir 3 palabras: arbol, mesa, avion (1 punto c/u)' },
  // Atencion y Calculo (5 puntos)
  { id: 'attention', domain: 'Atencion y Calculo', label: 'Serie de 7 o deletreo inverso', maxScore: 5, description: '100-7, 93-7, 86-7, 79-7, 72-7 (o MUNDO al reves)' },
  // Evocacion (3 puntos)
  { id: 'recall', domain: 'Evocacion', label: 'Evocacion de 3 palabras', maxScore: 3, description: 'Recordar las 3 palabras del registro (1 punto c/u)' },
  // Lenguaje (9 puntos)
  { id: 'naming', domain: 'Lenguaje', label: 'Denominacion', maxScore: 2, description: 'Nombrar un lapiz y un reloj' },
  { id: 'repetition', domain: 'Lenguaje', label: 'Repeticion', maxScore: 1, description: 'Repetir: "Ni si, ni no, ni pero"' },
  { id: 'command', domain: 'Lenguaje', label: 'Orden de 3 pasos', maxScore: 3, description: 'Tome el papel con la mano derecha, doblelo por la mitad y pongalo en el suelo' },
  { id: 'reading', domain: 'Lenguaje', label: 'Lectura', maxScore: 1, description: 'Lea y obedezca: "Cierre los ojos"' },
  { id: 'writing', domain: 'Lenguaje', label: 'Escritura', maxScore: 1, description: 'Escribir una frase espontanea con sujeto y verbo' },
  { id: 'drawing', domain: 'Lenguaje', label: 'Copia de dibujo', maxScore: 1, description: 'Copiar dos pentagonos entrelazados' },
];

export const MMSE_MAX = 30;

export function classifyMmse(total: number): { label: string; color: string } {
  if (total >= 27) return { label: 'Normal', color: '#22C55E' };
  if (total >= 24) return { label: 'Deterioro cognitivo leve', color: '#EAB308' };
  if (total >= 18) return { label: 'Deterioro cognitivo moderado', color: '#F97316' };
  return { label: 'Deterioro cognitivo severo', color: '#EF4444' };
}

// ============================================================================
// SCALE TYPE DEFINITIONS
// ============================================================================

export type NeurologyScaleType = 'glasgow' | 'nihss' | 'rankin' | 'mmse';

export interface NeurologyScaleMetadata {
  id: NeurologyScaleType;
  label: string;
  maxScore: number;
  icon: string;
}

export const NEUROLOGY_SCALES: NeurologyScaleMetadata[] = [
  { id: 'glasgow', label: 'Escala de Glasgow', maxScore: GCS_MAX, icon: 'Brain' },
  { id: 'nihss', label: 'NIHSS', maxScore: NIHSS_MAX, icon: 'Activity' },
  { id: 'rankin', label: 'Rankin Modificada', maxScore: RANKIN_MAX, icon: 'Accessibility' },
  { id: 'mmse', label: 'Mini-Mental (MMSE)', maxScore: MMSE_MAX, icon: 'BrainCircuit' },
];
