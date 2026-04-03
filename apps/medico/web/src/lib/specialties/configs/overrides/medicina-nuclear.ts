/**
 * @file overrides/medicina-nuclear.ts
 * @description Override de configuracion para Medicina Nuclear.
 *
 * Inventario de isotopos, calculo de dosis, gestion de protocolos de escaneo,
 * curvas de captacion tiroidea, seguimiento de SUV PET-CT, seguridad radiologica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaNuclearOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-nuclear',
  dashboardPath: '/dashboard/medico/medicina-nuclear',

  modules: {
    clinical: [
      {
        key: 'nuclear-scan-protocols',
        label: 'Protocolos de Escaneo',
        icon: 'Atom',
        route: '/dashboard/medico/medicina-nuclear/protocolos',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['protocol_adherence_rate', 'scan_volume'],
      },
      {
        key: 'nuclear-thyroid-uptake',
        label: 'Captacion Tiroidea',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-nuclear/captacion-tiroidea',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'nuclear-pet-ct',
        label: 'PET-CT / SUV Tracking',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-nuclear/pet-ct',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'nuclear-reporting',
        label: 'Informe Nuclear',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-nuclear/informes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'nuclear-isotope-inventory',
        label: 'Inventario de Isotopos',
        icon: 'Package',
        route: '/dashboard/medico/medicina-nuclear/isotopos',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'nuclear-dose-calculation',
        label: 'Calculo de Dosis',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-nuclear/calculo-dosis',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['dose_optimization_index'],
      },
      {
        key: 'nuclear-radiation-safety',
        label: 'Seguridad Radiologica',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/medicina-nuclear/seguridad',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'nuclear-analytics',
        label: 'Estadisticas de Practica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-nuclear/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'nuclear-referral-comm',
        label: 'Comunicacion con Referentes',
        icon: 'MessageSquare',
        route: '/dashboard/medico/medicina-nuclear/comunicacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'isotope-inventory-status',
      component: '@/components/dashboard/medico/medicina-nuclear/widgets/isotope-inventory-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'scan-schedule',
      component: '@/components/dashboard/medico/medicina-nuclear/widgets/scan-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'radiation-safety-summary',
      component: '@/components/dashboard/medico/medicina-nuclear/widgets/radiation-safety-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'scan_volume',
    'dose_optimization_index',
    'protocol_adherence_rate',
    'report_turnaround_time',
    'isotope_waste_rate',
    'patient_throughput',
  ],

  kpiDefinitions: {
    scan_volume: {
      label: 'Volumen de Escaneos',
      format: 'number',
      direction: 'higher_is_better',
    },
    dose_optimization_index: {
      label: 'Indice de Optimizacion de Dosis',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    protocol_adherence_rate: {
      label: 'Adherencia a Protocolos',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    report_turnaround_time: {
      label: 'Tiempo de Respuesta de Informe',
      format: 'duration',
      goal: 24,
      direction: 'lower_is_better',
    },
    isotope_waste_rate: {
      label: 'Tasa de Desperdicio de Isotopos',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    patient_throughput: {
      label: 'Pacientes por Dia',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'gammagrafia_osea',
      'gammagrafia_tiroidea',
      'pet_ct',
      'spect_ct',
      'captacion_tiroidea',
      'terapia_radioyodo',
      'centellograma_miocardico',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_gammagrafia',
      'informe_pet_ct',
      'captacion_tiroidea',
      'protocolo_radioyodo',
      'informe_spect',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresIsotopeInventory: true,
      requiresDoseCalculation: true,
      tracksRadiationSafety: true,
      supportsPetCtSuv: true,
      supportsThyroidUptakeCurves: true,
      requiresNuclearMedicineProtocol: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Atom',
  },
};
