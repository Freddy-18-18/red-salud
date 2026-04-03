/**
 * @file overrides/endodoncia.ts
 * @description Override de configuración para Endodoncia.
 *
 * Módulos especializados: seguimiento de conductos, índice periapical (PAI),
 * documentación de longitud de trabajo, calidad de obturación,
 * planificación de retratamiento, integración CBCT.
 *
 * También exporta constantes de dominio: PAI scoring, clasificación de
 * conductos, tipos de irrigación endodóntica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Endodoncia.
 * Especialidad odontológica centrada en el tratamiento de conductos radiculares.
 */
export const endodonciaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'endodoncia',
  dashboardPath: '/dashboard/medico/endodoncia',

  modules: {
    clinical: [
      {
        key: 'dental-endo-conductos',
        label: 'Tratamiento de Conductos',
        icon: 'FileText',
        route: '/dashboard/medico/endodoncia/conductos',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['success_rate', 'retreatment_rate'],
      },
      {
        key: 'dental-endo-pai',
        label: 'Índice Periapical (PAI)',
        icon: 'Target',
        route: '/dashboard/medico/endodoncia/pai',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Scoring radiográfico periapical (Orstavik)',
      },
      {
        key: 'dental-endo-longitud',
        label: 'Longitud de Trabajo',
        icon: 'Ruler',
        route: '/dashboard/medico/endodoncia/longitud-trabajo',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Documentación de longitud de trabajo con localizador apical',
      },
      {
        key: 'dental-endo-obturacion',
        label: 'Calidad de Obturación',
        icon: 'CheckCircle',
        route: '/dashboard/medico/endodoncia/obturacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dental-endo-retratamiento',
        label: 'Retratamiento',
        icon: 'RotateCcw',
        route: '/dashboard/medico/endodoncia/retratamiento',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['retreatment_rate'],
      },
      {
        key: 'dental-endo-emergencia',
        label: 'Emergencia Endodóntica',
        icon: 'AlertCircle',
        route: '/dashboard/medico/endodoncia/emergencia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['post_op_pain_rate'],
      },
    ],

    lab: [
      {
        key: 'dental-endo-cbct',
        label: 'CBCT / Tomografía',
        icon: 'Scan',
        route: '/dashboard/medico/endodoncia/cbct',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Integración CBCT para anatomía de conductos y patología periapical',
      },
      {
        key: 'dental-endo-radiografia',
        label: 'Radiología Endodóntica',
        icon: 'Image',
        route: '/dashboard/medico/endodoncia/radiografia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dental-endo-calculadoras',
        label: 'Calculadoras Endodónticas',
        icon: 'Calculator',
        route: '/dashboard/medico/endodoncia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Longitud de trabajo, conicidad, volumen de irrigación',
      },
    ],

    communication: [
      {
        key: 'dental-endo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/endodoncia/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-endo-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/endodoncia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'root-canal-tracker',
      component: '@/components/dashboard/medico/endodoncia/widgets/root-canal-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'pai-scoring',
      component: '@/components/dashboard/medico/endodoncia/widgets/pai-scoring-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'retreatment-queue',
      component: '@/components/dashboard/medico/endodoncia/widgets/retreatment-queue-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'success_rate',
    'retreatment_rate',
    'post_op_pain_rate',
    'obturation_quality',
    'avg_treatment_time',
  ],

  kpiDefinitions: {
    success_rate: {
      label: 'Tasa de Éxito',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    retreatment_rate: {
      label: 'Tasa de Retratamiento',
      format: 'percentage',
      goal: 0.08,
      direction: 'lower_is_better',
    },
    post_op_pain_rate: {
      label: 'Dolor Postoperatorio',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    obturation_quality: {
      label: 'Calidad de Obturación',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    avg_treatment_time: {
      label: 'Tiempo Promedio de Tratamiento',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_endodontica',
      'tratamiento_conducto_anterior',
      'tratamiento_conducto_premolar',
      'tratamiento_conducto_molar',
      'retratamiento',
      'emergencia_endodontica',
      'apicectomia',
      'control_postoperatorio',
    ],
    defaultDuration: 60,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_endodontica',
      'informe_tratamiento_conducto',
      'documentacion_longitud_trabajo',
      'informe_obturacion',
      'informe_retratamiento',
      'consentimiento_endodoncia',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresRootCanalTracking: true,
      supportsPAIScoring: true,
      requiresWorkingLengthDoc: true,
      supportsCBCTIntegration: true,
      tracksObturationQuality: true,
      usesApexLocator: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'FileText',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ENDODÓNTICO
// ============================================================================

/**
 * Índice Periapical de Orstavik (PAI)
 */
export const PAI_SCORES = [
  { score: 1, label: 'Estructuras óseas normales', description: 'Sin patología periapical' },
  { score: 2, label: 'Pequeños cambios en estructura ósea', description: 'Cambios mínimos, no patológicos' },
  { score: 3, label: 'Cambios óseos con pérdida mineral', description: 'Periodontitis apical incipiente' },
  { score: 4, label: 'Radiolucidez bien definida', description: 'Periodontitis apical establecida' },
  { score: 5, label: 'Radiolucidez severa con rasgos exacerbados', description: 'Periodontitis apical severa' },
] as const;

/**
 * Clasificación de conductos radiculares por diente
 */
export const ROOT_CANAL_CLASSIFICATION = {
  incisivos_superiores: { canals: 1, description: 'Generalmente 1 conducto recto' },
  caninos_superiores: { canals: 1, description: '1 conducto, raíz larga' },
  premolares_superiores: { canals: '1-2', description: '1er premolar: 2 conductos frecuente' },
  molares_superiores: { canals: '3-4', description: '3 raíces, MB2 frecuente (~60%)' },
  incisivos_inferiores: { canals: '1-2', description: '2 conductos en ~40% de los casos' },
  caninos_inferiores: { canals: 1, description: '1 conducto, ocasionalmente 2' },
  premolares_inferiores: { canals: '1-2', description: 'Generalmente 1 conducto' },
  molares_inferiores: { canals: '3-4', description: '2 raíces, conducto mesial bifurcado frecuente' },
} as const;

/**
 * Soluciones de irrigación endodóntica
 */
export const IRRIGATION_SOLUTIONS = [
  { key: 'naocl_525', label: 'NaOCl 5.25%', purpose: 'Disolvente de tejido pulpar y antimicrobiano', notes: 'Más utilizado' },
  { key: 'naocl_25', label: 'NaOCl 2.5%', purpose: 'Antimicrobiano, menor toxicidad', notes: 'Concentración intermedia' },
  { key: 'edta_17', label: 'EDTA 17%', purpose: 'Quelante, remueve smear layer', notes: 'Uso final o alterno' },
  { key: 'chx_2', label: 'Clorhexidina 2%', purpose: 'Antimicrobiano de amplio espectro', notes: 'No disuelve tejido' },
  { key: 'saline', label: 'Solución Salina', purpose: 'Irrigación final de enjuague', notes: 'No es antimicrobiano' },
] as const;
