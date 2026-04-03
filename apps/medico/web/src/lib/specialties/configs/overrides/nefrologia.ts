/**
 * @file overrides/nefrologia.ts
 * @description Override de configuración para Nefrología.
 *
 * Especialidad del riñón — seguimiento de eGFR (CKD-EPI), tendencias
 * de electrolitos, adecuación de diálisis (Kt/V), seguimiento
 * post-trasplante, monitoreo de proteinuria y manejo de acceso vascular.
 *
 * También exporta constantes de dominio: estadios CKD, parámetros
 * de diálisis, criterios de trasplante.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Nefrología.
 * Especialidad con módulos clínicos y de diálisis.
 */
export const nefrologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'nefrologia',
  dashboardPath: '/dashboard/medico/nefrologia',

  modules: {
    clinical: [
      {
        key: 'nefro-consulta',
        label: 'Consulta Nefrológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/nefrologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP nefrológico, evaluación de función renal',
      },
      {
        key: 'nefro-egfr',
        label: 'Seguimiento de eGFR',
        icon: 'TrendingDown',
        route: '/dashboard/medico/nefrologia/egfr',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ckd_progression_rate'],
        description: 'CKD-EPI, tendencia temporal, clasificación por estadio',
      },
      {
        key: 'nefro-electrolitos',
        label: 'Tendencias de Electrolitos',
        icon: 'Activity',
        route: '/dashboard/medico/nefrologia/electrolitos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'K+, Na+, Ca2+, PO4, Mg2+, bicarbonato — tendencias',
      },
      {
        key: 'nefro-dialisis',
        label: 'Adecuación de Diálisis',
        icon: 'RefreshCcw',
        route: '/dashboard/medico/nefrologia/dialisis',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['dialysis_adequacy'],
        description: 'Kt/V, URR, peso seco, ultrafiltración, sesiones',
      },
      {
        key: 'nefro-trasplante',
        label: 'Seguimiento Post-Trasplante',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/nefrologia/trasplante',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['transplant_function'],
        description: 'Función del injerto, inmunosupresión, rechazo, creatinina',
      },
      {
        key: 'nefro-proteinuria',
        label: 'Monitoreo de Proteinuria',
        icon: 'Droplets',
        route: '/dashboard/medico/nefrologia/proteinuria',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'RAC, RPC, proteinuria 24h, nefrótico vs nefrítico',
      },
      {
        key: 'nefro-acceso',
        label: 'Manejo de Acceso Vascular',
        icon: 'GitBranch',
        route: '/dashboard/medico/nefrologia/acceso-vascular',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'FAV, injerto, catéter — maduración, complicaciones, flujo',
      },
    ],

    laboratory: [
      {
        key: 'nefro-laboratorio',
        label: 'Panel Renal Completo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/nefrologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Creatinina, BUN, electrolitos, Ca/P, PTH, Hb, hierro',
      },
      {
        key: 'nefro-urinalisis',
        label: 'Urianálisis y Sedimento',
        icon: 'TestTubes',
        route: '/dashboard/medico/nefrologia/urinalisis',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Sedimento urinario, proteinuria, hematuria, cilindros',
      },
      {
        key: 'nefro-imagenologia',
        label: 'Imagenología Renal',
        icon: 'Scan',
        route: '/dashboard/medico/nefrologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Ecografía renal, Doppler, uro-TC, gammagrafía renal',
      },
    ],

    financial: [
      {
        key: 'nefro-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/nefrologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'nefro-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/nefrologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'nefro-calculadoras',
        label: 'Calculadoras Nefrológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/nefrologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'CKD-EPI, Cockcroft-Gault, Kt/V, FENa, anión gap, osmolaridad',
      },
      {
        key: 'nefro-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/nefrologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'KDIGO, KDOQI, NKF — guías de nefrología',
      },
    ],

    communication: [
      {
        key: 'nefro-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/nefrologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'nefro-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/nefrologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'nefro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/nefrologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'egfr-trends',
      component: '@/components/dashboard/medico/nefrologia/widgets/egfr-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'dialysis-patients',
      component: '@/components/dashboard/medico/nefrologia/widgets/dialysis-patients-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'transplant-follow-up',
      component: '@/components/dashboard/medico/nefrologia/widgets/transplant-follow-up-widget',
      size: 'medium',
    },
    {
      key: 'electrolyte-alerts',
      component: '@/components/dashboard/medico/nefrologia/widgets/electrolyte-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'ckd_progression_rate',
    'dialysis_adequacy',
    'transplant_function',
    'proteinuria_control',
    'electrolyte_monitoring',
    'vascular_access_patency',
  ],

  kpiDefinitions: {
    ckd_progression_rate: {
      label: 'Tasa de Progresión ERC (mL/min/año)',
      format: 'number',
      goal: 3,
      direction: 'lower_is_better',
    },
    dialysis_adequacy: {
      label: 'Adecuación Kt/V ≥ 1.2',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    transplant_function: {
      label: 'Función del Injerto Estable',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    proteinuria_control: {
      label: 'Control de Proteinuria',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    electrolyte_monitoring: {
      label: 'Adherencia Monitoreo Electrolitos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    vascular_access_patency: {
      label: 'Permeabilidad de Acceso Vascular',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_ckd',
      'control_dialisis',
      'post_trasplante',
      'evaluacion_acceso_vascular',
      'control_proteinuria',
      'resultado_biopsia',
      'evaluacion_pre_dialisis',
      'evaluacion_pre_trasplante',
      'urgencia_nefrologica',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_nefrologica',
      'examen_fisico_nefrologico',
      'evaluacion_ckd',
      'nota_dialisis',
      'seguimiento_trasplante',
      'evaluacion_proteinuria',
      'evaluacion_acceso_vascular',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksEGFR: true,
      requiresElectrolyteTracking: true,
      tracksDialysisAdequacy: true,
      supportsTransplantFollowUp: true,
      tracksProteinuria: true,
      requiresVascularAccessManagement: true,
    },
  },

  theme: {
    primaryColor: '#0EA5E9',
    accentColor: '#38BDF8',
    icon: 'Droplets',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEFROLOGÍA
// ============================================================================

/**
 * Estadios de Enfermedad Renal Crónica (KDIGO).
 */
export const CKD_STAGES = [
  { stage: 'G1', label: 'Normal o Alta', gfr: '≥ 90', risk: 'Bajo (si no hay daño renal)', color: '#22C55E' },
  { stage: 'G2', label: 'Levemente Disminuida', gfr: '60-89', risk: 'Bajo (si no hay daño renal)', color: '#84CC16' },
  { stage: 'G3a', label: 'Leve a Moderadamente Disminuida', gfr: '45-59', risk: 'Moderado', color: '#EAB308' },
  { stage: 'G3b', label: 'Moderada a Severamente Disminuida', gfr: '30-44', risk: 'Alto', color: '#F97316' },
  { stage: 'G4', label: 'Severamente Disminuida', gfr: '15-29', risk: 'Muy Alto', color: '#EF4444' },
  { stage: 'G5', label: 'Falla Renal', gfr: '< 15', risk: 'Extremo — diálisis/trasplante', color: '#DC2626' },
] as const;

/**
 * Parámetros de adecuación de diálisis.
 */
export const DIALYSIS_PARAMETERS = {
  hemodialysis: {
    label: 'Hemodiálisis',
    adequacy: [
      { key: 'kt_v', label: 'Kt/V', target: '≥ 1.2 (HD convencional)', frequency: 'Mensual' },
      { key: 'urr', label: 'URR (Tasa de Reducción de Urea)', target: '≥ 65%', frequency: 'Mensual' },
      { key: 'dry_weight', label: 'Peso Seco (kg)', target: 'Sin edema, sin hipotensión', frequency: 'Cada sesión' },
      { key: 'uf_rate', label: 'Tasa de UF (mL/kg/h)', target: '< 10 mL/kg/h', frequency: 'Cada sesión' },
      { key: 'session_time', label: 'Tiempo de Sesión (horas)', target: '≥ 4 horas', frequency: 'Cada sesión' },
    ],
  },
  peritoneal: {
    label: 'Diálisis Peritoneal',
    adequacy: [
      { key: 'weekly_kt_v', label: 'Kt/V Semanal', target: '≥ 1.7', frequency: 'Mensual' },
      { key: 'weekly_ccr', label: 'CCr Semanal (L/sem/1.73m²)', target: '≥ 50', frequency: 'Mensual' },
      { key: 'uf_volume', label: 'Volumen de UF Diario', target: '≥ 750 mL', frequency: 'Diario' },
      { key: 'pet', label: 'PET (Prueba de Equilibrio)', target: 'Clasificar transportador', frequency: 'Semestral' },
    ],
  },
} as const;

/**
 * Tipos de acceso vascular para hemodiálisis.
 */
export const VASCULAR_ACCESS_TYPES = [
  { key: 'avf', label: 'Fístula Arteriovenosa (FAV)', preferred: true, maturation: '6-8 semanas', patency1yr: '~85%' },
  { key: 'avg', label: 'Injerto Arteriovenoso', preferred: false, maturation: '2-4 semanas', patency1yr: '~70%' },
  { key: 'tunneled_catheter', label: 'Catéter Tunelizado', preferred: false, maturation: 'Inmediato', patency1yr: '~50%' },
  { key: 'non_tunneled_catheter', label: 'Catéter No Tunelizado', preferred: false, maturation: 'Inmediato', patency1yr: 'Temporal (< 3 sem)' },
] as const;
