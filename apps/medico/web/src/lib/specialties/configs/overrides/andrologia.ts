/**
 * @file overrides/andrologia.ts
 * @description Override de configuración para Andrología.
 *
 * Módulos especializados: tendencias de análisis seminal, paneles
 * hormonales, función eréctil (IIEF), clasificación de varicocele,
 * estudio de fertilidad, planificación quirúrgica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const andrologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'andrologia',
  dashboardPath: '/dashboard/medico/andrologia',

  modules: {
    clinical: [
      {
        key: 'andro-consulta',
        label: 'Consulta Andrológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/andrologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'andro-espermiograma',
        label: 'Análisis Seminal / Espermiograma',
        icon: 'Microscope',
        route: '/dashboard/medico/andrologia/espermiograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['fertility_outcomes_rate'],
      },
      {
        key: 'andro-hormonal',
        label: 'Panel Hormonal',
        icon: 'Activity',
        route: '/dashboard/medico/andrologia/hormonal',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['hormonal_improvement_rate'],
      },
      {
        key: 'andro-iief',
        label: 'Función Eréctil (IIEF)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/andrologia/iief',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'andro-varicocele',
        label: 'Clasificación de Varicocele',
        icon: 'Search',
        route: '/dashboard/medico/andrologia/varicocele',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'andro-fertilidad',
        label: 'Estudio de Fertilidad',
        icon: 'FlaskConical',
        route: '/dashboard/medico/andrologia/fertilidad',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'andro-quirurgico',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/andrologia/quirurgico',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['surgical_success_rate'],
      },
    ],

    lab: [
      {
        key: 'andro-labs-hormonales',
        label: 'Laboratorios Hormonales',
        icon: 'TrendingUp',
        route: '/dashboard/medico/andrologia/labs-hormonales',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'andro-doppler',
        label: 'Ecografía Doppler Testicular',
        icon: 'Scan',
        route: '/dashboard/medico/andrologia/doppler',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'andro-genetica',
        label: 'Estudios Genéticos',
        icon: 'Dna',
        route: '/dashboard/medico/andrologia/genetica',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'andro-calculadoras',
        label: 'Calculadoras Andrológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/andrologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'andro-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/andrologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'andro-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/andrologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'andro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/andrologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'semen-analysis-trends',
      component: '@/components/dashboard/medico/andrologia/widgets/semen-analysis-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'hormone-panel-tracker',
      component: '@/components/dashboard/medico/andrologia/widgets/hormone-panel-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'iief-score-tracking',
      component: '@/components/dashboard/medico/andrologia/widgets/iief-score-tracking-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'fertility_outcomes_rate',
    'hormonal_improvement_rate',
    'surgical_success_rate',
    'iief_score_improvement',
    'varicocele_repair_success',
    'treatment_adherence_rate',
  ],

  kpiDefinitions: {
    fertility_outcomes_rate: {
      label: 'Tasa de Resultados de Fertilidad',
      format: 'percentage',
      goal: 0.55,
      direction: 'higher_is_better',
    },
    hormonal_improvement_rate: {
      label: 'Tasa de Mejora Hormonal',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    surgical_success_rate: {
      label: 'Tasa de Éxito Quirúrgico',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    iief_score_improvement: {
      label: 'Mejora en Score IIEF',
      format: 'number',
      direction: 'higher_is_better',
    },
    varicocele_repair_success: {
      label: 'Éxito en Reparación de Varicocele',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    treatment_adherence_rate: {
      label: 'Adherencia al Tratamiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'espermiograma',
      'panel_hormonal',
      'evaluacion_iief',
      'evaluacion_varicocele',
      'estudio_fertilidad',
      'pre_quirurgica',
      'post_quirurgica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_andrologica',
      'examen_fisico_andrologico',
      'informe_espermiograma',
      'panel_hormonal',
      'evaluacion_iief',
      'clasificacion_varicocele',
      'plan_tratamiento',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksSpermAnalysis: true,
      requiresHormonePanels: true,
      usesIIEFQuestionnaire: true,
      supportsVaricoceleGrading: true,
      tracksFertilityWorkup: true,
      supportsSurgicalPlanning: true,
    },
  },

  theme: {
    primaryColor: '#6366F1',
    accentColor: '#4338CA',
    icon: 'User',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ANDROLÓGICO
// ============================================================================

/**
 * Dominios del cuestionario IIEF (International Index of Erectile Function)
 */
export const IIEF_DOMAINS = [
  { key: 'erectile_function', label: 'Función Eréctil', questions: 6, maxScore: 30, cutoff: 25 },
  { key: 'orgasmic_function', label: 'Función Orgásmica', questions: 2, maxScore: 10, cutoff: 8 },
  { key: 'sexual_desire', label: 'Deseo Sexual', questions: 2, maxScore: 10, cutoff: 8 },
  { key: 'intercourse_satisfaction', label: 'Satisfacción en el Coito', questions: 3, maxScore: 15, cutoff: 12 },
  { key: 'overall_satisfaction', label: 'Satisfacción General', questions: 2, maxScore: 10, cutoff: 8 },
] as const;

/**
 * Clasificación de Varicocele (escala clínica)
 */
export const VARICOCELE_GRADES = [
  { grade: 'subclínico', label: 'Subclínico', description: 'Detectable solo por ecografía Doppler' },
  { grade: 'I', label: 'Grado I', description: 'Palpable solo con maniobra de Valsalva' },
  { grade: 'II', label: 'Grado II', description: 'Palpable sin Valsalva, no visible' },
  { grade: 'III', label: 'Grado III', description: 'Visible y palpable ("bolsa de gusanos")' },
] as const;

/**
 * Parámetros de referencia OMS para análisis seminal (6ta edición, 2021)
 */
export const WHO_SEMEN_REFERENCE = [
  { parameter: 'volume', label: 'Volumen', reference: '≥ 1.5 mL', unit: 'mL' },
  { parameter: 'concentration', label: 'Concentración', reference: '≥ 16 millones/mL', unit: 'millones/mL' },
  { parameter: 'total_count', label: 'Recuento Total', reference: '≥ 39 millones', unit: 'millones' },
  { parameter: 'motility', label: 'Motilidad Total', reference: '≥ 42%', unit: '%' },
  { parameter: 'progressive_motility', label: 'Motilidad Progresiva', reference: '≥ 30%', unit: '%' },
  { parameter: 'morphology', label: 'Morfología Normal', reference: '≥ 4%', unit: '%' },
  { parameter: 'vitality', label: 'Vitalidad', reference: '≥ 54%', unit: '%' },
] as const;
