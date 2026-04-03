/**
 * @file overrides/quiropractica.ts
 * @description Override de configuración para Quiropráctica.
 *
 * Módulos especializados: evaluación espinal, documentación
 * de subluxación, seguimiento de ajustes, hallazgos radiográficos,
 * medición de ROM, resultados de dolor/función (Oswestry, NDI).
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const quiropracticaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'quiropractica',
  dashboardPath: '/dashboard/medico/quiropractica',

  modules: {
    clinical: [
      {
        key: 'quiro-consulta',
        label: 'Consulta Quiropráctica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/quiropractica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'quiro-evaluacion-espinal',
        label: 'Evaluación Espinal',
        icon: 'Bone',
        route: '/dashboard/medico/quiropractica/evaluacion-espinal',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'quiro-subluxacion',
        label: 'Documentación de Subluxación',
        icon: 'AlertCircle',
        route: '/dashboard/medico/quiropractica/subluxacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'quiro-ajustes',
        label: 'Seguimiento de Ajustes',
        icon: 'Hand',
        route: '/dashboard/medico/quiropractica/ajustes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'quiro-rom',
        label: 'Medición de ROM',
        icon: 'Ruler',
        route: '/dashboard/medico/quiropractica/rom',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['rom_improvement_rate'],
      },
      {
        key: 'quiro-dolor-funcion',
        label: 'Resultados Dolor / Función',
        icon: 'ClipboardList',
        route: '/dashboard/medico/quiropractica/dolor-funcion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['pain_reduction_rate'],
      },
    ],

    lab: [
      {
        key: 'quiro-radiologia',
        label: 'Hallazgos Radiográficos',
        icon: 'Scan',
        route: '/dashboard/medico/quiropractica/radiologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'quiro-posturologia',
        label: 'Análisis Postural',
        icon: 'User',
        route: '/dashboard/medico/quiropractica/posturologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'quiro-calculadoras',
        label: 'Calculadoras de Discapacidad',
        icon: 'Calculator',
        route: '/dashboard/medico/quiropractica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'quiro-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/quiropractica/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'quiro-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/quiropractica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'quiro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/quiropractica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'pain-function-outcomes',
      component: '@/components/dashboard/medico/quiropractica/widgets/pain-function-outcomes-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'adjustment-history',
      component: '@/components/dashboard/medico/quiropractica/widgets/adjustment-history-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'visit-frequency-optimizer',
      component: '@/components/dashboard/medico/quiropractica/widgets/visit-frequency-optimizer-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'pain_reduction_rate',
    'rom_improvement_rate',
    'visit_frequency_optimization',
    'oswestry_score_improvement',
    'ndi_score_improvement',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    pain_reduction_rate: {
      label: 'Tasa de Reducción del Dolor',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    rom_improvement_rate: {
      label: 'Tasa de Mejora de ROM',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    visit_frequency_optimization: {
      label: 'Optimización de Frecuencia de Visitas',
      format: 'number',
      direction: 'lower_is_better',
    },
    oswestry_score_improvement: {
      label: 'Mejora en Score Oswestry',
      format: 'number',
      direction: 'higher_is_better',
    },
    ndi_score_improvement: {
      label: 'Mejora en Score NDI',
      format: 'number',
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'ajuste_quiropractico',
      'evaluacion_espinal',
      'radiografia',
      'reevaluacion',
      'seguimiento',
      'mantenimiento',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_quiropractica',
      'documentacion_subluxacion',
      'registro_ajuste',
      'medicion_rom',
      'cuestionario_oswestry',
      'cuestionario_ndi',
      'informe_radiologico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresSpinalAssessment: true,
      tracksSubluxation: true,
      tracksAdjustments: true,
      supportsXRayFindings: true,
      tracksROM: true,
      usesOswestryNDI: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Bone',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE QUIROPRÁCTICA
// ============================================================================

/**
 * Índice de Discapacidad de Oswestry (ODI) — interpretación
 */
export const OSWESTRY_INTERPRETATION = [
  { range: '0-20%', label: 'Discapacidad mínima', description: 'El paciente puede manejar la mayoría de las actividades diarias' },
  { range: '21-40%', label: 'Discapacidad moderada', description: 'Dificultad con estar sentado, levantar objetos y estar de pie; puede necesitar tratamiento' },
  { range: '41-60%', label: 'Discapacidad severa', description: 'El dolor es el principal problema; viajes y vida social afectados' },
  { range: '61-80%', label: 'Discapacidad incapacitante', description: 'El dolor impacta todos los aspectos de la vida; requiere intervención' },
  { range: '81-100%', label: 'Encamado / Exageración', description: 'Encamado o exageración de síntomas' },
] as const;

/**
 * Índice de Discapacidad Cervical (NDI) — interpretación
 */
export const NDI_INTERPRETATION = [
  { range: '0-4', percentage: '0-8%', label: 'Sin discapacidad' },
  { range: '5-14', percentage: '10-28%', label: 'Discapacidad leve' },
  { range: '15-24', percentage: '30-48%', label: 'Discapacidad moderada' },
  { range: '25-34', percentage: '50-68%', label: 'Discapacidad severa' },
  { range: '35-50', percentage: '70-100%', label: 'Discapacidad completa' },
] as const;

/**
 * Regiones espinales para documentación de subluxación
 */
export const SPINAL_REGIONS = [
  { key: 'cervical', label: 'Cervical (C1-C7)', vertebrae: 7, common_subluxations: ['C1-C2 (Atlas-Axis)', 'C5-C6', 'C6-C7'] },
  { key: 'thoracic', label: 'Torácica (T1-T12)', vertebrae: 12, common_subluxations: ['T4-T5', 'T8-T9', 'T11-T12'] },
  { key: 'lumbar', label: 'Lumbar (L1-L5)', vertebrae: 5, common_subluxations: ['L4-L5', 'L5-S1'] },
  { key: 'sacral', label: 'Sacro / Pelvis', vertebrae: 5, common_subluxations: ['Articulación sacroilíaca', 'Cóccix'] },
] as const;
