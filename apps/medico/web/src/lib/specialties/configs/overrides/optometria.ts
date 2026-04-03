/**
 * @file overrides/optometria.ts
 * @description Override de configuración para Optometría.
 *
 * Módulos especializados: registros de refracción, adaptación
 * de lentes de contacto, seguimiento de agudeza visual,
 * evaluación de visión binocular, pruebas de visión cromática,
 * ayudas de baja visión, manejo de ojo seco.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const optometriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'optometria',
  dashboardPath: '/dashboard/medico/optometria',

  modules: {
    clinical: [
      {
        key: 'optom-consulta',
        label: 'Consulta de Optometría',
        icon: 'Stethoscope',
        route: '/dashboard/medico/optometria/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'optom-refraccion',
        label: 'Registros de Refracción',
        icon: 'Eye',
        route: '/dashboard/medico/optometria/refraccion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['refractive_correction_accuracy'],
      },
      {
        key: 'optom-lentes-contacto',
        label: 'Adaptación de Lentes de Contacto',
        icon: 'CircleDot',
        route: '/dashboard/medico/optometria/lentes-contacto',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'optom-agudeza',
        label: 'Seguimiento de Agudeza Visual',
        icon: 'TrendingUp',
        route: '/dashboard/medico/optometria/agudeza',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'optom-binocular',
        label: 'Visión Binocular',
        icon: 'Glasses',
        route: '/dashboard/medico/optometria/binocular',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'optom-cromatica',
        label: 'Pruebas de Visión Cromática',
        icon: 'Palette',
        route: '/dashboard/medico/optometria/cromatica',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'optom-baja-vision',
        label: 'Ayudas de Baja Visión',
        icon: 'ZoomIn',
        route: '/dashboard/medico/optometria/baja-vision',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'optom-ojo-seco',
        label: 'Manejo de Ojo Seco',
        icon: 'Droplets',
        route: '/dashboard/medico/optometria/ojo-seco',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'optom-topografia',
        label: 'Topografía Corneal',
        icon: 'Scan',
        route: '/dashboard/medico/optometria/topografia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'optom-autorefractometria',
        label: 'Autorefractometría',
        icon: 'Focus',
        route: '/dashboard/medico/optometria/autorefractometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'optom-calculadoras',
        label: 'Calculadoras Ópticas',
        icon: 'Calculator',
        route: '/dashboard/medico/optometria/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'optom-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/optometria/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'optom-remisiones',
        label: 'Remisiones a Oftalmología',
        icon: 'Share2',
        route: '/dashboard/medico/optometria/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'optom-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/optometria/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'visual-acuity-trends',
      component: '@/components/dashboard/medico/optometria/widgets/visual-acuity-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'refraction-records',
      component: '@/components/dashboard/medico/optometria/widgets/refraction-records-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'contact-lens-follow-up',
      component: '@/components/dashboard/medico/optometria/widgets/contact-lens-follow-up-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'refractive_correction_accuracy',
    'patient_satisfaction_score',
    'follow_up_compliance_rate',
    'contact_lens_success_rate',
    'referral_rate_to_ophthalmology',
    'dry_eye_management_outcomes',
  ],

  kpiDefinitions: {
    refractive_correction_accuracy: {
      label: 'Precisión de Corrección Refractiva',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    follow_up_compliance_rate: {
      label: 'Adherencia al Seguimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    contact_lens_success_rate: {
      label: 'Éxito en Adaptación de Lentes de Contacto',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    referral_rate_to_ophthalmology: {
      label: 'Tasa de Referencia a Oftalmología',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    dry_eye_management_outcomes: {
      label: 'Resultados de Manejo de Ojo Seco',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'examen_visual_completo',
      'refraccion',
      'adaptacion_lentes_contacto',
      'control_lentes_contacto',
      'evaluacion_binocular',
      'baja_vision',
      'manejo_ojo_seco',
      'seguimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'examen_optometrico',
      'prescripcion_optica',
      'adaptacion_lentes_contacto',
      'evaluacion_binocular',
      'evaluacion_baja_vision',
      'manejo_ojo_seco',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      tracksRefraction: true,
      supportsContactLensFitting: true,
      tracksVisualAcuity: true,
      supportsBinocularVision: true,
      supportsColorVisionTesting: true,
      supportsLowVisionAids: true,
      tracksDryEye: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#0E7490',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE OPTOMETRÍA
// ============================================================================

/**
 * Clasificación de defectos refractivos
 */
export const REFRACTIVE_ERRORS = [
  { key: 'myopia', label: 'Miopía', description: 'Enfoque delante de la retina', correction: 'Lentes divergentes (-)' },
  { key: 'hyperopia', label: 'Hipermetropía', description: 'Enfoque detrás de la retina', correction: 'Lentes convergentes (+)' },
  { key: 'astigmatism', label: 'Astigmatismo', description: 'Curvatura irregular de la córnea', correction: 'Lentes cilíndricas' },
  { key: 'presbyopia', label: 'Presbicia', description: 'Pérdida de acomodación relacionada con la edad', correction: 'Adición para cerca' },
] as const;

/**
 * Escala de agudeza visual (Snellen)
 */
export const SNELLEN_VISUAL_ACUITY = [
  { notation: '20/10', decimal: 2.0, logMAR: -0.3, category: 'Excepcional' },
  { notation: '20/15', decimal: 1.33, logMAR: -0.12, category: 'Excelente' },
  { notation: '20/20', decimal: 1.0, logMAR: 0.0, category: 'Normal' },
  { notation: '20/25', decimal: 0.8, logMAR: 0.1, category: 'Casi normal' },
  { notation: '20/30', decimal: 0.67, logMAR: 0.18, category: 'Leve reducción' },
  { notation: '20/40', decimal: 0.5, logMAR: 0.3, category: 'Moderada reducción' },
  { notation: '20/50', decimal: 0.4, logMAR: 0.4, category: 'Moderada reducción' },
  { notation: '20/70', decimal: 0.29, logMAR: 0.54, category: 'Baja visión leve' },
  { notation: '20/100', decimal: 0.2, logMAR: 0.7, category: 'Baja visión moderada' },
  { notation: '20/200', decimal: 0.1, logMAR: 1.0, category: 'Ceguera legal' },
] as const;
