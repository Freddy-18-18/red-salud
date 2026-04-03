/**
 * @file overrides/neuropsicologia.ts
 * @description Override de configuración para Neuropsicología.
 *
 * Módulos especializados: baterías de tests cognitivos (WAIS, WMS, Trail Making),
 * seguimiento de lesión cerebral, progreso de rehabilitación, estadificación
 * de demencia (GDS), evaluación de retorno al trabajo.
 *
 * También exporta constantes de dominio: baterías cognitivas,
 * escala GDS de deterioro global, dominios cognitivos.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neuropsicología.
 * Especialidad centrada en evaluación cognitiva, rehabilitación
 * neuropsicológica y seguimiento de lesión cerebral.
 */
export const neuropsicologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neuropsicologia',
  dashboardPath: '/dashboard/medico/neuropsicologia',

  modules: {
    clinical: [
      {
        key: 'neuropsi-consulta',
        label: 'Evaluación Neuropsicológica',
        icon: 'BrainCircuit',
        route: '/dashboard/medico/neuropsicologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['evaluations_completed', 'cognitive_recovery_rate'],
        description: 'Entrevista clínica, selección de baterías, evaluación integral',
      },
      {
        key: 'neuropsi-bateria-cognitiva',
        label: 'Batería de Tests Cognitivos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/neuropsicologia/bateria-cognitiva',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'WAIS-IV, WMS-IV, Trail Making A/B, Stroop, Wisconsin, Rey',
      },
      {
        key: 'neuropsi-lesion-cerebral',
        label: 'Seguimiento Lesión Cerebral',
        icon: 'Brain',
        route: '/dashboard/medico/neuropsicologia/lesion-cerebral',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'TEC, ACV, tumores — evolución cognitiva post-lesión',
      },
      {
        key: 'neuropsi-rehabilitacion',
        label: 'Rehabilitación Cognitiva',
        icon: 'RotateCcw',
        route: '/dashboard/medico/neuropsicologia/rehabilitacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['test_retest_improvement'],
        description: 'Programas de estimulación cognitiva, progreso',
      },
      {
        key: 'neuropsi-demencia',
        label: 'Estadificación de Demencia (GDS)',
        icon: 'ListOrdered',
        route: '/dashboard/medico/neuropsicologia/demencia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Global Deterioration Scale, MMSE, MoCA, CDR',
      },
      {
        key: 'neuropsi-retorno-laboral',
        label: 'Evaluación Retorno al Trabajo',
        icon: 'Briefcase',
        route: '/dashboard/medico/neuropsicologia/retorno-laboral',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['functional_outcomes'],
        description: 'Capacidad funcional, aptitud laboral, recomendaciones',
      },
    ],

    laboratory: [
      {
        key: 'neuropsi-neuroimagen',
        label: 'Correlación con Neuroimagen',
        icon: 'Scan',
        route: '/dashboard/medico/neuropsicologia/neuroimagen',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Correlación hallazgos cognitivos con RM, PET, SPECT',
      },
    ],

    financial: [
      {
        key: 'neuropsi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/neuropsicologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuropsi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/neuropsicologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'neuropsi-telemedicina',
        label: 'Teleneuropsicología',
        icon: 'Video',
        route: '/dashboard/medico/neuropsicologia/teleneuropsicologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuropsi-software-cognitivo',
        label: 'Software de Rehabilitación Cognitiva',
        icon: 'Monitor',
        route: '/dashboard/medico/neuropsicologia/software-cognitivo',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'CogniPlus, NeuronUP, Gradior — integración',
      },
    ],

    communication: [
      {
        key: 'neuropsi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/neuropsicologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuropsi-portal',
        label: 'Portal del Paciente / Familiares',
        icon: 'User',
        route: '/dashboard/medico/neuropsicologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'neuropsi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neuropsicologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cognitive-profile',
      component: '@/components/dashboard/medico/neuropsicologia/widgets/cognitive-profile-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'rehab-progress',
      component: '@/components/dashboard/medico/neuropsicologia/widgets/rehab-progress-widget',
      size: 'medium',
    },
    {
      key: 'dementia-staging',
      component: '@/components/dashboard/medico/neuropsicologia/widgets/dementia-staging-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'test-retest-comparison',
      component: '@/components/dashboard/medico/neuropsicologia/widgets/test-retest-comparison-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'cognitive_recovery_rate',
    'test_retest_improvement',
    'functional_outcomes',
    'evaluations_completed',
    'rehab_program_completion',
    'return_to_work_rate',
  ],

  kpiDefinitions: {
    cognitive_recovery_rate: {
      label: 'Tasa de Recuperación Cognitiva',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    test_retest_improvement: {
      label: 'Mejora Test-Retest',
      format: 'percentage',
      goal: 0.3,
      direction: 'higher_is_better',
    },
    functional_outcomes: {
      label: 'Resultados Funcionales',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    evaluations_completed: {
      label: 'Evaluaciones Completadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    rehab_program_completion: {
      label: 'Completitud Programa de Rehabilitación',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    return_to_work_rate: {
      label: 'Tasa de Retorno al Trabajo',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'sesion_bateria',
      'rehabilitacion_cognitiva',
      'devolucion_informe',
      'seguimiento',
      'evaluacion_retorno_laboral',
      'evaluacion_demencia',
      'teleneuropsicologia',
    ],
    defaultDuration: 60,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_neuropsicologica',
      'seleccion_bateria',
      'informe_neuropsicologico',
      'plan_rehabilitacion_cognitiva',
      'nota_evolucion',
      'evaluacion_demencia',
      'informe_aptitud_laboral',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresCognitiveTestBatteries: true,
      tracksBrainInjury: true,
      supportsDementiaStaging: true,
      tracksRehabProgress: true,
      supportsReturnToWorkAssessment: true,
      correlatesWithNeuroimaging: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'BrainCircuit',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEUROPSICOLOGÍA
// ============================================================================

/**
 * Baterías de tests cognitivos principales
 */
export const COGNITIVE_TEST_BATTERIES = [
  { key: 'wais_iv', label: 'WAIS-IV', domain: 'inteligencia_general', duration: '90-120 min', subtests: ['Cubos', 'Semejanzas', 'Dígitos', 'Matrices', 'Vocabulario', 'Aritmética', 'Búsqueda de Símbolos', 'Rompecabezas Visuales', 'Información', 'Claves'] },
  { key: 'wms_iv', label: 'WMS-IV (Escala de Memoria de Wechsler)', domain: 'memoria', duration: '60-90 min', subtests: ['Memoria Lógica', 'Pares Verbales', 'Diseños', 'Reproducción Visual', 'Adición Espacial'] },
  { key: 'trail_making', label: 'Trail Making Test A/B', domain: 'atención_velocidad_flexibilidad', duration: '5-10 min', subtests: ['Parte A (velocidad)', 'Parte B (flexibilidad)'] },
  { key: 'stroop', label: 'Test de Stroop', domain: 'inhibición_control_atencional', duration: '5 min', subtests: ['Palabra', 'Color', 'Palabra-Color'] },
  { key: 'wisconsin', label: 'Wisconsin Card Sorting Test', domain: 'función_ejecutiva', duration: '15-20 min', subtests: ['Categorías', 'Errores Perseverativos', 'Respuestas Conceptuales'] },
  { key: 'rey_figure', label: 'Figura Compleja de Rey', domain: 'visuoconstrucción_memoria_visual', duration: '10-15 min', subtests: ['Copia', 'Memoria Inmediata', 'Memoria Diferida'] },
  { key: 'benton', label: 'Test de Retención Visual de Benton', domain: 'memoria_visual', duration: '10-15 min', subtests: ['Administración A', 'Administración C'] },
  { key: 'fluencia_verbal', label: 'Fluencia Verbal (FAS / Animales)', domain: 'lenguaje_función_ejecutiva', duration: '5 min', subtests: ['Fonológica (FAS)', 'Semántica (Animales)'] },
] as const;

/**
 * Escala GDS (Global Deterioration Scale) — Reisberg
 * Estadificación de deterioro cognitivo / demencia
 */
export const GDS_STAGES = [
  { stage: 1, label: 'Sin deterioro', description: 'Sin quejas subjetivas ni déficits objetivos', clinicalPhase: 'Normal' },
  { stage: 2, label: 'Deterioro muy leve', description: 'Quejas subjetivas de memoria, sin déficits objetivos', clinicalPhase: 'Olvido benigno' },
  { stage: 3, label: 'Deterioro leve', description: 'Déficits sutiles detectables en evaluación, deterioro laboral', clinicalPhase: 'DCL (Deterioro Cognitivo Leve)' },
  { stage: 4, label: 'Deterioro moderado', description: 'Déficits claros en concentración, memoria reciente, orientación', clinicalPhase: 'Demencia leve' },
  { stage: 5, label: 'Deterioro moderado-severo', description: 'No sobrevive sin asistencia, desorientado, dependiente', clinicalPhase: 'Demencia moderada' },
  { stage: 6, label: 'Deterioro severo', description: 'Olvida nombre del cónyuge, incontinencia, cambios personalidad', clinicalPhase: 'Demencia moderada-severa' },
  { stage: 7, label: 'Deterioro muy severo', description: 'Pérdida habilidades verbales y motoras, requiere asistencia total', clinicalPhase: 'Demencia severa' },
] as const;

/**
 * Dominios cognitivos evaluados en neuropsicología
 */
export const COGNITIVE_DOMAINS = [
  { key: 'attention', label: 'Atención y Concentración', tests: ['Trail Making A', 'Dígitos', 'CPT'] },
  { key: 'memory_verbal', label: 'Memoria Verbal', tests: ['WMS Memoria Lógica', 'RAVLT', 'Pares Verbales'] },
  { key: 'memory_visual', label: 'Memoria Visual', tests: ['Rey Diferida', 'Benton', 'WMS Reproducción Visual'] },
  { key: 'executive_function', label: 'Función Ejecutiva', tests: ['Wisconsin', 'Trail Making B', 'Torre de Londres', 'Stroop'] },
  { key: 'language', label: 'Lenguaje', tests: ['Boston Naming', 'Fluencia Verbal', 'Token Test'] },
  { key: 'visuospatial', label: 'Habilidad Visuoespacial', tests: ['Rey Copia', 'Cubos WAIS', 'Rompecabezas Visuales'] },
  { key: 'processing_speed', label: 'Velocidad de Procesamiento', tests: ['Claves', 'Búsqueda de Símbolos', 'Trail Making A'] },
] as const;
