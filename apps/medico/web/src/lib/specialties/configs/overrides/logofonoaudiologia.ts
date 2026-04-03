/**
 * @file overrides/logofonoaudiologia.ts
 * @description Override de configuración para Logofonoaudiología.
 *
 * Módulos especializados: baterías de evaluación del lenguaje,
 * pruebas de articulación, seguimiento de fluidez, gestión de
 * dispositivos CAA, terapia de alimentación, clasificación
 * de afasia (BDAE).
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const logofonoaudiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'logofonoaudiologia',
  dashboardPath: '/dashboard/medico/logofonoaudiologia',

  modules: {
    clinical: [
      {
        key: 'logo-consulta',
        label: 'Consulta de Fonoaudiología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/logofonoaudiologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'logo-evaluacion-lenguaje',
        label: 'Evaluación del Lenguaje',
        icon: 'BookOpen',
        route: '/dashboard/medico/logofonoaudiologia/evaluacion-lenguaje',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['language_improvement_rate'],
      },
      {
        key: 'logo-articulacion',
        label: 'Pruebas de Articulación',
        icon: 'Mic',
        route: '/dashboard/medico/logofonoaudiologia/articulacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['articulation_accuracy_rate'],
      },
      {
        key: 'logo-fluidez',
        label: 'Seguimiento de Fluidez',
        icon: 'Activity',
        route: '/dashboard/medico/logofonoaudiologia/fluidez',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'logo-caa',
        label: 'Gestión de Dispositivos CAA',
        icon: 'Tablet',
        route: '/dashboard/medico/logofonoaudiologia/caa',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'logo-alimentacion',
        label: 'Terapia de Alimentación',
        icon: 'UtensilsCrossed',
        route: '/dashboard/medico/logofonoaudiologia/alimentacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'logo-afasia',
        label: 'Clasificación de Afasia (BDAE)',
        icon: 'Brain',
        route: '/dashboard/medico/logofonoaudiologia/afasia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'logo-audiometria',
        label: 'Audiometría',
        icon: 'Headphones',
        route: '/dashboard/medico/logofonoaudiologia/audiometria',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'logo-evaluacion-voz',
        label: 'Evaluación de Voz',
        icon: 'AudioWaveform',
        route: '/dashboard/medico/logofonoaudiologia/evaluacion-voz',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'logo-herramientas-terapia',
        label: 'Herramientas de Terapia',
        icon: 'Puzzle',
        route: '/dashboard/medico/logofonoaudiologia/herramientas',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'logo-portal-paciente',
        label: 'Portal del Paciente/Familia',
        icon: 'Users',
        route: '/dashboard/medico/logofonoaudiologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'logo-coordinacion-escolar',
        label: 'Coordinación Escolar',
        icon: 'School',
        route: '/dashboard/medico/logofonoaudiologia/coordinacion-escolar',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'logo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/logofonoaudiologia/remisiones',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'logo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/logofonoaudiologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'language-progress-tracker',
      component: '@/components/dashboard/medico/logofonoaudiologia/widgets/language-progress-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'articulation-accuracy',
      component: '@/components/dashboard/medico/logofonoaudiologia/widgets/articulation-accuracy-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'therapy-milestones',
      component: '@/components/dashboard/medico/logofonoaudiologia/widgets/therapy-milestones-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'language_improvement_rate',
    'articulation_accuracy_rate',
    'therapy_milestone_achievement',
    'fluency_improvement_rate',
    'caa_device_utilization',
    'family_training_completion',
  ],

  kpiDefinitions: {
    language_improvement_rate: {
      label: 'Tasa de Mejora del Lenguaje',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    articulation_accuracy_rate: {
      label: 'Precisión de Articulación',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    therapy_milestone_achievement: {
      label: 'Logro de Hitos Terapéuticos',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    fluency_improvement_rate: {
      label: 'Tasa de Mejora de Fluidez',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    caa_device_utilization: {
      label: 'Utilización de Dispositivos CAA',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    family_training_completion: {
      label: 'Completación de Entrenamiento Familiar',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'sesion_terapia',
      'evaluacion_lenguaje',
      'evaluacion_articulacion',
      'evaluacion_fluidez',
      'entrenamiento_caa',
      'terapia_alimentacion',
      'evaluacion_afasia',
      'seguimiento',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_lenguaje',
      'evaluacion_articulacion',
      'evaluacion_fluidez',
      'clasificacion_afasia',
      'plan_terapia',
      'progreso_sesion',
      'informe_caa',
      'coordinacion_escolar',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksLanguageAssessment: true,
      tracksArticulation: true,
      tracksFluency: true,
      supportsAACDevices: true,
      supportsFeedingTherapy: true,
      usesAphasiaClassification: true,
    },
  },

  theme: {
    primaryColor: '#0891B2',
    accentColor: '#0E7490',
    icon: 'MessageSquare',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE LOGOFONOAUDIOLOGÍA
// ============================================================================

/**
 * Clasificación de afasia de Boston (BDAE)
 */
export const APHASIA_CLASSIFICATION_BDAE = [
  { key: 'broca', label: 'Afasia de Broca', fluency: 'No fluente', comprehension: 'Relativamente preservada', repetition: 'Alterada', naming: 'Alterada' },
  { key: 'wernicke', label: 'Afasia de Wernicke', fluency: 'Fluente', comprehension: 'Alterada', repetition: 'Alterada', naming: 'Alterada' },
  { key: 'conduction', label: 'Afasia de Conducción', fluency: 'Fluente', comprehension: 'Preservada', repetition: 'Muy alterada', naming: 'Variable' },
  { key: 'global', label: 'Afasia Global', fluency: 'No fluente', comprehension: 'Alterada', repetition: 'Alterada', naming: 'Alterada' },
  { key: 'transcortical_motor', label: 'Transcortical Motora', fluency: 'No fluente', comprehension: 'Preservada', repetition: 'Preservada', naming: 'Variable' },
  { key: 'transcortical_sensory', label: 'Transcortical Sensorial', fluency: 'Fluente', comprehension: 'Alterada', repetition: 'Preservada', naming: 'Alterada' },
  { key: 'anomic', label: 'Afasia Anómica', fluency: 'Fluente', comprehension: 'Preservada', repetition: 'Preservada', naming: 'Alterada' },
] as const;

/**
 * Hitos del desarrollo del lenguaje (edades esperadas)
 */
export const LANGUAGE_DEVELOPMENT_MILESTONES = [
  { age: '0-3 meses', receptive: 'Responde a la voz', expressive: 'Vocalizaciones, llanto diferenciado' },
  { age: '4-6 meses', receptive: 'Se gira hacia sonidos', expressive: 'Balbuceo canónico (ba-ba)' },
  { age: '7-9 meses', receptive: 'Entiende "no"', expressive: 'Balbuceo variado, gestos' },
  { age: '10-12 meses', receptive: 'Entiende palabras simples', expressive: 'Primeras palabras' },
  { age: '13-18 meses', receptive: 'Sigue instrucciones simples', expressive: '10-50 palabras' },
  { age: '19-24 meses', receptive: 'Señala partes del cuerpo', expressive: 'Combinaciones de 2 palabras, 50+ palabras' },
  { age: '2-3 años', receptive: 'Entiende preguntas simples', expressive: 'Frases de 3-4 palabras, 200+ palabras' },
  { age: '3-4 años', receptive: 'Entiende conceptos básicos', expressive: 'Oraciones complejas, relatos simples' },
  { age: '4-5 años', receptive: 'Entiende instrucciones complejas', expressive: 'Relatos organizados, 1500+ palabras' },
] as const;
