/**
 * @file overrides/endoscopia-digestiva.ts
 * @description Override de configuración para Endoscopía Digestiva.
 *
 * Especialidad centrada en procedimientos — programación de endoscopías,
 * registros de sedación, seguimiento de biopsias, registro de pólipos,
 * logs de complicaciones y tracking de ADR (Adenoma Detection Rate).
 *
 * También exporta constantes de dominio: clasificaciones de pólipos,
 * scores de preparación, parámetros de sedación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Endoscopía Digestiva.
 * Especialidad centrada en procedimientos endoscópicos.
 */
export const endoscopiaDigestivaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'endoscopia-digestiva',
  dashboardPath: '/dashboard/medico/endoscopia-digestiva',

  modules: {
    clinical: [
      {
        key: 'endosc-programacion',
        label: 'Programación de Procedimientos',
        icon: 'Calendar',
        route: '/dashboard/medico/endoscopia-digestiva/programacion',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['procedures_per_day'],
        description: 'Agenda de EGD, colonoscopías, CPRE, ecoendoscopía',
      },
      {
        key: 'endosc-sedacion',
        label: 'Registros de Sedación',
        icon: 'Syringe',
        route: '/dashboard/medico/endoscopia-digestiva/sedacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Propofol, midazolam, fentanilo — dosis, ASA, monitoreo',
      },
      {
        key: 'endosc-hallazgos',
        label: 'Informe Endoscópico',
        icon: 'FileText',
        route: '/dashboard/medico/endoscopia-digestiva/hallazgos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Hallazgos, fotos, videos, clasificaciones endoscópicas',
      },
      {
        key: 'endosc-biopsias',
        label: 'Seguimiento de Biopsias',
        icon: 'Microscope',
        route: '/dashboard/medico/endoscopia-digestiva/biopsias',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Registro de muestras, resultados histológicos, correlación',
      },
      {
        key: 'endosc-polipos',
        label: 'Registro de Pólipos',
        icon: 'CircleDot',
        route: '/dashboard/medico/endoscopia-digestiva/polipos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['adenoma_detection_rate'],
        description: 'ADR, tamaño, morfología (París), histología, vigilancia',
      },
      {
        key: 'endosc-complicaciones',
        label: 'Log de Complicaciones',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/endoscopia-digestiva/complicaciones',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['complication_rate'],
        description: 'Perforación, sangrado, aspiración, reacciones adversas',
      },
      {
        key: 'endosc-cecal',
        label: 'Indicadores de Calidad',
        icon: 'Target',
        route: '/dashboard/medico/endoscopia-digestiva/calidad',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['cecal_intubation_rate'],
        description: 'Intubación cecal, tiempo de retirada, limpieza, ADR',
      },
    ],

    laboratory: [
      {
        key: 'endosc-patologia',
        label: 'Resultados de Patología',
        icon: 'FlaskConical',
        route: '/dashboard/medico/endoscopia-digestiva/patologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Histología de biopsias endoscópicas, correlación clínica',
      },
      {
        key: 'endosc-imagenologia',
        label: 'Imagenología Complementaria',
        icon: 'Scan',
        route: '/dashboard/medico/endoscopia-digestiva/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'TC, RM, fluoroscopía para CPRE, ecoendoscopía',
      },
    ],

    financial: [
      {
        key: 'endosc-facturacion',
        label: 'Facturación de Procedimientos',
        icon: 'FileText',
        route: '/dashboard/medico/endoscopia-digestiva/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'endosc-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/endoscopia-digestiva/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'endosc-calculadoras',
        label: 'Calculadoras de Calidad',
        icon: 'Calculator',
        route: '/dashboard/medico/endoscopia-digestiva/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'ADR, Boston Bowel Prep, ASA, Mallampati',
      },
      {
        key: 'endosc-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/endoscopia-digestiva/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ESGE, ACG, ASGE — guías de endoscopía',
      },
    ],

    communication: [
      {
        key: 'endosc-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/endoscopia-digestiva/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'endosc-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/endoscopia-digestiva/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'endosc-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/endoscopia-digestiva/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'procedure-queue',
      component: '@/components/dashboard/medico/endoscopia-digestiva/widgets/procedure-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'quality-metrics',
      component: '@/components/dashboard/medico/endoscopia-digestiva/widgets/quality-metrics-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'polyp-registry',
      component: '@/components/dashboard/medico/endoscopia-digestiva/widgets/polyp-registry-widget',
      size: 'medium',
    },
    {
      key: 'complication-log',
      component: '@/components/dashboard/medico/endoscopia-digestiva/widgets/complication-log-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'adenoma_detection_rate',
    'cecal_intubation_rate',
    'complication_rate',
    'procedures_per_day',
    'withdrawal_time_compliance',
    'patient_satisfaction_post_procedure',
  ],

  kpiDefinitions: {
    adenoma_detection_rate: {
      label: 'Tasa de Detección de Adenomas (ADR)',
      format: 'percentage',
      goal: 0.25,
      direction: 'higher_is_better',
    },
    cecal_intubation_rate: {
      label: 'Tasa de Intubación Cecal',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.01,
      direction: 'lower_is_better',
    },
    procedures_per_day: {
      label: 'Procedimientos por Día',
      format: 'number',
      direction: 'higher_is_better',
    },
    withdrawal_time_compliance: {
      label: 'Cumplimiento Tiempo de Retirada (≥6 min)',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    patient_satisfaction_post_procedure: {
      label: 'Satisfacción Post-Procedimiento',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'egd_diagnostica',
      'egd_terapeutica',
      'colonoscopia_screening',
      'colonoscopia_diagnostica',
      'colonoscopia_terapeutica',
      'cpre',
      'ecoendoscopia',
      'capsula_endoscopica',
      'dilatacion_esofagica',
      'control_post_procedimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'consentimiento_informado',
      'evaluacion_pre_procedimiento',
      'registro_sedacion',
      'informe_endoscopico',
      'registro_polipos',
      'registro_complicaciones',
      'indicaciones_post_procedimiento',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresProcedureScheduling: true,
      tracksSedationRecords: true,
      requiresBiopsyTracking: true,
      tracksPolypRegistry: true,
      logsComplications: true,
      tracksADR: true,
      requiresQualityMetrics: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ENDOSCOPÍA DIGESTIVA
// ============================================================================

/**
 * Clasificación de París para lesiones GI superficiales.
 */
export const PARIS_CLASSIFICATION = [
  { type: '0-Ip', label: 'Pediculado', description: 'Lesión con pedículo definido' },
  { type: '0-Isp', label: 'Subpediculado', description: 'Lesión con base ancha pero elevada' },
  { type: '0-Is', label: 'Sésil', description: 'Elevado sin pedículo' },
  { type: '0-IIa', label: 'Plano elevado', description: 'Ligeramente elevado sobre la mucosa' },
  { type: '0-IIb', label: 'Plano', description: 'Sin elevación ni depresión' },
  { type: '0-IIc', label: 'Plano deprimido', description: 'Ligeramente deprimido' },
  { type: '0-III', label: 'Excavado', description: 'Profundamente deprimido/ulcerado' },
] as const;

/**
 * Escala de preparación de Boston (Boston Bowel Preparation Scale - BBPS).
 */
export const BOSTON_BOWEL_PREP_SCALE = {
  segments: ['Colon Derecho', 'Colon Transverso', 'Colon Izquierdo'],
  scores: [
    { score: 0, label: 'No preparado', description: 'Mucosa no visible por heces sólidas' },
    { score: 1, label: 'Inadecuado', description: 'Residuos que impiden visualización completa' },
    { score: 2, label: 'Bueno', description: 'Residuos menores, mucosa bien visible' },
    { score: 3, label: 'Excelente', description: 'Mucosa completamente visible sin residuos' },
  ],
  adequate: 'Total ≥ 6, cada segmento ≥ 2',
} as const;

/**
 * Parámetros de sedación endoscópica.
 */
export const ENDOSCOPY_SEDATION_PARAMETERS = {
  agents: [
    { key: 'propofol', label: 'Propofol', route: 'IV', typicalDose: '0.5-1 mg/kg inducción', onset: '30-60 seg' },
    { key: 'midazolam', label: 'Midazolam', route: 'IV', typicalDose: '0.02-0.05 mg/kg', onset: '1-3 min' },
    { key: 'fentanyl', label: 'Fentanilo', route: 'IV', typicalDose: '0.5-1 mcg/kg', onset: '1-2 min' },
    { key: 'meperidine', label: 'Meperidina', route: 'IV', typicalDose: '25-50 mg', onset: '3-5 min' },
  ],
  monitoring: [
    { key: 'spo2', label: 'SpO2 (%)', target: '> 92', frequency: 'Continuo' },
    { key: 'hr', label: 'FC (lpm)', target: '60-100', frequency: 'Continuo' },
    { key: 'bp', label: 'TA (mmHg)', target: 'Estable', frequency: 'Cada 5 min' },
    { key: 'rr', label: 'FR (rpm)', target: '> 10', frequency: 'Continuo' },
    { key: 'etco2', label: 'EtCO2 (mmHg)', target: '35-45', frequency: 'Continuo (si disponible)' },
  ],
  asaClassification: [
    { class: 'I', label: 'Paciente sano' },
    { class: 'II', label: 'Enfermedad sistémica leve' },
    { class: 'III', label: 'Enfermedad sistémica severa' },
    { class: 'IV', label: 'Enfermedad con amenaza vital constante' },
    { class: 'V', label: 'Moribundo' },
  ],
} as const;
