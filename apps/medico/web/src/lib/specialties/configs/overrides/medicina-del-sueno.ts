/**
 * @file overrides/medicina-del-sueno.ts
 * @description Override de configuración para Medicina del Sueño.
 *
 * Módulos especializados: resultados de polisomnografía, seguimiento AHI,
 * cumplimiento CPAP, diario de sueño, escala de somnolencia de Epworth,
 * datos de actigrafía.
 *
 * También exporta constantes de dominio: escala Epworth,
 * clasificación de severidad AHI, parámetros de polisomnografía.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina del Sueño.
 * Especialidad centrada en diagnóstico y tratamiento de trastornos
 * del sueño: apnea, insomnio, narcolepsia, parasomnias.
 */
export const medicinaDelSuenoOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-del-sueno',
  dashboardPath: '/dashboard/medico/medicina-del-sueno',

  modules: {
    clinical: [
      {
        key: 'sueno-consulta',
        label: 'Consulta de Sueño',
        icon: 'Moon',
        route: '/dashboard/medico/medicina-del-sueno/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación integral del sueño, cuestionarios, anamnesis',
      },
      {
        key: 'sueno-polisomnografia',
        label: 'Polisomnografía',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-del-sueno/polisomnografia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Resultados PSG, hipnograma, eventos respiratorios',
      },
      {
        key: 'sueno-ahi',
        label: 'Seguimiento AHI',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-del-sueno/ahi',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['ahi_reduction'],
        description: 'Índice Apnea-Hipopnea — evolución longitudinal',
      },
      {
        key: 'sueno-cpap',
        label: 'Cumplimiento CPAP',
        icon: 'Wind',
        route: '/dashboard/medico/medicina-del-sueno/cpap',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['cpap_adherence'],
        description: 'Horas de uso, fuga de máscara, AHI residual, telemonitoreo',
      },
      {
        key: 'sueno-diario',
        label: 'Diario de Sueño',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-del-sueno/diario',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Hora de acostarse/levantarse, latencia, despertares, calidad',
      },
      {
        key: 'sueno-epworth',
        label: 'Escala de Epworth (ESS)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-del-sueno/epworth',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['ess_improvement'],
        description: 'Escala de Somnolencia de Epworth — seguimiento longitudinal',
      },
      {
        key: 'sueno-actigrafia',
        label: 'Actigrafía',
        icon: 'Watch',
        route: '/dashboard/medico/medicina-del-sueno/actigrafia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Datos de acelerómetro, ritmo circadiano, eficiencia del sueño',
      },
    ],

    laboratory: [
      {
        key: 'sueno-laboratorio',
        label: 'Laboratorio / Tiroides',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-del-sueno/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'TSH, ferritina, oximetría nocturna, gasometría',
      },
    ],

    financial: [
      {
        key: 'sueno-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-del-sueno/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'sueno-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-del-sueno/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'sueno-telemedicina',
        label: 'Telemedicina del Sueño',
        icon: 'Video',
        route: '/dashboard/medico/medicina-del-sueno/telemedicina',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'sueno-telemonitoreo-cpap',
        label: 'Telemonitoreo CPAP',
        icon: 'Monitor',
        route: '/dashboard/medico/medicina-del-sueno/telemonitoreo-cpap',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Datos remotos de dispositivo CPAP, alertas de no uso',
      },
    ],

    communication: [
      {
        key: 'sueno-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-del-sueno/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'sueno-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/medicina-del-sueno/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'sueno-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-del-sueno/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cpap-compliance',
      component: '@/components/dashboard/medico/medicina-del-sueno/widgets/cpap-compliance-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'ahi-trends',
      component: '@/components/dashboard/medico/medicina-del-sueno/widgets/ahi-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'sleep-quality-overview',
      component: '@/components/dashboard/medico/medicina-del-sueno/widgets/sleep-quality-overview-widget',
      size: 'large',
    },
    {
      key: 'psg-pending',
      component: '@/components/dashboard/medico/medicina-del-sueno/widgets/psg-pending-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'ahi_reduction',
    'cpap_adherence',
    'ess_improvement',
    'psg_turnaround',
    'sleep_efficiency',
    'treatment_satisfaction',
  ],

  kpiDefinitions: {
    ahi_reduction: {
      label: 'Reducción de AHI',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    cpap_adherence: {
      label: 'Adherencia CPAP (>4h/noche)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    ess_improvement: {
      label: 'Mejora en ESS',
      format: 'number',
      direction: 'higher_is_better',
    },
    psg_turnaround: {
      label: 'Tiempo Resultado PSG (días)',
      format: 'duration',
      goal: 7,
      direction: 'lower_is_better',
    },
    sleep_efficiency: {
      label: 'Eficiencia del Sueño Promedio',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    treatment_satisfaction: {
      label: 'Satisfacción con Tratamiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'pre_polisomnografia',
      'devolucion_psg',
      'titulacion_cpap',
      'control_cpap',
      'evaluacion_insomnio',
      'telemedicina_sueno',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_sueno',
      'informe_polisomnografia',
      'titulacion_cpap',
      'diario_sueno',
      'evaluacion_epworth',
      'informe_actigrafia',
      'plan_tratamiento_insomnio',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksPolysomnography: true,
      tracksAHI: true,
      monitorsCPAPCompliance: true,
      usesSleepDiary: true,
      usesEpworthScale: true,
      supportsActigraphy: true,
      supportsCPAPTelemonitoring: true,
    },
  },

  theme: {
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    icon: 'Moon',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA DEL SUEÑO
// ============================================================================

/**
 * Escala de Somnolencia de Epworth (ESS)
 * 8 situaciones, 0-3 cada una (total 0-24)
 */
export const EPWORTH_ITEMS = [
  { key: 'sitting_reading', label: 'Sentado leyendo' },
  { key: 'watching_tv', label: 'Viendo televisión' },
  { key: 'sitting_inactive_public', label: 'Sentado inactivo en un lugar público' },
  { key: 'car_passenger_1hr', label: 'Como pasajero en un auto por 1 hora' },
  { key: 'lying_down_afternoon', label: 'Acostado por la tarde' },
  { key: 'sitting_talking', label: 'Sentado hablando con alguien' },
  { key: 'sitting_after_lunch', label: 'Sentado después del almuerzo (sin alcohol)' },
  { key: 'car_stopped_traffic', label: 'En un auto, detenido en el tráfico' },
] as const;

/**
 * Severidad ESS
 */
export const EPWORTH_SEVERITY = [
  { range: [0, 7] as const, label: 'Normal', action: 'Sin intervención específica' },
  { range: [8, 9] as const, label: 'Somnolencia leve', action: 'Evaluación' },
  { range: [10, 15] as const, label: 'Somnolencia moderada', action: 'Estudio de sueño recomendado' },
  { range: [16, 24] as const, label: 'Somnolencia severa', action: 'Estudio de sueño urgente, restricción de conducción' },
] as const;

/**
 * Clasificación de severidad del AHI (Apnea-Hypopnea Index)
 */
export const AHI_SEVERITY = [
  { range: [0, 4.9] as const, label: 'Normal', cpapIndication: 'No indicado' },
  { range: [5, 14.9] as const, label: 'Apnea leve', cpapIndication: 'Considerar si sintomático' },
  { range: [15, 29.9] as const, label: 'Apnea moderada', cpapIndication: 'Indicado' },
  { range: [30, 999] as const, label: 'Apnea severa', cpapIndication: 'Fuertemente indicado' },
] as const;

/**
 * Parámetros clave de polisomnografía
 */
export const PSG_PARAMETERS = [
  { key: 'ahi', label: 'AHI (eventos/hora)', normal: '< 5' },
  { key: 'rdi', label: 'RDI (eventos/hora)', normal: '< 5' },
  { key: 'sleep_efficiency', label: 'Eficiencia del Sueño (%)', normal: '> 85%' },
  { key: 'sleep_latency', label: 'Latencia del Sueño (min)', normal: '10-20 min' },
  { key: 'rem_latency', label: 'Latencia REM (min)', normal: '70-120 min' },
  { key: 'n3_percentage', label: '% Sueño N3 (profundo)', normal: '15-25%' },
  { key: 'rem_percentage', label: '% Sueño REM', normal: '20-25%' },
  { key: 'arousal_index', label: 'Índice de Arousals (eventos/hora)', normal: '< 15' },
  { key: 'spo2_nadir', label: 'SpO2 Nadir (%)', normal: '> 90%' },
  { key: 'plm_index', label: 'Índice PLM (eventos/hora)', normal: '< 15' },
] as const;
