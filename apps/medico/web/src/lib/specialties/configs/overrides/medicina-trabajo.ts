/**
 * @file overrides/medicina-trabajo.ts
 * @description Override de configuración para Medicina del Trabajo (Ocupacional).
 *
 * Salud ocupacional — documentación de lesiones laborales, seguimiento
 * de exposiciones, evaluaciones de aptitud laboral, evaluaciones
 * ergonómicas, determinación de discapacidad, planes de retorno
 * al trabajo.
 *
 * También exporta constantes de dominio: clasificación de lesiones
 * laborales, tipos de exposición, categorías de aptitud laboral.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina del Trabajo.
 * Especialidad con enfoque en salud laboral y prevención ocupacional.
 */
export const medicinaTrabajoOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-trabajo',
  dashboardPath: '/dashboard/medico/medicina-trabajo',

  modules: {
    clinical: [
      {
        key: 'laboral-consulta',
        label: 'Consulta de Medicina Laboral',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-trabajo/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación ocupacional, anamnesis laboral, riesgos',
      },
      {
        key: 'laboral-lesiones',
        label: 'Lesiones Laborales',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/medicina-trabajo/lesiones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['injury_rate'],
        description: 'Documentación de accidentes, mecanismo, gravedad, evolución',
      },
      {
        key: 'laboral-exposiciones',
        label: 'Seguimiento de Exposiciones',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-trabajo/exposiciones',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Exposición a químicos, ruido, radiación, biológicos, ergonómicos',
      },
      {
        key: 'laboral-aptitud',
        label: 'Aptitud Laboral',
        icon: 'CheckCircle',
        route: '/dashboard/medico/medicina-trabajo/aptitud',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['fitness_evaluations'],
        description: 'Pre-empleo, periódica, post-incapacidad, egreso',
      },
      {
        key: 'laboral-ergonomia',
        label: 'Evaluaciones Ergonómicas',
        icon: 'Monitor',
        route: '/dashboard/medico/medicina-trabajo/ergonomia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'REBA, RULA, puesto de trabajo, recomendaciones de adaptación',
      },
      {
        key: 'laboral-discapacidad',
        label: 'Determinación de Discapacidad',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-trabajo/discapacidad',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Baremos, pérdida de capacidad laboral, incapacidad temporal/permanente',
      },
      {
        key: 'laboral-retorno',
        label: 'Planes de Retorno al Trabajo',
        icon: 'ArrowRight',
        route: '/dashboard/medico/medicina-trabajo/retorno',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['return_to_work_time'],
        description: 'Reincorporación progresiva, restricciones, seguimiento',
      },
    ],

    laboratory: [
      {
        key: 'laboral-laboratorio',
        label: 'Laboratorio Ocupacional',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-trabajo/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, perfil hepático/renal, plomo, mercurio, audiometría',
      },
      {
        key: 'laboral-vigilancia',
        label: 'Vigilancia Médica por Exposición',
        icon: 'Eye',
        route: '/dashboard/medico/medicina-trabajo/vigilancia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Espirometría, audiometría, biomarcadores de exposición',
      },
      {
        key: 'laboral-imagenologia',
        label: 'Imagenología Ocupacional',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-trabajo/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Rx tórax (neumoconiosis), Rx columna, RM articulaciones',
      },
    ],

    financial: [
      {
        key: 'laboral-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-trabajo/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'laboral-seguros',
        label: 'Seguros y ARL',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-trabajo/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Aseguradoras de riesgos laborales, compensación, informes',
      },
    ],

    technology: [
      {
        key: 'laboral-calculadoras',
        label: 'Calculadoras Ocupacionales',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-trabajo/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'REBA, RULA, NIOSH lifting, exposición a ruido (TWA), baremos',
      },
      {
        key: 'laboral-guias',
        label: 'Guías y Normativa',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-trabajo/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'LOPCYMAT, INPSASEL, NIOSH, OSHA — normativa laboral',
      },
    ],

    communication: [
      {
        key: 'laboral-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-trabajo/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'laboral-reportes',
        label: 'Reportes a Empleador',
        icon: 'FileBarChart',
        route: '/dashboard/medico/medicina-trabajo/reportes',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
        description: 'Informes de aptitud, restricciones, vigilancia epidemiológica',
      },
    ],

    growth: [
      {
        key: 'laboral-analytics',
        label: 'Indicadores de Salud Ocupacional',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-trabajo/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'injury-tracker',
      component: '@/components/dashboard/medico/medicina-trabajo/widgets/injury-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'fitness-evaluations',
      component: '@/components/dashboard/medico/medicina-trabajo/widgets/fitness-evaluations-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'exposure-monitoring',
      component: '@/components/dashboard/medico/medicina-trabajo/widgets/exposure-monitoring-widget',
      size: 'medium',
    },
    {
      key: 'return-to-work',
      component: '@/components/dashboard/medico/medicina-trabajo/widgets/return-to-work-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'injury_rate',
    'return_to_work_time',
    'fitness_evaluations',
    'exposure_compliance',
    'ergonomic_assessments',
    'disability_determinations',
  ],

  kpiDefinitions: {
    injury_rate: {
      label: 'Tasa de Lesiones Laborales',
      format: 'number',
      direction: 'lower_is_better',
    },
    return_to_work_time: {
      label: 'Tiempo Promedio de Retorno (días)',
      format: 'number',
      goal: 14,
      direction: 'lower_is_better',
    },
    fitness_evaluations: {
      label: 'Evaluaciones de Aptitud / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
    exposure_compliance: {
      label: 'Cumplimiento de Vigilancia por Exposición',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    ergonomic_assessments: {
      label: 'Evaluaciones Ergonómicas Realizadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    disability_determinations: {
      label: 'Determinaciones de Discapacidad / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'pre_empleo',
      'periodica',
      'post_incapacidad',
      'egreso',
      'accidente_laboral',
      'evaluacion_exposicion',
      'evaluacion_ergonomica',
      'determinacion_discapacidad',
      'retorno_laboral',
      'urgencia_ocupacional',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_empleo',
      'evaluacion_periodica',
      'informe_accidente_laboral',
      'evaluacion_exposicion',
      'evaluacion_ergonomica',
      'determinacion_discapacidad',
      'plan_retorno_laboral',
      'informe_aptitud_laboral',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      documentsWorkplaceInjuries: true,
      tracksExposures: true,
      requiresFitnessForDuty: true,
      performsErgonomicAssessments: true,
      determinesDisability: true,
      tracksReturnToWork: true,
      requiresOccupationalSurveillance: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'HardHat',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA DEL TRABAJO
// ============================================================================

/**
 * Clasificación de lesiones laborales.
 */
export const WORKPLACE_INJURY_CLASSIFICATION = [
  { key: 'strain_sprain', label: 'Esguince / Distensión', description: 'Lesiones musculoesqueléticas por esfuerzo o movimiento' },
  { key: 'laceration', label: 'Laceración / Herida', description: 'Cortes, heridas punzantes, abrasiones' },
  { key: 'fracture', label: 'Fractura', description: 'Fractura ósea por trauma' },
  { key: 'burn', label: 'Quemadura', description: 'Quemadura térmica, química o eléctrica' },
  { key: 'contusion', label: 'Contusión / Hematoma', description: 'Trauma cerrado sin herida abierta' },
  { key: 'amputation', label: 'Amputación', description: 'Pérdida traumática de extremidad o segmento' },
  { key: 'crush', label: 'Aplastamiento', description: 'Lesión por compresión' },
  { key: 'chemical_exposure', label: 'Exposición Química', description: 'Contacto con sustancias químicas tóxicas' },
  { key: 'noise_induced', label: 'Trauma Acústico', description: 'Hipoacusia inducida por ruido' },
  { key: 'repetitive_strain', label: 'Lesión por Esfuerzo Repetitivo', description: 'Síndrome del túnel carpiano, tendinitis, epicondilitis' },
] as const;

/**
 * Tipos de exposición ocupacional.
 */
export const OCCUPATIONAL_EXPOSURE_TYPES = [
  { key: 'chemical', label: 'Químicos', examples: ['Solventes', 'Metales pesados', 'Pesticidas', 'Gases'], monitoring: 'Biomarcadores específicos' },
  { key: 'physical', label: 'Físicos', examples: ['Ruido', 'Vibración', 'Radiación ionizante', 'Temperaturas extremas'], monitoring: 'Audiometría, dosimetría' },
  { key: 'biological', label: 'Biológicos', examples: ['Sangre/fluidos', 'Mycobacterium', 'Hepatitis B/C', 'VIH'], monitoring: 'Serologías periódicas' },
  { key: 'ergonomic', label: 'Ergonómicos', examples: ['Movimientos repetitivos', 'Carga manual', 'Postura forzada', 'Vibración'], monitoring: 'Evaluación musculoesquelética' },
  { key: 'psychosocial', label: 'Psicosociales', examples: ['Estrés laboral', 'Acoso', 'Carga mental', 'Turnos nocturnos'], monitoring: 'Cuestionarios de riesgo psicosocial' },
  { key: 'dust', label: 'Polvo / Partículas', examples: ['Sílice', 'Asbesto', 'Polvo de madera', 'Polvo de carbón'], monitoring: 'Espirometría, Rx tórax' },
] as const;

/**
 * Categorías de aptitud laboral.
 */
export const FITNESS_FOR_DUTY_CATEGORIES = [
  { key: 'fit', label: 'Apto', description: 'El trabajador puede desempeñar todas las funciones del cargo sin restricciones', color: '#22C55E' },
  { key: 'fit_with_restrictions', label: 'Apto con Restricciones', description: 'Puede trabajar con limitaciones específicas documentadas', color: '#F59E0B' },
  { key: 'temporarily_unfit', label: 'Temporalmente No Apto', description: 'No apto por condición transitoria — reevaluar en fecha determinada', color: '#F97316' },
  { key: 'permanently_unfit', label: 'Permanentemente No Apto', description: 'No puede desempeñar las funciones del cargo actual de forma definitiva', color: '#EF4444' },
  { key: 'pending', label: 'Pendiente de Evaluación', description: 'Requiere estudios complementarios para determinar aptitud', color: '#6B7280' },
] as const;
