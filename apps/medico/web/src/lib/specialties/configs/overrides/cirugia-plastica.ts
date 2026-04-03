/**
 * @file overrides/cirugia-plastica.ts
 * @description Override de configuración para Cirugía Plástica.
 *
 * Módulos especializados: documentación fotográfica pre/post,
 * seguimiento de cicatrización, viabilidad de colgajos,
 * scoring estético, registro de implantes, evaluación de cicatrices.
 *
 * También exporta constantes de dominio: escala Vancouver de cicatrices,
 * clasificación de colgajos, tipos de implantes.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Plástica.
 * Especialidad con módulos para cirugía reconstructiva y manejo de heridas complejas.
 */
export const cirugiaPlasticaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-plastica',
  dashboardPath: '/dashboard/medico/cirugia-plastica',

  modules: {
    clinical: [
      {
        key: 'cirplast-consulta',
        label: 'Consulta Cirugía Plástica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-plastica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'patient_satisfaction'],
      },
      {
        key: 'cirplast-foto-prepost',
        label: 'Documentación Fotográfica Pre/Post',
        icon: 'Camera',
        route: '/dashboard/medico/cirugia-plastica/foto-prepost',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Fotografía estandarizada antes y después, comparación temporal, consentimiento',
      },
      {
        key: 'cirplast-cicatrizacion',
        label: 'Seguimiento de Cicatrización',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-plastica/cicatrizacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Escala Vancouver, evolución de heridas, terapia de presión',
      },
      {
        key: 'cirplast-colgajos',
        label: 'Viabilidad de Colgajos',
        icon: 'Layers',
        route: '/dashboard/medico/cirugia-plastica/colgajos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Monitoreo de colgajos libres/pediculados, perfusión, complicaciones',
      },
      {
        key: 'cirplast-scoring-estetico',
        label: 'Scoring Estético',
        icon: 'Star',
        route: '/dashboard/medico/cirugia-plastica/scoring-estetico',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Evaluación de resultados estéticos, simetría, satisfacción del paciente',
        kpiKeys: ['patient_satisfaction'],
      },
      {
        key: 'cirplast-implantes',
        label: 'Registro de Implantes',
        icon: 'Package',
        route: '/dashboard/medico/cirugia-plastica/implantes',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Registro de implantes mamarios, faciales, tisulares, tracking de lotes',
      },
      {
        key: 'cirplast-evaluacion-cicatrices',
        label: 'Evaluación de Cicatrices',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-plastica/evaluacion-cicatrices',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Escala POSAS, Vancouver Scar Scale, plan de manejo de cicatrices',
      },
    ],

    lab: [
      {
        key: 'cirplast-imagenologia',
        label: 'Imagenología Quirúrgica',
        icon: 'Image',
        route: '/dashboard/medico/cirugia-plastica/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Planificación 3D, angiografía para colgajos, ecografía de implantes',
      },
      {
        key: 'cirplast-histopatologia',
        label: 'Histopatología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-plastica/histopatologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirplast-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-plastica/quirofano',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Planificación preoperatoria, simulación, diseño de colgajos',
      },
      {
        key: 'cirplast-calculadoras',
        label: 'Calculadoras Quirúrgicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-plastica/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'BSA, volumen de implantes, área de colgajo',
      },
    ],

    communication: [
      {
        key: 'cirplast-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/cirugia-plastica/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'cirplast-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-plastica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirplast-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-plastica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'photo-comparison',
      component: '@/components/dashboard/medico/cirugia-plastica/widgets/photo-comparison-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'wound-healing-tracker',
      component: '@/components/dashboard/medico/cirugia-plastica/widgets/wound-healing-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'implant-registry',
      component: '@/components/dashboard/medico/cirugia-plastica/widgets/implant-registry-widget',
      size: 'medium',
    },
    {
      key: 'flap-viability-monitor',
      component: '@/components/dashboard/medico/cirugia-plastica/widgets/flap-viability-monitor-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'patient_satisfaction',
    'revision_rate',
    'complication_rate',
    'flap_survival_rate',
    'wound_healing_time',
    'surgical_volume',
  ],

  kpiDefinitions: {
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    revision_rate: {
      label: 'Tasa de Revisión',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.08,
      direction: 'lower_is_better',
    },
    flap_survival_rate: {
      label: 'Tasa de Supervivencia de Colgajos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    wound_healing_time: {
      label: 'Tiempo de Cicatrización Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    surgical_volume: {
      label: 'Volumen Quirúrgico Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'evaluacion_preoperatoria',
      'control_postoperatorio',
      'documentacion_fotografica',
      'seguimiento_cicatriz',
      'retiro_puntos',
      'revision_implante',
      'curación_herida',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_cirugia_plastica',
      'evaluacion_preoperatoria',
      'consentimiento_quirurgico',
      'informe_operatorio',
      'seguimiento_postoperatorio',
      'evaluacion_cicatriz',
      'registro_implante',
      'documentacion_fotografica',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresPhotographicDocumentation: true,
      supportsWoundTracking: true,
      requiresImplantRegistry: true,
      supportsFlapMonitoring: true,
      usesScarAssessmentScales: true,
      requires3DPlanning: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Sparkles',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO CIRUGÍA PLÁSTICA
// ============================================================================

/**
 * Escala de Cicatrices de Vancouver (VSS)
 */
export const VANCOUVER_SCAR_SCALE = [
  { parameter: 'vascularity', label: 'Vascularidad', options: [
    { score: 0, label: 'Normal' },
    { score: 1, label: 'Rosa' },
    { score: 2, label: 'Rojo' },
    { score: 3, label: 'Púrpura' },
  ]},
  { parameter: 'pigmentation', label: 'Pigmentación', options: [
    { score: 0, label: 'Normal' },
    { score: 1, label: 'Hipopigmentación' },
    { score: 2, label: 'Hiperpigmentación' },
  ]},
  { parameter: 'pliability', label: 'Flexibilidad', options: [
    { score: 0, label: 'Normal' },
    { score: 1, label: 'Flexible' },
    { score: 2, label: 'Cede a presión' },
    { score: 3, label: 'Firme' },
    { score: 4, label: 'En banda' },
    { score: 5, label: 'Contractura' },
  ]},
  { parameter: 'height', label: 'Altura', options: [
    { score: 0, label: 'Plana' },
    { score: 1, label: '<2 mm' },
    { score: 2, label: '2-5 mm' },
    { score: 3, label: '>5 mm' },
  ]},
] as const;

/**
 * Clasificación de colgajos
 */
export const FLAP_CLASSIFICATION = [
  { key: 'local_advancement', label: 'Colgajo de Avance Local', vascularization: 'Random', complexity: 'Baja' },
  { key: 'local_rotation', label: 'Colgajo de Rotación', vascularization: 'Random', complexity: 'Baja' },
  { key: 'local_transposition', label: 'Colgajo de Transposición', vascularization: 'Random', complexity: 'Media' },
  { key: 'pedicled_axial', label: 'Colgajo Pediculado Axial', vascularization: 'Axial', complexity: 'Media' },
  { key: 'free_flap', label: 'Colgajo Libre Microquirúrgico', vascularization: 'Anastomosis', complexity: 'Alta' },
  { key: 'perforator', label: 'Colgajo de Perforante', vascularization: 'Perforasoma', complexity: 'Alta' },
] as const;

/**
 * Tipos de implantes comunes en cirugía plástica
 */
export const IMPLANT_TYPES = [
  { key: 'breast_silicone', label: 'Implante Mamario de Silicona', category: 'mamario', material: 'Silicona cohesiva' },
  { key: 'breast_saline', label: 'Implante Mamario Salino', category: 'mamario', material: 'Solución salina' },
  { key: 'tissue_expander', label: 'Expansor Tisular', category: 'expansión', material: 'Silicona + válvula' },
  { key: 'chin_implant', label: 'Implante de Mentón', category: 'facial', material: 'Silicona sólida / Medpor' },
  { key: 'malar_implant', label: 'Implante Malar', category: 'facial', material: 'Silicona sólida / Medpor' },
  { key: 'nasal_implant', label: 'Implante Nasal', category: 'facial', material: 'Silicona / Gore-Tex' },
] as const;
