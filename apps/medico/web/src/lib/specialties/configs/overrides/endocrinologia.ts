/**
 * @file overrides/endocrinologia.ts
 * @description Override de configuración para Endocrinología.
 *
 * Sistema endocrino — panel tiroideo, tendencias HbA1c/glucosa,
 * densidad ósea, función adrenal, trastornos hipofisarios y
 * manejo de bombas de insulina.
 *
 * También exporta constantes de dominio: paneles hormonales,
 * protocolos de seguimiento tiroideo, esquemas de insulina.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Endocrinología.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const endocrinologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'endocrinologia',
  dashboardPath: '/dashboard/medico/endocrinologia',

  modules: {
    clinical: [
      {
        key: 'endocrino-consulta',
        label: 'Consulta Endocrinológica',
        icon: 'Flame',
        route: '/dashboard/medico/endocrinologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'avg_consultation_duration'],
        description: 'SOAP endocrinológico, evaluación hormonal, revisión de resultados',
      },
      {
        key: 'endocrino-tiroides',
        label: 'Panel Tiroideo',
        icon: 'Activity',
        route: '/dashboard/medico/endocrinologia/tiroides',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['thyroid_control_rate'],
        description: 'TSH, T3, T4 — seguimiento, nódulos, Hashimoto, Graves',
      },
      {
        key: 'endocrino-diabetes',
        label: 'Manejo de Diabetes',
        icon: 'Droplets',
        route: '/dashboard/medico/endocrinologia/diabetes',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['diabetes_control_rate'],
        description: 'HbA1c, glucometría, titulación insulina, complicaciones',
      },
      {
        key: 'endocrino-oseo',
        label: 'Metabolismo Óseo',
        icon: 'Bone',
        route: '/dashboard/medico/endocrinologia/oseo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['osteoporosis_screening_rate'],
        description: 'Densitometría, calcio, vitamina D, osteoporosis, FRAX',
      },
      {
        key: 'endocrino-adrenal',
        label: 'Función Adrenal',
        icon: 'Zap',
        route: '/dashboard/medico/endocrinologia/adrenal',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Cortisol, ACTH, Cushing, Addison, incidentaloma adrenal',
      },
      {
        key: 'endocrino-hipofisis',
        label: 'Trastornos Hipofisarios',
        icon: 'CircleDot',
        route: '/dashboard/medico/endocrinologia/hipofisis',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Prolactinoma, acromegalia, déficit GH, panhipopituitarismo',
      },
      {
        key: 'endocrino-bomba-insulina',
        label: 'Bomba de Insulina',
        icon: 'Cpu',
        route: '/dashboard/medico/endocrinologia/bomba-insulina',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Configuración de bomba, basales, bolos, CGM, time in range',
      },
    ],

    laboratory: [
      {
        key: 'endocrino-laboratorio',
        label: 'Panel Hormonal Completo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/endocrinologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Tiroides, adrenal, gonadal, hipofisario, metabolismo óseo',
      },
      {
        key: 'endocrino-glucometria',
        label: 'Monitoreo de Glucosa',
        icon: 'LineChart',
        route: '/dashboard/medico/endocrinologia/glucometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'CGM, glucometría capilar, curvas, time in range',
      },
      {
        key: 'endocrino-imagenologia',
        label: 'Imagenología Endocrina',
        icon: 'Scan',
        route: '/dashboard/medico/endocrinologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Ecografía tiroidea, gammagrafía, DEXA, RM silla turca',
      },
    ],

    technology: [
      {
        key: 'endocrino-calculadoras',
        label: 'Calculadoras Endocrinas',
        icon: 'Calculator',
        route: '/dashboard/medico/endocrinologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'FRAX, dosis insulina, tiroides, IMC, conversión unidades',
      },
      {
        key: 'endocrino-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/endocrinologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ADA, ATA, AACE, Endocrine Society — guías clínicas',
      },
    ],
  },

  widgets: [
    {
      key: 'thyroid-panel-tracker',
      component: '@/components/dashboard/medico/endocrinologia/widgets/thyroid-panel-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'hba1c-trends',
      component: '@/components/dashboard/medico/endocrinologia/widgets/hba1c-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'bone-density-overview',
      component: '@/components/dashboard/medico/endocrinologia/widgets/bone-density-overview-widget',
      size: 'large',
    },
    {
      key: 'hormone-alerts',
      component: '@/components/dashboard/medico/endocrinologia/widgets/hormone-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'thyroid_control_rate',
    'diabetes_control_rate',
    'osteoporosis_screening_rate',
    'hba1c_avg',
    'time_in_range',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    thyroid_control_rate: {
      label: '% Control Tiroideo',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    diabetes_control_rate: {
      label: '% Diabetes Controlada (HbA1c < 7)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    osteoporosis_screening_rate: {
      label: 'Tamizaje Osteoporosis',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    hba1c_avg: {
      label: 'HbA1c Promedio (%)',
      format: 'number',
      goal: 7.0,
      direction: 'lower_is_better',
    },
    time_in_range: {
      label: 'Time in Range (%)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'control_tiroides',
      'control_diabetes',
      'control_oseo',
      'evaluacion_adrenal',
      'evaluacion_hipofisaria',
      'ajuste_bomba_insulina',
      'revision_cgm',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_endocrina',
      'evaluacion_tiroidea',
      'plan_diabetes',
      'evaluacion_osea',
      'evaluacion_adrenal',
      'evaluacion_hipofisaria',
      'configuracion_bomba',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksThyroidPanel: true,
      tracksGlucoseMetrics: true,
      tracksBoneDensity: true,
      tracksAdrenalFunction: true,
      tracksPituitaryDisorders: true,
      supportsInsulinPump: true,
      supportsCGM: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Flame',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ENDOCRINOLOGÍA
// ============================================================================

/**
 * Paneles hormonales por eje endocrino.
 */
