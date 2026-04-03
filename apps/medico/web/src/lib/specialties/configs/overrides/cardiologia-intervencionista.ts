/**
 * @file overrides/cardiologia-intervencionista.ts
 * @description Override de configuracion para Cardiologia Intervencionista.
 *
 * Cubre cateterismo cardiaco, registro de stents, planificacion de
 * angioplastia, seguimiento de complicaciones y monitorizacion de
 * dosis de contraste.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cardiologia Intervencionista.
 * Especialidad procedural centrada en el laboratorio de hemodinamica.
 */
export const cardiologiaIntervencionistaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cardiologia-intervencionista',
  dashboardPath: '/dashboard/medico/cardiologia-intervencionista',

  modules: {
    clinical: [
      {
        key: 'cardiointerv-consulta',
        label: 'Consulta Intervencionista',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cardiologia-intervencionista/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'cardiointerv-cateterismo',
        label: 'Cateterismo Cardiaco',
        icon: 'HeartPulse',
        route: '/dashboard/medico/cardiologia-intervencionista/cateterismo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['procedural_success_rate'],
      },
      {
        key: 'cardiointerv-angioplastia',
        label: 'Planificacion de Angioplastia',
        icon: 'Target',
        route: '/dashboard/medico/cardiologia-intervencionista/angioplastia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'cardiointerv-stents',
        label: 'Registro de Stents',
        icon: 'Cylinder',
        route: '/dashboard/medico/cardiologia-intervencionista/stents',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'cardiointerv-complicaciones',
        label: 'Seguimiento de Complicaciones',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/cardiologia-intervencionista/complicaciones',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['complication_rate'],
      },
      {
        key: 'cardiointerv-contraste',
        label: 'Monitorizacion Dosis de Contraste',
        icon: 'Droplets',
        route: '/dashboard/medico/cardiologia-intervencionista/contraste',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cardiointerv-coronariografia',
        label: 'Coronariografia',
        icon: 'Scan',
        route: '/dashboard/medico/cardiologia-intervencionista/coronariografia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardiointerv-imagenologia',
        label: 'Imagenologia Cardiaca',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/cardiologia-intervencionista/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cardiointerv-laboratorio',
        label: 'Marcadores Cardiacos',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cardiologia-intervencionista/laboratorio',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cardiointerv-calculadoras',
        label: 'Calculadoras Hemodinamicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cardiologia-intervencionista/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cardiointerv-planificacion',
        label: 'Planificacion de Procedimientos',
        icon: 'CalendarClock',
        route: '/dashboard/medico/cardiologia-intervencionista/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cardiointerv-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/cardiologia-intervencionista/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cardiointerv-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cardiologia-intervencionista/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'catheterization-tracker',
      component: '@/components/dashboard/medico/cardiologia-intervencionista/widgets/catheterization-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'stent-registry',
      component: '@/components/dashboard/medico/cardiologia-intervencionista/widgets/stent-registry-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'contrast-dose-monitor',
      component: '@/components/dashboard/medico/cardiologia-intervencionista/widgets/contrast-dose-monitor-widget',
      size: 'small',
      required: true,
    },
    {
      key: 'door-to-balloon-kpi',
      component: '@/components/dashboard/medico/cardiologia-intervencionista/widgets/door-to-balloon-kpi-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'procedural_success_rate',
    'complication_rate',
    'door_to_balloon_time',
    'stent_thrombosis_rate',
    'contrast_nephropathy_rate',
    'avg_procedure_time',
  ],

  kpiDefinitions: {
    procedural_success_rate: {
      label: 'Tasa de Exito de Procedimientos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    door_to_balloon_time: {
      label: 'Tiempo Puerta-Balon',
      format: 'duration',
      goal: 90,
      direction: 'lower_is_better',
    },
    stent_thrombosis_rate: {
      label: 'Tasa de Trombosis de Stent',
      format: 'percentage',
      goal: 0.01,
      direction: 'lower_is_better',
    },
    contrast_nephropathy_rate: {
      label: 'Tasa de Nefropatia por Contraste',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    avg_procedure_time: {
      label: 'Tiempo Promedio de Procedimiento',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_pre_procedimiento',
      'cateterismo_diagnostico',
      'angioplastia_programada',
      'control_post_stent',
      'seguimiento_complicaciones',
      'evaluacion_urgente',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_cateterismo',
      'informe_cateterismo',
      'informe_angioplastia',
      'registro_stent',
      'consentimiento_procedimiento',
      'nota_complicacion',
      'seguimiento_post_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCathLabScheduling: true,
      tracksStentRegistry: true,
      monitorsContrastDose: true,
      tracksDoorToBalloonTime: true,
      requiresAngiographyReview: true,
      supportsFFRMeasurement: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'HeartPulse',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CARDIOLOGIA INTERVENCIONISTA
// ============================================================================

/**
 * Clasificacion de lesiones coronarias (ACC/AHA)
 */
export const CORONARY_LESION_TYPES = [
  { type: 'A', label: 'Tipo A — Baja complejidad', successRate: '>85%', description: 'Discreta (<10mm), concentrica, facilmente accesible, no angulada, contorno liso' },
  { type: 'B1', label: 'Tipo B1 — Complejidad moderada (1 factor)', successRate: '60-85%', description: 'Tubular (10-20mm), excentrica, tortuosidad moderada, angulacion 45-90 grados' },
  { type: 'B2', label: 'Tipo B2 — Complejidad moderada (>=2 factores)', successRate: '60-85%', description: 'Dos o mas caracteristicas tipo B' },
  { type: 'C', label: 'Tipo C — Alta complejidad', successRate: '<60%', description: 'Difusa (>20mm), tortuosidad excesiva, angulacion >90 grados, oclusion total' },
] as const;

/**
 * Tipos de stent de uso comun
 */
export const STENT_TYPES = [
  { key: 'des_everolimus', label: 'DES - Everolimus (Xience)', generation: '2da', drugType: 'Everolimus', platform: 'Cromo-cobalto' },
  { key: 'des_zotarolimus', label: 'DES - Zotarolimus (Resolute)', generation: '2da', drugType: 'Zotarolimus', platform: 'Cromo-cobalto' },
  { key: 'des_sirolimus', label: 'DES - Sirolimus (Orsiro)', generation: '3ra', drugType: 'Sirolimus', platform: 'Magnesio biodegradable' },
  { key: 'bms', label: 'BMS - Metalico sin farmaco', generation: '1ra', drugType: 'Ninguno', platform: 'Acero inoxidable' },
  { key: 'bvs', label: 'BVS - Bioabsorbible', generation: 'Experimental', drugType: 'Everolimus', platform: 'Acido polilactico' },
] as const;
