/**
 * @file overrides/cirugia-laparoscopica.ts
 * @description Override de configuración para Cirugía Laparoscópica.
 *
 * Módulos especializados: documentación de colocación de trócares,
 * seguimiento de tasa de conversión, tiempo operatorio, índice de
 * grabación de video, rastreo de instrumental.
 *
 * KPIs: tasa de conversión, tiempo operatorio, tasa de complicaciones.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Laparoscópica.
 * Especialidad quirúrgica mínimamente invasiva con énfasis en
 * documentación técnica y métricas de rendimiento.
 */
export const cirugiaLaparoscopicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-laparoscopica',
  dashboardPath: '/dashboard/medico/cirugia-laparoscopica',

  modules: {
    clinical: [
      {
        key: 'cirlaparo-consulta',
        label: 'Consulta Laparoscópica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-laparoscopica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirlaparo-trocares',
        label: 'Documentación de Trócares',
        icon: 'MapPin',
        route: '/dashboard/medico/cirugia-laparoscopica/trocares',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Registro de posición, tamaño y técnica de inserción de trócares',
      },
      {
        key: 'cirlaparo-nota-operatoria',
        label: 'Nota Operatoria Laparoscópica',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-laparoscopica/nota-operatoria',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Hallazgos, procedimiento, presión de neumoperitoneo, conversión',
      },
      {
        key: 'cirlaparo-conversion',
        label: 'Registro de Conversiones',
        icon: 'RefreshCw',
        route: '/dashboard/medico/cirugia-laparoscopica/conversion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Documentación de conversión a cirugía abierta, motivo y desenlace',
      },
      {
        key: 'cirlaparo-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-laparoscopica/postop',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cirlaparo-prequirurgico',
        label: 'Laboratorio Pre-Quirúrgico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-laparoscopica/prequirurgico',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirlaparo-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-laparoscopica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirlaparo-video',
        label: 'Índice de Video Quirúrgico',
        icon: 'Video',
        route: '/dashboard/medico/cirugia-laparoscopica/video',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Catálogo de grabaciones de procedimientos laparoscópicos',
      },
      {
        key: 'cirlaparo-instrumental',
        label: 'Rastreo de Instrumental',
        icon: 'Wrench',
        route: '/dashboard/medico/cirugia-laparoscopica/instrumental',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Inventario y estado de instrumental laparoscópico',
      },
      {
        key: 'cirlaparo-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-laparoscopica/planificacion',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirlaparo-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-laparoscopica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirlaparo-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-laparoscopica/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirlaparo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-laparoscopica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'conversion-rate',
      component: '@/components/dashboard/medico/cirugia-laparoscopica/widgets/conversion-rate-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'operative-time-trend',
      component: '@/components/dashboard/medico/cirugia-laparoscopica/widgets/operative-time-trend-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-laparoscopica/widgets/upcoming-surgeries-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'video-library',
      component: '@/components/dashboard/medico/cirugia-laparoscopica/widgets/video-library-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'conversion_rate',
    'avg_operative_time',
    'complication_rate',
    'surgical_volume_monthly',
    'video_documentation_rate',
    'instrument_utilization',
  ],

  kpiDefinitions: {
    conversion_rate: {
      label: 'Tasa de Conversión a Cirugía Abierta',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    avg_operative_time: {
      label: 'Tiempo Operatorio Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    surgical_volume_monthly: {
      label: 'Volumen Quirúrgico Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
    video_documentation_rate: {
      label: 'Tasa de Documentación con Video',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    instrument_utilization: {
      label: 'Utilización de Instrumental',
      format: 'percentage',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento',
      'revision_video',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_quirurgica',
      'examen_fisico_prequirurgico',
      'nota_operatoria_laparoscopica',
      'documentacion_trocares',
      'registro_conversion',
      'evolucion_postquirurgica',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      tracksTrocarPlacement: true,
      tracksConversionRate: true,
      requiresVideoDocumentation: true,
      tracksInstrumentInventory: true,
      recordsPneumoperitoneumPressure: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Monitor',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA LAPAROSCÓPICA
// ============================================================================

/**
 * Posiciones estándar de trócares por procedimiento.
 */
export const TROCAR_POSITIONS = [
  { procedure: 'colecistectomia', label: 'Colecistectomía Laparoscópica', trocarCount: 4, positions: ['Umbilical (10mm)', 'Epigástrico (10mm)', 'Subcostal derecho (5mm)', 'Flanco derecho (5mm)'] },
  { procedure: 'apendicectomia', label: 'Apendicectomía Laparoscópica', trocarCount: 3, positions: ['Umbilical (10mm)', 'Suprapúbico (5mm)', 'Fosa ilíaca izquierda (5mm)'] },
  { procedure: 'hernioplastia_inguinal', label: 'Hernioplastia Inguinal (TAPP/TEP)', trocarCount: 3, positions: ['Umbilical (10mm)', 'Paraumbilical derecho (5mm)', 'Paraumbilical izquierdo (5mm)'] },
  { procedure: 'fundoplicatura', label: 'Fundoplicatura de Nissen', trocarCount: 5, positions: ['Umbilical (10mm)', 'Epigástrico (5mm)', 'Subcostal izquierdo (10mm)', 'Hipocondrio izquierdo (5mm)', 'Subxifoideo (5mm retractor hepático)'] },
  { procedure: 'colectomia', label: 'Colectomía Laparoscópica', trocarCount: 4, positions: ['Umbilical (12mm)', 'Suprapúbico (12mm)', 'Fosa ilíaca derecha (5mm)', 'Hipocondrio derecho (5mm)'] },
] as const;

/**
 * Motivos comunes de conversión a cirugía abierta.
 */
export const CONVERSION_REASONS = [
  { key: 'adhesions', label: 'Adherencias severas', frequency: 'Común' },
  { key: 'bleeding', label: 'Sangrado incontrolable', frequency: 'Poco frecuente' },
  { key: 'anatomy', label: 'Anatomía no clara / triángulo de Calot no identificable', frequency: 'Común' },
  { key: 'bowel_injury', label: 'Lesión intestinal', frequency: 'Raro' },
  { key: 'bile_duct_injury', label: 'Lesión de vía biliar', frequency: 'Raro' },
  { key: 'equipment_failure', label: 'Falla de equipo', frequency: 'Raro' },
  { key: 'obesity', label: 'Obesidad extrema / espacio insuficiente', frequency: 'Poco frecuente' },
  { key: 'tumor_size', label: 'Tamaño tumoral mayor al esperado', frequency: 'Poco frecuente' },
] as const;