export const HORMONAL_PANELS = {
  thyroid: {
    label: 'Eje Tiroideo',
    tests: [
      { key: 'tsh', label: 'TSH (mUI/L)', normalRange: '0.4-4.0' },
      { key: 'free_t4', label: 'T4 Libre (ng/dL)', normalRange: '0.8-1.8' },
      { key: 'free_t3', label: 'T3 Libre (pg/mL)', normalRange: '2.3-4.2' },
      { key: 'anti_tpo', label: 'Anti-TPO (UI/mL)', normalRange: '< 35' },
      { key: 'anti_tg', label: 'Anti-Tiroglobulina (UI/mL)', normalRange: '< 40' },
      { key: 'trab', label: 'TRAb (UI/L)', normalRange: '< 1.75' },
      { key: 'tiroglobulin', label: 'Tiroglobulina (ng/mL)', normalRange: '< 55' },
    ],
  },
  adrenal: {
    label: 'Eje Adrenal',
    tests: [
      { key: 'cortisol_am', label: 'Cortisol AM (μg/dL)', normalRange: '6-18' },
      { key: 'acth', label: 'ACTH (pg/mL)', normalRange: '7-63' },
      { key: 'dheas', label: 'DHEA-S (μg/dL)', normalRange: 'variable por edad/sexo' },
      { key: 'aldosterone', label: 'Aldosterona (ng/dL)', normalRange: '3-16' },
      { key: 'renin', label: 'Renina (ng/mL/h)', normalRange: '0.5-3.5' },
      { key: 'cortisol_24h_urine', label: 'Cortisol Orina 24h (μg/24h)', normalRange: '10-100' },
      { key: 'metanephrines', label: 'Metanefrinas Fraccionadas', normalRange: 'variable' },
    ],
  },
  pituitary: {
    label: 'Eje Hipofisario',
    tests: [
      { key: 'prolactin', label: 'Prolactina (ng/mL)', normalRange: 'M: 2-20, F: 2-25' },
      { key: 'gh', label: 'GH (ng/mL)', normalRange: '0-5' },
      { key: 'igf1', label: 'IGF-1 (ng/mL)', normalRange: 'variable por edad' },
      { key: 'fsh', label: 'FSH (mUI/mL)', normalRange: 'variable por fase' },
      { key: 'lh', label: 'LH (mUI/mL)', normalRange: 'variable por fase' },
      { key: 'testosterone', label: 'Testosterona Total (ng/dL)', normalRange: 'M: 300-1000, F: 15-70' },
      { key: 'estradiol', label: 'Estradiol (pg/mL)', normalRange: 'variable por fase' },
    ],
  },
  bone_metabolism: {
    label: 'Metabolismo Óseo',
    tests: [
      { key: 'calcium', label: 'Calcio (mg/dL)', normalRange: '8.5-10.5' },
      { key: 'phosphorus', label: 'Fósforo (mg/dL)', normalRange: '2.5-4.5' },
      { key: 'vitamin_d', label: '25-OH Vitamina D (ng/mL)', normalRange: '30-100' },
      { key: 'pth', label: 'PTH (pg/mL)', normalRange: '15-65' },
      { key: 'alkaline_phosphatase', label: 'Fosfatasa Alcalina (U/L)', normalRange: '44-147' },
      { key: 'ctx', label: 'CTx (β-CrossLaps)', normalRange: 'variable por edad/sexo' },
      { key: 'p1np', label: 'P1NP (ng/mL)', normalRange: 'variable por edad/sexo' },
    ],
  },
} as const;

/**
 * Clasificación de nódulos tiroideos (TI-RADS).
 */
export const TIRADS_CLASSIFICATION = [
  { score: 1, label: 'TR1 — Benigno', risk: '< 2%', recommendation: 'No biopsia' },
  { score: 2, label: 'TR2 — No sospechoso', risk: '< 2%', recommendation: 'No biopsia' },
  { score: 3, label: 'TR3 — Levemente sospechoso', risk: '5%', recommendation: 'PAAF si ≥ 2.5 cm' },
  { score: 4, label: 'TR4 — Moderadamente sospechoso', risk: '5-20%', recommendation: 'PAAF si ≥ 1.5 cm' },
  { score: 5, label: 'TR5 — Altamente sospechoso', risk: '> 20%', recommendation: 'PAAF si ≥ 1.0 cm' },
] as const;

/**
 * Esquemas de insulina comunes.
 */
export const INSULIN_REGIMENS = [
  { key: 'basal_only', label: 'Basal Sola', description: 'Glargina, Detemir o Degludec — 1 dosis nocturna', indication: 'DM2 inicio insulinización' },
  { key: 'basal_plus', label: 'Basal-Plus', description: 'Basal + 1 bolo prandial principal', indication: 'DM2 con hiperglucemia postprandial' },
  { key: 'basal_bolus', label: 'Basal-Bolo', description: 'Basal + 3 bolos prandiales', indication: 'DM1 o DM2 intensificado' },
  { key: 'premixed', label: 'Premezcla', description: '70/30 o 75/25 — 2 dosis/día', indication: 'DM2 adherencia limitada' },
  { key: 'pump', label: 'Bomba de Insulina (CSII)', description: 'Infusión continua subcutánea', indication: 'DM1, DM2 seleccionados' },
] as const;
