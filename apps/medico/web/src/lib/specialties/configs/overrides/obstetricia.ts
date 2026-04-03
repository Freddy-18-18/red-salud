/**
 * @file overrides/obstetricia.ts
 * @description Override de configuración para Obstetricia.
 *
 * Módulos especializados: seguimiento prenatal, calculadora de edad gestacional,
 * curvas de crecimiento fetal, score de Bishop, partograma, APGAR,
 * seguimiento postparto, screening de diabetes gestacional.
 *
 * También exporta constantes de dominio obstétrico: trimestres,
 * score de Bishop, score APGAR, screening GDM.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Obstetricia.
 * Especialidad con módulos clínicos especializados para embarazo y parto.
 */
export const obstetriciaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'obstetricia',
  dashboardPath: '/dashboard/medico/obstetricia',

  modules: {
    clinical: [
      {
        key: 'obst-prenatal',
        label: 'Control Prenatal',
        icon: 'Baby',
        route: '/dashboard/medico/obstetricia/prenatal',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['prenatal_visit_compliance', 'preterm_birth_rate'],
      },
      {
        key: 'obst-edad-gestacional',
        label: 'Edad Gestacional',
        icon: 'Calendar',
        route: '/dashboard/medico/obstetricia/edad-gestacional',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Calculadora de edad gestacional por FUM y ecografía',
      },
      {
        key: 'obst-crecimiento-fetal',
        label: 'Crecimiento Fetal',
        icon: 'TrendingUp',
        route: '/dashboard/medico/obstetricia/crecimiento-fetal',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Curvas de crecimiento fetal (Hadlock, Intergrowth-21st)',
      },
      {
        key: 'obst-bishop',
        label: 'Score de Bishop',
        icon: 'Calculator',
        route: '/dashboard/medico/obstetricia/bishop',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Evaluación de madurez cervical para inducción del parto',
      },
      {
        key: 'obst-partograma',
        label: 'Partograma',
        icon: 'LineChart',
        route: '/dashboard/medico/obstetricia/partograma',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Registro gráfico del trabajo de parto (OMS)',
      },
      {
        key: 'obst-apgar',
        label: 'Score APGAR',
        icon: 'Heart',
        route: '/dashboard/medico/obstetricia/apgar',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'obst-postparto',
        label: 'Seguimiento Postparto',
        icon: 'ClipboardList',
        route: '/dashboard/medico/obstetricia/postparto',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['maternal_morbidity_rate'],
      },
      {
        key: 'obst-gdm-screening',
        label: 'Screening Diabetes Gestacional',
        icon: 'FlaskConical',
        route: '/dashboard/medico/obstetricia/gdm-screening',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Tamizaje y seguimiento de diabetes gestacional (OGTT)',
      },
    ],

    lab: [
      {
        key: 'obst-ecografia',
        label: 'Ecografía Obstétrica',
        icon: 'Scan',
        route: '/dashboard/medico/obstetricia/ecografia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'obst-laboratorio',
        label: 'Laboratorio Prenatal',
        icon: 'FlaskConical',
        route: '/dashboard/medico/obstetricia/laboratorio',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'obst-monitoreo-fetal',
        label: 'Monitoreo Fetal (NST/CST)',
        icon: 'Activity',
        route: '/dashboard/medico/obstetricia/monitoreo-fetal',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'obst-calculadoras',
        label: 'Calculadoras Obstétricas',
        icon: 'Calculator',
        route: '/dashboard/medico/obstetricia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'FPP, edad gestacional, percentiles fetales, Bishop, APGAR',
      },
    ],

    communication: [
      {
        key: 'obst-portal-paciente',
        label: 'Portal de la Gestante',
        icon: 'User',
        route: '/dashboard/medico/obstetricia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'obst-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/obstetricia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'prenatal-timeline',
      component: '@/components/dashboard/medico/obstetricia/widgets/prenatal-timeline-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'fetal-growth-curves',
      component: '@/components/dashboard/medico/obstetricia/widgets/fetal-growth-curves-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'gestational-age-calc',
      component: '@/components/dashboard/medico/obstetricia/widgets/gestational-age-calc-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'upcoming-deliveries',
      component: '@/components/dashboard/medico/obstetricia/widgets/upcoming-deliveries-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'csection_rate',
    'preterm_birth_rate',
    'prenatal_visit_compliance',
    'maternal_morbidity_rate',
    'gdm_screening_rate',
    'vaginal_delivery_success',
  ],

  kpiDefinitions: {
    csection_rate: {
      label: 'Tasa de Cesáreas',
      format: 'percentage',
      goal: 0.25,
      direction: 'lower_is_better',
    },
    preterm_birth_rate: {
      label: 'Tasa de Parto Pretérmino',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    prenatal_visit_compliance: {
      label: 'Cumplimiento de Controles Prenatales',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    maternal_morbidity_rate: {
      label: 'Morbilidad Materna',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    gdm_screening_rate: {
      label: 'Tasa de Screening GDM',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    vaginal_delivery_success: {
      label: 'Éxito de Parto Vaginal',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'control_prenatal_1er_trimestre',
      'control_prenatal_2do_trimestre',
      'control_prenatal_3er_trimestre',
      'ecografia_obstetrica',
      'monitoreo_fetal',
      'screening_gdm',
      'evaluacion_bishop',
      'control_postparto',
      'urgencia_obstetrica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_obstetrica',
      'control_prenatal',
      'ecografia_obstetrica',
      'partograma',
      'score_apgar',
      'nota_parto',
      'control_postparto',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresGestationalAgeTracking: true,
      usesFetalGrowthCurves: true,
      tracksPrenatalVisits: true,
      requiresBishopScore: true,
      usesPartograph: true,
      tracksAPGAR: true,
      requiresGDMScreening: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO OBSTÉTRICO
// ============================================================================

/**
 * Trimestres del embarazo
 */
export const PREGNANCY_TRIMESTERS = [
  { key: 'first', label: 'Primer Trimestre', weekRange: '1-12', keyEvents: ['Organogénesis', 'Screening 1er trimestre', 'Ecografía temprana'] },
  { key: 'second', label: 'Segundo Trimestre', weekRange: '13-27', keyEvents: ['Screening GDM', 'Ecografía morfológica (20 sem)', 'Movimientos fetales'] },
  { key: 'third', label: 'Tercer Trimestre', weekRange: '28-40+', keyEvents: ['Monitoreo fetal', 'Evaluación Bishop', 'Preparación parto'] },
] as const;

/**
 * Score de Bishop para evaluación de madurez cervical
 */
export const BISHOP_SCORE_CRITERIA = [
  {
    key: 'dilation',
    label: 'Dilatación (cm)',
    scoring: { 0: 'Cerrado', 1: '1-2 cm', 2: '3-4 cm', 3: '≥5 cm' },
  },
  {
    key: 'effacement',
    label: 'Borramiento (%)',
    scoring: { 0: '0-30%', 1: '40-50%', 2: '60-70%', 3: '≥80%' },
  },
  {
    key: 'station',
    label: 'Estación',
    scoring: { 0: '-3', 1: '-2', 2: '-1 / 0', 3: '+1 / +2' },
  },
  {
    key: 'consistency',
    label: 'Consistencia',
    scoring: { 0: 'Firme', 1: 'Medio', 2: 'Blando' },
  },
  {
    key: 'position',
    label: 'Posición',
    scoring: { 0: 'Posterior', 1: 'Medio', 2: 'Anterior' },
  },
] as const;

/**
 * Score APGAR — evaluación del recién nacido
 */
export const APGAR_CRITERIA = [
  {
    key: 'appearance',
    label: 'Apariencia (Color)',
    scoring: { 0: 'Cianótico / Pálido', 1: 'Acrocianosis', 2: 'Rosado total' },
  },
  {
    key: 'pulse',
    label: 'Pulso (FC)',
    scoring: { 0: 'Ausente', 1: '<100 lpm', 2: '≥100 lpm' },
  },
  {
    key: 'grimace',
    label: 'Irritabilidad Refleja',
    scoring: { 0: 'Sin respuesta', 1: 'Mueca', 2: 'Llanto vigoroso' },
  },
  {
    key: 'activity',
    label: 'Actividad (Tono)',
    scoring: { 0: 'Flácido', 1: 'Flexión parcial', 2: 'Movimiento activo' },
  },
  {
    key: 'respiration',
    label: 'Respiración',
    scoring: { 0: 'Ausente', 1: 'Débil / Irregular', 2: 'Llanto fuerte' },
  },
] as const;
