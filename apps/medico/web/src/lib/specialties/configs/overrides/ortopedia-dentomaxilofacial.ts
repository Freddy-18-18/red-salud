/**
 * @file overrides/ortopedia-dentomaxilofacial.ts
 * @description Override de configuración para Ortopedia Dentomaxilofacial.
 *
 * Módulos especializados: análisis cefalométrico (SNA, SNB, ANB),
 * seguimiento de crecimiento maxilar, monitoreo de aparatología
 * funcional, registros de expansión palatina, clasificación de Angle.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const ortopediaDentomaxilofacialOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ortopedia-dentomaxilofacial',
  dashboardPath: '/dashboard/medico/ortopedia-dentomaxilofacial',

  modules: {
    clinical: [
      {
        key: 'dentmax-consulta',
        label: 'Consulta de Ortopedia Dentomaxilofacial',
        icon: 'Stethoscope',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'dentmax-cefalometria',
        label: 'Análisis Cefalométrico',
        icon: 'Ruler',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/cefalometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['skeletal_improvement_rate'],
      },
      {
        key: 'dentmax-crecimiento',
        label: 'Seguimiento de Crecimiento Maxilar',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/crecimiento',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'dentmax-aparatos',
        label: 'Monitoreo de Aparatología Funcional',
        icon: 'Settings',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/aparatos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['compliance_rate'],
      },
      {
        key: 'dentmax-expansion',
        label: 'Registros de Expansión Palatina',
        icon: 'Maximize2',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/expansion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'dentmax-angle',
        label: 'Clasificación de Angle',
        icon: 'Layers',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/angle',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'dentmax-radiologia',
        label: 'Radiología Cefalométrica',
        icon: 'Scan',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/radiologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dentmax-modelos',
        label: 'Análisis de Modelos',
        icon: 'Box',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/modelos',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'dentmax-fotografia',
        label: 'Fotografía Clínica',
        icon: 'Camera',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/fotografia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dentmax-trazados',
        label: 'Trazados Cefalométricos Digitales',
        icon: 'PenTool',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/trazados',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'dentmax-portal-paciente',
        label: 'Portal del Paciente/Familia',
        icon: 'Users',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'dentmax-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dentmax-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/ortopedia-dentomaxilofacial/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cephalometric-trends',
      component: '@/components/dashboard/medico/ortopedia-dentomaxilofacial/widgets/cephalometric-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'jaw-growth-tracker',
      component: '@/components/dashboard/medico/ortopedia-dentomaxilofacial/widgets/jaw-growth-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'appliance-compliance',
      component: '@/components/dashboard/medico/ortopedia-dentomaxilofacial/widgets/appliance-compliance-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'skeletal_improvement_rate',
    'treatment_duration_avg',
    'compliance_rate',
    'angle_correction_rate',
    'expansion_success_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    skeletal_improvement_rate: {
      label: 'Tasa de Mejora Esquelética',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    treatment_duration_avg: {
      label: 'Duración Promedio de Tratamiento',
      format: 'duration',
      direction: 'lower_is_better',
    },
    compliance_rate: {
      label: 'Tasa de Cumplimiento con Aparatos',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    angle_correction_rate: {
      label: 'Tasa de Corrección de Maloclusión',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    expansion_success_rate: {
      label: 'Éxito de Expansión Palatina',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'analisis_cefalometrico',
      'control_aparatos',
      'activacion_expansion',
      'registro_crecimiento',
      'seguimiento',
      'retiro_aparatos',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_ortopedica',
      'analisis_cefalometrico',
      'clasificacion_angle',
      'plan_tratamiento_ortopedico',
      'control_aparatos',
      'registro_expansion',
      'nota_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresCephalometricAnalysis: true,
      tracksJawGrowth: true,
      supportsFunctionalAppliances: true,
      tracksPalatalExpansion: true,
      usesAngleClassification: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'FileText',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE ORTOPEDIA DENTOMAXILOFACIAL
// ============================================================================

/**
 * Valores cefalométricos de referencia
 */
export const CEPHALOMETRIC_NORMS = [
  { measurement: 'SNA', label: 'SNA (posición anteroposterior del maxilar)', norm: '82° ± 2°', unit: '°' },
  { measurement: 'SNB', label: 'SNB (posición anteroposterior de la mandíbula)', norm: '80° ± 2°', unit: '°' },
  { measurement: 'ANB', label: 'ANB (relación sagital maxilomandibular)', norm: '2° ± 2°', unit: '°' },
  { measurement: 'GoGn_SN', label: 'GoGn-SN (plano mandibular)', norm: '32° ± 5°', unit: '°' },
  { measurement: 'FMA', label: 'FMA (Frankfort-Mandibular)', norm: '25° ± 5°', unit: '°' },
  { measurement: 'U1_SN', label: 'U1-SN (inclinación incisivo superior)', norm: '104° ± 5°', unit: '°' },
  { measurement: 'IMPA', label: 'IMPA (incisivo inferior - plano mandibular)', norm: '90° ± 5°', unit: '°' },
] as const;

/**
 * Clasificación de Angle (relación molar)
 */
export const ANGLE_CLASSIFICATION = [
  { class: 'I', label: 'Clase I', description: 'Relación molar normal — cúspide mesiovestibular del 1er molar superior coincide con surco vestibular del 1er molar inferior', skeletal: 'Normo' },
  { class: 'II-1', label: 'Clase II División 1', description: 'Molar inferior distalizado, incisivos superiores protruidos', skeletal: 'Retrognatia mandibular' },
  { class: 'II-2', label: 'Clase II División 2', description: 'Molar inferior distalizado, incisivos superiores retroinclinados', skeletal: 'Retrognatia mandibular' },
  { class: 'III', label: 'Clase III', description: 'Molar inferior mesializado respecto al superior', skeletal: 'Prognatismo mandibular / Retromaxila' },
] as const;
