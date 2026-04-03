/**
 * @file overrides/cardiologia-pediatrica.ts
 * @description Override de configuracion para Cardiologia Pediatrica.
 *
 * Cubre seguimiento de cardiopatias congenitas, comparacion de
 * ecocardiogramas con crecimiento, planificacion quirurgica,
 * seguimiento Fontan y dosificacion de medicamentos por peso.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cardiologia Pediatrica.
 * Subespecialidad que combina cardiologia y pediatria con enfoque en congenitas.
 */
export const cardiologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cardiologia-pediatrica',
  dashboardPath: '/dashboard/medico/cardiologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'cardiopedi-consulta',
        label: 'Consulta de Cardiologia Pediatrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cardiologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'cardiopedi-congenitas',
        label: 'Seguimiento Cardiopatias Congenitas',
        icon: 'Heart',
        route: '/dashboard/medico/cardiologia-pediatrica/congenitas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes_rate'],
      },
      {
        key: 'cardiopedi-eco-crecimiento',
        label: 'Eco vs Crecimiento',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cardiologia-pediatrica/eco-crecimiento',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['echo_compliance_rate'],
      },
      {
        key: 'cardiopedi-quirurgica',
        label: 'Planificacion Quirurgica',
        icon: 'Scissors',
        route: '/dashboard/medico/cardiologia-pediatrica/quirurgica',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'cardiopedi-fontan',
        label: 'Seguimiento Fontan',
        icon: 'RefreshCw',
        route: '/dashboard/medico/cardiologia-pediatrica/fontan',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'cardiopedi-dosificacion',
        label: 'Dosificacion por Peso',
        icon: 'Scale',
        route: '/dashboard/medico/cardiologia-pediatrica/dosificacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cardiopedi-ecocardiograma',
        label: 'Ecocardiograma Pediatrico',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/cardiologia-pediatrica/ecocardiograma',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardiopedi-ecg',
        label: 'ECG Pediatrico',
        icon: 'Activity',
        route: '/dashboard/medico/cardiologia-pediatrica/ecg',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cardiopedi-imagenologia',
        label: 'Imagenologia Cardiaca',
        icon: 'Scan',
        route: '/dashboard/medico/cardiologia-pediatrica/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cardiopedi-calculadoras',
        label: 'Calculadoras Pediatricas',
        icon: 'Calculator',
        route: '/dashboard/medico/cardiologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardiopedi-curvas',
        label: 'Curvas de Crecimiento',
        icon: 'LineChart',
        route: '/dashboard/medico/cardiologia-pediatrica/curvas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cardiopedi-portal-familia',
        label: 'Portal de la Familia',
        icon: 'Users',
        route: '/dashboard/medico/cardiologia-pediatrica/portal-familia',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'cardiopedi-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cardiologia-pediatrica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cardiopedi-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cardiologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'congenital-defect-tracker',
      component: '@/components/dashboard/medico/cardiologia-pediatrica/widgets/congenital-defect-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'echo-growth-comparison',
      component: '@/components/dashboard/medico/cardiologia-pediatrica/widgets/echo-growth-comparison-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fontan-follow-up',
      component: '@/components/dashboard/medico/cardiologia-pediatrica/widgets/fontan-follow-up-widget',
      size: 'medium',
    },
    {
      key: 'weight-based-dosing',
      component: '@/components/dashboard/medico/cardiologia-pediatrica/widgets/weight-based-dosing-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'surgical_outcomes_rate',
    'growth_velocity_tracking',
    'echo_compliance_rate',
    'fontan_complication_rate',
    'medication_adherence',
    'readmission_rate',
  ],

  kpiDefinitions: {
    surgical_outcomes_rate: {
      label: 'Tasa de Resultados Quirurgicos Exitosos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    growth_velocity_tracking: {
      label: 'Velocidad de Crecimiento',
      format: 'number',
      direction: 'higher_is_better',
    },
    echo_compliance_rate: {
      label: 'Adherencia a Ecocardiogramas Programados',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    fontan_complication_rate: {
      label: 'Tasa de Complicaciones Fontan',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    medication_adherence: {
      label: 'Adherencia a Medicacion',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    readmission_rate: {
      label: 'Tasa de Reingresos',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_congenita',
      'control_post_quirurgico',
      'ecocardiograma_control',
      'seguimiento_fontan',
      'evaluacion_pre_quirurgica',
      'control_medicacion',
      'evaluacion_crecimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_cardiologica_pediatrica',
      'informe_ecocardiograma_pediatrico',
      'evaluacion_cardiopatia_congenita',
      'seguimiento_fontan',
      'dosificacion_pediatrica',
      'plan_quirurgico',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksCongenitalHeartDefects: true,
      supportsEchoGrowthComparison: true,
      requiresSurgicalPlanning: true,
      tracksFontanCirculation: true,
      supportsWeightBasedDosing: true,
      requiresGrowthMonitoring: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CARDIOLOGIA PEDIATRICA
// ============================================================================

/**
 * Cardiopatias congenitas mas frecuentes
 */
export const CONGENITAL_HEART_DEFECTS = [
  { key: 'vsd', label: 'Comunicacion Interventricular (CIV)', frequency: 'Mas comun (~30%)', cyanotic: false, surgeryLikelihood: 'variable' },
  { key: 'asd', label: 'Comunicacion Interauricular (CIA)', frequency: 'Comun (~10%)', cyanotic: false, surgeryLikelihood: 'variable' },
  { key: 'pda', label: 'Conducto Arterioso Persistente (PCA)', frequency: 'Comun (~10%)', cyanotic: false, surgeryLikelihood: 'alta_en_prematuros' },
  { key: 'tof', label: 'Tetralogia de Fallot', frequency: 'Moderada (~5%)', cyanotic: true, surgeryLikelihood: 'alta' },
  { key: 'tga', label: 'Transposicion de Grandes Arterias', frequency: 'Moderada (~5%)', cyanotic: true, surgeryLikelihood: 'urgente' },
  { key: 'coarctation', label: 'Coartacion de Aorta', frequency: 'Moderada (~5%)', cyanotic: false, surgeryLikelihood: 'alta' },
  { key: 'avsd', label: 'Defecto del Septo AV (Canal AV)', frequency: 'Moderada', cyanotic: false, surgeryLikelihood: 'alta' },
  { key: 'hlhs', label: 'Sindrome de Corazon Izquierdo Hipoplasico', frequency: 'Rara', cyanotic: true, surgeryLikelihood: 'urgente_multiestagio' },
  { key: 'truncus', label: 'Truncus Arterioso', frequency: 'Rara', cyanotic: true, surgeryLikelihood: 'urgente' },
  { key: 'tapvc', label: 'Drenaje Venoso Pulmonar Anomalo Total', frequency: 'Rara', cyanotic: true, surgeryLikelihood: 'urgente' },
] as const;

/**
 * Etapas de la circulacion Fontan
 */
export const FONTAN_STAGES = [
  { stage: 1, label: 'Etapa 1 — Norwood / Banding AP', ageRange: 'Neonatal', description: 'Paliacion inicial para corazon univentricular' },
  { stage: 2, label: 'Etapa 2 — Glenn / Hemi-Fontan', ageRange: '4-6 meses', description: 'Conexion cavopulmonar superior' },
  { stage: 3, label: 'Etapa 3 — Fontan (TCPC)', ageRange: '2-4 anos', description: 'Conexion cavopulmonar total' },
  { stage: 4, label: 'Seguimiento Post-Fontan', ageRange: 'De por vida', description: 'Monitorizacion de complicaciones a largo plazo' },
] as const;
