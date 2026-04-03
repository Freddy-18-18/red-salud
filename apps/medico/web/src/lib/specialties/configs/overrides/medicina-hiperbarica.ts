/**
 * @file overrides/medicina-hiperbarica.ts
 * @description Override de configuracion para Medicina Hiperbarica.
 *
 * Seguimiento de protocolo de tratamiento, progresion de cicatrizacion,
 * monitoreo de oxigeno transcutaneo, logs de sesion, screening de
 * contraindicaciones.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaHiperbaricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-hiperbarica',
  dashboardPath: '/dashboard/medico/medicina-hiperbarica',

  modules: {
    clinical: [
      {
        key: 'hiper-treatment-protocol',
        label: 'Protocolo de Tratamiento',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-hiperbarica/protocolo',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['treatment_completion_rate'],
      },
      {
        key: 'hiper-wound-progression',
        label: 'Progresion de Cicatrizacion',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-hiperbarica/cicatrizacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['wound_closure_rate'],
      },
      {
        key: 'hiper-tcpo2',
        label: 'Oxigeno Transcutaneo (TcPO2)',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-hiperbarica/tcpo2',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'hiper-session-logs',
        label: 'Logs de Sesion',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-hiperbarica/sesiones',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'hiper-contraindication-screening',
        label: 'Screening de Contraindicaciones',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/medicina-hiperbarica/contraindicaciones',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['adverse_event_rate'],
      },
    ],

    technology: [
      {
        key: 'hiper-chamber-management',
        label: 'Gestion de Camara',
        icon: 'Waves',
        route: '/dashboard/medico/medicina-hiperbarica/camara',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'hiper-analytics',
        label: 'Estadisticas de Practica',
        icon: 'BarChart3',
        route: '/dashboard/medico/medicina-hiperbarica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'hiper-referral-comm',
        label: 'Comunicacion con Referentes',
        icon: 'MessageSquare',
        route: '/dashboard/medico/medicina-hiperbarica/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'treatment-schedule',
      component: '@/components/dashboard/medico/medicina-hiperbarica/widgets/treatment-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'wound-healing-progress',
      component: '@/components/dashboard/medico/medicina-hiperbarica/widgets/wound-healing-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'session-summary',
      component: '@/components/dashboard/medico/medicina-hiperbarica/widgets/session-summary-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'wound_closure_rate',
    'treatment_completion_rate',
    'adverse_event_rate',
    'sessions_per_day',
    'tcpo2_improvement_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    wound_closure_rate: {
      label: 'Tasa de Cierre de Heridas',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    treatment_completion_rate: {
      label: 'Tasa de Tratamiento Completado',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    adverse_event_rate: {
      label: 'Tasa de Eventos Adversos',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    sessions_per_day: {
      label: 'Sesiones por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    tcpo2_improvement_rate: {
      label: 'Mejoria TcPO2',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfaccion del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'sesion_hiperbarica',
      'control_tcpo2',
      'seguimiento_herida',
      'control_final',
    ],
    defaultDuration: 120,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_hiperbarica',
      'log_sesion',
      'medicion_tcpo2',
      'progresion_herida',
      'screening_contraindicaciones',
      'informe_final',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: false,
    customFlags: {
      requiresTreatmentProtocolTracking: true,
      supportsWoundHealingProgression: true,
      supportsTcpo2Monitoring: true,
      requiresSessionLogs: true,
      requiresContraindicationScreening: true,
      supportsChamberManagement: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#0E7490',
    icon: 'Waves',
  },
};
