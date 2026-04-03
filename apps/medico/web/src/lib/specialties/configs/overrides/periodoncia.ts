/**
 * @file overrides/periodoncia.ts
 * @description Override de configuración para Periodoncia.
 *
 * Módulos especializados: periodontograma (6 puntos), seguimiento de pérdida ósea,
 * mantenimiento de implantes, registro de raspado/alisado radicular,
 * procedimientos regenerativos, tendencias de sangrado al sondaje.
 *
 * También exporta constantes de dominio: clasificación periodontal (2018),
 * tipos de procedimientos regenerativos, grados de movilidad dental.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Periodoncia.
 * Especialidad odontológica centrada en enfermedad periodontal e implantes.
 */
export const periodonciaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'periodoncia',
  dashboardPath: '/dashboard/medico/periodoncia',

  modules: {
    clinical: [
      {
        key: 'dental-perio-periodontograma',
        label: 'Periodontograma',
        icon: 'FileText',
        route: '/dashboard/medico/periodoncia/periodontograma',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['pocket_depth_reduction', 'bop_improvement'],
        description: 'Sondaje periodontal de 6 puntos por diente',
      },
      {
        key: 'dental-perio-perdida-osea',
        label: 'Pérdida Ósea',
        icon: 'TrendingDown',
        route: '/dashboard/medico/periodoncia/perdida-osea',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento radiográfico de niveles óseos',
      },
      {
        key: 'dental-perio-raspado',
        label: 'Raspado y Alisado Radicular',
        icon: 'Wand2',
        route: '/dashboard/medico/periodoncia/raspado',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'dental-perio-implantes',
        label: 'Mantenimiento de Implantes',
        icon: 'Pin',
        route: '/dashboard/medico/periodoncia/implantes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Monitoreo de periimplantitis, sondaje periimplantario',
      },
      {
        key: 'dental-perio-regeneracion',
        label: 'Procedimientos Regenerativos',
        icon: 'Layers',
        route: '/dashboard/medico/periodoncia/regeneracion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'dental-perio-sangrado',
        label: 'Tendencias de Sangrado',
        icon: 'Droplet',
        route: '/dashboard/medico/periodoncia/sangrado',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['bop_improvement'],
        description: 'BOP (Bleeding on Probing) — tendencias temporales',
      },
    ],

    lab: [
      {
        key: 'dental-perio-radiologia',
        label: 'Radiología Periodontal',
        icon: 'Image',
        route: '/dashboard/medico/periodoncia/radiologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dental-perio-microbiologia',
        label: 'Microbiología Periodontal',
        icon: 'Microscope',
        route: '/dashboard/medico/periodoncia/microbiologia',
        group: 'lab',
        order: 2,
        enabledByDefault: false,
        description: 'Test de patógenos periodontales (PCR)',
      },
    ],

    technology: [
      {
        key: 'dental-perio-calculadoras',
        label: 'Calculadoras Periodontales',
        icon: 'Calculator',
        route: '/dashboard/medico/periodoncia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Índice de placa, índice gingival, BOP%, clasificación periodontal',
      },
    ],

    communication: [
      {
        key: 'dental-perio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/periodoncia/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-perio-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/periodoncia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'periodontal-chart',
      component: '@/components/dashboard/medico/periodoncia/widgets/periodontal-chart-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'bone-loss-tracking',
      component: '@/components/dashboard/medico/periodoncia/widgets/bone-loss-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'bop-trend',
      component: '@/components/dashboard/medico/periodoncia/widgets/bop-trend-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'pocket_depth_reduction',
    'bop_improvement',
    'tooth_retention_rate',
    'implant_maintenance_compliance',
    'regeneration_success_rate',
  ],

  kpiDefinitions: {
    pocket_depth_reduction: {
      label: 'Reducción de Profundidad de Sondaje',
      format: 'number',
      direction: 'higher_is_better',
    },
    bop_improvement: {
      label: 'Mejora BOP (%)',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    tooth_retention_rate: {
      label: 'Tasa de Retención Dental',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    implant_maintenance_compliance: {
      label: 'Adherencia a Mantenimiento Implantes',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    regeneration_success_rate: {
      label: 'Éxito de Regeneración',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_periodontal',
      'raspado_alisado_radicular',
      'mantenimiento_periodontal',
      'cirugia_periodontal',
      'regeneracion_osea',
      'mantenimiento_implantes',
      'reevaluacion',
      'profilaxis',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'periodontograma',
      'evaluacion_periodontal',
      'informe_raspado',
      'plan_cirugia_periodontal',
      'informe_regeneracion',
      'consentimiento_periodontal',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresPeriodontalCharting: true,
      tracksBoneLoss: true,
      supportsBOPTracking: true,
      tracksImplantMaintenance: true,
      usesRegenerativeProcedures: true,
      requires6PointProbing: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'FileText',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO PERIODONTAL
// ============================================================================

/**
 * Clasificación de enfermedad periodontal (2018 — AAP/EFP)
 */
export const PERIODONTAL_CLASSIFICATION_2018 = {
  stages: [
    { stage: 'I', label: 'Periodontitis Inicial', calLoss: '1-2 mm', boneLoss: '<15%', probing: '≤4 mm', toothLoss: 'No' },
    { stage: 'II', label: 'Periodontitis Moderada', calLoss: '3-4 mm', boneLoss: '15-33%', probing: '≤5 mm', toothLoss: 'No' },
    { stage: 'III', label: 'Periodontitis Severa', calLoss: '≥5 mm', boneLoss: '>33%', probing: '≥6 mm', toothLoss: '≤4 dientes' },
    { stage: 'IV', label: 'Periodontitis Avanzada', calLoss: '≥5 mm', boneLoss: '>33%', probing: '≥6 mm', toothLoss: '≥5 dientes' },
  ],
  grades: [
    { grade: 'A', label: 'Tasa Lenta', progression: '<0.25 mm/año', riskFactors: 'No fumador, no diabetes' },
    { grade: 'B', label: 'Tasa Moderada', progression: '0.25-1.0 mm/año', riskFactors: 'Fumador <10 cig/día o HbA1c <7%' },
    { grade: 'C', label: 'Tasa Rápida', progression: '>1.0 mm/año', riskFactors: 'Fumador ≥10 cig/día o HbA1c ≥7%' },
  ],
} as const;

/**
 * Grados de movilidad dental (Miller)
 */
export const TOOTH_MOBILITY_GRADES = [
  { grade: 0, label: 'Sin movilidad', description: 'Movilidad fisiológica' },
  { grade: 1, label: 'Movilidad Grado I', description: 'Movilidad horizontal <1 mm' },
  { grade: 2, label: 'Movilidad Grado II', description: 'Movilidad horizontal >1 mm, sin movilidad vertical' },
  { grade: 3, label: 'Movilidad Grado III', description: 'Movilidad horizontal + vertical (depresible)' },
] as const;
