/**
 * @file overrides/foniatria.ts
 * @description Override de configuración para Foniatría.
 *
 * Módulos especializados: análisis de voz (GRBAS, VHI),
 * hallazgos estroboscópicos, evaluación de deglución (FEES),
 * documentación de cuerdas vocales, progreso de terapia del habla.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const foniatriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'foniatria',
  dashboardPath: '/dashboard/medico/foniatria',

  modules: {
    clinical: [
      {
        key: 'fonia-consulta',
        label: 'Consulta de Foniatría',
        icon: 'Stethoscope',
        route: '/dashboard/medico/foniatria/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'fonia-analisis-voz',
        label: 'Análisis de Voz (GRBAS / VHI)',
        icon: 'Mic',
        route: '/dashboard/medico/foniatria/analisis-voz',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['voice_improvement_rate'],
      },
      {
        key: 'fonia-estroboscopia',
        label: 'Estroboscopía Laríngea',
        icon: 'Video',
        route: '/dashboard/medico/foniatria/estroboscopia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'fonia-deglución',
        label: 'Evaluación de Deglución (FEES)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/foniatria/deglucion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['swallowing_safety_rate'],
      },
      {
        key: 'fonia-cuerdas-vocales',
        label: 'Documentación de Cuerdas Vocales',
        icon: 'FileText',
        route: '/dashboard/medico/foniatria/cuerdas-vocales',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'fonia-terapia',
        label: 'Progreso de Terapia del Habla',
        icon: 'TrendingUp',
        route: '/dashboard/medico/foniatria/terapia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['therapy_completion_rate'],
      },
    ],

    lab: [
      {
        key: 'fonia-acustica',
        label: 'Análisis Acústico',
        icon: 'AudioWaveform',
        route: '/dashboard/medico/foniatria/acustica',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'fonia-aerodinamica',
        label: 'Evaluación Aerodinámica',
        icon: 'Wind',
        route: '/dashboard/medico/foniatria/aerodinamica',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'fonia-grabaciones',
        label: 'Grabaciones de Voz',
        icon: 'Disc',
        route: '/dashboard/medico/foniatria/grabaciones',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'fonia-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/foniatria/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'fonia-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/foniatria/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'fonia-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/foniatria/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'voice-quality-trends',
      component: '@/components/dashboard/medico/foniatria/widgets/voice-quality-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'swallowing-assessment-summary',
      component: '@/components/dashboard/medico/foniatria/widgets/swallowing-assessment-summary-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'therapy-progress',
      component: '@/components/dashboard/medico/foniatria/widgets/therapy-progress-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'voice_improvement_rate',
    'swallowing_safety_rate',
    'therapy_completion_rate',
    'grbas_score_improvement',
    'vhi_score_reduction',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    voice_improvement_rate: {
      label: 'Tasa de Mejora de Voz',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    swallowing_safety_rate: {
      label: 'Tasa de Seguridad en Deglución',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    therapy_completion_rate: {
      label: 'Tasa de Completación de Terapia',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    grbas_score_improvement: {
      label: 'Mejora en Score GRBAS',
      format: 'number',
      direction: 'higher_is_better',
    },
    vhi_score_reduction: {
      label: 'Reducción en Score VHI',
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
      'analisis_voz',
      'estroboscopia',
      'evaluacion_deglucion',
      'sesion_terapia',
      'seguimiento',
      'control_postquirurgico',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_foniátrica',
      'evaluacion_grbas',
      'informe_estroboscopia',
      'evaluacion_fees',
      'plan_terapia_vocal',
      'progreso_terapia',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      usesGRBASScale: true,
      usesVHIQuestionnaire: true,
      supportsStroboscopy: true,
      supportsFEES: true,
      tracksTherapyProgress: true,
      supportsAcousticAnalysis: true,
    },
  },

  theme: {
    primaryColor: '#0891B2',
    accentColor: '#0E7490',
    icon: 'Mic',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE FONIATRÍA
// ============================================================================

/**
 * Escala GRBAS para evaluación perceptual de la voz
 */
export const GRBAS_SCALE = [
  { parameter: 'G', label: 'Grade (Grado general)', description: 'Impresión global de la disfonía', scoring: '0-3' },
  { parameter: 'R', label: 'Roughness (Aspereza)', description: 'Irregularidad en la vibración de cuerdas vocales', scoring: '0-3' },
  { parameter: 'B', label: 'Breathiness (Soplosidad)', description: 'Escape de aire audible durante la fonación', scoring: '0-3' },
  { parameter: 'A', label: 'Asthenia (Astenia)', description: 'Debilidad o falta de potencia vocal', scoring: '0-3' },
  { parameter: 'S', label: 'Strain (Tensión)', description: 'Esfuerzo o hiperfunción laríngea', scoring: '0-3' },
] as const;

/**
 * Escala de severidad de disfagia (ASHA NOMS)
 */
export const DYSPHAGIA_SEVERITY_SCALE = [
  { level: 1, label: 'Nivel 1', description: 'No es capaz de deglutir de forma segura por vía oral', diet: 'NPO' },
  { level: 2, label: 'Nivel 2', description: 'No es capaz de deglutir de forma segura, pero puede tolerar consistencia única con máxima asistencia', diet: 'Mínima VO' },
  { level: 3, label: 'Nivel 3', description: 'Requiere supervisión/indicaciones moderadas, dieta restringida', diet: 'Dieta modificada' },
  { level: 4, label: 'Nivel 4', description: 'Deglución funcional intermitente, supervisión mínima', diet: 'Dieta modificada' },
  { level: 5, label: 'Nivel 5', description: 'Deglución funcional la mayoría del tiempo, supervisión ocasional', diet: 'Mínimas restricciones' },
  { level: 6, label: 'Nivel 6', description: 'Deglución funcional para la mayoría de las actividades, compensación independiente', diet: 'Dieta modificada mínima' },
  { level: 7, label: 'Nivel 7', description: 'Deglución normal en todas las situaciones', diet: 'Dieta regular' },
] as const;
