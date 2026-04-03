/**
 * @file overrides/ecografia.ts
 * @description Override de configuracion para Ecografia.
 *
 * Reporte estructurado por organo, seguimiento de mediciones en el tiempo,
 * scoring TIRADS/BI-RADS, biometria fetal, indices Doppler.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const ecografiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ecografia',
  dashboardPath: '/dashboard/medico/ecografia',

  modules: {
    clinical: [
      {
        key: 'eco-structured-report',
        label: 'Reporte Estructurado',
        icon: 'FileText',
        route: '/dashboard/medico/ecografia/reporte-estructurado',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['reporting_time', 'scan_volume'],
      },
      {
        key: 'eco-measurement-tracking',
        label: 'Seguimiento de Mediciones',
        icon: 'Ruler',
        route: '/dashboard/medico/ecografia/mediciones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['measurement_accuracy_rate'],
      },
      {
        key: 'eco-tirads',
        label: 'TI-RADS',
        icon: 'Target',
        route: '/dashboard/medico/ecografia/tirads',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'eco-birads',
        label: 'BI-RADS Ecografico',
        icon: 'Target',
        route: '/dashboard/medico/ecografia/birads',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'eco-fetal-biometry',
        label: 'Biometria Fetal',
        icon: 'Baby',
        route: '/dashboard/medico/ecografia/biometria-fetal',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'eco-doppler',
        label: 'Indices Doppler',
        icon: 'Activity',
        route: '/dashboard/medico/ecografia/doppler',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'eco-image-archive',
        label: 'Archivo de Imagenes',
        icon: 'Monitor',
        route: '/dashboard/medico/ecografia/imagenes',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'eco-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ecografia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'eco-referral-comm',
        label: 'Comunicacion con Referentes',
        icon: 'MessageSquare',
        route: '/dashboard/medico/ecografia/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'scan-queue',
      component: '@/components/dashboard/medico/ecografia/widgets/scan-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'measurement-trends',
      component: '@/components/dashboard/medico/ecografia/widgets/measurement-trends-widget',
      size: 'medium',
    },
    {
      key: 'reporting-stats',
      component: '@/components/dashboard/medico/ecografia/widgets/reporting-stats-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'scan_volume',
    'measurement_accuracy_rate',
    'reporting_time',
    'patient_throughput',
    'tirads_birads_compliance_rate',
    'fetal_biometry_completion_rate',
  ],

  kpiDefinitions: {
    scan_volume: {
      label: 'Volumen de Estudios',
      format: 'number',
      direction: 'higher_is_better',
    },
    measurement_accuracy_rate: {
      label: 'Precision de Mediciones',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    reporting_time: {
      label: 'Tiempo de Informe',
      format: 'duration',
      goal: 15,
      direction: 'lower_is_better',
    },
    patient_throughput: {
      label: 'Pacientes por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    tirads_birads_compliance_rate: {
      label: 'Cumplimiento TI-RADS/BI-RADS',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    fetal_biometry_completion_rate: {
      label: 'Biometria Fetal Completa',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'ecografia_abdominal',
      'ecografia_pelvica',
      'ecografia_tiroidea',
      'ecografia_mamaria',
      'ecografia_obstetrica',
      'ecografia_musculoesqueletica',
      'doppler_vascular',
      'doppler_obstetrico',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_eco_abdominal',
      'informe_eco_pelvica',
      'informe_eco_tiroidea',
      'informe_eco_mamaria',
      'informe_eco_obstetrica',
      'informe_doppler',
      'biometria_fetal',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresStructuredReporting: true,
      supportsTirads: true,
      supportsBiRads: true,
      tracksMeasurementsOverTime: true,
      supportsFetalBiometry: true,
      supportsDopplerIndices: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Monitor',
  },
};
