/**
 * @file overrides/mastologia.ts
 * @description Override de configuración para Mastología (Cirugía de Mama).
 *
 * Manejo integral de patología mamaria — detección temprana, clasificación
 * BI-RADS, seguimiento de biopsias, planificación quirúrgica
 * (lumpectomía/mastectomía), coordinación de reconstrucción,
 * seguimiento de ganglio centinela.
 *
 * También exporta constantes de dominio: clasificación BI-RADS,
 * tipos de biopsia mamaria, opciones quirúrgicas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Mastología.
 * Especialidad quirúrgica con énfasis en detección temprana y cirugía oncológica mamaria.
 */
export const mastologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'mastologia',
  dashboardPath: '/dashboard/medico/mastologia',

  modules: {
    clinical: [
      {
        key: 'masto-consulta',
        label: 'Consulta de Mastología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/mastologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Examen mamario, antecedentes, evaluación de riesgo',
      },
      {
        key: 'masto-mamografia',
        label: 'Seguimiento de Mamografías',
        icon: 'Scan',
        route: '/dashboard/medico/mastologia/mamografia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['early_detection_rate'],
        description: 'Mamografía digital, tomosíntesis, programa de tamizaje',
      },
      {
        key: 'masto-birads',
        label: 'Clasificación BI-RADS',
        icon: 'Layers',
        route: '/dashboard/medico/mastologia/birads',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'BI-RADS 0-6, seguimiento según categoría, correlación imagen-patología',
      },
      {
        key: 'masto-biopsia',
        label: 'Resultados de Biopsia',
        icon: 'Microscope',
        route: '/dashboard/medico/mastologia/biopsia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Core biopsy, PAAF, biopsia excisional, inmunohistoquímica',
      },
      {
        key: 'masto-planificacion-qx',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/mastologia/planificacion-qx',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['surgical_margin_rate'],
        description: 'Lumpectomía, mastectomía, ganglio centinela, vaciamiento axilar',
      },
      {
        key: 'masto-reconstruccion',
        label: 'Coordinación de Reconstrucción',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/mastologia/reconstruccion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['reconstruction_satisfaction'],
        description: 'Reconstrucción inmediata/diferida, implantes, colgajos, expansores',
      },
      {
        key: 'masto-ganglio-centinela',
        label: 'Ganglio Centinela',
        icon: 'CircleDot',
        route: '/dashboard/medico/mastologia/ganglio-centinela',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'BSGC, linfogammagrafía, resultado intraoperatorio, vaciamiento',
      },
    ],

    laboratory: [
      {
        key: 'masto-laboratorio',
        label: 'Panel de Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/mastologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, hepático, marcadores tumorales (CA 15-3, CEA)',
      },
      {
        key: 'masto-imagenologia',
        label: 'Imagenología Mamaria',
        icon: 'Scan',
        route: '/dashboard/medico/mastologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Mamografía, ecografía mamaria, RM de mama, PET-CT',
      },
      {
        key: 'masto-patologia',
        label: 'Patología y Molecular',
        icon: 'Microscope',
        route: '/dashboard/medico/mastologia/patologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'RE, RP, HER2, Ki-67, Oncotype DX, MammaPrint',
      },
    ],

    financial: [
      {
        key: 'masto-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/mastologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'masto-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/mastologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'masto-calculadoras',
        label: 'Calculadoras de Riesgo',
        icon: 'Calculator',
        route: '/dashboard/medico/mastologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Gail, Tyrer-Cuzick, BCRAT, Nottingham Prognosis Index',
      },
      {
        key: 'masto-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/mastologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'NCCN, St. Gallen, ASCO/CAP — guías de mama',
      },
    ],

    communication: [
      {
        key: 'masto-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/mastologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'masto-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/mastologia/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'masto-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/mastologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'birads-tracker',
      component: '@/components/dashboard/medico/mastologia/widgets/birads-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'biopsy-results',
      component: '@/components/dashboard/medico/mastologia/widgets/biopsy-results-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'surgical-planning',
      component: '@/components/dashboard/medico/mastologia/widgets/surgical-planning-widget',
      size: 'medium',
    },
    {
      key: 'screening-schedule',
      component: '@/components/dashboard/medico/mastologia/widgets/screening-schedule-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'early_detection_rate',
    'surgical_margin_rate',
    'reconstruction_satisfaction',
    'sentinel_node_identification',
    'screening_compliance',
    'birads_followup_adherence',
  ],

  kpiDefinitions: {
    early_detection_rate: {
      label: 'Tasa de Detección Temprana',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    surgical_margin_rate: {
      label: 'Márgenes Quirúrgicos Negativos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    reconstruction_satisfaction: {
      label: 'Satisfacción con Reconstrucción',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    sentinel_node_identification: {
      label: 'Tasa de Identificación de Ganglio Centinela',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    screening_compliance: {
      label: 'Adherencia a Tamizaje',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    birads_followup_adherence: {
      label: 'Adherencia a Seguimiento BI-RADS',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'tamizaje_mamografico',
      'resultado_biopsia',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento_oncologico',
      'consulta_reconstruccion',
      'segunda_opinion',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'examen_mamario_clinico',
      'evaluacion_riesgo_mama',
      'informe_biopsia_mama',
      'planificacion_quirurgica_mama',
      'nota_operatoria_mama',
      'seguimiento_postquirurgico',
      'evaluacion_reconstruccion',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksMammographyScreening: true,
      requiresBIRADSClassification: true,
      tracksBreastBiopsies: true,
      requiresSurgicalPlanning: true,
      tracksSentinelNode: true,
      coordinatesReconstruction: true,
      supportsGeneticCounseling: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Heart',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MASTOLOGÍA
// ============================================================================

/**
 * Clasificación BI-RADS (Breast Imaging Reporting and Data System).
 */
export const BIRADS_CLASSIFICATION = [
  { category: 0, label: 'BI-RADS 0', description: 'Evaluación incompleta — necesita imágenes adicionales', action: 'Completar evaluación', malignancyRisk: 'N/A' },
  { category: 1, label: 'BI-RADS 1', description: 'Negativo — hallazgo normal', action: 'Tamizaje de rutina', malignancyRisk: '0%' },
  { category: 2, label: 'BI-RADS 2', description: 'Hallazgo benigno', action: 'Tamizaje de rutina', malignancyRisk: '0%' },
  { category: 3, label: 'BI-RADS 3', description: 'Hallazgo probablemente benigno', action: 'Seguimiento a corto plazo (6 meses)', malignancyRisk: '< 2%' },
  { category: 4, label: 'BI-RADS 4', description: 'Anomalía sospechosa', action: 'Biopsia recomendada', malignancyRisk: '2-95%' },
  { category: 5, label: 'BI-RADS 5', description: 'Altamente sugestivo de malignidad', action: 'Biopsia obligatoria', malignancyRisk: '> 95%' },
  { category: 6, label: 'BI-RADS 6', description: 'Malignidad confirmada por biopsia', action: 'Tratamiento oncológico', malignancyRisk: '100%' },
] as const;

/**
 * Tipos de biopsia mamaria.
 */
export const BREAST_BIOPSY_TYPES = [
  { key: 'paaf', label: 'PAAF (Punción Aspirativa con Aguja Fina)', invasiveness: 'mínima', guidanceRequired: 'ecográfica' },
  { key: 'core_biopsy', label: 'Core Biopsy (Tru-Cut)', invasiveness: 'mínima', guidanceRequired: 'ecográfica/estereotáxica' },
  { key: 'vacuum_assisted', label: 'Biopsia Asistida por Vacío (Mammotome)', invasiveness: 'mínima', guidanceRequired: 'estereotáxica/RM' },
  { key: 'excisional', label: 'Biopsia Excisional', invasiveness: 'quirúrgica', guidanceRequired: 'marcaje previo si no palpable' },
  { key: 'incisional', label: 'Biopsia Incisional', invasiveness: 'quirúrgica', guidanceRequired: 'directa' },
] as const;

/**
 * Opciones quirúrgicas en mastología.
 */
export const SURGICAL_OPTIONS = [
  { key: 'lumpectomy', label: 'Lumpectomía (Cirugía Conservadora)', description: 'Resección del tumor con margen de tejido sano' },
  { key: 'mastectomy_simple', label: 'Mastectomía Simple', description: 'Resección completa de la mama sin vaciamiento axilar' },
  { key: 'mastectomy_modified_radical', label: 'Mastectomía Radical Modificada', description: 'Mastectomía + vaciamiento axilar niveles I-II' },
  { key: 'skin_sparing_mastectomy', label: 'Mastectomía Preservadora de Piel', description: 'Preserva piel para reconstrucción inmediata' },
  { key: 'nipple_sparing_mastectomy', label: 'Mastectomía Preservadora de Pezón', description: 'Preserva piel y complejo areola-pezón' },
  { key: 'sentinel_node_biopsy', label: 'Biopsia de Ganglio Centinela', description: 'Identificación y resección del primer ganglio de drenaje' },
  { key: 'axillary_dissection', label: 'Vaciamiento Axilar', description: 'Resección de ganglios axilares niveles I-III' },
] as const;
