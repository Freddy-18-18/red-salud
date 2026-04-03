/**
 * @file overrides/cirugia-cardiovascular.ts
 * @description Override de configuracion para Cirugia Cardiovascular.
 *
 * Cubre planificacion CABG, registro de reemplazo valvular, seguimiento
 * de tiempo de bypass, seguimiento post-esternotomia y calculo de
 * EuroSCORE.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugia Cardiovascular.
 * Especialidad quirurgica de alta complejidad cardiotoraxica.
 */
export const cirugiaCardiovascularOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-cardiovascular',
  dashboardPath: '/dashboard/medico/cirugia-cardiovascular',

  modules: {
    clinical: [
      {
        key: 'circardio-consulta',
        label: 'Consulta de Cirugia CV',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-cardiovascular/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'circardio-cabg',
        label: 'Planificacion CABG',
        icon: 'GitBranch',
        route: '/dashboard/medico/cirugia-cardiovascular/cabg',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'circardio-valvulas',
        label: 'Registro de Reemplazo Valvular',
        icon: 'RefreshCw',
        route: '/dashboard/medico/cirugia-cardiovascular/valvulas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'circardio-bypass',
        label: 'Seguimiento Tiempo de Bypass',
        icon: 'Timer',
        route: '/dashboard/medico/cirugia-cardiovascular/bypass',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['bypass_time_avg'],
      },
      {
        key: 'circardio-esternotomia',
        label: 'Seguimiento Post-Esternotomia',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-cardiovascular/esternotomia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'circardio-euroscore',
        label: 'Calculo EuroSCORE',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-cardiovascular/euroscore',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['operative_mortality_rate'],
      },
    ],

    lab: [
      {
        key: 'circardio-imagenologia',
        label: 'Imagenologia Pre/Post Quirurgica',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-cardiovascular/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'circardio-laboratorio',
        label: 'Laboratorio Perioperatorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-cardiovascular/laboratorio',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'circardio-uci',
        label: 'Seguimiento UCI',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/cirugia-cardiovascular/uci',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['icu_stay_avg'],
      },
    ],

    technology: [
      {
        key: 'circardio-calculadoras',
        label: 'Calculadoras Quirurgicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-cardiovascular/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'circardio-quirofano',
        label: 'Planificacion Quirurgica',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-cardiovascular/quirofano',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'circardio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-cardiovascular/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'circardio-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-cardiovascular/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cabg-planner',
      component: '@/components/dashboard/medico/cirugia-cardiovascular/widgets/cabg-planner-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'valve-replacement-registry',
      component: '@/components/dashboard/medico/cirugia-cardiovascular/widgets/valve-replacement-registry-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'bypass-time-tracker',
      component: '@/components/dashboard/medico/cirugia-cardiovascular/widgets/bypass-time-tracker-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'euroscore-calculator',
      component: '@/components/dashboard/medico/cirugia-cardiovascular/widgets/euroscore-calculator-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'operative_mortality_rate',
    'bypass_time_avg',
    'icu_stay_avg',
    'thirty_day_readmission_rate',
    'surgical_site_infection_rate',
    'graft_patency_rate',
  ],

  kpiDefinitions: {
    operative_mortality_rate: {
      label: 'Mortalidad Operatoria',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    bypass_time_avg: {
      label: 'Tiempo Promedio de Bypass',
      format: 'duration',
      direction: 'lower_is_better',
    },
    icu_stay_avg: {
      label: 'Estancia Promedio en UCI',
      format: 'duration',
      direction: 'lower_is_better',
    },
    thirty_day_readmission_rate: {
      label: 'Tasa de Reingreso a 30 Dias',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    surgical_site_infection_rate: {
      label: 'Tasa de Infeccion de Sitio Quirurgico',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    graft_patency_rate: {
      label: 'Tasa de Permeabilidad de Injerto',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_pre_quirurgica',
      'control_post_quirurgico_temprano',
      'control_post_quirurgico_tardio',
      'seguimiento_esternotomia',
      'evaluacion_valvular',
      'planificacion_cabg',
      'rehabilitacion_cardiaca',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_quirurgica_cv',
      'informe_quirurgico',
      'informe_bypass',
      'registro_valvula',
      'nota_uci',
      'seguimiento_esternotomia',
      'consentimiento_quirurgico',
      'calculo_euroscore',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCABGPlanning: true,
      tracksValveRegistry: true,
      tracksBypassTime: true,
      requiresEuroSCORECalculation: true,
      tracksICUStay: true,
      tracksSternotomyFollowUp: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'Scissors',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGIA CARDIOVASCULAR
// ============================================================================

/**
 * Variables del EuroSCORE II
 */
export const EUROSCORE_VARIABLES = [
  { key: 'age', label: 'Edad', type: 'continuous', unit: 'anos' },
  { key: 'gender', label: 'Sexo', type: 'categorical', options: ['Masculino', 'Femenino'] },
  { key: 'creatinine_clearance', label: 'Aclaramiento de Creatinina', type: 'continuous', unit: 'mL/min' },
  { key: 'extracardiac_arteriopathy', label: 'Arteriopatia Extracardiaca', type: 'boolean' },
  { key: 'poor_mobility', label: 'Movilidad Reducida', type: 'boolean' },
  { key: 'previous_cardiac_surgery', label: 'Cirugia Cardiaca Previa', type: 'boolean' },
  { key: 'chronic_lung_disease', label: 'Enfermedad Pulmonar Cronica', type: 'boolean' },
  { key: 'active_endocarditis', label: 'Endocarditis Activa', type: 'boolean' },
  { key: 'critical_preop_state', label: 'Estado Critico Preoperatorio', type: 'boolean' },
  { key: 'diabetes_insulin', label: 'Diabetes con Insulina', type: 'boolean' },
  { key: 'nyha_class', label: 'Clase Funcional NYHA', type: 'categorical', options: ['I', 'II', 'III', 'IV'] },
  { key: 'ccs_angina_class', label: 'Clase CCS Angina', type: 'categorical', options: ['0', 'I', 'II', 'III', 'IV'] },
  { key: 'lv_function', label: 'Funcion VI', type: 'categorical', options: ['Buena (>50%)', 'Moderada (31-50%)', 'Pobre (21-30%)', 'Muy pobre (<=20%)'] },
  { key: 'recent_mi', label: 'IAM Reciente (<90 dias)', type: 'boolean' },
  { key: 'pulmonary_hypertension', label: 'Hipertension Pulmonar', type: 'categorical', options: ['No', 'Moderada (31-55mmHg)', 'Severa (>55mmHg)'] },
  { key: 'urgency', label: 'Urgencia', type: 'categorical', options: ['Electivo', 'Urgente', 'Emergencia', 'Salvamento'] },
  { key: 'procedure_weight', label: 'Peso del Procedimiento', type: 'categorical', options: ['CABG aislado', 'No CABG', 'Dos procedimientos', 'Tres+ procedimientos'] },
  { key: 'thoracic_aorta_surgery', label: 'Cirugia de Aorta Toracica', type: 'boolean' },
] as const;

/**
 * Tipos de valvulas protesicas
 */
export const PROSTHETIC_VALVE_TYPES = [
  { key: 'mechanical_bileaflet', label: 'Mecanica Bivalva (St. Jude / On-X)', durability: 'Permanente', anticoagulation: 'De por vida' },
  { key: 'mechanical_tilting', label: 'Mecanica Monodisco', durability: 'Permanente', anticoagulation: 'De por vida' },
  { key: 'bioprosthetic_porcine', label: 'Bioprotesis Porcina', durability: '10-15 anos', anticoagulation: '3-6 meses' },
  { key: 'bioprosthetic_pericardial', label: 'Bioprotesis Pericardio Bovino', durability: '10-20 anos', anticoagulation: '3-6 meses' },
  { key: 'homograft', label: 'Homoinjerto', durability: '15-20 anos', anticoagulation: 'No requerida' },
  { key: 'ross_procedure', label: 'Autoinjerto Pulmonar (Ross)', durability: '20+ anos', anticoagulation: 'No requerida' },
] as const;
