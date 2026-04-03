/**
 * @file overrides/acupuntura.ts
 * @description Override de configuración para Acupuntura.
 *
 * Módulos especializados: documentación de puntos meridianos,
 * seguimiento de protocolos de tratamiento, diagnóstico MTC,
 * mapeo de inserción de agujas, resultados de sesiones (VAS),
 * planificación de cursos de tratamiento.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const acupunturaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'acupuntura',
  dashboardPath: '/dashboard/medico/acupuntura',

  modules: {
    clinical: [
      {
        key: 'acupu-consulta',
        label: 'Consulta de Acupuntura',
        icon: 'Stethoscope',
        route: '/dashboard/medico/acupuntura/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_session_duration'],
      },
      {
        key: 'acupu-meridianos',
        label: 'Mapa de Meridianos',
        icon: 'Map',
        route: '/dashboard/medico/acupuntura/meridianos',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'acupu-protocolo',
        label: 'Protocolos de Tratamiento',
        icon: 'ClipboardList',
        route: '/dashboard/medico/acupuntura/protocolo',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'acupu-diagnostico-mtc',
        label: 'Diagnóstico MTC',
        icon: 'BookOpen',
        route: '/dashboard/medico/acupuntura/diagnostico-mtc',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'acupu-insercion',
        label: 'Mapeo de Inserción de Agujas',
        icon: 'Target',
        route: '/dashboard/medico/acupuntura/insercion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'acupu-resultados-vas',
        label: 'Resultados de Sesión (VAS)',
        icon: 'BarChart3',
        route: '/dashboard/medico/acupuntura/resultados-vas',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['pain_reduction_rate'],
      },
      {
        key: 'acupu-curso-tratamiento',
        label: 'Planificación de Curso',
        icon: 'Calendar',
        route: '/dashboard/medico/acupuntura/curso-tratamiento',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['treatment_completion_rate'],
      },
    ],

    lab: [
      {
        key: 'acupu-evaluacion-dolor',
        label: 'Evaluación de Dolor',
        icon: 'Activity',
        route: '/dashboard/medico/acupuntura/evaluacion-dolor',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'acupu-seguimiento-sintomas',
        label: 'Seguimiento de Síntomas',
        icon: 'TrendingUp',
        route: '/dashboard/medico/acupuntura/seguimiento-sintomas',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'acupu-atlas-puntos',
        label: 'Atlas de Puntos',
        icon: 'Zap',
        route: '/dashboard/medico/acupuntura/atlas-puntos',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'acupu-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/acupuntura/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'acupu-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/acupuntura/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'vas-pain-trends',
      component: '@/components/dashboard/medico/acupuntura/widgets/vas-pain-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'treatment-course-progress',
      component: '@/components/dashboard/medico/acupuntura/widgets/treatment-course-progress-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'meridian-point-map',
      component: '@/components/dashboard/medico/acupuntura/widgets/meridian-point-map-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'pain_reduction_rate',
    'treatment_completion_rate',
    'patient_satisfaction_score',
    'avg_sessions_per_course',
    'symptom_improvement_rate',
    'follow_up_compliance',
  ],

  kpiDefinitions: {
    pain_reduction_rate: {
      label: 'Reducción de Dolor (VAS)',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    treatment_completion_rate: {
      label: 'Tasa de Completación de Tratamiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    avg_sessions_per_course: {
      label: 'Sesiones Promedio por Curso',
      format: 'number',
      direction: 'lower_is_better',
    },
    symptom_improvement_rate: {
      label: 'Tasa de Mejoría Sintomática',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    follow_up_compliance: {
      label: 'Adherencia al Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'sesion_acupuntura',
      'evaluacion_mtc',
      'seguimiento',
      'sesion_electroacupuntura',
      'auriculoterapia',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_mtc',
      'diagnostico_mtc',
      'prescripcion_puntos',
      'informe_sesion',
      'evaluacion_dolor_vas',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      usesTraditionalChineseMedicine: true,
      tracksMeridianPoints: true,
      usesVASPainScale: true,
      supportsCourseTracking: true,
      supportsElectroacupuncture: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'Zap',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE ACUPUNTURA
// ============================================================================

/**
 * Meridianos principales de la Medicina Tradicional China
 */
export const TCM_MERIDIANS = [
  { key: 'lung', label: 'Pulmón (LU)', element: 'Metal', yin_yang: 'Yin', points: 11 },
  { key: 'large_intestine', label: 'Intestino Grueso (LI)', element: 'Metal', yin_yang: 'Yang', points: 20 },
  { key: 'stomach', label: 'Estómago (ST)', element: 'Tierra', yin_yang: 'Yang', points: 45 },
  { key: 'spleen', label: 'Bazo (SP)', element: 'Tierra', yin_yang: 'Yin', points: 21 },
  { key: 'heart', label: 'Corazón (HT)', element: 'Fuego', yin_yang: 'Yin', points: 9 },
  { key: 'small_intestine', label: 'Intestino Delgado (SI)', element: 'Fuego', yin_yang: 'Yang', points: 19 },
  { key: 'bladder', label: 'Vejiga (BL)', element: 'Agua', yin_yang: 'Yang', points: 67 },
  { key: 'kidney', label: 'Riñón (KI)', element: 'Agua', yin_yang: 'Yin', points: 27 },
  { key: 'pericardium', label: 'Pericardio (PC)', element: 'Fuego', yin_yang: 'Yin', points: 9 },
  { key: 'triple_energizer', label: 'Triple Calentador (TE)', element: 'Fuego', yin_yang: 'Yang', points: 23 },
  { key: 'gallbladder', label: 'Vesícula Biliar (GB)', element: 'Madera', yin_yang: 'Yang', points: 44 },
  { key: 'liver', label: 'Hígado (LR)', element: 'Madera', yin_yang: 'Yin', points: 14 },
] as const;

/**
 * Escala Visual Analógica (VAS) para dolor
 */
export const VAS_PAIN_SCALE = [
  { score: 0, label: 'Sin dolor', severity: 'none' },
  { score: 1, label: 'Dolor mínimo', severity: 'mild' },
  { score: 2, label: 'Dolor leve', severity: 'mild' },
  { score: 3, label: 'Dolor moderado-leve', severity: 'mild' },
  { score: 4, label: 'Dolor moderado', severity: 'moderate' },
  { score: 5, label: 'Dolor moderado', severity: 'moderate' },
  { score: 6, label: 'Dolor moderado-severo', severity: 'moderate' },
  { score: 7, label: 'Dolor severo', severity: 'severe' },
  { score: 8, label: 'Dolor muy severo', severity: 'severe' },
  { score: 9, label: 'Dolor extremo', severity: 'severe' },
  { score: 10, label: 'Peor dolor imaginable', severity: 'severe' },
] as const;
