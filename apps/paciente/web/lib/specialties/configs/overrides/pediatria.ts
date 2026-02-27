/**
 * @file overrides/pediatria.ts
 * @description Override de configuración para Pediatría.
 *
 * Preserva los módulos especializados (well-child, vacunación, crecimiento, etc.),
 * widgets, KPIs y settings del config original de pediatrics.
 *
 * También exporta constantes de dominio pediátrico: age groups,
 * growth charts, vaccination schedule, developmental milestones.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Pediatría.
 * Especialidad con módulos clínicos especializados para niños.
 */
export const pediatriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'pediatria',
  dashboardPath: '/dashboard/medico/pediatria',

  modules: {
    clinical: [
      {
        key: 'pedi-well-child',
        label: 'Visita de Bienestar',
        icon: 'Baby',
        route: '/dashboard/medico/pediatria/well-child',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['well_child_completion', 'growth_tracking_compliance'],
      },
      {
        key: 'pedi-consulta',
        label: 'Consulta Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/pediatria/consulta',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'follow_up_rate'],
      },
      {
        key: 'pedi-crecimiento',
        label: 'Crecimiento y Desarrollo',
        icon: 'TrendingUp',
        route: '/dashboard/medico/pediatria/crecimiento',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['growth_percentile_compliance', 'developmental_milestone_tracking'],
      },
      {
        key: 'pedi-vacunacion',
        label: 'Vacunación',
        icon: 'Syringe',
        route: '/dashboard/medico/pediatria/vacunacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['vaccination_coverage', 'up_to_date_rate'],
      },
      {
        key: 'pedi-adolescente',
        label: 'Adolescentes',
        icon: 'User',
        route: '/dashboard/medico/pediatria/adolescentes',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'pedi-neurodesarrollo',
        label: 'Neurodesarrollo',
        icon: 'Brain',
        route: '/dashboard/medico/pediatria/neurodesarrollo',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    financial: [
      {
        key: 'pedi-facturacion',
        label: 'Consulta Privada',
        icon: 'CreditCard',
        route: '/dashboard/medico/pediatria/honorarios',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'pedi-seguros',
        label: 'Seguros',
        icon: 'Shield',
        route: '/dashboard/medico/pediatria/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'pedi-curvas-crecimiento',
        label: 'Curvas de Crecimiento',
        icon: 'LineChart',
        route: '/dashboard/medico/pediatria/curvas-crecimiento',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'pedi-telemedicina',
        label: 'Telepediatría',
        icon: 'Video',
        route: '/dashboard/medico/pediatria/telemedicina',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'pedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/pediatria/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/pediatria/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'well-child-schedule',
      component: '@/components/dashboard/medico/pediatria/widgets/well-child-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'vaccination-tracker',
      component: '@/components/dashboard/medico/pediatria/widgets/vaccination-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'growth-alerts',
      component: '@/components/dashboard/medico/pediatria/widgets/growth-alerts-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'appointment-reminders',
      component: '@/components/dashboard/medico/pediatria/widgets/appointment-reminders-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'well_child_completion',
    'vaccination_coverage',
    'growth_percentile_compliance',
    'follow_up_rate',
    'patient_satisfaction_score',
    'recall_rate',
  ],

  kpiDefinitions: {
    well_child_completion: {
      label: 'Cumplimiento Well-Child',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    vaccination_coverage: {
      label: 'Cobertura de Vacunación',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    growth_percentile_compliance: {
      label: 'Seguimiento Percentiles',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción Padres',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    recall_rate: {
      label: 'Tasa de Recall',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'well_child_0_1m',
      'well_child_2m',
      'well_child_4m',
      'well_child_6m',
      'well_child_9m',
      'well_child_12m',
      'well_child_15m',
      'well_child_18m',
      'well_child_2y',
      'well_child_2y6m',
      'well_child_3y',
      'well_child_4y',
      'well_child_5y',
      'well_child_6y_plus',
      'consulta_enfermedad',
      'seguimiento_cronico',
      'vacunacion',
      'adolescente',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_perinatal',
      'anamnesis_pediatrica',
      'examen_fisico_pediatrico',
      'crecimiento_desarrollo',
      'vacunas',
      'plan_tratamiento',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresAgeGroupTracking: true,
      usesGrowthPercentiles: true,
      tracksVaccinationSchedule: true,
      requiresParentalConsent: true,
      usesPediatricDosage: true,
      tracksDevelopmentalMilestones: true,
    },
  },

  theme: {
    primaryColor: '#22c55e',
    accentColor: '#84cc16',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO PEDIÁTRICO
// ============================================================================

/**
 * Grupos de edad pediátricos
 */
export const PEDIATRIC_AGE_GROUPS = [
  { key: 'neonate', label: 'Recién Nacido (0-28 días)', minDays: 0, maxDays: 28 },
  { key: 'infant_0_2m', label: 'Lactante (0-2 meses)', minMonths: 0, maxMonths: 2 },
  { key: 'infant_2_12m', label: 'Lactante (2-12 meses)', minMonths: 2, maxMonths: 12 },
  { key: 'toddler_1_3y', label: 'Infante (1-3 años)', minYears: 1, maxYears: 3 },
  { key: 'preschool_3_5y', label: 'Preescolar (3-5 años)', minYears: 3, maxYears: 5 },
  { key: 'school_5_12y', label: 'Escolar (5-12 años)', minYears: 5, maxYears: 12 },
  { key: 'adolescent_12_18y', label: 'Adolescente (12-18 años)', minYears: 12, maxYears: 18 },
];

/**
 * Estándares de curvas de crecimiento WHO
 */
export const GROWTH_CHART_STANDARDS = {
  weight_for_age: {
    boys_0_5: 'WHO/boys_weight_0_5',
    boys_5_19: 'WHO/boys_weight_5_19',
    girls_0_5: 'WHO/girls_weight_0_5',
    girls_5_19: 'WHO/girls_weight_5_19',
  },
  height_for_age: {
    boys_0_5: 'WHO/boys_height_0_5',
    boys_5_19: 'WHO/boys_height_5_19',
    girls_0_5: 'WHO/girls_height_0_5',
    girls_5_19: 'WHO/girls_height_5_19',
  },
  bmi_for_age: {
    boys_0_5: 'WHO/boys_bmi_0_5',
    boys_5_19: 'WHO/boys_bmi_5_19',
    girls_0_5: 'WHO/girls_bmi_0_5',
    girls_5_19: 'WHO/girls_bmi_5_19',
  },
};

/**
 * Esquema de vacunación venezolano
 */
export const VACCINATION_SCHEDULE = [
  { vaccine: 'BCG', dueAt: 'birth', boosters: [] },
  { vaccine: 'Hep B', dueAt: 'birth', boosters: ['2m', '6m'] },
  { vaccine: 'Pentavalente', dueAt: '2m', boosters: ['4m', '6m', '18m'] },
  { vaccine: 'IPV', dueAt: '2m', boosters: ['4m', '6m', '18m'] },
  { vaccine: 'Rotavirus', dueAt: '2m', boosters: ['4m', '6m'] },
  { vaccine: 'Neumococo', dueAt: '2m', boosters: ['4m', '12m'] },
  { vaccine: 'MMR (Triple Viral)', dueAt: '12m', boosters: ['4y'] },
  { vaccine: 'Varicela', dueAt: '12m', boosters: [] },
  { vaccine: 'Hepatitis A', dueAt: '12m', boosters: ['6m after 1st'] },
  { vaccine: 'Dengue', dueAt: '9y', boosters: [] },
  { vaccine: 'VPH', dueAt: '10y', boosters: [] },
];

/**
 * Hitos del desarrollo por rango de edad
 */
export const DEVELOPMENTAL_MILESTONES: Record<
  string,
  { communication: string[]; motor: string[]; social: string[] }
> = {
  '0-3m': {
    communication: ['Sonrisa social', 'Llora', 'Sigue objetos'],
    motor: ['Levanta cabeza', 'Aprieta objetos', 'Control cefálico'],
    social: ['Contacto visual', 'Sonrisa responsiva'],
  },
  '3-6m': {
    communication: ['Balbucea', 'Imita sonidos', 'Responde a nombre'],
    motor: ['Voltea', 'Se sienta con apoyo', 'Alcanza objetos'],
    social: ['Reconoce caras', 'Juego interactivo'],
  },
  '6-12m': {
    communication: ['Dice palabras', 'Imita gestos', 'Jerga'],
    motor: ['Se sienta solo', 'Gatea', 'Pinza índice-pulgar'],
    social: ['Ansiedad extraños', 'Prefiere cierta persona'],
  },
  '1-2y': {
    communication: ['Frases de 2 palabras', 'Vocabulario 50+'],
    motor: ['Camina solo', 'Patea', 'Sube escaleras'],
    social: ['Juego paralelo', 'Tantrums'],
  },
  '2-3y': {
    communication: ['Oraciones completas', 'Pregunta "por qué"'],
    motor: ['Corre', 'Salta', 'Patea con un pie'],
    social: ['Juego cooperativo', 'Interés en otros niños'],
  },
  '3-5y': {
    communication: ['Cuenta hasta 10', 'Colores', 'Historias'],
    motor: ['Bota pelota', 'Triciclo', 'Equilibrio'],
    social: ['Amigos imaginarios', 'Reglas de juego'],
  },
};
