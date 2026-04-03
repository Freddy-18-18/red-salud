/**
 * @file overrides/prostodoncia.ts
 * @description Override de configuración para Prostodoncia.
 *
 * Módulos especializados: clasificación de Kennedy, selección de color,
 * seguimiento CAD/CAM, registro de ajustes de dentaduras, análisis oclusal,
 * prótesis sobre implantes.
 *
 * También exporta constantes de dominio: clasificación de Kennedy,
 * guía de selección de color, tipos de prótesis.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Prostodoncia.
 * Especialidad odontológica centrada en rehabilitación protésica.
 */
export const prostodonciaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'prostodoncia',
  dashboardPath: '/dashboard/medico/prostodoncia',

  modules: {
    clinical: [
      {
        key: 'dental-prosth-kennedy',
        label: 'Clasificación de Kennedy',
        icon: 'FileText',
        route: '/dashboard/medico/prostodoncia/kennedy',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        description: 'Clasificación de edentulismo parcial',
      },
      {
        key: 'dental-prosth-color',
        label: 'Selección de Color',
        icon: 'Palette',
        route: '/dashboard/medico/prostodoncia/color',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Registro de color con guía VITA, espectrofotometría',
      },
      {
        key: 'dental-prosth-cadcam',
        label: 'CAD/CAM',
        icon: 'Monitor',
        route: '/dashboard/medico/prostodoncia/cadcam',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Diseño y fabricación asistida por computadora',
      },
      {
        key: 'dental-prosth-dentaduras',
        label: 'Ajuste de Dentaduras',
        icon: 'ClipboardList',
        route: '/dashboard/medico/prostodoncia/dentaduras',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dental-prosth-oclusion',
        label: 'Análisis Oclusal',
        icon: 'AlignCenter',
        route: '/dashboard/medico/prostodoncia/oclusion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Registros oclusales, articulador semiajustable, T-Scan',
      },
      {
        key: 'dental-prosth-implantes',
        label: 'Prótesis sobre Implantes',
        icon: 'Pin',
        route: '/dashboard/medico/prostodoncia/implantes',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['prosthesis_survival', 'remake_rate'],
      },
    ],

    lab: [
      {
        key: 'dental-prosth-laboratorio',
        label: 'Laboratorio Dental',
        icon: 'FlaskConical',
        route: '/dashboard/medico/prostodoncia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Coordinación con laboratorio, estado de trabajos',
      },
      {
        key: 'dental-prosth-radiologia',
        label: 'Radiología Prostodóntica',
        icon: 'Image',
        route: '/dashboard/medico/prostodoncia/radiologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dental-prosth-escaneo',
        label: 'Escaneo Digital',
        icon: 'Scan',
        route: '/dashboard/medico/prostodoncia/escaneo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Escaneo intraoral, diseño digital, impresión 3D',
      },
    ],

    communication: [
      {
        key: 'dental-prosth-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/prostodoncia/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-prosth-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/prostodoncia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'prosthesis-tracker',
      component: '@/components/dashboard/medico/prostodoncia/widgets/prosthesis-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'lab-status',
      component: '@/components/dashboard/medico/prostodoncia/widgets/lab-status-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'patient-satisfaction',
      component: '@/components/dashboard/medico/prostodoncia/widgets/patient-satisfaction-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'prosthesis_survival',
    'patient_satisfaction',
    'remake_rate',
    'lab_turnaround_time',
    'adjustment_frequency',
  ],

  kpiDefinitions: {
    prosthesis_survival: {
      label: 'Supervivencia de Prótesis',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    remake_rate: {
      label: 'Tasa de Rehacer',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    lab_turnaround_time: {
      label: 'Tiempo de Laboratorio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    adjustment_frequency: {
      label: 'Frecuencia de Ajustes',
      format: 'number',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_prostodontica',
      'preparacion_dental',
      'toma_impresion',
      'prueba_metal_ceramica',
      'cementado_protesis',
      'ajuste_dentadura',
      'control_oclusal',
      'protesis_sobre_implante',
      'reparacion',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_prostodontica',
      'plan_protesico',
      'registro_color',
      'informe_oclusal',
      'orden_laboratorio',
      'consentimiento_protesis',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresKennedyClassification: true,
      usesShadeMatching: true,
      supportsCADCAM: true,
      tracksOcclusalAnalysis: true,
      requiresLabCoordination: true,
      supportsDigitalScanning: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'FileText',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO PROSTODÓNTICO
// ============================================================================

/**
 * Clasificación de Kennedy para edentulismo parcial
 */
export const KENNEDY_CLASSIFICATION = [
  { class: 'I', label: 'Clase I', description: 'Áreas edéntulas bilaterales posteriores a los dientes remanentes' },
  { class: 'II', label: 'Clase II', description: 'Área edéntula unilateral posterior a los dientes remanentes' },
  { class: 'III', label: 'Clase III', description: 'Área edéntula unilateral con dientes anteriores y posteriores al espacio' },
  { class: 'IV', label: 'Clase IV', description: 'Área edéntula anterior bilateral que cruza la línea media' },
] as const;

/**
 * Guía de color VITA Classical
 */
export const VITA_SHADE_GUIDE = [
  { group: 'A', shades: ['A1', 'A2', 'A3', 'A3.5', 'A4'], description: 'Marrón rojizo' },
  { group: 'B', shades: ['B1', 'B2', 'B3', 'B4'], description: 'Amarillo rojizo' },
  { group: 'C', shades: ['C1', 'C2', 'C3', 'C4'], description: 'Gris' },
  { group: 'D', shades: ['D2', 'D3', 'D4'], description: 'Gris rojizo' },
] as const;

/**
 * Tipos de prótesis dental
 */
export const PROSTHESIS_TYPES = [
  { key: 'fixed_crown', label: 'Corona Fija', material: ['Metal-cerámica', 'Zirconio', 'Disilicato de litio', 'Cerámica feldespática'] },
  { key: 'fixed_bridge', label: 'Puente Fijo', material: ['Metal-cerámica', 'Zirconio'] },
  { key: 'removable_partial', label: 'Prótesis Parcial Removible', material: ['Cromo-cobalto', 'Flexible (nylon)', 'Acrílico'] },
  { key: 'complete_denture', label: 'Prótesis Total', material: ['Acrílico convencional', 'Base flexible'] },
  { key: 'implant_supported', label: 'Prótesis sobre Implantes', material: ['Atornillada', 'Cementada', 'Sobredentadura'] },
  { key: 'veneer', label: 'Carilla', material: ['Cerámica', 'Resina compuesta'] },
  { key: 'inlay_onlay', label: 'Inlay/Onlay', material: ['Cerámica', 'Resina', 'Oro'] },
] as const;
