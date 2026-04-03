/**
 * @file overrides/anestesiologia.ts
 * @description Override de configuracion para Anestesiologia.
 *
 * Evaluacion preoperatoria (ASA, Mallampati), documentacion de via aerea,
 * registro de anestesia (timeline de vitales), log de administracion de
 * farmacos, score PACU (Aldrete), bloqueos regionales.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const anestesiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'anestesiologia',
  dashboardPath: '/dashboard/medico/anestesiologia',

  modules: {
    clinical: [
      {
        key: 'anest-preop-assessment',
        label: 'Evaluacion Preoperatoria',
        icon: 'ClipboardList',
        route: '/dashboard/medico/anestesiologia/evaluacion-preop',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['preop_completion_rate'],
      },
      {
        key: 'anest-airway-management',
        label: 'Manejo de Via Aerea',
        icon: 'Wind',
        route: '/dashboard/medico/anestesiologia/via-aerea',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['difficult_airway_rate'],
      },
      {
        key: 'anest-anesthesia-record',
        label: 'Registro de Anestesia',
        icon: 'Activity',
        route: '/dashboard/medico/anestesiologia/registro',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'anest-drug-log',
        label: 'Log de Farmacos',
        icon: 'Syringe',
        route: '/dashboard/medico/anestesiologia/farmacos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'anest-pacu-scoring',
        label: 'Score PACU (Aldrete)',
        icon: 'HeartPulse',
        route: '/dashboard/medico/anestesiologia/pacu',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'anest-regional-blocks',
        label: 'Bloqueos Regionales',
        icon: 'MapPin',
        route: '/dashboard/medico/anestesiologia/bloqueos',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'anest-monitoring',
        label: 'Monitoreo Intraoperatorio',
        icon: 'Monitor',
        route: '/dashboard/medico/anestesiologia/monitoreo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'anest-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/anestesiologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'anest-surgeon-comm',
        label: 'Comunicacion con Cirujanos',
        icon: 'MessageSquare',
        route: '/dashboard/medico/anestesiologia/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'or-schedule',
      component: '@/components/dashboard/medico/anestesiologia/widgets/or-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'preop-pending',
      component: '@/components/dashboard/medico/anestesiologia/widgets/preop-pending-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pacu-status',
      component: '@/components/dashboard/medico/anestesiologia/widgets/pacu-status-widget',
      size: 'medium',
    },
    {
      key: 'adverse-events',
      component: '@/components/dashboard/medico/anestesiologia/widgets/adverse-events-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'difficult_airway_rate',
    'ponv_rate',
    'unplanned_icu_admission_rate',
    'preop_completion_rate',
    'cases_per_day',
    'regional_block_success_rate',
  ],

  kpiDefinitions: {
    difficult_airway_rate: {
      label: 'Tasa de Via Aerea Dificil',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    ponv_rate: {
      label: 'Tasa de NVPO',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    unplanned_icu_admission_rate: {
      label: 'Admision UCI No Planificada',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    preop_completion_rate: {
      label: 'Evaluacion Preop Completa',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
    cases_per_day: {
      label: 'Casos por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    regional_block_success_rate: {
      label: 'Exito de Bloqueos Regionales',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_preanestesica',
      'anestesia_general',
      'anestesia_regional',
      'sedacion',
      'analgesia_postoperatoria',
      'bloqueo_nervioso',
    ],
    defaultDuration: 15,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_preanestesica',
      'registro_anestesia',
      'manejo_via_aerea',
      'log_farmacos',
      'score_aldrete',
      'bloqueo_regional',
      'nota_postanestesica',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: false,
    customFlags: {
      requiresPreopAssessment: true,
      supportsAsaClassification: true,
      supportsMallampatiScore: true,
      requiresAirwayDocumentation: true,
      supportsVitalsTimeline: true,
      requiresDrugLog: true,
      supportsPacuScoring: true,
      supportsRegionalBlocks: true,
    },
  },

  theme: {
    primaryColor: '#0EA5E9',
    accentColor: '#0369A1',
    icon: 'Syringe',
  },
};
