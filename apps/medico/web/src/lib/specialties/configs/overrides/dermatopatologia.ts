/**
 * @file overrides/dermatopatologia.ts
 * @description Override de configuración para Dermatopatología.
 *
 * Módulos especializados: seguimiento de especímenes,
 * clasificación de patrones histológicos, gestión de paneles IHC,
 * evaluación de márgenes, reporte de lesiones melanocíticas,
 * registro de consultas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const dermatopatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'dermatopatologia',
  dashboardPath: '/dashboard/medico/dermatopatologia',

  modules: {
    clinical: [
      {
        key: 'dermpath-consulta',
        label: 'Consulta Dermatopatológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/dermatopatologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['cases_per_day'],
      },
      {
        key: 'dermpath-especimenes',
        label: 'Seguimiento de Especímenes',
        icon: 'Package',
        route: '/dashboard/medico/dermatopatologia/especimenes',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['turnaround_time'],
      },
      {
        key: 'dermpath-patrones',
        label: 'Clasificación de Patrones Histológicos',
        icon: 'Grid3x3',
        route: '/dashboard/medico/dermatopatologia/patrones',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-ihc',
        label: 'Paneles de Inmunohistoquímica',
        icon: 'FlaskConical',
        route: '/dashboard/medico/dermatopatologia/ihc',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-margenes',
        label: 'Evaluación de Márgenes',
        icon: 'Maximize2',
        route: '/dashboard/medico/dermatopatologia/margenes',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-melanociticas',
        label: 'Lesiones Melanocíticas',
        icon: 'CircleDot',
        route: '/dashboard/medico/dermatopatologia/melanociticas',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-consultas-externas',
        label: 'Consultas Externas / Segunda Opinión',
        icon: 'MessageSquare',
        route: '/dashboard/medico/dermatopatologia/consultas-externas',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['concordance_rate'],
      },
    ],

    lab: [
      {
        key: 'dermpath-microscopio',
        label: 'Microscopía Digital',
        icon: 'Microscope',
        route: '/dashboard/medico/dermatopatologia/microscopio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-tinciones',
        label: 'Tinciones Especiales',
        icon: 'Palette',
        route: '/dashboard/medico/dermatopatologia/tinciones',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-molecular',
        label: 'Estudios Moleculares',
        icon: 'Dna',
        route: '/dashboard/medico/dermatopatologia/molecular',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dermpath-reportes',
        label: 'Plantillas de Reportes Sinópticos',
        icon: 'FileText',
        route: '/dashboard/medico/dermatopatologia/reportes',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dermpath-worklist',
        label: 'Worklist de Casos',
        icon: 'ListTodo',
        route: '/dashboard/medico/dermatopatologia/worklist',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'dermpath-referencia',
        label: 'Referencia a Dermatólogo',
        icon: 'Share2',
        route: '/dashboard/medico/dermatopatologia/referencia',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dermpath-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/dermatopatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'specimen-turnaround',
      component: '@/components/dashboard/medico/dermatopatologia/widgets/specimen-turnaround-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'case-volume-tracker',
      component: '@/components/dashboard/medico/dermatopatologia/widgets/case-volume-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'concordance-metrics',
      component: '@/components/dashboard/medico/dermatopatologia/widgets/concordance-metrics-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'turnaround_time',
    'concordance_rate',
    'amended_report_rate',
    'cases_per_day',
    'ihc_utilization_rate',
    'margin_positivity_rate',
  ],

  kpiDefinitions: {
    turnaround_time: {
      label: 'Tiempo de Entrega de Reportes',
      format: 'duration',
      direction: 'lower_is_better',
    },
    concordance_rate: {
      label: 'Tasa de Concordancia Diagnóstica',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    amended_report_rate: {
      label: 'Tasa de Reportes Enmendados',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    cases_per_day: {
      label: 'Casos por Día',
      format: 'number',
      direction: 'higher_is_better',
    },
    ihc_utilization_rate: {
      label: 'Utilización de IHC',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    margin_positivity_rate: {
      label: 'Tasa de Márgenes Positivos',
      format: 'percentage',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'lectura_biopsia',
      'consulta_interna',
      'consulta_externa',
      'segunda_opinion',
      'revision_ihc',
      'conferencia_clinicopatologica',
    ],
    defaultDuration: 15,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_biopsia_piel',
      'reporte_sinoptico_melanoma',
      'reporte_sinoptico_carcinoma',
      'evaluacion_margenes',
      'panel_ihc',
      'consulta_segunda_opinion',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksSpecimens: true,
      supportsIHCPanels: true,
      requiresMarginAssessment: true,
      supportsMelanocyticReporting: true,
      tracksAmendedReports: true,
      supportsDigitalMicroscopy: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Microscope',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE DERMATOPATOLOGÍA
// ============================================================================

/**
 * Patrones histológicos básicos de enfermedad cutánea
 */
export const HISTOLOGICAL_PATTERNS = [
  { key: 'perivascular', label: 'Perivascular Superficial', category: 'inflamatorio' },
  { key: 'interface', label: 'Dermatitis de Interfase', category: 'inflamatorio' },
  { key: 'spongiotic', label: 'Espongiótico', category: 'inflamatorio' },
  { key: 'psoriasiform', label: 'Psoriasiforme', category: 'inflamatorio' },
  { key: 'lichenoid', label: 'Liquenoide', category: 'inflamatorio' },
  { key: 'vesiculobullous', label: 'Vesiculoampolloso', category: 'inflamatorio' },
  { key: 'granulomatous', label: 'Granulomatoso', category: 'inflamatorio' },
  { key: 'vasculitis', label: 'Vasculítico', category: 'inflamatorio' },
  { key: 'fibrosing', label: 'Fibrosante / Esclerosante', category: 'inflamatorio' },
] as const;

/**
 * Clasificación de Breslow para melanoma (espesor tumoral)
 */
export const BRESLOW_CLASSIFICATION = [
  { stage: 'T1', thickness: '≤ 1.0 mm', substage_a: '< 0.8 mm sin ulceración', substage_b: '0.8-1.0 mm o < 0.8 mm con ulceración' },
  { stage: 'T2', thickness: '1.01 - 2.0 mm', substage_a: 'Sin ulceración', substage_b: 'Con ulceración' },
  { stage: 'T3', thickness: '2.01 - 4.0 mm', substage_a: 'Sin ulceración', substage_b: 'Con ulceración' },
  { stage: 'T4', thickness: '> 4.0 mm', substage_a: 'Sin ulceración', substage_b: 'Con ulceración' },
] as const;
