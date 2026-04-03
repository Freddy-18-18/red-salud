/**
 * @file overrides/cirugia-bariatrica.ts
 * @description Override de configuración para Cirugía Bariátrica.
 *
 * Módulos especializados: seguimiento de IMC, cálculo de %EWL,
 * monitoreo de deficiencias nutricionales, resolución de comorbilidades,
 * síndrome de dumping, selección de procedimiento (manga/bypass/banda).
 *
 * KPIs: %EWL al año, resolución de comorbilidades, tasa de complicaciones.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Bariátrica.
 * Especialidad quirúrgica con énfasis en seguimiento metabólico
 * a largo plazo y resolución de comorbilidades por obesidad.
 */
export const cirugiaBariatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-bariatrica',
  dashboardPath: '/dashboard/medico/cirugia-bariatrica',

  modules: {
    clinical: [
      {
        key: 'cirbari-consulta',
        label: 'Consulta Bariátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-bariatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirbari-imc',
        label: 'Seguimiento de IMC / Peso',
        icon: 'Scale',
        route: '/dashboard/medico/cirugia-bariatrica/imc',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Curva de peso, IMC, %EWL, %TWL a lo largo del tiempo',
      },
      {
        key: 'cirbari-seleccion',
        label: 'Selección de Procedimiento',
        icon: 'GitBranch',
        route: '/dashboard/medico/cirugia-bariatrica/seleccion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Manga gástrica, bypass gástrico, banda gástrica, criterios de selección',
      },
      {
        key: 'cirbari-comorbilidades',
        label: 'Resolución de Comorbilidades',
        icon: 'CheckCircle',
        route: '/dashboard/medico/cirugia-bariatrica/comorbilidades',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'DM2, HTA, SAHOS, dislipidemia — estado pre y post-quirúrgico',
      },
      {
        key: 'cirbari-nutricional',
        label: 'Monitoreo Nutricional',
        icon: 'Apple',
        route: '/dashboard/medico/cirugia-bariatrica/nutricional',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Deficiencias de vitaminas, minerales, proteínas, suplementación',
      },
      {
        key: 'cirbari-dumping',
        label: 'Evaluación de Dumping',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/cirugia-bariatrica/dumping',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Síntomas de dumping temprano y tardío, manejo dietético',
      },
      {
        key: 'cirbari-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-bariatrica/nota-operatoria',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'cirbari-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-bariatrica/postop',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cirbari-laboratorio',
        label: 'Panel Metabólico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-bariatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, perfil lipídico, glicemia, HbA1c, función hepática',
      },
      {
        key: 'cirbari-vitaminas',
        label: 'Panel de Vitaminas y Minerales',
        icon: 'Pill',
        route: '/dashboard/medico/cirugia-bariatrica/vitaminas',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Vitamina B12, hierro, calcio, vitamina D, folato, zinc',
      },
      {
        key: 'cirbari-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-bariatrica/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirbari-calculadoras',
        label: 'Calculadoras Bariátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-bariatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'IMC, %EWL, %TWL, peso ideal, metabolismo basal',
      },
      {
        key: 'cirbari-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-bariatrica/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirbari-equipo',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-bariatrica/equipo',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Nutriólogo, psicólogo, endocrinólogo, neumólogo',
      },
      {
        key: 'cirbari-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-bariatrica/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirbari-analytics',
        label: 'Análisis de Resultados Bariátricos',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-bariatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ewl-tracking',
      component: '@/components/dashboard/medico/cirugia-bariatrica/widgets/ewl-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'comorbidity-resolution',
      component: '@/components/dashboard/medico/cirugia-bariatrica/widgets/comorbidity-resolution-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'nutritional-deficiency',
      component: '@/components/dashboard/medico/cirugia-bariatrica/widgets/nutritional-deficiency-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-bariatrica/widgets/upcoming-surgeries-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'ewl_percentage_1yr',
    'comorbidity_resolution_rate',
    'complication_rate',
    'nutritional_deficiency_rate',
    'readmission_rate_30d',
    'avg_hospital_stay',
  ],

  kpiDefinitions: {
    ewl_percentage_1yr: {
      label: '%EWL (Exceso de Peso Perdido) al Año',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    comorbidity_resolution_rate: {
      label: 'Tasa de Resolución de Comorbilidades',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    nutritional_deficiency_rate: {
      label: 'Tasa de Deficiencias Nutricionales',
      format: 'percentage',
      goal: 0.2,
      direction: 'lower_is_better',
    },
    readmission_rate_30d: {
      label: 'Tasa de Reingreso a 30 Días',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    avg_hospital_stay: {
      label: 'Estancia Hospitalaria Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'evaluacion_multidisciplinaria',
      'control_postquirurgico_1mes',
      'control_postquirurgico_3meses',
      'control_postquirurgico_6meses',
      'control_anual',
      'evaluacion_nutricional',
      'evaluacion_psicologica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_bariatrica',
      'evaluacion_multidisciplinaria',
      'seleccion_procedimiento',
      'nota_operatoria',
      'evolucion_postquirurgica',
      'seguimiento_peso_ewl',
      'evaluacion_nutricional',
      'evaluacion_comorbilidades',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksBMI: true,
      calculatesEWL: true,
      tracksNutritionalDeficiencies: true,
      tracksComorbidityResolution: true,
      tracksDumpingSyndrome: true,
      requiresMultidisciplinaryEvaluation: true,
      requiresPsychologicalClearance: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Scale',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA BARIÁTRICA
// ============================================================================

/**
 * Procedimientos bariátricos con descripción y características.
 */
export const BARIATRIC_PROCEDURES = [
  { key: 'sleeve', label: 'Manga Gástrica (Sleeve)', mechanism: 'Restrictivo', reversible: false, expectedEWL: '60-70%', malabsorption: 'Mínima', description: 'Resección longitudinal del 80% del estómago' },
  { key: 'rygb', label: 'Bypass Gástrico en Y de Roux', mechanism: 'Mixto (restrictivo + malabsortivo)', reversible: false, expectedEWL: '65-75%', malabsorption: 'Moderada', description: 'Bolsa gástrica pequeña con bypass del duodeno y yeyuno proximal' },
  { key: 'mini_bypass', label: 'Mini Bypass Gástrico (OAGB)', mechanism: 'Mixto', reversible: true, expectedEWL: '60-70%', malabsorption: 'Moderada', description: 'Anastomosis única gastro-yeyunal' },
  { key: 'band', label: 'Banda Gástrica Ajustable', mechanism: 'Restrictivo', reversible: true, expectedEWL: '40-50%', malabsorption: 'Ninguna', description: 'Banda de silicona ajustable alrededor del fundus gástrico' },
  { key: 'sadi', label: 'SADI-S', mechanism: 'Mixto (predominantemente malabsortivo)', reversible: false, expectedEWL: '70-80%', malabsorption: 'Significativa', description: 'Manga gástrica + derivación duodeno-ileal de anastomosis única' },
  { key: 'revision', label: 'Cirugía de Revisión', mechanism: 'Variable', reversible: false, expectedEWL: 'Variable', malabsorption: 'Variable', description: 'Conversión o corrección de procedimiento previo' },
] as const;

/**
 * Comorbilidades asociadas a obesidad y su tasa esperada de resolución.
 */
export const OBESITY_COMORBIDITIES = [
  { key: 'dm2', label: 'Diabetes Mellitus Tipo 2', resolutionRateRYGB: '80-85%', resolutionRateSleeve: '60-70%', monitoring: 'HbA1c, glicemia en ayunas' },
  { key: 'hta', label: 'Hipertensión Arterial', resolutionRateRYGB: '65-75%', resolutionRateSleeve: '55-65%', monitoring: 'PA ambulatoria, ajuste medicación' },
  { key: 'sahos', label: 'Apnea Obstructiva del Sueño (SAHOS)', resolutionRateRYGB: '75-85%', resolutionRateSleeve: '65-75%', monitoring: 'Polisomnografía de control' },
  { key: 'dislipidemia', label: 'Dislipidemia', resolutionRateRYGB: '70-80%', resolutionRateSleeve: '55-65%', monitoring: 'Perfil lipídico' },
  { key: 'nash', label: 'Esteatohepatitis No Alcohólica (NASH)', resolutionRateRYGB: '80-90%', resolutionRateSleeve: '70-80%', monitoring: 'Transaminasas, ecografía hepática' },
  { key: 'artropatia', label: 'Artropatía Degenerativa', resolutionRateRYGB: '40-60%', resolutionRateSleeve: '40-60%', monitoring: 'Escala de dolor, capacidad funcional' },
  { key: 'erge', label: 'Enfermedad por Reflujo Gastroesofágico', resolutionRateRYGB: '85-95%', resolutionRateSleeve: '30-40%', monitoring: 'Sintomatología, pH-metría si persiste' },
] as const;

/**
 * Deficiencias nutricionales comunes post-cirugía bariátrica.
 */
export const NUTRITIONAL_DEFICIENCIES = [
  { key: 'iron', label: 'Hierro', risk: 'Alto (especialmente RYGB)', monitoring: 'Ferritina, hierro sérico, saturación de transferrina', supplementation: 'Hierro elemental 45-65 mg/día' },
  { key: 'b12', label: 'Vitamina B12', risk: 'Alto (RYGB)', monitoring: 'Vitamina B12 sérica, ácido metilmalónico', supplementation: '1000 mcg/día sublingual o IM mensual' },
  { key: 'vitamin_d', label: 'Vitamina D', risk: 'Alto (todos)', monitoring: '25-OH vitamina D, PTH, calcio', supplementation: '3000-6000 UI/día' },
  { key: 'calcium', label: 'Calcio', risk: 'Alto (RYGB, SADI-S)', monitoring: 'Calcio sérico, calcio iónico, densitometría', supplementation: '1200-1500 mg/día (citrato de calcio)' },
  { key: 'folate', label: 'Ácido Fólico', risk: 'Moderado', monitoring: 'Folato sérico', supplementation: '400-800 mcg/día' },
  { key: 'zinc', label: 'Zinc', risk: 'Moderado (RYGB)', monitoring: 'Zinc sérico', supplementation: '8-11 mg/día' },
  { key: 'thiamine', label: 'Tiamina (Vitamina B1)', risk: 'Bajo pero grave', monitoring: 'Tiamina sérica (ante sospecha)', supplementation: '12 mg/día; IV si encefalopatía de Wernicke' },
] as const;
