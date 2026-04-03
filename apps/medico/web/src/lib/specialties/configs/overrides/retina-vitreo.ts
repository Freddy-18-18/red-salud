/**
 * @file overrides/retina-vitreo.ts
 * @description Override de configuración para Retina y Vítreo.
 *
 * Módulos especializados: seguimiento OCT (tendencias CMT),
 * angiografía fluoresceínica, registro de inyecciones anti-VEGF,
 * estadificación de retinopatía diabética (ETDRS), tamizaje ROP,
 * planificación de vitrectomía, estadificación de agujero macular.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const retinaVitreoOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'retina-vitreo',
  dashboardPath: '/dashboard/medico/retina-vitreo',

  modules: {
    clinical: [
      {
        key: 'retina-consulta',
        label: 'Consulta de Retina y Vítreo',
        icon: 'Stethoscope',
        route: '/dashboard/medico/retina-vitreo/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'retina-oct',
        label: 'Seguimiento OCT (CMT)',
        icon: 'Layers',
        route: '/dashboard/medico/retina-vitreo/oct',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['cmt_improvement_rate'],
      },
      {
        key: 'retina-angiografia',
        label: 'Angiografía Fluoresceínica',
        icon: 'Eye',
        route: '/dashboard/medico/retina-vitreo/angiografia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'retina-anti-vegf',
        label: 'Registro de Inyecciones Anti-VEGF',
        icon: 'Syringe',
        route: '/dashboard/medico/retina-vitreo/anti-vegf',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['injection_frequency'],
      },
      {
        key: 'retina-diabetica',
        label: 'Retinopatía Diabética (ETDRS)',
        icon: 'CircleDot',
        route: '/dashboard/medico/retina-vitreo/diabetica',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'retina-rop',
        label: 'Tamizaje ROP',
        icon: 'Baby',
        route: '/dashboard/medico/retina-vitreo/rop',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'retina-vitrectomia',
        label: 'Planificación de Vitrectomía',
        icon: 'Scissors',
        route: '/dashboard/medico/retina-vitreo/vitrectomia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'retina-agujero-macular',
        label: 'Estadificación de Agujero Macular',
        icon: 'Target',
        route: '/dashboard/medico/retina-vitreo/agujero-macular',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'retina-oct-angio',
        label: 'OCT Angiografía',
        icon: 'Scan',
        route: '/dashboard/medico/retina-vitreo/oct-angio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'retina-autofluorescencia',
        label: 'Autofluorescencia',
        icon: 'Sun',
        route: '/dashboard/medico/retina-vitreo/autofluorescencia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'retina-ecografia',
        label: 'Ecografía Ocular',
        icon: 'Waves',
        route: '/dashboard/medico/retina-vitreo/ecografia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'retina-calculadoras',
        label: 'Calculadoras de Retina',
        icon: 'Calculator',
        route: '/dashboard/medico/retina-vitreo/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'retina-planificacion-laser',
        label: 'Planificación de Láser',
        icon: 'Crosshair',
        route: '/dashboard/medico/retina-vitreo/laser',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'retina-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/retina-vitreo/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'retina-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/retina-vitreo/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'retina-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/retina-vitreo/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'oct-cmt-trends',
      component: '@/components/dashboard/medico/retina-vitreo/widgets/oct-cmt-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'anti-vegf-injection-log',
      component: '@/components/dashboard/medico/retina-vitreo/widgets/anti-vegf-injection-log-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'visual-acuity-tracker',
      component: '@/components/dashboard/medico/retina-vitreo/widgets/visual-acuity-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'diabetic-retinopathy-staging',
      component: '@/components/dashboard/medico/retina-vitreo/widgets/diabetic-retinopathy-staging-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'injection_frequency',
    'cmt_improvement_rate',
    'visual_acuity_gains',
    'diabetic_screening_compliance',
    'surgical_success_rate',
    'rop_screening_compliance',
  ],

  kpiDefinitions: {
    injection_frequency: {
      label: 'Frecuencia de Inyecciones Anti-VEGF',
      format: 'number',
      direction: 'lower_is_better',
    },
    cmt_improvement_rate: {
      label: 'Tasa de Mejora CMT',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    visual_acuity_gains: {
      label: 'Ganancia de Agudeza Visual',
      format: 'number',
      direction: 'higher_is_better',
    },
    diabetic_screening_compliance: {
      label: 'Cumplimiento de Tamizaje Diabético',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    surgical_success_rate: {
      label: 'Tasa de Éxito Quirúrgico',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    rop_screening_compliance: {
      label: 'Cumplimiento de Tamizaje ROP',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'oct',
      'angiografia',
      'inyeccion_anti_vegf',
      'laser_retinal',
      'tamizaje_rop',
      'evaluacion_preoperatoria',
      'post_vitrectomia',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_retina',
      'examen_retinal',
      'informe_oct',
      'informe_angiografia',
      'registro_inyeccion',
      'estadificacion_rd',
      'informe_rop',
      'informe_vitrectomia',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksOCT: true,
      supportsAngiography: true,
      tracksAntiVEGFInjections: true,
      supportsETDRSStaging: true,
      supportsROPScreening: true,
      supportsMacularHoleStaging: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#0E7490',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE RETINA Y VÍTREO
// ============================================================================

/**
 * Clasificación de retinopatía diabética (ETDRS)
 */
