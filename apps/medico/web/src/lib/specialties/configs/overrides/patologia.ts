/**
 * @file overrides/patologia.ts
 * @description Override de configuracion para Patologia.
 *
 * Seguimiento de especimenes, documentacion macro/micro, tinciones
 * especiales, paneles IHC, resultados moleculares, reporte sinoptico
 * tumoral (CAP).
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const patologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'patologia',
  dashboardPath: '/dashboard/medico/patologia',

  modules: {
    clinical: [
      {
        key: 'pato-specimen-tracking',
        label: 'Seguimiento de Especimenes',
        icon: 'Package',
        route: '/dashboard/medico/patologia/especimenes',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['turnaround_time'],
      },
      {
        key: 'pato-gross-micro',
        label: 'Documentacion Macro/Micro',
        icon: 'Microscope',
        route: '/dashboard/medico/patologia/macro-micro',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'pato-special-stains',
        label: 'Tinciones Especiales',
        icon: 'Palette',
        route: '/dashboard/medico/patologia/tinciones',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'pato-ihc-panels',
        label: 'Paneles Inmunohistoquimica',
        icon: 'Grid3x3',
        route: '/dashboard/medico/patologia/ihc',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'pato-molecular',
        label: 'Resultados Moleculares',
        icon: 'Dna',
        route: '/dashboard/medico/patologia/molecular',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'pato-synoptic-report',
        label: 'Reporte Sinoptico (CAP)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/patologia/sinoptico',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['synoptic_compliance_rate'],
      },
    ],

    technology: [
      {
        key: 'pato-digital-pathology',
        label: 'Patologia Digital',
        icon: 'Monitor',
        route: '/dashboard/medico/patologia/digital',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'pato-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/patologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'pato-quality-review',
        label: 'Revision de Calidad',
        icon: 'CheckCircle',
        route: '/dashboard/medico/patologia/calidad',
        group: 'growth',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['amended_report_rate'],
      },
    ],

    communication: [
      {
        key: 'pato-clinician-comm',
        label: 'Comunicacion con Clinicos',
        icon: 'MessageSquare',
        route: '/dashboard/medico/patologia/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'specimen-pipeline',
      component: '@/components/dashboard/medico/patologia/widgets/specimen-pipeline-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'pending-cases',
      component: '@/components/dashboard/medico/patologia/widgets/pending-cases-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'turnaround-metrics',
      component: '@/components/dashboard/medico/patologia/widgets/turnaround-metrics-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'turnaround_time',
    'amended_report_rate',
    'synoptic_compliance_rate',
    'specimens_per_day',
    'ihc_panel_utilization',
    'molecular_result_turnaround',
  ],

  kpiDefinitions: {
    turnaround_time: {
      label: 'Tiempo de Respuesta',
      format: 'duration',
      goal: 48,
      direction: 'lower_is_better',
    },
    amended_report_rate: {
      label: 'Tasa de Informes Enmendados',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    synoptic_compliance_rate: {
      label: 'Cumplimiento Sinoptico (CAP)',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    specimens_per_day: {
      label: 'Especimenes por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
    ihc_panel_utilization: {
      label: 'Utilizacion de Paneles IHC',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    molecular_result_turnaround: {
      label: 'TAT Resultados Moleculares',
      format: 'duration',
      goal: 72,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'biopsia',
      'pieza_quirurgica',
      'consulta_intraoperatoria',
      'revision_laminas',
      'segunda_opinion',
    ],
    defaultDuration: 30,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_biopsia',
      'informe_pieza_quirurgica',
      'reporte_sinoptico_cap',
      'informe_ihc',
      'informe_molecular',
      'consulta_intraoperatoria',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresSpecimenTracking: true,
      supportsGrossMicroDocumentation: true,
      supportsSpecialStains: true,
      supportsIhcPanels: true,
      supportsMolecularResults: true,
      requiresSynopticReporting: true,
      supportsDigitalPathology: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Microscope',
  },
};
