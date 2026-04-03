/**
 * @file overrides/homeopatia.ts
 * @description Override de configuración para Homeopatía.
 *
 * Módulos especializados: evaluación constitucional, seguimiento
 * de remedios, documentación de potencia, monitoreo de
 * agravación, repertorización de casos, referencia de
 * materia médica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const homeopatiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'homeopatia',
  dashboardPath: '/dashboard/medico/homeopatia',

  modules: {
    clinical: [
      {
        key: 'homeo-consulta',
        label: 'Consulta Homeopática',
        icon: 'Stethoscope',
        route: '/dashboard/medico/homeopatia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'homeo-constitucional',
        label: 'Evaluación Constitucional',
        icon: 'User',
        route: '/dashboard/medico/homeopatia/constitucional',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'homeo-remedios',
        label: 'Seguimiento de Remedios',
        icon: 'Leaf',
        route: '/dashboard/medico/homeopatia/remedios',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'homeo-potencia',
        label: 'Documentación de Potencia',
        icon: 'ArrowUp',
        route: '/dashboard/medico/homeopatia/potencia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'homeo-agravacion',
        label: 'Monitoreo de Agravación',
        icon: 'AlertCircle',
        route: '/dashboard/medico/homeopatia/agravacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'homeo-repertorizacion',
        label: 'Repertorización de Casos',
        icon: 'BookOpen',
        route: '/dashboard/medico/homeopatia/repertorizacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'homeo-materia-medica',
        label: 'Referencia de Materia Médica',
        icon: 'Library',
        route: '/dashboard/medico/homeopatia/materia-medica',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'homeo-seguimiento-sintomas',
        label: 'Seguimiento de Síntomas',
        icon: 'TrendingUp',
        route: '/dashboard/medico/homeopatia/seguimiento-sintomas',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'homeo-repertorio',
        label: 'Repertorio Digital',
        icon: 'Search',
        route: '/dashboard/medico/homeopatia/repertorio',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'homeo-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/homeopatia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'homeo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/homeopatia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'homeo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/homeopatia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'symptom-improvement-tracker',
      component: '@/components/dashboard/medico/homeopatia/widgets/symptom-improvement-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'remedy-history',
      component: '@/components/dashboard/medico/homeopatia/widgets/remedy-history-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'follow-up-compliance',
      component: '@/components/dashboard/medico/homeopatia/widgets/follow-up-compliance-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'symptom_improvement_rate',
    'treatment_satisfaction_score',
    'follow_up_compliance_rate',
    'remedy_response_rate',
    'aggravation_frequency',
    'constitutional_match_rate',
  ],

  kpiDefinitions: {
    symptom_improvement_rate: {
      label: 'Tasa de Mejoría Sintomática',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    treatment_satisfaction_score: {
      label: 'Satisfacción con el Tratamiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    follow_up_compliance_rate: {
      label: 'Adherencia al Seguimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    remedy_response_rate: {
      label: 'Tasa de Respuesta al Remedio',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    aggravation_frequency: {
      label: 'Frecuencia de Agravaciones',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    constitutional_match_rate: {
      label: 'Tasa de Coincidencia Constitucional',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez_constitucional',
      'seguimiento',
      'repertorizacion',
      'agravacion',
      'cambio_remedio',
      'control_cronico',
    ],
    defaultDuration: 60,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_constitucional',
      'repertorizacion',
      'prescripcion_remedio',
      'seguimiento_remedio',
      'monitoreo_agravacion',
      'nota_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresConstitutionalAssessment: true,
      tracksRemedies: true,
      tracksPotencies: true,
      monitorsAggravation: true,
      supportsRepertorization: true,
      referencesMateriaMediaca: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'Leaf',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE HOMEOPATÍA
// ============================================================================

/**
 * Escalas de potencia homeopática
 */
export const HOMEOPATHIC_POTENCY_SCALES = [
  { scale: 'centesimal', notation: 'C / CH', examples: ['6C', '12C', '30C', '200C', '1M', '10M'], description: 'Dilución 1:100 en cada paso' },
  { scale: 'decimal', notation: 'D / X / DH', examples: ['6D', '12D', '30D', '200D'], description: 'Dilución 1:10 en cada paso' },
  { scale: 'lm', notation: 'LM / Q', examples: ['LM1', 'LM6', 'LM12', 'LM18'], description: 'Dilución 1:50.000 (quinquagintamilesimal)' },
] as const;

/**
 * Leyes de curación de Hering (dirección de la curación)
 */
export const HERING_LAWS = [
  { key: 'inside_out', label: 'De dentro hacia afuera', description: 'Los síntomas se mueven de órganos internos a la piel' },
  { key: 'top_down', label: 'De arriba hacia abajo', description: 'Los síntomas se mueven de la cabeza hacia las extremidades' },
  { key: 'reverse_order', label: 'En orden inverso', description: 'Los síntomas desaparecen en orden inverso a su aparición' },
  { key: 'important_first', label: 'Lo más importante primero', description: 'Los síntomas más vitales mejoran antes que los menos vitales' },
] as const;
