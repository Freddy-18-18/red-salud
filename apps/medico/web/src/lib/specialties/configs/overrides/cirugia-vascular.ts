/**
 * @file overrides/cirugia-vascular.ts
 * @description Override de configuracion para Cirugia Vascular.
 *
 * Cubre vigilancia de aneurismas, permeabilidad de injertos bypass,
 * planificacion endovascular, riesgo de amputacion y seguimiento
 * de heridas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugia Vascular.
 * Especialidad quirurgica enfocada en patologia vascular arterial y venosa.
 */
export const cirugiaVascularOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-vascular',
  dashboardPath: '/dashboard/medico/cirugia-vascular',

  modules: {
    clinical: [
      {
        key: 'cirvascular-consulta',
        label: 'Consulta de Cirugia Vascular',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-vascular/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'cirvascular-aneurismas',
        label: 'Vigilancia de Aneurismas',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/cirugia-vascular/aneurismas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cirvascular-bypass',
        label: 'Permeabilidad de Injertos Bypass',
        icon: 'GitBranch',
        route: '/dashboard/medico/cirugia-vascular/bypass',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['graft_patency_rate'],
      },
      {
        key: 'cirvascular-endovascular',
        label: 'Planificacion Endovascular',
        icon: 'Target',
        route: '/dashboard/medico/cirugia-vascular/endovascular',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'cirvascular-amputacion',
        label: 'Evaluacion Riesgo de Amputacion',
        icon: 'AlertCircle',
        route: '/dashboard/medico/cirugia-vascular/amputacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['limb_salvage_rate'],
      },
      {
        key: 'cirvascular-heridas',
        label: 'Seguimiento de Heridas',
        icon: 'CircleDot',
        route: '/dashboard/medico/cirugia-vascular/heridas',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cirvascular-imagenologia',
        label: 'Imagenologia Vascular',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-vascular/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirvascular-doppler',
        label: 'Doppler Vascular',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-vascular/doppler',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cirvascular-laboratorio',
        label: 'Laboratorio Perioperatorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-vascular/laboratorio',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirvascular-calculadoras',
        label: 'Calculadoras Vasculares',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-vascular/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirvascular-quirofano',
        label: 'Planificacion Quirurgica',
        icon: 'Scissors',
        route: '/dashboard/medico/cirugia-vascular/quirofano',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirvascular-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-vascular/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirvascular-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-vascular/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'aneurysm-surveillance',
      component: '@/components/dashboard/medico/cirugia-vascular/widgets/aneurysm-surveillance-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'graft-patency-tracker',
      component: '@/components/dashboard/medico/cirugia-vascular/widgets/graft-patency-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'limb-salvage-kpi',
      component: '@/components/dashboard/medico/cirugia-vascular/widgets/limb-salvage-kpi-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'wound-tracking',
      component: '@/components/dashboard/medico/cirugia-vascular/widgets/wound-tracking-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'graft_patency_rate',
    'limb_salvage_rate',
    'operative_mortality_rate',
    'aneurysm_repair_success',
    'wound_healing_rate',
    'thirty_day_readmission_rate',
  ],

  kpiDefinitions: {
    graft_patency_rate: {
      label: 'Tasa de Permeabilidad de Injerto',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    limb_salvage_rate: {
      label: 'Tasa de Salvamento de Extremidad',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    operative_mortality_rate: {
      label: 'Mortalidad Operatoria',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    aneurysm_repair_success: {
      label: 'Exito en Reparacion de Aneurisma',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    wound_healing_rate: {
      label: 'Tasa de Cicatrizacion de Heridas',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    thirty_day_readmission_rate: {
      label: 'Tasa de Reingreso a 30 Dias',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_aneurisma',
      'control_bypass',
      'evaluacion_pre_quirurgica',
      'control_post_quirurgico',
      'curacion_herida',
      'evaluacion_amputacion',
      'planificacion_endovascular',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_vascular_quirurgica',
      'vigilancia_aneurisma',
      'seguimiento_injerto',
      'planificacion_endovascular',
      'evaluacion_amputacion',
      'seguimiento_herida',
      'consentimiento_quirurgico',
      'informe_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksAneurysmSurveillance: true,
      tracksGraftPatency: true,
      supportsEndovascularPlanning: true,
      tracksAmputationRisk: true,
      tracksWoundHealing: true,
      requiresSurgicalPlanning: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Scissors',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGIA VASCULAR
// ============================================================================

/**
 * Clasificacion de aneurismas aorticos abdominales
 */
export const AAA_CLASSIFICATION = [
  { size: '<3.0cm', label: 'Ectasia aortica', surveillance: 'No requiere seguimiento especifico', intervention: 'No' },
  { size: '3.0-3.9cm', label: 'Aneurisma pequeno', surveillance: 'Eco cada 12 meses', intervention: 'No' },
  { size: '4.0-4.9cm', label: 'Aneurisma mediano', surveillance: 'Eco cada 6 meses', intervention: 'Considerar si crecimiento rapido' },
  { size: '5.0-5.4cm', label: 'Aneurisma grande', surveillance: 'Eco cada 3 meses', intervention: 'Considerar reparacion' },
  { size: '>=5.5cm', label: 'Aneurisma indicacion quirurgica', surveillance: 'Evaluacion quirurgica', intervention: 'Reparacion recomendada' },
] as const;

/**
 * Clasificacion WIfI — riesgo de amputacion
 */
export const WIFI_CLASSIFICATION = [
  { component: 'W (Wound)', grade0: 'Sin ulcera', grade1: 'Ulcera pequena superficial', grade2: 'Ulcera profunda', grade3: 'Gangrena extensa' },
  { component: 'I (Ischemia)', grade0: 'ITB >=0.80', grade1: 'ITB 0.60-0.79', grade2: 'ITB 0.40-0.59', grade3: 'ITB <0.40' },
  { component: 'fI (foot Infection)', grade0: 'Sin infeccion', grade1: 'Infeccion leve', grade2: 'Infeccion moderada', grade3: 'Infeccion severa / SIRS' },
] as const;
