/**
 * @file overrides/intervencionismo-vascular.ts
 * @description Override de configuracion para Intervencionismo Vascular.
 *
 * Cubre procedimientos endovasculares, seguimiento de stents, embolizacion,
 * trombolisis y complicaciones de sitio de acceso.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Intervencionismo Vascular.
 * Especialidad procedural minimamente invasiva sobre el territorio vascular.
 */
export const intervencionismoVascularOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'intervencionismo-vascular',
  dashboardPath: '/dashboard/medico/intervencionismo-vascular',

  modules: {
    clinical: [
      {
        key: 'intervvasc-consulta',
        label: 'Consulta de Intervencionismo',
        icon: 'Stethoscope',
        route: '/dashboard/medico/intervencionismo-vascular/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'intervvasc-endovascular',
        label: 'Procedimientos Endovasculares',
        icon: 'Target',
        route: '/dashboard/medico/intervencionismo-vascular/endovascular',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['technical_success_rate'],
      },
      {
        key: 'intervvasc-stents',
        label: 'Seguimiento de Stents',
        icon: 'Cylinder',
        route: '/dashboard/medico/intervencionismo-vascular/stents',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['reintervention_rate'],
      },
      {
        key: 'intervvasc-embolizacion',
        label: 'Embolizacion',
        icon: 'CircleDot',
        route: '/dashboard/medico/intervencionismo-vascular/embolizacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'intervvasc-trombolisis',
        label: 'Trombolisis',
        icon: 'Zap',
        route: '/dashboard/medico/intervencionismo-vascular/trombolisis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'intervvasc-acceso',
        label: 'Complicaciones de Sitio de Acceso',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/intervencionismo-vascular/acceso',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['complication_rate'],
      },
    ],

    lab: [
      {
        key: 'intervvasc-imagenologia',
        label: 'Imagenologia Vascular',
        icon: 'Scan',
        route: '/dashboard/medico/intervencionismo-vascular/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'intervvasc-angiografia',
        label: 'Angiografia',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/intervencionismo-vascular/angiografia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'intervvasc-laboratorio',
        label: 'Laboratorio (Coagulacion)',
        icon: 'FlaskConical',
        route: '/dashboard/medico/intervencionismo-vascular/laboratorio',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'intervvasc-calculadoras',
        label: 'Calculadoras de Intervencionismo',
        icon: 'Calculator',
        route: '/dashboard/medico/intervencionismo-vascular/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'intervvasc-planificacion',
        label: 'Planificacion de Procedimientos',
        icon: 'CalendarClock',
        route: '/dashboard/medico/intervencionismo-vascular/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'intervvasc-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/intervencionismo-vascular/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'intervvasc-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/intervencionismo-vascular/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'endovascular-procedures',
      component: '@/components/dashboard/medico/intervencionismo-vascular/widgets/endovascular-procedures-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'stent-follow-up',
      component: '@/components/dashboard/medico/intervencionismo-vascular/widgets/stent-follow-up-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'complication-tracker',
      component: '@/components/dashboard/medico/intervencionismo-vascular/widgets/complication-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'embolization-log',
      component: '@/components/dashboard/medico/intervencionismo-vascular/widgets/embolization-log-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'technical_success_rate',
    'reintervention_rate',
    'complication_rate',
    'access_site_complication_rate',
    'procedure_volume_monthly',
    'avg_fluoroscopy_time',
  ],

  kpiDefinitions: {
    technical_success_rate: {
      label: 'Tasa de Exito Tecnico',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    reintervention_rate: {
      label: 'Tasa de Reintervencion',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    access_site_complication_rate: {
      label: 'Complicaciones de Sitio de Acceso',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    procedure_volume_monthly: {
      label: 'Volumen de Procedimientos / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
    avg_fluoroscopy_time: {
      label: 'Tiempo Promedio de Fluoroscopia',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_pre_procedimiento',
      'angioplastia_programada',
      'embolizacion_programada',
      'trombolisis_programada',
      'control_post_stent',
      'seguimiento_embolizacion',
      'evaluacion_acceso_vascular',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_procedimiento',
      'informe_angioplastia',
      'informe_embolizacion',
      'informe_trombolisis',
      'registro_stent_vascular',
      'nota_complicacion_acceso',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      tracksEndovascularProcedures: true,
      tracksStentRegistry: true,
      supportsEmbolizationPlanning: true,
      supportsThrombolysis: true,
      tracksAccessSiteComplications: true,
      monitorsFluoroscopyTime: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Target',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — INTERVENCIONISMO VASCULAR
// ============================================================================

/**
 * Tipos de procedimientos endovasculares
 */
export const ENDOVASCULAR_PROCEDURE_TYPES = [
  { key: 'pta', label: 'Angioplastia Transluminal Percutanea (ATP)', territory: 'arterial', complexity: 'moderada' },
  { key: 'stenting', label: 'Colocacion de Stent', territory: 'arterial', complexity: 'moderada' },
  { key: 'embolization_coil', label: 'Embolizacion con Coils', territory: 'arterial', complexity: 'alta' },
  { key: 'embolization_particles', label: 'Embolizacion con Particulas', territory: 'arterial', complexity: 'moderada' },
  { key: 'thrombolysis_cdt', label: 'Trombolisis Dirigida por Cateter', territory: 'arterial/venoso', complexity: 'alta' },
  { key: 'thrombectomy_mechanical', label: 'Trombectomia Mecanica', territory: 'arterial/venoso', complexity: 'alta' },
  { key: 'ivc_filter', label: 'Filtro de Vena Cava Inferior', territory: 'venoso', complexity: 'moderada' },
  { key: 'venous_stenting', label: 'Stenting Venoso', territory: 'venoso', complexity: 'moderada' },
  { key: 'evar', label: 'EVAR (Reparacion Endovascular de Aneurisma)', territory: 'arterial', complexity: 'alta' },
  { key: 'tevar', label: 'TEVAR (Reparacion Endovascular Toracica)', territory: 'arterial', complexity: 'muy_alta' },
] as const;

/**
 * Clasificacion de complicaciones de acceso vascular
 */
export const ACCESS_SITE_COMPLICATIONS = [
  { key: 'hematoma_minor', label: 'Hematoma menor', severity: 'leve', management: 'Compresion manual' },
  { key: 'hematoma_major', label: 'Hematoma mayor', severity: 'moderada', management: 'Transfusion / cirugia' },
  { key: 'pseudoaneurysm', label: 'Pseudoaneurisma', severity: 'moderada', management: 'Compresion guiada por eco / trombina' },
  { key: 'avf', label: 'Fistula arteriovenosa', severity: 'moderada', management: 'Compresion guiada / cirugia' },
  { key: 'dissection', label: 'Diseccion arterial', severity: 'severa', management: 'Stent / cirugia' },
  { key: 'thrombosis', label: 'Trombosis arterial', severity: 'severa', management: 'Trombectomia / cirugia' },
  { key: 'retroperitoneal_bleed', label: 'Sangrado retroperitoneal', severity: 'critica', management: 'Transfusion + cirugia urgente' },
] as const;
