/**
 * @file overrides/medicina-emergencias.ts
 * @description Override de configuracion para Medicina de Emergencias.
 *
 * Triage (ESI), evaluacion de trauma (ATLS), documentacion de reanimacion,
 * protocolos tiempo-dependientes (stroke, STEMI, sepsis), sedacion
 * procedimental, seguimiento de disposicion.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaEmergenciasOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-emergencias',
  dashboardPath: '/dashboard/medico/medicina-emergencias',

  modules: {
    clinical: [
      {
        key: 'emerg-triage',
        label: 'Triage (ESI)',
        icon: 'AlertCircle',
        route: '/dashboard/medico/medicina-emergencias/triage',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['door_to_doctor_time'],
      },
      {
        key: 'emerg-trauma',
        label: 'Evaluacion de Trauma (ATLS)',
        icon: 'Siren',
        route: '/dashboard/medico/medicina-emergencias/trauma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'emerg-resuscitation',
        label: 'Documentacion de Reanimacion',
        icon: 'HeartPulse',
        route: '/dashboard/medico/medicina-emergencias/reanimacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'emerg-time-critical',
        label: 'Protocolos Tiempo-Dependientes',
        icon: 'Timer',
        route: '/dashboard/medico/medicina-emergencias/protocolos-criticos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'emerg-procedural-sedation',
        label: 'Sedacion Procedimental',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-emergencias/sedacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'emerg-disposition',
        label: 'Seguimiento de Disposicion',
        icon: 'ArrowRightLeft',
        route: '/dashboard/medico/medicina-emergencias/disposicion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['lwbs_rate'],
      },
    ],

    technology: [
      {
        key: 'emerg-tracking-board',
        label: 'Tablero de Seguimiento',
        icon: 'LayoutDashboard',
        route: '/dashboard/medico/medicina-emergencias/tracking-board',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'emerg-analytics',
        label: 'Estadisticas de Emergencia',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-emergencias/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'emerg-consult-comm',
        label: 'Consulta a Especialistas',
        icon: 'Phone',
        route: '/dashboard/medico/medicina-emergencias/consultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ed-tracking-board',
      component: '@/components/dashboard/medico/medicina-emergencias/widgets/tracking-board-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'triage-queue',
      component: '@/components/dashboard/medico/medicina-emergencias/widgets/triage-queue-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'time-critical-alerts',
      component: '@/components/dashboard/medico/medicina-emergencias/widgets/time-critical-alerts-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'capacity-status',
      component: '@/components/dashboard/medico/medicina-emergencias/widgets/capacity-status-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'door_to_doctor_time',
    'lwbs_rate',
    'mortality_index',
    'stroke_door_to_needle',
    'stemi_door_to_balloon',
    'sepsis_bundle_compliance',
  ],

  kpiDefinitions: {
    door_to_doctor_time: {
      label: 'Tiempo Puerta-Medico',
      format: 'duration',
      goal: 0.5,
      direction: 'lower_is_better',
    },
    lwbs_rate: {
      label: 'Tasa de LWBS',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    mortality_index: {
      label: 'Indice de Mortalidad',
      format: 'number',
      goal: 1,
      direction: 'lower_is_better',
    },
    stroke_door_to_needle: {
      label: 'Stroke: Puerta-Aguja',
      format: 'duration',
      goal: 1,
      direction: 'lower_is_better',
    },
    stemi_door_to_balloon: {
      label: 'STEMI: Puerta-Balon',
      format: 'duration',
      goal: 1.5,
      direction: 'lower_is_better',
    },
    sepsis_bundle_compliance: {
      label: 'Cumplimiento Bundle Sepsis',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'triage',
      'consulta_emergencia',
      'trauma',
      'reanimacion',
      'sedacion_procedimental',
      'observacion',
      'alta_emergencia',
    ],
    defaultDuration: 10,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'triage_esi',
      'evaluacion_trauma_atls',
      'documentacion_reanimacion',
      'protocolo_stroke',
      'protocolo_stemi',
      'protocolo_sepsis',
      'sedacion_procedimental',
      'nota_disposicion',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresTriageEsi: true,
      supportsTraumaAtls: true,
      requiresResuscitationDocumentation: true,
      supportsTimeCriticalProtocols: true,
      supportsProceduralSedation: true,
      tracksDisposition: true,
      requiresTrackingBoard: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'Siren',
  },
};
