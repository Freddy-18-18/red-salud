/**
 * @file overrides/quemados.ts
 * @description Override de configuracion para Quemados.
 *
 * Calculo de TBSA (Lund-Browder), mapeo de profundidad de quemadura,
 * reanimacion con liquidos (Parkland), seguimiento de cuidado de heridas,
 * documentacion de injertos de piel, manejo de cicatrices.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const quemadosOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'quemados',
  dashboardPath: '/dashboard/medico/quemados',

  modules: {
    clinical: [
      {
        key: 'quemados-tbsa',
        label: 'Calculo TBSA (Lund-Browder)',
        icon: 'LayoutGrid',
        route: '/dashboard/medico/quemados/tbsa',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['survival_by_tbsa'],
      },
      {
        key: 'quemados-depth-mapping',
        label: 'Mapeo de Profundidad',
        icon: 'Layers',
        route: '/dashboard/medico/quemados/profundidad',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'quemados-fluid-resuscitation',
        label: 'Reanimacion con Liquidos',
        icon: 'Droplets',
        route: '/dashboard/medico/quemados/reanimacion-liquidos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'quemados-wound-care',
        label: 'Seguimiento de Heridas',
        icon: 'Flame',
        route: '/dashboard/medico/quemados/heridas',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['infection_rate'],
      },
      {
        key: 'quemados-skin-graft',
        label: 'Documentacion de Injertos',
        icon: 'Scissors',
        route: '/dashboard/medico/quemados/injertos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['graft_take_rate'],
      },
      {
        key: 'quemados-scar-management',
        label: 'Manejo de Cicatrices',
        icon: 'Sparkles',
        route: '/dashboard/medico/quemados/cicatrices',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'quemados-photography',
        label: 'Documentacion Fotografica',
        icon: 'Camera',
        route: '/dashboard/medico/quemados/fotografia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'quemados-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/quemados/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'quemados-multidisciplinary',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/quemados/equipo',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'burn-census',
      component: '@/components/dashboard/medico/quemados/widgets/burn-census-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'wound-progression',
      component: '@/components/dashboard/medico/quemados/widgets/wound-progression-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fluid-resuscitation-tracker',
      component: '@/components/dashboard/medico/quemados/widgets/fluid-resuscitation-widget',
      size: 'medium',
    },
    {
      key: 'graft-status',
      component: '@/components/dashboard/medico/quemados/widgets/graft-status-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'survival_by_tbsa',
    'infection_rate',
    'graft_take_rate',
    'average_los',
    'fluid_resuscitation_accuracy',
    'return_to_function_rate',
  ],

  kpiDefinitions: {
    survival_by_tbsa: {
      label: 'Supervivencia por TBSA',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    infection_rate: {
      label: 'Tasa de Infeccion',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    graft_take_rate: {
      label: 'Tasa de Prendimiento de Injerto',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    average_los: {
      label: 'Estancia Hospitalaria Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    fluid_resuscitation_accuracy: {
      label: 'Precision de Reanimacion Hidrica',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    return_to_function_rate: {
      label: 'Retorno Funcional',
      format: 'percentage',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_inicial_quemadura',
      'cura_herida',
      'desbridamiento',
      'injerto_piel',
      'seguimiento_cicatriz',
      'rehabilitacion_quemados',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_quemadura',
      'calculo_tbsa',
      'reanimacion_parkland',
      'cuidado_herida',
      'documentacion_injerto',
      'manejo_cicatriz',
      'plan_rehabilitacion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresTbsaCalculation: true,
      supportsLundBrowder: true,
      requiresBurnDepthMapping: true,
      supportsFluidResuscitation: true,
      supportsParklandFormula: true,
      requiresWoundCareTracking: true,
      supportsSkinGraftDocumentation: true,
      supportsScarManagement: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#C2410C',
    icon: 'Flame',
  },
};
