/**
 * @file overrides/diabetologia.ts
 * @description Override de configuración para Diabetología.
 *
 * Manejo integral de diabetes — monitoreo de glucosa en dashboard,
 * titulación de insulina, tendencias HbA1c, pie diabético,
 * retinopatía y nefropatía.
 *
 * También exporta constantes de dominio: metas glucémicas,
 * clasificación de nefropatía diabética, protocolo de pie diabético.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Diabetología.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const diabetologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'diabetologia',
  dashboardPath: '/dashboard/medico/diabetologia',

  modules: {
    clinical: [
      {
        key: 'diab-consulta',
        label: 'Consulta Diabetológica',
        icon: 'Droplets',
        route: '/dashboard/medico/diabetologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'avg_consultation_duration'],
        description: 'SOAP diabetológico, revisión de metas, plan terapéutico',
      },
      {
        key: 'diab-glucometria',
        label: 'Dashboard de Glucosa',
        icon: 'LineChart',
        route: '/dashboard/medico/diabetologia/glucometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['time_in_range_avg'],
        description: 'CGM, glucometría capilar, AGP, time in range, variabilidad',
      },
      {
        key: 'diab-insulina',
        label: 'Titulación de Insulina',
        icon: 'Syringe',
        route: '/dashboard/medico/diabetologia/insulina',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Ajuste basal/bolo, ratio I:C, factor sensibilidad, bomba',
      },
      {
        key: 'diab-hba1c',
        label: 'Tendencias HbA1c',
        icon: 'TrendingUp',
        route: '/dashboard/medico/diabetologia/hba1c',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['hba1c_avg'],
        description: 'Evolución trimestral de HbA1c, correlación con CGM/glucometría',
      },
      {
        key: 'diab-pie',
        label: 'Pie Diabético',
        icon: 'Footprints',
        route: '/dashboard/medico/diabetologia/pie',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['foot_exam_compliance'],
        description: 'Monofilamento, pulsos, Wagner, clasificación y seguimiento',
      },
      {
        key: 'diab-retinopatia',
        label: 'Tamizaje Retinopatía',
        icon: 'Eye',
        route: '/dashboard/medico/diabetologia/retinopatia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['retinopathy_screening_rate'],
        description: 'Fondo de ojo, retinografía, clasificación, derivación',
      },
      {
        key: 'diab-nefropatia',
        label: 'Nefropatía Diabética',
        icon: 'Filter',
        route: '/dashboard/medico/diabetologia/nefropatia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Microalbuminuria, TFG, estadificación, nefroprotección',
      },
    ],

    laboratory: [
      {
        key: 'diab-laboratorio',
        label: 'Panel Metabólico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/diabetologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'HbA1c, perfil lipídico, función renal, hepática, microalbuminuria',
      },
      {
        key: 'diab-cgm-data',
        label: 'Datos CGM / Glucómetro',
        icon: 'Database',
        route: '/dashboard/medico/diabetologia/cgm-data',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Descarga de datos CGM, reportes AGP, patrones glucémicos',
      },
      {
        key: 'diab-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/diabetologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Retinografía, eco Doppler MMII, ecografía renal',
      },
    ],

    technology: [
      {
        key: 'diab-calculadoras',
        label: 'Calculadoras Diabetológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/diabetologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Dosis insulina, ratio I:C, factor sensibilidad, eGFR, riesgo CV',
      },
      {
        key: 'diab-bomba',
        label: 'Configuración de Bomba',
        icon: 'Cpu',
        route: '/dashboard/medico/diabetologia/bomba',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Perfiles basales, bolos, alarmas, ajuste de parámetros',
      },
      {
        key: 'diab-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/diabetologia/guias',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'ADA Standards of Care, ALAD, guías de manejo insulínico',
      },
    ],
  },

  widgets: [
    {
      key: 'glucose-dashboard',
      component: '@/components/dashboard/medico/diabetologia/widgets/glucose-dashboard-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hba1c-trends',
      component: '@/components/dashboard/medico/diabetologia/widgets/hba1c-trends-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'complication-screening',
      component: '@/components/dashboard/medico/diabetologia/widgets/complication-screening-widget',
      size: 'medium',
    },
    {
      key: 'insulin-titration',
      component: '@/components/dashboard/medico/diabetologia/widgets/insulin-titration-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'time_in_range_avg',
    'hba1c_avg',
    'complication_screening_rate',
    'foot_exam_compliance',
    'retinopathy_screening_rate',
    'nephropathy_staging_rate',
  ],

  kpiDefinitions: {
    time_in_range_avg: {
      label: 'Time in Range Promedio (%)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    hba1c_avg: {
      label: 'HbA1c Promedio (%)',
      format: 'number',
      goal: 7.0,
      direction: 'lower_is_better',
    },
    complication_screening_rate: {
      label: 'Tamizaje Complicaciones',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    foot_exam_compliance: {
      label: 'Examen de Pie Realizado',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    retinopathy_screening_rate: {
      label: 'Tamizaje Retinopatía',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    nephropathy_staging_rate: {
      label: 'Estadificación Nefropatía',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'control_diabetes',
      'ajuste_insulina',
      'revision_cgm',
      'examen_pie_diabetico',
      'educacion_diabetes',
      'control_complicaciones',
      'ajuste_bomba',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_diabetologica',
      'evaluacion_glucometrica',
      'plan_insulinico',
      'examen_pie_diabetico',
      'tamizaje_complicaciones',
      'educacion_diabetes',
      'configuracion_bomba',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksGlucoseMonitoring: true,
      tracksInsulinTitration: true,
      tracksHbA1cTrends: true,
      tracksDiabeticFoot: true,
      screensRetinopathy: true,
      stagesNephropathy: true,
      supportsCGM: true,
      supportsInsulinPump: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Droplets',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — DIABETOLOGÍA
// ============================================================================

/**
 * Metas glucémicas por grupo poblacional (ADA 2024).
 */
