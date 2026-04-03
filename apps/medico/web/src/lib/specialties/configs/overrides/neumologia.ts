/**
 * @file overrides/neumologia.ts
 * @description Override de configuración para Neumología.
 *
 * Especialidad del aparato respiratorio — espirometría y tendencias FEV1,
 * estadificación COPD (GOLD), control de asma (ACT), resultados de
 * estudios del sueño, oxigenoterapia y rehabilitación pulmonar.
 *
 * También exporta constantes de dominio: clasificación GOLD,
 * cuestionario ACT, parámetros de oxigenoterapia.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neumología.
 * Especialidad con módulos clínicos y de laboratorio pulmonar.
 */
export const neumologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neumologia',
  dashboardPath: '/dashboard/medico/neumologia',

  modules: {
    clinical: [
      {
        key: 'neumo-consulta',
        label: 'Consulta Neumológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/neumologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP respiratorio, auscultación, historia tabáquica',
      },
      {
        key: 'neumo-espirometria',
        label: 'Espirometría',
        icon: 'Wind',
        route: '/dashboard/medico/neumologia/espirometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['fev1_decline_rate'],
        description: 'FEV1, FVC, FEV1/FVC, tendencias, respuesta broncodilatadora',
      },
      {
        key: 'neumo-epoc',
        label: 'Manejo de EPOC (GOLD)',
        icon: 'Gauge',
        route: '/dashboard/medico/neumologia/epoc',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['exacerbation_frequency'],
        description: 'Clasificación GOLD, CAT, mMRC, exacerbaciones, plan escalonado',
      },
      {
        key: 'neumo-asma',
        label: 'Control de Asma',
        icon: 'Cloudy',
        route: '/dashboard/medico/neumologia/asma',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['asthma_control_score'],
        description: 'ACT score, GINA steps, plan de acción, triggers',
      },
      {
        key: 'neumo-sueno',
        label: 'Estudios del Sueño',
        icon: 'Moon',
        route: '/dashboard/medico/neumologia/sueno',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Polisomnografía, IAH, CPAP, Epworth, titulación',
      },
      {
        key: 'neumo-oxigeno',
        label: 'Oxigenoterapia',
        icon: 'Droplets',
        route: '/dashboard/medico/neumologia/oxigeno',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'O2 domiciliario, gasometría, SpO2, titulación de flujo',
      },
      {
        key: 'neumo-rehabilitacion',
        label: 'Rehabilitación Pulmonar',
        icon: 'Dumbbell',
        route: '/dashboard/medico/neumologia/rehabilitacion',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Programa de rehabilitación, 6MWT, disnea, calidad de vida',
      },
    ],

    laboratory: [
      {
        key: 'neumo-laboratorio',
        label: 'Panel de Laboratorio Pulmonar',
        icon: 'FlaskConical',
        route: '/dashboard/medico/neumologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Gasometría, IgE, eosinófilos, alfa-1 antitripsina',
      },
      {
        key: 'neumo-imagenologia',
        label: 'Imagenología Torácica',
        icon: 'Scan',
        route: '/dashboard/medico/neumologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Rx tórax, TC torácica, TC de alta resolución',
      },
      {
        key: 'neumo-pfr',
        label: 'Pruebas de Función Respiratoria',
        icon: 'BarChart',
        route: '/dashboard/medico/neumologia/pfr',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Espirometría, pletismografía, DLCO, test de metacolina',
      },
    ],

    financial: [
      {
        key: 'neumo-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/neumologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neumo-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/neumologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'neumo-calculadoras',
        label: 'Calculadoras Neumológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/neumologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'GOLD, BODE, ACT, mMRC, Epworth, riesgo de SAHOS',
      },
      {
        key: 'neumo-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/neumologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'GOLD, GINA, ATS/ERS — guías de neumología',
      },
    ],

    communication: [
      {
        key: 'neumo-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/neumologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neumo-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/neumologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'neumo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neumologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'spirometry-trends',
      component: '@/components/dashboard/medico/neumologia/widgets/spirometry-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'copd-patients',
      component: '@/components/dashboard/medico/neumologia/widgets/copd-patients-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'asthma-control',
      component: '@/components/dashboard/medico/neumologia/widgets/asthma-control-widget',
      size: 'medium',
    },
    {
      key: 'oxygen-therapy',
      component: '@/components/dashboard/medico/neumologia/widgets/oxygen-therapy-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'fev1_decline_rate',
    'exacerbation_frequency',
    'asthma_control_score',
    'spirometry_compliance',
    'rehab_completion_rate',
    'oxygen_therapy_adherence',
  ],

  kpiDefinitions: {
    fev1_decline_rate: {
      label: 'Tasa de Declive FEV1 (mL/año)',
      format: 'number',
      goal: 30,
      direction: 'lower_is_better',
    },
    exacerbation_frequency: {
      label: 'Exacerbaciones / Año',
      format: 'number',
      goal: 1,
      direction: 'lower_is_better',
    },
    asthma_control_score: {
      label: 'ACT Score Promedio',
      format: 'number',
      goal: 20,
      direction: 'higher_is_better',
    },
    spirometry_compliance: {
      label: 'Adherencia a Espirometría',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    rehab_completion_rate: {
      label: 'Tasa de Completación Rehabilitación',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    oxygen_therapy_adherence: {
      label: 'Adherencia Oxigenoterapia',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'espirometria',
      'control_epoc',
      'control_asma',
      'estudio_sueno',
      'control_oxigeno',
      'rehabilitacion_pulmonar',
      'prueba_funcion_respiratoria',
      'broncoscopia',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_respiratoria',
      'examen_fisico_pulmonar',
      'informe_espirometria',
      'plan_manejo_epoc',
      'plan_accion_asma',
      'informe_polisomnografia',
      'prescripcion_oxigeno',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksSpirometry: true,
      requiresGOLDStaging: true,
      tracksAsthmaControl: true,
      supportsSleepStudies: true,
      requiresOxygenTherapy: true,
      supportsPulmonaryRehab: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    icon: 'Wind',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEUMOLOGÍA
// ============================================================================

/**
 * Clasificación GOLD para EPOC (2024+).
 */
export const GOLD_CLASSIFICATION = {
  spirometric: [
    { stage: 'GOLD 1', label: 'Leve', criteria: 'FEV1 ≥ 80% predicho' },
    { stage: 'GOLD 2', label: 'Moderado', criteria: '50% ≤ FEV1 < 80% predicho' },
    { stage: 'GOLD 3', label: 'Severo', criteria: '30% ≤ FEV1 < 50% predicho' },
    { stage: 'GOLD 4', label: 'Muy Severo', criteria: 'FEV1 < 30% predicho' },
  ],
  abcde: [
    { group: 'A', exacerbations: '0-1 sin hospitalización', symptoms: 'mMRC 0-1, CAT < 10' },
    { group: 'B', exacerbations: '0-1 sin hospitalización', symptoms: 'mMRC ≥ 2, CAT ≥ 10' },
    { group: 'E', exacerbations: '≥ 2, o ≥ 1 con hospitalización', symptoms: 'Cualquier nivel' },
  ],
} as const;

/**
 * Cuestionario ACT (Asthma Control Test).
 * 5 preguntas, puntuación 1-5 cada una (total 5-25).
 */
export const ACT_QUESTIONNAIRE = [
  { key: 'activity_limitation', label: 'Limitación de Actividades', question: '¿Con qué frecuencia el asma le impidió hacer lo que quería en el trabajo, escuela o hogar?' },
  { key: 'shortness_of_breath', label: 'Falta de Aire', question: '¿Con qué frecuencia ha sentido falta de aire?' },
  { key: 'night_symptoms', label: 'Síntomas Nocturnos', question: '¿Con qué frecuencia los síntomas de asma lo despertaron o le impidieron dormir?' },
  { key: 'rescue_inhaler', label: 'Uso de Rescate', question: '¿Con qué frecuencia ha usado su inhalador de rescate?' },
  { key: 'self_assessment', label: 'Auto-evaluación', question: '¿Cómo calificaría el control de su asma?' },
] as const;

/**
 * Parámetros de oxigenoterapia domiciliaria.
 */
export const OXYGEN_THERAPY_PARAMETERS = {
  indications: [
    { key: 'chronic_hypoxemia', label: 'Hipoxemia Crónica', criteria: 'PaO2 ≤ 55 mmHg o SpO2 ≤ 88% en reposo' },
    { key: 'with_comorbidity', label: 'Hipoxemia + Comorbilidad', criteria: 'PaO2 56-59 mmHg + cor pulmonale, policitemia, o ICC' },
    { key: 'exercise', label: 'Desaturación con Ejercicio', criteria: 'SpO2 < 88% con esfuerzo' },
    { key: 'nocturnal', label: 'Desaturación Nocturna', criteria: 'SpO2 < 88% por > 5 min durante sueño' },
  ],
  deliverySystems: [
    { key: 'concentrator', label: 'Concentrador de O2', flow: '0.5-10 L/min', portable: false },
    { key: 'liquid', label: 'O2 Líquido', flow: '0.25-6 L/min', portable: true },
    { key: 'compressed', label: 'Cilindro Comprimido', flow: '0.5-15 L/min', portable: false },
    { key: 'portable_concentrator', label: 'Concentrador Portátil', flow: '1-5 L/min (pulso)', portable: true },
  ],
  targets: {
    copd: 'SpO2 88-92%',
    general: 'SpO2 ≥ 94%',
    palliative: 'Alivio de disnea (sin target fijo)',
  },
} as const;
