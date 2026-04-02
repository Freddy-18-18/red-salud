/**
 * @file overrides/medicina-interna.ts
 * @description Override de configuración para Medicina Interna + Medicina Crítica.
 *
 * La especialidad más amplia de la medicina — manejo multi-sistémico,
 * enfermedades crónicas, pacientes complejos y capacidades UCI.
 *
 * También exporta constantes de dominio: paneles de crónicos,
 * scores clínicos, parámetros de cuidado crítico.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Interna + Medicina Crítica.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const medicinaInternaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-interna',
  dashboardPath: '/dashboard/medico/medicina-interna',

  modules: {
    clinical: [
      {
        key: 'mi-consulta',
        label: 'Consulta de Medicina Interna',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-interna/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP comprehensivo, revisión multi-sistémica',
      },
      {
        key: 'mi-cronicos',
        label: 'Gestión de Crónicos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-interna/cronicos',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['chronic_control_rate'],
        description: 'Diabetes, HTA, EPOC, ICC — paneles de seguimiento',
      },
      {
        key: 'mi-riesgo-cv',
        label: 'Riesgo Cardiovascular',
        icon: 'HeartPulse',
        route: '/dashboard/medico/medicina-interna/riesgo-cv',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Framingham, ASCVD score, síndrome metabólico',
      },
      {
        key: 'mi-diabetes',
        label: 'Panel Diabético',
        icon: 'Droplets',
        route: '/dashboard/medico/medicina-interna/diabetes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'HbA1c tracking, titulación de insulina, pie diabético',
      },
      {
        key: 'mi-anticoagulacion',
        label: 'Anticoagulación',
        icon: 'Timer',
        route: '/dashboard/medico/medicina-interna/anticoagulacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'INR tracking, DOAC management, CHA2DS2-VASc',
      },
      {
        key: 'mi-hospitalizacion',
        label: 'Notas de Hospitalización',
        icon: 'BedDouble',
        route: '/dashboard/medico/medicina-interna/hospitalizacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Ingreso, evolución, epicrisis',
      },
      {
        key: 'mi-uci',
        label: 'Panel UCI / Medicina Crítica',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-interna/uci',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'APACHE II, SOFA, ventilador, vasopresores',
      },
    ],

    laboratory: [
      {
        key: 'mi-laboratorio',
        label: 'Panel de Laboratorio Completo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-interna/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'CBC, BMP, CMP, lípidos, tiroides, hepático',
      },
      {
        key: 'mi-hemocultivos',
        label: 'Hemocultivos y Antibiograma',
        icon: 'TestTubes',
        route: '/dashboard/medico/medicina-interna/hemocultivos',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento de hemocultivos y sensibilidad',
      },
      {
        key: 'mi-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-interna/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Rx, TC, RM, ecografía — resultados',
      },
    ],

    financial: [
      {
        key: 'mi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-interna/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'mi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-interna/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'mi-calculadoras',
        label: 'Calculadoras Clínicas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-interna/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Wells, CURB-65, MELD, Child-Pugh, CKD-EPI, CHADS-VASC, Framingham, APACHE II, SOFA, Glasgow',
      },
      {
        key: 'mi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-interna/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'AHA, ADA, GOLD — referencias de guías clínicas',
      },
      {
        key: 'mi-interacciones',
        label: 'Interacciones Medicamentosas',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/medicina-interna/interacciones',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'Referencia de interacciones medicamentosas',
      },
    ],

    communication: [
      {
        key: 'mi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-interna/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'mi-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/medicina-interna/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'mi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-interna/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'chronic-patients',
      component: '@/components/dashboard/medico/medicina-interna/widgets/chronic-patients-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pending-labs',
      component: '@/components/dashboard/medico/medicina-interna/widgets/pending-labs-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'risk-scores',
      component: '@/components/dashboard/medico/medicina-interna/widgets/risk-scores-widget',
      size: 'large',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/medicina-interna/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'chronic_control_rate',
    'readmission_30d',
    'avg_length_of_stay',
    'mortality_rate',
    'polypharmacy_review',
    'preventive_screening',
  ],

  kpiDefinitions: {
    chronic_control_rate: {
      label: '% Crónicos Controlados',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    readmission_30d: {
      label: 'Reingreso 30 Días',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    avg_length_of_stay: {
      label: 'Estancia Promedio (días)',
      format: 'number',
      goal: 5,
      direction: 'lower_is_better',
    },
    mortality_rate: {
      label: 'Tasa de Mortalidad (UCI)',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    polypharmacy_review: {
      label: '% Polifarmacia Revisada',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    preventive_screening: {
      label: 'Adherencia Tamizaje',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_cronico',
      'control_diabetes',
      'control_hta',
      'pre_quirurgico',
      'post_hospitalizacion',
      'interconsulta',
      'urgencia_consultorio',
      'ronda_hospitalaria',
      'visita_uci',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_completa',
      'revision_por_sistemas',
      'examen_fisico_completo',
      'nota_ingreso',
      'nota_evolucion',
      'epicrisis',
      'nota_uci',
      'plan_tratamiento_cronico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresMultiSystemReview: true,
      tracksChronicDiseases: true,
      supportsHospitalization: true,
      supportsCriticalCare: true,
      tracksPolypharmacy: true,
      usesClinicaScores: true,
      requiresPreventiveScreening: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    icon: 'Activity',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA INTERNA
// ============================================================================

/**
 * Paneles de seguimiento por enfermedad crónica.
 * Cada enfermedad define los campos clave a monitorear.
 */
