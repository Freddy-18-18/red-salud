/**
 * @file overrides/fisioterapia.ts
 * @description Override de configuración para Fisioterapia.
 *
 * Módulos especializados: mediciones de ROM, graduación de fuerza (MRC),
 * análisis de marcha, escalas de dolor (VAS/NRS), evaluaciones funcionales
 * (FIM), prescripción de ejercicio.
 *
 * También exporta constantes de dominio: escala MRC,
 * articulaciones ROM, escala FIM.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Fisioterapia.
 * Especialidad centrada en rehabilitación física, valoración funcional
 * y prescripción de programas de ejercicio terapéutico.
 */
export const fisioterapiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'fisioterapia',
  dashboardPath: '/dashboard/medico/fisioterapia',

  modules: {
    clinical: [
      {
        key: 'fisio-consulta',
        label: 'Evaluación Fisioterapéutica',
        icon: 'Dumbbell',
        route: '/dashboard/medico/fisioterapia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación inicial, historia funcional, exploración física',
      },
      {
        key: 'fisio-rom',
        label: 'Medición de ROM',
        icon: 'Ruler',
        route: '/dashboard/medico/fisioterapia/rom',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['rom_improvement'],
        description: 'Goniometría, rango de movimiento articular activo y pasivo',
      },
      {
        key: 'fisio-fuerza',
        label: 'Graduación de Fuerza (MRC)',
        icon: 'Gauge',
        route: '/dashboard/medico/fisioterapia/fuerza',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Escala MRC 0-5, dinamometría, test muscular manual',
      },
      {
        key: 'fisio-marcha',
        label: 'Análisis de Marcha',
        icon: 'Footprints',
        route: '/dashboard/medico/fisioterapia/marcha',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Observacional y/o instrumentado, Timed Up and Go, 6MWT',
      },
      {
        key: 'fisio-dolor',
        label: 'Escalas de Dolor (VAS / NRS)',
        icon: 'Thermometer',
        route: '/dashboard/medico/fisioterapia/dolor',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['pain_reduction'],
        description: 'Visual Analog Scale, Numeric Rating Scale, mapa de dolor',
      },
      {
        key: 'fisio-funcional',
        label: 'Evaluación Funcional (FIM)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/fisioterapia/funcional',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['functional_independence'],
        description: 'Functional Independence Measure, Barthel, Berg Balance',
      },
      {
        key: 'fisio-ejercicio',
        label: 'Prescripción de Ejercicio',
        icon: 'ListChecks',
        route: '/dashboard/medico/fisioterapia/ejercicio',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Programa de ejercicio terapéutico, progresión, domiciliario',
      },
    ],

    financial: [
      {
        key: 'fisio-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/fisioterapia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'fisio-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/fisioterapia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'fisio-telemedicina',
        label: 'Telerehabilitación',
        icon: 'Video',
        route: '/dashboard/medico/fisioterapia/telerehabilitacion',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'fisio-videos',
        label: 'Biblioteca de Ejercicios',
        icon: 'PlayCircle',
        route: '/dashboard/medico/fisioterapia/videos',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Videos demostrativos, fichas de ejercicio para el paciente',
      },
    ],

    communication: [
      {
        key: 'fisio-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/fisioterapia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'fisio-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/fisioterapia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'fisio-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/fisioterapia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'rom-progress',
      component: '@/components/dashboard/medico/fisioterapia/widgets/rom-progress-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'pain-tracking',
      component: '@/components/dashboard/medico/fisioterapia/widgets/pain-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'exercise-compliance',
      component: '@/components/dashboard/medico/fisioterapia/widgets/exercise-compliance-widget',
      size: 'medium',
    },
    {
      key: 'functional-scores',
      component: '@/components/dashboard/medico/fisioterapia/widgets/functional-scores-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'rom_improvement',
    'pain_reduction',
    'functional_independence',
    'sessions_completed',
    'exercise_adherence',
    'discharge_rate',
  ],

  kpiDefinitions: {
    rom_improvement: {
      label: 'Mejora de ROM (%)',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    pain_reduction: {
      label: 'Reducción de Dolor (VAS)',
      format: 'number',
      direction: 'higher_is_better',
    },
    functional_independence: {
      label: 'Independencia Funcional (FIM)',
      format: 'number',
      direction: 'higher_is_better',
    },
    sessions_completed: {
      label: 'Sesiones Completadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    exercise_adherence: {
      label: 'Adherencia a Ejercicios',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    discharge_rate: {
      label: 'Tasa de Alta por Cumplimiento de Objetivos',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'sesion_tratamiento',
      'reevaluacion',
      'alta_fisioterapia',
      'telerehabilitacion',
      'sesion_grupal',
      'evaluacion_ergonomica',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_fisioterapeutica',
      'medicion_rom',
      'test_muscular_manual',
      'analisis_marcha',
      'evaluacion_funcional',
      'programa_ejercicio',
      'nota_evolucion',
      'informe_alta',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksROM: true,
      usesStrengthGrading: true,
      supportsGaitAnalysis: true,
      tracksPainScales: true,
      usesFunctionalAssessments: true,
      prescribesExercise: true,
      supportsTelerehabilitation: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#4ADE80',
    icon: 'Dumbbell',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — FISIOTERAPIA
// ============================================================================

/**
 * Escala MRC (Medical Research Council) de Fuerza Muscular
 */
export const MRC_STRENGTH_SCALE = [
  { grade: 0, label: 'Sin contracción', description: 'Parálisis total' },
  { grade: 1, label: 'Contracción visible/palpable', description: 'Sin movimiento articular' },
  { grade: 2, label: 'Movimiento activo sin gravedad', description: 'Movimiento solo en plano horizontal' },
  { grade: 3, label: 'Movimiento activo contra gravedad', description: 'Rango completo contra gravedad, sin resistencia' },
  { grade: 4, label: 'Movimiento contra resistencia', description: 'Rango completo contra gravedad y resistencia parcial' },
  { grade: 5, label: 'Fuerza normal', description: 'Rango completo contra gravedad y resistencia máxima' },
] as const;

/**
 * Articulaciones principales para medición de ROM
 */
export const ROM_JOINTS = [
  { key: 'shoulder', label: 'Hombro', movements: ['Flexión (0-180°)', 'Extensión (0-60°)', 'Abducción (0-180°)', 'Rotación interna (0-70°)', 'Rotación externa (0-90°)'] },
  { key: 'elbow', label: 'Codo', movements: ['Flexión (0-150°)', 'Extensión (150-0°)', 'Pronación (0-80°)', 'Supinación (0-80°)'] },
  { key: 'wrist', label: 'Muñeca', movements: ['Flexión (0-80°)', 'Extensión (0-70°)', 'Desviación radial (0-20°)', 'Desviación cubital (0-30°)'] },
  { key: 'hip', label: 'Cadera', movements: ['Flexión (0-125°)', 'Extensión (0-15°)', 'Abducción (0-45°)', 'Aducción (0-30°)', 'Rotación interna (0-40°)', 'Rotación externa (0-45°)'] },
  { key: 'knee', label: 'Rodilla', movements: ['Flexión (0-135°)', 'Extensión (135-0°)'] },
  { key: 'ankle', label: 'Tobillo', movements: ['Dorsiflexión (0-20°)', 'Plantiflexión (0-50°)', 'Inversión (0-35°)', 'Eversión (0-15°)'] },
  { key: 'cervical', label: 'Columna Cervical', movements: ['Flexión (0-45°)', 'Extensión (0-45°)', 'Lateralización (0-45°)', 'Rotación (0-60°)'] },
  { key: 'lumbar', label: 'Columna Lumbar', movements: ['Flexión (0-60°)', 'Extensión (0-25°)', 'Lateralización (0-25°)', 'Rotación (0-30°)'] },
] as const;

/**
 * Categorías de la escala FIM (Functional Independence Measure)
 * 18 ítems, 1-7 cada uno (total 18-126)
 */
export const FIM_CATEGORIES = {
  selfCare: {
    label: 'Autocuidado',
    items: [
      { key: 'eating', label: 'Alimentación' },
      { key: 'grooming', label: 'Aseo personal' },
      { key: 'bathing', label: 'Baño' },
      { key: 'dressing_upper', label: 'Vestido superior' },
      { key: 'dressing_lower', label: 'Vestido inferior' },
      { key: 'toileting', label: 'Aseo perineal' },
    ],
  },
  sphincterControl: {
    label: 'Control de Esfínteres',
    items: [
      { key: 'bladder', label: 'Vejiga' },
      { key: 'bowel', label: 'Intestino' },
    ],
  },
  transfers: {
    label: 'Transferencias',
    items: [
      { key: 'bed_chair', label: 'Cama/silla/silla de ruedas' },
      { key: 'toilet', label: 'Inodoro' },
      { key: 'tub_shower', label: 'Bañera/ducha' },
    ],
  },
  locomotion: {
    label: 'Locomoción',
    items: [
      { key: 'walk_wheelchair', label: 'Marcha/silla de ruedas' },
      { key: 'stairs', label: 'Escaleras' },
    ],
  },
  communication: {
    label: 'Comunicación',
    items: [
      { key: 'comprehension', label: 'Comprensión' },
      { key: 'expression', label: 'Expresión' },
    ],
  },
  socialCognition: {
    label: 'Cognición Social',
    items: [
      { key: 'social_interaction', label: 'Interacción social' },
      { key: 'problem_solving', label: 'Resolución de problemas' },
      { key: 'memory', label: 'Memoria' },
    ],
  },
} as const;
