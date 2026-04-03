/**
 * @file overrides/artroscopia.ts
 * @description Override de configuración para Artroscopía.
 *
 * Módulos especializados: documentación de procedimientos,
 * hallazgos intra-articulares, clasificación meniscal/ligamentaria,
 * seguimiento de rehabilitación post-operatoria, criterios de
 * retorno al deporte.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const artroscopiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'artroscopia',
  dashboardPath: '/dashboard/medico/artroscopia',

  modules: {
    clinical: [
      {
        key: 'artro-consulta',
        label: 'Consulta de Artroscopía',
        icon: 'Stethoscope',
        route: '/dashboard/medico/artroscopia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'artro-procedimiento',
        label: 'Documentación de Procedimiento',
        icon: 'FileText',
        route: '/dashboard/medico/artroscopia/procedimiento',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes_rate'],
      },
      {
        key: 'artro-hallazgos',
        label: 'Hallazgos Intra-Articulares',
        icon: 'Eye',
        route: '/dashboard/medico/artroscopia/hallazgos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'artro-meniscal',
        label: 'Clasificación Meniscal',
        icon: 'Layers',
        route: '/dashboard/medico/artroscopia/meniscal',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'artro-ligamentos',
        label: 'Clasificación Ligamentaria',
        icon: 'Link',
        route: '/dashboard/medico/artroscopia/ligamentos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'artro-rehabilitacion',
        label: 'Seguimiento de Rehabilitación',
        icon: 'Activity',
        route: '/dashboard/medico/artroscopia/rehabilitacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'artro-retorno-deporte',
        label: 'Criterios de Retorno al Deporte',
        icon: 'Trophy',
        route: '/dashboard/medico/artroscopia/retorno-deporte',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['return_to_sport_rate'],
      },
    ],

    lab: [
      {
        key: 'artro-imagenologia',
        label: 'Imagenología Articular',
        icon: 'Scan',
        route: '/dashboard/medico/artroscopia/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'artro-rmn',
        label: 'RMN Articular',
        icon: 'Image',
        route: '/dashboard/medico/artroscopia/rmn',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'artro-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/artroscopia/planificacion',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'artro-video',
        label: 'Biblioteca de Video Artroscópico',
        icon: 'Video',
        route: '/dashboard/medico/artroscopia/video',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'artro-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/artroscopia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'artro-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/artroscopia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'artro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/artroscopia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgical-outcomes',
      component: '@/components/dashboard/medico/artroscopia/widgets/surgical-outcomes-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'return-to-sport-tracker',
      component: '@/components/dashboard/medico/artroscopia/widgets/return-to-sport-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'procedure-volume',
      component: '@/components/dashboard/medico/artroscopia/widgets/procedure-volume-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'surgical_outcomes_rate',
    'return_to_sport_rate',
    'revision_surgery_rate',
    'avg_rehab_duration',
    'patient_reported_outcomes',
    'complication_rate',
  ],

  kpiDefinitions: {
    surgical_outcomes_rate: {
      label: 'Tasa de Resultados Quirúrgicos Exitosos',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    return_to_sport_rate: {
      label: 'Tasa de Retorno al Deporte',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    revision_surgery_rate: {
      label: 'Tasa de Cirugía de Revisión',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    avg_rehab_duration: {
      label: 'Duración Promedio de Rehabilitación',
      format: 'duration',
      direction: 'lower_is_better',
    },
    patient_reported_outcomes: {
      label: 'Resultados Reportados por el Paciente',
      format: 'number',
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'evaluacion_preoperatoria',
      'post_operatorio',
      'control_rehabilitacion',
      'evaluacion_retorno_deporte',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_articular',
      'examen_fisico_articular',
      'informe_artroscopia',
      'hallazgos_intraarticulares',
      'protocolo_rehabilitacion',
      'evaluacion_retorno_deporte',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresProcedureDocumentation: true,
      supportsIntraArticularClassification: true,
      tracksRehabProgress: true,
      usesReturnToSportCriteria: true,
      supportsVideoDocumentation: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Bone',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE ARTROSCOPÍA
// ============================================================================

/**
 * Clasificación de lesiones meniscales
 */
export const MENISCAL_TEAR_TYPES = [
  { key: 'longitudinal', label: 'Longitudinal / Vertical', repairability: 'Alta', zone: 'Red-red' },
  { key: 'radial', label: 'Radial', repairability: 'Baja', zone: 'Variable' },
  { key: 'horizontal', label: 'Horizontal / Clivaje', repairability: 'Baja', zone: 'White-white' },
  { key: 'bucket_handle', label: 'Asa de Balde', repairability: 'Alta', zone: 'Red-red/Red-white' },
  { key: 'flap', label: 'Flap / Colgajo', repairability: 'Baja', zone: 'Variable' },
  { key: 'complex', label: 'Compleja / Degenerativa', repairability: 'Baja', zone: 'White-white' },
  { key: 'root', label: 'Raíz Meniscal', repairability: 'Moderada', zone: 'Posterior' },
] as const;

/**
 * Clasificación de lesiones de LCA (Ligamento Cruzado Anterior)
 */
export const ACL_INJURY_GRADES = [
  { grade: 'I', label: 'Grado I — Esguince', description: 'Fibras estiradas pero intactas, laxitud mínima', treatment: 'Conservador' },
  { grade: 'II', label: 'Grado II — Rotura Parcial', description: 'Rotura parcial de fibras, laxitud moderada', treatment: 'Conservador / Quirúrgico' },
  { grade: 'III', label: 'Grado III — Rotura Completa', description: 'Rotura completa, inestabilidad significativa', treatment: 'Quirúrgico' },
] as const;

/**
 * Clasificación de lesiones del cartílago articular (Outerbridge)
 */
export const OUTERBRIDGE_CLASSIFICATION = [
  { grade: 0, label: 'Normal', description: 'Cartílago normal' },
  { grade: 'I', label: 'Grado I', description: 'Reblandecimiento y edema del cartílago' },
  { grade: 'II', label: 'Grado II', description: 'Fragmentación y fisuras ≤ 1.5 cm de diámetro' },
  { grade: 'III', label: 'Grado III', description: 'Fragmentación y fisuras > 1.5 cm de diámetro' },
  { grade: 'IV', label: 'Grado IV', description: 'Erosión del cartílago con hueso subcondral expuesto' },
] as const;
