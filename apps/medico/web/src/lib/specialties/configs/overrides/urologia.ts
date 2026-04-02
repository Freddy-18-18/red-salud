/**
 * @file overrides/urologia.ts
 * @description Override de configuración para Urología.
 *
 * Preserva los módulos especializados (tacto rectal, uroflujometría,
 * cistoscopía, biopsia, litiasis, etc.), widgets, KPIs y settings
 * del config original de urology.
 *
 * También exporta constantes de dominio urológico: IPSS questions,
 * Gleason grade groups, stone composition types.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Urología.
 * Especialidad con módulos clínicos y quirúrgicos especializados.
 */
export const urologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'urologia',
  dashboardPath: '/dashboard/medico/urologia',

  modules: {
    clinical: [
      {
        key: 'uro-consulta',
        label: 'Consulta Urológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/urologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'uro-tacto-rectal',
        label: 'Tacto Rectal / DRE',
        icon: 'Hand',
        route: '/dashboard/medico/urologia/tacto-rectal',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'uro-uroflujometria',
        label: 'Uroflujometría',
        icon: 'Activity',
        route: '/dashboard/medico/urologia/uroflujometria',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'uro-cistoscopia',
        label: 'Cistoscopía',
        icon: 'Eye',
        route: '/dashboard/medico/urologia/cistoscopia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'uro-biopsia',
        label: 'Biopsia Prostática',
        icon: 'Microscope',
        route: '/dashboard/medico/urologia/biopsia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'uro-litiasis',
        label: 'Manejo de Litiasis',
        icon: 'Gem',
        route: '/dashboard/medico/urologia/litiasis',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'uro-incontinencia',
        label: 'Evaluación de Incontinencia',
        icon: 'ClipboardList',
        route: '/dashboard/medico/urologia/incontinencia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'uro-psa',
        label: 'Seguimiento PSA',
        icon: 'TrendingUp',
        route: '/dashboard/medico/urologia/psa',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['psa_monitoring_compliance'],
      },
      {
        key: 'uro-urocultivo',
        label: 'Urocultivo y Uroanálisis',
        icon: 'FlaskConical',
        route: '/dashboard/medico/urologia/urocultivo',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'uro-imagenologia',
        label: 'Imagenología Urológica',
        icon: 'Scan',
        route: '/dashboard/medico/urologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'uro-calculadoras',
        label: 'Calculadoras Urológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/urologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'uro-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/urologia/quirofano',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'uro-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/urologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'uro-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/urologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'uro-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/urologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'psa-tracking',
      component: '@/components/dashboard/medico/urologia/widgets/psa-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/urologia/widgets/upcoming-surgeries-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'urodynamic-studies',
      component: '@/components/dashboard/medico/urologia/widgets/urodynamic-studies-widget',
      size: 'medium',
    },
    {
      key: 'stone-tracking',
      component: '@/components/dashboard/medico/urologia/widgets/stone-tracking-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'psa_monitoring_compliance',
    'surgical_success_rate',
    'uti_recurrence_rate',
    'stone_free_rate',
    'ipss_improvement',
    'avg_surgical_time',
  ],

  kpiDefinitions: {
    psa_monitoring_compliance: {
      label: 'Adherencia al Seguimiento PSA',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    surgical_success_rate: {
      label: 'Tasa de Éxito Quirúrgico',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    uti_recurrence_rate: {
      label: 'Tasa de Recurrencia de ITU',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    stone_free_rate: {
      label: 'Tasa Libre de Cálculos Post-Tratamiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    ipss_improvement: {
      label: 'Mejora Promedio en Score IPSS',
      format: 'number',
      direction: 'higher_is_better',
    },
    avg_surgical_time: {
      label: 'Tiempo Quirúrgico Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'tacto_rectal',
      'uroflujometria',
      'cistoscopia',
      'biopsia_prostatica',
      'control_psa',
      'evaluacion_litiasis',
      'evaluacion_incontinencia',
      'pre_quirurgica',
      'post_quirurgica',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_urologica',
      'examen_fisico_urologico',
      'tacto_rectal',
      'informe_uroflujometria',
      'informe_cistoscopia',
      'informe_biopsia',
      'plan_tratamiento',
      'consentimiento_quirurgico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresPSATracking: true,
      supportsGleasonScoring: true,
      requiresSurgicalPlanning: true,
      tracksStoneComposition: true,
      usesIPSSQuestionnaire: true,
      supportsUrodynamicStudies: true,
    },
  },

  theme: {
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    icon: 'Droplets',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO UROLÓGICO
// ============================================================================

/**
 * Cuestionario IPSS (International Prostate Symptom Score)
 * 7 preguntas con puntuación 0-5 cada una (total 0-35)
 */
export const IPSS_QUESTIONS = [
  {
    key: 'incomplete_emptying',
    label: 'Vaciamiento incompleto',
    question: '¿Con qué frecuencia ha tenido la sensación de no vaciar completamente la vejiga después de orinar?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'frequency',
    label: 'Frecuencia',
    question: '¿Con qué frecuencia ha tenido que orinar de nuevo en menos de 2 horas después de haber terminado de orinar?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'intermittency',
    label: 'Intermitencia',
    question: '¿Con qué frecuencia ha tenido que parar y comenzar de nuevo varias veces al orinar?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'urgency',
    label: 'Urgencia',
    question: '¿Con qué frecuencia ha tenido dificultad para aguantar las ganas de orinar?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'weak_stream',
    label: 'Chorro débil',
    question: '¿Con qué frecuencia ha notado un chorro de orina débil?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'straining',
    label: 'Esfuerzo',
    question: '¿Con qué frecuencia ha tenido que hacer fuerza para comenzar a orinar?',
    scoring: { 0: 'Nunca', 1: 'Menos de 1/5 veces', 2: '< 50% de las veces', 3: '~50% de las veces', 4: '> 50% de las veces', 5: 'Casi siempre' },
  },
  {
    key: 'nocturia',
    label: 'Nocturia',
    question: '¿Cuántas veces suele levantarse por la noche para orinar, desde que se acuesta hasta que se levanta por la mañana?',
    scoring: { 0: 'Ninguna', 1: '1 vez', 2: '2 veces', 3: '3 veces', 4: '4 veces', 5: '5 o más veces' },
  },
] as const;

/**
 * Grupos de grado Gleason (ISUP Grade Groups)
 * Mapeo de Gleason Score a Grade Group 1-5
 */
export const GLEASON_GRADE_GROUPS = [
  { group: 1, gleasonScore: '3+3=6', label: 'Grado 1 — Bien diferenciado', prognosis: 'Favorable', pattern: 'Solo Gleason 3' },
  { group: 2, gleasonScore: '3+4=7', label: 'Grado 2 — Predominantemente bien diferenciado', prognosis: 'Favorable', pattern: 'Gleason 3 predominante' },
  { group: 3, gleasonScore: '4+3=7', label: 'Grado 3 — Predominantemente pobremente diferenciado', prognosis: 'Intermedio', pattern: 'Gleason 4 predominante' },
  { group: 4, gleasonScore: '4+4=8 / 3+5=8 / 5+3=8', label: 'Grado 4 — Pobremente diferenciado', prognosis: 'Desfavorable', pattern: 'Gleason 4 o patrón 5 presente' },
  { group: 5, gleasonScore: '4+5=9 / 5+4=9 / 5+5=10', label: 'Grado 5 — Muy pobremente diferenciado', prognosis: 'Desfavorable', pattern: 'Gleason 5 predominante' },
] as const;

/**
 * Tipos de composición de cálculos renales
 */
export const STONE_COMPOSITION_TYPES = [
  { key: 'calcium_oxalate_monohydrate', label: 'Oxalato de Calcio Monohidratado (Whewellita)', frequency: 'Más común (~40%)', radiopaque: true },
  { key: 'calcium_oxalate_dihydrate', label: 'Oxalato de Calcio Dihidratado (Weddellita)', frequency: 'Común (~20%)', radiopaque: true },
  { key: 'calcium_phosphate', label: 'Fosfato de Calcio (Apatita / Brushita)', frequency: 'Moderado (~10%)', radiopaque: true },
  { key: 'uric_acid', label: 'Ácido Úrico', frequency: 'Moderado (~10%)', radiopaque: false },
  { key: 'struvite', label: 'Estruvita (Fosfato de Amonio y Magnesio)', frequency: 'Moderado (~5-15%)', radiopaque: true },
  { key: 'cystine', label: 'Cistina', frequency: 'Raro (~1-2%)', radiopaque: false },
  { key: 'mixed', label: 'Composición Mixta', frequency: 'Común', radiopaque: true },
] as const;
