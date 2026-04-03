/**
 * @file overrides/gastroenterologia.ts
 * @description Override de configuración para Gastroenterología.
 *
 * Especialidad del aparato digestivo — endoscopía, manejo de H. pylori,
 * scoring de enfermedad inflamatoria intestinal (Mayo, CDAI),
 * estadificación hepática (Fibrosis-4), tamizaje colorrectal y
 * manejo de ERGE.
 *
 * También exporta constantes de dominio: scores IBD, estadificación
 * hepática, protocolos de tamizaje.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Gastroenterología.
 * Especialidad con módulos clínicos, de laboratorio y procedimientos.
 */
export const gastroenterologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'gastroenterologia',
  dashboardPath: '/dashboard/medico/gastroenterologia',

  modules: {
    clinical: [
      {
        key: 'gastro-consulta',
        label: 'Consulta Gastroenterológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/gastroenterologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP con enfoque gastrointestinal, anamnesis digestiva',
      },
      {
        key: 'gastro-endoscopia',
        label: 'Seguimiento de Endoscopías',
        icon: 'Eye',
        route: '/dashboard/medico/gastroenterologia/endoscopia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['scope_procedures_per_week'],
        description: 'EGD, colonoscopía, registro de hallazgos y biopsias',
      },
      {
        key: 'gastro-h-pylori',
        label: 'Manejo de H. pylori',
        icon: 'Bug',
        route: '/dashboard/medico/gastroenterologia/h-pylori',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Esquemas de erradicación, test de aliento, seguimiento',
      },
      {
        key: 'gastro-ibd',
        label: 'Enfermedad Inflamatoria Intestinal',
        icon: 'Flame',
        route: '/dashboard/medico/gastroenterologia/ibd',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['ibd_remission_rate'],
        description: 'Scores Mayo (CU) y CDAI (Crohn), biológicos, calprotectina',
      },
      {
        key: 'gastro-hepatitis',
        label: 'Estadificación Hepática',
        icon: 'Scan',
        route: '/dashboard/medico/gastroenterologia/hepatitis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Fibrosis-4, APRI, FibroScan, hepatitis viral',
      },
      {
        key: 'gastro-tamizaje-colorrectal',
        label: 'Tamizaje Colorrectal',
        icon: 'ShieldCheck',
        route: '/dashboard/medico/gastroenterologia/tamizaje-colorrectal',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['polyp_detection_rate'],
        description: 'Programa de screening, pólipos, vigilancia post-polipectomía',
      },
      {
        key: 'gastro-erge',
        label: 'Manejo de ERGE',
        icon: 'ArrowUpFromLine',
        route: '/dashboard/medico/gastroenterologia/erge',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'pH-metría, manometría, IBP, plan anti-reflujo',
      },
    ],

    laboratory: [
      {
        key: 'gastro-laboratorio',
        label: 'Panel de Laboratorio GI',
        icon: 'FlaskConical',
        route: '/dashboard/medico/gastroenterologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hepático, calprotectina, elastasa, sangre oculta',
      },
      {
        key: 'gastro-patologia',
        label: 'Biopsias y Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/gastroenterologia/patologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Registro de biopsias endoscópicas, resultados histológicos',
      },
      {
        key: 'gastro-imagenologia',
        label: 'Imagenología Digestiva',
        icon: 'Scan',
        route: '/dashboard/medico/gastroenterologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'TC abdomen, RM, ecografía hepática, tránsito intestinal',
      },
    ],

    financial: [
      {
        key: 'gastro-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/gastroenterologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gastro-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/gastroenterologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'gastro-calculadoras',
        label: 'Calculadoras GI',
        icon: 'Calculator',
        route: '/dashboard/medico/gastroenterologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Mayo Score, CDAI, Fibrosis-4, APRI, Child-Pugh, MELD',
      },
      {
        key: 'gastro-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/gastroenterologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ACG, AGA, ESGE — referencias de guías clínicas',
      },
    ],

    communication: [
      {
        key: 'gastro-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/gastroenterologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gastro-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/gastroenterologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'gastro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/gastroenterologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'endoscopy-schedule',
      component: '@/components/dashboard/medico/gastroenterologia/widgets/endoscopy-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ibd-patients',
      component: '@/components/dashboard/medico/gastroenterologia/widgets/ibd-patients-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'polyp-registry',
      component: '@/components/dashboard/medico/gastroenterologia/widgets/polyp-registry-widget',
      size: 'medium',
    },
    {
      key: 'h-pylori-tracking',
      component: '@/components/dashboard/medico/gastroenterologia/widgets/h-pylori-tracking-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'scope_procedures_per_week',
    'polyp_detection_rate',
    'ibd_remission_rate',
    'h_pylori_eradication_rate',
    'colorectal_screening_compliance',
    'erge_symptom_control',
  ],

  kpiDefinitions: {
    scope_procedures_per_week: {
      label: 'Procedimientos Endoscópicos / Semana',
      format: 'number',
      direction: 'higher_is_better',
    },
    polyp_detection_rate: {
      label: 'Tasa de Detección de Pólipos (ADR)',
      format: 'percentage',
      goal: 0.25,
      direction: 'higher_is_better',
    },
    ibd_remission_rate: {
      label: '% Pacientes EII en Remisión',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    h_pylori_eradication_rate: {
      label: 'Tasa de Erradicación H. pylori',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    colorectal_screening_compliance: {
      label: 'Adherencia Tamizaje Colorrectal',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    erge_symptom_control: {
      label: 'Control Sintomático ERGE',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'endoscopia_alta',
      'colonoscopia',
      'control_ibd',
      'control_h_pylori',
      'control_hepatitis',
      'tamizaje_colorrectal',
      'control_erge',
      'post_procedimiento',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_digestiva',
      'examen_fisico_abdominal',
      'informe_endoscopia',
      'informe_colonoscopia',
      'protocolo_h_pylori',
      'seguimiento_ibd',
      'evaluacion_hepatica',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksEndoscopyProcedures: true,
      requiresHPyloriProtocol: true,
      tracksIBDScores: true,
      requiresLiverStaging: true,
      supportsColorectalScreening: true,
      tracksGERDManagement: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    icon: 'Utensils',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — GASTROENTEROLOGÍA
// ============================================================================

/**
 * Scores de Enfermedad Inflamatoria Intestinal.
 */
export const IBD_SCORES = {
  mayo: {
    label: 'Mayo Score (Colitis Ulcerosa)',
    components: [
      { key: 'stool_frequency', label: 'Frecuencia de Deposiciones', maxScore: 3 },
      { key: 'rectal_bleeding', label: 'Sangrado Rectal', maxScore: 3 },
      { key: 'endoscopic_findings', label: 'Hallazgos Endoscópicos', maxScore: 3 },
      { key: 'physician_global', label: 'Evaluación Global del Médico', maxScore: 3 },
    ],
    interpretation: [
      { range: '0-2', label: 'Remisión' },
      { range: '3-5', label: 'Actividad Leve' },
      { range: '6-10', label: 'Actividad Moderada' },
      { range: '11-12', label: 'Actividad Severa' },
    ],
  },
  cdai: {
    label: 'CDAI (Crohn Disease Activity Index)',
    components: [
      { key: 'liquid_stools', label: 'Deposiciones Líquidas (7 días)', weight: 2 },
      { key: 'abdominal_pain', label: 'Dolor Abdominal (7 días)', weight: 5 },
      { key: 'general_wellbeing', label: 'Bienestar General (7 días)', weight: 7 },
      { key: 'extraintestinal', label: 'Manifestaciones Extraintestinales', weight: 20 },
      { key: 'antidiarrheal', label: 'Uso de Antidiarreicos', weight: 30 },
      { key: 'abdominal_mass', label: 'Masa Abdominal', weight: 10 },
      { key: 'hematocrit', label: 'Hematocrito', weight: 6 },
      { key: 'body_weight', label: 'Peso Corporal', weight: 1 },
    ],
    interpretation: [
      { range: '< 150', label: 'Remisión' },
      { range: '150-220', label: 'Actividad Leve' },
      { range: '220-450', label: 'Actividad Moderada' },
      { range: '> 450', label: 'Actividad Severa' },
    ],
  },
} as const;

/**
 * Índices no invasivos de fibrosis hepática.
 */
export const LIVER_FIBROSIS_INDICES = [
  {
    key: 'fib4',
    label: 'Fibrosis-4 (FIB-4)',
    formula: '(Edad × AST) / (Plaquetas × √ALT)',
    interpretation: [
      { range: '< 1.30', label: 'Fibrosis avanzada excluida (F0-F1)' },
      { range: '1.30-2.67', label: 'Indeterminado — requiere más evaluación' },
      { range: '> 2.67', label: 'Fibrosis avanzada probable (F3-F4)' },
    ],
  },
  {
    key: 'apri',
    label: 'APRI (AST-to-Platelet Ratio Index)',
    formula: '(AST / LSN) / Plaquetas × 100',
    interpretation: [
      { range: '< 0.5', label: 'Fibrosis significativa excluida' },
      { range: '0.5-1.5', label: 'Indeterminado' },
      { range: '> 1.5', label: 'Fibrosis significativa probable' },
    ],
  },
  {
    key: 'fibroscan',
    label: 'FibroScan (Elastografía Transitoria)',
    unit: 'kPa',
    interpretation: [
      { range: '< 7.0', label: 'F0-F1 (Sin fibrosis significativa)' },
      { range: '7.0-9.5', label: 'F2 (Fibrosis moderada)' },
      { range: '9.5-12.5', label: 'F3 (Fibrosis severa)' },
      { range: '> 12.5', label: 'F4 (Cirrosis)' },
    ],
  },
] as const;

/**
 * Protocolos de tamizaje colorrectal.
 */
export const COLORECTAL_SCREENING_PROTOCOLS = [
  { key: 'colonoscopy', label: 'Colonoscopía', interval: 'Cada 10 años', startAge: 45, notes: 'Gold standard' },
  { key: 'fit', label: 'FIT (Sangre Oculta Inmunoquímica)', interval: 'Anual', startAge: 45, notes: 'No invasivo, alta sensibilidad' },
  { key: 'fit_dna', label: 'FIT-DNA (Cologuard)', interval: 'Cada 3 años', startAge: 45, notes: 'ADN fecal + FIT' },
  { key: 'ct_colonography', label: 'Colonografía por TC', interval: 'Cada 5 años', startAge: 45, notes: 'Virtual, requiere prep' },
  { key: 'flexible_sigmoidoscopy', label: 'Sigmoidoscopía Flexible', interval: 'Cada 5 años', startAge: 45, notes: 'Solo recto-sigma' },
] as const;
