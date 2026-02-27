/**
 * @file overrides/ginecologia.ts
 * @description Override de configuración para Ginecología y Obstetricia.
 *
 * Modules especializados: control prenatal, ecografía obstétrica,
 * colposcopia, citología, fertilidad, cirugía ginecológica,
 * menopausia, planificación familiar.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const ginecologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ginecologia',
  dashboardPath: '/dashboard/medico/ginecologia',

  modules: {
    clinical: [
      {
        key: 'gine-consulta',
        label: 'Consulta Ginecológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/ginecologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'gine-prenatal',
        label: 'Control Prenatal',
        icon: 'Baby',
        route: '/dashboard/medico/ginecologia/prenatal',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento por trimestre, curva de peso, labs prenatales',
      },
      {
        key: 'gine-ecografia',
        label: 'Ecografía Obstétrica',
        icon: 'Monitor',
        route: '/dashboard/medico/ginecologia/ecografia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Eco 1er trimestre, morfológica, doppler',
      },
      {
        key: 'gine-colposcopia',
        label: 'Colposcopia',
        icon: 'Search',
        route: '/dashboard/medico/ginecologia/colposcopia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'gine-citologia',
        label: 'Citología / PAP',
        icon: 'Microscope',
        route: '/dashboard/medico/ginecologia/citologia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Papanicolau, Bethesda, VPH',
      },
      {
        key: 'gine-fertilidad',
        label: 'Fertilidad',
        icon: 'Heart',
        route: '/dashboard/medico/ginecologia/fertilidad',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Estudio de infertilidad, inducción ovulación, FIV',
      },
      {
        key: 'gine-cirugia',
        label: 'Cirugía Ginecológica',
        icon: 'Scissors',
        route: '/dashboard/medico/ginecologia/cirugia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Histerectomía, laparoscopia, cesáreas',
      },
      {
        key: 'gine-menopausia',
        label: 'Menopausia / Climaterio',
        icon: 'Thermometer',
        route: '/dashboard/medico/ginecologia/menopausia',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
      {
        key: 'gine-planificacion',
        label: 'Planificación Familiar',
        icon: 'Calendar',
        route: '/dashboard/medico/ginecologia/planificacion',
        group: 'clinical',
        order: 9,
        enabledByDefault: true,
        description: 'Anticonceptivos, DIU, implante subdérmico',
      },
    ],

    financial: [
      {
        key: 'gine-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/ginecologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gine-paquetes',
        label: 'Paquetes Obstétricos',
        icon: 'Package',
        route: '/dashboard/medico/ginecologia/paquetes',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Paquetes de parto, cesárea, prenatal completo',
      },
      {
        key: 'gine-seguros',
        label: 'Seguros',
        icon: 'Shield',
        route: '/dashboard/medico/ginecologia/seguros',
        group: 'financial',
        order: 3,
        enabledByDefault: true,
      },
    ],

    laboratory: [
      {
        key: 'gine-lab',
        label: 'Laboratorio Prenatal',
        icon: 'FlaskConical',
        route: '/dashboard/medico/ginecologia/laboratorio',
        group: 'laboratory',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, TORCH, glucosa, urocultivo, HIV, VDRL',
      },
    ],

    technology: [
      {
        key: 'gine-ecografo',
        label: 'Visor Ecográfico',
        icon: 'Scan',
        route: '/dashboard/medico/ginecologia/ecografo',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gine-telemedicina',
        label: 'Teleconsulta',
        icon: 'Video',
        route: '/dashboard/medico/ginecologia/teleconsulta',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'gine-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/ginecologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'gine-portal',
        label: 'Portal de la Paciente',
        icon: 'User',
        route: '/dashboard/medico/ginecologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'gine-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ginecologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'prenatal-tracker',
      component: '@/components/dashboard/medico/ginecologia/widgets/prenatal-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'due-dates',
      component: '@/components/dashboard/medico/ginecologia/widgets/due-dates-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pap-results',
      component: '@/components/dashboard/medico/ginecologia/widgets/pap-results-widget',
      size: 'medium',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/ginecologia/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'pacientes-atendidos',
    'citas-hoy',
    'cirugias-realizadas',
    'satisfaccion',
    'tasa-exito',
    'tasa-no-show',
  ],

  kpiDefinitions: {
    'pacientes-atendidos': {
      label: 'Pacientes Atendidas',
      format: 'number',
      direction: 'higher_is_better',
    },
    'citas-hoy': {
      label: 'Citas Hoy',
      format: 'number',
      direction: 'higher_is_better',
    },
    'cirugias-realizadas': {
      label: 'Procedimientos',
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
      label: 'Tasa de Éxito',
      format: 'percentage',
      goal: 95,
      direction: 'higher_is_better',
    },
    'tasa-no-show': {
      label: 'Tasa Inasistencia',
      format: 'percentage',
      goal: 5,
      direction: 'lower_is_better',
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
    primaryColor: '#ec4899', // Pink
    accentColor: '#f472b6',
    icon: 'Heart',
  },
};
