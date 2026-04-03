/**
 * @file overrides/flebologia.ts
 * @description Override de configuracion para Flebologia.
 *
 * Cubre estadificacion de insuficiencia venosa (CEAP), seguimiento de
 * escleroterapia, mapeo de varices, terapia de compresion y riesgo de TVP.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Flebologia.
 * Especialidad enfocada en la patologia venosa cronica.
 */
export const flebologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'flebologia',
  dashboardPath: '/dashboard/medico/flebologia',

  modules: {
    clinical: [
      {
        key: 'flebo-consulta',
        label: 'Consulta Flebologica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/flebologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'flebo-ceap',
        label: 'Estadificacion CEAP',
        icon: 'Layers',
        route: '/dashboard/medico/flebologia/ceap',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ceap_improvement_rate'],
      },
      {
        key: 'flebo-escleroterapia',
        label: 'Seguimiento Escleroterapia',
        icon: 'Syringe',
        route: '/dashboard/medico/flebologia/escleroterapia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['procedure_satisfaction_rate'],
      },
      {
        key: 'flebo-mapeo-varicoso',
        label: 'Mapeo de Varices',
        icon: 'Waves',
        route: '/dashboard/medico/flebologia/mapeo-varicoso',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'flebo-compresion',
        label: 'Terapia de Compresion',
        icon: 'ArrowDownUp',
        route: '/dashboard/medico/flebologia/compresion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'flebo-tvp',
        label: 'Evaluacion Riesgo de TVP',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/flebologia/tvp',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['dvt_prevention_rate'],
      },
    ],

    lab: [
      {
        key: 'flebo-doppler',
        label: 'Doppler Venoso',
        icon: 'Activity',
        route: '/dashboard/medico/flebologia/doppler',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'flebo-imagenologia',
        label: 'Imagenologia Venosa',
        icon: 'Scan',
        route: '/dashboard/medico/flebologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'flebo-laboratorio',
        label: 'Laboratorio (Trombofilia)',
        icon: 'FlaskConical',
        route: '/dashboard/medico/flebologia/laboratorio',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'flebo-calculadoras',
        label: 'Calculadoras Flebologicas',
        icon: 'Calculator',
        route: '/dashboard/medico/flebologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'flebo-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/flebologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'flebo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/flebologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'flebo-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/flebologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ceap-staging-overview',
      component: '@/components/dashboard/medico/flebologia/widgets/ceap-staging-overview-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'sclerotherapy-tracker',
      component: '@/components/dashboard/medico/flebologia/widgets/sclerotherapy-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'dvt-risk-assessment',
      component: '@/components/dashboard/medico/flebologia/widgets/dvt-risk-assessment-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'varicose-mapping',
      component: '@/components/dashboard/medico/flebologia/widgets/varicose-mapping-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'ceap_improvement_rate',
    'procedure_satisfaction_rate',
    'dvt_prevention_rate',
    'sclerotherapy_success_rate',
    'compression_compliance',
    'recurrence_rate',
  ],

  kpiDefinitions: {
    ceap_improvement_rate: {
      label: 'Tasa de Mejora CEAP',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    procedure_satisfaction_rate: {
      label: 'Satisfaccion con Procedimientos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    dvt_prevention_rate: {
      label: 'Tasa de Prevencion de TVP',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    sclerotherapy_success_rate: {
      label: 'Tasa de Exito de Escleroterapia',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    compression_compliance: {
      label: 'Adherencia a Terapia Compresiva',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    recurrence_rate: {
      label: 'Tasa de Recurrencia',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'escleroterapia_programada',
      'control_post_escleroterapia',
      'doppler_venoso',
      'evaluacion_compresion',
      'evaluacion_tvp',
      'control_varices',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_flebologica',
      'estadificacion_ceap',
      'informe_escleroterapia',
      'mapeo_varicoso',
      'prescripcion_compresion',
      'evaluacion_riesgo_tvp',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      supportsCEAPStaging: true,
      tracksSclerotherapy: true,
      supportsVaricoseMapping: true,
      tracksCompressionTherapy: true,
      tracksDVTRisk: true,
      supportsCosmeticOutcomeTracking: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Waves',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — FLEBOLOGIA
// ============================================================================

/**
 * Clasificacion CEAP — Insuficiencia Venosa Cronica
 */
export const CEAP_CLASSIFICATION = [
  { class: 'C0', label: 'C0 — Sin signos visibles o palpables', description: 'Sin evidencia clinica de enfermedad venosa' },
  { class: 'C1', label: 'C1 — Telangiectasias / Venas reticulares', description: 'Aranas vasculares y venas reticulares <3mm' },
  { class: 'C2', label: 'C2 — Venas varicosas', description: 'Varices >3mm de diametro' },
  { class: 'C3', label: 'C3 — Edema', description: 'Edema sin cambios cutaneos' },
  { class: 'C4a', label: 'C4a — Pigmentacion / Eccema', description: 'Cambios cutaneos: pigmentacion o eccema venoso' },
  { class: 'C4b', label: 'C4b — Lipodermatoesclerosis / Atrofia blanca', description: 'Cambios cutaneos avanzados' },
  { class: 'C5', label: 'C5 — Ulcera venosa cicatrizada', description: 'Ulcera previa curada' },
  { class: 'C6', label: 'C6 — Ulcera venosa activa', description: 'Ulcera venosa abierta' },
] as const;

/**
 * Agentes esclerosantes de uso comun
 */
export const SCLEROSING_AGENTS = [
  { key: 'polidocanol', label: 'Polidocanol (Aethoxysklerol)', type: 'detergente', concentrations: ['0.25%', '0.5%', '1%', '2%', '3%'], usedFor: 'Telangiectasias a varices medianas' },
  { key: 'sodium_tetradecyl', label: 'Tetradecil Sulfato de Sodio (STS)', type: 'detergente', concentrations: ['0.1%', '0.25%', '0.5%', '1%', '3%'], usedFor: 'Varices medianas a grandes' },
  { key: 'glycerin_chromated', label: 'Glicerina Cromada', type: 'osmotico', concentrations: ['72%'], usedFor: 'Telangiectasias' },
  { key: 'hypertonic_saline', label: 'Solucion Salina Hipertonica', type: 'osmotico', concentrations: ['20%', '23.4%'], usedFor: 'Telangiectasias' },
] as const;

/**
 * Score de Wells para TVP
 */
export const WELLS_DVT_CRITERIA = [
  { criterion: 'Cancer activo (tratamiento en 6 meses o paliativo)', points: 1 },
  { criterion: 'Paralisis, paresia o inmovilizacion reciente de extremidad inferior', points: 1 },
  { criterion: 'Encamamiento >3 dias o cirugia mayor en 12 semanas', points: 1 },
  { criterion: 'Sensibilidad localizada a lo largo del sistema venoso profundo', points: 1 },
  { criterion: 'Edema de toda la pierna', points: 1 },
  { criterion: 'Edema de pantorrilla >3cm vs asintomatica', points: 1 },
  { criterion: 'Edema con fovea (mayor en pierna sintomatica)', points: 1 },
  { criterion: 'Venas superficiales colaterales (no varicosas)', points: 1 },
  { criterion: 'TVP previa documentada', points: 1 },
  { criterion: 'Diagnostico alternativo igual o mas probable', points: -2 },
] as const;
