/**
 * @file overrides/podologia.ts
 * @description Override de configuración para Podología.
 *
 * Módulos especializados: evaluación podológica (clasificación
 * Wagner para pie diabético), documentación de procedimientos
 * ungueales, adaptación de órtesis, análisis de marcha,
 * cuidado de heridas, evaluación biomecánica, mapeo de presión.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const podologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'podologia',
  dashboardPath: '/dashboard/medico/podologia',

  modules: {
    clinical: [
      {
        key: 'podo-consulta',
        label: 'Consulta Podológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/podologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'podo-pie-diabetico',
        label: 'Evaluación Pie Diabético (Wagner)',
        icon: 'Footprints',
        route: '/dashboard/medico/podologia/pie-diabetico',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ulcer_healing_rate'],
      },
      {
        key: 'podo-unas',
        label: 'Procedimientos Ungueales',
        icon: 'Scissors',
        route: '/dashboard/medico/podologia/unas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'podo-ortesis',
        label: 'Adaptación de Órtesis',
        icon: 'Wrench',
        route: '/dashboard/medico/podologia/ortesis',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['orthotic_compliance_rate'],
      },
      {
        key: 'podo-marcha',
        label: 'Análisis de Marcha',
        icon: 'Activity',
        route: '/dashboard/medico/podologia/marcha',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'podo-heridas',
        label: 'Cuidado de Heridas',
        icon: 'Heart',
        route: '/dashboard/medico/podologia/heridas',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'podo-biomecanica',
        label: 'Evaluación Biomecánica',
        icon: 'BarChart3',
        route: '/dashboard/medico/podologia/biomecanica',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'podo-presion',
        label: 'Mapeo de Presión Plantar',
        icon: 'Grid3x3',
        route: '/dashboard/medico/podologia/presion',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'podo-vascular',
        label: 'Evaluación Vascular (ITB)',
        icon: 'HeartPulse',
        route: '/dashboard/medico/podologia/vascular',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'podo-neurologia',
        label: 'Evaluación Neurológica del Pie',
        icon: 'Zap',
        route: '/dashboard/medico/podologia/neurologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'podo-baropodometria',
        label: 'Baropodometría Digital',
        icon: 'MonitorSmartphone',
        route: '/dashboard/medico/podologia/baropodometria',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'podo-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/podologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'podo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/podologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'podo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/podologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'diabetic-foot-tracker',
      component: '@/components/dashboard/medico/podologia/widgets/diabetic-foot-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'wound-healing-progress',
      component: '@/components/dashboard/medico/podologia/widgets/wound-healing-progress-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pressure-mapping-summary',
      component: '@/components/dashboard/medico/podologia/widgets/pressure-mapping-summary-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'ulcer_healing_rate',
    'amputation_prevention_rate',
    'orthotic_compliance_rate',
    'diabetic_foot_screening_rate',
    'wound_closure_time',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    ulcer_healing_rate: {
      label: 'Tasa de Cicatrización de Úlceras',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    amputation_prevention_rate: {
      label: 'Tasa de Prevención de Amputación',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    orthotic_compliance_rate: {
      label: 'Adherencia al Uso de Órtesis',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    diabetic_foot_screening_rate: {
      label: 'Tasa de Tamizaje de Pie Diabético',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    wound_closure_time: {
      label: 'Tiempo de Cierre de Heridas',
      format: 'duration',
      direction: 'lower_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_pie_diabetico',
      'cuidado_heridas',
      'procedimiento_ungueal',
      'adaptacion_ortesis',
      'analisis_marcha',
      'evaluacion_biomecanica',
      'seguimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_podologica',
      'clasificacion_wagner',
      'documentacion_herida',
      'procedimiento_ungueal',
      'prescripcion_ortesis',
      'informe_marcha',
      'evaluacion_biomecanica',
      'mapeo_presion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      usesWagnerClassification: true,
      tracksNailProcedures: true,
      supportsOrthoticFitting: true,
      supportsGaitAnalysis: true,
      tracksWoundCare: true,
      supportsBiomechanicalEval: true,
      supportsPressureMapping: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Footprints',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE PODOLOGÍA
// ============================================================================

/**
 * Clasificación de Wagner para pie diabético
 */
export const WAGNER_DIABETIC_FOOT = [
  { grade: 0, label: 'Grado 0', description: 'Pie en riesgo — sin úlcera, posibles deformidades o callosidades', treatment: 'Prevención, calzado adecuado, educación' },
  { grade: 1, label: 'Grado 1', description: 'Úlcera superficial — limitada a la dermis', treatment: 'Descarga, cuidado local de herida' },
  { grade: 2, label: 'Grado 2', description: 'Úlcera profunda — afecta tendones, cápsulas articulares, hueso sin osteomielitis', treatment: 'Debridamiento, antibióticos si infectada' },
  { grade: 3, label: 'Grado 3', description: 'Infección profunda — absceso, osteomielitis, artritis séptica', treatment: 'Hospitalización, antibióticos IV, debridamiento quirúrgico' },
  { grade: 4, label: 'Grado 4', description: 'Gangrena localizada — digital o del antepié', treatment: 'Amputación menor, revascularización si posible' },
  { grade: 5, label: 'Grado 5', description: 'Gangrena extensa — todo el pie', treatment: 'Amputación mayor' },
] as const;

/**
 * Tipos de deformidades podológicas comunes
 */
export const PODIATRIC_DEFORMITIES = [
  { key: 'hallux_valgus', label: 'Hallux Valgus (Juanete)', severity_metric: 'Ángulo HVA', threshold: '> 15°' },
  { key: 'hammer_toe', label: 'Dedo en Martillo', severity_metric: 'Flexibilidad', threshold: 'Rígido vs. Flexible' },
  { key: 'claw_toe', label: 'Dedo en Garra', severity_metric: 'Flexibilidad', threshold: 'Rígido vs. Flexible' },
  { key: 'flat_foot', label: 'Pie Plano (Pes Planus)', severity_metric: 'Altura del arco', threshold: 'Rígido vs. Flexible' },
  { key: 'cavus_foot', label: 'Pie Cavo (Pes Cavus)', severity_metric: 'Altura del arco', threshold: 'Leve/Moderado/Severo' },
  { key: 'charcot', label: 'Pie de Charcot', severity_metric: 'Eichenholtz', threshold: 'Estadio 0-III' },
] as const;
