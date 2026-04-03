/**
 * @file overrides/inmunologia.ts
 * @description Override de configuración para Inmunología Clínica.
 *
 * Evaluación y manejo de trastornos inmunológicos — niveles de
 * inmunoglobulinas, complemento, paneles de autoanticuerpos,
 * clasificación de inmunodeficiencias, evaluación de respuesta
 * vacunal, monitoreo de terapias biológicas.
 *
 * También exporta constantes de dominio: clasificación de
 * inmunodeficiencias, paneles de autoanticuerpos, terapias biológicas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Inmunología Clínica.
 * Especialidad médica con módulos clínicos, de laboratorio y seguimiento.
 */
export const inmunologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'inmunologia',
  dashboardPath: '/dashboard/medico/inmunologia',

  modules: {
    clinical: [
      {
        key: 'inmuno-consulta',
        label: 'Consulta de Inmunología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/inmunologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación inmunológica, historia de infecciones, autoinmunidad',
      },
      {
        key: 'inmuno-inmunoglobulinas',
        label: 'Niveles de Inmunoglobulinas',
        icon: 'BarChart3',
        route: '/dashboard/medico/inmunologia/inmunoglobulinas',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['immunoglobulin_adequacy'],
        description: 'IgG, IgA, IgM, IgE, subclases de IgG, tendencias',
      },
      {
        key: 'inmuno-complemento',
        label: 'Sistema del Complemento',
        icon: 'Layers',
        route: '/dashboard/medico/inmunologia/complemento',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'C3, C4, CH50, AP50, deficiencias de complemento',
      },
      {
        key: 'inmuno-autoanticuerpos',
        label: 'Paneles de Autoanticuerpos',
        icon: 'Search',
        route: '/dashboard/medico/inmunologia/autoanticuerpos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'ANA, anti-dsDNA, ENA, ANCA, antifosfolípidos',
      },
      {
        key: 'inmuno-inmunodeficiencia',
        label: 'Clasificación de Inmunodeficiencias',
        icon: 'ShieldOff',
        route: '/dashboard/medico/inmunologia/inmunodeficiencia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['infection_frequency'],
        description: 'IDP primarias/secundarias, IUIS, fenotipificación',
      },
      {
        key: 'inmuno-vacunal',
        label: 'Respuesta Vacunal',
        icon: 'Syringe',
        route: '/dashboard/medico/inmunologia/vacunal',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['vaccine_response_rate'],
        description: 'Títulos post-vacunales, evaluación de respuesta, esquemas especiales',
      },
      {
        key: 'inmuno-biologicos',
        label: 'Terapias Biológicas',
        icon: 'Pill',
        route: '/dashboard/medico/inmunologia/biologicos',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Monitoreo de biológicos, niveles, anticuerpos anti-droga, switch',
      },
    ],

    laboratory: [
      {
        key: 'inmuno-laboratorio',
        label: 'Panel Inmunológico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/inmunologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Inmunoglobulinas, complemento, citometría de flujo, subpoblaciones',
      },
      {
        key: 'inmuno-citometria',
        label: 'Citometría de Flujo',
        icon: 'Dna',
        route: '/dashboard/medico/inmunologia/citometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'CD3, CD4, CD8, CD19, CD56, NK, subpoblaciones linfocitarias',
      },
      {
        key: 'inmuno-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/inmunologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'TC de tórax, evaluación de bronquiectasias, linfadenopatía',
      },
    ],

    financial: [
      {
        key: 'inmuno-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/inmunologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'inmuno-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/inmunologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Pre-autorización de inmunoglobulina IV/SC, biológicos',
      },
    ],

    technology: [
      {
        key: 'inmuno-calculadoras',
        label: 'Calculadoras Inmunológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/inmunologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Dosis de IgIV, ajuste por peso, intervalos de infusión',
      },
      {
        key: 'inmuno-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/inmunologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'IUIS, ESID, AAAAI — clasificación y manejo de IDP',
      },
    ],

    communication: [
      {
        key: 'inmuno-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/inmunologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'inmuno-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/inmunologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'inmuno-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/inmunologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'immunoglobulin-tracking',
      component: '@/components/dashboard/medico/inmunologia/widgets/immunoglobulin-tracking-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'autoantibody-panel',
      component: '@/components/dashboard/medico/inmunologia/widgets/autoantibody-panel-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'biologic-monitoring',
      component: '@/components/dashboard/medico/inmunologia/widgets/biologic-monitoring-widget',
      size: 'medium',
    },
    {
      key: 'infection-frequency',
      component: '@/components/dashboard/medico/inmunologia/widgets/infection-frequency-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'infection_frequency',
    'immunoglobulin_adequacy',
    'vaccine_response_rate',
    'biologic_adherence',
    'igg_trough_target',
    'autoimmune_remission_rate',
  ],

  kpiDefinitions: {
    infection_frequency: {
      label: 'Frecuencia de Infecciones / Año',
      format: 'number',
      goal: 3,
      direction: 'lower_is_better',
    },
    immunoglobulin_adequacy: {
      label: 'IgG en Rango Adecuado',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    vaccine_response_rate: {
      label: 'Respuesta Vacunal Adecuada',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    biologic_adherence: {
      label: 'Adherencia a Biológicos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    igg_trough_target: {
      label: '% IgG Trough en Meta',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    autoimmune_remission_rate: {
      label: 'Tasa de Remisión Autoinmune',
      format: 'percentage',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_idp',
      'infusion_ivig',
      'infusion_scig',
      'control_biologico',
      'evaluacion_vacunal',
      'evaluacion_autoinmune',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_inmunologica',
      'protocolo_inmunodeficiencia',
      'seguimiento_infusion_ig',
      'evaluacion_respuesta_vacunal',
      'panel_autoanticuerpos',
      'monitoreo_biologicos',
      'plan_tratamiento_inmunologico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksImmunoglobulinLevels: true,
      tracksComplementSystem: true,
      requiresAutoantibodyPanels: true,
      classifiesImmunodeficiency: true,
      tracksVaccineResponse: true,
      monitorsBiologicTherapy: true,
    },
  },

  theme: {
    primaryColor: '#10B981',
    accentColor: '#047857',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — INMUNOLOGÍA
// ============================================================================

/**
 * Clasificación IUIS de Inmunodeficiencias Primarias (2022).
 */
export const IMMUNODEFICIENCY_CLASSIFICATION = [
  { category: 1, label: 'Deficiencias Combinadas de Células T y B', examples: ['SCID', 'Síndrome de Omenn', 'Deficiencia de ZAP-70'] },
  { category: 2, label: 'Síndromes de Inmunodeficiencia Bien Definidos', examples: ['DiGeorge', 'Wiskott-Aldrich', 'Ataxia-Telangiectasia'] },
  { category: 3, label: 'Deficiencias Predominantemente de Anticuerpos', examples: ['Agammaglobulinemia X', 'IDCV', 'Deficiencia de IgA'] },
  { category: 4, label: 'Enfermedades de Disregulación Inmune', examples: ['ALPS', 'IPEX', 'Hemofagocítico familiar'] },
  { category: 5, label: 'Defectos Congénitos de Fagocitos', examples: ['Enfermedad Granulomatosa Crónica', 'Deficiencia de LAD', 'Neutropenia cíclica'] },
  { category: 6, label: 'Defectos de Inmunidad Innata', examples: ['IRAK-4', 'MyD88', 'NEMO'] },
  { category: 7, label: 'Trastornos Autoinflamatorios', examples: ['FMF', 'TRAPS', 'CAPS', 'PFAPA'] },
  { category: 8, label: 'Deficiencias del Complemento', examples: ['C1q', 'C2', 'C3', 'C4', 'Factor H', 'Factor I'] },
  { category: 9, label: 'Fenocopias de IDP', examples: ['Anti-IFNγ', 'Anti-IL-6', 'Autoanticuerpos contra citocinas'] },
] as const;

/**
 * Paneles de autoanticuerpos por sospecha diagnóstica.
 */
export const AUTOANTIBODY_PANELS = {
  lupus: {
    label: 'Panel de Lupus (LES)',
    antibodies: ['ANA', 'Anti-dsDNA', 'Anti-Sm', 'Anti-RNP', 'Antifosfolípidos', 'Anti-C1q', 'C3', 'C4'],
  },
  vasculitis: {
    label: 'Panel de Vasculitis',
    antibodies: ['c-ANCA (PR3)', 'p-ANCA (MPO)', 'Anti-GBM', 'Crioglobulinas'],
  },
  hepatitis_autoimmune: {
    label: 'Panel de Hepatitis Autoinmune',
    antibodies: ['ANA', 'Anti-músculo liso (ASMA)', 'Anti-LKM1', 'Anti-SLA', 'IgG total'],
  },
  miopatias: {
    label: 'Panel de Miopatías Inflamatorias',
    antibodies: ['ANA', 'Anti-Jo1', 'Anti-Mi2', 'Anti-SRP', 'Anti-MDA5', 'CK total'],
  },
  celiac: {
    label: 'Panel Celíaco',
    antibodies: ['Anti-tTG IgA', 'Anti-endomisio IgA', 'IgA total', 'Anti-DGP IgG'],
  },
} as const;

/**
 * Terapias biológicas comunes en inmunología.
 */
export const BIOLOGIC_THERAPIES = [
  { key: 'rituximab', label: 'Rituximab', target: 'CD20', indications: ['IDCV refractaria', 'LES', 'Vasculitis ANCA', 'PTI'] },
  { key: 'belimumab', label: 'Belimumab', target: 'BLyS/BAFF', indications: ['LES activo'] },
  { key: 'tocilizumab', label: 'Tocilizumab', target: 'IL-6R', indications: ['AR', 'AIJ sistémica', 'Arteritis de células gigantes'] },
  { key: 'dupilumab', label: 'Dupilumab', target: 'IL-4Rα', indications: ['Dermatitis atópica', 'Asma eosinofílico'] },
  { key: 'omalizumab', label: 'Omalizumab', target: 'IgE', indications: ['Asma alérgico severo', 'Urticaria crónica'] },
  { key: 'mepolizumab', label: 'Mepolizumab', target: 'IL-5', indications: ['Asma eosinofílico', 'GEPA'] },
] as const;
