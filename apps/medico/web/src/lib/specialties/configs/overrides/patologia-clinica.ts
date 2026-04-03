/**
 * @file overrides/patologia-clinica.ts
 * @description Override de configuracion para Patologia Clinica.
 *
 * Control de calidad de laboratorio, gestion de rangos de referencia,
 * alertas de valores criticos, mantenimiento de instrumentos, pruebas
 * de aptitud.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const patologiaClinicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'patologia-clinica',
  dashboardPath: '/dashboard/medico/patologia-clinica',

  modules: {
    clinical: [
      {
        key: 'patoclin-quality-control',
        label: 'Control de Calidad',
        icon: 'CheckCircle',
        route: '/dashboard/medico/patologia-clinica/control-calidad',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['qc_compliance_rate'],
      },
      {
        key: 'patoclin-reference-ranges',
        label: 'Rangos de Referencia',
        icon: 'Sliders',
        route: '/dashboard/medico/patologia-clinica/rangos-referencia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'patoclin-critical-values',
        label: 'Valores Criticos',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/patologia-clinica/valores-criticos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['critical_value_notification_time'],
      },
      {
        key: 'patoclin-proficiency-testing',
        label: 'Pruebas de Aptitud',
        icon: 'Award',
        route: '/dashboard/medico/patologia-clinica/pruebas-aptitud',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'patoclin-instrument-maintenance',
        label: 'Mantenimiento de Instrumentos',
        icon: 'Wrench',
        route: '/dashboard/medico/patologia-clinica/instrumentos',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'patoclin-lis-integration',
        label: 'Integracion LIS',
        icon: 'Link',
        route: '/dashboard/medico/patologia-clinica/lis',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'patoclin-analytics',
        label: 'Estadisticas de Laboratorio',
        icon: 'TrendingUp',
        route: '/dashboard/medico/patologia-clinica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'patoclin-clinician-comm',
        label: 'Comunicacion con Clinicos',
        icon: 'MessageSquare',
        route: '/dashboard/medico/patologia-clinica/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'qc-dashboard',
      component: '@/components/dashboard/medico/patologia-clinica/widgets/qc-dashboard-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'critical-value-alerts',
      component: '@/components/dashboard/medico/patologia-clinica/widgets/critical-value-alerts-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'instrument-status',
      component: '@/components/dashboard/medico/patologia-clinica/widgets/instrument-status-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'turnaround_time',
    'critical_value_notification_time',
    'qc_compliance_rate',
    'proficiency_testing_score',
    'instrument_uptime_rate',
    'rejected_specimen_rate',
  ],

  kpiDefinitions: {
    turnaround_time: {
      label: 'Tiempo de Respuesta',
      format: 'duration',
      goal: 4,
      direction: 'lower_is_better',
    },
    critical_value_notification_time: {
      label: 'Notificacion de Valor Critico',
      format: 'duration',
      goal: 0.5,
      direction: 'lower_is_better',
    },
    qc_compliance_rate: {
      label: 'Cumplimiento de Control de Calidad',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
    proficiency_testing_score: {
      label: 'Puntaje de Pruebas de Aptitud',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    instrument_uptime_rate: {
      label: 'Disponibilidad de Instrumentos',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
    rejected_specimen_rate: {
      label: 'Tasa de Muestras Rechazadas',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'revision_resultados',
      'consulta_interpretacion',
      'auditoria_calidad',
      'revision_proficiency',
    ],
    defaultDuration: 15,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_qc',
      'alerta_valor_critico',
      'revision_rangos_referencia',
      'reporte_proficiency',
      'mantenimiento_instrumento',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: false,
    supportsTelemedicine: false,
    customFlags: {
      requiresQualityControl: true,
      requiresReferenceRangeManagement: true,
      requiresCriticalValueAlerts: true,
      supportsInstrumentMaintenance: true,
      supportsProficiencyTesting: true,
      supportsLisIntegration: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Flask',
  },
};
