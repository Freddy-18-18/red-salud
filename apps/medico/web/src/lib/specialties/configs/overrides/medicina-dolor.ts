/**
 * @file overrides/medicina-dolor.ts
 * @description Override de configuración para Medicina del Dolor.
 *
 * Manejo especializado del dolor crónico — mapeo de dolor (diagrama
 * corporal), evaluación de riesgo opioides (ORT), planes multimodales,
 * documentación de bloqueos nerviosos, monitoreo de medicación (PDMP),
 * evaluación funcional.
 *
 * También exporta constantes de dominio: escala NRS, cuestionario ORT,
 * tipos de bloqueos nerviosos.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina del Dolor.
 * Especialidad con enfoque en diagnóstico y tratamiento multimodal del dolor.
 */
export const medicinaDolorOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-dolor',
  dashboardPath: '/dashboard/medico/medicina-dolor',

  modules: {
    clinical: [
      {
        key: 'dolor-consulta',
        label: 'Consulta de Dolor',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-dolor/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación integral del dolor, historia, examen neuromuscular',
      },
      {
        key: 'dolor-mapeo',
        label: 'Mapeo de Dolor',
        icon: 'MapPin',
        route: '/dashboard/medico/medicina-dolor/mapeo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Diagrama corporal, localización, irradiación, NRS por zona',
      },
      {
        key: 'dolor-riesgo-opioides',
        label: 'Riesgo de Opioides (ORT)',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/medicina-dolor/riesgo-opioides',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Opioid Risk Tool, SOAPP-R, DIRE, evaluación de abuso',
      },
      {
        key: 'dolor-plan-multimodal',
        label: 'Plan Multimodal de Dolor',
        icon: 'Layers',
        route: '/dashboard/medico/medicina-dolor/plan-multimodal',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['pain_reduction_nrs'],
        description: 'Farmacológico, intervencionista, rehabilitación, psicológico',
      },
      {
        key: 'dolor-bloqueos',
        label: 'Bloqueos Nerviosos',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-dolor/bloqueos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Bloqueos diagnósticos/terapéuticos, epidurales, facetarios, RFN',
      },
      {
        key: 'dolor-pdmp',
        label: 'Monitoreo de Medicación (PDMP)',
        icon: 'Eye',
        route: '/dashboard/medico/medicina-dolor/pdmp',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['opioid_reduction_rate'],
        description: 'Programa de monitoreo, contrato terapéutico, pruebas de orina',
      },
      {
        key: 'dolor-funcional',
        label: 'Evaluación Funcional',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-dolor/funcional',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['functional_improvement'],
        description: 'Oswestry, Roland-Morris, DASH, SF-36, capacidad funcional',
      },
    ],

    laboratory: [
      {
        key: 'dolor-laboratorio',
        label: 'Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-dolor/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Perfil renal/hepático, screening de drogas, vitamina D',
      },
      {
        key: 'dolor-imagenologia',
        label: 'Imagenología del Dolor',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-dolor/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'RM columna, EMG/VCN, ecografía guiada, fluoroscopía',
      },
    ],

    financial: [
      {
        key: 'dolor-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-dolor/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dolor-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-dolor/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Pre-autorización de procedimientos intervencionistas',
      },
    ],

    technology: [
      {
        key: 'dolor-calculadoras',
        label: 'Calculadoras del Dolor',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-dolor/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Conversión opioide, dosis equianalgésica, MME diario',
      },
      {
        key: 'dolor-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-dolor/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'CDC Opioid Guidelines, ASRA, IASP — protocolos de dolor',
      },
    ],

    communication: [
      {
        key: 'dolor-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-dolor/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dolor-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/medicina-dolor/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'dolor-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-dolor/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'pain-map',
      component: '@/components/dashboard/medico/medicina-dolor/widgets/pain-map-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'opioid-tracker',
      component: '@/components/dashboard/medico/medicina-dolor/widgets/opioid-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'procedure-schedule',
      component: '@/components/dashboard/medico/medicina-dolor/widgets/procedure-schedule-widget',
      size: 'medium',
    },
    {
      key: 'functional-outcomes',
      component: '@/components/dashboard/medico/medicina-dolor/widgets/functional-outcomes-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'pain_reduction_nrs',
    'opioid_reduction_rate',
    'functional_improvement',
    'procedure_complication_rate',
    'patient_satisfaction',
    'mme_daily_average',
  ],

  kpiDefinitions: {
    pain_reduction_nrs: {
      label: 'Reducción del Dolor (NRS ≥ 30%)',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    opioid_reduction_rate: {
      label: 'Reducción de Opioides',
      format: 'percentage',
      goal: 0.3,
      direction: 'higher_is_better',
    },
    functional_improvement: {
      label: 'Mejoría Funcional',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    procedure_complication_rate: {
      label: 'Tasa de Complicaciones de Procedimientos',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    mme_daily_average: {
      label: 'MME Diario Promedio',
      format: 'number',
      goal: 50,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_dolor',
      'ajuste_medicacion',
      'evaluacion_procedimiento',
      'bloqueo_nervioso',
      'radiofrecuencia',
      'control_post_procedimiento',
      'evaluacion_funcional',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_integral_dolor',
      'mapeo_dolor_corporal',
      'evaluacion_riesgo_opioides',
      'plan_multimodal',
      'nota_procedimiento_bloqueo',
      'contrato_terapeutico',
      'evaluacion_funcional',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksPainMapping: true,
      requiresOpioidRiskAssessment: true,
      tracksMultimodalPlans: true,
      documentsNerveBlocks: true,
      requiresMedicationMonitoring: true,
      tracksFunctionalAssessment: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Zap',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA DEL DOLOR
// ============================================================================

/**
 * Numeric Rating Scale (NRS) — interpretación.
 */
export const NRS_INTERPRETATION = [
  { range: '0', label: 'Sin dolor' },
  { range: '1-3', label: 'Dolor Leve', description: 'Generalmente no interfiere con actividades' },
  { range: '4-6', label: 'Dolor Moderado', description: 'Interfiere con actividades pero permite funcionar' },
  { range: '7-9', label: 'Dolor Severo', description: 'Interfiere significativamente con actividades' },
  { range: '10', label: 'Peor dolor imaginable', description: 'Incapacitante' },
] as const;

/**
 * Opioid Risk Tool (ORT) — cuestionario de riesgo.
 */
export const ORT_QUESTIONS = [
  { category: 'Antecedente familiar de abuso de sustancias', items: [
    { item: 'Alcohol', score_male: 3, score_female: 1 },
    { item: 'Drogas ilícitas', score_male: 3, score_female: 2 },
    { item: 'Medicamentos de prescripción', score_male: 4, score_female: 4 },
  ]},
  { category: 'Antecedente personal de abuso de sustancias', items: [
    { item: 'Alcohol', score_male: 3, score_female: 3 },
    { item: 'Drogas ilícitas', score_male: 4, score_female: 4 },
    { item: 'Medicamentos de prescripción', score_male: 5, score_female: 5 },
  ]},
  { category: 'Edad (16-45 años)', items: [
    { item: 'Edad 16-45', score_male: 1, score_female: 1 },
  ]},
  { category: 'Historia de trastorno psiquiátrico', items: [
    { item: 'ADD/ADHD, TBP, esquizofrenia', score_male: 2, score_female: 2 },
    { item: 'Depresión', score_male: 1, score_female: 1 },
  ]},
  { category: 'Abuso sexual en edad preadolescente', items: [
    { item: 'Abuso sexual', score_male: 0, score_female: 3 },
  ]},
] as const;

export const ORT_INTERPRETATION = [
  { range: '0-3', risk: 'Bajo', description: 'Riesgo bajo de comportamiento aberrante con opioides' },
  { range: '4-7', risk: 'Moderado', description: 'Requiere monitoreo más frecuente' },
  { range: '≥ 8', risk: 'Alto', description: 'Alto riesgo — considerar alternativas a opioides, monitoreo estricto' },
] as const;

/**
 * Tipos de bloqueos nerviosos comunes en clínica del dolor.
 */
export const NERVE_BLOCK_TYPES = [
  { key: 'epidural_steroid', label: 'Inyección Epidural de Esteroides', approach: ['interlaminar', 'transforaminal', 'caudal'], guidance: 'fluoroscopía' },
  { key: 'facet_joint', label: 'Bloqueo de Articulación Facetaria', approach: ['medial branch block', 'intra-articular'], guidance: 'fluoroscopía' },
  { key: 'radiofrequency', label: 'Radiofrecuencia (RFN)', approach: ['convencional', 'pulsada', 'cooled'], guidance: 'fluoroscopía', description: 'Denervación por radiofrecuencia del nervio medial' },
  { key: 'sacroiliac', label: 'Bloqueo Sacroilíaco', approach: ['intra-articular', 'lateral branch block'], guidance: 'fluoroscopía/ecografía' },
  { key: 'stellate_ganglion', label: 'Bloqueo de Ganglio Estrellado', approach: ['anterior'], guidance: 'ecografía', description: 'CRPS tipo I miembro superior, dolor simpático' },
  { key: 'trigger_point', label: 'Inyección de Puntos Gatillo', approach: ['dry needling', 'anestésico local'], guidance: 'palpación/ecografía' },
  { key: 'peripheral_nerve', label: 'Bloqueo de Nervio Periférico', approach: ['nervio occipital', 'supraescapular', 'genicular'], guidance: 'ecografía' },
  { key: 'spinal_cord_stim', label: 'Estimulación de Médula Espinal (Trial)', approach: ['percutáneo'], guidance: 'fluoroscopía', description: 'Prueba de neuromodulación' },
] as const;
