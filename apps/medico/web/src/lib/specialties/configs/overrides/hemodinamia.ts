/**
 * @file overrides/hemodinamia.ts
 * @description Override de configuracion para Hemodinamia.
 *
 * Cubre programacion de laboratorio de cateterismo, mediciones de presion
 * intracavitaria, mapeo de anatomia coronaria, planificacion TAVI y
 * procedimientos de corazon estructural.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Hemodinamia.
 * Especialidad centrada en el diagnostico y tratamiento por cateterismo.
 */
export const hemodinamiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'hemodinamia',
  dashboardPath: '/dashboard/medico/hemodinamia',

  modules: {
    clinical: [
      {
        key: 'hemo-consulta',
        label: 'Consulta de Hemodinamia',
        icon: 'Stethoscope',
        route: '/dashboard/medico/hemodinamia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['procedures_per_month'],
      },
      {
        key: 'hemo-cath-lab',
        label: 'Programacion Sala de Cateterismo',
        icon: 'CalendarClock',
        route: '/dashboard/medico/hemodinamia/cath-lab',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'hemo-presiones',
        label: 'Mediciones de Presion',
        icon: 'Activity',
        route: '/dashboard/medico/hemodinamia/presiones',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'hemo-coronarias',
        label: 'Mapeo de Anatomia Coronaria',
        icon: 'GitBranch',
        route: '/dashboard/medico/hemodinamia/coronarias',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'hemo-tavi',
        label: 'Planificacion TAVI',
        icon: 'HeartPulse',
        route: '/dashboard/medico/hemodinamia/tavi',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'hemo-estructural',
        label: 'Corazon Estructural',
        icon: 'Box',
        route: '/dashboard/medico/hemodinamia/estructural',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'hemo-imagenologia',
        label: 'Imagenologia Hemodinamica',
        icon: 'Scan',
        route: '/dashboard/medico/hemodinamia/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemo-fluoroscopia',
        label: 'Registro de Fluoroscopia',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/hemodinamia/fluoroscopia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['fluoroscopy_time_avg'],
      },
      {
        key: 'hemo-laboratorio',
        label: 'Laboratorio / Marcadores',
        icon: 'FlaskConical',
        route: '/dashboard/medico/hemodinamia/laboratorio',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'hemo-calculadoras',
        label: 'Calculadoras Hemodinamicas',
        icon: 'Calculator',
        route: '/dashboard/medico/hemodinamia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemo-planificacion',
        label: 'Planificacion de Procedimientos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/hemodinamia/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'hemo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/hemodinamia/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'hemo-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/hemodinamia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cath-lab-schedule',
      component: '@/components/dashboard/medico/hemodinamia/widgets/cath-lab-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'pressure-measurements',
      component: '@/components/dashboard/medico/hemodinamia/widgets/pressure-measurements-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fluoroscopy-tracking',
      component: '@/components/dashboard/medico/hemodinamia/widgets/fluoroscopy-tracking-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'structural-heart-cases',
      component: '@/components/dashboard/medico/hemodinamia/widgets/structural-heart-cases-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'procedures_per_month',
    'fluoroscopy_time_avg',
    'complication_rate',
    'tavi_success_rate',
    'contrast_volume_avg',
    'cath_lab_utilization',
  ],

  kpiDefinitions: {
    procedures_per_month: {
      label: 'Procedimientos / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
    fluoroscopy_time_avg: {
      label: 'Tiempo Promedio de Fluoroscopia',
      format: 'duration',
      direction: 'lower_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    tavi_success_rate: {
      label: 'Tasa de Exito TAVI',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    contrast_volume_avg: {
      label: 'Volumen Promedio de Contraste',
      format: 'number',
      direction: 'lower_is_better',
    },
    cath_lab_utilization: {
      label: 'Utilizacion de Sala de Cateterismo',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'cateterismo_diagnostico',
      'cateterismo_terapeutico',
      'tavi_programado',
      'cierre_defecto_septal',
      'valvuloplastia',
      'control_post_procedimiento',
      'evaluacion_estructural',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_cateterismo',
      'informe_cateterismo_diagnostico',
      'informe_cateterismo_terapeutico',
      'registro_presiones',
      'informe_tavi',
      'informe_estructural',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCathLabScheduling: true,
      tracksPressureMeasurements: true,
      supportsCoronaryMapping: true,
      supportsTAVIPlanning: true,
      tracksStructuralHeart: true,
      monitorsFluoroscopyTime: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'Activity',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — HEMODINAMIA
// ============================================================================

/**
 * Mediciones hemodinamicas estandar
 */
export const HEMODYNAMIC_MEASUREMENTS = [
  { key: 'ao_systolic', label: 'Presion Aortica Sistolica', unit: 'mmHg', normalRange: '100-140' },
  { key: 'ao_diastolic', label: 'Presion Aortica Diastolica', unit: 'mmHg', normalRange: '60-90' },
  { key: 'lv_systolic', label: 'Presion VI Sistolica', unit: 'mmHg', normalRange: '100-140' },
  { key: 'lv_edp', label: 'Presion Telediastolica VI', unit: 'mmHg', normalRange: '5-12' },
  { key: 'pa_systolic', label: 'Presion Arteria Pulmonar Sistolica', unit: 'mmHg', normalRange: '15-30' },
  { key: 'pa_diastolic', label: 'Presion Arteria Pulmonar Diastolica', unit: 'mmHg', normalRange: '4-12' },
  { key: 'pcwp', label: 'Presion Capilar Pulmonar (Wedge)', unit: 'mmHg', normalRange: '6-12' },
  { key: 'ra_mean', label: 'Presion Auricular Derecha Media', unit: 'mmHg', normalRange: '2-6' },
  { key: 'cardiac_output', label: 'Gasto Cardiaco', unit: 'L/min', normalRange: '4.0-8.0' },
  { key: 'cardiac_index', label: 'Indice Cardiaco', unit: 'L/min/m2', normalRange: '2.5-4.0' },
] as const;

/**
 * Segmentos coronarios (clasificacion AHA)
 */
export const CORONARY_SEGMENTS = [
  { key: 'rca_prox', label: 'CD Proximal', segment: 1 },
  { key: 'rca_mid', label: 'CD Media', segment: 2 },
  { key: 'rca_distal', label: 'CD Distal', segment: 3 },
  { key: 'pda', label: 'Descendente Posterior', segment: 4 },
  { key: 'lm', label: 'Tronco Coronario Izquierdo', segment: 5 },
  { key: 'lad_prox', label: 'DA Proximal', segment: 6 },
  { key: 'lad_mid', label: 'DA Media', segment: 7 },
  { key: 'lad_distal', label: 'DA Distal', segment: 8 },
  { key: 'diagonal_1', label: '1ra Diagonal', segment: 9 },
  { key: 'diagonal_2', label: '2da Diagonal', segment: 10 },
  { key: 'lcx_prox', label: 'CX Proximal', segment: 11 },
  { key: 'lcx_distal', label: 'CX Distal', segment: 13 },
  { key: 'om_1', label: '1ra Marginal Obtusa', segment: 12 },
  { key: 'om_2', label: '2da Marginal Obtusa', segment: 14 },
  { key: 'ramus', label: 'Ramo Intermedio', segment: 16 },
] as const;
