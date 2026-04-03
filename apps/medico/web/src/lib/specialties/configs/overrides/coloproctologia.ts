/**
 * @file overrides/coloproctologia.ts
 * @description Override de configuración para Coloproctología.
 *
 * Especialidad quirúrgica del colon, recto y ano — clasificación de
 * hemorroides, mapeo de fístulas, seguimiento de abscesos, seguimiento
 * de colonoscopía, planificación quirúrgica (stapled/PPH) y scoring
 * de incontinencia (Wexner).
 *
 * También exporta constantes de dominio: clasificación de hemorroides,
 * clasificación de Parks para fístulas, score de Wexner.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Coloproctología.
 * Especialidad quirúrgica con módulos clínicos y quirúrgicos.
 */
export const coloproctologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'coloproctologia',
  dashboardPath: '/dashboard/medico/coloproctologia',

  modules: {
    clinical: [
      {
        key: 'coloprocto-consulta',
        label: 'Consulta Coloproctológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/coloproctologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Anamnesis anorrectal, examen proctológico completo',
      },
      {
        key: 'coloprocto-hemorroides',
        label: 'Clasificación de Hemorroides',
        icon: 'Layers',
        route: '/dashboard/medico/coloproctologia/hemorroides',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Grado I-IV, internas/externas, trombosadas, plan terapéutico',
      },
      {
        key: 'coloprocto-fistulas',
        label: 'Mapeo de Fístulas',
        icon: 'Route',
        route: '/dashboard/medico/coloproctologia/fistulas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Clasificación de Parks, trayecto, RM perineal, seton',
      },
      {
        key: 'coloprocto-abscesos',
        label: 'Seguimiento de Abscesos',
        icon: 'Circle',
        route: '/dashboard/medico/coloproctologia/abscesos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Drenaje, cultivo, evolución, recurrencia',
      },
      {
        key: 'coloprocto-colonoscopia',
        label: 'Seguimiento de Colonoscopía',
        icon: 'Eye',
        route: '/dashboard/medico/coloproctologia/colonoscopia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Hallazgos, vigilancia post-polipectomía, follow-up',
      },
      {
        key: 'coloprocto-quirurgico',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/coloproctologia/quirurgico',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes'],
        description: 'Hemorroidectomía, PPH/stapled, fistulotomía, LIFT, colectomía',
      },
      {
        key: 'coloprocto-incontinencia',
        label: 'Scoring de Incontinencia',
        icon: 'ClipboardList',
        route: '/dashboard/medico/coloproctologia/incontinencia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['wexner_score_improvement'],
        description: 'Wexner score, manometría anorrectal, biofeedback',
      },
    ],

    laboratory: [
      {
        key: 'coloprocto-laboratorio',
        label: 'Panel de Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/coloproctologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, PCR, cultivos, sangre oculta, calprotectina',
      },
      {
        key: 'coloprocto-imagenologia',
        label: 'Imagenología Colorrectal',
        icon: 'Scan',
        route: '/dashboard/medico/coloproctologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'RM perineal, ecografía endoanal, TC abdominopélvica',
      },
    ],

    financial: [
      {
        key: 'coloprocto-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/coloproctologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'coloprocto-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/coloproctologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'coloprocto-calculadoras',
        label: 'Calculadoras Coloproctológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/coloproctologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Wexner, clasificación de hemorroides, Parks, riesgo quirúrgico',
      },
      {
        key: 'coloprocto-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/coloproctologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ASCRS, ESCP — guías de coloproctología',
      },
    ],

    communication: [
      {
        key: 'coloprocto-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/coloproctologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'coloprocto-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/coloproctologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'coloprocto-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/coloproctologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgical-schedule',
      component: '@/components/dashboard/medico/coloproctologia/widgets/surgical-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hemorrhoid-registry',
      component: '@/components/dashboard/medico/coloproctologia/widgets/hemorrhoid-registry-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fistula-tracking',
      component: '@/components/dashboard/medico/coloproctologia/widgets/fistula-tracking-widget',
      size: 'medium',
    },
    {
      key: 'wexner-scores',
      component: '@/components/dashboard/medico/coloproctologia/widgets/wexner-scores-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'surgical_outcomes',
    'recurrence_rate',
    'wexner_score_improvement',
    'complication_rate',
    'colonoscopy_follow_up_compliance',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    surgical_outcomes: {
      label: 'Resultados Quirúrgicos Favorables',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    recurrence_rate: {
      label: 'Tasa de Recurrencia',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    wexner_score_improvement: {
      label: 'Mejora Promedio Score Wexner',
      format: 'number',
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    colonoscopy_follow_up_compliance: {
      label: 'Adherencia Follow-Up Colonoscopía',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'examen_proctologico',
      'control_hemorroides',
      'control_fistula',
      'pre_quirurgica',
      'post_quirurgica',
      'control_colonoscopia',
      'evaluacion_incontinencia',
      'biofeedback',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_coloproctologica',
      'examen_proctologico',
      'clasificacion_hemorroides',
      'mapeo_fistula',
      'evaluacion_incontinencia',
      'informe_quirurgico',
      'consentimiento_quirurgico',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksHemorrhoidGrading: true,
      requiresFistulaMapping: true,
      tracksAbscessFollowUp: true,
      requiresSurgicalPlanning: true,
      tracksIncontinenceScoring: true,
      supportsAnorectalManometry: true,
    },
  },

  theme: {
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    icon: 'FileText',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — COLOPROCTOLOGÍA
// ============================================================================

/**
 * Clasificación de hemorroides.
 */
export const HEMORRHOID_CLASSIFICATION = {
  internal: [
    { grade: 'I', label: 'Grado I', description: 'Sangrado sin prolapso', treatment: 'Conservador, fibra, escleroterapia' },
    { grade: 'II', label: 'Grado II', description: 'Prolapso con reducción espontánea', treatment: 'Ligadura con banda, escleroterapia' },
    { grade: 'III', label: 'Grado III', description: 'Prolapso con reducción manual', treatment: 'Ligadura con banda, hemorroidectomía' },
    { grade: 'IV', label: 'Grado IV', description: 'Prolapso irreducible', treatment: 'Hemorroidectomía, PPH/stapled' },
  ],
  external: [
    { type: 'thrombosed', label: 'Trombosada', description: 'Coágulo agudo, dolor severo', treatment: 'Excisión si < 72h, conservador si > 72h' },
    { type: 'skin_tag', label: 'Colgajo Cutáneo', description: 'Residuo de hemorroides previas', treatment: 'Excisión electiva si sintomático' },
  ],
} as const;

/**
 * Clasificación de Parks para fístulas anales.
 */
export const PARKS_FISTULA_CLASSIFICATION = [
  { type: 'intersphincteric', label: 'Interesfintérica', frequency: '~45%', description: 'Trayecto entre esfínter interno y externo', treatment: 'Fistulotomía' },
  { type: 'transsphincteric', label: 'Transesfintérica', frequency: '~30%', description: 'Atraviesa ambos esfínteres', treatment: 'Seton, LIFT, colgajo de avance' },
  { type: 'suprasphincteric', label: 'Supraesfintérica', frequency: '~20%', description: 'Sobre el esfínter externo', treatment: 'Seton, LIFT, colgajo de avance' },
  { type: 'extrasphincteric', label: 'Extraesfintérica', frequency: '~5%', description: 'Fuera de ambos esfínteres', treatment: 'Reparación compleja, colostomía temporal' },
] as const;

/**
 * Score de Wexner para incontinencia fecal.
 * Total 0-20, donde 0 = continencia perfecta, 20 = incontinencia completa.
 */
export const WEXNER_INCONTINENCE_SCORE = {
  types: [
    { key: 'solid', label: 'Sólidos' },
    { key: 'liquid', label: 'Líquidos' },
    { key: 'gas', label: 'Gas' },
    { key: 'pad', label: 'Uso de Protección' },
    { key: 'lifestyle', label: 'Alteración del Estilo de Vida' },
  ],
  frequency: [
    { score: 0, label: 'Nunca' },
    { score: 1, label: 'Raramente (< 1/mes)' },
    { score: 2, label: 'A veces (< 1/semana, ≥ 1/mes)' },
    { score: 3, label: 'Usualmente (< 1/día, ≥ 1/semana)' },
    { score: 4, label: 'Siempre (≥ 1/día)' },
  ],
  interpretation: [
    { range: '0', label: 'Continencia perfecta' },
    { range: '1-7', label: 'Incontinencia leve' },
    { range: '8-14', label: 'Incontinencia moderada' },
    { range: '15-20', label: 'Incontinencia severa' },
  ],
} as const;
