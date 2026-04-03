/**
 * @file overrides/angiologia.ts
 * @description Override de configuracion para Angiologia.
 *
 * Cubre seguimiento de examenes vasculares, resultados Doppler,
 * medicion de ITB (ABI), mapeo venoso, estadificacion de enfermedad
 * arterial.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Angiologia.
 * Especialidad medica (no quirurgica) enfocada en patologia vascular.
 */
export const angiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'angiologia',
  dashboardPath: '/dashboard/medico/angiologia',

  modules: {
    clinical: [
      {
        key: 'angio-consulta',
        label: 'Consulta Angiologica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/angiologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'angio-doppler',
        label: 'Resultados Doppler',
        icon: 'Activity',
        route: '/dashboard/medico/angiologia/doppler',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'angio-itb',
        label: 'Medicion ITB (ABI)',
        icon: 'Gauge',
        route: '/dashboard/medico/angiologia/itb',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['abi_improvement_rate'],
      },
      {
        key: 'angio-mapeo-venoso',
        label: 'Mapeo Venoso',
        icon: 'GitBranch',
        route: '/dashboard/medico/angiologia/mapeo-venoso',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'angio-arterial',
        label: 'Estadificacion Enfermedad Arterial',
        icon: 'Layers',
        route: '/dashboard/medico/angiologia/arterial',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'angio-ulceras',
        label: 'Seguimiento de Ulceras',
        icon: 'CircleDot',
        route: '/dashboard/medico/angiologia/ulceras',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['ulcer_healing_rate'],
      },
    ],

    lab: [
      {
        key: 'angio-imagenologia',
        label: 'Imagenologia Vascular',
        icon: 'Scan',
        route: '/dashboard/medico/angiologia/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'angio-laboratorio',
        label: 'Laboratorio (Perfil Trombotico)',
        icon: 'FlaskConical',
        route: '/dashboard/medico/angiologia/laboratorio',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'angio-pletismografia',
        label: 'Pletismografia',
        icon: 'MonitorHeart',
        route: '/dashboard/medico/angiologia/pletismografia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'angio-calculadoras',
        label: 'Calculadoras Vasculares',
        icon: 'Calculator',
        route: '/dashboard/medico/angiologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'angio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/angiologia/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'angio-analytics',
        label: 'Analisis de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/angiologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'abi-tracking',
      component: '@/components/dashboard/medico/angiologia/widgets/abi-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'doppler-results',
      component: '@/components/dashboard/medico/angiologia/widgets/doppler-results-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ulcer-healing-tracker',
      component: '@/components/dashboard/medico/angiologia/widgets/ulcer-healing-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'arterial-staging',
      component: '@/components/dashboard/medico/angiologia/widgets/arterial-staging-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'abi_improvement_rate',
    'ulcer_healing_rate',
    'intervention_avoidance_rate',
    'doppler_compliance',
    'dvt_prevention_rate',
    'avg_consultation_duration',
  ],

  kpiDefinitions: {
    abi_improvement_rate: {
      label: 'Tasa de Mejora de ITB',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    ulcer_healing_rate: {
      label: 'Tasa de Cicatrizacion de Ulceras',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    intervention_avoidance_rate: {
      label: 'Tasa de Evitacion de Intervencion',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    doppler_compliance: {
      label: 'Adherencia a Doppler de Control',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    dvt_prevention_rate: {
      label: 'Tasa de Prevencion de TVP',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    avg_consultation_duration: {
      label: 'Duracion Promedio de Consulta',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'doppler_arterial',
      'doppler_venoso',
      'medicion_itb',
      'curacion_ulcera',
      'control_anticoagulacion',
      'evaluacion_pre_quirurgica',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_vascular',
      'informe_doppler',
      'registro_itb',
      'mapeo_venoso',
      'seguimiento_ulcera',
      'estadificacion_arterial',
      'plan_tratamiento_vascular',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksABIMeasurements: true,
      supportsDopplerIntegration: true,
      tracksVenousMapping: true,
      tracksArterialStaging: true,
      tracksUlcerHealing: true,
      supportsDVTRiskAssessment: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'GitBranch',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ANGIOLOGIA
// ============================================================================

/**
 * Clasificacion de Fontaine — Enfermedad Arterial Periferica
 */
export const FONTAINE_CLASSIFICATION = [
  { stage: 'I', label: 'Etapa I — Asintomatica', description: 'Enfermedad oclusion sin sintomas', treatment: 'Modificacion factores de riesgo' },
  { stage: 'IIa', label: 'Etapa IIa — Claudicacion leve', description: 'Claudicacion >200m', treatment: 'Ejercicio supervisado + farmacoterapia' },
  { stage: 'IIb', label: 'Etapa IIb — Claudicacion moderada-severa', description: 'Claudicacion <200m', treatment: 'Ejercicio + farmaco + considerar intervencion' },
  { stage: 'III', label: 'Etapa III — Dolor isquemico en reposo', description: 'Dolor nocturno / en reposo', treatment: 'Revascularizacion' },
  { stage: 'IV', label: 'Etapa IV — Necrosis / Gangrena', description: 'Ulcera o gangrena', treatment: 'Revascularizacion urgente' },
] as const;

/**
 * Interpretacion del Indice Tobillo-Brazo (ITB/ABI)
 */
export const ABI_INTERPRETATION = [
  { range: '>1.30', label: 'Arterias no compresibles', interpretation: 'Calcificacion arterial (Monckeberg)', severity: 'indeterminado' },
  { range: '1.00-1.30', label: 'Normal', interpretation: 'Sin enfermedad arterial significativa', severity: 'normal' },
  { range: '0.91-0.99', label: 'Limtrofe', interpretation: 'Posible enfermedad temprana', severity: 'borderline' },
  { range: '0.70-0.90', label: 'EAP leve', interpretation: 'Enfermedad arterial leve', severity: 'leve' },
  { range: '0.40-0.69', label: 'EAP moderada', interpretation: 'Enfermedad arterial moderada', severity: 'moderada' },
  { range: '<0.40', label: 'EAP severa', interpretation: 'Isquemia critica de miembros', severity: 'severa' },
] as const;
