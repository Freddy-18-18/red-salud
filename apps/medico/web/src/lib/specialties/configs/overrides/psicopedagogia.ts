/**
 * @file overrides/psicopedagogia.ts
 * @description Override de configuración para Psicopedagogía.
 *
 * Módulos especializados: baterías de evaluación del aprendizaje
 * (WISC, Bender), pruebas de CI, seguimiento de rendimiento
 * académico, documentación de PEI (Plan Educativo Individual),
 * progreso de intervención, coordinación escuela-familia.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const psicopedagogiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'psicopedagogia',
  dashboardPath: '/dashboard/medico/psicopedagogia',

  modules: {
    clinical: [
      {
        key: 'psicoped-consulta',
        label: 'Consulta Psicopedagógica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/psicopedagogia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'psicoped-evaluacion',
        label: 'Baterías de Evaluación',
        icon: 'ClipboardList',
        route: '/dashboard/medico/psicopedagogia/evaluacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['assessment_completion_rate'],
      },
      {
        key: 'psicoped-ci',
        label: 'Pruebas de CI (WISC)',
        icon: 'Brain',
        route: '/dashboard/medico/psicopedagogia/ci',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'psicoped-rendimiento',
        label: 'Seguimiento de Rendimiento Académico',
        icon: 'TrendingUp',
        route: '/dashboard/medico/psicopedagogia/rendimiento',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['academic_improvement_rate'],
      },
      {
        key: 'psicoped-pei',
        label: 'Plan Educativo Individual (PEI)',
        icon: 'FileText',
        route: '/dashboard/medico/psicopedagogia/pei',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'psicoped-intervencion',
        label: 'Progreso de Intervención',
        icon: 'Target',
        route: '/dashboard/medico/psicopedagogia/intervencion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['intervention_adherence_rate'],
      },
    ],

    lab: [
      {
        key: 'psicoped-bender',
        label: 'Test de Bender',
        icon: 'PenTool',
        route: '/dashboard/medico/psicopedagogia/bender',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicoped-grafomotricidad',
        label: 'Evaluación de Grafomotricidad',
        icon: 'Pencil',
        route: '/dashboard/medico/psicopedagogia/grafomotricidad',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'psicoped-herramientas',
        label: 'Herramientas de Evaluación Digital',
        icon: 'Monitor',
        route: '/dashboard/medico/psicopedagogia/herramientas',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'psicoped-escuela',
        label: 'Coordinación Escuela-Familia',
        icon: 'Users',
        route: '/dashboard/medico/psicopedagogia/escuela',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicoped-portal',
        label: 'Portal Familia',
        icon: 'User',
        route: '/dashboard/medico/psicopedagogia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
      {
        key: 'psicoped-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/psicopedagogia/remisiones',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'psicoped-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/psicopedagogia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'academic-progress-tracker',
      component: '@/components/dashboard/medico/psicopedagogia/widgets/academic-progress-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'assessment-summary',
      component: '@/components/dashboard/medico/psicopedagogia/widgets/assessment-summary-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'intervention-milestones',
      component: '@/components/dashboard/medico/psicopedagogia/widgets/intervention-milestones-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'academic_improvement_rate',
    'intervention_adherence_rate',
    'assessment_completion_rate',
    'iep_goal_achievement',
    'school_coordination_rate',
    'parent_satisfaction_score',
  ],

  kpiDefinitions: {
    academic_improvement_rate: {
      label: 'Tasa de Mejora Académica',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    intervention_adherence_rate: {
      label: 'Adherencia a la Intervención',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    assessment_completion_rate: {
      label: 'Tasa de Completación de Evaluaciones',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    iep_goal_achievement: {
      label: 'Logro de Metas del PEI',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    school_coordination_rate: {
      label: 'Tasa de Coordinación Escolar',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    parent_satisfaction_score: {
      label: 'Satisfacción de los Padres',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'aplicacion_wisc',
      'aplicacion_bender',
      'sesion_intervencion',
      'revision_pei',
      'reunion_escolar',
      'seguimiento',
      'informe_padres',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_psicopedagogica',
      'informe_wisc',
      'informe_bender',
      'plan_educativo_individual',
      'progreso_intervencion',
      'coordinacion_escolar',
      'informe_para_escuela',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      usesLearningAssessment: true,
      supportsIQTesting: true,
      tracksAcademicPerformance: true,
      supportsIEPDocumentation: true,
      tracksInterventionProgress: true,
      supportsSchoolCoordination: true,
    },
  },

  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    icon: 'BookOpen',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE PSICOPEDAGOGÍA
// ============================================================================

/**
 * Índices de la escala WISC-V
 */
export const WISC_V_INDICES = [
  { key: 'vci', label: 'Comprensión Verbal (ICV)', subtests: ['Semejanzas', 'Vocabulario'], mean: 100, sd: 15 },
  { key: 'vsi', label: 'Visoespacial (IVE)', subtests: ['Diseño con Cubos', 'Rompecabezas Visuales'], mean: 100, sd: 15 },
  { key: 'fri', label: 'Razonamiento Fluido (IRF)', subtests: ['Matrices', 'Balanzas'], mean: 100, sd: 15 },
  { key: 'wmi', label: 'Memoria de Trabajo (IMT)', subtests: ['Retención de Dígitos', 'Dibujos'], mean: 100, sd: 15 },
  { key: 'psi', label: 'Velocidad de Procesamiento (IVP)', subtests: ['Claves', 'Búsqueda de Símbolos'], mean: 100, sd: 15 },
  { key: 'fsiq', label: 'CI Total (CIT)', subtests: ['Compuesto de 7 subtests'], mean: 100, sd: 15 },
] as const;

/**
 * Clasificación de CI según percentiles
 */
export const IQ_CLASSIFICATION = [
  { range: '≥ 130', percentile: '≥ 98', label: 'Muy superior', classification: 'Superdotación' },
  { range: '120-129', percentile: '91-97', label: 'Superior', classification: 'Alto' },
  { range: '110-119', percentile: '75-90', label: 'Promedio alto', classification: 'Normal alto' },
  { range: '90-109', percentile: '25-74', label: 'Promedio', classification: 'Normal' },
  { range: '80-89', percentile: '9-24', label: 'Promedio bajo', classification: 'Normal bajo' },
  { range: '70-79', percentile: '2-8', label: 'Limítrofe', classification: 'Funcionamiento intelectual limítrofe' },
  { range: '≤ 69', percentile: '≤ 1', label: 'Extremadamente bajo', classification: 'Discapacidad intelectual' },
] as const;
