/**
 * @file overrides/medicina-fisica-rehabilitacion.ts
 * @description Override de configuración para Medicina Física y Rehabilitación (PM&R).
 *
 * Módulos especializados: puntuación FIM, manejo de espasticidad
 * (Modified Ashworth), ajuste de prótesis/órtesis, estudios
 * electrodiagnósticos (EMG/NCS), evaluación de discapacidad,
 * seguimiento de metas de rehabilitación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaFisicaRehabilitacionOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-fisica-rehabilitacion',
  dashboardPath: '/dashboard/medico/medicina-fisica-rehabilitacion',

  modules: {
    clinical: [
      {
        key: 'rehab-consulta',
        label: 'Consulta de Rehabilitación',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'rehab-fim',
        label: 'Puntuación FIM',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/fim',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['fim_gain_rate'],
      },
      {
        key: 'rehab-espasticidad',
        label: 'Manejo de Espasticidad (Ashworth)',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/espasticidad',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'rehab-protesis-ortesis',
        label: 'Prótesis y Órtesis',
        icon: 'Wrench',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/protesis-ortesis',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'rehab-electrodiagnostico',
        label: 'Estudios Electrodiagnósticos (EMG/NCS)',
        icon: 'Zap',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/electrodiagnostico',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'rehab-discapacidad',
        label: 'Evaluación de Discapacidad',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/discapacidad',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'rehab-metas',
        label: 'Seguimiento de Metas de Rehabilitación',
        icon: 'Target',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/metas',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['goal_achievement_rate'],
      },
    ],

    lab: [
      {
        key: 'rehab-emg',
        label: 'Laboratorio EMG / NCS',
        icon: 'BarChart3',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/emg',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'rehab-funcional',
        label: 'Evaluación Funcional',
        icon: 'Gauge',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/funcional',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'rehab-imagenologia',
        label: 'Imagenología MSK',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'rehab-calculadoras',
        label: 'Calculadoras de Rehabilitación',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'rehab-equipo',
        label: 'Equipo Interdisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/equipo',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'rehab-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
      {
        key: 'rehab-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/remisiones',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'rehab-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-fisica-rehabilitacion/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'fim-progress-tracker',
      component: '@/components/dashboard/medico/medicina-fisica-rehabilitacion/widgets/fim-progress-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'rehab-goals-summary',
      component: '@/components/dashboard/medico/medicina-fisica-rehabilitacion/widgets/rehab-goals-summary-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'discharge-disposition',
      component: '@/components/dashboard/medico/medicina-fisica-rehabilitacion/widgets/discharge-disposition-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'fim_gain_rate',
    'discharge_disposition_home',
    'goal_achievement_rate',
    'avg_length_of_stay',
    'readmission_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    fim_gain_rate: {
      label: 'Ganancia FIM Promedio',
      format: 'number',
      direction: 'higher_is_better',
    },
    discharge_disposition_home: {
      label: 'Egreso a Domicilio',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    goal_achievement_rate: {
      label: 'Tasa de Logro de Metas',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    avg_length_of_stay: {
      label: 'Estancia Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    readmission_rate: {
      label: 'Tasa de Reingreso',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
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
      'evaluacion_inicial',
      'seguimiento_rehabilitacion',
      'electrodiagnostico_emg',
      'evaluacion_espasticidad',
      'ajuste_protesis_ortesis',
      'evaluacion_discapacidad',
      'revision_metas',
      'inyeccion_toxina_botulinica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_rehabilitacion',
      'puntuacion_fim',
      'escala_ashworth',
      'prescripcion_protesis_ortesis',
      'informe_emg_ncs',
      'evaluacion_discapacidad',
      'plan_rehabilitacion',
      'nota_progreso',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      usesFIMScoring: true,
      tracksSpasticity: true,
      supportsProstheticOrthoticFitting: true,
      supportsElectrodiagnostics: true,
      tracksDisability: true,
      tracksRehabGoals: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'Activity',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE MEDICINA FÍSICA Y REHABILITACIÓN
// ============================================================================

/**
 * Categorías del FIM (Functional Independence Measure)
 */
export const FIM_CATEGORIES = [
  { domain: 'self_care', label: 'Autocuidado', items: ['Alimentación', 'Aseo', 'Baño', 'Vestido superior', 'Vestido inferior', 'Toileting'], maxScore: 42 },
  { domain: 'sphincter', label: 'Control de Esfínteres', items: ['Control vesical', 'Control intestinal'], maxScore: 14 },
  { domain: 'transfers', label: 'Transferencias', items: ['Cama/silla/silla de ruedas', 'Inodoro', 'Tina/ducha'], maxScore: 21 },
  { domain: 'locomotion', label: 'Locomoción', items: ['Marcha/silla de ruedas', 'Escaleras'], maxScore: 14 },
  { domain: 'communication', label: 'Comunicación', items: ['Comprensión', 'Expresión'], maxScore: 14 },
  { domain: 'social_cognition', label: 'Cognición Social', items: ['Interacción social', 'Resolución de problemas', 'Memoria'], maxScore: 21 },
] as const;

/**
 * Escala de Ashworth Modificada para espasticidad
 */
export const MODIFIED_ASHWORTH_SCALE = [
  { score: 0, label: '0', description: 'Sin aumento del tono muscular' },
  { score: 1, label: '1', description: 'Ligero aumento del tono, enganche y liberación o resistencia mínima al final del ROM' },
  { score: 1.5, label: '1+', description: 'Ligero aumento del tono, enganche seguido de resistencia mínima en < 50% del ROM' },
  { score: 2, label: '2', description: 'Aumento marcado del tono en la mayor parte del ROM, pero el segmento se mueve fácilmente' },
  { score: 3, label: '3', description: 'Aumento considerable del tono, movimiento pasivo difícil' },
  { score: 4, label: '4', description: 'Segmento rígido en flexión o extensión' },
] as const;
