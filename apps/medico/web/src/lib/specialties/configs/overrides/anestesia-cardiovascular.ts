/**
 * @file overrides/anestesia-cardiovascular.ts
 * @description Override de configuracion para Anestesia Cardiovascular.
 *
 * Documentacion de ETE, manejo de bypass, monitoreo de coagulacion
 * (ACT), seguimiento hemodinamico, manejo de BCIA/ECMO.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const anestesiaCardiovascularOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'anestesia-cardiovascular',
  dashboardPath: '/dashboard/medico/anestesia-cardiovascular',

  modules: {
    clinical: [
      {
        key: 'anestcardio-tee',
        label: 'Documentacion ETE',
        icon: 'Monitor',
        route: '/dashboard/medico/anestesia-cardiovascular/ete',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['tee_quality_score'],
      },
      {
        key: 'anestcardio-bypass',
        label: 'Manejo de Bypass',
        icon: 'RefreshCw',
        route: '/dashboard/medico/anestesia-cardiovascular/bypass',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'anestcardio-coagulation',
        label: 'Monitoreo de Coagulacion (ACT)',
        icon: 'Timer',
        route: '/dashboard/medico/anestesia-cardiovascular/coagulacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['transfusion_rate'],
      },
      {
        key: 'anestcardio-hemodynamic',
        label: 'Seguimiento Hemodinamico',
        icon: 'Activity',
        route: '/dashboard/medico/anestesia-cardiovascular/hemodinamia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['hemodynamic_stability_index'],
      },
      {
        key: 'anestcardio-iabp-ecmo',
        label: 'BCIA / ECMO',
        icon: 'HeartPulse',
        route: '/dashboard/medico/anestesia-cardiovascular/bcia-ecmo',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'anestcardio-drug-log',
        label: 'Log de Farmacos CV',
        icon: 'Syringe',
        route: '/dashboard/medico/anestesia-cardiovascular/farmacos',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'anestcardio-monitoring',
        label: 'Monitoreo Avanzado',
        icon: 'Cpu',
        route: '/dashboard/medico/anestesia-cardiovascular/monitoreo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'anestcardio-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/anestesia-cardiovascular/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'anestcardio-team-comm',
        label: 'Comunicacion con Equipo CV',
        icon: 'MessageSquare',
        route: '/dashboard/medico/anestesia-cardiovascular/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cv-or-schedule',
      component: '@/components/dashboard/medico/anestesia-cardiovascular/widgets/or-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hemodynamic-monitor',
      component: '@/components/dashboard/medico/anestesia-cardiovascular/widgets/hemodynamic-monitor-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'coagulation-status',
      component: '@/components/dashboard/medico/anestesia-cardiovascular/widgets/coagulation-status-widget',
      size: 'medium',
    },
    {
      key: 'tee-summary',
      component: '@/components/dashboard/medico/anestesia-cardiovascular/widgets/tee-summary-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'hemodynamic_stability_index',
    'transfusion_rate',
    'tee_quality_score',
    'bypass_time_average',
    'cases_per_day',
    'postop_complication_rate',
  ],

  kpiDefinitions: {
    hemodynamic_stability_index: {
      label: 'Indice de Estabilidad Hemodinamica',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    transfusion_rate: {
      label: 'Tasa de Transfusion',
      format: 'percentage',
      goal: 0.3,
      direction: 'lower_is_better',
    },
    tee_quality_score: {
      label: 'Calidad de ETE',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    bypass_time_average: {
      label: 'Tiempo de Bypass Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    cases_per_day: {
      label: 'Casos por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    postop_complication_rate: {
      label: 'Tasa de Complicaciones Postop',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_preanestesica_cv',
      'anestesia_cirugia_cardiaca',
      'anestesia_cirugia_vascular',
      'cateterismo_con_sedacion',
      'manejo_ecmo',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_preanestesica_cv',
      'registro_anestesia_cv',
      'documentacion_ete',
      'manejo_bypass',
      'monitoreo_coagulacion',
      'manejo_bcia_ecmo',
      'nota_postanestesica_cv',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresTeeDocumentation: true,
      supportsBypassManagement: true,
      requiresCoagulationMonitoring: true,
      supportsHemodynamicTracking: true,
      supportsIabpManagement: true,
      supportsEcmoManagement: true,
      requiresAdvancedMonitoring: true,
    },
  },

  theme: {
    primaryColor: '#0EA5E9',
    accentColor: '#0369A1',
    icon: 'HeartPulse',
  },
};
