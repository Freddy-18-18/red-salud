/**
 * @file overrides/terapia-ocupacional.ts
 * @description Override de configuración para Terapia Ocupacional.
 *
 * Módulos especializados: evaluación de AVD (FIM, Barthel), seguimiento
 * de terapia de mano, evaluación de procesamiento sensorial, planificación
 * de modificación del hogar, evaluación de capacidad laboral.
 *
 * También exporta constantes de dominio: índice Barthel,
 * categorías de AVD, niveles de asistencia.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Terapia Ocupacional.
 * Especialidad centrada en independencia funcional, actividades de la
 * vida diaria, adaptación del entorno y reintegración laboral.
 */
export const terapiaOcupacionalOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'terapia-ocupacional',
  dashboardPath: '/dashboard/medico/terapia-ocupacional',

  modules: {
    clinical: [
      {
        key: 'terapocup-consulta',
        label: 'Evaluación de Terapia Ocupacional',
        icon: 'Hand',
        route: '/dashboard/medico/terapia-ocupacional/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación funcional integral, perfil ocupacional',
      },
      {
        key: 'terapocup-avd',
        label: 'Evaluación AVD (FIM / Barthel)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/terapia-ocupacional/avd',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['adl_improvement'],
        description: 'Actividades de la Vida Diaria, básicas e instrumentales',
      },
      {
        key: 'terapocup-mano',
        label: 'Terapia de Mano',
        icon: 'Hand',
        route: '/dashboard/medico/terapia-ocupacional/mano',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Férulas, movilización, fuerza de agarre, destreza fina',
      },
      {
        key: 'terapocup-sensorial',
        label: 'Evaluación de Procesamiento Sensorial',
        icon: 'Sparkles',
        route: '/dashboard/medico/terapia-ocupacional/sensorial',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Perfil sensorial, integración sensorial, modulación',
      },
      {
        key: 'terapocup-hogar',
        label: 'Modificación del Hogar',
        icon: 'Home',
        route: '/dashboard/medico/terapia-ocupacional/hogar',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Evaluación del entorno, adaptaciones, ayudas técnicas',
      },
      {
        key: 'terapocup-laboral',
        label: 'Evaluación de Capacidad Laboral',
        icon: 'Briefcase',
        route: '/dashboard/medico/terapia-ocupacional/laboral',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['return_to_work_rate'],
        description: 'FCE (Functional Capacity Evaluation), ergonomía, reintegración',
      },
      {
        key: 'terapocup-cognitiva',
        label: 'Rehabilitación Cognitiva Funcional',
        icon: 'Brain',
        route: '/dashboard/medico/terapia-ocupacional/cognitiva',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Estrategias compensatorias, entrenamiento en AVD',
      },
    ],

    financial: [
      {
        key: 'terapocup-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/terapia-ocupacional/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'terapocup-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/terapia-ocupacional/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'terapocup-telemedicina',
        label: 'Tele-Terapia Ocupacional',
        icon: 'Video',
        route: '/dashboard/medico/terapia-ocupacional/telemedicina',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'terapocup-ayudas-tecnicas',
        label: 'Catálogo Ayudas Técnicas',
        icon: 'Package',
        route: '/dashboard/medico/terapia-ocupacional/ayudas-tecnicas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Productos de apoyo, órtesis, adaptaciones',
      },
    ],

    communication: [
      {
        key: 'terapocup-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/terapia-ocupacional/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'terapocup-portal',
        label: 'Portal del Paciente / Cuidadores',
        icon: 'User',
        route: '/dashboard/medico/terapia-ocupacional/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'terapocup-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/terapia-ocupacional/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'adl-scores',
      component: '@/components/dashboard/medico/terapia-ocupacional/widgets/adl-scores-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hand-therapy-progress',
      component: '@/components/dashboard/medico/terapia-ocupacional/widgets/hand-therapy-progress-widget',
      size: 'medium',
    },
    {
      key: 'independence-tracker',
      component: '@/components/dashboard/medico/terapia-ocupacional/widgets/independence-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'home-modification-plans',
      component: '@/components/dashboard/medico/terapia-ocupacional/widgets/home-modification-plans-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'adl_improvement',
    'return_to_work_rate',
    'independence_scores',
    'sessions_completed',
    'home_modification_completion',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    adl_improvement: {
      label: 'Mejora en AVD (Barthel/FIM)',
      format: 'percentage',
      goal: 0.4,
      direction: 'higher_is_better',
    },
    return_to_work_rate: {
      label: 'Tasa de Retorno al Trabajo',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    independence_scores: {
      label: 'Scores de Independencia',
      format: 'number',
      direction: 'higher_is_better',
    },
    sessions_completed: {
      label: 'Sesiones Completadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    home_modification_completion: {
      label: 'Modificaciones del Hogar Completadas',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial',
      'sesion_tratamiento',
      'evaluacion_avd',
      'terapia_mano',
      'evaluacion_sensorial',
      'visita_domiciliaria',
      'evaluacion_laboral',
      'reevaluacion',
      'teleterapia',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'perfil_ocupacional',
      'evaluacion_avd_barthel',
      'evaluacion_avd_fim',
      'evaluacion_terapia_mano',
      'perfil_sensorial',
      'informe_visita_domiciliaria',
      'evaluacion_capacidad_laboral',
      'programa_intervencion',
      'nota_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksADL: true,
      supportsHandTherapy: true,
      evaluatesSensoryProcessing: true,
      supportsHomeModification: true,
      supportsWorkCapacityEvaluation: true,
      tracksFunctionalIndependence: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#4ADE80',
    icon: 'Hand',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — TERAPIA OCUPACIONAL
// ============================================================================

/**
 * Índice de Barthel — Actividades Básicas de la Vida Diaria
 * 10 ítems, total 0-100
 */
export const BARTHEL_INDEX_ITEMS = [
  { key: 'feeding', label: 'Alimentación', scores: [0, 5, 10], descriptions: ['Dependiente', 'Necesita ayuda', 'Independiente'] },
  { key: 'bathing', label: 'Baño', scores: [0, 5], descriptions: ['Dependiente', 'Independiente'] },
  { key: 'grooming', label: 'Aseo Personal', scores: [0, 5], descriptions: ['Dependiente', 'Independiente'] },
  { key: 'dressing', label: 'Vestirse', scores: [0, 5, 10], descriptions: ['Dependiente', 'Necesita ayuda', 'Independiente'] },
  { key: 'bowels', label: 'Control Intestinal', scores: [0, 5, 10], descriptions: ['Incontinente', 'Accidentes ocasionales', 'Continente'] },
  { key: 'bladder', label: 'Control Vesical', scores: [0, 5, 10], descriptions: ['Incontinente', 'Accidentes ocasionales', 'Continente'] },
  { key: 'toilet_use', label: 'Uso del Inodoro', scores: [0, 5, 10], descriptions: ['Dependiente', 'Necesita ayuda', 'Independiente'] },
  { key: 'transfers', label: 'Transferencias', scores: [0, 5, 10, 15], descriptions: ['Incapaz', 'Gran ayuda', 'Mínima ayuda', 'Independiente'] },
  { key: 'mobility', label: 'Movilidad', scores: [0, 5, 10, 15], descriptions: ['Inmóvil', 'Silla de ruedas', 'Con ayuda', 'Independiente'] },
  { key: 'stairs', label: 'Escaleras', scores: [0, 5, 10], descriptions: ['Incapaz', 'Necesita ayuda', 'Independiente'] },
] as const;

/**
 * Severidad según Barthel
 */
export const BARTHEL_SEVERITY = [
  { range: [0, 20] as const, label: 'Dependencia total', assistanceLevel: 'Asistencia completa 24h' },
  { range: [21, 60] as const, label: 'Dependencia severa', assistanceLevel: 'Asistencia frecuente' },
  { range: [61, 90] as const, label: 'Dependencia moderada', assistanceLevel: 'Asistencia parcial' },
  { range: [91, 99] as const, label: 'Dependencia leve', assistanceLevel: 'Supervisión mínima' },
  { range: [100, 100] as const, label: 'Independiente', assistanceLevel: 'Sin asistencia' },
] as const;

/**
 * Categorías de AVD (Actividades de la Vida Diaria)
 */
export const ADL_CATEGORIES = {
  basic: {
    label: 'ABVD (Actividades Básicas)',
    items: ['Alimentación', 'Baño', 'Vestido', 'Aseo personal', 'Continencia', 'Transferencias', 'Movilidad'],
  },
  instrumental: {
    label: 'AIVD (Actividades Instrumentales)',
    items: ['Uso de teléfono', 'Compras', 'Preparación de comida', 'Cuidado del hogar', 'Lavado de ropa', 'Uso de transporte', 'Manejo de medicación', 'Manejo de finanzas'],
  },
  advanced: {
    label: 'AAVD (Actividades Avanzadas)',
    items: ['Trabajo/estudio', 'Deportes/ejercicio', 'Actividades sociales', 'Viajes', 'Hobbies', 'Voluntariado'],
  },
} as const;
