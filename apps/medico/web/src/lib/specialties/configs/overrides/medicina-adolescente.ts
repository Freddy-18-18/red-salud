/**
 * @file overrides/medicina-adolescente.ts
 * @description Override de configuración para Medicina del Adolescente.
 *
 * Módulos especializados para el manejo integral del adolescente:
 * estadios de Tanner, tamizaje de salud mental (PHQ-A), tamizaje de
 * sustancias (CRAFFT), consejería anticonceptiva, evaluación de
 * trastornos alimentarios.
 *
 * También exporta constantes de dominio: estadios de Tanner,
 * ítems PHQ-A, ítems CRAFFT, clasificación de TCA.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina del Adolescente.
 * Especialidad con módulos clínicos especializados para la salud integral adolescente.
 */
export const medicinaAdolescenteOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-adolescente',
  dashboardPath: '/dashboard/medico/medicina-adolescente',

  modules: {
    clinical: [
      {
        key: 'adol-consulta',
        label: 'Consulta Integral del Adolescente',
        icon: 'Users',
        route: '/dashboard/medico/medicina-adolescente/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance', 'intervention_referrals'],
      },
      {
        key: 'adol-tanner',
        label: 'Estadios de Tanner',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-adolescente/tanner',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance'],
      },
      {
        key: 'adol-salud-mental',
        label: 'Tamizaje Salud Mental (PHQ-A)',
        icon: 'Heart',
        route: '/dashboard/medico/medicina-adolescente/salud-mental',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance', 'intervention_referrals'],
      },
      {
        key: 'adol-sustancias',
        label: 'Tamizaje de Sustancias (CRAFFT)',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/medicina-adolescente/sustancias',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance', 'intervention_referrals'],
      },
      {
        key: 'adol-anticoncepcion',
        label: 'Consejería Anticonceptiva',
        icon: 'MessageCircle',
        route: '/dashboard/medico/medicina-adolescente/anticoncepcion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['confidential_visit_rate'],
      },
      {
        key: 'adol-tca',
        label: 'Evaluación Trastornos Alimentarios',
        icon: 'UtensilsCrossed',
        route: '/dashboard/medico/medicina-adolescente/trastornos-alimentarios',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance', 'intervention_referrals'],
      },
    ],

    technology: [
      {
        key: 'adol-calculadoras',
        label: 'Calculadoras Adolescente',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-adolescente/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'adol-telemedicina',
        label: 'Teleconsulta Adolescente',
        icon: 'Video',
        route: '/dashboard/medico/medicina-adolescente/telemedicina',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'adol-portal-paciente',
        label: 'Portal del Adolescente',
        icon: 'Smartphone',
        route: '/dashboard/medico/medicina-adolescente/portal-paciente',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'adol-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/medicina-adolescente/portal-padres',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'screening-dashboard',
      component: '@/components/dashboard/medico/medicina-adolescente/widgets/screening-dashboard-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'mental-health-alerts',
      component: '@/components/dashboard/medico/medicina-adolescente/widgets/mental-health-alerts-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'tanner-staging-summary',
      component: '@/components/dashboard/medico/medicina-adolescente/widgets/tanner-staging-summary-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'screening_compliance',
    'intervention_referrals',
    'confidential_visit_rate',
    'follow_up_rate',
    'patient_satisfaction_score',
    'depression_improvement_rate',
  ],

  kpiDefinitions: {
    screening_compliance: {
      label: 'Cumplimiento de Tamizajes',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    intervention_referrals: {
      label: 'Derivaciones a Intervención',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    confidential_visit_rate: {
      label: 'Tasa de Visitas Confidenciales',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción Paciente Adolescente',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    depression_improvement_rate: {
      label: 'Mejoría de Síntomas Depresivos',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_integral_adolescente',
      'evaluacion_tanner',
      'tamizaje_salud_mental',
      'tamizaje_sustancias',
      'consejeria_anticonceptiva',
      'evaluacion_tca',
      'consulta_confidencial',
      'seguimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_adolescente',
      'evaluacion_tanner',
      'phq_a',
      'crafft',
      'consejeria_anticonceptiva',
      'evaluacion_tca',
      'nota_confidencial',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      usesTannerStaging: true,
      usesPHQAScreening: true,
      usesCRAFFTScreening: true,
      tracksContraceptionCounseling: true,
      assessesEatingDisorders: true,
      supportsConfidentialVisits: true,
      requiresMinorConsentProtocol: true,
    },
  },

  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    icon: 'Users',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA DEL ADOLESCENTE
// ============================================================================

/**
 * Estadios de Tanner (desarrollo puberal)
 */
export const TANNER_STAGES = {
  male: {
    genital: [
      { stage: 1, label: 'Tanner I', description: 'Prepuberal. Testículos < 4 mL.' },
      { stage: 2, label: 'Tanner II', description: 'Agrandamiento testicular (4 mL). Escroto enrojecido. Sin vello púbico.' },
      { stage: 3, label: 'Tanner III', description: 'Crecimiento del pene en longitud. Testículos 8-12 mL. Vello púbico escaso.' },
      { stage: 4, label: 'Tanner IV', description: 'Crecimiento en grosor. Testículos 12-15 mL. Vello púbico tipo adulto sin extensión.' },
      { stage: 5, label: 'Tanner V', description: 'Genitales adultos. Testículos > 15 mL. Vello púbico adulto con extensión a muslos.' },
    ],
    pubicHair: [
      { stage: 1, description: 'Sin vello púbico' },
      { stage: 2, description: 'Vello escaso, largo, levemente pigmentado en base del pene' },
      { stage: 3, description: 'Vello más oscuro, rizado, sobre pubis' },
      { stage: 4, description: 'Vello tipo adulto sin extensión a muslos' },
      { stage: 5, description: 'Distribución adulta con extensión a muslos' },
    ],
  },
  female: {
    breast: [
      { stage: 1, label: 'Tanner I', description: 'Prepuberal. Solo elevación del pezón.' },
      { stage: 2, label: 'Tanner II', description: 'Botón mamario. Elevación de mama y pezón como montículo pequeño.' },
      { stage: 3, label: 'Tanner III', description: 'Agrandamiento de mama y areola sin separación de contornos.' },
      { stage: 4, label: 'Tanner IV', description: 'Proyección de areola y pezón formando montículo secundario.' },
      { stage: 5, label: 'Tanner V', description: 'Mama adulta. Solo el pezón se proyecta.' },
    ],
    pubicHair: [
      { stage: 1, description: 'Sin vello púbico' },
      { stage: 2, description: 'Vello escaso, largo, levemente pigmentado en labios mayores' },
      { stage: 3, description: 'Vello más oscuro, rizado, sobre pubis' },
      { stage: 4, description: 'Vello tipo adulto sin extensión a muslos' },
      { stage: 5, description: 'Distribución adulta con extensión a muslos' },
    ],
  },
};

/**
 * Ítems del PHQ-A (Patient Health Questionnaire for Adolescents)
 */
export const PHQ_A_ITEMS = [
  { number: 1, text: 'Poco interés o placer en hacer cosas' },
  { number: 2, text: 'Sentirse triste, deprimido/a o sin esperanza' },
  { number: 3, text: 'Dificultad para dormir o dormir demasiado' },
  { number: 4, text: 'Sentirse cansado/a o con poca energía' },
  { number: 5, text: 'Poco apetito o comer demasiado' },
  { number: 6, text: 'Sentirse mal consigo mismo/a' },
  { number: 7, text: 'Dificultad para concentrarse' },
  { number: 8, text: 'Moverse o hablar muy lento, o estar inquieto/a' },
  { number: 9, text: 'Pensamientos de hacerse daño o de que estaría mejor muerto/a' },
];

/**
 * Ítems del CRAFFT (Car, Relax, Alone, Forget, Friends, Trouble)
 */
export const CRAFFT_ITEMS = [
  { letter: 'C', text: '¿Has viajado en un CARRO conducido por alguien (o por ti) que había consumido alcohol o drogas?' },
  { letter: 'R', text: '¿Has usado alcohol o drogas para RELAJARTE, sentirte mejor o encajar?' },
  { letter: 'A', text: '¿Has usado alcohol o drogas estando A SOLAS?' },
  { letter: 'F', text: '¿Has OLVIDADO cosas que hiciste mientras usabas alcohol o drogas?' },
  { letter: 'F', text: '¿Tu FAMILIA o amigos te han dicho que deberías reducir el consumo?' },
  { letter: 'T', text: '¿Te has metido en PROBLEMAS mientras usabas alcohol o drogas?' },
];

/**
 * Clasificación de trastornos de la conducta alimentaria
 */
export const EATING_DISORDER_CLASSIFICATION = [
  { key: 'anorexia_nervosa', label: 'Anorexia Nerviosa', icd11: '6B80', screeningTools: ['EAT-26', 'SCOFF'] },
  { key: 'bulimia_nervosa', label: 'Bulimia Nerviosa', icd11: '6B81', screeningTools: ['BITE', 'SCOFF'] },
  { key: 'binge_eating', label: 'Trastorno por Atracón', icd11: '6B82', screeningTools: ['BES', 'SCOFF'] },
  { key: 'avoidant_restrictive', label: 'ARFID', icd11: '6B83', screeningTools: ['NIAS', 'Pica/ARFID questionnaire'] },
  { key: 'other_specified', label: 'Otro TCA Especificado', icd11: '6B8Y', screeningTools: ['EDE-Q'] },
];
