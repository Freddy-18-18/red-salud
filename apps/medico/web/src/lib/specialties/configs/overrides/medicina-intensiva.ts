/**
 * @file overrides/medicina-intensiva.ts
 * @description Override de configuracion para Medicina Intensiva (UCI).
 *
 * APACHE II/SOFA scoring, manejo de ventilador, titulacion de vasopresores,
 * checklist de metas diarias, vacaciones de sedacion, tracking de dias-linea,
 * notas de conferencia familiar.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaIntensivaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-intensiva',
  dashboardPath: '/dashboard/medico/medicina-intensiva',

  modules: {
    clinical: [
      {
        key: 'uci-severity-scoring',
        label: 'Scores de Severidad',
        icon: 'BarChart3',
        route: '/dashboard/medico/medicina-intensiva/scores',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['icu_mortality_smr'],
      },
      {
        key: 'uci-ventilator',
        label: 'Manejo de Ventilador',
        icon: 'Wind',
        route: '/dashboard/medico/medicina-intensiva/ventilador',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ventilator_days'],
      },
      {
        key: 'uci-vasopressors',
        label: 'Titulacion de Vasopresores',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-intensiva/vasopresores',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'uci-daily-goals',
        label: 'Checklist Metas Diarias',
        icon: 'CheckSquare',
        route: '/dashboard/medico/medicina-intensiva/metas-diarias',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'uci-sedation-vacation',
        label: 'Vacaciones de Sedacion',
        icon: 'Pause',
        route: '/dashboard/medico/medicina-intensiva/vacacion-sedacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'uci-line-day-tracking',
        label: 'Tracking Dias-Linea',
        icon: 'Calendar',
        route: '/dashboard/medico/medicina-intensiva/dias-linea',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['clabsi_rate'],
      },
      {
        key: 'uci-family-conference',
        label: 'Conferencia Familiar',
        icon: 'Users',
        route: '/dashboard/medico/medicina-intensiva/conferencia-familiar',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'uci-early-mobility',
        label: 'Movilizacion Temprana',
        icon: 'PersonStanding',
        route: '/dashboard/medico/medicina-intensiva/movilizacion',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        kpiKeys: ['early_mobility_rate'],
      },
    ],

    technology: [
      {
        key: 'uci-monitoring',
        label: 'Monitoreo Multiparametro',
        icon: 'Monitor',
        route: '/dashboard/medico/medicina-intensiva/monitoreo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'uci-analytics',
        label: 'Estadisticas de UCI',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-intensiva/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'uci-multidisciplinary',
        label: 'Ronda Multidisciplinaria',
        icon: 'MessageSquare',
        route: '/dashboard/medico/medicina-intensiva/ronda',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'icu-census',
      component: '@/components/dashboard/medico/medicina-intensiva/widgets/icu-census-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'ventilator-status',
      component: '@/components/dashboard/medico/medicina-intensiva/widgets/ventilator-status-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'severity-scores',
      component: '@/components/dashboard/medico/medicina-intensiva/widgets/severity-scores-widget',
      size: 'medium',
    },
    {
      key: 'daily-goals-compliance',
      component: '@/components/dashboard/medico/medicina-intensiva/widgets/daily-goals-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'icu_mortality_smr',
    'ventilator_days',
    'clabsi_rate',
    'early_mobility_rate',
    'sedation_vacation_compliance',
    'daily_goals_completion_rate',
  ],

  kpiDefinitions: {
    icu_mortality_smr: {
      label: 'Mortalidad UCI (SMR)',
      format: 'number',
      goal: 1,
      direction: 'lower_is_better',
    },
    ventilator_days: {
      label: 'Dias de Ventilador',
      format: 'number',
      direction: 'lower_is_better',
    },
    clabsi_rate: {
      label: 'Tasa de CLABSI',
      format: 'number',
      goal: 0,
      direction: 'lower_is_better',
    },
    early_mobility_rate: {
      label: 'Tasa de Movilizacion Temprana',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    sedation_vacation_compliance: {
      label: 'Cumplimiento Vacacion Sedacion',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    daily_goals_completion_rate: {
      label: 'Metas Diarias Completadas',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'admision_uci',
      'ronda_diaria',
      'procedimiento_uci',
      'conferencia_familiar',
      'alta_uci',
    ],
    defaultDuration: 30,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'nota_admision_uci',
      'ronda_diaria_uci',
      'checklist_metas',
      'manejo_ventilador',
      'titulacion_vasopresores',
      'vacacion_sedacion',
      'conferencia_familiar',
      'nota_alta_uci',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresSeverityScoring: true,
      supportsApacheII: true,
      supportsSofa: true,
      requiresVentilatorManagement: true,
      supportsVasopressorTitration: true,
      requiresDailyGoalsChecklist: true,
      supportsSedationVacation: true,
      tracksLineDays: true,
      supportsFamilyConference: true,
      supportsEarlyMobility: true,
    },
  },

  theme: {
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    icon: 'HeartPulse',
  },
};
