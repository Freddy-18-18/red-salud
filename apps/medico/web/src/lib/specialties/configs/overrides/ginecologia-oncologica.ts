/**
 * @file overrides/ginecologia-oncologica.ts
 * @description Override de configuración para Ginecología Oncológica.
 *
 * Manejo del cáncer ginecológico — estadificación FIGO, seguimiento
 * de CA-125, cirugía citorreductora, coordinación de quimioterapia,
 * consejería genética (BRCA), seguimiento de citología.
 *
 * También exporta constantes de dominio: estadificación FIGO,
 * seguimiento de CA-125, indicaciones de consejería genética.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Ginecología Oncológica.
 * Especialidad quirúrgica-oncológica del tracto reproductor femenino.
 */
export const ginecologiaOncologicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ginecologia-oncologica',
  dashboardPath: '/dashboard/medico/ginecologia-oncologica',

  modules: {
    clinical: [
      {
        key: 'ginonco-consulta',
        label: 'Consulta de Ginecología Oncológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/ginecologia-oncologica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación oncológica ginecológica, estadificación, plan terapéutico',
      },
      {
        key: 'ginonco-figo',
        label: 'Estadificación FIGO',
        icon: 'Layers',
        route: '/dashboard/medico/ginecologia-oncologica/figo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Estadificación FIGO por tipo de cáncer ginecológico',
      },
      {
        key: 'ginonco-ca125',
        label: 'Seguimiento CA-125',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ginecologia-oncologica/ca125',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['ca125_response_rate'],
        description: 'Tendencias de CA-125, respuesta GCIG, recaída bioquímica',
      },
      {
        key: 'ginonco-citorreduccion',
        label: 'Cirugía Citorreductora',
        icon: 'Scissors',
        route: '/dashboard/medico/ginecologia-oncologica/citorreduccion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['optimal_debulking_rate'],
        description: 'Debulking primario/intervalar, documentación de residuo tumoral',
      },
      {
        key: 'ginonco-quimioterapia',
        label: 'Coordinación de Quimioterapia',
        icon: 'FlaskConical',
        route: '/dashboard/medico/ginecologia-oncologica/quimioterapia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Esquemas QT neoadyuvante/adyuvante, IP, HIPEC',
      },
      {
        key: 'ginonco-genetica',
        label: 'Consejería Genética (BRCA)',
        icon: 'Dna',
        route: '/dashboard/medico/ginecologia-oncologica/genetica',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'BRCA1/2, Lynch, evaluación de riesgo hereditario, cirugía reductora de riesgo',
      },
      {
        key: 'ginonco-citologia',
        label: 'Seguimiento Citológico',
        icon: 'Microscope',
        route: '/dashboard/medico/ginecologia-oncologica/citologia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance'],
        description: 'Papanicolaou, VPH, colposcopía, seguimiento de displasia',
      },
    ],

    laboratory: [
      {
        key: 'ginonco-laboratorio',
        label: 'Panel de Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/ginecologia-oncologica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, hepático, renal, CA-125, HE4, CEA',
      },
      {
        key: 'ginonco-imagenologia',
        label: 'Imagenología Ginecológica',
        icon: 'Scan',
        route: '/dashboard/medico/ginecologia-oncologica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Ecografía transvaginal, TC, RM pélvica, PET-CT',
      },
      {
        key: 'ginonco-patologia',
        label: 'Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/ginecologia-oncologica/patologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Histopatología, inmunohistoquímica, genómica tumoral',
      },
    ],

    financial: [
      {
        key: 'ginonco-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/ginecologia-oncologica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'ginonco-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/ginecologia-oncologica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'ginonco-calculadoras',
        label: 'Calculadoras Oncológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/ginecologia-oncologica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'RMI (Risk of Malignancy Index), ROMA, IOTA, BSA',
      },
      {
        key: 'ginonco-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/ginecologia-oncologica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'NCCN, ESGO, SGO, FIGO — guías oncológicas ginecológicas',
      },
    ],

    communication: [
      {
        key: 'ginonco-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/ginecologia-oncologica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'ginonco-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/ginecologia-oncologica/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'ginonco-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ginecologia-oncologica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ca125-trends',
      component: '@/components/dashboard/medico/ginecologia-oncologica/widgets/ca125-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'figo-staging',
      component: '@/components/dashboard/medico/ginecologia-oncologica/widgets/figo-staging-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'screening-followup',
      component: '@/components/dashboard/medico/ginecologia-oncologica/widgets/screening-followup-widget',
      size: 'medium',
    },
    {
      key: 'genetic-counseling-pending',
      component: '@/components/dashboard/medico/ginecologia-oncologica/widgets/genetic-counseling-pending-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'optimal_debulking_rate',
    'ca125_response_rate',
    'screening_compliance',
    'genetic_counseling_rate',
    'chemo_completion_rate',
    'five_year_survival',
  ],

  kpiDefinitions: {
    optimal_debulking_rate: {
      label: 'Tasa de Citorreducción Óptima (< 1 cm)',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    ca125_response_rate: {
      label: 'Respuesta CA-125 (GCIG)',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    screening_compliance: {
      label: 'Adherencia a Tamizaje Citológico',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    genetic_counseling_rate: {
      label: '% Pacientes con Consejería Genética',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    chemo_completion_rate: {
      label: 'Tasa de Completación de QT',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    five_year_survival: {
      label: 'Supervivencia a 5 Años',
      format: 'percentage',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_masa_pelvica',
      'resultado_patologia',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento_qt',
      'consejeria_genetica',
      'control_citologico',
      'segunda_opinion',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_oncologica_ginecologica',
      'estadificacion_figo',
      'nota_operatoria_citorreduccion',
      'protocolo_quimioterapia',
      'seguimiento_ca125',
      'consejeria_genetica_brca',
      'seguimiento_citologico',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresFIGOStaging: true,
      tracksCA125Trends: true,
      tracksSurgicalDebulking: true,
      coordinatesChemotherapy: true,
      requiresGeneticCounseling: true,
      tracksCytologyFollowup: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — GINECOLOGÍA ONCOLÓGICA
// ============================================================================

/**
 * Estadificación FIGO simplificada — Cáncer de Ovario (2014).
 */
export const FIGO_STAGING_OVARIAN = [
  { stage: 'I', label: 'Estadio I', description: 'Tumor limitado a los ovarios' },
  { stage: 'IA', label: 'Estadio IA', description: 'Un ovario, cápsula íntegra, citología peritoneal negativa' },
  { stage: 'IB', label: 'Estadio IB', description: 'Ambos ovarios, cápsulas íntegras, citología negativa' },
  { stage: 'IC', label: 'Estadio IC', description: 'Ruptura capsular, tumor en superficie, o citología positiva' },
  { stage: 'II', label: 'Estadio II', description: 'Extensión pélvica' },
  { stage: 'IIA', label: 'Estadio IIA', description: 'Extensión a útero y/o trompas' },
  { stage: 'IIB', label: 'Estadio IIB', description: 'Extensión a otros tejidos pélvicos' },
  { stage: 'III', label: 'Estadio III', description: 'Implantes peritoneales fuera de pelvis y/o ganglios retroperitoneales' },
  { stage: 'IIIA', label: 'Estadio IIIA', description: 'Metástasis microscópicas peritoneales fuera de pelvis' },
  { stage: 'IIIB', label: 'Estadio IIIB', description: 'Implantes peritoneales ≤ 2 cm fuera de pelvis' },
  { stage: 'IIIC', label: 'Estadio IIIC', description: 'Implantes > 2 cm y/o ganglios retroperitoneales/inguinales' },
  { stage: 'IV', label: 'Estadio IV', description: 'Metástasis a distancia (excluye metástasis peritoneales)' },
  { stage: 'IVA', label: 'Estadio IVA', description: 'Derrame pleural con citología positiva' },
  { stage: 'IVB', label: 'Estadio IVB', description: 'Metástasis parenquimatosas y metástasis extraabdominales' },
] as const;

/**
 * Criterios de respuesta CA-125 (GCIG).
 */
export const CA125_RESPONSE_CRITERIA = {
  response: {
    label: 'Respuesta',
    criteria: 'Disminución ≥ 50% del valor basal, mantenida ≥ 28 días',
  },
  progression: {
    label: 'Progresión',
    criteria: 'Aumento ≥ 2x del nadir (si normalizado) o ≥ 2x del límite superior normal (si nunca normalizado)',
  },
  normalReference: {
    label: 'Valor Normal',
    value: '< 35 U/mL',
  },
} as const;

/**
 * Indicaciones de consejería genética en cáncer ginecológico.
 */
export const GENETIC_COUNSELING_INDICATIONS = [
  { indication: 'Cáncer de ovario epitelial (cualquier edad)', genes: ['BRCA1', 'BRCA2'] },
  { indication: 'Cáncer de endometrio < 50 años', genes: ['MLH1', 'MSH2', 'MSH6', 'PMS2'] },
  { indication: 'Antecedente familiar de cáncer de mama/ovario', genes: ['BRCA1', 'BRCA2'] },
  { indication: 'Cáncer de ovario seroso de alto grado', genes: ['BRCA1', 'BRCA2', 'RAD51C', 'RAD51D'] },
  { indication: 'Múltiples tumores primarios', genes: ['Panel multigénico'] },
  { indication: 'Ascendencia judía Ashkenazi', genes: ['BRCA1', 'BRCA2'] },
] as const;
