/**
 * @file overrides/medicina-paliativa.ts
 * @description Override de configuración para Medicina Paliativa.
 *
 * Cuidados paliativos — evaluación de carga sintomática (ESAS),
 * manejo del dolor (conversión de opioides), directivas anticipadas,
 * documentación de metas de cuidado, coordinación de hospicio,
 * evaluación del cuidador.
 *
 * También exporta constantes de dominio: escala ESAS, tabla de
 * conversión de opioides, modelos de documentación de metas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Paliativa.
 * Especialidad con enfoque en calidad de vida y manejo sintomático.
 */
export const medicinaPaliativaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-paliativa',
  dashboardPath: '/dashboard/medico/medicina-paliativa',

  modules: {
    clinical: [
      {
        key: 'paliat-consulta',
        label: 'Consulta Paliativa',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-paliativa/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación integral, pronóstico, plan de cuidados',
      },
      {
        key: 'paliat-esas',
        label: 'Evaluación de Síntomas (ESAS)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-paliativa/esas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['symptom_control_rate'],
        description: 'ESAS-r, Edmonton Symptom Assessment, tendencias',
      },
      {
        key: 'paliat-dolor',
        label: 'Manejo del Dolor',
        icon: 'Zap',
        route: '/dashboard/medico/medicina-paliativa/dolor',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Escalera OMS, conversión de opioides, rotación, titulación',
      },
      {
        key: 'paliat-directivas',
        label: 'Directivas Anticipadas',
        icon: 'FileSignature',
        route: '/dashboard/medico/medicina-paliativa/directivas',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['advance_directive_completion'],
        description: 'Voluntades anticipadas, DNR, representante de salud',
      },
      {
        key: 'paliat-metas',
        label: 'Metas de Cuidado',
        icon: 'Target',
        route: '/dashboard/medico/medicina-paliativa/metas',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Conversación de metas, documentación de preferencias, transición',
      },
      {
        key: 'paliat-hospicio',
        label: 'Coordinación de Hospicio',
        icon: 'Home',
        route: '/dashboard/medico/medicina-paliativa/hospicio',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['place_of_death_preference_met'],
        description: 'Referencia a hospicio, criterios de elegibilidad, transición',
      },
      {
        key: 'paliat-cuidador',
        label: 'Evaluación del Cuidador',
        icon: 'Users',
        route: '/dashboard/medico/medicina-paliativa/cuidador',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Carga del cuidador (Zarit), burnout, recursos de apoyo',
      },
    ],

    laboratory: [
      {
        key: 'paliat-laboratorio',
        label: 'Laboratorio Mínimo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-paliativa/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Solo si cambia manejo: hemograma, electrolitos, calcio, renal',
      },
    ],

    financial: [
      {
        key: 'paliat-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-paliativa/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'paliat-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-paliativa/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'paliat-calculadoras',
        label: 'Calculadoras Paliativas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-paliativa/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Conversión de opioides, PPI (Palliative Prognostic Index), PaP Score',
      },
      {
        key: 'paliat-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-paliativa/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'SECPAL, IAHPC, NCCN Palliative Care — guías clínicas',
      },
    ],

    communication: [
      {
        key: 'paliat-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-paliativa/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'paliat-familia',
        label: 'Comunicación con Familia',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/medicina-paliativa/familia',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
        description: 'Reuniones familiares, educación, soporte emocional',
      },
    ],

    growth: [
      {
        key: 'paliat-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-paliativa/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'symptom-burden',
      component: '@/components/dashboard/medico/medicina-paliativa/widgets/symptom-burden-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'advance-directives',
      component: '@/components/dashboard/medico/medicina-paliativa/widgets/advance-directives-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'opioid-calculator',
      component: '@/components/dashboard/medico/medicina-paliativa/widgets/opioid-calculator-widget',
      size: 'medium',
    },
    {
      key: 'goals-of-care',
      component: '@/components/dashboard/medico/medicina-paliativa/widgets/goals-of-care-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'symptom_control_rate',
    'advance_directive_completion',
    'place_of_death_preference_met',
    'caregiver_burden_assessed',
    'hospice_referral_timeliness',
    'goals_of_care_documented',
  ],

  kpiDefinitions: {
    symptom_control_rate: {
      label: '% Síntomas Controlados (ESAS < 4)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    advance_directive_completion: {
      label: '% Directivas Anticipadas Completadas',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    place_of_death_preference_met: {
      label: '% Preferencia de Lugar de Fallecimiento',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    caregiver_burden_assessed: {
      label: '% Cuidadores Evaluados (Zarit)',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    hospice_referral_timeliness: {
      label: 'Referencia a Hospicio Oportuna',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    goals_of_care_documented: {
      label: '% Metas de Cuidado Documentadas',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_sintomas',
      'ajuste_dolor',
      'reunion_familiar',
      'directivas_anticipadas',
      'transicion_hospicio',
      'visita_domiciliaria',
      'urgencia_paliativa',
    ],
    defaultDuration: 40,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_integral_paliativa',
      'esas_assessment',
      'plan_manejo_dolor',
      'directivas_anticipadas',
      'metas_de_cuidado',
      'evaluacion_cuidador',
      'nota_hospicio',
      'reunion_familiar',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksSymptomBurden: true,
      requiresESASAssessment: true,
      tracksOpioidConversion: true,
      requiresAdvanceDirectives: true,
      tracksGoalsOfCare: true,
      coordinatesHospice: true,
      assessesCaregiverBurden: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
    icon: 'HeartHandshake',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA PALIATIVA
// ============================================================================

/**
 * Edmonton Symptom Assessment System Revised (ESAS-r).
 * Escala 0-10 para cada síntoma.
 */
export const ESAS_SYMPTOMS = [
  { key: 'pain', label: 'Dolor', anchor_low: 'Sin dolor', anchor_high: 'Peor dolor posible' },
  { key: 'tiredness', label: 'Cansancio', anchor_low: 'Sin cansancio', anchor_high: 'Peor cansancio posible' },
  { key: 'drowsiness', label: 'Somnolencia', anchor_low: 'Sin somnolencia', anchor_high: 'Peor somnolencia posible' },
  { key: 'nausea', label: 'Náusea', anchor_low: 'Sin náusea', anchor_high: 'Peor náusea posible' },
  { key: 'appetite', label: 'Falta de Apetito', anchor_low: 'Buen apetito', anchor_high: 'Peor apetito posible' },
  { key: 'dyspnea', label: 'Disnea', anchor_low: 'Sin disnea', anchor_high: 'Peor disnea posible' },
  { key: 'depression', label: 'Depresión', anchor_low: 'Sin depresión', anchor_high: 'Peor depresión posible' },
  { key: 'anxiety', label: 'Ansiedad', anchor_low: 'Sin ansiedad', anchor_high: 'Peor ansiedad posible' },
  { key: 'wellbeing', label: 'Bienestar', anchor_low: 'Mejor bienestar', anchor_high: 'Peor bienestar posible' },
] as const;

/**
 * Tabla de conversión equianalgésica de opioides (referencia: morfina oral 30 mg).
 */
export const OPIOID_EQUIANALGESIC_TABLE = [
  { drug: 'Morfina oral', dose: 30, unit: 'mg', route: 'oral', ratio: 1.0 },
  { drug: 'Morfina IV/SC', dose: 10, unit: 'mg', route: 'parenteral', ratio: 3.0 },
  { drug: 'Oxicodona oral', dose: 20, unit: 'mg', route: 'oral', ratio: 1.5 },
  { drug: 'Hidromorfona oral', dose: 6, unit: 'mg', route: 'oral', ratio: 5.0 },
  { drug: 'Hidromorfona IV/SC', dose: 1.5, unit: 'mg', route: 'parenteral', ratio: 20.0 },
  { drug: 'Fentanilo transdérmico', dose: 12.5, unit: 'mcg/h', route: 'transdérmico', ratio: null, note: 'Equivale a ~30-45 mg morfina oral/día' },
  { drug: 'Metadona oral', dose: null, unit: 'mg', route: 'oral', ratio: null, note: 'Conversión variable según dosis previa — usar tabla de Ayonrinde' },
  { drug: 'Tramadol oral', dose: 150, unit: 'mg', route: 'oral', ratio: 0.2 },
  { drug: 'Codeína oral', dose: 200, unit: 'mg', route: 'oral', ratio: 0.15 },
] as const;

/**
 * Escalera analgésica de la OMS (modificada).
 */
export const WHO_PAIN_LADDER = [
  { step: 1, label: 'Dolor Leve (1-3)', agents: ['Paracetamol', 'AINEs (Ibuprofeno, Naproxeno)'], adjuvants: ['Gabapentina', 'Amitriptilina'] },
  { step: 2, label: 'Dolor Moderado (4-6)', agents: ['Tramadol', 'Codeína + Paracetamol'], adjuvants: ['Pregabalina', 'Duloxetina'] },
  { step: 3, label: 'Dolor Severo (7-10)', agents: ['Morfina', 'Oxicodona', 'Hidromorfona', 'Fentanilo'], adjuvants: ['Dexametasona', 'Ketamina', 'Lidocaína'] },
  { step: 4, label: 'Dolor Refractario', agents: ['Infusión continua', 'PCA', 'Bloqueos nerviosos', 'Intratecal'], adjuvants: ['Sedación paliativa'] },
] as const;
