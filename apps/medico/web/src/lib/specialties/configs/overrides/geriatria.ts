/**
 * @file overrides/geriatria.ts
 * @description Override de configuración para Geriatría.
 *
 * Medicina del adulto mayor — evaluación de riesgo de caídas,
 * revisión de polifarmacia, tamizaje cognitivo (MMSE, MoCA),
 * evaluación funcional (Barthel, Katz), delirium y fragilidad.
 *
 * También exporta constantes de dominio: escalas geriátricas,
 * criterios de fragilidad, protocolos de desprescripción.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Geriatría.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const geriatriaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'geriatria',
  dashboardPath: '/dashboard/medico/geriatria',

  modules: {
    clinical: [
      {
        key: 'geri-consulta',
        label: 'Consulta Geriátrica',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/geriatria/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'comprehensive_assessment_rate'],
        description: 'Valoración geriátrica integral, SOAP, revisión multi-sistémica',
      },
      {
        key: 'geri-caidas',
        label: 'Evaluación Riesgo de Caídas',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/geriatria/caidas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['falls_prevented'],
        description: 'Timed Up & Go, Tinetti, evaluación de entorno, intervención',
      },
      {
        key: 'geri-polifarmacia',
        label: 'Revisión de Polifarmacia',
        icon: 'Pill',
        route: '/dashboard/medico/geriatria/polifarmacia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['polypharmacy_reduction'],
        description: 'Criterios STOPP/START, Beers, desprescripción, interacciones',
      },
      {
        key: 'geri-cognitivo',
        label: 'Tamizaje Cognitivo',
        icon: 'Brain',
        route: '/dashboard/medico/geriatria/cognitivo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'MMSE, MoCA, reloj, fluencia verbal — seguimiento longitudinal',
      },
      {
        key: 'geri-funcional',
        label: 'Evaluación Funcional',
        icon: 'Accessibility',
        route: '/dashboard/medico/geriatria/funcional',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['functional_independence_rate'],
        description: 'Barthel, Katz, Lawton — AVD básicas e instrumentales',
      },
      {
        key: 'geri-delirium',
        label: 'Screening Delirium',
        icon: 'Zap',
        route: '/dashboard/medico/geriatria/delirium',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'CAM, 4AT, factores precipitantes, prevención',
      },
      {
        key: 'geri-fragilidad',
        label: 'Índice de Fragilidad',
        icon: 'Shield',
        route: '/dashboard/medico/geriatria/fragilidad',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Fried, FRAIL, Clinical Frailty Scale — categorización y plan',
      },
    ],

    laboratory: [
      {
        key: 'geri-laboratorio',
        label: 'Laboratorio Geriátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/geriatria/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Función renal, hepática, tiroides, vitamina D, B12, hemograma',
      },
      {
        key: 'geri-densitometria',
        label: 'Densitometría Ósea',
        icon: 'Bone',
        route: '/dashboard/medico/geriatria/densitometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'DEXA, T-score, riesgo de fractura (FRAX)',
      },
      {
        key: 'geri-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/geriatria/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Rx, TC cerebral, ecografía — solicitudes y resultados',
      },
    ],

    technology: [
      {
        key: 'geri-calculadoras',
        label: 'Calculadoras Geriátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/geriatria/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'FRAX, CKD-EPI, Charlson, Norton, MMSE scoring',
      },
      {
        key: 'geri-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/geriatria/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'AGS, BGS, protocolos de desprescripción, prevención de caídas',
      },
      {
        key: 'geri-interacciones',
        label: 'Interacciones Medicamentosas',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/geriatria/interacciones',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'Referencia de interacciones, criterios Beers, STOPP/START',
      },
    ],
  },

  widgets: [
    {
      key: 'fall-risk-dashboard',
      component: '@/components/dashboard/medico/geriatria/widgets/fall-risk-dashboard-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'polypharmacy-review',
      component: '@/components/dashboard/medico/geriatria/widgets/polypharmacy-review-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'cognitive-tracking',
      component: '@/components/dashboard/medico/geriatria/widgets/cognitive-tracking-widget',
      size: 'large',
    },
    {
      key: 'functional-status',
      component: '@/components/dashboard/medico/geriatria/widgets/functional-status-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'falls_prevented',
    'polypharmacy_reduction',
    'functional_independence_rate',
    'cognitive_screening_rate',
    'comprehensive_assessment_rate',
    'delirium_prevention_rate',
  ],

  kpiDefinitions: {
    falls_prevented: {
      label: 'Caídas Prevenidas',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    polypharmacy_reduction: {
      label: 'Reducción Polifarmacia',
      format: 'percentage',
      goal: 0.3,
      direction: 'higher_is_better',
    },
    functional_independence_rate: {
      label: '% Independencia Funcional',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    cognitive_screening_rate: {
      label: 'Tamizaje Cognitivo Completado',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    comprehensive_assessment_rate: {
      label: 'Valoración Geriátrica Integral',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    delirium_prevention_rate: {
      label: 'Prevención de Delirium',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'valoracion_geriatrica_integral',
      'control_cronico',
      'revision_polifarmacia',
      'evaluacion_cognitiva',
      'evaluacion_funcional',
      'control_caidas',
      'visita_domiciliaria',
      'interconsulta',
    ],
    defaultDuration: 40,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'valoracion_geriatrica_integral',
      'evaluacion_cognitiva',
      'evaluacion_funcional',
      'riesgo_caidas',
      'revision_polifarmacia',
      'plan_cuidado_geriatrico',
      'nota_domiciliaria',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresComprehensiveAssessment: true,
      tracksFallRisk: true,
      tracksPolypharmacy: true,
      tracksCognitiveFunction: true,
      tracksFunctionalStatus: true,
      screensForDelirium: true,
      calculatesFragilityIndex: true,
    },
  },

  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    icon: 'HeartHandshake',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — GERIATRÍA
// ============================================================================

/**
 * Escalas de evaluación geriátrica con sus puntuaciones y umbrales.
 */
