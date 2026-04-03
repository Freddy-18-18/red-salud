/**
 * @file overrides/cirugia-toracica.ts
 * @description Override de configuración para Cirugía Torácica.
 *
 * Módulos especializados: función pulmonar pre-operatoria, estadificación
 * mediastinal, manejo de tubos de tórax, registros VATS, estadificación
 * de cáncer de pulmón.
 *
 * KPIs: mortalidad a 30 días, duración de fuga aérea, recuperación de PFT.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Torácica.
 * Especialidad quirúrgica con énfasis en función pulmonar,
 * manejo de tubos de tórax y procedimientos VATS.
 */
export const cirugiaToracicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-toracica',
  dashboardPath: '/dashboard/medico/cirugia-toracica',

  modules: {
    clinical: [
      {
        key: 'cirtorax-consulta',
        label: 'Consulta Torácica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-toracica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirtorax-funcion-pulmonar',
        label: 'Función Pulmonar Pre-Op',
        icon: 'Wind',
        route: '/dashboard/medico/cirugia-toracica/funcion-pulmonar',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Espirometría, DLCO, VO2max, predicción de función pulmonar post-resección',
      },
      {
        key: 'cirtorax-estadificacion',
        label: 'Estadificación Mediastinal',
        icon: 'Layers',
        route: '/dashboard/medico/cirugia-toracica/estadificacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Estadificación de cáncer de pulmón, mediastinoscopia, EBUS',
      },
      {
        key: 'cirtorax-vats',
        label: 'Registro VATS',
        icon: 'Monitor',
        route: '/dashboard/medico/cirugia-toracica/vats',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Procedimientos de cirugía torácica video-asistida',
      },
      {
        key: 'cirtorax-tubo-torax',
        label: 'Manejo de Tubos de Tórax',
        icon: 'Droplets',
        route: '/dashboard/medico/cirugia-toracica/tubo-torax',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Débito, fuga aérea, criterios de retiro, sistemas de drenaje',
      },
      {
        key: 'cirtorax-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-toracica/nota-operatoria',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'cirtorax-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-toracica/postop',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Evolución, fisioterapia respiratoria, criterios de alta',
      },
    ],

    lab: [
      {
        key: 'cirtorax-espirometria',
        label: 'Pruebas de Función Pulmonar',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-toracica/espirometria',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['pft_recovery_rate'],
      },
      {
        key: 'cirtorax-imagenologia',
        label: 'Imagenología Torácica',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-toracica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'TC de tórax, PET-CT, radiología intervencionista',
      },
      {
        key: 'cirtorax-patologia',
        label: 'Resultados de Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-toracica/patologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirtorax-calculadoras',
        label: 'Calculadoras Torácicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-toracica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'FEV1 predicho post-resección, Thoracoscore, riesgo quirúrgico',
      },
      {
        key: 'cirtorax-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-toracica/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirtorax-multidisciplinario',
        label: 'Junta Multidisciplinaria',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-toracica/multidisciplinario',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Coordinación con neumología, oncología, radioterapia',
      },
      {
        key: 'cirtorax-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-toracica/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirtorax-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-toracica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'pft-tracker',
      component: '@/components/dashboard/medico/cirugia-toracica/widgets/pft-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'chest-tube-monitor',
      component: '@/components/dashboard/medico/cirugia-toracica/widgets/chest-tube-monitor-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-toracica/widgets/upcoming-surgeries-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'mortality-metrics',
      component: '@/components/dashboard/medico/cirugia-toracica/widgets/mortality-metrics-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'mortality_30d',
    'air_leak_duration',
    'pft_recovery_rate',
    'vats_completion_rate',
    'surgical_volume_monthly',
    'avg_hospital_stay',
  ],

  kpiDefinitions: {
    mortality_30d: {
      label: 'Mortalidad a 30 Días',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    air_leak_duration: {
      label: 'Duración Promedio de Fuga Aérea',
      format: 'duration',
      direction: 'lower_is_better',
    },
    pft_recovery_rate: {
      label: 'Recuperación de Función Pulmonar (% del predicho)',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    vats_completion_rate: {
      label: 'Tasa de Completación VATS (sin conversión)',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    surgical_volume_monthly: {
      label: 'Volumen Quirúrgico Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
    avg_hospital_stay: {
      label: 'Estancia Hospitalaria Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'espirometria_prequirurgica',
      'control_postquirurgico',
      'retiro_tubo_torax',
      'seguimiento',
      'evaluacion_oncologica',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_toracica',
      'examen_fisico_toracico',
      'evaluacion_funcion_pulmonar',
      'nota_operatoria_toracica',
      'registro_vats',
      'manejo_tubo_torax',
      'evolucion_postquirurgica',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresPulmonaryFunctionTesting: true,
      tracksChestTubeOutput: true,
      tracksAirLeakDuration: true,
      supportsVATSProcedures: true,
      requiresMediastinalStaging: true,
      tracksPFTRecovery: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Lungs',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA TORÁCICA
// ============================================================================

/**
 * Tipos de resección pulmonar.
 */
export const PULMONARY_RESECTION_TYPES = [
  { key: 'wedge', label: 'Resección en Cuña', extent: 'Sub-lobar', pftImpact: 'Mínimo', indication: 'Nódulos periféricos, metástasis, biopsia diagnóstica' },
  { key: 'segmentectomy', label: 'Segmentectomía', extent: 'Sub-lobar', pftImpact: 'Leve', indication: 'Tumores ≤2cm, función pulmonar limítrofe' },
  { key: 'lobectomy', label: 'Lobectomía', extent: 'Lobar', pftImpact: 'Moderado', indication: 'Cáncer de pulmón estadio I-II (estándar)' },
  { key: 'bilobectomy', label: 'Bilobectomía', extent: 'Bi-lobar', pftImpact: 'Significativo', indication: 'Tumor que cruza cisura o afecta bronquio intermedio' },
  { key: 'pneumonectomy', label: 'Neumonectomía', extent: 'Pulmón completo', pftImpact: 'Severo', indication: 'Tumores centrales, no candidatos a lobectomía con manga' },
  { key: 'sleeve_lobectomy', label: 'Lobectomía con Manga Bronquial', extent: 'Lobar + bronquio', pftImpact: 'Moderado', indication: 'Alternativa a neumonectomía para preservar parénquima' },
] as const;

/**
 * Evaluación de fuga aérea — escala.
 */
export const AIR_LEAK_GRADING = [
  { grade: 0, label: 'Sin fuga', description: 'No se observan burbujas en el sello de agua', action: 'Considerar retiro de tubo si débito <200ml/24h' },
  { grade: 1, label: 'Fuga solo con tos', description: 'Burbujas solo durante la tos', action: 'Observar 24h, probable resolución espontánea' },
  { grade: 2, label: 'Fuga con espiración forzada', description: 'Burbujas durante espiración forzada y tos', action: 'Mantener drenaje, fisioterapia respiratoria' },
  { grade: 3, label: 'Fuga con espiración normal', description: 'Burbujas durante la espiración tranquila', action: 'Mantener drenaje, considerar pleurodesis si persiste >5 días' },
  { grade: 4, label: 'Fuga continua', description: 'Burbujas constantes incluyendo inspiración', action: 'Evaluación urgente, considerar reintervención' },
] as const;

/**
 * Estadificación de cáncer de pulmón — grupos por estadio (AJCC 8va edición).
 */
export const LUNG_CANCER_STAGE_GROUPS = [
  { stage: 'IA1', tnm: 'T1a N0 M0', survival5yr: '92%' },
  { stage: 'IA2', tnm: 'T1b N0 M0', survival5yr: '83%' },
  { stage: 'IA3', tnm: 'T1c N0 M0', survival5yr: '77%' },
  { stage: 'IB', tnm: 'T2a N0 M0', survival5yr: '68%' },
  { stage: 'IIA', tnm: 'T2b N0 M0', survival5yr: '60%' },
  { stage: 'IIB', tnm: 'T1-2 N1 M0 / T3 N0 M0', survival5yr: '53%' },
  { stage: 'IIIA', tnm: 'T1-2 N2 M0 / T3-4 N1 M0 / T4 N0 M0', survival5yr: '36%' },
  { stage: 'IIIB', tnm: 'T1-2 N3 M0 / T3-4 N2 M0', survival5yr: '26%' },
  { stage: 'IIIC', tnm: 'T3-4 N3 M0', survival5yr: '13%' },
  { stage: 'IVA', tnm: 'Cualquier T/N M1a-b', survival5yr: '10%' },
  { stage: 'IVB', tnm: 'Cualquier T/N M1c', survival5yr: '0-1%' },
] as const;
