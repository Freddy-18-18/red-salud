/**
 * @file overrides/traumatologia.ts
 * @description Override de configuración para Traumatología y Ortopedia.
 *
 * Modules especializados: fracturas, artroscopia, prótesis articulares,
 * columna vertebral, medicina deportiva, rehabilitación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const traumatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'traumatologia',
  dashboardPath: '/dashboard/medico/traumatologia',

  modules: {
    clinical: [
      {
        key: 'trauma-consulta',
        label: 'Consulta Traumatológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/traumatologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'trauma-fracturas',
        label: 'Gestión de Fracturas',
        icon: 'Bone',
        route: '/dashboard/medico/traumatologia/fracturas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Clasificación, inmovilización, seguimiento radiológico',
      },
      {
        key: 'trauma-cirugia',
        label: 'Cirugía Ortopédica',
        icon: 'Scissors',
        route: '/dashboard/medico/traumatologia/cirugia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Planificación quirúrgica, osteosíntesis, protocolo pre/post-op',
      },
      {
        key: 'trauma-artroscopia',
        label: 'Artroscopia',
        icon: 'Aperture',
        route: '/dashboard/medico/traumatologia/artroscopia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'trauma-protesis',
        label: 'Prótesis Articulares',
        icon: 'Cog',
        route: '/dashboard/medico/traumatologia/protesis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Cadera, rodilla, hombro — planificación y seguimiento',
      },
      {
        key: 'trauma-columna',
        label: 'Columna Vertebral',
        icon: 'AlignCenter',
        route: '/dashboard/medico/traumatologia/columna',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'trauma-deportiva',
        label: 'Medicina Deportiva',
        icon: 'Dumbbell',
        route: '/dashboard/medico/traumatologia/deportiva',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'trauma-rehabilitacion',
        label: 'Rehabilitación',
        icon: 'RotateCcw',
        route: '/dashboard/medico/traumatologia/rehabilitacion',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Fisioterapia, ejercicios, escalas funcionales',
      },
    ],

    financial: [
      {
        key: 'trauma-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/traumatologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'trauma-seguros',
        label: 'Seguros / Accidentes',
        icon: 'Shield',
        route: '/dashboard/medico/traumatologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Accidentes laborales, tránsito, seguros',
      },
    ],

    laboratory: [
      {
        key: 'trauma-imagen',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/traumatologia/imagen',
        group: 'laboratory',
        order: 1,
        enabledByDefault: true,
        description: 'Rx, TAC, RM, densitometría',
      },
    ],

    technology: [
      {
        key: 'trauma-pacs',
        label: 'Visor PACS / Rx',
        icon: 'Monitor',
        route: '/dashboard/medico/traumatologia/pacs',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'trauma-telemedicina',
        label: 'Teleconsulta',
        icon: 'Video',
        route: '/dashboard/medico/traumatologia/teleconsulta',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'trauma-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/traumatologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'trauma-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/traumatologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'trauma-analytics',
        label: 'Análisis Quirúrgico',
        icon: 'TrendingUp',
        route: '/dashboard/medico/traumatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
        description: 'Tasas de éxito, complicaciones, tiempos quirúrgicos',
      },
    ],
  },

  widgets: [
    {
      key: 'surgery-schedule',
      component: '@/components/dashboard/medico/traumatologia/widgets/surgery-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'fracture-tracker',
      component: '@/components/dashboard/medico/traumatologia/widgets/fracture-tracker-widget',
      size: 'medium',
    },
    {
      key: 'rehab-progress',
      component: '@/components/dashboard/medico/traumatologia/widgets/rehab-progress-widget',
      size: 'medium',
    },
    {
      key: 'critical-alerts',
      component: '@/components/dashboard/medico/traumatologia/widgets/critical-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'cirugias-realizadas',
    'pacientes-atendidos',
    'citas-hoy',
    'tasa-exito',
    'satisfaccion',
    'tasa-no-show',
  ],

  kpiDefinitions: {
    'cirugias-realizadas': {
      label: 'Cirugías Realizadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    'pacientes-atendidos': {
      label: 'Pacientes Atendidos',
      format: 'number',
      direction: 'higher_is_better',
    },
    'citas-hoy': {
      label: 'Citas Hoy',
      format: 'number',
      direction: 'higher_is_better',
    },
    'tasa-exito': {
      label: 'Tasa de Éxito',
      format: 'percentage',
      goal: 95,
      direction: 'higher_is_better',
    },
    satisfaccion: {
      label: 'Satisfacción',
      format: 'number',
      goal: 4.5,
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
    primaryColor: '#f97316', // Orange
    accentColor: '#fb923c',
    icon: 'Bone',
  },
};
