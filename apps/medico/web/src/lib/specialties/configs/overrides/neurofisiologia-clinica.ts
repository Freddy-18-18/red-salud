/**
 * @file overrides/neurofisiologia-clinica.ts
 * @description Override de configuración para Neurofisiología Clínica.
 *
 * Módulos especializados: reporte de EEG (sistema 10-20),
 * documentación EMG/NCS, potenciales evocados (VEP, BAEP, SSEP),
 * monitoreo intraoperatorio, EEG de sueño, video-EEG.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const neurofisiologiaClinicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neurofisiologia-clinica',
  dashboardPath: '/dashboard/medico/neurofisiologia-clinica',

  modules: {
    clinical: [
      {
        key: 'neurofisio-consulta',
        label: 'Consulta de Neurofisiología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/neurofisiologia-clinica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['study_volume'],
      },
      {
        key: 'neurofisio-eeg',
        label: 'Reporte de EEG',
        icon: 'Activity',
        route: '/dashboard/medico/neurofisiologia-clinica/eeg',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['reporting_time'],
      },
      {
        key: 'neurofisio-emg-ncs',
        label: 'EMG / Neuroconducción',
        icon: 'Zap',
        route: '/dashboard/medico/neurofisiologia-clinica/emg-ncs',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-evocados',
        label: 'Potenciales Evocados',
        icon: 'AudioWaveform',
        route: '/dashboard/medico/neurofisiologia-clinica/evocados',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-iom',
        label: 'Monitoreo Intraoperatorio (IOM)',
        icon: 'MonitorCheck',
        route: '/dashboard/medico/neurofisiologia-clinica/iom',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-eeg-sueno',
        label: 'EEG de Sueño',
        icon: 'Moon',
        route: '/dashboard/medico/neurofisiologia-clinica/eeg-sueno',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-video-eeg',
        label: 'Video-EEG',
        icon: 'Video',
        route: '/dashboard/medico/neurofisiologia-clinica/video-eeg',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['diagnostic_yield_rate'],
      },
    ],

    lab: [
      {
        key: 'neurofisio-worklist',
        label: 'Worklist de Estudios',
        icon: 'ListTodo',
        route: '/dashboard/medico/neurofisiologia-clinica/worklist',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-calibracion',
        label: 'Calibración de Equipos',
        icon: 'Settings',
        route: '/dashboard/medico/neurofisiologia-clinica/calibracion',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'neurofisio-montajes',
        label: 'Montajes y Protocolos',
        icon: 'Grid3x3',
        route: '/dashboard/medico/neurofisiologia-clinica/montajes',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-plantillas',
        label: 'Plantillas de Reporte',
        icon: 'FileText',
        route: '/dashboard/medico/neurofisiologia-clinica/plantillas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'neurofisio-interconsultas',
        label: 'Interconsultas',
        icon: 'MessageSquare',
        route: '/dashboard/medico/neurofisiologia-clinica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neurofisio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/neurofisiologia-clinica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'neurofisio-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neurofisiologia-clinica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'study-volume-tracker',
      component: '@/components/dashboard/medico/neurofisiologia-clinica/widgets/study-volume-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'reporting-turnaround',
      component: '@/components/dashboard/medico/neurofisiologia-clinica/widgets/reporting-turnaround-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'diagnostic-yield-summary',
      component: '@/components/dashboard/medico/neurofisiologia-clinica/widgets/diagnostic-yield-summary-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'study_volume',
    'reporting_time',
    'diagnostic_yield_rate',
    'iom_alert_accuracy',
    'eeg_abnormality_detection',
    'emg_completion_rate',
  ],

  kpiDefinitions: {
    study_volume: {
      label: 'Volumen de Estudios',
      format: 'number',
      direction: 'higher_is_better',
    },
    reporting_time: {
      label: 'Tiempo de Reporte',
      format: 'duration',
      direction: 'lower_is_better',
    },
    diagnostic_yield_rate: {
      label: 'Rendimiento Diagnóstico',
      format: 'percentage',
      goal: 0.4,
      direction: 'higher_is_better',
    },
    iom_alert_accuracy: {
      label: 'Precisión de Alertas IOM',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    eeg_abnormality_detection: {
      label: 'Detección de Anormalidades EEG',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    emg_completion_rate: {
      label: 'Tasa de Completación EMG',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'eeg_rutina',
      'eeg_sueno',
      'video_eeg',
      'emg_neuroconduccion',
      'potenciales_evocados_vep',
      'potenciales_evocados_baep',
      'potenciales_evocados_ssep',
      'monitoreo_intraoperatorio',
    ],
    defaultDuration: 60,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_eeg',
      'informe_emg_ncs',
      'informe_potenciales_evocados',
      'informe_iom',
      'informe_video_eeg',
      'protocolo_montaje',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      supportsEEGReporting: true,
      supportsEMGNCS: true,
      supportsEvokedPotentials: true,
      supportsIOM: true,
      supportsSleepEEG: true,
      supportsVideoEEG: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
    icon: 'Activity',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE NEUROFISIOLOGÍA CLÍNICA
// ============================================================================

/**
 * Tipos de potenciales evocados
 */
export const EVOKED_POTENTIAL_TYPES = [
  { key: 'vep', label: 'Potenciales Evocados Visuales (VEP)', stimulus: 'Patrón reverberante', evaluates: 'Vía visual' },
  { key: 'baep', label: 'Potenciales Evocados Auditivos de Tronco (BAEP)', stimulus: 'Clicks auditivos', evaluates: 'Vía auditiva/tronco cerebral' },
  { key: 'ssep', label: 'Potenciales Evocados Somatosensoriales (SSEP)', stimulus: 'Estimulación eléctrica periférica', evaluates: 'Vía somatosensorial' },
  { key: 'mep', label: 'Potenciales Evocados Motores (MEP)', stimulus: 'Estimulación magnética transcraneal', evaluates: 'Vía corticoespinal' },
] as const;

/**
 * Sistema Internacional 10-20 — posiciones de electrodos EEG
 */
export const EEG_10_20_POSITIONS = [
  { position: 'Fp1/Fp2', region: 'Frontopolar', function: 'Funciones ejecutivas, personalidad' },
  { position: 'F3/F4', region: 'Frontal', function: 'Función motora, planificación' },
  { position: 'F7/F8', region: 'Frontotemporal', function: 'Lenguaje (izq), prosodia (der)' },
  { position: 'C3/C4', region: 'Central', function: 'Corteza motora/sensorial' },
  { position: 'T3/T4', region: 'Temporal medio', function: 'Audición, memoria (izq)' },
  { position: 'T5/T6', region: 'Temporal posterior', function: 'Memoria visual, lenguaje' },
  { position: 'P3/P4', region: 'Parietal', function: 'Integración sensorial, orientación espacial' },
  { position: 'O1/O2', region: 'Occipital', function: 'Procesamiento visual' },
  { position: 'Fz', region: 'Frontal medio', function: 'Referencia frontal, actividad central' },
  { position: 'Cz', region: 'Central medio (vertex)', function: 'Referencia vertex' },
  { position: 'Pz', region: 'Parietal medio', function: 'Referencia parietal' },
] as const;