export const GLYCEMIC_TARGETS = {
  general_adult: {
    label: 'Adulto General',
    hba1c: '< 7.0%',
    fasting_glucose: '80-130 mg/dL',
    postprandial_glucose: '< 180 mg/dL',
    time_in_range: '> 70%',
    time_below: '< 4%',
    time_below_critical: '< 1%',
  },
  older_adult_healthy: {
    label: 'Adulto Mayor Saludable',
    hba1c: '< 7.5%',
    fasting_glucose: '80-130 mg/dL',
    postprandial_glucose: '< 180 mg/dL',
    time_in_range: '> 70%',
    time_below: '< 1%',
    time_below_critical: '< 0.5%',
  },
  older_adult_complex: {
    label: 'Adulto Mayor Complejo',
    hba1c: '< 8.0%',
    fasting_glucose: '100-180 mg/dL',
    postprandial_glucose: '< 200 mg/dL',
    time_in_range: '> 50%',
    time_below: '< 1%',
    time_below_critical: '0%',
  },
  pregnancy: {
    label: 'Embarazo',
    hba1c: '< 6.0%',
    fasting_glucose: '< 95 mg/dL',
    postprandial_1h: '< 140 mg/dL',
    postprandial_2h: '< 120 mg/dL',
    time_in_range: '> 70%',
    time_below: '< 4%',
  },
} as const;

/**
 * Clasificación de pie diabético (Wagner).
 */
export const WAGNER_CLASSIFICATION = [
  { grade: 0, label: 'Grado 0', description: 'Pie en riesgo — sin úlcera, deformidad, neuropatía', management: 'Educación, calzado adecuado, control metabólico' },
  { grade: 1, label: 'Grado 1', description: 'Úlcera superficial', management: 'Descarga, curación local, control infección' },
  { grade: 2, label: 'Grado 2', description: 'Úlcera profunda (tendón, cápsula, hueso)', management: 'Desbridamiento, antibióticos, descarga' },
  { grade: 3, label: 'Grado 3', description: 'Úlcera profunda + absceso / osteomielitis', management: 'Antibióticos IV, cirugía, imagen' },
  { grade: 4, label: 'Grado 4', description: 'Gangrena parcial (antepié)', management: 'Cirugía vascular, amputación menor' },
  { grade: 5, label: 'Grado 5', description: 'Gangrena extensa (todo el pie)', management: 'Amputación mayor, soporte vital' },
] as const;

/**
 * Estadificación de nefropatía diabética (KDIGO).
 */
export const DIABETIC_NEPHROPATHY_STAGES = [
  { stage: 'A1-G1', label: 'Normal', albumin: '< 30 mg/g', gfr: '≥ 90', risk: 'Bajo', action: 'Control metabólico, monitoreo anual' },
  { stage: 'A2-G1', label: 'Microalbuminuria + función normal', albumin: '30-300 mg/g', gfr: '≥ 90', risk: 'Moderado', action: 'IECA/ARA-II, control estricto PA y glucosa' },
  { stage: 'A2-G2', label: 'Microalbuminuria + función leve↓', albumin: '30-300 mg/g', gfr: '60-89', risk: 'Moderado', action: 'Nefroprotección, referir nefrología' },
  { stage: 'A3-G3', label: 'Macroalbuminuria + función moderada↓', albumin: '> 300 mg/g', gfr: '30-59', risk: 'Alto', action: 'Nefrología, ajuste fármacos, dieta' },
  { stage: 'A3-G4', label: 'Macroalbuminuria + función severa↓', albumin: '> 300 mg/g', gfr: '15-29', risk: 'Muy alto', action: 'Preparar diálisis / trasplante' },
  { stage: 'G5', label: 'Falla Renal', albumin: 'variable', gfr: '< 15', risk: 'Crítico', action: 'Diálisis o trasplante' },
] as const;

/**
 * Protocolos de tamizaje de complicaciones diabéticas.
 */
export const COMPLICATION_SCREENING_SCHEDULE = [
  { key: 'retinopathy', label: 'Retinopatía', method: 'Fondo de ojo / retinografía', frequency: 'Anual (DM2 desde diagnóstico, DM1 desde 5 años)', referral: 'Oftalmología' },
  { key: 'nephropathy', label: 'Nefropatía', method: 'Microalbuminuria + creatinina + TFG', frequency: 'Anual', referral: 'Nefrología si TFG < 60 o albuminuria persistente' },
  { key: 'neuropathy', label: 'Neuropatía', method: 'Monofilamento + diapasón + reflejos', frequency: 'Anual', referral: 'Neurología si progresión' },
  { key: 'foot', label: 'Pie Diabético', method: 'Inspección + pulsos + monofilamento + Wagner', frequency: 'Cada consulta', referral: 'Cirugía vascular si Wagner ≥ 2' },
  { key: 'cardiovascular', label: 'Cardiovascular', method: 'Perfil lipídico + PA + ECG', frequency: 'Anual (lípidos), cada consulta (PA)', referral: 'Cardiología si eventos o riesgo alto' },
  { key: 'dental', label: 'Periodontal', method: 'Evaluación odontológica', frequency: 'Semestral', referral: 'Odontología' },
] as const;