export const GERIATRIC_ASSESSMENT_SCALES = {
  mmse: {
    label: 'Mini-Mental State Examination (MMSE)',
    maxScore: 30,
    cutoffs: [
      { range: [24, 30], label: 'Normal', severity: 'normal' },
      { range: [18, 23], label: 'Deterioro Leve', severity: 'mild' },
      { range: [10, 17], label: 'Deterioro Moderado', severity: 'moderate' },
      { range: [0, 9], label: 'Deterioro Severo', severity: 'severe' },
    ],
    domains: ['orientacion', 'registro', 'atencion_calculo', 'recuerdo', 'lenguaje', 'praxia'],
  },
  moca: {
    label: 'Montreal Cognitive Assessment (MoCA)',
    maxScore: 30,
    cutoffs: [
      { range: [26, 30], label: 'Normal', severity: 'normal' },
      { range: [18, 25], label: 'Deterioro Cognitivo Leve', severity: 'mild' },
      { range: [10, 17], label: 'Deterioro Moderado', severity: 'moderate' },
      { range: [0, 9], label: 'Deterioro Severo', severity: 'severe' },
    ],
    domains: ['visuoespacial', 'denominacion', 'atencion', 'lenguaje', 'abstraccion', 'recuerdo', 'orientacion'],
  },
  barthel: {
    label: 'Índice de Barthel (AVD Básicas)',
    maxScore: 100,
    cutoffs: [
      { range: [91, 100], label: 'Independiente', severity: 'normal' },
      { range: [61, 90], label: 'Dependencia Leve', severity: 'mild' },
      { range: [21, 60], label: 'Dependencia Moderada', severity: 'moderate' },
      { range: [0, 20], label: 'Dependencia Severa', severity: 'severe' },
    ],
    items: ['alimentacion', 'bano', 'aseo', 'vestirse', 'intestino', 'vejiga', 'ir_al_bano', 'traslado', 'deambulacion', 'escaleras'],
  },
  katz: {
    label: 'Índice de Katz (AVD Básicas)',
    maxScore: 6,
    cutoffs: [
      { range: [5, 6], label: 'Independiente', severity: 'normal' },
      { range: [3, 4], label: 'Dependencia Moderada', severity: 'moderate' },
      { range: [0, 2], label: 'Dependencia Severa', severity: 'severe' },
    ],
    items: ['bano', 'vestirse', 'ir_al_bano', 'traslado', 'continencia', 'alimentacion'],
  },
  tinetti: {
    label: 'Escala de Tinetti (Marcha y Equilibrio)',
    maxScore: 28,
    cutoffs: [
      { range: [24, 28], label: 'Bajo Riesgo', severity: 'normal' },
      { range: [19, 23], label: 'Riesgo Moderado', severity: 'moderate' },
      { range: [0, 18], label: 'Alto Riesgo', severity: 'severe' },
    ],
    sections: ['equilibrio', 'marcha'],
  },
  clinical_frailty: {
    label: 'Clinical Frailty Scale (CFS)',
    maxScore: 9,
    cutoffs: [
      { range: [1, 3], label: 'Robusto', severity: 'normal' },
      { range: [4, 4], label: 'Vulnerable', severity: 'mild' },
      { range: [5, 6], label: 'Frágil', severity: 'moderate' },
      { range: [7, 9], label: 'Muy Frágil / Terminal', severity: 'severe' },
    ],
  },
} as const;

/**
 * Criterios de fragilidad de Fried.
 */
export const FRIED_FRAILTY_CRITERIA = [
  { key: 'weight_loss', label: 'Pérdida de Peso Involuntaria', threshold: '> 4.5 kg en último año' },
  { key: 'exhaustion', label: 'Agotamiento Auto-reportado', threshold: 'CES-D: ≥ 3 días/semana' },
  { key: 'weakness', label: 'Debilidad (Fuerza de Prensión)', threshold: 'Quintil inferior por sexo/IMC' },
  { key: 'slow_gait', label: 'Marcha Lenta', threshold: 'Quintil inferior por sexo/talla' },
  { key: 'low_activity', label: 'Baja Actividad Física', threshold: 'Quintil inferior de gasto calórico' },
] as const;

/**
 * Protocolos de desprescripción por categoría de medicamento.
 */
export const DEPRESCRIBING_PROTOCOLS = [
  { key: 'benzodiazepines', label: 'Benzodiazepinas', strategy: 'Reducción gradual 10-25% cada 2 semanas', risk: 'Caídas, deterioro cognitivo, dependencia' },
  { key: 'ppi', label: 'Inhibidores Bomba de Protones', strategy: 'Reducir dosis 50%, luego a demanda', risk: 'Fractura, C. difficile, hipomagnesemia' },
  { key: 'antipsychotics', label: 'Antipsicóticos', strategy: 'Reducción gradual 25% cada 2 semanas', risk: 'Caídas, sedación, parkinsonismo, mortalidad' },
  { key: 'statins', label: 'Estatinas (en muy ancianos)', strategy: 'Evaluar expectativa de vida y beneficio', risk: 'Miopatía, hepatotoxicidad' },
  { key: 'anticholinergics', label: 'Anticolinérgicos', strategy: 'Suspender o cambiar a alternativa', risk: 'Deterioro cognitivo, retención urinaria, estreñimiento' },
  { key: 'nsaids', label: 'AINEs', strategy: 'Suspender, usar paracetamol como primera línea', risk: 'Hemorragia GI, nefrotoxicidad, HTA' },
] as const;
