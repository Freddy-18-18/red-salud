/**
 * @file overrides/psiquiatria-infantil.ts
 * @description Override de configuración para Psiquiatría Infantil.
 *
 * Módulos especializados para el manejo psiquiátrico infantil:
 * escalas de evaluación conductual (CBCL, Conners), titulación de
 * medicamentos, integración de reportes escolares, registros de
 * terapia de juego, notas de terapia familiar.
 *
 * También exporta constantes de dominio: escalas CBCL, escalas Conners,
 * categorías diagnósticas DSM-5, tipos de terapia infantil.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Psiquiatría Infantil.
 * Especialidad con módulos clínicos especializados para la salud mental infantil.
 */
export const psiquiatriaInfantilOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'psiquiatria-infantil',
  dashboardPath: '/dashboard/medico/psiquiatria-infantil',

  modules: {
    clinical: [
      {
        key: 'psiqinf-consulta',
        label: 'Consulta Psiquiátrica Infantil',
        icon: 'Brain',
        route: '/dashboard/medico/psiquiatria-infantil/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['symptom_improvement', 'medication_adherence'],
      },
      {
        key: 'psiqinf-cbcl',
        label: 'Evaluación CBCL',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/psiquiatria-infantil/cbcl',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['symptom_improvement'],
      },
      {
        key: 'psiqinf-conners',
        label: 'Evaluación Conners (TDAH)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/psiquiatria-infantil/conners',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['symptom_improvement'],
      },
      {
        key: 'psiqinf-medicacion',
        label: 'Titulación de Medicamentos',
        icon: 'Pill',
        route: '/dashboard/medico/psiquiatria-infantil/medicacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['medication_adherence'],
      },
      {
        key: 'psiqinf-terapia-juego',
        label: 'Terapia de Juego',
        icon: 'Puzzle',
        route: '/dashboard/medico/psiquiatria-infantil/terapia-juego',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['symptom_improvement'],
      },
      {
        key: 'psiqinf-terapia-familiar',
        label: 'Terapia Familiar',
        icon: 'Users',
        route: '/dashboard/medico/psiquiatria-infantil/terapia-familiar',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['symptom_improvement'],
      },
    ],

    communication: [
      {
        key: 'psiqinf-reportes-escuela',
        label: 'Reportes Escolares',
        icon: 'GraduationCap',
        route: '/dashboard/medico/psiquiatria-infantil/reportes-escuela',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['school_performance'],
      },
      {
        key: 'psiqinf-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/psiquiatria-infantil/portal-padres',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'psiqinf-escalas',
        label: 'Escalas y Cuestionarios',
        icon: 'FileCheck',
        route: '/dashboard/medico/psiquiatria-infantil/escalas',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psiqinf-telemedicina',
        label: 'Telepsiquiatría Infantil',
        icon: 'Video',
        route: '/dashboard/medico/psiquiatria-infantil/telemedicina',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'behavioral-assessment-summary',
      component: '@/components/dashboard/medico/psiquiatria-infantil/widgets/behavioral-assessment-summary-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'medication-titration-tracker',
      component: '@/components/dashboard/medico/psiquiatria-infantil/widgets/medication-titration-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'school-reports-integration',
      component: '@/components/dashboard/medico/psiquiatria-infantil/widgets/school-reports-integration-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'symptom_improvement',
    'medication_adherence',
    'school_performance',
    'therapy_completion',
    'follow_up_rate',
    'family_satisfaction_score',
  ],

  kpiDefinitions: {
    symptom_improvement: {
      label: 'Mejoría Sintomática',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    medication_adherence: {
      label: 'Adherencia a Medicación',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    school_performance: {
      label: 'Rendimiento Escolar',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    therapy_completion: {
      label: 'Completamiento de Terapia',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    family_satisfaction_score: {
      label: 'Satisfacción Familiar',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_psiquiatrica_infantil',
      'evaluacion_cbcl',
      'evaluacion_conners',
      'ajuste_medicacion',
      'sesion_terapia_juego',
      'sesion_terapia_familiar',
      'revision_escolar',
      'seguimiento',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_psiquiatrica_infantil',
      'evaluacion_cbcl',
      'evaluacion_conners',
      'plan_farmacologico',
      'nota_terapia_juego',
      'nota_terapia_familiar',
      'reporte_escolar',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      usesCBCLAssessment: true,
      usesConnersAssessment: true,
      tracksMedicationTitration: true,
      integratesSchoolReports: true,
      logsPlayTherapy: true,
      logsFamilyTherapy: true,
      requiresParentalConsent: true,
      supportsConfidentialNotes: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'Brain',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — PSIQUIATRÍA INFANTIL
// ============================================================================

/**
 * Escalas del CBCL (Child Behavior Checklist) — síndromes
 */
export const CBCL_SYNDROMES = {
  internalizing: [
    { key: 'anxious_depressed', label: 'Ansioso/Deprimido', items: 13 },
    { key: 'withdrawn_depressed', label: 'Retraído/Deprimido', items: 8 },
    { key: 'somatic_complaints', label: 'Quejas Somáticas', items: 11 },
  ],
  externalizing: [
    { key: 'rule_breaking', label: 'Conducta de Romper Reglas', items: 17 },
    { key: 'aggressive', label: 'Conducta Agresiva', items: 18 },
  ],
  other: [
    { key: 'social_problems', label: 'Problemas Sociales', items: 11 },
    { key: 'thought_problems', label: 'Problemas de Pensamiento', items: 15 },
    { key: 'attention_problems', label: 'Problemas de Atención', items: 10 },
  ],
  interpretation: {
    normal: { tScoreMax: 64, label: 'Normal' },
    borderline: { tScoreMin: 65, tScoreMax: 69, label: 'Limítrofe' },
    clinical: { tScoreMin: 70, label: 'Clínico' },
  },
};

/**
 * Escalas de Conners (Conners 3 — TDAH)
 */
export const CONNERS_SCALES = {
  parentForm: [
    { key: 'inattention', label: 'Inatención', items: 10 },
    { key: 'hyperactivity_impulsivity', label: 'Hiperactividad/Impulsividad', items: 10 },
    { key: 'learning_problems', label: 'Problemas de Aprendizaje', items: 10 },
    { key: 'executive_functioning', label: 'Funcionamiento Ejecutivo', items: 10 },
    { key: 'aggression', label: 'Agresión', items: 10 },
    { key: 'peer_relations', label: 'Relaciones con Pares', items: 10 },
  ],
  teacherForm: [
    { key: 'inattention', label: 'Inatención', items: 10 },
    { key: 'hyperactivity_impulsivity', label: 'Hiperactividad/Impulsividad', items: 10 },
    { key: 'learning_problems', label: 'Problemas de Aprendizaje', items: 10 },
    { key: 'executive_functioning', label: 'Funcionamiento Ejecutivo', items: 10 },
    { key: 'aggression', label: 'Agresión', items: 10 },
    { key: 'peer_relations', label: 'Relaciones con Pares', items: 10 },
  ],
  interpretation: {
    average: { tScoreMax: 59, label: 'Promedio' },
    high_average: { tScoreMin: 60, tScoreMax: 64, label: 'Promedio Alto' },
    elevated: { tScoreMin: 65, tScoreMax: 69, label: 'Elevado' },
    very_elevated: { tScoreMin: 70, label: 'Muy Elevado' },
  },
};

/**
 * Categorías diagnósticas comunes en psiquiatría infantil (DSM-5)
 */
export const CHILD_PSYCH_DIAGNOSTIC_CATEGORIES = [
  { key: 'adhd', label: 'TDAH', icd11: '6A05', subtypes: ['Predominio inatento', 'Predominio hiperactivo-impulsivo', 'Combinado'] },
  { key: 'asd', label: 'Trastorno del Espectro Autista', icd11: '6A02', subtypes: ['Nivel 1 (leve)', 'Nivel 2 (moderado)', 'Nivel 3 (severo)'] },
  { key: 'anxiety', label: 'Trastornos de Ansiedad', icd11: '6B00', subtypes: ['Ansiedad por separación', 'Ansiedad social', 'Ansiedad generalizada', 'Fobias específicas'] },
  { key: 'depression', label: 'Trastorno Depresivo', icd11: '6A70', subtypes: ['Episodio único', 'Recurrente', 'Distimia'] },
  { key: 'odd', label: 'Trastorno Oposicionista Desafiante', icd11: '6C90', subtypes: [] },
  { key: 'conduct_disorder', label: 'Trastorno de Conducta', icd11: '6C91', subtypes: ['Inicio en infancia', 'Inicio en adolescencia'] },
  { key: 'tic_disorder', label: 'Trastornos de Tics / Tourette', icd11: '8A05', subtypes: ['Tics motores', 'Tics vocales', 'Tourette'] },
  { key: 'enuresis', label: 'Enuresis', icd11: '6C00', subtypes: ['Primaria', 'Secundaria'] },
  { key: 'encopresis', label: 'Encopresis', icd11: '6C01', subtypes: ['Con estreñimiento', 'Sin estreñimiento'] },
  { key: 'selective_mutism', label: 'Mutismo Selectivo', icd11: '6B06', subtypes: [] },
];

/**
 * Tipos de terapia en psiquiatría infantil
 */
export const CHILD_THERAPY_TYPES = [
  { key: 'play_therapy', label: 'Terapia de Juego', ageRange: '3-12 años', modality: 'Individual' },
  { key: 'cbt_child', label: 'TCC Infantil', ageRange: '7-18 años', modality: 'Individual' },
  { key: 'family_therapy', label: 'Terapia Familiar', ageRange: 'Todas', modality: 'Familiar' },
  { key: 'parent_training', label: 'Entrenamiento a Padres', ageRange: 'Todas', modality: 'Padres' },
  { key: 'social_skills', label: 'Entrenamiento en Habilidades Sociales', ageRange: '5-18 años', modality: 'Grupal' },
  { key: 'art_therapy', label: 'Arte-Terapia', ageRange: '4-18 años', modality: 'Individual/Grupal' },
  { key: 'sandbox_therapy', label: 'Terapia con Caja de Arena', ageRange: '3-12 años', modality: 'Individual' },
];
