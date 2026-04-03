/**
 * @file overrides/cirugia-estetica.ts
 * @description Override de configuración para Cirugía Estética.
 *
 * Módulos especializados: gestión de fotos antes/después,
 * registro de procedimientos (rinoplastia, liposucción, etc.),
 * encuestas de satisfacción, seguimiento de fillers/toxina botulínica.
 *
 * También exporta constantes de dominio: tipos de procedimientos estéticos,
 * escalas de satisfacción, zonas de aplicación de toxina/fillers.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Estética.
 * Especialidad centrada en procedimientos estéticos quirúrgicos y no quirúrgicos.
 */
export const cirugiaEsteticaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-estetica',
  dashboardPath: '/dashboard/medico/cirugia-estetica',

  modules: {
    clinical: [
      {
        key: 'cirestet-consulta',
        label: 'Consulta de Cirugía Estética',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-estetica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'patient_satisfaction'],
      },
      {
        key: 'cirestet-foto-before-after',
        label: 'Gestión de Fotos Antes/Después',
        icon: 'Camera',
        route: '/dashboard/medico/cirugia-estetica/foto-before-after',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Fotografía estandarizada, comparación, galería de resultados, consentimiento de imagen',
      },
      {
        key: 'cirestet-procedimientos',
        label: 'Registro de Procedimientos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-estetica/procedimientos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Rinoplastia, liposucción, abdominoplastia, blefaroplastia, lifting, etc.',
      },
      {
        key: 'cirestet-encuestas',
        label: 'Encuestas de Satisfacción',
        icon: 'MessageSquare',
        route: '/dashboard/medico/cirugia-estetica/encuestas',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Encuestas pre/post, expectativas vs resultados, NPS estético',
        kpiKeys: ['patient_satisfaction'],
      },
      {
        key: 'cirestet-fillers-toxina',
        label: 'Fillers y Toxina Botulínica',
        icon: 'Syringe',
        route: '/dashboard/medico/cirugia-estetica/fillers-toxina',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Tracking de productos, zonas de aplicación, unidades, lotes, recitaciones',
      },
      {
        key: 'cirestet-scoring',
        label: 'Scoring Estético',
        icon: 'Star',
        route: '/dashboard/medico/cirugia-estetica/scoring',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Escalas de armonía facial, proporción áurea, simetría, resultado global',
        kpiKeys: ['aesthetic_score_avg'],
      },
    ],

    lab: [
      {
        key: 'cirestet-preoperatorios',
        label: 'Exámenes Preoperatorios',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-estetica/preoperatorios',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirestet-imagenologia',
        label: 'Imagenología Estética',
        icon: 'Image',
        route: '/dashboard/medico/cirugia-estetica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Simulación 3D, fotografía estandarizada, planificación digital',
      },
    ],

    technology: [
      {
        key: 'cirestet-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-estetica/quirofano',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirestet-simulacion',
        label: 'Simulación de Resultados',
        icon: 'Monitor',
        route: '/dashboard/medico/cirugia-estetica/simulacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Simulación digital de resultados para expectativa del paciente',
      },
    ],

    communication: [
      {
        key: 'cirestet-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/cirugia-estetica/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'cirestet-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-estetica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirestet-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-estetica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'before-after-gallery',
      component: '@/components/dashboard/medico/cirugia-estetica/widgets/before-after-gallery-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'satisfaction-surveys',
      component: '@/components/dashboard/medico/cirugia-estetica/widgets/satisfaction-surveys-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'filler-toxin-tracker',
      component: '@/components/dashboard/medico/cirugia-estetica/widgets/filler-toxin-tracker-widget',
      size: 'medium',
    },
    {
      key: 'procedure-registry',
      component: '@/components/dashboard/medico/cirugia-estetica/widgets/procedure-registry-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'patient_satisfaction',
    'revision_rate',
    'aesthetic_score_avg',
    'filler_toxin_volume',
    'complication_rate',
    'conversion_rate',
  ],

  kpiDefinitions: {
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    revision_rate: {
      label: 'Tasa de Revisión',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    aesthetic_score_avg: {
      label: 'Score Estético Promedio',
      format: 'number',
      goal: 8.5,
      direction: 'higher_is_better',
    },
    filler_toxin_volume: {
      label: 'Volumen de Fillers/Toxina Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    conversion_rate: {
      label: 'Tasa de Conversión Consulta→Procedimiento',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'evaluacion_estetica',
      'sesion_fillers',
      'sesion_toxina',
      'pre_quirurgica',
      'post_quirurgica',
      'documentacion_fotografica',
      'revision',
      'control_resultado',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_estetica',
      'evaluacion_estetica',
      'consentimiento_informado',
      'informe_operatorio',
      'registro_fillers_toxina',
      'encuesta_satisfaccion',
      'documentacion_fotografica',
      'plan_tratamiento_estetico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresBeforeAfterPhotos: true,
      supportsFillerTracking: true,
      supportsToxinTracking: true,
      requiresSatisfactionSurveys: true,
      supports3DSimulation: true,
      tracksProductLots: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Smile',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO CIRUGÍA ESTÉTICA
// ============================================================================

/**
 * Procedimientos estéticos quirúrgicos comunes
 */
export const AESTHETIC_SURGICAL_PROCEDURES = [
  { key: 'rhinoplasty', label: 'Rinoplastia', category: 'facial', avgDuration: '2-3 horas' },
  { key: 'blepharoplasty', label: 'Blefaroplastia', category: 'facial', avgDuration: '1-2 horas' },
  { key: 'rhytidectomy', label: 'Lifting Facial (Ritidectomía)', category: 'facial', avgDuration: '3-5 horas' },
  { key: 'otoplasty', label: 'Otoplastia', category: 'facial', avgDuration: '1-2 horas' },
  { key: 'liposuction', label: 'Liposucción', category: 'corporal', avgDuration: '1-3 horas' },
  { key: 'abdominoplasty', label: 'Abdominoplastia', category: 'corporal', avgDuration: '2-4 horas' },
  { key: 'breast_augmentation', label: 'Aumento Mamario', category: 'mamario', avgDuration: '1-2 horas' },
  { key: 'breast_reduction', label: 'Reducción Mamaria', category: 'mamario', avgDuration: '2-3 horas' },
  { key: 'mastopexy', label: 'Mastopexia (Lifting Mamario)', category: 'mamario', avgDuration: '2-3 horas' },
  { key: 'brachioplasty', label: 'Braquioplastia', category: 'corporal', avgDuration: '1-2 horas' },
] as const;

/**
 * Zonas de aplicación de toxina botulínica
 */
export const BOTOX_ZONES = [
  { key: 'forehead', label: 'Frente', typicalUnits: '10-30 U', muscles: 'Frontalis' },
  { key: 'glabella', label: 'Glabela (entrecejo)', typicalUnits: '15-25 U', muscles: 'Procerus, Corrugator' },
  { key: 'crows_feet', label: 'Patas de Gallo', typicalUnits: '6-15 U por lado', muscles: 'Orbicularis oculi' },
  { key: 'bunny_lines', label: 'Bunny Lines', typicalUnits: '5-10 U', muscles: 'Nasalis' },
  { key: 'lip_flip', label: 'Lip Flip', typicalUnits: '4-6 U', muscles: 'Orbicularis oris' },
  { key: 'masseter', label: 'Masetero', typicalUnits: '25-50 U por lado', muscles: 'Masseter' },
  { key: 'platysmal_bands', label: 'Bandas Platismales', typicalUnits: '20-40 U', muscles: 'Platysma' },
] as const;

/**
 * Tipos de filler más comunes
 */
export const FILLER_TYPES = [
  { key: 'ha_cross_linked', label: 'Ácido Hialurónico Reticulado', duration: '6-18 meses', reversible: true },
  { key: 'ha_non_cross_linked', label: 'Ácido Hialurónico No Reticulado', duration: '3-6 meses', reversible: true },
  { key: 'calcium_hydroxylapatite', label: 'Hidroxiapatita de Calcio (Radiesse)', duration: '12-18 meses', reversible: false },
  { key: 'poly_l_lactic_acid', label: 'Ácido Poli-L-Láctico (Sculptra)', duration: '18-24 meses', reversible: false },
  { key: 'pmma', label: 'Polimetilmetacrilato (PMMA)', duration: 'Permanente', reversible: false },
] as const;
