/**
 * @file overrides/neonatologia.ts
 * @description Override de configuración para Neonatología.
 *
 * Módulos especializados para el manejo del recién nacido:
 * Apgar tracking, edad gestacional, notas UCIN, ventilación mecánica,
 * nutrición parenteral (TPN), tamizaje de retinopatía, score de Ballard.
 *
 * También exporta constantes de dominio neonatal: rangos Apgar,
 * clasificación edad gestacional, parámetros ventilatorios, componentes TPN.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neonatología.
 * Especialidad con módulos clínicos especializados para neonatos en UCIN.
 */
export const neonatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neonatologia',
  dashboardPath: '/dashboard/medico/neonatologia',

  modules: {
    clinical: [
      {
        key: 'neo-admision',
        label: 'Admisión Neonatal',
        icon: 'Baby',
        route: '/dashboard/medico/neonatologia/admision',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['survival_by_gestational_age', 'bpd_rate'],
      },
      {
        key: 'neo-apgar',
        label: 'Evaluación Apgar',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/neonatologia/apgar',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['survival_by_gestational_age'],
      },
      {
        key: 'neo-edad-gestacional',
        label: 'Edad Gestacional (Ballard)',
        icon: 'Calendar',
        route: '/dashboard/medico/neonatologia/edad-gestacional',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['survival_by_gestational_age'],
      },
      {
        key: 'neo-notas-ucin',
        label: 'Notas Diarias UCIN',
        icon: 'FileText',
        route: '/dashboard/medico/neonatologia/notas-ucin',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['nec_rate', 'bpd_rate'],
      },
      {
        key: 'neo-ventilacion',
        label: 'Ventilación Mecánica',
        icon: 'Wind',
        route: '/dashboard/medico/neonatologia/ventilacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['bpd_rate'],
      },
      {
        key: 'neo-tpn',
        label: 'Nutrición Parenteral (TPN)',
        icon: 'Droplets',
        route: '/dashboard/medico/neonatologia/tpn',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['nec_rate'],
      },
      {
        key: 'neo-rop-screening',
        label: 'Tamizaje de Retinopatía (ROP)',
        icon: 'Eye',
        route: '/dashboard/medico/neonatologia/rop-screening',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['rop_screening_compliance'],
      },
    ],

    technology: [
      {
        key: 'neo-calculadoras',
        label: 'Calculadoras Neonatales',
        icon: 'Calculator',
        route: '/dashboard/medico/neonatologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neo-monitoreo',
        label: 'Monitoreo Continuo',
        icon: 'Activity',
        route: '/dashboard/medico/neonatologia/monitoreo',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'neo-portal-padres',
        label: 'Portal de Padres UCIN',
        icon: 'Users',
        route: '/dashboard/medico/neonatologia/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'nicu-census',
      component: '@/components/dashboard/medico/neonatologia/widgets/nicu-census-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ventilator-status',
      component: '@/components/dashboard/medico/neonatologia/widgets/ventilator-status-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'rop-screening-schedule',
      component: '@/components/dashboard/medico/neonatologia/widgets/rop-screening-schedule-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'survival_by_gestational_age',
    'bpd_rate',
    'nec_rate',
    'rop_screening_compliance',
    'avg_length_of_stay',
    'nosocomial_infection_rate',
  ],

  kpiDefinitions: {
    survival_by_gestational_age: {
      label: 'Supervivencia por Edad Gestacional',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    bpd_rate: {
      label: 'Tasa de Displasia Broncopulmonar',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    nec_rate: {
      label: 'Tasa de Enterocolitis Necrotizante',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    rop_screening_compliance: {
      label: 'Cumplimiento Tamizaje ROP',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    avg_length_of_stay: {
      label: 'Estadía Promedio UCIN (días)',
      format: 'number',
      goal: 30,
      direction: 'lower_is_better',
    },
    nosocomial_infection_rate: {
      label: 'Tasa de Infección Nosocomial',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'admision_neonatal',
      'nota_diaria_ucin',
      'evaluacion_apgar',
      'evaluacion_ballard',
      'control_ventilacion',
      'calculo_tpn',
      'tamizaje_rop',
      'seguimiento_alta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'admision_neonatal',
      'nota_diaria_ucin',
      'evaluacion_apgar',
      'score_ballard',
      'parametros_ventilatorios',
      'calculo_tpn',
      'tamizaje_rop',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresGestationalAgeTracking: true,
      usesApgarScoring: true,
      usesBallardScore: true,
      tracksVentilatorSettings: true,
      calculatesTPN: true,
      tracksROPScreening: true,
      usesPediatricDosage: true,
      requiresParentalConsent: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#F472B6',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEONATOLOGÍA
// ============================================================================

/**
 * Rangos de puntuación Apgar
 */
export const APGAR_SCORE_RANGES = {
  normal: { min: 7, max: 10, label: 'Normal', color: '#22C55E' },
  moderateDepression: { min: 4, max: 6, label: 'Depresión Moderada', color: '#F59E0B' },
  severeDepression: { min: 0, max: 3, label: 'Depresión Severa', color: '#EF4444' },
};

/**
 * Componentes de la puntuación Apgar
 */
export const APGAR_COMPONENTS = [
  { key: 'appearance', label: 'Apariencia (color)', scores: ['Cianosis/palidez generalizada', 'Acrocianosis', 'Completamente rosado'] },
  { key: 'pulse', label: 'Pulso (FC)', scores: ['Ausente', '< 100 lpm', '≥ 100 lpm'] },
  { key: 'grimace', label: 'Irritabilidad refleja', scores: ['Sin respuesta', 'Muecas', 'Llanto vigoroso'] },
  { key: 'activity', label: 'Actividad (tono)', scores: ['Flácido', 'Flexión de extremidades', 'Movimiento activo'] },
  { key: 'respiration', label: 'Respiración', scores: ['Ausente', 'Irregular/débil', 'Llanto fuerte'] },
];

/**
 * Clasificación por edad gestacional
 */
export const GESTATIONAL_AGE_CLASSIFICATION = [
  { key: 'extremely_preterm', label: 'Extremadamente Prematuro', minWeeks: 22, maxWeeks: 27, color: '#EF4444' },
  { key: 'very_preterm', label: 'Muy Prematuro', minWeeks: 28, maxWeeks: 31, color: '#F59E0B' },
  { key: 'moderate_preterm', label: 'Prematuro Moderado', minWeeks: 32, maxWeeks: 33, color: '#EAB308' },
  { key: 'late_preterm', label: 'Prematuro Tardío', minWeeks: 34, maxWeeks: 36, color: '#84CC16' },
  { key: 'term', label: 'A Término', minWeeks: 37, maxWeeks: 41, color: '#22C55E' },
  { key: 'post_term', label: 'Post-Término', minWeeks: 42, maxWeeks: 44, color: '#F97316' },
];

/**
 * Componentes de nutrición parenteral total (TPN)
 */
export const TPN_COMPONENTS = {
  macronutrients: [
    { key: 'dextrose', label: 'Dextrosa', unit: 'g/kg/día', minRange: 4, maxRange: 12 },
    { key: 'amino_acids', label: 'Aminoácidos', unit: 'g/kg/día', minRange: 1.5, maxRange: 4 },
    { key: 'lipids', label: 'Lípidos', unit: 'g/kg/día', minRange: 1, maxRange: 3.5 },
  ],
  electrolytes: [
    { key: 'sodium', label: 'Sodio', unit: 'mEq/kg/día', minRange: 2, maxRange: 5 },
    { key: 'potassium', label: 'Potasio', unit: 'mEq/kg/día', minRange: 1, maxRange: 3 },
    { key: 'calcium', label: 'Calcio', unit: 'mg/kg/día', minRange: 40, maxRange: 80 },
    { key: 'phosphorus', label: 'Fósforo', unit: 'mg/kg/día', minRange: 30, maxRange: 60 },
    { key: 'magnesium', label: 'Magnesio', unit: 'mg/kg/día', minRange: 3, maxRange: 7 },
  ],
};
