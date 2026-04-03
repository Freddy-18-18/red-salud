/**
 * @file overrides/cirugia-cabeza-cuello.ts
 * @description Override de configuración para Cirugía de Cabeza y Cuello.
 *
 * Módulos especializados: mapeo tumoral, manejo de vía aérea, planificación
 * de reconstrucción, evaluación de habla/deglución, coordinación con
 * radioterapia.
 *
 * KPIs: márgenes quirúrgicos, resultados funcionales, éxito de reconstrucción.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía de Cabeza y Cuello.
 * Especialidad quirúrgica con énfasis en preservación funcional,
 * reconstrucción y coordinación multidisciplinaria oncológica.
 */
export const cirugiaCabezaCuelloOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-cabeza-cuello',
  dashboardPath: '/dashboard/medico/cirugia-cabeza-cuello',

  modules: {
    clinical: [
      {
        key: 'circabeza-consulta',
        label: 'Consulta Cabeza y Cuello',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-cabeza-cuello/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'circabeza-mapeo-tumoral',
        label: 'Mapeo Tumoral',
        icon: 'Map',
        route: '/dashboard/medico/cirugia-cabeza-cuello/mapeo-tumoral',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Localización, extensión, relaciones anatómicas del tumor',
      },
      {
        key: 'circabeza-via-aerea',
        label: 'Manejo de Vía Aérea',
        icon: 'Wind',
        route: '/dashboard/medico/cirugia-cabeza-cuello/via-aerea',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Traqueostomía, intubación difícil, obstrucción, planificación',
      },
      {
        key: 'circabeza-reconstruccion',
        label: 'Planificación Reconstructiva',
        icon: 'Puzzle',
        route: '/dashboard/medico/cirugia-cabeza-cuello/reconstruccion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Colgajos libres, colgajos pediculados, injertos, prótesis',
      },
      {
        key: 'circabeza-habla-deglucion',
        label: 'Evaluación Habla / Deglución',
        icon: 'MessageCircle',
        route: '/dashboard/medico/cirugia-cabeza-cuello/habla-deglucion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Videofluoroscopia, evaluación fonoaudiológica, calidad de voz',
      },
      {
        key: 'circabeza-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-cabeza-cuello/nota-operatoria',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'circabeza-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-cabeza-cuello/postop',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Evolución de colgajo, función deglutoria, estoma, nutrición',
      },
    ],

    lab: [
      {
        key: 'circabeza-patologia',
        label: 'Resultados de Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-cabeza-cuello/patologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Biopsias, cortes por congelación, márgenes, HPV status',
      },
      {
        key: 'circabeza-imagenologia',
        label: 'Imagenología de Cabeza y Cuello',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-cabeza-cuello/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'TC, RMN, PET-CT, ecografía de cuello',
      },
      {
        key: 'circabeza-endoscopia',
        label: 'Endoscopia de Cabeza y Cuello',
        icon: 'Eye',
        route: '/dashboard/medico/cirugia-cabeza-cuello/endoscopia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Nasofibrolaringoscopia, panendoscopia, NBI',
      },
    ],

    technology: [
      {
        key: 'circabeza-calculadoras',
        label: 'Calculadoras y Escalas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-cabeza-cuello/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Performance Status, MDADI, VHI, UW-QOL',
      },
      {
        key: 'circabeza-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-cabeza-cuello/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'circabeza-multidisciplinario',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-cabeza-cuello/multidisciplinario',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Oncología, radioterapia, fonoaudiología, nutrición, odontología',
      },
      {
        key: 'circabeza-radioterapia',
        label: 'Coordinación con Radioterapia',
        icon: 'Zap',
        route: '/dashboard/medico/cirugia-cabeza-cuello/radioterapia',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
        description: 'Timing post-quirúrgico, campos de radiación, toxicidad',
      },
      {
        key: 'circabeza-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-cabeza-cuello/consentimiento',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'circabeza-analytics',
        label: 'Análisis de Resultados',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-cabeza-cuello/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgical-margins',
      component: '@/components/dashboard/medico/cirugia-cabeza-cuello/widgets/surgical-margins-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'functional-outcomes',
      component: '@/components/dashboard/medico/cirugia-cabeza-cuello/widgets/functional-outcomes-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'reconstruction-tracker',
      component: '@/components/dashboard/medico/cirugia-cabeza-cuello/widgets/reconstruction-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-cabeza-cuello/widgets/upcoming-surgeries-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'positive_margin_rate',
    'functional_outcome_score',
    'reconstruction_success_rate',
    'speech_recovery_rate',
    'swallow_function_rate',
    'flap_survival_rate',
  ],

  kpiDefinitions: {
    positive_margin_rate: {
      label: 'Tasa de Márgenes Positivos',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    functional_outcome_score: {
      label: 'Score de Resultado Funcional (UW-QOL)',
      format: 'number',
      direction: 'higher_is_better',
    },
    reconstruction_success_rate: {
      label: 'Tasa de Éxito Reconstructivo',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    speech_recovery_rate: {
      label: 'Recuperación del Habla',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    swallow_function_rate: {
      label: 'Recuperación de Deglución',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    flap_survival_rate: {
      label: 'Sobrevida de Colgajos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'evaluacion_habla',
      'evaluacion_deglucion',
      'seguimiento_colgajo',
      'seguimiento_oncologico',
      'curacion_estoma',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_cabeza_cuello',
      'mapeo_tumoral',
      'plan_reconstructivo',
      'nota_operatoria',
      'evaluacion_habla_deglucion',
      'seguimiento_colgajo',
      'coordinacion_radioterapia',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresTumorMapping: true,
      tracksAirwayManagement: true,
      tracksReconstructionOutcomes: true,
      tracksSpeechSwallowFunction: true,
      coordinatesRadiotherapy: true,
      tracksFlapViability: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'User',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA DE CABEZA Y CUELLO
// ============================================================================

/**
 * Subsitios tumorales de cabeza y cuello.
 */
export const HEAD_NECK_TUMOR_SUBSITES = [
  { region: 'oral_cavity', label: 'Cavidad Oral', subsites: ['Lengua oral', 'Piso de boca', 'Encía', 'Mucosa bucal', 'Paladar duro', 'Labio', 'Trígono retromolar'] },
  { region: 'oropharynx', label: 'Orofaringe', subsites: ['Base de lengua', 'Amígdala', 'Paladar blando', 'Pared faríngea posterior'] },
  { region: 'hypopharynx', label: 'Hipofaringe', subsites: ['Seno piriforme', 'Pared faríngea posterior', 'Área postcricoidea'] },
  { region: 'larynx', label: 'Laringe', subsites: ['Supraglotis', 'Glotis', 'Subglotis'] },
  { region: 'nasopharynx', label: 'Nasofaringe', subsites: ['Pared posterosuperior', 'Pared lateral', 'Pared inferior'] },
  { region: 'sinonasal', label: 'Senos Paranasales', subsites: ['Seno maxilar', 'Seno etmoidal', 'Cavidad nasal'] },
  { region: 'salivary_glands', label: 'Glándulas Salivales', subsites: ['Parótida', 'Submandibular', 'Sublingual', 'Menores'] },
  { region: 'thyroid', label: 'Tiroides', subsites: ['Papilar', 'Folicular', 'Medular', 'Anaplásico'] },
] as const;

/**
 * Tipos de colgajos reconstructivos usados en cabeza y cuello.
 */
export const RECONSTRUCTION_FLAP_TYPES = [
  { key: 'radial_forearm', label: 'Colgajo Libre Radial de Antebrazo', type: 'Libre fasciocutáneo', indication: 'Cavidad oral, orofaringe, defectos de espesor parcial' },
  { key: 'fibula', label: 'Colgajo Libre de Peroné', type: 'Libre osteocutáneo', indication: 'Mandíbula, maxilar — reconstrucción ósea con piel' },
  { key: 'anterolateral_thigh', label: 'Colgajo Anterolateral de Muslo (ALT)', type: 'Libre fasciocutáneo', indication: 'Defectos grandes de cavidad oral, faringe, cuero cabelludo' },
  { key: 'pectoralis', label: 'Colgajo de Pectoral Mayor', type: 'Pediculado miocutáneo', indication: 'Rescate, defectos de hipofaringe, cobertura cervical' },
  { key: 'supraclavicular', label: 'Colgajo Supraclavicular', type: 'Pediculado fasciocutáneo', indication: 'Defectos de cavidad oral, cuello, alternativa a colgajo libre' },
  { key: 'scapula', label: 'Colgajo Libre Escapular', type: 'Libre osteocutáneo', indication: 'Defectos compuestos maxilofaciales complejos' },
] as const;
