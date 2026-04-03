/**
 * @file overrides/cirugia-refractiva.ts
 * @description Override de configuración para Cirugía Refractiva.
 *
 * Módulos especializados: topografía corneal preoperatoria,
 * planificación LASIK/PRK, análisis de frente de onda,
 * documentación de flap, seguimiento de resultados visuales.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const cirugiaRefractivaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-refractiva',
  dashboardPath: '/dashboard/medico/cirugia-refractiva',

  modules: {
    clinical: [
      {
        key: 'refract-consulta',
        label: 'Consulta de Cirugía Refractiva',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-refractiva/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'refract-topografia',
        label: 'Topografía Corneal',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-refractiva/topografia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'refract-planificacion',
        label: 'Planificación LASIK/PRK',
        icon: 'Target',
        route: '/dashboard/medico/cirugia-refractiva/planificacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'refract-wavefront',
        label: 'Análisis de Frente de Onda',
        icon: 'Waves',
        route: '/dashboard/medico/cirugia-refractiva/wavefront',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'refract-flap',
        label: 'Documentación de Flap',
        icon: 'Layers',
        route: '/dashboard/medico/cirugia-refractiva/flap',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'refract-resultados',
        label: 'Seguimiento de Resultados Visuales',
        icon: 'Eye',
        route: '/dashboard/medico/cirugia-refractiva/resultados',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['twenty_twenty_achievement_rate'],
      },
    ],

    lab: [
      {
        key: 'refract-paquimetria',
        label: 'Paquimetría Corneal',
        icon: 'Ruler',
        route: '/dashboard/medico/cirugia-refractiva/paquimetria',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'refract-aberrometria',
        label: 'Aberrometría',
        icon: 'Focus',
        route: '/dashboard/medico/cirugia-refractiva/aberrometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'refract-ojo-seco',
        label: 'Evaluación de Ojo Seco',
        icon: 'Droplets',
        route: '/dashboard/medico/cirugia-refractiva/ojo-seco',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'refract-nomograma',
        label: 'Nomograma de Ablación',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-refractiva/nomograma',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'refract-simulacion',
        label: 'Simulación de Resultados',
        icon: 'MonitorSmartphone',
        route: '/dashboard/medico/cirugia-refractiva/simulacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'refract-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/cirugia-refractiva/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'refract-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-refractiva/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'refract-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-refractiva/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'visual-outcomes-tracker',
      component: '@/components/dashboard/medico/cirugia-refractiva/widgets/visual-outcomes-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'corneal-topography-summary',
      component: '@/components/dashboard/medico/cirugia-refractiva/widgets/corneal-topography-summary-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'procedure-stats',
      component: '@/components/dashboard/medico/cirugia-refractiva/widgets/procedure-stats-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'twenty_twenty_achievement_rate',
    'enhancement_rate',
    'complication_rate',
    'patient_satisfaction_score',
    'avg_spherical_equivalent_accuracy',
    'dry_eye_incidence',
  ],

  kpiDefinitions: {
    twenty_twenty_achievement_rate: {
      label: 'Tasa de Logro 20/20',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    enhancement_rate: {
      label: 'Tasa de Retoque / Enhancement',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.01,
      direction: 'lower_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    avg_spherical_equivalent_accuracy: {
      label: 'Precisión del Equivalente Esférico',
      format: 'number',
      direction: 'lower_is_better',
    },
    dry_eye_incidence: {
      label: 'Incidencia de Ojo Seco Post-Op',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_candidato',
      'topografia_preop',
      'cirugia_lasik',
      'cirugia_prk',
      'cirugia_smile',
      'control_1_dia',
      'control_1_semana',
      'control_1_mes',
      'control_3_meses',
      'control_6_meses',
      'retoque',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_preoperatoria',
      'topografia_corneal',
      'wavefront_analysis',
      'informe_quirurgico',
      'documentacion_flap',
      'control_postoperatorio',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCornealTopography: true,
      supportsWavefrontAnalysis: true,
      tracksFlapDocumentation: true,
      requiresPachymetry: true,
      supportsNomogramAdjustment: true,
      tracksVisualOutcomes: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#0E7490',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE CIRUGÍA REFRACTIVA
// ============================================================================

/**
 * Tipos de procedimientos refractivos
 */
export const REFRACTIVE_PROCEDURE_TYPES = [
  { key: 'lasik', label: 'LASIK', description: 'Laser-Assisted In Situ Keratomileusis', flapBased: true },
  { key: 'prk', label: 'PRK', description: 'Photorefractive Keratectomy', flapBased: false },
  { key: 'smile', label: 'SMILE', description: 'Small Incision Lenticule Extraction', flapBased: false },
  { key: 'icl', label: 'ICL', description: 'Implantable Collamer Lens', flapBased: false },
  { key: 'rle', label: 'RLE', description: 'Refractive Lens Exchange', flapBased: false },
  { key: 'ptk', label: 'PTK', description: 'Phototherapeutic Keratectomy', flapBased: false },
] as const;

/**
 * Criterios de candidatura para cirugía refractiva
 */
export const REFRACTIVE_CANDIDACY_CRITERIA = [
  { key: 'age', label: 'Edad ≥ 18 años', category: 'demographic' },
  { key: 'stable_rx', label: 'Refracción estable ≥ 1 año', category: 'refractive' },
  { key: 'corneal_thickness', label: 'Espesor corneal ≥ 480 μm (LASIK)', category: 'corneal' },
  { key: 'no_keratoconus', label: 'Sin queratocono ni ectasia', category: 'corneal' },
  { key: 'no_pregnancy', label: 'Sin embarazo/lactancia', category: 'systemic' },
  { key: 'no_autoimmune', label: 'Sin enfermedad autoinmune activa', category: 'systemic' },
  { key: 'no_dry_eye', label: 'Sin ojo seco severo', category: 'ocular' },
  { key: 'pupil_size', label: 'Tamaño pupilar adecuado', category: 'ocular' },
] as const;
