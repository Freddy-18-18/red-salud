/**
 * @file overrides/psicologia.ts
 * @description Override de configuración para Psicología.
 *
 * Módulos especializados: notas de sesión estructuradas, seguimiento de
 * pruebas psicométricas, progreso de plan de tratamiento, medidas de
 * resultado (OQ-45), evaluación de alianza terapéutica.
 *
 * También exporta constantes de dominio: ítems OQ-45,
 * tipos de intervención terapéutica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Psicología.
 * Especialidad centrada en psicoterapia, evaluación psicométrica
 * y seguimiento de resultados terapéuticos.
 */
export const psicologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'psicologia',
  dashboardPath: '/dashboard/medico/psicologia',

  modules: {
    clinical: [
      {
        key: 'psicol2-consulta',
        label: 'Sesión Psicológica',
        icon: 'MessageCircle',
        route: '/dashboard/medico/psicologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['sessions_completed'],
        description: 'Notas de sesión estructuradas (SOAP adaptado)',
      },
      {
        key: 'psicol2-psicometria',
        label: 'Pruebas Psicométricas',
        icon: 'ClipboardList',
        route: '/dashboard/medico/psicologia/psicometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Aplicación y seguimiento de baterías psicométricas',
      },
      {
        key: 'psicol2-plan-tratamiento',
        label: 'Plan de Tratamiento',
        icon: 'Target',
        route: '/dashboard/medico/psicologia/plan-tratamiento',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Objetivos terapéuticos, metas, revisión de progreso',
      },
      {
        key: 'psicol2-oq45',
        label: 'Medidas de Resultado (OQ-45)',
        icon: 'BarChart3',
        route: '/dashboard/medico/psicologia/oq45',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['outcome_improvement'],
        description: 'Outcome Questionnaire-45, seguimiento longitudinal',
      },
      {
        key: 'psicol2-alianza',
        label: 'Alianza Terapéutica',
        icon: 'Handshake',
        route: '/dashboard/medico/psicologia/alianza',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'WAI (Working Alliance Inventory), evaluación de vínculo',
      },
      {
        key: 'psicol2-historia-clinica',
        label: 'Historia Clínica Psicológica',
        icon: 'FileText',
        route: '/dashboard/medico/psicologia/historia-clinica',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Anamnesis psicológica, genograma, línea de vida',
      },
    ],

    financial: [
      {
        key: 'psicol2-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/psicologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol2-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/psicologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'psicol2-telepsicologia',
        label: 'Telepsicología',
        icon: 'Video',
        route: '/dashboard/medico/psicologia/telepsicologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol2-recursos',
        label: 'Recursos Terapéuticos',
        icon: 'BookOpen',
        route: '/dashboard/medico/psicologia/recursos',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Materiales psicoeducativos, ejercicios, tareas',
      },
    ],

    communication: [
      {
        key: 'psicol2-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/psicologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol2-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/psicologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'psicol2-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/psicologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'session-tracker',
      component: '@/components/dashboard/medico/psicologia/widgets/session-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'outcome-scores',
      component: '@/components/dashboard/medico/psicologia/widgets/outcome-scores-widget',
      size: 'large',
    },
    {
      key: 'dropout-alerts',
      component: '@/components/dashboard/medico/psicologia/widgets/dropout-alerts-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'treatment-progress',
      component: '@/components/dashboard/medico/psicologia/widgets/treatment-progress-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'sessions_completed',
    'outcome_improvement',
    'dropout_rate',
    'avg_session_duration',
    'therapeutic_alliance_score',
    'treatment_goal_achievement',
  ],

  kpiDefinitions: {
    sessions_completed: {
      label: 'Sesiones Completadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    outcome_improvement: {
      label: 'Mejora en OQ-45',
      format: 'number',
      direction: 'higher_is_better',
    },
    dropout_rate: {
      label: 'Tasa de Abandono',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    avg_session_duration: {
      label: 'Duración Promedio Sesión (min)',
      format: 'duration',
      direction: 'lower_is_better',
    },
    therapeutic_alliance_score: {
      label: 'Score Alianza Terapéutica (WAI)',
      format: 'number',
      direction: 'higher_is_better',
    },
    treatment_goal_achievement: {
      label: '% Objetivos Terapéuticos Cumplidos',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'sesion_individual',
      'sesion_pareja',
      'sesion_familiar',
      'evaluacion_psicometrica',
      'devolucion_resultados',
      'seguimiento',
      'telepsicologia',
    ],
    defaultDuration: 50,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_psicologica',
      'nota_sesion',
      'plan_tratamiento',
      'informe_psicometrico',
      'evaluacion_oq45',
      'nota_devolucion',
      'cierre_terapeutico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksSessionNotes: true,
      usesPsychometricTests: true,
      tracksOutcomeMeasures: true,
      supportsTherapeuticAllianceAssessment: true,
      requiresConfidentialityProtocol: true,
      tracksTreatmentGoals: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'MessageCircle',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO PSICOLÓGICO
// ============================================================================

/**
 * Subescalas del OQ-45 (Outcome Questionnaire-45)
 * 45 ítems, puntuación total 0-180
 */
export const OQ45_SUBSCALES = [
  { key: 'symptom_distress', label: 'Malestar Sintomático', items: 25, maxScore: 100, clinicalCutoff: 36 },
  { key: 'interpersonal_relations', label: 'Relaciones Interpersonales', items: 11, maxScore: 44, clinicalCutoff: 15 },
  { key: 'social_role', label: 'Rol Social', items: 9, maxScore: 36, clinicalCutoff: 12 },
] as const;

/**
 * Puntos de corte del OQ-45
 */
export const OQ45_CUTOFFS = {
  totalClinicalCutoff: 63,
  reliableChangeIndex: 14,
  description: 'Cambio > 14 puntos indica cambio clínicamente significativo',
} as const;

/**
 * Tipos de intervención terapéutica
 */
export const THERAPEUTIC_INTERVENTION_TYPES = [
  { key: 'cbt', label: 'Terapia Cognitivo-Conductual (TCC)', evidenceLevel: 'A' },
  { key: 'psychodynamic', label: 'Psicoterapia Psicodinámica', evidenceLevel: 'A' },
  { key: 'humanistic', label: 'Terapia Humanista / Centrada en la Persona', evidenceLevel: 'B' },
  { key: 'systemic', label: 'Terapia Sistémica / Familiar', evidenceLevel: 'A' },
  { key: 'gestalt', label: 'Terapia Gestalt', evidenceLevel: 'B' },
  { key: 'brief', label: 'Terapia Breve Estratégica', evidenceLevel: 'B' },
  { key: 'mindfulness', label: 'Terapia basada en Mindfulness (MBCT)', evidenceLevel: 'A' },
  { key: 'act', label: 'Terapia de Aceptación y Compromiso (ACT)', evidenceLevel: 'A' },
  { key: 'interpersonal', label: 'Terapia Interpersonal (TIP)', evidenceLevel: 'A' },
] as const;
