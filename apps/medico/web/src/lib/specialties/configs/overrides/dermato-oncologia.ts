/**
 * @file overrides/dermato-oncologia.ts
 * @description Override de configuración para Dermato-Oncología.
 *
 * Módulos especializados: tracking de profundidad de Breslow,
 * resultados de ganglio centinela, estadificación AJCC,
 * monitoreo de inmunoterapia, registros de cirugía de Mohs.
 *
 * También exporta constantes de dominio: estadificación de melanoma,
 * grupos de Breslow, tipos de cirugía de Mohs.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Dermato-Oncología.
 * Especialidad centrada en diagnóstico y tratamiento de neoplasias cutáneas.
 */
export const dermatoOncologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'dermato-oncologia',
  dashboardPath: '/dashboard/medico/dermato-oncologia',

  modules: {
    clinical: [
      {
        key: 'dermonco-consulta',
        label: 'Consulta Dermato-Oncológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/dermato-oncologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'early_detection_rate'],
      },
      {
        key: 'dermonco-breslow',
        label: 'Profundidad de Breslow',
        icon: 'Ruler',
        route: '/dashboard/medico/dermato-oncologia/breslow',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Registro y seguimiento de profundidad de Breslow, índice mitótico, ulceración',
      },
      {
        key: 'dermonco-ganglio-centinela',
        label: 'Ganglio Centinela',
        icon: 'Target',
        route: '/dashboard/medico/dermato-oncologia/ganglio-centinela',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Resultados de biopsia de ganglio centinela, mapeo linfático',
      },
      {
        key: 'dermonco-estadificacion',
        label: 'Estadificación AJCC',
        icon: 'Layers',
        route: '/dashboard/medico/dermato-oncologia/estadificacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Clasificación TNM, estadio AJCC 8th ed., pronóstico por estadio',
        kpiKeys: ['staging_accuracy'],
      },
      {
        key: 'dermonco-inmunoterapia',
        label: 'Monitoreo de Inmunoterapia',
        icon: 'Shield',
        route: '/dashboard/medico/dermato-oncologia/inmunoterapia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Seguimiento de checkpoint inhibitors, efectos adversos inmunomediados, respuesta tumoral',
      },
      {
        key: 'dermonco-mohs',
        label: 'Cirugía de Mohs',
        icon: 'Scissors',
        route: '/dashboard/medico/dermato-oncologia/mohs',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Registro de cirugías de Mohs, capas, márgenes, reconstrucción',
      },
      {
        key: 'dermonco-dermatoscopia',
        label: 'Dermatoscopía Oncológica',
        icon: 'Scan',
        route: '/dashboard/medico/dermato-oncologia/dermatoscopia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Imágenes dermatoscópicas, algoritmos de cribado, seguimiento de nevos atípicos',
      },
    ],

    lab: [
      {
        key: 'dermonco-histopatologia',
        label: 'Histopatología Oncológica',
        icon: 'Microscope',
        route: '/dashboard/medico/dermato-oncologia/histopatologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dermonco-marcadores',
        label: 'Marcadores Tumorales',
        icon: 'FlaskConical',
        route: '/dashboard/medico/dermato-oncologia/marcadores',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'LDH, S100, mutaciones BRAF/NRAS, biomarcadores pronósticos',
      },
      {
        key: 'dermonco-imagenologia',
        label: 'Imagenología Oncológica',
        icon: 'Image',
        route: '/dashboard/medico/dermato-oncologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'PET-CT, ecografía ganglionar, mapeo corporal total',
      },
    ],

    technology: [
      {
        key: 'dermonco-calculadoras',
        label: 'Calculadoras Oncológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/dermato-oncologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Estadificación AJCC, pronóstico por Breslow, BSA',
      },
      {
        key: 'dermonco-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/dermato-oncologia/quirofano',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'dermonco-comite-tumores',
        label: 'Comité de Tumores',
        icon: 'Users',
        route: '/dashboard/medico/dermato-oncologia/comite-tumores',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Discusión multidisciplinaria de casos oncológicos',
      },
      {
        key: 'dermonco-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/dermato-oncologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dermonco-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/dermato-oncologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'breslow-staging',
      component: '@/components/dashboard/medico/dermato-oncologia/widgets/breslow-staging-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'ajcc-staging',
      component: '@/components/dashboard/medico/dermato-oncologia/widgets/ajcc-staging-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'immunotherapy-monitoring',
      component: '@/components/dashboard/medico/dermato-oncologia/widgets/immunotherapy-monitoring-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'mohs-surgery-log',
      component: '@/components/dashboard/medico/dermato-oncologia/widgets/mohs-surgery-log-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'early_detection_rate',
    'staging_accuracy',
    'five_year_survival',
    'mohs_cure_rate',
    'sentinel_node_positivity',
    'immunotherapy_response_rate',
  ],

  kpiDefinitions: {
    early_detection_rate: {
      label: 'Tasa de Detección Temprana',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    staging_accuracy: {
      label: 'Precisión de Estadificación',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    five_year_survival: {
      label: 'Supervivencia a 5 Años',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    mohs_cure_rate: {
      label: 'Tasa de Curación Mohs',
      format: 'percentage',
      goal: 0.99,
      direction: 'higher_is_better',
    },
    sentinel_node_positivity: {
      label: 'Tasa de Ganglio Centinela Positivo',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    immunotherapy_response_rate: {
      label: 'Tasa de Respuesta a Inmunoterapia',
      format: 'percentage',
      goal: 0.45,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'dermatoscopia_oncologica',
      'biopsia',
      'seguimiento_inmunoterapia',
      'pre_quirurgica_mohs',
      'post_quirurgica',
      'control_ganglio_centinela',
      'comite_tumores',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_oncologica',
      'examen_dermatologico_oncologico',
      'informe_breslow',
      'informe_ganglio_centinela',
      'estadificacion_ajcc',
      'seguimiento_inmunoterapia',
      'informe_mohs',
      'plan_tratamiento_oncologico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresBreslowTracking: true,
      supportsSentinelNode: true,
      requiresAJCCStaging: true,
      supportsImmunotherapyMonitoring: true,
      supportsMohsSurgery: true,
      requiresTumorBoard: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DERMATO-ONCOLÓGICO
// ============================================================================

/**
 * Grupos de profundidad de Breslow
 */
export const BRESLOW_DEPTH_GROUPS = [
  { group: 'T1a', depth: '≤0.8 mm sin ulceración', prognosis: 'Muy favorable', fiveYearSurvival: '97%' },
  { group: 'T1b', depth: '0.8-1.0 mm o <0.8 mm con ulceración', prognosis: 'Favorable', fiveYearSurvival: '94%' },
  { group: 'T2a', depth: '1.01-2.0 mm sin ulceración', prognosis: 'Intermedio', fiveYearSurvival: '87%' },
  { group: 'T2b', depth: '1.01-2.0 mm con ulceración', prognosis: 'Intermedio', fiveYearSurvival: '82%' },
  { group: 'T3a', depth: '2.01-4.0 mm sin ulceración', prognosis: 'Desfavorable', fiveYearSurvival: '78%' },
  { group: 'T3b', depth: '2.01-4.0 mm con ulceración', prognosis: 'Desfavorable', fiveYearSurvival: '68%' },
  { group: 'T4a', depth: '>4.0 mm sin ulceración', prognosis: 'Muy desfavorable', fiveYearSurvival: '71%' },
  { group: 'T4b', depth: '>4.0 mm con ulceración', prognosis: 'Muy desfavorable', fiveYearSurvival: '53%' },
] as const;

/**
 * Estadificación AJCC 8th edition para melanoma cutáneo (simplificada)
 */
export const AJCC_MELANOMA_STAGES = [
  { stage: '0', description: 'Melanoma in situ', treatment: 'Excisión local' },
  { stage: 'IA', description: 'T1a N0 M0', treatment: 'Excisión amplia (1 cm)' },
  { stage: 'IB', description: 'T1b/T2a N0 M0', treatment: 'Excisión amplia (1-2 cm), considerar GC' },
  { stage: 'IIA', description: 'T2b/T3a N0 M0', treatment: 'Excisión amplia (2 cm), GC recomendado' },
  { stage: 'IIB', description: 'T3b/T4a N0 M0', treatment: 'Excisión amplia, GC, considerar adyuvancia' },
  { stage: 'IIC', description: 'T4b N0 M0', treatment: 'Excisión amplia, GC, adyuvancia' },
  { stage: 'III', description: 'Cualquier T, N+, M0', treatment: 'Cirugía + inmunoterapia/terapia dirigida' },
  { stage: 'IV', description: 'Cualquier T, cualquier N, M1', treatment: 'Inmunoterapia, terapia dirigida, paliativo' },
] as const;

/**
 * Tipos de cirugía de Mohs
 */
export const MOHS_INDICATIONS = [
  { key: 'bcc_high_risk', label: 'Carcinoma Basocelular de Alto Riesgo', description: 'BCC recurrente, facial, >2 cm, bordes mal definidos' },
  { key: 'scc_high_risk', label: 'Carcinoma Escamocelular de Alto Riesgo', description: 'SCC recurrente, perineural, >2 cm, inmunosuprimido' },
  { key: 'dfsp', label: 'Dermatofibrosarcoma Protuberans', description: 'DFSP con extensión subclínica' },
  { key: 'mac', label: 'Carcinoma Anexial Microquístico', description: 'Invasión perineural frecuente' },
  { key: 'lentigo_maligna', label: 'Lentigo Maligno', description: 'Melanoma in situ con bordes difusos' },
] as const;
