/**
 * @file overrides/otorrinolaringologia.ts
 * @description Override de configuración para Otorrinolaringología (ORL).
 *
 * Módulos especializados: resultados de audiometría, timpanometría,
 * imágenes endoscópicas, análisis de voz, manejo de apnea del sueño (IAH),
 * planificación de amigdalectomía.
 *
 * También exporta constantes de dominio: grados de hipoacusia,
 * clasificación de Mallampati, escala de Brodsky para amígdalas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Otorrinolaringología.
 * Especialidad con módulos clínicos y quirúrgicos para oído, nariz y garganta.
 */
export const otorrinolaringologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'otorrinolaringologia',
  dashboardPath: '/dashboard/medico/otorrinolaringologia',

  modules: {
    clinical: [
      {
        key: 'orl-consulta',
        label: 'Consulta ORL',
        icon: 'Stethoscope',
        route: '/dashboard/medico/otorrinolaringologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'orl-audiometria',
        label: 'Audiometría',
        icon: 'Ear',
        route: '/dashboard/medico/otorrinolaringologia/audiometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Audiometría tonal, vocal, PTA, umbrales, configuración de pérdida',
        kpiKeys: ['hearing_improvement_rate'],
      },
      {
        key: 'orl-timpanometria',
        label: 'Timpanometría',
        icon: 'Activity',
        route: '/dashboard/medico/otorrinolaringologia/timpanometria',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Curvas timpanométricas, reflejos estapediales, compliance',
      },
      {
        key: 'orl-endoscopia',
        label: 'Endoscopía ORL',
        icon: 'Eye',
        route: '/dashboard/medico/otorrinolaringologia/endoscopia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Nasofibrolaringoscopía, imágenes, hallazgos, comparación temporal',
      },
      {
        key: 'orl-analisis-voz',
        label: 'Análisis de Voz',
        icon: 'Mic',
        route: '/dashboard/medico/otorrinolaringologia/analisis-voz',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Estroboscopía, análisis acústico, VHI (Voice Handicap Index)',
      },
      {
        key: 'orl-apnea-sueno',
        label: 'Apnea del Sueño (IAH)',
        icon: 'Moon',
        route: '/dashboard/medico/otorrinolaringologia/apnea-sueno',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Índice de Apnea-Hipopnea, polisomnografía, CPAP, manejo quirúrgico',
        kpiKeys: ['ahi_reduction_rate'],
      },
      {
        key: 'orl-amigdalectomia',
        label: 'Planificación de Amigdalectomía',
        icon: 'Scissors',
        route: '/dashboard/medico/otorrinolaringologia/amigdalectomia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Indicaciones, escala de Brodsky, evaluación preoperatoria',
        kpiKeys: ['surgical_volume'],
      },
    ],

    lab: [
      {
        key: 'orl-imagenologia',
        label: 'Imagenología ORL',
        icon: 'Image',
        route: '/dashboard/medico/otorrinolaringologia/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'TC de senos paranasales, TC de oídos, resonancia',
      },
      {
        key: 'orl-polisomnografia',
        label: 'Polisomnografía',
        icon: 'FileText',
        route: '/dashboard/medico/otorrinolaringologia/polisomnografia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'orl-cultivos',
        label: 'Cultivos y Microbiología',
        icon: 'FlaskConical',
        route: '/dashboard/medico/otorrinolaringologia/cultivos',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'orl-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/otorrinolaringologia/quirofano',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'orl-calculadoras',
        label: 'Calculadoras ORL',
        icon: 'Calculator',
        route: '/dashboard/medico/otorrinolaringologia/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'IAH, PTA, Score de Epworth, Mallampati, Brodsky',
      },
    ],

    communication: [
      {
        key: 'orl-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/otorrinolaringologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'orl-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/otorrinolaringologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'orl-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/otorrinolaringologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'audiometry-results',
      component: '@/components/dashboard/medico/otorrinolaringologia/widgets/audiometry-results-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'sleep-apnea-tracker',
      component: '@/components/dashboard/medico/otorrinolaringologia/widgets/sleep-apnea-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'endoscopy-gallery',
      component: '@/components/dashboard/medico/otorrinolaringologia/widgets/endoscopy-gallery-widget',
      size: 'medium',
    },
    {
      key: 'surgical-schedule',
      component: '@/components/dashboard/medico/otorrinolaringologia/widgets/surgical-schedule-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'hearing_improvement_rate',
    'ahi_reduction_rate',
    'surgical_volume',
    'tonsillectomy_complication_rate',
    'endoscopy_findings_accuracy',
    'voice_improvement_rate',
  ],

  kpiDefinitions: {
    hearing_improvement_rate: {
      label: 'Tasa de Mejora Auditiva',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    ahi_reduction_rate: {
      label: 'Tasa de Reducción IAH',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    surgical_volume: {
      label: 'Volumen Quirúrgico Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
    tonsillectomy_complication_rate: {
      label: 'Tasa de Complicaciones en Amigdalectomía',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    endoscopy_findings_accuracy: {
      label: 'Precisión de Hallazgos Endoscópicos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    voice_improvement_rate: {
      label: 'Tasa de Mejora de Voz (VHI)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'audiometria',
      'timpanometria',
      'endoscopia',
      'evaluacion_apnea',
      'control_postoperatorio',
      'pre_quirurgica',
      'evaluacion_voz',
      'lavado_oidos',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_orl',
      'examen_orl',
      'informe_audiometria',
      'informe_timpanometria',
      'informe_endoscopia',
      'evaluacion_apnea_sueno',
      'planificacion_quirurgica',
      'informe_analisis_voz',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresAudiometry: true,
      supportsTympanometry: true,
      supportsEndoscopy: true,
      tracksAHI: true,
      supportsVoiceAnalysis: true,
      requiresSurgicalPlanning: true,
    },
  },

  theme: {
    primaryColor: '#0891B2',
    accentColor: '#0E7490',
    icon: 'Ear',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ORL
// ============================================================================

/**
 * Grados de hipoacusia según OMS
 */
export const HEARING_LOSS_GRADES = [
  { grade: 'Normal', ptaRange: '0-25 dB', description: 'Audición normal' },
  { grade: 'Leve', ptaRange: '26-40 dB', description: 'Dificultad con voz suave o a distancia' },
  { grade: 'Moderada', ptaRange: '41-60 dB', description: 'Dificultad con conversación normal' },
  { grade: 'Severa', ptaRange: '61-80 dB', description: 'Solo percibe voz fuerte cerca del oído' },
  { grade: 'Profunda', ptaRange: '>80 dB', description: 'No percibe la mayoría de sonidos' },
] as const;

/**
 * Clasificación de Mallampati (predicción de vía aérea difícil)
 */
export const MALLAMPATI_CLASSIFICATION = [
  { class: 'I', description: 'Paladar blando, fauces, úvula y pilares amigdalinos visibles', difficulty: 'Baja' },
  { class: 'II', description: 'Paladar blando, fauces y úvula visibles', difficulty: 'Baja' },
  { class: 'III', description: 'Paladar blando y base de úvula visibles', difficulty: 'Moderada' },
  { class: 'IV', description: 'Solo paladar duro visible', difficulty: 'Alta' },
] as const;

/**
 * Escala de Brodsky para tamaño amigdalino
 */
export const BRODSKY_TONSIL_SCALE = [
  { grade: '0', description: 'Amígdalas dentro de la fosa', obstruction: '0%' },
  { grade: '1+', description: 'Amígdalas apenas visibles fuera de la fosa', obstruction: '<25%' },
  { grade: '2+', description: 'Amígdalas visibles, sin tocar la úvula', obstruction: '25-50%' },
  { grade: '3+', description: 'Amígdalas tocan la úvula', obstruction: '50-75%' },
  { grade: '4+', description: 'Amígdalas en contacto en la línea media (kissing tonsils)', obstruction: '>75%' },
] as const;
