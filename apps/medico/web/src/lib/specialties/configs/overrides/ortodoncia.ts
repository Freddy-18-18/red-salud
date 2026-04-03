/**
 * @file overrides/ortodoncia.ts
 * @description Override de configuración para Ortodoncia.
 *
 * Módulos especializados: análisis cefalométrico, staging de plan de tratamiento,
 * seguimiento de brackets/alineadores, secuencia de citas, monitoreo de retención,
 * tendencias de overjet/overbite.
 *
 * También exporta constantes de dominio: clasificación de Angle,
 * puntos cefalométricos, tipos de aparatología.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Ortodoncia.
 * Especialidad odontológica centrada en maloclusiones y alineación dental.
 */
export const ortodonciaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ortodoncia',
  dashboardPath: '/dashboard/medico/ortodoncia',

  modules: {
    clinical: [
      {
        key: 'dental-ortho-cefalometria',
        label: 'Análisis Cefalométrico',
        icon: 'Ruler',
        route: '/dashboard/medico/ortodoncia/cefalometria',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        description: 'Cefalometría lateral (Steiner, Ricketts, McNamara)',
      },
      {
        key: 'dental-ortho-plan',
        label: 'Plan de Tratamiento',
        icon: 'ClipboardList',
        route: '/dashboard/medico/ortodoncia/plan',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['treatment_duration', 'alignment_improvement'],
      },
      {
        key: 'dental-ortho-brackets',
        label: 'Seguimiento Brackets/Alineadores',
        icon: 'Smile',
        route: '/dashboard/medico/ortodoncia/brackets',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Registro de arcos, ligas, activaciones, cambio de alineadores',
        kpiKeys: ['patient_compliance'],
      },
      {
        key: 'dental-ortho-secuencia',
        label: 'Secuencia de Citas',
        icon: 'Calendar',
        route: '/dashboard/medico/ortodoncia/secuencia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dental-ortho-retencion',
        label: 'Retención',
        icon: 'Lock',
        route: '/dashboard/medico/ortodoncia/retencion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Monitoreo de retenedores fijos y removibles',
      },
      {
        key: 'dental-ortho-overjet-overbite',
        label: 'Tendencias Overjet/Overbite',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ortodoncia/overjet-overbite',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'dental-ortho-radiologia',
        label: 'Imagenología Ortodóntica',
        icon: 'Image',
        route: '/dashboard/medico/ortodoncia/radiologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Panorámica, cefalométrica lateral, CBCT, fotos intra/extraorales',
      },
      {
        key: 'dental-ortho-modelos',
        label: 'Modelos Digitales',
        icon: 'Box',
        route: '/dashboard/medico/ortodoncia/modelos',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Escaneo intraoral, análisis de espacio, setup virtual',
      },
    ],

    technology: [
      {
        key: 'dental-ortho-calculadoras',
        label: 'Calculadoras Ortodónticas',
        icon: 'Calculator',
        route: '/dashboard/medico/ortodoncia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Bolton, discrepancia de espacio, predicción de crecimiento',
      },
    ],

    communication: [
      {
        key: 'dental-ortho-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/ortodoncia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-ortho-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/ortodoncia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'treatment-staging',
      component: '@/components/dashboard/medico/ortodoncia/widgets/treatment-staging-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'cephalometric-overlay',
      component: '@/components/dashboard/medico/ortodoncia/widgets/cephalometric-overlay-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'alignment-progress',
      component: '@/components/dashboard/medico/ortodoncia/widgets/alignment-progress-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'treatment_duration',
    'patient_compliance',
    'alignment_improvement',
    'debond_on_time_rate',
    'retention_followup_rate',
  ],

  kpiDefinitions: {
    treatment_duration: {
      label: 'Duración Promedio del Tratamiento',
      format: 'duration',
      direction: 'lower_is_better',
    },
    patient_compliance: {
      label: 'Adherencia del Paciente',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    alignment_improvement: {
      label: 'Mejora de Alineación',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    debond_on_time_rate: {
      label: 'Retiro de Brackets en Tiempo',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    retention_followup_rate: {
      label: 'Seguimiento de Retención',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_ortodontica',
      'cementado_brackets',
      'activacion_mensual',
      'cambio_alineador',
      'emergencia_bracket',
      'control_retencion',
      'retiro_brackets',
      'toma_registros',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_ortodontica',
      'analisis_cefalometrico',
      'plan_tratamiento_ortodoncia',
      'nota_activacion',
      'informe_retencion',
      'consentimiento_ortodoncia',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresCephalometricAnalysis: true,
      tracksTreatmentStaging: true,
      supportsBracketAndAlignerTracking: true,
      monitorsRetention: true,
      tracksOverjetOverbite: true,
      usesDigitalModels: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'Smile',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ORTODÓNTICO
// ============================================================================

/**
 * Clasificación de Angle (maloclusión)
 */
export const ANGLE_CLASSIFICATION = [
  { class: 'I', label: 'Clase I', description: 'Relación molar normal, maloclusión por apiñamiento o espaciamiento' },
  { class: 'II_div1', label: 'Clase II División 1', description: 'Distoclusión molar, incisivos superiores protruidos' },
  { class: 'II_div2', label: 'Clase II División 2', description: 'Distoclusión molar, incisivos superiores retroinclinados' },
  { class: 'III', label: 'Clase III', description: 'Mesioclusión molar, prognatismo mandibular' },
] as const;

/**
 * Tipos de aparatología ortodóntica
 */
export const ORTHODONTIC_APPLIANCE_TYPES = [
  { key: 'metallic_brackets', label: 'Brackets Metálicos', type: 'fixed', description: 'Convencional, autoligado (Damon, etc.)' },
  { key: 'ceramic_brackets', label: 'Brackets Cerámicos', type: 'fixed', description: 'Estéticos, convencional o autoligado' },
  { key: 'lingual_brackets', label: 'Brackets Linguales', type: 'fixed', description: 'Colocados en la cara interna del diente' },
  { key: 'clear_aligners', label: 'Alineadores Transparentes', type: 'removable', description: 'Invisalign, ClearCorrect, etc.' },
  { key: 'palatal_expander', label: 'Expansor Palatino', type: 'fixed', description: 'Expansión maxilar rápida (RPE/Hyrax)' },
  { key: 'functional_appliance', label: 'Aparato Funcional', type: 'removable', description: 'Twin Block, Bionator, Herbst' },
] as const;

/**
 * Puntos cefalométricos principales
 */
export const CEPHALOMETRIC_LANDMARKS = [
  { key: 'S', label: 'Sella', description: 'Centro de silla turca' },
  { key: 'N', label: 'Nasion', description: 'Punto más anterior de sutura frontonasal' },
  { key: 'A', label: 'Punto A (Subespinal)', description: 'Punto más profundo de concavidad maxilar anterior' },
  { key: 'B', label: 'Punto B (Supramental)', description: 'Punto más profundo de concavidad mandibular anterior' },
  { key: 'Pog', label: 'Pogonion', description: 'Punto más anterior del mentón óseo' },
  { key: 'Me', label: 'Menton', description: 'Punto más inferior de sínfisis mandibular' },
  { key: 'Go', label: 'Gonion', description: 'Punto más posterior e inferior del ángulo mandibular' },
  { key: 'ANS', label: 'Espina Nasal Anterior', description: 'Punto más anterior del piso nasal' },
] as const;
