/**
 * @file overrides/medicina-materno-fetal.ts
 * @description Override de configuración para Medicina Materno-Fetal.
 *
 * Módulos especializados: manejo de embarazo de alto riesgo, índices Doppler fetal,
 * seguimiento de amniocentesis, gestación múltiple, cerclaje, documentación de
 * anomalías fetales.
 *
 * También exporta constantes de dominio: índices Doppler de referencia,
 * clasificación de riesgo obstétrico, tipos de anomalías fetales.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Materno-Fetal.
 * Subespecialidad para embarazos de alto riesgo y diagnóstico prenatal.
 */
export const medicinaMaternoFetalOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-materno-fetal',
  dashboardPath: '/dashboard/medico/medicina-materno-fetal',

  modules: {
    clinical: [
      {
        key: 'matfetal-alto-riesgo',
        label: 'Embarazo de Alto Riesgo',
        icon: 'HeartPulse',
        route: '/dashboard/medico/medicina-materno-fetal/alto-riesgo',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['perinatal_mortality_rate', 'preterm_prevention_rate'],
      },
      {
        key: 'matfetal-doppler',
        label: 'Doppler Fetal',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-materno-fetal/doppler',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Índices Doppler: arteria umbilical, ACM, ductus venoso',
      },
      {
        key: 'matfetal-amniocentesis',
        label: 'Amniocentesis',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-materno-fetal/amniocentesis',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'matfetal-gestacion-multiple',
        label: 'Gestación Múltiple',
        icon: 'Users',
        route: '/dashboard/medico/medicina-materno-fetal/gestacion-multiple',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Seguimiento de embarazo gemelar/múltiple, discordancia, STFF',
      },
      {
        key: 'matfetal-cerclaje',
        label: 'Cerclaje Cervical',
        icon: 'Link',
        route: '/dashboard/medico/medicina-materno-fetal/cerclaje',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'matfetal-anomalias',
        label: 'Anomalías Fetales',
        icon: 'FileSearch',
        route: '/dashboard/medico/medicina-materno-fetal/anomalias',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['anomaly_detection_rate'],
      },
    ],

    lab: [
      {
        key: 'matfetal-ecografia-avanzada',
        label: 'Ecografía Avanzada',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-materno-fetal/ecografia-avanzada',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'matfetal-cariotipo',
        label: 'Cariotipo / NIPT',
        icon: 'Dna',
        route: '/dashboard/medico/medicina-materno-fetal/cariotipo',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Test prenatal no invasivo, cariotipo fetal, screening combinado',
      },
    ],

    technology: [
      {
        key: 'matfetal-calculadoras',
        label: 'Calculadoras MFM',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-materno-fetal/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Riesgo de aneuploidía, peso fetal estimado, índices Doppler',
      },
    ],

    communication: [
      {
        key: 'matfetal-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-materno-fetal/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'matfetal-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/medicina-materno-fetal/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'high-risk-pregnancies',
      component: '@/components/dashboard/medico/medicina-materno-fetal/widgets/high-risk-pregnancies-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'doppler-indices',
      component: '@/components/dashboard/medico/medicina-materno-fetal/widgets/doppler-indices-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'anomaly-tracking',
      component: '@/components/dashboard/medico/medicina-materno-fetal/widgets/anomaly-tracking-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'perinatal_mortality_rate',
    'preterm_prevention_rate',
    'anomaly_detection_rate',
    'amniocentesis_complication_rate',
    'referral_turnaround',
  ],

  kpiDefinitions: {
    perinatal_mortality_rate: {
      label: 'Mortalidad Perinatal',
      format: 'percentage',
      goal: 0.01,
      direction: 'lower_is_better',
    },
    preterm_prevention_rate: {
      label: 'Tasa de Prevención de Pretérmino',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    anomaly_detection_rate: {
      label: 'Tasa de Detección de Anomalías',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    amniocentesis_complication_rate: {
      label: 'Complicaciones de Amniocentesis',
      format: 'percentage',
      goal: 0.005,
      direction: 'lower_is_better',
    },
    referral_turnaround: {
      label: 'Tiempo de Respuesta a Referencia',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_alto_riesgo',
      'ecografia_avanzada',
      'doppler_fetal',
      'amniocentesis',
      'seguimiento_gemelar',
      'evaluacion_cerclaje',
      'consejeria_genetica_prenatal',
      'seguimiento_anomalia',
    ],
    defaultDuration: 40,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_alto_riesgo',
      'informe_doppler_fetal',
      'informe_amniocentesis',
      'seguimiento_gemelar',
      'documentacion_anomalia',
      'consentimiento_procedimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresDopplerTracking: true,
      supportsFetalAnomaly: true,
      tracksMultipleGestation: true,
      requiresGeneticCounseling: true,
      usesRiskStratification: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'HeartPulse',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO MEDICINA MATERNO-FETAL
// ============================================================================

/**
 * Índices Doppler fetales de referencia
 */
export const FETAL_DOPPLER_INDICES = [
  { key: 'umbilical_artery_pi', label: 'IP Arteria Umbilical', normalRange: '0.7-1.2', criticalThreshold: '>1.5', significance: 'Insuficiencia placentaria' },
  { key: 'mca_pi', label: 'IP Arteria Cerebral Media', normalRange: '1.2-2.0', criticalThreshold: '<1.0', significance: 'Redistribución hemodinámica' },
  { key: 'cpr', label: 'Relación Cerebro-Placentaria (CPR)', normalRange: '>1.0', criticalThreshold: '<1.0', significance: 'Compromiso fetal' },
  { key: 'ductus_venosus', label: 'Ductus Venoso', normalRange: 'Onda A positiva', criticalThreshold: 'Onda A reversa', significance: 'Insuficiencia cardíaca fetal' },
  { key: 'uterine_artery_pi', label: 'IP Arterias Uterinas', normalRange: '<1.45 (2do trim)', criticalThreshold: '>1.45 + notch', significance: 'Riesgo de preeclampsia' },
] as const;

/**
 * Clasificación de riesgo obstétrico
 */
export const OBSTETRIC_RISK_CLASSIFICATION = [
  { level: 'low', label: 'Bajo Riesgo', criteria: ['Sin comorbilidades', 'Embarazo único', 'Sin antecedentes obstétricos adversos'], color: '#22C55E' },
  { level: 'moderate', label: 'Riesgo Moderado', criteria: ['Edad materna >35', 'Antecedente de cesárea', 'Obesidad', 'HTA crónica controlada'], color: '#F59E0B' },
  { level: 'high', label: 'Alto Riesgo', criteria: ['Preeclampsia', 'Diabetes pregestacional', 'Gestación múltiple', 'RCIU', 'Placenta previa'], color: '#EF4444' },
  { level: 'critical', label: 'Muy Alto Riesgo', criteria: ['Acretismo placentario', 'Cardiopatía materna', 'Trasplantada', 'Malformación fetal grave'], color: '#991B1B' },
] as const;
