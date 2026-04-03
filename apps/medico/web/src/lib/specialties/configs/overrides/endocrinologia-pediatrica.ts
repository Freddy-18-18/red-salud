/**
 * @file overrides/endocrinologia-pediatrica.ts
 * @description Override de configuración para Endocrinología Pediátrica.
 *
 * Endocrinología en edad pediátrica — seguimiento de hormona de
 * crecimiento, estadificación puberal (Tanner), hipotiroidismo
 * congénito, manejo DM tipo 1 y curvas de crecimiento.
 *
 * También exporta constantes de dominio: estadios de Tanner,
 * curvas de crecimiento, protocolos de GH.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Endocrinología Pediátrica.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const endocrinologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'endocrinologia-pediatrica',
  dashboardPath: '/dashboard/medico/endocrinologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'endopedi-consulta',
        label: 'Consulta Endocrinología Pediátrica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/endocrinologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'avg_consultation_duration'],
        description: 'SOAP pediátrico endocrino, evaluación hormonal, crecimiento',
      },
      {
        key: 'endopedi-crecimiento',
        label: 'Seguimiento de Crecimiento',
        icon: 'TrendingUp',
        route: '/dashboard/medico/endocrinologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['growth_velocity_compliance'],
        description: 'Curvas OMS/CDC, velocidad de crecimiento, edad ósea, talla diana',
      },
      {
        key: 'endopedi-gh',
        label: 'Hormona de Crecimiento',
        icon: 'Syringe',
        route: '/dashboard/medico/endocrinologia-pediatrica/gh',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Protocolo GH, dosis, IGF-1, respuesta al tratamiento',
      },
      {
        key: 'endopedi-pubertad',
        label: 'Estadificación Puberal (Tanner)',
        icon: 'BarChart',
        route: '/dashboard/medico/endocrinologia-pediatrica/pubertad',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['tanner_staging_compliance'],
        description: 'Tanner I-V, pubertad precoz/tardía, LH/FSH, edad ósea',
      },
      {
        key: 'endopedi-hipotiroidismo',
        label: 'Hipotiroidismo Congénito',
        icon: 'Baby',
        route: '/dashboard/medico/endocrinologia-pediatrica/hipotiroidismo',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Tamizaje neonatal, TSH, T4, dosis levotiroxina, neurodesarrollo',
      },
      {
        key: 'endopedi-dm1',
        label: 'Diabetes Mellitus Tipo 1',
        icon: 'Droplets',
        route: '/dashboard/medico/endocrinologia-pediatrica/dm1',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['hba1c_pediatric_avg'],
        description: 'HbA1c, CGM, bomba de insulina, conteo de carbohidratos, educación',
      },
      {
        key: 'endopedi-tiroides',
        label: 'Tiroides Pediátrico',
        icon: 'Activity',
        route: '/dashboard/medico/endocrinologia-pediatrica/tiroides',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Tiroiditis Hashimoto, Graves pediátrico, nódulos tiroideos',
      },
    ],

    laboratory: [
      {
        key: 'endopedi-laboratorio',
        label: 'Panel Hormonal Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/endocrinologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Tiroides, GH/IGF-1, gonadotrofinas, cortisol, glucosa/HbA1c',
      },
      {
        key: 'endopedi-edad-osea',
        label: 'Edad Ósea',
        icon: 'Bone',
        route: '/dashboard/medico/endocrinologia-pediatrica/edad-osea',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Greulich-Pyle, pronóstico de talla adulta, maduración ósea',
      },
      {
        key: 'endopedi-glucometria',
        label: 'Monitoreo de Glucosa',
        icon: 'LineChart',
        route: '/dashboard/medico/endocrinologia-pediatrica/glucometria',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'CGM pediátrico, glucometría, curvas, time in range',
      },
    ],

    technology: [
      {
        key: 'endopedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/endocrinologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Talla diana, velocidad crecimiento, dosis GH, dosis insulina',
      },
      {
        key: 'endopedi-curvas',
        label: 'Curvas de Crecimiento',
        icon: 'LineChart',
        route: '/dashboard/medico/endocrinologia-pediatrica/curvas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'OMS, CDC — peso, talla, IMC, perímetro cefálico por edad/sexo',
      },
      {
        key: 'endopedi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/endocrinologia-pediatrica/guias',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'ISPAD, PES, ESPE — guías pediátricas endocrinas',
      },
    ],
  },

  widgets: [
    {
      key: 'growth-chart-overview',
      component: '@/components/dashboard/medico/endocrinologia-pediatrica/widgets/growth-chart-overview-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'dm1-control-panel',
      component: '@/components/dashboard/medico/endocrinologia-pediatrica/widgets/dm1-control-panel-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'puberty-staging',
      component: '@/components/dashboard/medico/endocrinologia-pediatrica/widgets/puberty-staging-widget',
      size: 'medium',
    },
    {
      key: 'gh-therapy-tracker',
      component: '@/components/dashboard/medico/endocrinologia-pediatrica/widgets/gh-therapy-tracker-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'growth_velocity_compliance',
    'hba1c_pediatric_avg',
    'tanner_staging_compliance',
    'thyroid_control_rate',
    'gh_response_rate',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    growth_velocity_compliance: {
      label: 'Velocidad Crecimiento Adecuada',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    hba1c_pediatric_avg: {
      label: 'HbA1c Pediátrico Promedio (%)',
      format: 'number',
      goal: 7.0,
      direction: 'lower_is_better',
    },
    tanner_staging_compliance: {
      label: 'Estadificación Tanner Documentada',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    thyroid_control_rate: {
      label: '% Control Tiroideo',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    gh_response_rate: {
      label: 'Respuesta a GH',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción Paciente / Familia',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'control_crecimiento',
      'control_dm1',
      'control_tiroides',
      'evaluacion_puberal',
      'ajuste_gh',
      'ajuste_bomba_insulina',
      'revision_cgm',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_endocrina_pediatrica',
      'evaluacion_crecimiento',
      'estadificacion_tanner',
      'plan_dm1',
      'plan_gh',
      'evaluacion_tiroidea_pediatrica',
      'configuracion_bomba_pediatrica',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksGrowthHormone: true,
      tracksPubertyStaging: true,
      tracksCongenitalHypothyroidism: true,
      managesType1Diabetes: true,
      usesGrowthCharts: true,
      supportsCGM: true,
      supportsInsulinPump: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'TrendingUp',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ENDOCRINOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Estadios de Tanner para desarrollo puberal.
 */
