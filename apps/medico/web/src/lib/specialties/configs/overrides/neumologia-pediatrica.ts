/**
 * @file overrides/neumologia-pediatrica.ts
 * @description Override de configuración para Neumología Pediátrica.
 *
 * Combina Neumología + Pediatría: planes de acción de asma infantil,
 * seguimiento de fibrosis quística, seguimiento de displasia broncopulmonar,
 * PFT ajustadas por crecimiento, historia de cuerpo extraño.
 *
 * También exporta constantes de dominio: clasificación de asma pediátrica,
 * seguimiento de FQ, signos de alarma respiratorios.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neumología Pediátrica.
 * Especialidad con módulos clínicos especializados para pulmón en niños.
 */
export const neumologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neumologia-pediatrica',
  dashboardPath: '/dashboard/medico/neumologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'neumo-pedi-consulta',
        label: 'Consulta Neumológica Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/neumologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Anamnesis respiratoria pediátrica, historia perinatal',
      },
      {
        key: 'neumo-pedi-asma',
        label: 'Plan de Acción de Asma',
        icon: 'Wind',
        route: '/dashboard/medico/neumologia-pediatrica/asma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['asthma_control_rate'],
        description: 'Plan por zonas (verde/amarillo/rojo), GINA pediátrico, triggers',
      },
      {
        key: 'neumo-pedi-fq',
        label: 'Fibrosis Quística',
        icon: 'HeartPulse',
        route: '/dashboard/medico/neumologia-pediatrica/fibrosis-quistica',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'FEV1 trending, cultivos, nutrición, moduladores CFTR',
      },
      {
        key: 'neumo-pedi-dbp',
        label: 'Displasia Broncopulmonar',
        icon: 'Baby',
        route: '/dashboard/medico/neumologia-pediatrica/dbp',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Seguimiento de prematuros, O2 domiciliario, crecimiento pulmonar',
      },
      {
        key: 'neumo-pedi-pft',
        label: 'PFT Ajustadas por Crecimiento',
        icon: 'BarChart',
        route: '/dashboard/medico/neumologia-pediatrica/pft',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['pft_compliance'],
        description: 'Espirometría pediátrica, z-scores GLI, oscilometría',
      },
      {
        key: 'neumo-pedi-cuerpo-extrano',
        label: 'Cuerpo Extraño',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/neumologia-pediatrica/cuerpo-extrano',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Historia de aspiración, broncoscopía, seguimiento post-extracción',
      },
    ],

    laboratory: [
      {
        key: 'neumo-pedi-laboratorio',
        label: 'Panel Respiratorio Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/neumologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'IgE, eosinófilos, cloro en sudor, alfa-1 AT, cultivos',
      },
      {
        key: 'neumo-pedi-imagenologia',
        label: 'Imagenología Torácica Pediátrica',
        icon: 'Scan',
        route: '/dashboard/medico/neumologia-pediatrica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Rx tórax, TC torácica, broncoscopía flexible',
      },
    ],

    financial: [
      {
        key: 'neumo-pedi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/neumologia-pediatrica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neumo-pedi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/neumologia-pediatrica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'neumo-pedi-calculadoras',
        label: 'Calculadoras Neumológicas Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/neumologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Z-scores GLI, GINA steps pediátrico, Epworth pediátrico',
      },
      {
        key: 'neumo-pedi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/neumologia-pediatrica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'GINA pediátrico, CFF, ATS pediátrico — guías',
      },
    ],

    communication: [
      {
        key: 'neumo-pedi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/neumologia-pediatrica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neumo-pedi-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/neumologia-pediatrica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'neumo-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neumologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'asthma-action-plans',
      component: '@/components/dashboard/medico/neumologia-pediatrica/widgets/asthma-action-plans-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'cf-tracking',
      component: '@/components/dashboard/medico/neumologia-pediatrica/widgets/cf-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pft-growth-adjusted',
      component: '@/components/dashboard/medico/neumologia-pediatrica/widgets/pft-growth-adjusted-widget',
      size: 'medium',
    },
    {
      key: 'er-visits-avoided',
      component: '@/components/dashboard/medico/neumologia-pediatrica/widgets/er-visits-avoided-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'asthma_control_rate',
    'er_visits_avoided',
    'pft_compliance',
    'cf_fev1_stability',
    'bpd_growth_tracking',
    'foreign_body_follow_up',
  ],

  kpiDefinitions: {
    asthma_control_rate: {
      label: '% Asma Controlada',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    er_visits_avoided: {
      label: 'Visitas ER Evitadas / Trimestre',
      format: 'number',
      direction: 'higher_is_better',
    },
    pft_compliance: {
      label: 'Adherencia a PFT',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    cf_fev1_stability: {
      label: 'Estabilidad FEV1 en FQ',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    bpd_growth_tracking: {
      label: 'Seguimiento de Crecimiento en DBP',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    foreign_body_follow_up: {
      label: 'Follow-Up Post Cuerpo Extraño',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_asma',
      'control_fibrosis_quistica',
      'control_dbp',
      'espirometria_pediatrica',
      'post_broncoscopia',
      'evaluacion_cuerpo_extrano',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_respiratoria_pediatrica',
      'examen_fisico_pediatrico',
      'plan_accion_asma',
      'seguimiento_fibrosis_quistica',
      'seguimiento_dbp',
      'informe_espirometria_pediatrica',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksAsthmaActionPlans: true,
      requiresCFTracking: true,
      tracksBPDFollowUp: true,
      usesGrowthAdjustedPFT: true,
      tracksForeignBodyHistory: true,
      usesGrowthCharts: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEUMOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Clasificación de severidad de asma en pediatría (GINA).
 */
export const PEDIATRIC_ASTHMA_CLASSIFICATION = {
  ageGroups: [
    { key: 'under_5', label: '< 5 años', notes: 'Diagnóstico clínico, no espirometría confiable' },
    { key: '6_to_11', label: '6-11 años', notes: 'Espirometría posible, z-scores GLI' },
    { key: '12_plus', label: '≥ 12 años', notes: 'Igual que adulto' },
  ],
  controlLevels: [
    { level: 'controlled', label: 'Controlada', symptoms: 'Diurnos ≤ 2/sem, nocturnos 0, rescate ≤ 2/sem, sin limitación' },
    { level: 'partially_controlled', label: 'Parcialmente Controlada', symptoms: '1-2 criterios presentes' },
    { level: 'uncontrolled', label: 'No Controlada', symptoms: '3-4 criterios presentes' },
  ],
  actionPlanZones: [
    { zone: 'green', label: 'Zona Verde', criteria: 'Sin síntomas, PEF > 80%', action: 'Medicación de mantenimiento habitual' },
    { zone: 'yellow', label: 'Zona Amarilla', criteria: 'Síntomas leves, PEF 50-80%', action: 'Aumentar controlador, iniciar rescate' },
    { zone: 'red', label: 'Zona Roja', criteria: 'Síntomas severos, PEF < 50%', action: 'Rescate inmediato, acudir a urgencias' },
  ],
} as const;

/**
 * Parámetros de seguimiento de Fibrosis Quística.
 */
export const CF_TRACKING_PARAMETERS = [
  { key: 'fev1', label: 'FEV1 (% predicho)', frequency: 'Cada visita (trimestral)', target: '> 80%' },
  { key: 'bmi_percentile', label: 'IMC Percentil', frequency: 'Cada visita', target: '≥ P50' },
  { key: 'sputum_culture', label: 'Cultivo de Esputo', frequency: 'Cada visita', target: 'Sin Pseudomonas' },
  { key: 'sweat_chloride', label: 'Cloro en Sudor', frequency: 'Al diagnóstico', target: '< 30 mmol/L (post-modulador)' },
  { key: 'pancreatic_function', label: 'Función Pancreática', frequency: 'Anual', target: 'Elastasa fecal > 200' },
  { key: 'liver_function', label: 'Función Hepática', frequency: 'Anual', target: 'Normal' },
  { key: 'glucose_tolerance', label: 'Tolerancia a Glucosa', frequency: 'Anual (> 10 años)', target: 'Normal' },
  { key: 'vitamin_levels', label: 'Vitaminas A, D, E, K', frequency: 'Anual', target: 'Normales' },
] as const;

/**
 * Signos de alarma respiratorios en pediatría.
 */
export const PEDIATRIC_RESPIRATORY_RED_FLAGS = [
  { key: 'stridor', label: 'Estridor', urgency: 'alta', action: 'Evaluación inmediata de vía aérea' },
  { key: 'cyanosis', label: 'Cianosis', urgency: 'alta', action: 'O2 suplementario, evaluación de emergencia' },
  { key: 'severe_retractions', label: 'Tiraje Severo', urgency: 'alta', action: 'Evaluar fatiga respiratoria' },
  { key: 'apnea', label: 'Apnea', urgency: 'alta', action: 'Monitoreo continuo, evaluación de causa' },
  { key: 'persistent_wheeze', label: 'Sibilancias Persistentes', urgency: 'moderada', action: 'Evaluar respuesta a broncodilatadores' },
  { key: 'hemoptysis', label: 'Hemoptisis', urgency: 'alta', action: 'Evaluación urgente, descartar infección/malformación' },
  { key: 'digital_clubbing', label: 'Acropaquia', urgency: 'moderada', action: 'Evaluar enfermedad pulmonar crónica' },
] as const;
