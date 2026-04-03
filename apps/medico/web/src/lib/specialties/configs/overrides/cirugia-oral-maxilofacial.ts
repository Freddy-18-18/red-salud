/**
 * @file overrides/cirugia-oral-maxilofacial.ts
 * @description Override de configuración para Cirugía Oral y Maxilofacial.
 *
 * Módulos especializados: evaluación de terceros molares, planificación ortognática,
 * clasificación de fracturas (Le Fort), evaluación de ATM, estadificación de
 * tumores, manejo de fisuras labiopalatinas.
 *
 * También exporta constantes de dominio: clasificación de Le Fort,
 * clasificación de terceros molares, tipos de cirugía ortognática.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Oral y Maxilofacial.
 * Especialidad odontológica quirúrgica del complejo maxilofacial.
 */
export const cirugiaOralMaxilofacialOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-oral-maxilofacial',
  dashboardPath: '/dashboard/medico/cirugia-oral-maxilofacial',

  modules: {
    clinical: [
      {
        key: 'dental-oral-terceros-molares',
        label: 'Terceros Molares',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/terceros-molares',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes', 'infection_rate'],
        description: 'Evaluación y planificación de extracción de cordales',
      },
      {
        key: 'dental-oral-ortognatica',
        label: 'Cirugía Ortognática',
        icon: 'Move',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/ortognatica',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Osteotomía Le Fort I, BSSO, genioplastia',
      },
      {
        key: 'dental-oral-fracturas',
        label: 'Fracturas Maxilofaciales',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/fracturas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Clasificación Le Fort, fracturas mandibulares, zigomáticas',
      },
      {
        key: 'dental-oral-atm',
        label: 'ATM (Articulación Temporomandibular)',
        icon: 'CircleDot',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/atm',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dental-oral-tumores',
        label: 'Patología Tumoral',
        icon: 'Search',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/tumores',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Estadificación, biopsia, resección, reconstrucción',
      },
      {
        key: 'dental-oral-fisuras',
        label: 'Fisura Labiopalatina',
        icon: 'Heart',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/fisuras',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['functional_recovery'],
        description: 'Manejo multidisciplinario de hendiduras orofaciales',
      },
    ],

    lab: [
      {
        key: 'dental-oral-imagenologia',
        label: 'Imagenología Maxilofacial',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'CBCT, CT, reconstrucción 3D, planificación virtual',
      },
      {
        key: 'dental-oral-histopatologia',
        label: 'Histopatología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/histopatologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dental-oral-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/quirofano',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Planificación 3D, guías quirúrgicas, placas a medida',
      },
    ],

    communication: [
      {
        key: 'dental-oral-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-oral-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/cirugia-oral-maxilofacial/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgical-queue',
      component: '@/components/dashboard/medico/cirugia-oral-maxilofacial/widgets/surgical-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'fracture-registry',
      component: '@/components/dashboard/medico/cirugia-oral-maxilofacial/widgets/fracture-registry-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'post-op-followup',
      component: '@/components/dashboard/medico/cirugia-oral-maxilofacial/widgets/post-op-followup-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'surgical_outcomes',
    'infection_rate',
    'functional_recovery',
    'reoperation_rate',
    'avg_surgical_time',
  ],

  kpiDefinitions: {
    surgical_outcomes: {
      label: 'Resultados Quirúrgicos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    infection_rate: {
      label: 'Tasa de Infección',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    functional_recovery: {
      label: 'Recuperación Funcional',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    reoperation_rate: {
      label: 'Tasa de Reoperación',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    avg_surgical_time: {
      label: 'Tiempo Quirúrgico Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_maxilofacial',
      'extraccion_terceros_molares',
      'cirugia_ortognatica',
      'reduccion_fractura',
      'biopsia_oral',
      'evaluacion_atm',
      'cirugia_labio_paladar',
      'control_postoperatorio',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_maxilofacial',
      'informe_quirurgico',
      'clasificacion_fractura',
      'planificacion_ortognatica',
      'informe_histopatologico',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresSurgicalPlanning: true,
      supportsFractureClassification: true,
      tracksOrthognathicPlanning: true,
      supportsTMJEvaluation: true,
      requiresTumorStaging: true,
      usesCleftManagement: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'Scissors',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO CIRUGÍA ORAL Y MAXILOFACIAL
// ============================================================================

/**
 * Clasificación de fracturas maxilares de Le Fort
 */
export const LE_FORT_CLASSIFICATION = [
  { type: 'I', label: 'Le Fort I (Guérin)', description: 'Fractura transversal del maxilar por encima de los ápices dentales', line: 'Separa paladar y proceso alveolar del maxilar' },
  { type: 'II', label: 'Le Fort II (Piramidal)', description: 'Fractura piramidal que incluye huesos nasales y piso de órbita', line: 'Triángulo nasomaxilar, sutura frontomaxilar a reborde infraorbitario' },
  { type: 'III', label: 'Le Fort III (Disyunción craneofacial)', description: 'Separación completa del macizo facial del cráneo', line: 'A través de suturas frontocigomática, frontonasal y piso de órbita' },
] as const;

/**
 * Clasificación de terceros molares (Pell & Gregory + Winter)
 */
export const THIRD_MOLAR_CLASSIFICATION = {
  pellGregory: {
    depth: [
      { class: 'A', label: 'Nivel A', description: 'Plano oclusal al mismo nivel que el segundo molar' },
      { class: 'B', label: 'Nivel B', description: 'Plano oclusal entre el plano oclusal y la línea cervical del segundo molar' },
      { class: 'C', label: 'Nivel C', description: 'Plano oclusal por debajo de la línea cervical del segundo molar' },
    ],
    ramusRelation: [
      { class: 'I', label: 'Clase I', description: 'Espacio suficiente entre rama y segundo molar' },
      { class: 'II', label: 'Clase II', description: 'Espacio menor que el diámetro mesiodistal del tercer molar' },
      { class: 'III', label: 'Clase III', description: 'Tercer molar totalmente dentro de la rama' },
    ],
  },
  winterAngulation: [
    { type: 'vertical', label: 'Vertical', description: 'Eje longitudinal paralelo al segundo molar' },
    { type: 'mesioangular', label: 'Mesioangulado', description: 'Inclinado hacia mesial (más común)' },
    { type: 'distoangular', label: 'Distoangulado', description: 'Inclinado hacia distal' },
    { type: 'horizontal', label: 'Horizontal', description: 'Eje perpendicular al segundo molar' },
    { type: 'inverted', label: 'Invertido', description: 'Corona hacia basal mandibular' },
  ],
} as const;
