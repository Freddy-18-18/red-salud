/**
 * @file overrides/psiquiatria.ts
 * @description Override de configuración para Psiquiatría.
 *
 * Módulos especializados: seguimiento diagnóstico DSM-5, escalas PHQ-9/GAD-7,
 * manejo de medicación psiquiátrica, evaluación de riesgo suicida (Columbia),
 * cribado de uso de sustancias, registros de terapia cognitivo-conductual.
 *
 * También exporta constantes de dominio psiquiátrico: escalas PHQ-9, GAD-7,
 * clasificación Columbia, categorías de medicación psiquiátrica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Psiquiatría.
 * Especialidad con módulos clínicos orientados a salud mental,
 * escalas estandarizadas y gestión farmacológica especializada.
 */
export const psiquiatriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'psiquiatria',
  dashboardPath: '/dashboard/medico/psiquiatria',

  modules: {
    clinical: [
      {
        key: 'psiq-consulta',
        label: 'Consulta Psiquiátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/psiquiatria/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Entrevista psiquiátrica estructurada, examen mental',
      },
      {
        key: 'psiq-dsm5',
        label: 'Diagnóstico DSM-5',
        icon: 'BookOpen',
        route: '/dashboard/medico/psiquiatria/dsm5',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento diagnóstico multiaxial DSM-5, formulación',
      },
      {
        key: 'psiq-escalas',
        label: 'Escalas Clínicas (PHQ-9 / GAD-7)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/psiquiatria/escalas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['phq9_improvement'],
        description: 'PHQ-9, GAD-7, MADRS, YMRS, PANSS',
      },
      {
        key: 'psiq-medicacion',
        label: 'Gestión de Medicación Psiquiátrica',
        icon: 'Pill',
        route: '/dashboard/medico/psiquiatria/medicacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['medication_adherence'],
        description: 'Antidepresivos, antipsicóticos, estabilizadores, ansiolíticos',
      },
      {
        key: 'psiq-riesgo-suicida',
        label: 'Evaluación Riesgo Suicida (Columbia)',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/psiquiatria/riesgo-suicida',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['crisis_prevention_rate'],
        description: 'C-SSRS (Columbia Suicide Severity Rating Scale)',
      },
      {
        key: 'psiq-sustancias',
        label: 'Cribado de Uso de Sustancias',
        icon: 'Shield',
        route: '/dashboard/medico/psiquiatria/sustancias',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'AUDIT, DAST, CAGE — patología dual',
      },
      {
        key: 'psiq-tcc',
        label: 'Registros de Terapia (TCC)',
        icon: 'Brain',
        route: '/dashboard/medico/psiquiatria/tcc',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Notas de terapia cognitivo-conductual, tareas, progreso',
      },
    ],

    financial: [
      {
        key: 'psiq-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/psiquiatria/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psiq-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/psiquiatria/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    laboratory: [
      {
        key: 'psiq-laboratorio',
        label: 'Laboratorio / Niveles Séricos',
        icon: 'FlaskConical',
        route: '/dashboard/medico/psiquiatria/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Litemia, niveles de anticonvulsivantes, perfil metabólico',
      },
    ],

    technology: [
      {
        key: 'psiq-telemedicina',
        label: 'Telepsiquiatría',
        icon: 'Video',
        route: '/dashboard/medico/psiquiatria/telepsiquiatria',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psiq-calculadoras',
        label: 'Calculadoras Clínicas',
        icon: 'Calculator',
        route: '/dashboard/medico/psiquiatria/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Conversión de dosis, equivalencias de antipsicóticos',
      },
    ],

    communication: [
      {
        key: 'psiq-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/psiquiatria/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psiq-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/psiquiatria/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'psiq-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/psiquiatria/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'phq9-tracking',
      component: '@/components/dashboard/medico/psiquiatria/widgets/phq9-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'suicide-risk-alerts',
      component: '@/components/dashboard/medico/psiquiatria/widgets/suicide-risk-alerts-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'medication-adherence',
      component: '@/components/dashboard/medico/psiquiatria/widgets/medication-adherence-widget',
      size: 'medium',
    },
    {
      key: 'crisis-prevention',
      component: '@/components/dashboard/medico/psiquiatria/widgets/crisis-prevention-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'phq9_improvement',
    'medication_adherence',
    'crisis_prevention_rate',
    'readmission_30d',
    'treatment_dropout_rate',
    'avg_consultation_duration',
  ],

  kpiDefinitions: {
    phq9_improvement: {
      label: 'Mejora PHQ-9 Promedio',
      format: 'number',
      direction: 'higher_is_better',
    },
    medication_adherence: {
      label: 'Adherencia a Medicación',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    crisis_prevention_rate: {
      label: 'Tasa de Prevención de Crisis',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    readmission_30d: {
      label: 'Reingreso Hospitalario 30 Días',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    treatment_dropout_rate: {
      label: 'Tasa de Abandono de Tratamiento',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    avg_consultation_duration: {
      label: 'Duración Promedio Consulta (min)',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_medicacion',
      'sesion_terapia',
      'evaluacion_riesgo',
      'interconsulta',
      'emergencia_psiquiatrica',
      'telepsiquiatria',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'entrevista_psiquiatrica',
      'examen_mental',
      'formulacion_diagnostica_dsm5',
      'evaluacion_riesgo_suicida',
      'plan_tratamiento_farmacologico',
      'nota_terapia_tcc',
      'cribado_sustancias',
      'informe_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresDSM5Tracking: true,
      usesPHQ9GAD7Scales: true,
      requiresSuicideRiskAssessment: true,
      tracksSubstanceUse: true,
      supportsCBTLogs: true,
      tracksMedicationLevels: true,
      requiresConfidentialityProtocol: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'Brain',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO PSIQUIÁTRICO
// ============================================================================

/**
 * Cuestionario PHQ-9 (Patient Health Questionnaire-9)
 * Depresión: 9 ítems, 0-3 cada uno (total 0-27)
 */
export const PHQ9_ITEMS = [
  { key: 'anhedonia', label: 'Poco interés o placer en hacer las cosas' },
  { key: 'depressed_mood', label: 'Sentirse decaído/a, deprimido/a o sin esperanza' },
  { key: 'sleep', label: 'Problemas para dormir, o dormir demasiado' },
  { key: 'fatigue', label: 'Sentirse cansado/a o con poca energía' },
  { key: 'appetite', label: 'Poco apetito o comer en exceso' },
  { key: 'guilt', label: 'Sentirse mal consigo mismo/a' },
  { key: 'concentration', label: 'Dificultad para concentrarse' },
  { key: 'psychomotor', label: 'Moverse o hablar tan lento que otros lo notan, o lo contrario' },
  { key: 'suicidal_ideation', label: 'Pensamientos de que estaría mejor muerto/a o de hacerse daño' },
] as const;

/**
 * Severidad PHQ-9
 */
export const PHQ9_SEVERITY = [
  { range: [0, 4] as const, label: 'Mínima', action: 'Monitoreo' },
  { range: [5, 9] as const, label: 'Leve', action: 'Seguimiento, considerar tratamiento' },
  { range: [10, 14] as const, label: 'Moderada', action: 'Plan de tratamiento activo' },
  { range: [15, 19] as const, label: 'Moderada-Severa', action: 'Farmacoterapia y/o psicoterapia' },
  { range: [20, 27] as const, label: 'Severa', action: 'Farmacoterapia + psicoterapia, considerar referencia' },
] as const;

/**
 * Cuestionario GAD-7 (Generalized Anxiety Disorder-7)
 * Ansiedad: 7 ítems, 0-3 cada uno (total 0-21)
 */
export const GAD7_ITEMS = [
  { key: 'nervousness', label: 'Sentirse nervioso/a, ansioso/a o con los nervios de punta' },
  { key: 'uncontrollable_worry', label: 'No poder dejar de preocuparse o controlar la preocupación' },
  { key: 'excessive_worry', label: 'Preocuparse demasiado por diferentes cosas' },
  { key: 'restlessness', label: 'Dificultad para relajarse' },
  { key: 'irritability', label: 'Sentirse tan inquieto/a que es difícil quedarse quieto/a' },
  { key: 'annoyance', label: 'Molestarse o irritarse fácilmente' },
  { key: 'fear', label: 'Sentir miedo como si algo terrible pudiera pasar' },
] as const;

/**
 * Categorías de medicación psiquiátrica
 */
export const PSYCHIATRIC_MEDICATION_CATEGORIES = [
  { key: 'ssri', label: 'ISRS (Inhibidores Selectivos de Recaptación de Serotonina)', examples: ['Fluoxetina', 'Sertralina', 'Escitalopram', 'Paroxetina'] },
  { key: 'snri', label: 'IRSN (Inhibidores de Recaptación de Serotonina-Norepinefrina)', examples: ['Venlafaxina', 'Duloxetina', 'Desvenlafaxina'] },
  { key: 'atypical_antidepressants', label: 'Antidepresivos Atípicos', examples: ['Bupropión', 'Mirtazapina', 'Trazodona'] },
  { key: 'typical_antipsychotics', label: 'Antipsicóticos Típicos', examples: ['Haloperidol', 'Clorpromazina', 'Levomepromazina'] },
  { key: 'atypical_antipsychotics', label: 'Antipsicóticos Atípicos', examples: ['Risperidona', 'Quetiapina', 'Olanzapina', 'Aripiprazol', 'Clozapina'] },
  { key: 'mood_stabilizers', label: 'Estabilizadores del Ánimo', examples: ['Litio', 'Ácido Valproico', 'Carbamazepina', 'Lamotrigina'] },
  { key: 'benzodiazepines', label: 'Benzodiacepinas', examples: ['Clonazepam', 'Alprazolam', 'Lorazepam', 'Diazepam'] },
  { key: 'stimulants', label: 'Estimulantes (TDAH)', examples: ['Metilfenidato', 'Atomoxetina', 'Lisdexanfetamina'] },
] as const;

/**
 * Escala Columbia de Severidad Suicida (C-SSRS) — categorías simplificadas
 */
export const COLUMBIA_SUICIDE_CATEGORIES = [
  { level: 1, label: 'Deseo de estar muerto', severity: 'low', action: 'Monitoreo, plan de seguridad' },
  { level: 2, label: 'Pensamientos suicidas no específicos', severity: 'low', action: 'Evaluación completa, plan de seguridad' },
  { level: 3, label: 'Ideación suicida con método (sin plan)', severity: 'moderate', action: 'Plan de seguridad, considerar hospitalización' },
  { level: 4, label: 'Ideación con intención (sin plan específico)', severity: 'high', action: 'Hospitalización recomendada' },
  { level: 5, label: 'Ideación con intención y plan', severity: 'critical', action: 'Hospitalización inmediata' },
] as const;
