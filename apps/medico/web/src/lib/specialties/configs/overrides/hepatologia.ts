/**
 * @file overrides/hepatologia.ts
 * @description Override de configuración para Hepatología.
 *
 * Especialidad dedicada al hígado — seguimiento de función hepática,
 * estadificación de fibrosis (FibroScan/APRI/FIB-4), tendencias de
 * carga viral en hepatitis, score MELD, evaluación pre-trasplante
 * y vigilancia de várices.
 *
 * También exporta constantes de dominio: etiologías hepáticas,
 * score MELD, clasificación Child-Pugh.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Hepatología.
 * Especialidad con módulos clínicos avanzados de manejo hepático.
 */
export const hepatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'hepatologia',
  dashboardPath: '/dashboard/medico/hepatologia',

  modules: {
    clinical: [
      {
        key: 'hepato-consulta',
        label: 'Consulta Hepatológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/hepatologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP hepatológico, evaluación integral del hígado',
      },
      {
        key: 'hepato-funcion',
        label: 'Función Hepática',
        icon: 'Activity',
        route: '/dashboard/medico/hepatologia/funcion-hepatica',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Tendencias de ALT, AST, bilirrubina, albúmina, INR',
      },
      {
        key: 'hepato-fibrosis',
        label: 'Estadificación de Fibrosis',
        icon: 'Scan',
        route: '/dashboard/medico/hepatologia/fibrosis',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'FibroScan, APRI, FIB-4, biopsia hepática',
      },
      {
        key: 'hepato-hepatitis',
        label: 'Hepatitis Viral — Carga Viral',
        icon: 'Bug',
        route: '/dashboard/medico/hepatologia/hepatitis',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['viral_clearance_rate'],
        description: 'VHB, VHC — tendencia de carga viral, genotipificación, tratamiento',
      },
      {
        key: 'hepato-meld',
        label: 'Score MELD',
        icon: 'Calculator',
        route: '/dashboard/medico/hepatologia/meld',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['meld_stability'],
        description: 'MELD, MELD-Na, seguimiento temporal, lista de espera',
      },
      {
        key: 'hepato-trasplante',
        label: 'Evaluación Pre-Trasplante',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/hepatologia/trasplante',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Protocolo pre-trasplante, criterios de Milán, UCSF',
      },
      {
        key: 'hepato-varices',
        label: 'Vigilancia de Várices',
        icon: 'Eye',
        route: '/dashboard/medico/hepatologia/varices',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['variceal_bleeding_prevention'],
        description: 'EGD de screening, ligadura, betabloqueantes, TIPS',
      },
    ],

    laboratory: [
      {
        key: 'hepato-laboratorio',
        label: 'Panel Hepático Completo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/hepatologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Perfil hepático, coagulación, serologías virales, autoinmune',
      },
      {
        key: 'hepato-imagenologia',
        label: 'Imagenología Hepática',
        icon: 'Scan',
        route: '/dashboard/medico/hepatologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Ecografía hepática, TC trifásica, RM hepática, elastografía',
      },
      {
        key: 'hepato-biopsia',
        label: 'Biopsia Hepática',
        icon: 'Microscope',
        route: '/dashboard/medico/hepatologia/biopsia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Registro de biopsias, score METAVIR, Ishak, Knodell',
      },
    ],

    financial: [
      {
        key: 'hepato-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/hepatologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hepato-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/hepatologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'hepato-calculadoras',
        label: 'Calculadoras Hepatológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/hepatologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'MELD, MELD-Na, Child-Pugh, FIB-4, APRI, criterios de Milán',
      },
      {
        key: 'hepato-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/hepatologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'AASLD, EASL — guías de hepatología',
      },
    ],

    communication: [
      {
        key: 'hepato-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/hepatologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hepato-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/hepatologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'hepato-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/hepatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'liver-function-trends',
      component: '@/components/dashboard/medico/hepatologia/widgets/liver-function-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'viral-load-tracking',
      component: '@/components/dashboard/medico/hepatologia/widgets/viral-load-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'meld-scores',
      component: '@/components/dashboard/medico/hepatologia/widgets/meld-scores-widget',
      size: 'medium',
    },
    {
      key: 'varices-surveillance',
      component: '@/components/dashboard/medico/hepatologia/widgets/varices-surveillance-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'viral_clearance_rate',
    'meld_stability',
    'variceal_bleeding_prevention',
    'fibrosis_regression_rate',
    'transplant_evaluation_completion',
    'liver_function_monitoring',
  ],

  kpiDefinitions: {
    viral_clearance_rate: {
      label: 'Tasa de Aclaramiento Viral (RVS)',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    meld_stability: {
      label: 'Estabilidad MELD (sin progresión)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    variceal_bleeding_prevention: {
      label: 'Prevención de Sangrado Variceal',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    fibrosis_regression_rate: {
      label: 'Tasa de Regresión de Fibrosis',
      format: 'percentage',
      goal: 0.3,
      direction: 'higher_is_better',
    },
    transplant_evaluation_completion: {
      label: 'Evaluaciones Pre-Trasplante Completas',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    liver_function_monitoring: {
      label: 'Adherencia Monitoreo Hepático',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_hepatitis',
      'control_cirrosis',
      'evaluacion_fibrosis',
      'evaluacion_pre_trasplante',
      'post_trasplante',
      'control_varices',
      'resultado_biopsia',
      'control_meld',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_hepatologica',
      'examen_fisico_hepatico',
      'evaluacion_fibrosis',
      'seguimiento_hepatitis',
      'protocolo_pre_trasplante',
      'informe_biopsia_hepatica',
      'vigilancia_varices',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksLiverFunction: true,
      requiresFibrosisStaging: true,
      tracksViralLoad: true,
      requiresMELDTracking: true,
      supportsTransplantEvaluation: true,
      tracksVaricesSurveillance: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    icon: 'Scan',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — HEPATOLOGÍA
// ============================================================================

/**
 * Etiologías de enfermedad hepática crónica.
 */
export const LIVER_DISEASE_ETIOLOGIES = [
  { key: 'hcv', label: 'Hepatitis C (VHC)', prevalence: 'Muy común', curable: true },
  { key: 'hbv', label: 'Hepatitis B (VHB)', prevalence: 'Muy común', curable: false },
  { key: 'nafld_nash', label: 'NAFLD / NASH (Esteatohepatitis)', prevalence: 'Muy común (creciente)', curable: false },
  { key: 'alcoholic', label: 'Hepatopatía Alcohólica', prevalence: 'Común', curable: false },
  { key: 'autoimmune', label: 'Hepatitis Autoinmune', prevalence: 'Moderada', curable: false },
  { key: 'pbc', label: 'Colangitis Biliar Primaria (CBP)', prevalence: 'Poco común', curable: false },
  { key: 'psc', label: 'Colangitis Esclerosante Primaria (CEP)', prevalence: 'Rara', curable: false },
  { key: 'wilson', label: 'Enfermedad de Wilson', prevalence: 'Rara', curable: true },
  { key: 'hemochromatosis', label: 'Hemocromatosis Hereditaria', prevalence: 'Moderada', curable: false },
  { key: 'a1at', label: 'Déficit de Alfa-1 Antitripsina', prevalence: 'Rara', curable: false },
] as const;

/**
 * Clasificación de Child-Pugh.
 */
export const CHILD_PUGH_CLASSIFICATION = {
  parameters: [
    { key: 'bilirubin', label: 'Bilirrubina Total (mg/dL)', score1: '< 2', score2: '2-3', score3: '> 3' },
    { key: 'albumin', label: 'Albúmina (g/dL)', score1: '> 3.5', score2: '2.8-3.5', score3: '< 2.8' },
    { key: 'inr', label: 'INR', score1: '< 1.7', score2: '1.7-2.3', score3: '> 2.3' },
    { key: 'ascites', label: 'Ascitis', score1: 'Ausente', score2: 'Leve', score3: 'Moderada-Severa' },
    { key: 'encephalopathy', label: 'Encefalopatía', score1: 'Ninguna', score2: 'Grado I-II', score3: 'Grado III-IV' },
  ],
  classes: [
    { class: 'A', range: '5-6 puntos', survival1yr: '100%', survival2yr: '85%', label: 'Compensada' },
    { class: 'B', range: '7-9 puntos', survival1yr: '81%', survival2yr: '57%', label: 'Compromiso significativo' },
    { class: 'C', range: '10-15 puntos', survival1yr: '45%', survival2yr: '35%', label: 'Descompensada' },
  ],
} as const;

/**
 * Componentes del score MELD.
 */
export const MELD_SCORE_COMPONENTS = {
  label: 'MELD (Model for End-Stage Liver Disease)',
  formula: '3.78 × ln(Bilirrubina) + 11.2 × ln(INR) + 9.57 × ln(Creatinina) + 6.43',
  parameters: [
    { key: 'bilirubin', label: 'Bilirrubina Total (mg/dL)', min: 1.0 },
    { key: 'inr', label: 'INR', min: 1.0 },
    { key: 'creatinine', label: 'Creatinina (mg/dL)', min: 1.0, max: 4.0 },
    { key: 'sodium', label: 'Sodio (mEq/L) — para MELD-Na', min: 125, max: 137 },
  ],
  interpretation: [
    { range: '< 10', mortality3mo: '< 2%', label: 'Bajo riesgo' },
    { range: '10-19', mortality3mo: '6%', label: 'Riesgo moderado' },
    { range: '20-29', mortality3mo: '20%', label: 'Riesgo alto' },
    { range: '30-39', mortality3mo: '53%', label: 'Riesgo muy alto' },
    { range: '≥ 40', mortality3mo: '71%', label: 'Riesgo extremo' },
  ],
} as const;
