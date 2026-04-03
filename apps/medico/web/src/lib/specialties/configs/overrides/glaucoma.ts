/**
 * @file overrides/glaucoma.ts
 * @description Override de configuración para Glaucoma.
 *
 * Módulos especializados: seguimiento de PIO, progresión de campo
 * visual (MD, VFI), tendencias de OCT RNFL, cumplimiento de
 * medicación, planificación quirúrgica (trabeculectomía, MIGS),
 * documentación de PIO objetivo.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const glaucomaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'glaucoma',
  dashboardPath: '/dashboard/medico/glaucoma',

  modules: {
    clinical: [
      {
        key: 'glauco-consulta',
        label: 'Consulta de Glaucoma',
        icon: 'Stethoscope',
        route: '/dashboard/medico/glaucoma/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'glauco-pio',
        label: 'Seguimiento de PIO',
        icon: 'Gauge',
        route: '/dashboard/medico/glaucoma/pio',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['iop_target_achievement_rate'],
      },
      {
        key: 'glauco-campo-visual',
        label: 'Progresión de Campo Visual',
        icon: 'Eye',
        route: '/dashboard/medico/glaucoma/campo-visual',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['visual_field_stability_rate'],
      },
      {
        key: 'glauco-oct-rnfl',
        label: 'Tendencias OCT RNFL',
        icon: 'Layers',
        route: '/dashboard/medico/glaucoma/oct-rnfl',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'glauco-medicacion',
        label: 'Cumplimiento de Medicación',
        icon: 'Pill',
        route: '/dashboard/medico/glaucoma/medicacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['medication_burden_index'],
      },
      {
        key: 'glauco-pio-objetivo',
        label: 'Documentación de PIO Objetivo',
        icon: 'Target',
        route: '/dashboard/medico/glaucoma/pio-objetivo',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'glauco-quirurgico',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/glaucoma/quirurgico',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'glauco-paquimetria',
        label: 'Paquimetría Central',
        icon: 'Ruler',
        route: '/dashboard/medico/glaucoma/paquimetria',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'glauco-gonioscopia',
        label: 'Gonioscopia',
        icon: 'Search',
        route: '/dashboard/medico/glaucoma/gonioscopia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'glauco-disco-optico',
        label: 'Evaluación del Disco Óptico',
        icon: 'CircleDot',
        route: '/dashboard/medico/glaucoma/disco-optico',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'glauco-calculadoras',
        label: 'Calculadoras de Riesgo',
        icon: 'Calculator',
        route: '/dashboard/medico/glaucoma/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'glauco-progresion',
        label: 'Análisis de Progresión',
        icon: 'TrendingDown',
        route: '/dashboard/medico/glaucoma/progresion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'glauco-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/glaucoma/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'glauco-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/glaucoma/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'glauco-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/glaucoma/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'iop-tracking',
      component: '@/components/dashboard/medico/glaucoma/widgets/iop-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'visual-field-progression',
      component: '@/components/dashboard/medico/glaucoma/widgets/visual-field-progression-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'oct-rnfl-trends',
      component: '@/components/dashboard/medico/glaucoma/widgets/oct-rnfl-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'medication-compliance',
      component: '@/components/dashboard/medico/glaucoma/widgets/medication-compliance-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'iop_target_achievement_rate',
    'visual_field_stability_rate',
    'medication_burden_index',
    'surgical_success_rate',
    'progression_detection_rate',
    'follow_up_compliance',
  ],

  kpiDefinitions: {
    iop_target_achievement_rate: {
      label: 'Logro de PIO Objetivo',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    visual_field_stability_rate: {
      label: 'Estabilidad de Campo Visual',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    medication_burden_index: {
      label: 'Índice de Carga de Medicación',
      format: 'number',
      direction: 'lower_is_better',
    },
    surgical_success_rate: {
      label: 'Tasa de Éxito Quirúrgico',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    progression_detection_rate: {
      label: 'Tasa de Detección de Progresión',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    follow_up_compliance: {
      label: 'Adherencia al Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'campo_visual',
      'oct',
      'control_pio',
      'gonioscopia',
      'pre_quirurgica',
      'post_quirurgica',
      'laser_slt',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_glaucoma',
      'examen_glaucoma',
      'informe_campo_visual',
      'informe_oct',
      'plan_tratamiento',
      'documentacion_pio_objetivo',
      'informe_quirurgico',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksIOPOverTime: true,
      supportsVisualFieldProgression: true,
      tracksOCTRNFL: true,
      requiresTargetIOP: true,
      supportsMIGS: true,
      tracksGonioscopicAngle: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#0E7490',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE GLAUCOMA
// ============================================================================

/**
 * Clasificación de glaucoma por tipo
 */
export const GLAUCOMA_TYPES = [
  { key: 'poag', label: 'Glaucoma Primario de Ángulo Abierto (GPAA)', frequency: 'Más común', mechanism: 'Ángulo abierto, drenaje deficiente' },
  { key: 'pacg', label: 'Glaucoma Primario de Ángulo Cerrado (GPAC)', frequency: 'Común', mechanism: 'Ángulo cerrado, bloqueo mecánico' },
  { key: 'ntg', label: 'Glaucoma de Tensión Normal (GTN)', frequency: 'Moderado', mechanism: 'PIO normal, daño glaucomatoso' },
  { key: 'secondary', label: 'Glaucoma Secundario', frequency: 'Variable', mechanism: 'Causa identificable (pseudoexfoliación, pigmentario, neovascular)' },
  { key: 'congenital', label: 'Glaucoma Congénito', frequency: 'Raro', mechanism: 'Malformación del ángulo iridocorneal' },
] as const;

/**
 * Procedimientos quirúrgicos para glaucoma
 */
export const GLAUCOMA_SURGICAL_PROCEDURES = [
  { key: 'trabeculectomy', label: 'Trabeculectomía', category: 'filtración', invasiveness: 'alta' },
  { key: 'tube_shunt', label: 'Válvula / Tubo de Drenaje', category: 'filtración', invasiveness: 'alta' },
  { key: 'istent', label: 'iStent (MIGS)', category: 'MIGS', invasiveness: 'baja' },
  { key: 'xen', label: 'XEN Gel Stent', category: 'MIGS', invasiveness: 'baja' },
  { key: 'kahook', label: 'Kahook Dual Blade', category: 'MIGS', invasiveness: 'baja' },
  { key: 'slt', label: 'Trabeculoplastia Selectiva Láser (SLT)', category: 'láser', invasiveness: 'mínima' },
  { key: 'pi', label: 'Iridotomía Periférica Láser', category: 'láser', invasiveness: 'mínima' },
  { key: 'cyclophoto', label: 'Ciclofotocoagulación', category: 'ciclodestructivo', invasiveness: 'moderada' },
] as const;
