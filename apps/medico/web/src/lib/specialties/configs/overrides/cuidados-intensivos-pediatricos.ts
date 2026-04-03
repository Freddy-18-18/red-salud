/**
 * @file overrides/cuidados-intensivos-pediatricos.ts
 * @description Override de configuración para Cuidados Intensivos Pediátricos (UCIP).
 *
 * Módulos especializados para la unidad de cuidados intensivos pediátricos:
 * scoring PRISM, manejo de ventilación mecánica, sedación (COMFORT),
 * cálculo de infusiones vasoactivas, balance hídrico, documentación de código.
 *
 * También exporta constantes de dominio: scores PRISM, escala COMFORT,
 * infusiones vasoactivas, parámetros de balance hídrico.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cuidados Intensivos Pediátricos (UCIP).
 * Especialidad con módulos clínicos especializados para pacientes pediátricos críticos.
 */
export const cuidadosIntensivosPediatricosOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'uci-pediatrica',
  dashboardPath: '/dashboard/medico/uci-pediatrica',

  modules: {
    clinical: [
      {
        key: 'ucipedi-ingreso',
        label: 'Ingreso UCIP',
        icon: 'HeartPulse',
        route: '/dashboard/medico/uci-pediatrica/ingreso',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['picu_mortality', 'ventilator_days'],
      },
      {
        key: 'ucipedi-prism',
        label: 'Score PRISM III',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/uci-pediatrica/prism',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['picu_mortality'],
      },
      {
        key: 'ucipedi-ventilacion',
        label: 'Ventilación Mecánica',
        icon: 'Wind',
        route: '/dashboard/medico/uci-pediatrica/ventilacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['ventilator_days', 'unplanned_extubation_rate'],
      },
      {
        key: 'ucipedi-sedacion',
        label: 'Sedación (COMFORT)',
        icon: 'Moon',
        route: '/dashboard/medico/uci-pediatrica/sedacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['ventilator_days'],
      },
      {
        key: 'ucipedi-vasoactivos',
        label: 'Infusiones Vasoactivas',
        icon: 'Syringe',
        route: '/dashboard/medico/uci-pediatrica/vasoactivos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['picu_mortality'],
      },
      {
        key: 'ucipedi-balance-hidrico',
        label: 'Balance Hídrico',
        icon: 'Droplets',
        route: '/dashboard/medico/uci-pediatrica/balance-hidrico',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'ucipedi-codigo',
        label: 'Documentación de Código',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/uci-pediatrica/codigo',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['picu_mortality'],
      },
    ],

    technology: [
      {
        key: 'ucipedi-calculadoras',
        label: 'Calculadoras UCI',
        icon: 'Calculator',
        route: '/dashboard/medico/uci-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'ucipedi-monitoreo',
        label: 'Monitoreo Hemodinámico',
        icon: 'Activity',
        route: '/dashboard/medico/uci-pediatrica/monitoreo',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'ucipedi-portal-familia',
        label: 'Portal Familiar UCIP',
        icon: 'Users',
        route: '/dashboard/medico/uci-pediatrica/portal-familia',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'picu-census',
      component: '@/components/dashboard/medico/uci-pediatrica/widgets/picu-census-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ventilator-tracker',
      component: '@/components/dashboard/medico/uci-pediatrica/widgets/ventilator-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'vasoactive-drips',
      component: '@/components/dashboard/medico/uci-pediatrica/widgets/vasoactive-drips-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'picu_mortality',
    'ventilator_days',
    'unplanned_extubation_rate',
    'avg_length_of_stay',
    'nosocomial_infection_rate',
    'readmission_48h_rate',
  ],

  kpiDefinitions: {
    picu_mortality: {
      label: 'Mortalidad UCIP',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    ventilator_days: {
      label: 'Días en Ventilación Mecánica',
      format: 'number',
      goal: 5,
      direction: 'lower_is_better',
    },
    unplanned_extubation_rate: {
      label: 'Tasa de Extubación No Planificada',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    avg_length_of_stay: {
      label: 'Estadía Promedio UCIP (días)',
      format: 'number',
      goal: 7,
      direction: 'lower_is_better',
    },
    nosocomial_infection_rate: {
      label: 'Tasa de Infección Nosocomial',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    readmission_48h_rate: {
      label: 'Reingreso < 48h',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'ingreso_ucip',
      'nota_diaria_ucip',
      'evaluacion_prism',
      'ajuste_ventilacion',
      'evaluacion_sedacion',
      'ajuste_vasoactivos',
      'balance_hidrico',
      'documentacion_codigo',
      'interconsulta_ucip',
    ],
    defaultDuration: 30,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'ingreso_ucip',
      'nota_diaria_ucip',
      'score_prism',
      'parametros_ventilatorios',
      'escala_comfort',
      'infusiones_vasoactivas',
      'balance_hidrico',
      'documentacion_codigo',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCriticalCareMonitoring: true,
      usesPRISMScoring: true,
      tracksCOMFORTScale: true,
      calculatesVasoactiveDrips: true,
      tracksFluidBalance: true,
      requiresCodeDocumentation: true,
      usesPediatricDosage: true,
      requiresParentalConsent: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#F87171',
    icon: 'HeartPulse',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CUIDADOS INTENSIVOS PEDIÁTRICOS
// ============================================================================

/**
 * Variables del score PRISM III (Pediatric Risk of Mortality)
 */
export const PRISM_III_VARIABLES = [
  { key: 'systolic_bp', label: 'Presión Arterial Sistólica', unit: 'mmHg' },
  { key: 'heart_rate', label: 'Frecuencia Cardíaca', unit: 'lpm' },
  { key: 'temperature', label: 'Temperatura', unit: '°C' },
  { key: 'mental_status', label: 'Estado Mental (Glasgow)', unit: 'puntos' },
  { key: 'pupillary_reflex', label: 'Reflejos Pupilares', unit: '' },
  { key: 'acidosis', label: 'pH / PCO₂', unit: '' },
  { key: 'pao2', label: 'PaO₂', unit: 'mmHg' },
  { key: 'co2', label: 'CO₂ Total', unit: 'mmol/L' },
  { key: 'glucose', label: 'Glucosa', unit: 'mg/dL' },
  { key: 'potassium', label: 'Potasio', unit: 'mEq/L' },
  { key: 'creatinine', label: 'Creatinina', unit: 'mg/dL' },
  { key: 'bun', label: 'BUN', unit: 'mg/dL' },
  { key: 'wbc', label: 'Leucocitos', unit: 'x10³/μL' },
  { key: 'platelets', label: 'Plaquetas', unit: 'x10³/μL' },
  { key: 'pt_ptt', label: 'TP / TTP', unit: 'segundos' },
];

/**
 * Escala COMFORT de sedación
 */
export const COMFORT_SCALE = {
  categories: [
    { key: 'alertness', label: 'Alerta', scores: [1, 2, 3, 4, 5], descriptions: ['Profundamente dormido', 'Ligeramente dormido', 'Somnoliento', 'Despierto y alerta', 'Hiperalerta'] },
    { key: 'calmness', label: 'Tranquilidad', scores: [1, 2, 3, 4, 5], descriptions: ['Calmado', 'Ligeramente ansioso', 'Ansioso', 'Muy ansioso', 'Pánico'] },
    { key: 'respiratory', label: 'Respuesta Respiratoria', scores: [1, 2, 3, 4, 5], descriptions: ['Sin respiración espontánea', 'Respiración espontánea', 'Resistencia al ventilador', 'Lucha activa', 'Lucha contra ventilador'] },
    { key: 'movement', label: 'Movimiento Físico', scores: [1, 2, 3, 4, 5], descriptions: ['Sin movimiento', 'Movimiento ocasional', 'Movimiento frecuente', 'Movimiento vigoroso', 'Movimiento constante'] },
    { key: 'muscle_tone', label: 'Tono Muscular', scores: [1, 2, 3, 4, 5], descriptions: ['Relajado', 'Reducido', 'Normal', 'Aumentado', 'Rígido'] },
    { key: 'facial_tension', label: 'Tensión Facial', scores: [1, 2, 3, 4, 5], descriptions: ['Relajado', 'Normal', 'Tenso', 'Muy tenso', 'Muecas'] },
  ],
  interpretation: {
    oversedated: { min: 6, max: 10, label: 'Sobresedación', color: '#3B82F6' },
    adequate: { min: 11, max: 22, label: 'Sedación Adecuada', color: '#22C55E' },
    undersedated: { min: 23, max: 30, label: 'Subsedación', color: '#EF4444' },
  },
};

/**
 * Infusiones vasoactivas pediátricas comunes
 */
export const VASOACTIVE_DRIPS = [
  { key: 'dopamine', label: 'Dopamina', unit: 'mcg/kg/min', minDose: 2, maxDose: 20, concentration: '1600 mcg/mL' },
  { key: 'dobutamine', label: 'Dobutamina', unit: 'mcg/kg/min', minDose: 2, maxDose: 20, concentration: '2000 mcg/mL' },
  { key: 'epinephrine', label: 'Epinefrina', unit: 'mcg/kg/min', minDose: 0.01, maxDose: 1, concentration: '16 mcg/mL' },
  { key: 'norepinephrine', label: 'Norepinefrina', unit: 'mcg/kg/min', minDose: 0.01, maxDose: 2, concentration: '16 mcg/mL' },
  { key: 'milrinone', label: 'Milrinona', unit: 'mcg/kg/min', minDose: 0.25, maxDose: 0.75, concentration: '200 mcg/mL' },
  { key: 'vasopressin', label: 'Vasopresina', unit: 'U/kg/h', minDose: 0.0002, maxDose: 0.002, concentration: '0.1 U/mL' },
];
