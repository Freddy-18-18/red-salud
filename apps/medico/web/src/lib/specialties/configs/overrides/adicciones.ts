/**
 * @file overrides/adicciones.ts
 * @description Override de configuración para Medicina de Adicciones.
 *
 * Módulos especializados: seguimiento de uso de sustancias, escalas de
 * abstinencia (CIWA, COWS), notas de entrevista motivacional, prevención
 * de recaídas, seguimiento de drogas en orina, integración 12 pasos.
 *
 * También exporta constantes de dominio: escala CIWA-Ar,
 * escala COWS, clasificación de sustancias.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina de Adicciones.
 * Especialidad con módulos clínicos orientados a detoxificación,
 * rehabilitación, prevención de recaídas y manejo farmacológico.
 */
export const adiccionesOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'adicciones',
  dashboardPath: '/dashboard/medico/adicciones',

  modules: {
    clinical: [
      {
        key: 'adicc-consulta',
        label: 'Consulta de Adicciones',
        icon: 'Stethoscope',
        route: '/dashboard/medico/adicciones/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación integral, historia de consumo, comorbilidades',
      },
      {
        key: 'adicc-uso-sustancias',
        label: 'Seguimiento de Uso de Sustancias',
        icon: 'Activity',
        route: '/dashboard/medico/adicciones/uso-sustancias',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['sobriety_duration'],
        description: 'Diario de consumo, patrón de uso, sustancias activas',
      },
      {
        key: 'adicc-abstinencia',
        label: 'Escalas de Abstinencia (CIWA / COWS)',
        icon: 'Thermometer',
        route: '/dashboard/medico/adicciones/abstinencia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'CIWA-Ar (alcohol), COWS (opioides), monitoreo de síndrome',
      },
      {
        key: 'adicc-entrevista-motivacional',
        label: 'Entrevista Motivacional',
        icon: 'MessageCircle',
        route: '/dashboard/medico/adicciones/entrevista-motivacional',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Etapas de cambio (Prochaska), ambivalencia, plan de acción',
      },
      {
        key: 'adicc-prevencion-recaidas',
        label: 'Prevención de Recaídas',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/adicciones/prevencion-recaidas',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['relapse_rate'],
        description: 'Identificación de disparadores, plan de contingencia, red de apoyo',
      },
      {
        key: 'adicc-drogas-orina',
        label: 'Tamizaje Drogas en Orina',
        icon: 'TestTubes',
        route: '/dashboard/medico/adicciones/drogas-orina',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Panel de drogas, resultados, tendencias de positividad',
      },
      {
        key: 'adicc-12-pasos',
        label: 'Integración 12 Pasos',
        icon: 'Users',
        route: '/dashboard/medico/adicciones/12-pasos',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Asistencia a grupos, padrino/madrina, progreso en pasos',
      },
    ],

    laboratory: [
      {
        key: 'adicc-laboratorio',
        label: 'Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/adicciones/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Perfil hepático, CBC, metabolitos, niveles de metadona/buprenorfina',
      },
    ],

    financial: [
      {
        key: 'adicc-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/adicciones/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'adicc-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/adicciones/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'adicc-telemedicina',
        label: 'Teleadicciones',
        icon: 'Video',
        route: '/dashboard/medico/adicciones/teleadicciones',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'adicc-recursos',
        label: 'Recursos de Apoyo',
        icon: 'BookOpen',
        route: '/dashboard/medico/adicciones/recursos',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Directorio de grupos, centros de rehabilitación, líneas de ayuda',
      },
    ],

    communication: [
      {
        key: 'adicc-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/adicciones/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'adicc-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/adicciones/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'adicc-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/adicciones/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'sobriety-tracker',
      component: '@/components/dashboard/medico/adicciones/widgets/sobriety-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'withdrawal-monitoring',
      component: '@/components/dashboard/medico/adicciones/widgets/withdrawal-monitoring-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'uds-results',
      component: '@/components/dashboard/medico/adicciones/widgets/uds-results-widget',
      size: 'small',
    },
    {
      key: 'relapse-prevention-alerts',
      component: '@/components/dashboard/medico/adicciones/widgets/relapse-prevention-alerts-widget',
      size: 'large',
      required: true,
    },
  ],

  prioritizedKpis: [
    'sobriety_duration',
    'relapse_rate',
    'treatment_completion_rate',
    'uds_positivity_trend',
    'group_attendance',
    'medication_adherence',
  ],

  kpiDefinitions: {
    sobriety_duration: {
      label: 'Duración Promedio Sobriedad (días)',
      format: 'number',
      direction: 'higher_is_better',
    },
    relapse_rate: {
      label: 'Tasa de Recaída',
      format: 'percentage',
      goal: 0.3,
      direction: 'lower_is_better',
    },
    treatment_completion_rate: {
      label: 'Tasa de Finalización de Tratamiento',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    uds_positivity_trend: {
      label: 'Tendencia Positividad Drogas en Orina',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    group_attendance: {
      label: 'Asistencia a Grupos',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    medication_adherence: {
      label: 'Adherencia a Medicación',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_abstinencia',
      'entrevista_motivacional',
      'control_farmacologico',
      'tamizaje_drogas',
      'sesion_grupal',
      'interconsulta_psiquiatria',
      'teleadicciones',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_integral_adicciones',
      'historia_consumo',
      'escala_ciwa',
      'escala_cows',
      'nota_entrevista_motivacional',
      'plan_prevencion_recaidas',
      'informe_tamizaje',
      'nota_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksSubstanceUse: true,
      usesWithdrawalScales: true,
      supportsMotivationalInterviewing: true,
      tracksUrineDrugScreens: true,
      supports12StepIntegration: true,
      requiresRelapsePrevention: true,
      requiresConfidentialityProtocol: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ADICCIONES
// ============================================================================

/**
 * CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol, Revised)
 * 10 ítems, puntuación total 0-67
 */
export const CIWA_AR_ITEMS = [
  { key: 'nausea_vomiting', label: 'Náuseas y Vómitos', maxScore: 7 },
  { key: 'tremor', label: 'Temblor', maxScore: 7 },
  { key: 'paroxysmal_sweats', label: 'Sudoración Paroxística', maxScore: 7 },
  { key: 'anxiety', label: 'Ansiedad', maxScore: 7 },
  { key: 'agitation', label: 'Agitación', maxScore: 7 },
  { key: 'tactile_disturbances', label: 'Alteraciones Táctiles', maxScore: 7 },
  { key: 'auditory_disturbances', label: 'Alteraciones Auditivas', maxScore: 7 },
  { key: 'visual_disturbances', label: 'Alteraciones Visuales', maxScore: 7 },
  { key: 'headache', label: 'Cefalea', maxScore: 7 },
  { key: 'orientation', label: 'Orientación y Conciencia', maxScore: 4 },
] as const;

/**
 * Severidad CIWA-Ar
 */
export const CIWA_AR_SEVERITY = [
  { range: [0, 9] as const, label: 'Leve', action: 'Monitoreo, puede no requerir farmacoterapia' },
  { range: [10, 18] as const, label: 'Moderada', action: 'Considerar benzodiacepinas' },
  { range: [19, 67] as const, label: 'Severa', action: 'Benzodiacepinas obligatorias, considerar UCI' },
] as const;

/**
 * COWS (Clinical Opiate Withdrawal Scale)
 * 11 ítems, puntuación total 0-48
 */
export const COWS_ITEMS = [
  { key: 'resting_pulse', label: 'Frecuencia Cardíaca en Reposo', maxScore: 4 },
  { key: 'sweating', label: 'Sudoración', maxScore: 4 },
  { key: 'restlessness', label: 'Inquietud', maxScore: 5 },
  { key: 'pupil_size', label: 'Tamaño Pupilar', maxScore: 5 },
  { key: 'bone_joint_aches', label: 'Dolor Óseo/Articular', maxScore: 4 },
  { key: 'runny_nose', label: 'Rinorrea / Lagrimeo', maxScore: 4 },
  { key: 'gi_upset', label: 'Malestar GI', maxScore: 5 },
  { key: 'tremor', label: 'Temblor', maxScore: 4 },
  { key: 'yawning', label: 'Bostezos', maxScore: 4 },
  { key: 'anxiety_irritability', label: 'Ansiedad / Irritabilidad', maxScore: 4 },
  { key: 'gooseflesh', label: 'Piloerección', maxScore: 5 },
] as const;

/**
 * Severidad COWS
 */
export const COWS_SEVERITY = [
  { range: [0, 4] as const, label: 'Sin abstinencia', action: 'Monitoreo' },
  { range: [5, 12] as const, label: 'Leve', action: 'Considerar iniciar inducción de buprenorfina' },
  { range: [13, 24] as const, label: 'Moderada', action: 'Iniciar tratamiento' },
  { range: [25, 36] as const, label: 'Moderada-Severa', action: 'Tratamiento agresivo' },
  { range: [37, 48] as const, label: 'Severa', action: 'Manejo hospitalario' },
] as const;

/**
 * Clasificación de sustancias de abuso
 */
export const SUBSTANCE_CATEGORIES = [
  { key: 'alcohol', label: 'Alcohol', withdrawalScale: 'CIWA-Ar', detoxDuration: '3-7 días' },
  { key: 'opioids', label: 'Opioides', withdrawalScale: 'COWS', detoxDuration: '5-10 días' },
  { key: 'benzodiazepines', label: 'Benzodiacepinas', withdrawalScale: 'CIWA-B', detoxDuration: '2-8 semanas' },
  { key: 'cocaine_stimulants', label: 'Cocaína / Estimulantes', withdrawalScale: 'CSSA', detoxDuration: '1-2 semanas' },
  { key: 'cannabis', label: 'Cannabis', withdrawalScale: 'CWS', detoxDuration: '1-2 semanas' },
  { key: 'tobacco', label: 'Tabaco / Nicotina', withdrawalScale: 'Fagerström', detoxDuration: '2-4 semanas' },
  { key: 'inhalants', label: 'Inhalantes', withdrawalScale: null, detoxDuration: 'Variable' },
  { key: 'hallucinogens', label: 'Alucinógenos', withdrawalScale: null, detoxDuration: 'No aplica' },
] as const;
