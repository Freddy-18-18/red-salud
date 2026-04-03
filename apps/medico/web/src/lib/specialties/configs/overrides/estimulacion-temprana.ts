/**
 * @file overrides/estimulacion-temprana.ts
 * @description Override de configuración para Estimulación Temprana.
 *
 * Módulos especializados para el seguimiento del desarrollo infantil temprano:
 * hitos del desarrollo, evaluación de integración sensorial,
 * desarrollo motor (grueso/fino), hitos del lenguaje,
 * registros de entrenamiento a padres.
 *
 * También exporta constantes de dominio: hitos motores por edad,
 * hitos de lenguaje, categorías de integración sensorial, escalas de evaluación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Estimulación Temprana.
 * Especialidad con módulos clínicos especializados para el neurodesarrollo temprano.
 */
export const estimulacionTempranaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'estimulacion-temprana',
  dashboardPath: '/dashboard/medico/estimulacion-temprana',

  modules: {
    clinical: [
      {
        key: 'estimtemprana-evaluacion',
        label: 'Evaluación del Desarrollo',
        icon: 'Sparkles',
        route: '/dashboard/medico/estimulacion-temprana/evaluacion',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['milestone_achievement_rate', 'developmental_age_ratio'],
      },
      {
        key: 'estimtemprana-hitos',
        label: 'Hitos del Desarrollo',
        icon: 'CheckCircle',
        route: '/dashboard/medico/estimulacion-temprana/hitos',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['milestone_achievement_rate'],
      },
      {
        key: 'estimtemprana-sensorial',
        label: 'Integración Sensorial',
        icon: 'Hand',
        route: '/dashboard/medico/estimulacion-temprana/sensorial',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['milestone_achievement_rate'],
      },
      {
        key: 'estimtemprana-motor',
        label: 'Desarrollo Motor (Grueso/Fino)',
        icon: 'Dumbbell',
        route: '/dashboard/medico/estimulacion-temprana/motor',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['milestone_achievement_rate', 'developmental_age_ratio'],
      },
      {
        key: 'estimtemprana-lenguaje',
        label: 'Hitos del Lenguaje',
        icon: 'MessageCircle',
        route: '/dashboard/medico/estimulacion-temprana/lenguaje',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['milestone_achievement_rate'],
      },
      {
        key: 'estimtemprana-padres',
        label: 'Entrenamiento a Padres',
        icon: 'GraduationCap',
        route: '/dashboard/medico/estimulacion-temprana/padres',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['therapy_adherence'],
      },
    ],

    technology: [
      {
        key: 'estimtemprana-escalas',
        label: 'Escalas de Evaluación',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/estimulacion-temprana/escalas',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'estimtemprana-curvas',
        label: 'Curvas de Desarrollo',
        icon: 'LineChart',
        route: '/dashboard/medico/estimulacion-temprana/curvas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'estimtemprana-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/estimulacion-temprana/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'estimtemprana-ejercicios',
        label: 'Ejercicios para Casa',
        icon: 'Home',
        route: '/dashboard/medico/estimulacion-temprana/ejercicios',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'developmental-overview',
      component: '@/components/dashboard/medico/estimulacion-temprana/widgets/developmental-overview-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'milestone-tracker',
      component: '@/components/dashboard/medico/estimulacion-temprana/widgets/milestone-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'therapy-adherence',
      component: '@/components/dashboard/medico/estimulacion-temprana/widgets/therapy-adherence-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'milestone_achievement_rate',
    'therapy_adherence',
    'developmental_age_ratio',
    'parent_training_completion',
    'follow_up_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    milestone_achievement_rate: {
      label: 'Tasa de Logro de Hitos',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    therapy_adherence: {
      label: 'Adherencia a Terapia',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    developmental_age_ratio: {
      label: 'Razón Edad de Desarrollo / Cronológica',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    parent_training_completion: {
      label: 'Completamiento de Entrenamiento a Padres',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción Padres',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_desarrollo',
      'sesion_estimulacion',
      'evaluacion_sensorial',
      'sesion_motricidad',
      'sesion_lenguaje',
      'entrenamiento_padres',
      'seguimiento',
      'reevaluacion',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_desarrollo_global',
      'hitos_motores',
      'hitos_lenguaje',
      'integracion_sensorial',
      'plan_estimulacion',
      'registro_sesion',
      'entrenamiento_padres',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksDevelopmentalMilestones: true,
      assessesSensoryIntegration: true,
      tracksGrossMotorDevelopment: true,
      tracksFineMotorDevelopment: true,
      tracksLanguageMilestones: true,
      logsParentTraining: true,
      requiresParentalConsent: true,
      calculatesDevAgeRatio: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#4ADE80',
    icon: 'Sparkles',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ESTIMULACIÓN TEMPRANA
// ============================================================================

/**
 * Hitos del desarrollo motor grueso por edad
 */
export const GROSS_MOTOR_MILESTONES = [
  { ageMonths: 2, milestones: ['Levanta cabeza en prono 45°', 'Sostiene cabeza brevemente'] },
  { ageMonths: 4, milestones: ['Control cefálico completo', 'Se apoya en antebrazos', 'Rolido asistido'] },
  { ageMonths: 6, milestones: ['Rolido completo', 'Se sienta con apoyo', 'Soporta peso en piernas'] },
  { ageMonths: 9, milestones: ['Se sienta sin apoyo', 'Gatea', 'Se para con apoyo'] },
  { ageMonths: 12, milestones: ['Se para solo', 'Camina con apoyo', 'Primeros pasos independientes'] },
  { ageMonths: 18, milestones: ['Camina solo con seguridad', 'Sube escaleras con ayuda', 'Se agacha y se levanta'] },
  { ageMonths: 24, milestones: ['Corre', 'Patea pelota', 'Sube escaleras de pie'] },
  { ageMonths: 36, milestones: ['Salta con ambos pies', 'Pedalea triciclo', 'Sube escaleras alternando pies'] },
];

/**
 * Hitos del desarrollo motor fino por edad
 */
export const FINE_MOTOR_MILESTONES = [
  { ageMonths: 2, milestones: ['Manos parcialmente abiertas', 'Agarra reflejo'] },
  { ageMonths: 4, milestones: ['Alcanza objetos', 'Agarre palmar', 'Junta manos en línea media'] },
  { ageMonths: 6, milestones: ['Transfiere objetos entre manos', 'Agarre radial palmar'] },
  { ageMonths: 9, milestones: ['Pinza inferior', 'Golpea objetos entre sí', 'Señala con índice'] },
  { ageMonths: 12, milestones: ['Pinza fina (pulgar-índice)', 'Mete objetos en contenedor', 'Suelta voluntariamente'] },
  { ageMonths: 18, milestones: ['Torre de 2-3 cubos', 'Garabatea', 'Come con cuchara (derrama)'] },
  { ageMonths: 24, milestones: ['Torre de 4-6 cubos', 'Línea vertical', 'Pasa páginas una a una'] },
  { ageMonths: 36, milestones: ['Torre de 8-10 cubos', 'Copia círculo', 'Usa tijeras', 'Se desviste solo'] },
];

/**
 * Hitos del lenguaje por edad
 */
export const LANGUAGE_MILESTONES = [
  { ageMonths: 2, milestones: ['Llanto diferenciado', 'Vocaliza (aaa, ooo)'] },
  { ageMonths: 4, milestones: ['Se ríe a carcajadas', 'Gorjeo', 'Voltea al sonido'] },
  { ageMonths: 6, milestones: ['Balbuceo canónico (ba-ba, ma-ma)', 'Responde a su nombre'] },
  { ageMonths: 9, milestones: ['Balbuceo variado', 'Imita sonidos', 'Entiende "no"'] },
  { ageMonths: 12, milestones: ['Primera palabra con sentido', '1-3 palabras', 'Entiende instrucciones simples'] },
  { ageMonths: 18, milestones: ['10-25 palabras', 'Señala partes del cuerpo', 'Entiende instrucciones de 1 paso'] },
  { ageMonths: 24, milestones: ['50+ palabras', 'Frases de 2 palabras', 'Usa pronombres (yo, mío)'] },
  { ageMonths: 36, milestones: ['Oraciones de 3-4 palabras', 'Pregunta "por qué"', 'Relata experiencias'] },
];

/**
 * Categorías de integración sensorial
 */
export const SENSORY_INTEGRATION_CATEGORIES = {
  tactile: {
    label: 'Táctil',
    areas: ['Texturas', 'Temperatura', 'Presión', 'Dolor'],
    redFlags: ['Evita ser tocado', 'No tolera ciertas texturas', 'Hipersensibilidad al dolor'],
  },
  vestibular: {
    label: 'Vestibular',
    areas: ['Equilibrio', 'Movimiento', 'Posición en espacio'],
    redFlags: ['Miedo excesivo al movimiento', 'Busca movimiento constante', 'Mareo fácil'],
  },
  proprioceptive: {
    label: 'Propioceptivo',
    areas: ['Conciencia corporal', 'Fuerza', 'Coordinación'],
    redFlags: ['Torpeza motora', 'Fuerza excesiva/insuficiente', 'Dificultad postural'],
  },
  auditory: {
    label: 'Auditivo',
    areas: ['Discriminación de sonidos', 'Localización', 'Procesamiento'],
    redFlags: ['Hipersensibilidad a ruidos', 'No responde a sonidos', 'Dificultad con instrucciones'],
  },
  visual: {
    label: 'Visual',
    areas: ['Seguimiento', 'Discriminación', 'Procesamiento visual'],
    redFlags: ['Evita contacto visual', 'Dificultad con letras/formas', 'Sensibilidad a luz'],
  },
};
