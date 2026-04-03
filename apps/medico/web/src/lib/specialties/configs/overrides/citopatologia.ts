/**
 * @file overrides/citopatologia.ts
 * @description Override de configuracion para Citopatologia.
 *
 * Reporte Bethesda, seguimiento de FNA, citologia en base liquida,
 * tasas de adecuacion, correlacion HPV.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const citopatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'citopatologia',
  dashboardPath: '/dashboard/medico/citopatologia',

  modules: {
    clinical: [
      {
        key: 'cito-bethesda-reporting',
        label: 'Reporte Bethesda',
        icon: 'FileText',
        route: '/dashboard/medico/citopatologia/bethesda',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['asc_sil_ratio', 'unsatisfactory_rate'],
      },
      {
        key: 'cito-fna-tracking',
        label: 'Seguimiento FNA',
        icon: 'Crosshair',
        route: '/dashboard/medico/citopatologia/fna',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cito-liquid-based',
        label: 'Citologia Base Liquida',
        icon: 'Droplets',
        route: '/dashboard/medico/citopatologia/base-liquida',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'cito-adequacy-tracking',
        label: 'Tasas de Adecuacion',
        icon: 'BarChart3',
        route: '/dashboard/medico/citopatologia/adecuacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'cito-hpv-correlation',
        label: 'Correlacion HPV',
        icon: 'GitBranch',
        route: '/dashboard/medico/citopatologia/hpv',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cito-digital-screening',
        label: 'Screening Digital',
        icon: 'Monitor',
        route: '/dashboard/medico/citopatologia/screening-digital',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cito-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/citopatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cito-concordance',
        label: 'Concordancia Cito-Histo',
        icon: 'GitMerge',
        route: '/dashboard/medico/citopatologia/concordancia',
        group: 'growth',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['concordance_rate'],
      },
    ],

    communication: [
      {
        key: 'cito-clinician-comm',
        label: 'Comunicacion con Clinicos',
        icon: 'MessageSquare',
        route: '/dashboard/medico/citopatologia/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'screening-queue',
      component: '@/components/dashboard/medico/citopatologia/widgets/screening-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'bethesda-summary',
      component: '@/components/dashboard/medico/citopatologia/widgets/bethesda-summary-widget',
      size: 'medium',
    },
    {
      key: 'adequacy-metrics',
      component: '@/components/dashboard/medico/citopatologia/widgets/adequacy-metrics-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'unsatisfactory_rate',
    'asc_sil_ratio',
    'concordance_rate',
    'fna_adequacy_rate',
    'cases_per_day',
    'hpv_correlation_rate',
  ],

  kpiDefinitions: {
    unsatisfactory_rate: {
      label: 'Tasa de Insatisfactorias',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    asc_sil_ratio: {
      label: 'Relacion ASC:SIL',
      format: 'number',
      goal: 3,
      direction: 'lower_is_better',
    },
    concordance_rate: {
      label: 'Tasa de Concordancia',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    fna_adequacy_rate: {
      label: 'Adecuacion de FNA',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    cases_per_day: {
      label: 'Casos por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    hpv_correlation_rate: {
      label: 'Correlacion HPV',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'citologia_cervical',
      'fna_guiado',
      'fna_no_guiado',
      'citologia_no_ginecologica',
      'revision_laminas',
    ],
    defaultDuration: 20,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_bethesda',
      'informe_fna',
      'informe_citologia_liquidos',
      'correlacion_hpv',
      'concordancia_cito_histo',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: false,
    customFlags: {
      requiresBethesdaReporting: true,
      supportsFnaTracking: true,
      supportsLiquidBasedCytology: true,
      tracksAdequacyRates: true,
      supportsHpvCorrelation: true,
      tracksConcordance: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Microscope',
  },
};