export const CHRONIC_DISEASE_PANELS = {
  diabetes: {
    label: 'Diabetes Mellitus',
    trackingFields: [
      { key: 'hba1c', label: 'HbA1c (%)', target: '< 7.0', frequency: 'trimestral' },
      { key: 'fasting_glucose', label: 'Glucosa Ayunas (mg/dL)', target: '80-130', frequency: 'mensual' },
      { key: 'postprandial_glucose', label: 'Glucosa Postprandial (mg/dL)', target: '< 180', frequency: 'mensual' },
      { key: 'foot_exam', label: 'Examen de Pie', target: 'anual', frequency: 'anual' },
      { key: 'eye_exam', label: 'Fondo de Ojo', target: 'anual', frequency: 'anual' },
      { key: 'microalbuminuria', label: 'Microalbuminuria', target: '< 30 mg/g', frequency: 'anual' },
    ],
  },
  hta: {
    label: 'Hipertensión Arterial',
    trackingFields: [
      { key: 'systolic', label: 'PA Sistólica (mmHg)', target: '< 140', frequency: 'consulta' },
      { key: 'diastolic', label: 'PA Diastólica (mmHg)', target: '< 90', frequency: 'consulta' },
      { key: 'creatinine', label: 'Creatinina', target: 'normal', frequency: 'semestral' },
      { key: 'potassium', label: 'Potasio', target: '3.5-5.0', frequency: 'semestral' },
      { key: 'ecg', label: 'ECG', target: 'sin HVI', frequency: 'anual' },
    ],
  },
  epoc: {
    label: 'EPOC',
    trackingFields: [
      { key: 'fev1', label: 'FEV1 (%)', target: 'estable', frequency: 'trimestral' },
      { key: 'cat_score', label: 'CAT Score', target: '< 10', frequency: 'consulta' },
      { key: 'exacerbations', label: 'Exacerbaciones/Año', target: '< 2', frequency: 'anual' },
      { key: 'oximetry', label: 'SpO2 (%)', target: '> 92', frequency: 'consulta' },
      { key: 'smoking_status', label: 'Tabaquismo', target: 'cesado', frequency: 'consulta' },
    ],
  },
  icc: {
    label: 'Insuficiencia Cardíaca Crónica',
    trackingFields: [
      { key: 'nyha_class', label: 'Clase NYHA', target: 'I-II', frequency: 'consulta' },
      { key: 'bnp', label: 'BNP / NT-proBNP', target: 'en descenso', frequency: 'trimestral' },
      { key: 'lvef', label: 'FEVI (%)', target: '> 40', frequency: 'anual' },
      { key: 'weight', label: 'Peso (kg)', target: 'estable', frequency: 'semanal' },
      { key: 'edema', label: 'Edema', target: 'ausente', frequency: 'consulta' },
    ],
  },
  erc: {
    label: 'Enfermedad Renal Crónica',
    trackingFields: [
      { key: 'gfr', label: 'TFG (mL/min)', target: 'estable', frequency: 'trimestral' },
      { key: 'creatinine', label: 'Creatinina (mg/dL)', target: 'estable', frequency: 'trimestral' },
      { key: 'albumin_creatinine_ratio', label: 'RAC (mg/g)', target: '< 30', frequency: 'semestral' },
      { key: 'potassium', label: 'Potasio (mEq/L)', target: '3.5-5.0', frequency: 'trimestral' },
      { key: 'hemoglobin', label: 'Hemoglobina (g/dL)', target: '> 10', frequency: 'trimestral' },
    ],
  },
} as const;

