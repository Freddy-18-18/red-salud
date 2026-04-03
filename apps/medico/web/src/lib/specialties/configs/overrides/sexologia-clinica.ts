/**
 * @file overrides/sexologia-clinica.ts
 * @description Override de configuración para Sexología Clínica.
 *
 * Módulos especializados: evaluación de función sexual (IIEF
 * para hombres, FSFI para mujeres), paneles hormonales,
 * notas de terapia de pareja, progreso de tratamiento,
 * formulación biopsicosocial, apoyo de identidad de género.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const sexologiaClinicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'sexologia-clinica',
  dashboardPath: '/dashboard/medico/sexologia-clinica',

  modules: {
    clinical: [
      {
        key: 'sexo-consulta',
        label: 'Consulta de Sexología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/sexologia-clinica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'sexo-funcion-sexual',
        label: 'Evaluación de Función Sexual',
        icon: 'ClipboardList',
        route: '/dashboard/medico/sexologia-clinica/funcion-sexual',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['function_score_improvement'],
      },
      {
        key: 'sexo-hormonal',
        label: 'Paneles Hormonales',
        icon: 'Activity',
        route: '/dashboard/medico/sexologia-clinica/hormonal',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'sexo-terapia-pareja',
        label: 'Terapia de Pareja',
        icon: 'Heart',
        route: '/dashboard/medico/sexologia-clinica/terapia-pareja',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['couple_outcomes_rate'],
      },
      {
        key: 'sexo-progreso',
        label: 'Progreso de Tratamiento',
        icon: 'TrendingUp',
        route: '/dashboard/medico/sexologia-clinica/progreso',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['treatment_satisfaction_rate'],
      },
      {
        key: 'sexo-biopsicosocial',
        label: 'Formulación Biopsicosocial',
        icon: 'Brain',
        route: '/dashboard/medico/sexologia-clinica/biopsicosocial',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'sexo-identidad-genero',
        label: 'Apoyo de Identidad de Género',
        icon: 'Users',
        route: '/dashboard/medico/sexologia-clinica/identidad-genero',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'sexo-labs-hormonales',
        label: 'Laboratorios Hormonales',
        icon: 'FlaskConical',
        route: '/dashboard/medico/sexologia-clinica/labs-hormonales',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'sexo-cuestionarios',
        label: 'Cuestionarios Validados',
        icon: 'FileText',
        route: '/dashboard/medico/sexologia-clinica/cuestionarios',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'sexo-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/sexologia-clinica/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'sexo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/sexologia-clinica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'sexo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/sexologia-clinica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'function-score-tracker',
      component: '@/components/dashboard/medico/sexologia-clinica/widgets/function-score-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'treatment-progress-overview',
      component: '@/components/dashboard/medico/sexologia-clinica/widgets/treatment-progress-overview-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'satisfaction-metrics',
      component: '@/components/dashboard/medico/sexologia-clinica/widgets/satisfaction-metrics-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'function_score_improvement',
    'treatment_satisfaction_rate',
    'couple_outcomes_rate',
    'therapy_adherence_rate',
    'hormone_normalization_rate',
    'gender_affirming_care_access',
  ],

  kpiDefinitions: {
    function_score_improvement: {
      label: 'Mejora en Score de Función Sexual',
      format: 'number',
      direction: 'higher_is_better',
    },
    treatment_satisfaction_rate: {
      label: 'Satisfacción con el Tratamiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    couple_outcomes_rate: {
      label: 'Resultados de Terapia de Pareja',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    therapy_adherence_rate: {
      label: 'Adherencia a la Terapia',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    hormone_normalization_rate: {
      label: 'Normalización Hormonal',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    gender_affirming_care_access: {
      label: 'Acceso a Atención de Afirmación de Género',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_funcion_sexual',
      'terapia_individual',
      'terapia_pareja',
      'seguimiento_hormonal',
      'apoyo_identidad_genero',
      'seguimiento',
    ],
    defaultDuration: 50,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_sexologica',
      'evaluacion_iief',
      'evaluacion_fsfi',
      'formulacion_biopsicosocial',
      'nota_terapia_pareja',
      'progreso_tratamiento',
      'evaluacion_identidad_genero',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      usesIIEF: true,
      usesFSFI: true,
      supportsHormonePanels: true,
      supportsCoupleTherapy: true,
      supportsBiopsychosocialFormulation: true,
      supportsGenderIdentitySupport: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Heart',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE SEXOLOGÍA CLÍNICA
// ============================================================================

/**
 * Dominios del FSFI (Female Sexual Function Index)
 */
export const FSFI_DOMAINS = [
  { key: 'desire', label: 'Deseo', questions: 2, maxScore: 6.0, factor: 0.6 },
  { key: 'arousal', label: 'Excitación', questions: 4, maxScore: 6.0, factor: 0.3 },
  { key: 'lubrication', label: 'Lubricación', questions: 4, maxScore: 6.0, factor: 0.3 },
  { key: 'orgasm', label: 'Orgasmo', questions: 3, maxScore: 6.0, factor: 0.4 },
  { key: 'satisfaction', label: 'Satisfacción', questions: 3, maxScore: 6.0, factor: 0.4 },
  { key: 'pain', label: 'Dolor', questions: 3, maxScore: 6.0, factor: 0.4 },
] as const;

/**
 * Clasificación de disfunciones sexuales (DSM-5)
 */
export const SEXUAL_DYSFUNCTION_DSM5 = [
  { key: 'male_hypoactive', label: 'Trastorno de Deseo Sexual Hipoactivo Masculino', gender: 'male' },
  { key: 'erectile_disorder', label: 'Trastorno Eréctil', gender: 'male' },
  { key: 'premature_ejaculation', label: 'Eyaculación Precoz', gender: 'male' },
  { key: 'delayed_ejaculation', label: 'Eyaculación Retardada', gender: 'male' },
  { key: 'female_interest_arousal', label: 'Trastorno de Interés/Excitación Sexual Femenino', gender: 'female' },
  { key: 'female_orgasmic', label: 'Trastorno Orgásmico Femenino', gender: 'female' },
  { key: 'genito_pelvic_pain', label: 'Trastorno de Dolor Génito-Pélvico/Penetración', gender: 'female' },
  { key: 'gender_dysphoria', label: 'Disforia de Género', gender: 'any' },
] as const;
