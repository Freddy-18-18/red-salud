/**
 * @file overrides/radiologia.ts
 * @description Override de configuracion para Radiologia.
 *
 * Reporte estructurado (BI-RADS, LI-RADS, PI-RADS, Lung-RADS),
 * worklist management, alertas de hallazgos criticos, dose tracking
 * (DLP/CTDIvol), revision por pares, teaching file.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const radiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'radiologia',
  dashboardPath: '/dashboard/medico/radiologia',

  modules: {
    clinical: [
      {
        key: 'radiol-worklist',
        label: 'Worklist',
        icon: 'ClipboardList',
        route: '/dashboard/medico/radiologia/worklist',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['report_turnaround_time', 'studies_per_day'],
      },
      {
        key: 'radiol-structured-report',
        label: 'Reporte Estructurado',
        icon: 'FileText',
        route: '/dashboard/medico/radiologia/reporte-estructurado',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'radiol-birads',
        label: 'BI-RADS / LI-RADS',
        icon: 'Target',
        route: '/dashboard/medico/radiologia/birads',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'radiol-pirads',
        label: 'PI-RADS',
        icon: 'Target',
        route: '/dashboard/medico/radiologia/pirads',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'radiol-lung-rads',
        label: 'Lung-RADS',
        icon: 'Wind',
        route: '/dashboard/medico/radiologia/lung-rads',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'radiol-critical-findings',
        label: 'Hallazgos Criticos',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/radiologia/hallazgos-criticos',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['critical_finding_communication_time'],
      },
    ],

    technology: [
      {
        key: 'radiol-pacs',
        label: 'PACS / Visor',
        icon: 'Scan',
        route: '/dashboard/medico/radiologia/pacs',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'radiol-dose-tracking',
        label: 'Seguimiento de Dosis',
        icon: 'Radiation',
        route: '/dashboard/medico/radiologia/dosis',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'radiol-peer-review',
        label: 'Revision por Pares',
        icon: 'Users',
        route: '/dashboard/medico/radiologia/revision-pares',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['concordance_rate'],
      },
      {
        key: 'radiol-teaching-file',
        label: 'Archivo Docente',
        icon: 'BookOpen',
        route: '/dashboard/medico/radiologia/archivo-docente',
        group: 'growth',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'radiol-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/radiologia/analytics',
        group: 'growth',
        order: 3,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'radiol-referral-comm',
        label: 'Comunicacion con Referentes',
        icon: 'MessageSquare',
        route: '/dashboard/medico/radiologia/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'worklist-status',
      component: '@/components/dashboard/medico/radiologia/widgets/worklist-status-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'critical-findings',
      component: '@/components/dashboard/medico/radiologia/widgets/critical-findings-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'dose-metrics',
      component: '@/components/dashboard/medico/radiologia/widgets/dose-metrics-widget',
      size: 'medium',
    },
    {
      key: 'turnaround-trend',
      component: '@/components/dashboard/medico/radiologia/widgets/turnaround-trend-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'report_turnaround_time',
    'critical_finding_communication_time',
    'concordance_rate',
    'studies_per_day',
    'dose_dlp_average',
    'peer_review_completion_rate',
  ],

  kpiDefinitions: {
    report_turnaround_time: {
      label: 'Tiempo de Respuesta de Informe',
      format: 'duration',
      goal: 24,
      direction: 'lower_is_better',
    },
    critical_finding_communication_time: {
      label: 'Comunicacion de Hallazgo Critico',
      format: 'duration',
      goal: 1,
      direction: 'lower_is_better',
    },
    concordance_rate: {
      label: 'Tasa de Concordancia',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    studies_per_day: {
      label: 'Estudios por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    dose_dlp_average: {
      label: 'DLP Promedio (mGy*cm)',
      format: 'number',
      direction: 'lower_is_better',
    },
    peer_review_completion_rate: {
      label: 'Tasa de Revision por Pares',
      format: 'percentage',
      goal: 0.05,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'radiografia_simple',
      'tomografia',
      'resonancia_magnetica',
      'mamografia',
      'fluoroscopia',
      'procedimiento_intervencionista',
    ],
    defaultDuration: 15,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_radiografia',
      'informe_tomografia',
      'informe_resonancia',
      'informe_mamografia',
      'birads_assessment',
      'hallazgo_critico',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresStructuredReporting: true,
      supportsBiRads: true,
      supportsLiRads: true,
      supportsPiRads: true,
      supportsLungRads: true,
      tracksDoseMetrics: true,
      requiresCriticalFindingAlert: true,
      supportsPeerReview: true,
      supportsTeachingFile: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Scan',
  },
};
