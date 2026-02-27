/**
 * @file overrides/cardiologia.ts
 * @description Override de configuración para Cardiología.
 *
 * Preserva los módulos especializados (ECG, ecocardiograma, Holter, etc.),
 * widgets, KPIs y settings del config original de cardiology.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cardiología.
 * Especialidad con módulos clínicos especializados.
 */
export const cardiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cardiologia',
  dashboardPath: '/dashboard/medico/cardiologia',

  modules: {
    clinical: [
      {
        key: 'cardio-consulta',
        label: 'Consulta Cardiológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cardiologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cardio-ecg',
        label: 'Electrocardiograma',
        icon: 'Activity',
        route: '/dashboard/medico/cardiologia/ecg',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cardio-echo',
        label: 'Ecocardiograma',
        icon: 'Monitor',
        route: '/dashboard/medico/cardiologia/eco',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'cardio-stress-test',
        label: 'Prueba de Esfuerzo',
        icon: 'Zap',
        route: '/dashboard/medico/cardiologia/prueba-esfuerzo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'cardio-holter',
        label: 'Holter',
        icon: 'Watch',
        route: '/dashboard/medico/cardiologia/holter',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
    ],

    financial: [
      {
        key: 'cardio-facturacion',
        label: 'Reclamaciones',
        icon: 'FileText',
        route: '/dashboard/medico/cardiologia/reclamaciones',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardio-seguros',
        label: 'Seguros',
        icon: 'Shield',
        route: '/dashboard/medico/cardiologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cardio-pacs',
        label: 'PACS / Imágenes',
        icon: 'Scan',
        route: '/dashboard/medico/cardiologia/pacs',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardio-telecardiologia',
        label: 'Telecardiología',
        icon: 'Video',
        route: '/dashboard/medico/cardiologia/telecardiologia',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cardio-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/cardiologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'cardio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cardiologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cardio-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cardiologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'patient-status',
      component: '@/components/dashboard/medico/cardiologia/widgets/patient-status-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-procedures',
      component: '@/components/dashboard/medico/cardiologia/widgets/upcoming-procedures-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ecg-queue',
      component: '@/components/dashboard/medico/cardiologia/widgets/ecg-queue-widget',
      size: 'medium',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/cardiologia/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'patient_throughput',
    'ecg_turnaround_time',
    'echo_utilization_rate',
    'no_show_rate',
    'patient_satisfaction_score',
    'referral_conversion_rate',
  ],

  kpiDefinitions: {
    patient_throughput: {
      label: 'Pacientes por Día',
      format: 'number',
      direction: 'higher_is_better',
    },
    ecg_turnaround_time: {
      label: 'Tiempo de Respuesta ECG',
      format: 'duration',
      goal: 24,
      direction: 'lower_is_better',
    },
    echo_utilization_rate: {
      label: 'Tasa de Utilización de Eco',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    no_show_rate: {
      label: 'Tasa de Inasistencia',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    referral_conversion_rate: {
      label: 'Conversión de Remisiones',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'ecg',
      'ecocardiograma',
      'prueba_esfuerzo',
      'holter_colocacion',
      'holter_retiro',
      'consulta_post_procedimiento',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_cardiovascular',
      'examen_fisico_cardiovascular',
      'interpretacion_ecg',
      'informe_ecocardiograma',
      'informe_prueba_esfuerzo',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresEcgInterpretation: true,
      supportsMultiLeadEcg: true,
      requiresStressTestMonitoring: true,
      tracksCardiovascularRisk: true,
    },
  },

  theme: {
    primaryColor: '#ef4444',
    accentColor: '#f97316',
    icon: 'Heart',
  },
};