/**
 * Sistemas de puntaje clínico usados en medicina interna y UCI.
 */
export const CLINICAL_SCORES = [
  { key: 'wells_dvt', label: 'Wells DVT', category: 'vascular', maxScore: 9 },
  { key: 'wells_pe', label: 'Wells PE', category: 'vascular', maxScore: 12.5 },
  { key: 'curb65', label: 'CURB-65', category: 'pulmonar', maxScore: 5 },
  { key: 'meld', label: 'MELD', category: 'hepatico', maxScore: 40 },
  { key: 'child_pugh', label: 'Child-Pugh', category: 'hepatico', maxScore: 15 },
  { key: 'ckd_epi', label: 'CKD-EPI', category: 'renal', maxScore: null },
  { key: 'chads_vasc', label: 'CHA2DS2-VASc', category: 'cardiovascular', maxScore: 9 },
  { key: 'framingham', label: 'Framingham', category: 'cardiovascular', maxScore: null },
  { key: 'apache_ii', label: 'APACHE II', category: 'uci', maxScore: 71 },
  { key: 'sofa', label: 'SOFA', category: 'uci', maxScore: 24 },
  { key: 'glasgow', label: 'Glasgow Coma Scale', category: 'neurologico', maxScore: 15 },
] as const;

/**
 * Parámetros de monitoreo en UCI / cuidado crítico.
 */
export const CRITICAL_CARE_PARAMETERS = {
  ventilator: {
    label: 'Parámetros Ventilatorios',
    fields: [
      { key: 'mode', label: 'Modo', options: ['AC/VC', 'AC/PC', 'SIMV', 'PSV', 'CPAP', 'BiPAP'] },
      { key: 'fio2', label: 'FiO2 (%)', range: { min: 21, max: 100 } },
      { key: 'peep', label: 'PEEP (cmH2O)', range: { min: 0, max: 24 } },
      { key: 'tidal_volume', label: 'Vt (mL)', range: { min: 200, max: 800 } },
      { key: 'respiratory_rate', label: 'FR (rpm)', range: { min: 8, max: 35 } },
      { key: 'pip', label: 'PIP (cmH2O)', range: { min: 10, max: 40 } },
      { key: 'plateau', label: 'P. Meseta (cmH2O)', range: { min: 10, max: 30 } },
    ],
  },
  vasopressors: {
    label: 'Vasopresores / Inotrópicos',
    fields: [
      { key: 'norepinephrine', label: 'Norepinefrina (mcg/kg/min)', range: { min: 0.01, max: 3.0 } },
      { key: 'vasopressin', label: 'Vasopresina (U/min)', range: { min: 0.01, max: 0.04 } },
      { key: 'dobutamine', label: 'Dobutamina (mcg/kg/min)', range: { min: 2, max: 20 } },
      { key: 'epinephrine', label: 'Epinefrina (mcg/kg/min)', range: { min: 0.01, max: 2.0 } },
      { key: 'milrinone', label: 'Milrinona (mcg/kg/min)', range: { min: 0.125, max: 0.75 } },
    ],
  },
  hemodynamics: {
    label: 'Hemodinamia',
    fields: [
      { key: 'map', label: 'PAM (mmHg)', target: '> 65' },
      { key: 'cvp', label: 'PVC (cmH2O)', target: '8-12' },
      { key: 'cardiac_output', label: 'Gasto Cardíaco (L/min)', target: '4-8' },
      { key: 'svr', label: 'RVS (dyn.s/cm5)', target: '800-1200' },
      { key: 'lactate', label: 'Lactato (mmol/L)', target: '< 2' },
      { key: 'scvo2', label: 'SvcO2 (%)', target: '> 70' },
    ],
  },
  sedation: {
    label: 'Sedación y Analgesia',
    fields: [
      { key: 'rass', label: 'RASS', target: '-2 a 0' },
      { key: 'cam_icu', label: 'CAM-ICU', target: 'negativo' },
      { key: 'bps', label: 'BPS (Dolor)', target: '< 5' },
      { key: 'cpot', label: 'CPOT (Dolor)', target: '< 3' },
    ],
  },
} as const;
