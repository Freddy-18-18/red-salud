/**
 * @file overrides/electrofisiologia-cardiaca.ts
 * @description Override de configuracion para Electrofisiologia Cardiaca.
 *
 * Cubre estudios electrofisiologicos, mapeo de ablacion, registro de
 * dispositivos implantables (marcapasos/DAI), clasificacion de arritmias
 * y monitorizacion remota.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Electrofisiologia Cardiaca.
 * Subespecialidad cardiologica centrada en arritmias y dispositivos.
 */
export const electrofisiologiaCardiacaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'electrofisiologia-cardiaca',
  dashboardPath: '/dashboard/medico/electrofisiologia-cardiaca',

  modules: {
    clinical: [
      {
        key: 'electro-consulta',
        label: 'Consulta de Electrofisiologia',
        icon: 'Stethoscope',
        route: '/dashboard/medico/electrofisiologia-cardiaca/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'electro-ep-study',
        label: 'Estudio Electrofisiologico',
        icon: 'Zap',
        route: '/dashboard/medico/electrofisiologia-cardiaca/ep-study',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ablation_success_rate'],
      },
      {
        key: 'electro-ablacion',
        label: 'Mapeo y Ablacion',
        icon: 'MapPin',
        route: '/dashboard/medico/electrofisiologia-cardiaca/ablacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'electro-dispositivos',
        label: 'Registro de Dispositivos Implantables',
        icon: 'Cpu',
        route: '/dashboard/medico/electrofisiologia-cardiaca/dispositivos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['device_implants_per_month'],
      },
      {
        key: 'electro-arritmias',
        label: 'Clasificacion de Arritmias',
        icon: 'Activity',
        route: '/dashboard/medico/electrofisiologia-cardiaca/arritmias',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'electro-monitorizacion',
        label: 'Monitorizacion Remota',
        icon: 'Wifi',
        route: '/dashboard/medico/electrofisiologia-cardiaca/monitorizacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['inappropriate_shocks_rate'],
      },
    ],

    lab: [
      {
        key: 'electro-ecg',
        label: 'ECG / Holter',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/electrofisiologia-cardiaca/ecg',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'electro-imagenologia',
        label: 'Imagenologia Cardiaca',
        icon: 'Scan',
        route: '/dashboard/medico/electrofisiologia-cardiaca/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'electro-interrogacion',
        label: 'Interrogacion de Dispositivos',
        icon: 'Radio',
        route: '/dashboard/medico/electrofisiologia-cardiaca/interrogacion',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'electro-calculadoras',
        label: 'Calculadoras de Electrofisiologia',
        icon: 'Calculator',
        route: '/dashboard/medico/electrofisiologia-cardiaca/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'electro-planificacion',
        label: 'Planificacion de Procedimientos',
        icon: 'CalendarClock',
        route: '/dashboard/medico/electrofisiologia-cardiaca/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'electro-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/electrofisiologia-cardiaca/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'electro-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/electrofisiologia-cardiaca/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ablation-outcomes',
      component: '@/components/dashboard/medico/electrofisiologia-cardiaca/widgets/ablation-outcomes-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'device-registry',
      component: '@/components/dashboard/medico/electrofisiologia-cardiaca/widgets/device-registry-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'remote-monitoring-alerts',
      component: '@/components/dashboard/medico/electrofisiologia-cardiaca/widgets/remote-monitoring-alerts-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'arrhythmia-classification',
      component: '@/components/dashboard/medico/electrofisiologia-cardiaca/widgets/arrhythmia-classification-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'ablation_success_rate',
    'device_implants_per_month',
    'inappropriate_shocks_rate',
    'procedure_complication_rate',
    'remote_monitoring_compliance',
    'avg_procedure_duration',
  ],

  kpiDefinitions: {
    ablation_success_rate: {
      label: 'Tasa de Exito de Ablacion',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    device_implants_per_month: {
      label: 'Implantes de Dispositivos / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
    inappropriate_shocks_rate: {
      label: 'Tasa de Descargas Inapropiadas',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    procedure_complication_rate: {
      label: 'Tasa de Complicaciones de Procedimientos',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    remote_monitoring_compliance: {
      label: 'Adherencia a Monitorizacion Remota',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    avg_procedure_duration: {
      label: 'Duracion Promedio de Procedimiento',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_arritmia',
      'control_dispositivo',
      'pre_ablacion',
      'post_ablacion',
      'interrogacion_marcapasos',
      'interrogacion_dai',
      'evaluacion_sincope',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_arritmia',
      'informe_ep_study',
      'informe_ablacion',
      'registro_dispositivo',
      'interrogacion_dispositivo',
      'consentimiento_procedimiento',
      'nota_monitorizacion_remota',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresEPStudyLab: true,
      tracksDeviceRegistry: true,
      supportsRemoteMonitoring: true,
      tracksAblationMapping: true,
      requiresArrhythmiaClassification: true,
      monitorsInappropriateShocks: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'Zap',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ELECTROFISIOLOGIA CARDIACA
// ============================================================================

/**
 * Clasificacion de arritmias cardiacas principales
 */
export const ARRHYTHMIA_CLASSIFICATION = [
  { key: 'afib', label: 'Fibrilacion Auricular', type: 'supraventricular', urgency: 'variable', ablatable: true },
  { key: 'aflutter', label: 'Flutter Auricular', type: 'supraventricular', urgency: 'moderada', ablatable: true },
  { key: 'avnrt', label: 'TRNAV', type: 'supraventricular', urgency: 'baja', ablatable: true },
  { key: 'avrt', label: 'TRAV (WPW)', type: 'supraventricular', urgency: 'moderada', ablatable: true },
  { key: 'vt_monomorphic', label: 'TV Monomorfica', type: 'ventricular', urgency: 'alta', ablatable: true },
  { key: 'vt_polymorphic', label: 'TV Polimorfica', type: 'ventricular', urgency: 'critica', ablatable: false },
  { key: 'vfib', label: 'Fibrilacion Ventricular', type: 'ventricular', urgency: 'critica', ablatable: false },
  { key: 'sss', label: 'Sindrome del Seno Enfermo', type: 'bradicardia', urgency: 'moderada', ablatable: false },
  { key: 'av_block', label: 'Bloqueo AV', type: 'bradicardia', urgency: 'variable', ablatable: false },
] as const;

/**
 * Tipos de dispositivos cardiacos implantables
 */
export const CARDIAC_DEVICE_TYPES = [
  { key: 'ppm_single', label: 'Marcapasos Unicameral', chambers: 1, defibCapable: false },
  { key: 'ppm_dual', label: 'Marcapasos Bicameral', chambers: 2, defibCapable: false },
  { key: 'ppm_crt', label: 'Marcapasos Resincronizador (CRT-P)', chambers: 3, defibCapable: false },
  { key: 'icd_single', label: 'DAI Unicameral', chambers: 1, defibCapable: true },
  { key: 'icd_dual', label: 'DAI Bicameral', chambers: 2, defibCapable: true },
  { key: 'crt_d', label: 'DAI Resincronizador (CRT-D)', chambers: 3, defibCapable: true },
  { key: 'icd_subcutaneous', label: 'DAI Subcutaneo (S-ICD)', chambers: 0, defibCapable: true },
  { key: 'ilr', label: 'Monitor Cardiaco Implantable (ILR)', chambers: 0, defibCapable: false },
] as const;
