/**
 * @file overrides/anestesia-pediatrica.ts
 * @description Override de configuracion para Anestesia Pediatrica.
 *
 * Dosificacion por peso, guias NPO por edad, score de croup
 * post-extubacion, evaluacion de delirio de emergencia, protocolos
 * de presencia parental.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const anestesiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'anestesia-pediatrica',
  dashboardPath: '/dashboard/medico/anestesia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'anestpedi-weight-dosing',
        label: 'Dosificacion por Peso',
        icon: 'Calculator',
        route: '/dashboard/medico/anestesia-pediatrica/dosificacion',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'anestpedi-npo-guidelines',
        label: 'Guias NPO por Edad',
        icon: 'Clock',
        route: '/dashboard/medico/anestesia-pediatrica/npo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'anestpedi-preop',
        label: 'Evaluacion Preoperatoria',
        icon: 'ClipboardList',
        route: '/dashboard/medico/anestesia-pediatrica/evaluacion-preop',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'anestpedi-croup-score',
        label: 'Score de Croup Post-Extubacion',
        icon: 'Wind',
        route: '/dashboard/medico/anestesia-pediatrica/croup',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'anestpedi-emergence-delirium',
        label: 'Delirio de Emergencia',
        icon: 'Brain',
        route: '/dashboard/medico/anestesia-pediatrica/delirio-emergencia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['emergence_delirium_rate'],
      },
      {
        key: 'anestpedi-parental-presence',
        label: 'Presencia Parental',
        icon: 'Users',
        route: '/dashboard/medico/anestesia-pediatrica/presencia-parental',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['parental_satisfaction_score'],
      },
    ],

    technology: [
      {
        key: 'anestpedi-monitoring',
        label: 'Monitoreo Pediatrico',
        icon: 'Monitor',
        route: '/dashboard/medico/anestesia-pediatrica/monitoreo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'anestpedi-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/anestesia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'anestpedi-team-comm',
        label: 'Comunicacion con Equipo',
        icon: 'MessageSquare',
        route: '/dashboard/medico/anestesia-pediatrica/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'pediatric-or-schedule',
      component: '@/components/dashboard/medico/anestesia-pediatrica/widgets/or-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'weight-dosing-calculator',
      component: '@/components/dashboard/medico/anestesia-pediatrica/widgets/weight-dosing-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'adverse-events-pediatric',
      component: '@/components/dashboard/medico/anestesia-pediatrica/widgets/adverse-events-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'adverse_event_rate',
    'emergence_delirium_rate',
    'parental_satisfaction_score',
    'npo_compliance_rate',
    'cases_per_day',
    'croup_post_extubation_rate',
  ],

  kpiDefinitions: {
    adverse_event_rate: {
      label: 'Tasa de Eventos Adversos',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    emergence_delirium_rate: {
      label: 'Tasa de Delirio de Emergencia',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    parental_satisfaction_score: {
      label: 'Satisfaccion Parental',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    npo_compliance_rate: {
      label: 'Cumplimiento NPO',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
    cases_per_day: {
      label: 'Casos por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    croup_post_extubation_rate: {
      label: 'Tasa Croup Post-Extubacion',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_preanestesica_pediatrica',
      'anestesia_general_pediatrica',
      'sedacion_pediatrica',
      'bloqueo_caudal',
      'analgesia_postoperatoria_pediatrica',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_preanestesica_pediatrica',
      'dosificacion_por_peso',
      'guias_npo',
      'score_croup',
      'evaluacion_delirio_emergencia',
      'protocolo_presencia_parental',
      'nota_postanestesica_pediatrica',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: false,
    customFlags: {
      requiresWeightBasedDosing: true,
      supportsNpoByAge: true,
      supportsCroupScoring: true,
      supportsEmergenceDeliriumAssessment: true,
      supportsParentalPresenceProtocol: true,
      requiresPediatricEquipmentSizing: true,
    },
  },

  theme: {
    primaryColor: '#0EA5E9',
    accentColor: '#0369A1',
    icon: 'Baby',
  },
};
