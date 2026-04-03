/**
 * @file overrides/dermatologia-pediatrica.ts
 * @description Override de configuración para Dermatología Pediátrica.
 *
 * Combina Dermatología + Pediatría: módulos especializados para el
 * manejo de patologías cutáneas en niños, incluyendo dermatitis atópica
 * (SCORAD), seguimiento de hemangiomas, documentación de marcas de
 * nacimiento, y dosificación tópica por BSA.
 *
 * También exporta constantes de dominio: tipos de hemangioma,
 * clasificación de birthmarks, hitos de resolución.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Dermatología Pediátrica.
 * Especialidad con módulos clínicos para patologías cutáneas pediátricas.
 */
export const dermatologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'dermatologia-pediatrica',
  dashboardPath: '/dashboard/medico/dermatologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'dermopedi-consulta',
        label: 'Consulta Dermatología Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/dermatologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'dermopedi-dermatitis-atopica',
        label: 'Dermatitis Atópica / SCORAD',
        icon: 'ClipboardList',
        route: '/dashboard/medico/dermatologia-pediatrica/dermatitis-atopica',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Evaluación SCORAD, seguimiento de brotes, plan de cuidado de piel',
        kpiKeys: ['scorad_improvement'],
      },
      {
        key: 'dermopedi-hemangiomas',
        label: 'Seguimiento de Hemangiomas',
        icon: 'Heart',
        route: '/dashboard/medico/dermatologia-pediatrica/hemangiomas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Documentación fotográfica, medición, fase de crecimiento/involución, tratamiento con propranolol',
      },
      {
        key: 'dermopedi-birthmarks',
        label: 'Documentación de Marcas de Nacimiento',
        icon: 'MapPin',
        route: '/dashboard/medico/dermatologia-pediatrica/birthmarks',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Clasificación, mapeo corporal, seguimiento fotográfico',
      },
      {
        key: 'dermopedi-dosificacion-topica',
        label: 'Dosificación Tópica por BSA',
        icon: 'Calculator',
        route: '/dashboard/medico/dermatologia-pediatrica/dosificacion-topica',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Cálculo de dosis tópica según superficie corporal afectada y edad',
      },
      {
        key: 'dermopedi-crecimiento',
        label: 'Crecimiento y Desarrollo',
        icon: 'TrendingUp',
        route: '/dashboard/medico/dermatologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'dermopedi-histopatologia',
        label: 'Histopatología Pediátrica',
        icon: 'FlaskConical',
        route: '/dashboard/medico/dermatologia-pediatrica/histopatologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dermopedi-ige-panel',
        label: 'Panel de IgE y Alérgenos',
        icon: 'TestTube',
        route: '/dashboard/medico/dermatologia-pediatrica/ige-panel',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'IgE específica, prick test para correlación atópica',
      },
      {
        key: 'dermopedi-imagenologia',
        label: 'Fotografía Clínica Pediátrica',
        icon: 'Image',
        route: '/dashboard/medico/dermatologia-pediatrica/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dermopedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/dermatologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'SCORAD, BSA pediátrico, FTU (fingertip units), dosis por peso',
      },
    ],

    communication: [
      {
        key: 'dermopedi-portal-padres',
        label: 'Portal para Padres',
        icon: 'Users',
        route: '/dashboard/medico/dermatologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'dermopedi-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/dermatologia-pediatrica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dermopedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/dermatologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'scorad-tracking',
      component: '@/components/dashboard/medico/dermatologia-pediatrica/widgets/scorad-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'hemangioma-tracking',
      component: '@/components/dashboard/medico/dermatologia-pediatrica/widgets/hemangioma-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'treatment-adherence',
      component: '@/components/dashboard/medico/dermatologia-pediatrica/widgets/treatment-adherence-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'birthmark-gallery',
      component: '@/components/dashboard/medico/dermatologia-pediatrica/widgets/birthmark-gallery-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'scorad_improvement',
    'treatment_adherence',
    'referral_rate',
    'hemangioma_resolution_rate',
    'avg_consultation_duration',
    'parent_satisfaction',
  ],

  kpiDefinitions: {
    scorad_improvement: {
      label: 'Mejora SCORAD Promedio',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    treatment_adherence: {
      label: 'Adherencia al Tratamiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    referral_rate: {
      label: 'Tasa de Referencia a Subespecialista',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    hemangioma_resolution_rate: {
      label: 'Tasa de Resolución de Hemangiomas',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    avg_consultation_duration: {
      label: 'Duración Promedio de Consulta',
      format: 'duration',
      direction: 'lower_is_better',
    },
    parent_satisfaction: {
      label: 'Satisfacción de Padres',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_dermatitis_atopica',
      'seguimiento_hemangioma',
      'evaluacion_birthmark',
      'patch_test',
      'fototerapia_pediatrica',
      'control_tratamiento',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_dermatologica_pediatrica',
      'examen_dermatologico_pediatrico',
      'evaluacion_scorad',
      'seguimiento_hemangioma',
      'documentacion_birthmark',
      'plan_cuidado_piel',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresSCORADTracking: true,
      supportsHemangiomMonitoring: true,
      requiresPhotographicDocumentation: true,
      usesTopicalDosingByBSA: true,
      tracksFingertipUnits: true,
      requiresGrowthMonitoring: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DERMATOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Clasificación de hemangiomas infantiles por fase
 */
export const HEMANGIOMA_PHASES = [
  { key: 'proliferative', label: 'Fase Proliferativa', ageRange: '0-12 meses', description: 'Crecimiento rápido del hemangioma' },
  { key: 'plateau', label: 'Fase de Meseta', ageRange: '12-18 meses', description: 'Estabilización del crecimiento' },
  { key: 'involution', label: 'Fase de Involución', ageRange: '1-7 años', description: 'Regresión gradual espontánea' },
  { key: 'involuted', label: 'Involucionado', ageRange: '>7 años', description: 'Resolución completa o residual' },
] as const;

/**
 * Clasificación de marcas de nacimiento
 */
export const BIRTHMARK_TYPES = [
  { key: 'salmon_patch', label: 'Mancha Salmón (Nevo Simple)', category: 'vascular', prognosis: 'Resolución espontánea en la mayoría' },
  { key: 'port_wine_stain', label: 'Mancha en Vino de Oporto', category: 'vascular', prognosis: 'Persistente, considerar láser' },
  { key: 'mongolian_spot', label: 'Mancha Mongólica', category: 'pigmentada', prognosis: 'Resolución espontánea antes de los 5 años' },
  { key: 'cafe_au_lait', label: 'Mancha Café con Leche', category: 'pigmentada', prognosis: 'Persistente, evaluar NF1 si ≥6' },
  { key: 'congenital_melanocytic_nevus', label: 'Nevo Melanocítico Congénito', category: 'pigmentada', prognosis: 'Seguimiento por riesgo de melanoma' },
  { key: 'infantile_hemangioma', label: 'Hemangioma Infantil', category: 'vascular', prognosis: 'Involución espontánea 5-7 años' },
] as const;

/**
 * Rangos SCORAD para clasificación de severidad
 */
export const SCORAD_SEVERITY_RANGES = [
  { range: '0-24', label: 'Leve', color: '#22C55E' },
  { range: '25-50', label: 'Moderado', color: '#F59E0B' },
  { range: '51-103', label: 'Severo', color: '#EF4444' },
] as const;
