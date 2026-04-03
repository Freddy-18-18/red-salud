/**
 * @file overrides/odontopediatria.ts
 * @description Override de configuración para Odontopediatría.
 *
 * Módulos especializados: carta de erupción dental, evaluación de riesgo de
 * caries (CAMBRA), manejo conductual, seguimiento de aplicación de flúor,
 * registro de mantenedores de espacio, documentación de trauma.
 *
 * También exporta constantes de dominio: cronología de erupción,
 * categorías CAMBRA, técnicas de manejo conductual.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Odontopediatría.
 * Especialidad odontológica centrada en atención dental infantil.
 */
export const odontopediatriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'odontopediatria',
  dashboardPath: '/dashboard/medico/odontopediatria',

  modules: {
    clinical: [
      {
        key: 'dental-pedi-erupcion',
        label: 'Carta de Erupción',
        icon: 'Baby',
        route: '/dashboard/medico/odontopediatria/erupcion',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        description: 'Cronología de erupción dental decidua y permanente',
      },
      {
        key: 'dental-pedi-cambra',
        label: 'Riesgo de Caries (CAMBRA)',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/odontopediatria/cambra',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['caries_rate', 'preventive_compliance'],
        description: 'Evaluación de riesgo de caries por edad',
      },
      {
        key: 'dental-pedi-conductual',
        label: 'Manejo Conductual',
        icon: 'Smile',
        route: '/dashboard/medico/odontopediatria/conductual',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['behavioral_success'],
        description: 'Técnicas de manejo de conducta, escala de Frankl',
      },
      {
        key: 'dental-pedi-fluor',
        label: 'Aplicación de Flúor',
        icon: 'Droplet',
        route: '/dashboard/medico/odontopediatria/fluor',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Registro de barniz fluorado, frecuencia y concentración',
      },
      {
        key: 'dental-pedi-mantenedor',
        label: 'Mantenedores de Espacio',
        icon: 'Maximize',
        route: '/dashboard/medico/odontopediatria/mantenedor',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'dental-pedi-trauma',
        label: 'Trauma Dental',
        icon: 'AlertCircle',
        route: '/dashboard/medico/odontopediatria/trauma',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Clasificación y seguimiento de trauma dentoalveolar',
      },
    ],

    lab: [
      {
        key: 'dental-pedi-radiologia',
        label: 'Radiología Pediátrica',
        icon: 'Image',
        route: '/dashboard/medico/odontopediatria/radiologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dental-pedi-calculadoras',
        label: 'Calculadoras Odontopediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/odontopediatria/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'CAMBRA scoring, dosis de flúor por peso, predicción de erupción',
      },
    ],

    communication: [
      {
        key: 'dental-pedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/odontopediatria/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/odontopediatria/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'eruption-chart',
      component: '@/components/dashboard/medico/odontopediatria/widgets/eruption-chart-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'cambra-assessment',
      component: '@/components/dashboard/medico/odontopediatria/widgets/cambra-assessment-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fluoride-tracking',
      component: '@/components/dashboard/medico/odontopediatria/widgets/fluoride-tracking-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'caries_rate',
    'preventive_compliance',
    'behavioral_success',
    'fluoride_application_rate',
    'trauma_followup_rate',
  ],

  kpiDefinitions: {
    caries_rate: {
      label: 'Tasa de Caries',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    preventive_compliance: {
      label: 'Cumplimiento Preventivo',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    behavioral_success: {
      label: 'Éxito de Manejo Conductual',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    fluoride_application_rate: {
      label: 'Tasa de Aplicación de Flúor',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    trauma_followup_rate: {
      label: 'Seguimiento de Trauma',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez_pediatrica',
      'control_caries',
      'aplicacion_fluor',
      'sellantes',
      'pulpotomia',
      'corona_acero',
      'mantenedor_espacio',
      'emergencia_trauma',
      'manejo_conductual',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_odontopediatrica',
      'evaluacion_cambra',
      'informe_conductual',
      'documentacion_trauma',
      'informe_pulpotomia',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresEruptionChart: true,
      usesCAMBRAAssessment: true,
      tracksBehavioralManagement: true,
      tracksFluorideApplications: true,
      requiresParentalConsent: true,
      tracksSpaceMaintainers: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ODONTOPEDIÁTRICO
// ============================================================================

/**
 * Cronología de erupción dental decidua
 */
export const DECIDUOUS_ERUPTION_TIMELINE = [
  { tooth: 'Incisivo central inferior', eruption: '6-10 meses', exfoliation: '6-7 años' },
  { tooth: 'Incisivo central superior', eruption: '8-12 meses', exfoliation: '6-7 años' },
  { tooth: 'Incisivo lateral superior', eruption: '9-13 meses', exfoliation: '7-8 años' },
  { tooth: 'Incisivo lateral inferior', eruption: '10-16 meses', exfoliation: '7-8 años' },
  { tooth: 'Primer molar superior', eruption: '13-19 meses', exfoliation: '9-11 años' },
  { tooth: 'Primer molar inferior', eruption: '14-18 meses', exfoliation: '9-11 años' },
  { tooth: 'Canino superior', eruption: '16-22 meses', exfoliation: '10-12 años' },
  { tooth: 'Canino inferior', eruption: '17-23 meses', exfoliation: '9-12 años' },
  { tooth: 'Segundo molar inferior', eruption: '23-31 meses', exfoliation: '10-12 años' },
  { tooth: 'Segundo molar superior', eruption: '25-33 meses', exfoliation: '10-12 años' },
] as const;

/**
 * Categorías de riesgo CAMBRA
 */
export const CAMBRA_RISK_CATEGORIES = [
  { level: 'low', label: 'Riesgo Bajo', criteria: ['Sin caries activa', 'Sin restauraciones recientes', 'Buena higiene'], interval: '12 meses' },
  { level: 'moderate', label: 'Riesgo Moderado', criteria: ['1-2 caries en últimos 3 años', 'Restauraciones defectuosas', 'Higiene irregular'], interval: '6 meses' },
  { level: 'high', label: 'Riesgo Alto', criteria: ['≥3 caries en últimos 3 años', 'Manchas blancas activas', 'Flujo salival bajo'], interval: '3-4 meses' },
  { level: 'extreme', label: 'Riesgo Extremo', criteria: ['Caries rampante', 'Necesidades especiales', 'Xerostomía severa'], interval: '1-3 meses' },
] as const;

/**
 * Escala de comportamiento de Frankl
 */
export const FRANKL_BEHAVIOR_SCALE = [
  { rating: 1, label: 'Definitivamente Negativo', description: 'Rechazo total, llanto fuerte, miedo extremo' },
  { rating: 2, label: 'Negativo', description: 'Reluctante, sin cooperación, signos de actitud negativa' },
  { rating: 3, label: 'Positivo', description: 'Acepta tratamiento con cautela, disposición a cooperar' },
  { rating: 4, label: 'Definitivamente Positivo', description: 'Cooperación total, interesado, disfruta la visita' },
] as const;
