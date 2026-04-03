/**
 * @file overrides/ortopedia-pediatrica.ts
 * @description Override de configuración para Ortopedia Pediátrica.
 *
 * Módulos especializados para el manejo ortopédico infantil:
 * tamizaje de DDH, seguimiento de ángulo de Cobb (escoliosis),
 * clasificación Salter-Harris de fracturas, score Pirani (pie zambo),
 * discrepancia de longitud de miembros.
 *
 * También exporta constantes de dominio: clasificación Salter-Harris,
 * score Pirani, grados de DDH, rangos de Cobb.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Ortopedia Pediátrica.
 * Especialidad con módulos clínicos especializados para el esqueleto infantil en crecimiento.
 */
export const ortopediaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'ortopedia-pediatrica',
  dashboardPath: '/dashboard/medico/ortopedia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'ortopedi-consulta',
        label: 'Consulta Ortopédica Pediátrica',
        icon: 'Bone',
        route: '/dashboard/medico/ortopedia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['ddh_detection_rate', 'fracture_healing_time'],
      },
      {
        key: 'ortopedi-ddh',
        label: 'Tamizaje DDH (Displasia de Cadera)',
        icon: 'Search',
        route: '/dashboard/medico/ortopedia-pediatrica/ddh',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['ddh_detection_rate'],
      },
      {
        key: 'ortopedi-escoliosis',
        label: 'Seguimiento Escoliosis (Cobb)',
        icon: 'Ruler',
        route: '/dashboard/medico/ortopedia-pediatrica/escoliosis',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['cobb_angle_progression'],
      },
      {
        key: 'ortopedi-fracturas',
        label: 'Fracturas (Salter-Harris)',
        icon: 'Zap',
        route: '/dashboard/medico/ortopedia-pediatrica/fracturas',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['fracture_healing_time'],
      },
      {
        key: 'ortopedi-pie-zambo',
        label: 'Pie Zambo (Pirani)',
        icon: 'Footprints',
        route: '/dashboard/medico/ortopedia-pediatrica/pie-zambo',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'ortopedi-discrepancia',
        label: 'Discrepancia de Miembros',
        icon: 'ArrowUpDown',
        route: '/dashboard/medico/ortopedia-pediatrica/discrepancia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'ortopedi-imagenologia',
        label: 'Imagenología Ortopédica',
        icon: 'Scan',
        route: '/dashboard/medico/ortopedia-pediatrica/imagenologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'ortopedi-calculadoras',
        label: 'Calculadoras Ortopédicas',
        icon: 'Calculator',
        route: '/dashboard/medico/ortopedia-pediatrica/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'ortopedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/ortopedia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'ortopedi-rehabilitacion',
        label: 'Plan de Rehabilitación',
        icon: 'Dumbbell',
        route: '/dashboard/medico/ortopedia-pediatrica/rehabilitacion',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ddh-screening-queue',
      component: '@/components/dashboard/medico/ortopedia-pediatrica/widgets/ddh-screening-queue-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'scoliosis-tracker',
      component: '@/components/dashboard/medico/ortopedia-pediatrica/widgets/scoliosis-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'fracture-follow-up',
      component: '@/components/dashboard/medico/ortopedia-pediatrica/widgets/fracture-follow-up-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'ddh_detection_rate',
    'cobb_angle_progression',
    'fracture_healing_time',
    'surgical_outcomes',
    'follow_up_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    ddh_detection_rate: {
      label: 'Tasa de Detección DDH',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    cobb_angle_progression: {
      label: 'Progresión Ángulo de Cobb (°/año)',
      format: 'number',
      goal: 5,
      direction: 'lower_is_better',
    },
    fracture_healing_time: {
      label: 'Tiempo de Consolidación (semanas)',
      format: 'number',
      goal: 6,
      direction: 'lower_is_better',
    },
    surgical_outcomes: {
      label: 'Resultados Quirúrgicos Favorables',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    patient_satisfaction_score: {
      label: 'Satisfacción Padres',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_ortopedica_pediatrica',
      'tamizaje_ddh',
      'seguimiento_escoliosis',
      'control_fractura',
      'evaluacion_pie_zambo',
      'evaluacion_discrepancia',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_ortopedica_pediatrica',
      'examen_musculoesqueletico_pediatrico',
      'tamizaje_ddh',
      'medicion_cobb',
      'clasificacion_salter_harris',
      'score_pirani',
      'evaluacion_discrepancia_miembros',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksDDHScreening: true,
      tracksCobbAngle: true,
      usesSalterHarrisClassification: true,
      usesPiraniScore: true,
      tracksLimbLengthDiscrepancy: true,
      requiresParentalConsent: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    icon: 'Bone',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ORTOPEDIA PEDIÁTRICA
// ============================================================================

/**
 * Clasificación de fracturas Salter-Harris (epifisarias)
 */
export const SALTER_HARRIS_CLASSIFICATION = [
  { type: 'I', label: 'Tipo I (Slip)', description: 'Fractura a través de la fisis (placa de crecimiento). Rx puede ser normal.', prognosis: 'Excelente' },
  { type: 'II', label: 'Tipo II (Above)', description: 'Fractura a través de la fisis y la metáfisis. Fragmento triangular metafisario (Thurston-Holland).', prognosis: 'Excelente' },
  { type: 'III', label: 'Tipo III (Lower)', description: 'Fractura a través de la fisis y la epífisis. Intraarticular.', prognosis: 'Bueno con reducción anatómica' },
  { type: 'IV', label: 'Tipo IV (Through)', description: 'Fractura a través de metáfisis, fisis y epífisis. Intraarticular.', prognosis: 'Requiere reducción quirúrgica' },
  { type: 'V', label: 'Tipo V (Rammed/Crush)', description: 'Compresión/aplastamiento de la fisis. Raro, diagnóstico retrospectivo.', prognosis: 'Peor pronóstico, riesgo de cierre prematuro' },
];

/**
 * Score de Pirani para pie zambo (clubfoot)
 */
export const PIRANI_SCORE = {
  hindfoot: [
    { key: 'posterior_crease', label: 'Pliegue Posterior', scores: [0, 0.5, 1] },
    { key: 'empty_heel', label: 'Talón Vacío', scores: [0, 0.5, 1] },
    { key: 'rigid_equinus', label: 'Equino Rígido', scores: [0, 0.5, 1] },
  ],
  midfoot: [
    { key: 'curved_lateral_border', label: 'Borde Lateral Curvo', scores: [0, 0.5, 1] },
    { key: 'medial_crease', label: 'Pliegue Medial', scores: [0, 0.5, 1] },
    { key: 'talar_head_coverage', label: 'Cobertura Cabeza del Astrágalo', scores: [0, 0.5, 1] },
  ],
  interpretation: {
    mild: { max: 2, label: 'Leve' },
    moderate: { min: 2.5, max: 4, label: 'Moderado' },
    severe: { min: 4.5, max: 6, label: 'Severo' },
  },
};

/**
 * Clasificación de DDH (Displasia del Desarrollo de Cadera)
 */
export const DDH_CLASSIFICATION = {
  graf: [
    { type: 'I', label: 'Tipo I (Normal)', alphaAngle: '>60°', description: 'Cadera madura, techo óseo bien formado' },
    { type: 'IIa', label: 'Tipo IIa (Inmadura)', alphaAngle: '50-59°', description: 'Fisiológica en < 3 meses, requiere seguimiento' },
    { type: 'IIb', label: 'Tipo IIb (Retraso)', alphaAngle: '50-59°', description: '> 3 meses sin maduración, requiere tratamiento' },
    { type: 'IIc', label: 'Tipo IIc (Crítica)', alphaAngle: '43-49°', description: 'Cadera críticamente inmadura' },
    { type: 'III', label: 'Tipo III (Descentrada)', alphaAngle: '<43°', description: 'Cadera luxada sin interposición del labrum' },
    { type: 'IV', label: 'Tipo IV (Luxación)', alphaAngle: '<43°', description: 'Cadera luxada con labrum invertido' },
  ],
  barlow_ortolani: [
    { test: 'Ortolani positivo', description: 'Cadera luxada que se reduce con abducción (clic de reducción)' },
    { test: 'Barlow positivo', description: 'Cadera reducida que se luxa con aducción y presión posterior' },
  ],
};

/**
 * Clasificación de severidad de escoliosis por ángulo de Cobb
 */
export const COBB_ANGLE_RANGES = [
  { range: '< 10°', label: 'Normal / Asimetría Postural', treatment: 'Observación' },
  { range: '10° - 25°', label: 'Escoliosis Leve', treatment: 'Observación cada 6 meses' },
  { range: '25° - 40°', label: 'Escoliosis Moderada', treatment: 'Corsé ortopédico' },
  { range: '40° - 50°', label: 'Escoliosis Severa', treatment: 'Considerar cirugía' },
  { range: '> 50°', label: 'Escoliosis Muy Severa', treatment: 'Indicación quirúrgica' },
];
