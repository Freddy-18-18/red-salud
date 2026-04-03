/**
 * @file overrides/reumatologia-pediatrica.ts
 * @description Override de configuración para Reumatología Pediátrica.
 *
 * Combina Reumatología + Pediatría: módulos especializados para
 * clasificación JIA, screening de uveítis, monitoreo de crecimiento
 * bajo esteroides, scoring JADAS.
 *
 * También exporta constantes de dominio: subtipos JIA, protocolo
 * de screening de uveítis, rangos JADAS.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Reumatología Pediátrica.
 * Especialidad centrada en enfermedades reumáticas en pacientes pediátricos.
 */
export const reumatologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'reumatologia-pediatrica',
  dashboardPath: '/dashboard/medico/reumatologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'reumapedi-consulta',
        label: 'Consulta Reumatología Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/reumatologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'reumapedi-jia',
        label: 'Clasificación JIA',
        icon: 'ClipboardList',
        route: '/dashboard/medico/reumatologia-pediatrica/jia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Clasificación ILAR, subtipo, articulaciones afectadas, laboratorio asociado',
      },
      {
        key: 'reumapedi-uveitis',
        label: 'Screening de Uveítis',
        icon: 'Eye',
        route: '/dashboard/medico/reumatologia-pediatrica/uveitis',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Protocolo de screening oftalmológico, frecuencia según subtipo JIA y ANA',
        kpiKeys: ['uveitis_detection_rate'],
      },
      {
        key: 'reumapedi-jadas',
        label: 'Scoring JADAS',
        icon: 'Calculator',
        route: '/dashboard/medico/reumatologia-pediatrica/jadas',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Juvenile Arthritis Disease Activity Score (JADAS-10/27/71), tendencias',
        kpiKeys: ['jadas_improvement'],
      },
      {
        key: 'reumapedi-crecimiento',
        label: 'Crecimiento bajo Esteroides',
        icon: 'TrendingUp',
        route: '/dashboard/medico/reumatologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Curvas de crecimiento, velocidad de crecimiento, impacto de corticoides',
        kpiKeys: ['growth_velocity'],
      },
      {
        key: 'reumapedi-biologicos',
        label: 'Terapia Biológica Pediátrica',
        icon: 'Syringe',
        route: '/dashboard/medico/reumatologia-pediatrica/biologicos',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Seguimiento de biológicos, dosis por peso, respuesta, vacunación en inmunosupresión',
      },
      {
        key: 'reumapedi-recuento-articular',
        label: 'Recuento Articular Pediátrico',
        icon: 'Bone',
        route: '/dashboard/medico/reumatologia-pediatrica/recuento-articular',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Articulaciones activas/limitadas, homúnculo articular pediátrico',
      },
    ],

    lab: [
      {
        key: 'reumapedi-laboratorio',
        label: 'Laboratorio Reumatológico Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/reumatologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'ANA, FR, anti-CCP, PCR, VSG, hemograma, ferritina',
      },
      {
        key: 'reumapedi-imagenologia',
        label: 'Imagenología Pediátrica',
        icon: 'Image',
        route: '/dashboard/medico/reumatologia-pediatrica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Ecografía articular, resonancia sin contraste, densitometría',
      },
    ],

    technology: [
      {
        key: 'reumapedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/reumatologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'JADAS-10/27/71, CHAQ, Wallace criteria, dosis por peso',
      },
      {
        key: 'reumapedi-tendencias',
        label: 'Tendencias de Actividad',
        icon: 'LineChart',
        route: '/dashboard/medico/reumatologia-pediatrica/tendencias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'reumapedi-portal-padres',
        label: 'Portal para Padres',
        icon: 'Users',
        route: '/dashboard/medico/reumatologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'reumapedi-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/reumatologia-pediatrica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'reumapedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/reumatologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'jadas-trend',
      component: '@/components/dashboard/medico/reumatologia-pediatrica/widgets/jadas-trend-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'uveitis-screening-schedule',
      component: '@/components/dashboard/medico/reumatologia-pediatrica/widgets/uveitis-screening-schedule-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'growth-monitoring',
      component: '@/components/dashboard/medico/reumatologia-pediatrica/widgets/growth-monitoring-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'jia-classification',
      component: '@/components/dashboard/medico/reumatologia-pediatrica/widgets/jia-classification-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'jadas_improvement',
    'uveitis_detection_rate',
    'growth_velocity',
    'inactive_disease_rate',
    'biologic_response_rate',
    'steroid_free_remission',
  ],

  kpiDefinitions: {
    jadas_improvement: {
      label: 'Mejora en JADAS',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    uveitis_detection_rate: {
      label: 'Tasa de Detección de Uveítis',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    growth_velocity: {
      label: 'Velocidad de Crecimiento',
      format: 'number',
      direction: 'higher_is_better',
    },
    inactive_disease_rate: {
      label: 'Tasa de Enfermedad Inactiva',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    biologic_response_rate: {
      label: 'Tasa de Respuesta a Biológicos',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    steroid_free_remission: {
      label: 'Remisión Libre de Esteroides',
      format: 'percentage',
      goal: 0.4,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'evaluacion_jadas',
      'control_biologico',
      'screening_uveitis',
      'control_crecimiento',
      'artrocentesis',
      'evaluacion_funcional',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_reumatologia_pediatrica',
      'clasificacion_jia',
      'evaluacion_jadas',
      'screening_uveitis',
      'seguimiento_crecimiento',
      'seguimiento_biologico_pediatrico',
      'recuento_articular_pediatrico',
      'plan_tratamiento_pediatrico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresJIAClassification: true,
      supportsJADASScoring: true,
      requiresUveitisScreening: true,
      requiresGrowthMonitoring: true,
      supportsBiologicTherapy: true,
      tracksVaccinationInImmunosuppression: true,
    },
  },

  theme: {
    primaryColor: '#7C3AED',
    accentColor: '#5B21B6',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO REUMATOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Subtipos de Artritis Idiopática Juvenil (JIA) según clasificación ILAR
 */
export const JIA_SUBTYPES = [
  { key: 'oligoarticular', label: 'Oligoarticular', joints: '≤4 articulaciones', prevalence: '50-60%', uveitisRisk: 'Alto (especialmente ANA+)', description: 'Forma más común, predomina en niñas pequeñas' },
  { key: 'polyarticular_rf_neg', label: 'Poliarticular FR Negativo', joints: '≥5 articulaciones', prevalence: '20-30%', uveitisRisk: 'Moderado', description: 'Simétrica, grandes y pequeñas articulaciones' },
  { key: 'polyarticular_rf_pos', label: 'Poliarticular FR Positivo', joints: '≥5 articulaciones', prevalence: '5-10%', uveitisRisk: 'Bajo', description: 'Similar a AR del adulto, adolescentes' },
  { key: 'systemic', label: 'Sistémica (Enfermedad de Still)', joints: 'Variable', prevalence: '10-15%', uveitisRisk: 'Bajo', description: 'Fiebre, rash, serositis, MAS posible' },
  { key: 'enthesitis_related', label: 'Artritis Relacionada con Entesitis', joints: 'Variable + entesitis', prevalence: '5-10%', uveitisRisk: 'Bajo (uveítis anterior aguda)', description: 'HLA-B27, espondiloartropatía juvenil' },
  { key: 'psoriatic', label: 'Artritis Psoriásica', joints: 'Variable', prevalence: '<5%', uveitisRisk: 'Moderado', description: 'Artritis + psoriasis o historia familiar' },
  { key: 'undifferentiated', label: 'Indiferenciada', joints: 'Variable', prevalence: '5-10%', uveitisRisk: 'Variable', description: 'No cumple criterios de otros subtipos o cumple >1' },
] as const;

/**
 * Protocolo de screening de uveítis según subtipo JIA y ANA
 */
export const UVEITIS_SCREENING_PROTOCOL = [
  { jiaSubtype: 'Oligoarticular ANA+', ageOnset: '<7 años', duration: '<4 años', frequency: 'Cada 3 meses', risk: 'Alto' },
  { jiaSubtype: 'Oligoarticular ANA+', ageOnset: '<7 años', duration: '≥4 años', frequency: 'Cada 6 meses', risk: 'Moderado' },
  { jiaSubtype: 'Oligoarticular ANA+', ageOnset: '≥7 años', duration: '<4 años', frequency: 'Cada 6 meses', risk: 'Moderado' },
  { jiaSubtype: 'Oligoarticular ANA-', ageOnset: 'Cualquiera', duration: '<4 años', frequency: 'Cada 6 meses', risk: 'Moderado' },
  { jiaSubtype: 'Poliarticular', ageOnset: 'Cualquiera', duration: 'Cualquiera', frequency: 'Cada 6-12 meses', risk: 'Bajo-Moderado' },
  { jiaSubtype: 'Sistémica', ageOnset: 'Cualquiera', duration: 'Cualquiera', frequency: 'Cada 12 meses', risk: 'Bajo' },
] as const;

/**
 * Rangos de actividad JADAS (JADAS-27)
 */
export const JADAS_ACTIVITY_RANGES = [
  { disease: 'Oligoarticular', inactive: '≤1', low: '1.1-2', moderate: '2.1-4.2', high: '>4.2' },
  { disease: 'Poliarticular', inactive: '≤1', low: '1.1-3.8', moderate: '3.9-10.5', high: '>10.5' },
] as const;
