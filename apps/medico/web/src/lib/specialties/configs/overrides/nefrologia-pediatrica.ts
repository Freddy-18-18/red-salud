/**
 * @file overrides/nefrologia-pediatrica.ts
 * @description Override de configuración para Nefrología Pediátrica.
 *
 * Combina Nefrología + Pediatría: seguimiento de síndrome nefrótico,
 * recurrencia de ITU, gradación de reflujo vesicoureteral,
 * crecimiento en ERC pediátrica e inmunosupresión.
 *
 * También exporta constantes de dominio: clasificación de RVU,
 * criterios de síndrome nefrótico pediátrico, ITU recurrente.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Nefrología Pediátrica.
 * Especialidad con módulos clínicos especializados para riñón en niños.
 */
export const nefrologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'nefrologia-pediatrica',
  dashboardPath: '/dashboard/medico/nefrologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'nefro-pedi-consulta',
        label: 'Consulta Nefrológica Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/nefrologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Anamnesis nefrológica pediátrica, historia prenatal',
      },
      {
        key: 'nefro-pedi-nefrotico',
        label: 'Síndrome Nefrótico',
        icon: 'Droplets',
        route: '/dashboard/medico/nefrologia-pediatrica/nefrotico',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['relapse_rate'],
        description: 'Proteinuria, albúmina, edema, recaídas, corticodependencia',
      },
      {
        key: 'nefro-pedi-itu',
        label: 'ITU Recurrente',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/nefrologia-pediatrica/itu',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Urocultivos, profilaxis, estudios de imagen, cicatrices renales',
      },
      {
        key: 'nefro-pedi-rvu',
        label: 'Reflujo Vesicoureteral',
        icon: 'ArrowUpDown',
        route: '/dashboard/medico/nefrologia-pediatrica/rvu',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Gradación I-V, CUMS, gammagrafía DMSA, resolución espontánea',
      },
      {
        key: 'nefro-pedi-crecimiento',
        label: 'Crecimiento en ERC',
        icon: 'TrendingUp',
        route: '/dashboard/medico/nefrologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['growth_velocity'],
        description: 'Talla, peso, velocidad de crecimiento, GH, nutrición renal',
      },
      {
        key: 'nefro-pedi-inmunosupresion',
        label: 'Monitoreo de Inmunosupresión',
        icon: 'Shield',
        route: '/dashboard/medico/nefrologia-pediatrica/inmunosupresion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Niveles de ciclosporina, tacrolimus, micofenolato, efectos adversos',
      },
      {
        key: 'nefro-pedi-egfr',
        label: 'Seguimiento de eGFR Pediátrico',
        icon: 'Activity',
        route: '/dashboard/medico/nefrologia-pediatrica/egfr',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['egfr_stability'],
        description: 'Schwartz revisada, cistatina C, tendencia temporal',
      },
    ],

    laboratory: [
      {
        key: 'nefro-pedi-laboratorio',
        label: 'Panel Renal Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/nefrologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Creatinina, cistatina C, electrolitos, proteinuria, complemento',
      },
      {
        key: 'nefro-pedi-imagenologia',
        label: 'Imagenología Renal Pediátrica',
        icon: 'Scan',
        route: '/dashboard/medico/nefrologia-pediatrica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Ecografía renal, CUMS, DMSA, uro-RM',
      },
    ],

    financial: [
      {
        key: 'nefro-pedi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/nefrologia-pediatrica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'nefro-pedi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/nefrologia-pediatrica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'nefro-pedi-calculadoras',
        label: 'Calculadoras Nefrológicas Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/nefrologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Schwartz, eGFR pediátrica, dosis por peso, z-scores',
      },
      {
        key: 'nefro-pedi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/nefrologia-pediatrica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'KDIGO pediátrico, IPNA, AAP — guías nefrológicas pediátricas',
      },
    ],

    communication: [
      {
        key: 'nefro-pedi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/nefrologia-pediatrica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'nefro-pedi-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/nefrologia-pediatrica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'nefro-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/nefrologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'nephrotic-tracking',
      component: '@/components/dashboard/medico/nefrologia-pediatrica/widgets/nephrotic-tracking-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'uti-recurrence',
      component: '@/components/dashboard/medico/nefrologia-pediatrica/widgets/uti-recurrence-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'vur-grading',
      component: '@/components/dashboard/medico/nefrologia-pediatrica/widgets/vur-grading-widget',
      size: 'medium',
    },
    {
      key: 'growth-in-ckd',
      component: '@/components/dashboard/medico/nefrologia-pediatrica/widgets/growth-in-ckd-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'relapse_rate',
    'egfr_stability',
    'growth_velocity',
    'uti_recurrence_rate',
    'vur_resolution_rate',
    'immunosuppression_compliance',
  ],

  kpiDefinitions: {
    relapse_rate: {
      label: 'Tasa de Recaída (Síndrome Nefrótico)',
      format: 'number',
      goal: 2,
      direction: 'lower_is_better',
    },
    egfr_stability: {
      label: 'Estabilidad eGFR',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    growth_velocity: {
      label: 'Velocidad de Crecimiento (cm/año)',
      format: 'number',
      direction: 'higher_is_better',
    },
    uti_recurrence_rate: {
      label: 'Tasa de Recurrencia ITU',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    vur_resolution_rate: {
      label: 'Tasa de Resolución de RVU',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    immunosuppression_compliance: {
      label: 'Adherencia a Inmunosupresión',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_nefrotico',
      'control_itu',
      'control_rvu',
      'control_crecimiento',
      'control_inmunosupresion',
      'resultado_estudios',
      'evaluacion_pre_dialisis',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_nefrologica_pediatrica',
      'examen_fisico_pediatrico',
      'seguimiento_nefrotico',
      'evaluacion_itu',
      'gradacion_rvu',
      'evaluacion_crecimiento',
      'monitoreo_inmunosupresion',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksNephroticSyndrome: true,
      requiresUTIRecurrenceTracking: true,
      tracksVURGrading: true,
      tracksGrowthInCKD: true,
      requiresImmunosuppressionMonitoring: true,
      usesGrowthCharts: true,
    },
  },

  theme: {
    primaryColor: '#0EA5E9',
    accentColor: '#38BDF8',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEFROLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Gradación del Reflujo Vesicoureteral (clasificación internacional).
 */
export const VUR_GRADING = [
  { grade: 'I', label: 'Grado I', description: 'Reflujo solo al uréter', prognosis: 'Resolución espontánea ~80%', management: 'Observación' },
  { grade: 'II', label: 'Grado II', description: 'Reflujo hasta pelvis sin dilatación', prognosis: 'Resolución espontánea ~60%', management: 'Observación, profilaxis' },
  { grade: 'III', label: 'Grado III', description: 'Dilatación leve-moderada del uréter y pelvis', prognosis: 'Resolución ~40%', management: 'Profilaxis, seguimiento con DMSA' },
  { grade: 'IV', label: 'Grado IV', description: 'Dilatación moderada con tortuosidad ureteral', prognosis: 'Resolución ~20%', management: 'Profilaxis o cirugía (reimplante/Deflux)' },
  { grade: 'V', label: 'Grado V', description: 'Dilatación severa, tortuosidad ureteral, pérdida de impresión papilar', prognosis: 'Resolución rara', management: 'Cirugía (reimplante)' },
] as const;

/**
 * Criterios de síndrome nefrótico pediátrico.
 */
export const PEDIATRIC_NEPHROTIC_SYNDROME = {
  diagnosticCriteria: [
    { key: 'proteinuria', label: 'Proteinuria Nefrótica', value: '≥ 40 mg/m²/h o RPC > 2.0 mg/mg' },
    { key: 'hypoalbuminemia', label: 'Hipoalbuminemia', value: '< 2.5 g/dL' },
    { key: 'edema', label: 'Edema', value: 'Generalizado (periorbital, scrotal, ascitis)' },
    { key: 'hyperlipidemia', label: 'Hiperlipidemia', value: 'Colesterol > 200 mg/dL (frecuente pero no requerido)' },
  ],
  responseCategories: [
    { key: 'ssns', label: 'Corticosensible (SSNS)', definition: 'Remisión con prednisona ≤ 4 semanas', frequency: '~80% en cambios mínimos' },
    { key: 'sdns', label: 'Corticodependiente (SDNS)', definition: '2 recaídas al disminuir o ≤ 14 días post-suspensión', frequency: '~30% de SSNS' },
    { key: 'frns', label: 'Recaedor Frecuente (FRNS)', definition: '≥ 2 recaídas en 6 meses o ≥ 4 en 12 meses', frequency: '~30% de SSNS' },
    { key: 'srns', label: 'Corticorresistente (SRNS)', definition: 'Sin remisión a las 4-6 semanas de prednisona', frequency: '~20% del total' },
  ],
  remissionDefinition: 'Proteinuria < 4 mg/m²/h o tira reactiva negativa × 3 días consecutivos',
  relapseDefinition: 'Proteinuria ≥ 40 mg/m²/h o tira ≥ 3+ × 3 días consecutivos',
} as const;

/**
 * ITU recurrente en pediatría.
 */
export const PEDIATRIC_UTI_RECURRENCE = {
  definition: '≥ 2 ITU febriles, ≥ 3 ITU bajas, o ≥ 1 ITU alta + 1 ITU baja en 12 meses',
  workup: [
    { key: 'renal_us', label: 'Ecografía Renal', timing: 'Tras primera ITU febril', purpose: 'Evaluar anatomía' },
    { key: 'vcug', label: 'CUMS (Cistouretrograma Miccional)', timing: 'Tras ITU recurrente o anormal US', purpose: 'Evaluar RVU' },
    { key: 'dmsa', label: 'Gammagrafía DMSA', timing: '4-6 meses post ITU', purpose: 'Evaluar cicatrices renales' },
  ],
  prophylaxis: [
    { key: 'nitrofurantoin', label: 'Nitrofurantoína', dose: '1-2 mg/kg/día', notes: 'No en < 1 mes ni insuficiencia renal' },
    { key: 'tmp_smx', label: 'TMP-SMX', dose: '2 mg TMP/kg/día', notes: 'No en < 2 meses' },
    { key: 'cephalexin', label: 'Cefalexina', dose: '10 mg/kg/día', notes: 'Alternativa en < 2 meses' },
  ],
} as const;