export const DIABETIC_RETINOPATHY_ETDRS = [
  { level: 10, label: 'Sin retinopatía', description: 'Fondo normal', urgency: 'Control anual' },
  { level: 20, label: 'RDNP muy leve', description: 'Solo microaneurismas', urgency: 'Control 6-12 meses' },
  { level: 35, label: 'RDNP leve', description: 'Microaneurismas + exudados duros/hemorragias leves', urgency: 'Control 6-9 meses' },
  { level: 43, label: 'RDNP moderada', description: 'Hemorragias en 1-3 cuadrantes, exudados algodonosos', urgency: 'Control 4-6 meses' },
  { level: 47, label: 'RDNP moderada-severa', description: 'Hemorragias en 4 cuadrantes O arrosariamiento venoso en 1', urgency: 'Control 3-4 meses' },
  { level: 53, label: 'RDNP severa (regla 4-2-1)', description: 'Hemorragias 4 cuadr + arrosariamiento 2 + IRMA 1', urgency: 'Considerar PRP, control 2-3 meses' },
  { level: 61, label: 'RDP leve', description: 'Neovasos en disco o retina sin alto riesgo', urgency: 'PRP indicada' },
  { level: 65, label: 'RDP moderada', description: 'Neovasos sin criterios de alto riesgo', urgency: 'PRP urgente' },
  { level: 71, label: 'RDP de alto riesgo', description: 'NVD > 1/3 disco, o NVE con hemorragia vítrea', urgency: 'PRP inmediata' },
  { level: 85, label: 'RDP avanzada', description: 'Fondo no visible, hemorragia vítrea severa, DR traccional', urgency: 'Vitrectomía' },
] as const;

/**
 * Estadificación de agujero macular (Gass)
 */
export const MACULAR_HOLE_STAGING = [
  { stage: 1, substage: '1A', label: 'Etapa 1A', description: 'Foveal detachment sin defecto, punto amarillo central', size: '< 100 μm' },
  { stage: 1, substage: '1B', label: 'Etapa 1B', description: 'Anillo amarillo foveal, inminente apertura', size: '100-200 μm' },
  { stage: 2, substage: '2', label: 'Etapa 2', description: 'Agujero macular pequeño, puede ser excéntrico', size: '< 400 μm' },
  { stage: 3, substage: '3', label: 'Etapa 3', description: 'Agujero de espesor completo sin DVP', size: '> 400 μm' },
  { stage: 4, substage: '4', label: 'Etapa 4', description: 'Agujero de espesor completo con DVP completo', size: '> 400 μm' },
] as const;
