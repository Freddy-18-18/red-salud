/**
 * @file overrides/gastroenterologia-pediatrica.ts
 * @description Override de configuración para Gastroenterología Pediátrica.
 *
 * Combina Gastroenterología + Pediatría: fallo de medro, screening celíaco,
 * paneles de alergia alimentaria, estudios de heces, evaluación nutricional
 * y seguimiento de crecimiento en contexto GI pediátrico.
 *
 * También exporta constantes de dominio: marcadores celíacos,
 * paneles de alergia alimentaria, escala de Bristol pediátrica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Gastroenterología Pediátrica.
 * Especialidad con módulos clínicos especializados para GI en niños.
 */
export const gastroenterologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'gastroenterologia-pediatrica',
  dashboardPath: '/dashboard/medico/gastroenterologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'gastro-pedi-consulta',
        label: 'Consulta GI Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/gastroenterologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Anamnesis digestiva pediátrica, historia alimentaria',
      },
      {
        key: 'gastro-pedi-fallo-medro',
        label: 'Fallo de Medro',
        icon: 'TrendingDown',
        route: '/dashboard/medico/gastroenterologia-pediatrica/fallo-medro',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['growth_recovery_rate'],
        description: 'Curvas de crecimiento, evaluación nutricional, plan de recuperación',
      },
      {
        key: 'gastro-pedi-celiaca',
        label: 'Screening Celíaco',
        icon: 'Wheat',
        route: '/dashboard/medico/gastroenterologia-pediatrica/celiaca',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['diagnostic_accuracy'],
        description: 'Anti-tTG, EMA, biopsia duodenal, dieta libre de gluten',
      },
      {
        key: 'gastro-pedi-alergia-alimentaria',
        label: 'Alergia Alimentaria',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/gastroenterologia-pediatrica/alergia-alimentaria',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'IgE específica, prick test, dietas de eliminación, desensibilización',
      },
      {
        key: 'gastro-pedi-heces',
        label: 'Estudios de Heces',
        icon: 'TestTubes',
        route: '/dashboard/medico/gastroenterologia-pediatrica/heces',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Coprológico, calprotectina, elastasa, parásitos, rotavirus',
      },
      {
        key: 'gastro-pedi-nutricion',
        label: 'Evaluación Nutricional',
        icon: 'Apple',
        route: '/dashboard/medico/gastroenterologia-pediatrica/nutricion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['nutrition_compliance'],
        description: 'Micronutrientes, plan dietético, suplementación, antropometría',
      },
    ],

    laboratory: [
      {
        key: 'gastro-pedi-laboratorio',
        label: 'Panel de Laboratorio GI Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/gastroenterologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hepático, celíaco, hierro, vitaminas, calprotectina',
      },
      {
        key: 'gastro-pedi-imagenologia',
        label: 'Imagenología GI Pediátrica',
        icon: 'Scan',
        route: '/dashboard/medico/gastroenterologia-pediatrica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Ecografía abdominal, tránsito intestinal, RM enterografía',
      },
    ],

    financial: [
      {
        key: 'gastro-pedi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/gastroenterologia-pediatrica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gastro-pedi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/gastroenterologia-pediatrica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'gastro-pedi-calculadoras',
        label: 'Calculadoras GI Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/gastroenterologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Z-score, percentiles, requerimientos calóricos, Bristol pediátrico',
      },
      {
        key: 'gastro-pedi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/gastroenterologia-pediatrica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ESPGHAN, NASPGHAN — guías pediátricas GI',
      },
    ],

    communication: [
      {
        key: 'gastro-pedi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/gastroenterologia-pediatrica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gastro-pedi-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/gastroenterologia-pediatrica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'gastro-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/gastroenterologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'failure-to-thrive',
      component: '@/components/dashboard/medico/gastroenterologia-pediatrica/widgets/failure-to-thrive-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'celiac-screening',
      component: '@/components/dashboard/medico/gastroenterologia-pediatrica/widgets/celiac-screening-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'food-allergy-panel',
      component: '@/components/dashboard/medico/gastroenterologia-pediatrica/widgets/food-allergy-panel-widget',
      size: 'medium',
    },
    {
      key: 'nutrition-tracking',
      component: '@/components/dashboard/medico/gastroenterologia-pediatrica/widgets/nutrition-tracking-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'growth_recovery_rate',
    'diagnostic_accuracy',
    'nutrition_compliance',
    'celiac_screening_coverage',
    'food_allergy_resolution',
    'stool_study_turnaround',
  ],

  kpiDefinitions: {
    growth_recovery_rate: {
      label: '% Recuperación de Crecimiento',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    diagnostic_accuracy: {
      label: 'Precisión Diagnóstica',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    nutrition_compliance: {
      label: 'Adherencia Nutricional',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    celiac_screening_coverage: {
      label: 'Cobertura Screening Celíaco',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    food_allergy_resolution: {
      label: 'Resolución de Alergia Alimentaria',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    stool_study_turnaround: {
      label: 'Tiempo de Resultado — Heces',
      format: 'duration',
      goal: 48,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_fallo_medro',
      'control_celiaca',
      'evaluacion_alergia',
      'control_nutricional',
      'resultado_estudios',
      'post_endoscopia',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_gi_pediatrica',
      'examen_fisico_pediatrico',
      'evaluacion_nutricional',
      'protocolo_celiaca',
      'dieta_eliminacion',
      'seguimiento_fallo_medro',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksFailureToThrive: true,
      requiresCeliacScreening: true,
      tracksFoodAllergies: true,
      requiresStoolStudies: true,
      tracksNutritionalAssessment: true,
      usesGrowthCharts: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — GASTROENTEROLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Marcadores serológicos para screening celíaco.
 */
export const CELIAC_SCREENING_MARKERS = [
  { key: 'anti_ttg_iga', label: 'Anti-tTG IgA', sensitivity: 'Alta (>95%)', specificity: 'Alta (>95%)', firstLine: true },
  { key: 'anti_ema_iga', label: 'Anti-EMA IgA', sensitivity: 'Alta (>90%)', specificity: 'Muy Alta (>99%)', firstLine: false },
  { key: 'anti_dgp_igg', label: 'Anti-DGP IgG', sensitivity: 'Moderada', specificity: 'Alta', firstLine: false },
  { key: 'total_iga', label: 'IgA Total', sensitivity: 'N/A', specificity: 'N/A', firstLine: true },
  { key: 'hla_dq2_dq8', label: 'HLA-DQ2/DQ8', sensitivity: 'Alta VPN', specificity: 'Baja', firstLine: false },
] as const;

/**
 * Paneles de alergia alimentaria comunes en pediatría.
 */
export const FOOD_ALLERGY_PANELS = [
  { key: 'milk', label: 'Leche de Vaca (APLV)', prevalence: 'Muy común', ageOnset: '< 1 año', prognosis: 'Resolución ~80% a los 4 años' },
  { key: 'egg', label: 'Huevo', prevalence: 'Muy común', ageOnset: '< 2 años', prognosis: 'Resolución ~70% a los 6 años' },
  { key: 'wheat', label: 'Trigo', prevalence: 'Común', ageOnset: '< 3 años', prognosis: 'Resolución frecuente' },
  { key: 'soy', label: 'Soja', prevalence: 'Común', ageOnset: '< 2 años', prognosis: 'Resolución frecuente' },
  { key: 'peanut', label: 'Maní', prevalence: 'Común', ageOnset: 'Variable', prognosis: 'Persistente en ~80%' },
  { key: 'tree_nuts', label: 'Frutos Secos', prevalence: 'Moderada', ageOnset: 'Variable', prognosis: 'Persistente en ~90%' },
  { key: 'fish', label: 'Pescado', prevalence: 'Moderada', ageOnset: 'Variable', prognosis: 'Generalmente persistente' },
  { key: 'shellfish', label: 'Mariscos', prevalence: 'Moderada', ageOnset: 'Variable', prognosis: 'Generalmente persistente' },
] as const;

/**
 * Escala de Bristol adaptada para pediatría.
 */
export const PEDIATRIC_BRISTOL_SCALE = [
  { type: 1, label: 'Bolitas duras separadas', interpretation: 'Estreñimiento severo', icon: '●●●' },
  { type: 2, label: 'Forma de salchicha con grumos', interpretation: 'Estreñimiento leve', icon: '▓▓' },
  { type: 3, label: 'Salchicha con grietas', interpretation: 'Normal', icon: '█▓' },
  { type: 4, label: 'Salchicha lisa y suave', interpretation: 'Normal ideal', icon: '██' },
  { type: 5, label: 'Trozos blandos con bordes', interpretation: 'Tendencia a diarrea', icon: '▒▒' },
  { type: 6, label: 'Fragmentos pastosos', interpretation: 'Diarrea leve', icon: '░░' },
  { type: 7, label: 'Acuosa, sin piezas sólidas', interpretation: 'Diarrea severa', icon: '~~' },
] as const;
