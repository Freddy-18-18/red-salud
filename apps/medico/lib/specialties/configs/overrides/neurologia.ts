/**
 * @file overrides/neurologia.ts
 * @description Override de configuración para Neurología.
 *
 * Modules especializados: EEG, EMG/NCV, neuroimagen, epilepsia,
 * cefaleas, Parkinson/demencias, neuro-rehabilitación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const neurologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neurologia',
  dashboardPath: '/dashboard/medico/neurologia',

  modules: {
    clinical: [
      {
        key: 'neuro-consulta',
        label: 'Consulta Neurológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/neurologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'neuro-eeg',
        label: 'Electroencefalograma',
        icon: 'Activity',
        route: '/dashboard/medico/neurologia/eeg',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'neuro-emg',
        label: 'EMG / Neuroconducción',
        icon: 'Zap',
        route: '/dashboard/medico/neurologia/emg',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'neuro-imagen',
        label: 'Neuroimagen',
        icon: 'Scan',
        route: '/dashboard/medico/neurologia/neuroimagen',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'RM cerebral, angio-RM, PET, SPECT',
      },
      {
        key: 'neuro-epilepsia',
        label: 'Clínica de Epilepsia',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/neurologia/epilepsia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'neuro-cefaleas',
        label: 'Clínica de Cefaleas',
        icon: 'Frown',
        route: '/dashboard/medico/neurologia/cefaleas',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'neuro-cognitivo',
        label: 'Evaluación Cognitiva',
        icon: 'Brain',
        route: '/dashboard/medico/neurologia/cognitivo',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'MMSE, MoCA, test neuropsicológicos',
      },
      {
        key: 'neuro-movimiento',
        label: 'Trastornos del Movimiento',
        icon: 'Move',
        route: '/dashboard/medico/neurologia/movimiento',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Parkinson, temblor, distonía, Huntington',
      },
    ],

    financial: [
      {
        key: 'neuro-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/neurologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuro-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/neurologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    laboratory: [
      {
        key: 'neuro-lab',
        label: 'Laboratorio / LCR',
        icon: 'FlaskConical',
        route: '/dashboard/medico/neurologia/laboratorio',
        group: 'laboratory',
        order: 1,
        enabledByDefault: true,
        description: 'Análisis de LCR, biomarcadores, genética',
      },
    ],

    technology: [
      {
        key: 'neuro-telemedicina',
        label: 'Teleneurología',
        icon: 'Video',
        route: '/dashboard/medico/neurologia/teleneurologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuro-pacs',
        label: 'Visor de Neuroimagen',
        icon: 'Monitor',
        route: '/dashboard/medico/neurologia/pacs',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'neuro-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/neurologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuro-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/neurologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'neuro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neurologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'eeg-queue',
      component: '@/components/dashboard/medico/neurologia/widgets/eeg-queue-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'seizure-log',
      component: '@/components/dashboard/medico/neurologia/widgets/seizure-log-widget',
      size: 'medium',
    },
    {
      key: 'cognitive-scores',
      component: '@/components/dashboard/medico/neurologia/widgets/cognitive-scores-widget',
      size: 'large',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/neurologia/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'pacientes-atendidos',
    'citas-hoy',
    'satisfaccion',
    'tasa-no-show',
    'examenes-laboratorio',
    'tiempo-resultado-lab',
  ],

  kpiDefinitions: {
    'pacientes-atendidos': {
      label: 'Pacientes Atendidos',
      format: 'number',
      direction: 'higher_is_better',
    },
    'citas-hoy': {
      label: 'Citas Hoy',
      format: 'number',
      direction: 'higher_is_better',
    },
    satisfaccion: {
      label: 'Satisfacción',
      format: 'number',
      goal: 4.5,
      direction: 'higher_is_better',
    },
    'tasa-no-show': {
      label: 'Tasa Inasistencia',
      format: 'percentage',
      goal: 5,
      direction: 'lower_is_better',
    },
    'examenes-laboratorio': {
      label: 'Estudios Solicitados',
      format: 'number',
      direction: 'higher_is_better',
    },
    'tiempo-resultado-lab': {
      label: 'Tiempo Resultados (días)',
      format: 'duration',
      goal: 3,
      direction: 'lower_is_better',
    },
  },

  settings: {
    defaultView: 'agenda',
    enableChat: true,
    enablePrescriptions: true,
    enableLab: true,
    enableTelemedicine: true,
  },

  theme: {
    primaryColor: '#6366f1', // Indigo
    accentColor: '#818cf8',
    icon: 'Brain',
  },
};