export const TANNER_STAGES = {
  female_breast: {
    label: 'Desarrollo Mamario (Femenino)',
    stages: [
      { stage: 1, label: 'Tanner I', description: 'Prepuberal — sin desarrollo mamario' },
      { stage: 2, label: 'Tanner II', description: 'Botón mamario — elevación mama y papila', ageRange: '8-13' },
      { stage: 3, label: 'Tanner III', description: 'Aumento mama y areola sin separación contornos', ageRange: '10-14' },
      { stage: 4, label: 'Tanner IV', description: 'Proyección areola y papila — montículo secundario', ageRange: '11-15' },
      { stage: 5, label: 'Tanner V', description: 'Mama adulta — papila proyecta, areola al contorno', ageRange: '12-18' },
    ],
  },
  male_genital: {
    label: 'Desarrollo Genital (Masculino)',
    stages: [
      { stage: 1, label: 'Tanner I', description: 'Prepuberal — testículos < 4 mL' },
      { stage: 2, label: 'Tanner II', description: 'Aumento testicular (4 mL), escroto enrojecido', ageRange: '9-14' },
      { stage: 3, label: 'Tanner III', description: 'Crecimiento peneano en longitud', ageRange: '10-15' },
      { stage: 4, label: 'Tanner IV', description: 'Crecimiento peneano en grosor, glande', ageRange: '11-16' },
      { stage: 5, label: 'Tanner V', description: 'Genitales adultos', ageRange: '12-17' },
    ],
  },
  pubic_hair: {
    label: 'Vello Púbico (Ambos Sexos)',
    stages: [
      { stage: 1, label: 'Tanner I', description: 'Sin vello púbico' },
      { stage: 2, label: 'Tanner II', description: 'Vello escaso, liso, en labios/base pene' },
      { stage: 3, label: 'Tanner III', description: 'Vello más oscuro, rizado, sobre pubis' },
      { stage: 4, label: 'Tanner IV', description: 'Vello tipo adulto, área menor' },
      { stage: 5, label: 'Tanner V', description: 'Vello adulto, distribución triángulo invertido' },
    ],
  },
} as const;

/**
 * Estándares de curvas de crecimiento pediátrico.
 */
export const PEDIATRIC_GROWTH_STANDARDS = {
  who_0_5: {
    label: 'OMS 0-5 años',
    parameters: ['peso_edad', 'talla_edad', 'peso_talla', 'imc_edad', 'perimetro_cefalico'],
    reference: 'WHO Child Growth Standards 2006',
  },
  who_5_19: {
    label: 'OMS 5-19 años',
    parameters: ['talla_edad', 'imc_edad'],
    reference: 'WHO Growth Reference 2007',
  },
  cdc_2_20: {
    label: 'CDC 2-20 años',
    parameters: ['peso_edad', 'talla_edad', 'imc_edad'],
    reference: 'CDC Growth Charts 2000',
  },
} as const;

/**
 * Protocolos de tratamiento con hormona de crecimiento.
 */
export const GH_THERAPY_PROTOCOLS = [
  { key: 'gh_deficiency', label: 'Déficit de GH', dose: '0.025-0.05 mg/kg/día', monitoring: 'IGF-1, edad ósea cada 6-12 meses' },
  { key: 'turner', label: 'Síndrome de Turner', dose: '0.045-0.05 mg/kg/día', monitoring: 'IGF-1, cariotipo confirmado, ecocardiograma' },
  { key: 'sga', label: 'Pequeño para Edad Gestacional', dose: '0.035-0.07 mg/kg/día', monitoring: 'IGF-1, glucosa, velocidad de crecimiento' },
  { key: 'prader_willi', label: 'Prader-Willi', dose: '0.035 mg/kg/día', monitoring: 'IGF-1, polisomnografía, IMC, escoliosis' },
  { key: 'chronic_renal', label: 'Insuficiencia Renal Crónica', dose: '0.045-0.05 mg/kg/día', monitoring: 'IGF-1, función renal, metabolismo óseo' },
] as const;

/**
 * Objetivos glucémicos pediátricos (ISPAD 2022).
 */
export const PEDIATRIC_GLYCEMIC_TARGETS = {
  hba1c: { target: '< 7.0%', ideal: '< 6.5%', unit: '%' },
  time_in_range: { target: '> 70%', range: '70-180 mg/dL', unit: '%' },
  time_below_range: { target: '< 4%', threshold: '< 70 mg/dL', unit: '%' },
  time_below_critical: { target: '< 1%', threshold: '< 54 mg/dL', unit: '%' },
  time_above_range: { target: '< 25%', threshold: '> 180 mg/dL', unit: '%' },
  time_above_critical: { target: '< 5%', threshold: '> 250 mg/dL', unit: '%' },
  gmi: { target: '< 7.0%', unit: '%' },
  cv: { target: '< 36%', unit: '%' },
} as const;
