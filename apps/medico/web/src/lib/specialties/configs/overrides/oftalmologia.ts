/**
 * @file overrides/oftalmologia.ts
 * @description Override de configuración para Oftalmología.
 *
 * Modules especializados: refracción, fondo de ojo, tonometría,
 * campimetría, cirugía refractiva, cataratas, retina, glaucoma.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const oftalmologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'oftalmologia',
  dashboardPath: '/dashboard/medico/oftalmologia',

  modules: {
    clinical: [
      {
        key: 'oftal-consulta',
        label: 'Consulta Oftalmológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/oftalmologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'oftal-refraccion',
        label: 'Refracción y Optometría',
        icon: 'Glasses',
        route: '/dashboard/medico/oftalmologia/refraccion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Autorefractometría, lensometría, RX de lentes',
      },
      {
        key: 'oftal-fondo-ojo',
        label: 'Fondo de Ojo',
        icon: 'Eye',
        route: '/dashboard/medico/oftalmologia/fondo-ojo',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Retinografía, OCT, angiografía',
      },
      {
        key: 'oftal-tonometria',
        label: 'Tonometría / Glaucoma',
        icon: 'Gauge',
        route: '/dashboard/medico/oftalmologia/tonometria',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'PIO, paquimetría, gonioscopia, seguimiento de glaucoma',
      },
      {
        key: 'oftal-campimetria',
        label: 'Campimetría',
        icon: 'Maximize',
        route: '/dashboard/medico/oftalmologia/campimetria',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'oftal-cirugia-refractiva',
        label: 'Cirugía Refractiva',
        icon: 'Crosshair',
        route: '/dashboard/medico/oftalmologia/cirugia-refractiva',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'LASIK, PRK, ICL, planificación quirúrgica',
      },
      {
        key: 'oftal-cataratas',
        label: 'Cataratas',
        icon: 'Circle',
        route: '/dashboard/medico/oftalmologia/cataratas',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Facoemulsificación, IOL, biometría',
      },
      {
        key: 'oftal-retina',
        label: 'Retina y Vítreo',
        icon: 'Target',
        route: '/dashboard/medico/oftalmologia/retina',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Desprendimiento, retinopatía diabética, DMAE',
      },
    ],

    financial: [
      {
        key: 'oftal-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/oftalmologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'oftal-optica',
        label: 'Óptica / Dispensario',
        icon: 'ShoppingBag',
        route: '/dashboard/medico/oftalmologia/optica',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Venta de lentes, marcos, lentes de contacto',
      },
      {
        key: 'oftal-seguros',
        label: 'Seguros',
        icon: 'Shield',
        route: '/dashboard/medico/oftalmologia/seguros',
        group: 'financial',
        order: 3,
        enabledByDefault: true,
      },
    ],

    laboratory: [
      {
        key: 'oftal-diagnostico',
        label: 'Diagnóstico por Imagen',
        icon: 'Scan',
        route: '/dashboard/medico/oftalmologia/diagnostico',
        group: 'laboratory',
        order: 1,
        enabledByDefault: true,
        description: 'OCT, topografía corneal, biometría, ecografía ocular',
      },
    ],

    technology: [
      {
        key: 'oftal-pacs',
        label: 'Visor de Imágenes',
        icon: 'Monitor',
        route: '/dashboard/medico/oftalmologia/pacs',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'oftal-teleoftalmologia',
        label: 'Teleoftalmología',
        icon: 'Video',
        route: '/dashboard/medico/oftalmologia/teleoftalmologia',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'oftal-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/oftalmologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'oftal-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/oftalmologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'oftal-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/oftalmologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgery-queue',
      component: '@/components/dashboard/medico/oftalmologia/widgets/surgery-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'iop-tracker',
      component: '@/components/dashboard/medico/oftalmologia/widgets/iop-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'optics-sales',
      component: '@/components/dashboard/medico/oftalmologia/widgets/optics-sales-widget',
      size: 'medium',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/oftalmologia/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'pacientes-atendidos',
    'cirugias-realizadas',
    'citas-hoy',
    'satisfaccion',
    'tasa-exito',
    'ingresos',
  ],

  kpiDefinitions: {
    'pacientes-atendidos': {
      label: 'Pacientes Atendidos',
      format: 'number',
      direction: 'higher_is_better',
    },
    'cirugias-realizadas': {
      label: 'Cirugías del Período',
      format: 'number',
      direction: 'higher_is_better',
    },
    'citas-hoy': {
      label: 'Citas Hoy',
      format: 'number',
      direction: 'higher_is_better',
    },
    satisfaccion: {
      label: 'Satisfacción',
      format: 'number',
      goal: 4.5,
      direction: 'higher_is_better',
    },
    'tasa-exito': {
      label: 'Tasa de Éxito Qx',
      format: 'percentage',
      goal: 98,
      direction: 'higher_is_better',
    },
    ingresos: {
      label: 'Ingresos',
      format: 'currency',
      direction: 'higher_is_better',
    },
  },

  settings: {
    defaultView: 'agenda',
    enableChat: true,
    enablePrescriptions: true,
    enableLab: true,
    enableTelemedicine: true,
  },

  theme: {
    primaryColor: '#0ea5e9', // Sky blue
    accentColor: '#38bdf8',
    icon: 'Eye',
  },
};
