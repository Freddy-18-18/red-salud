/**
 * @file overrides/reumatologia.ts
 * @description Override de configuración para Reumatología.
 *
 * Módulos especializados: scoring DAS28, índice de discapacidad HAQ,
 * documentación de recuento articular, seguimiento de terapia biológica,
 * paneles de autoanticuerpos, densitometría ósea, tendencias de actividad.
 *
 * También exporta constantes de dominio: articulaciones DAS28,
 * autoanticuerpos reumatológicos, terapias biológicas.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Reumatología.
 * Especialidad con módulos para enfermedades autoinmunes y musculoesqueléticas.
 */
export const reumatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'reumatologia',
  dashboardPath: '/dashboard/medico/reumatologia',

  modules: {
    clinical: [
      {
        key: 'reuma-consulta',
        label: 'Consulta Reumatológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/reumatologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'reuma-das28',
        label: 'DAS28 Score',
        icon: 'Calculator',
        route: '/dashboard/medico/reumatologia/das28',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Disease Activity Score 28 articulaciones, PCR/VSG, EVA del paciente',
        kpiKeys: ['das28_remission_rate'],
      },
      {
        key: 'reuma-haq',
        label: 'HAQ (Índice de Discapacidad)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/reumatologia/haq',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Health Assessment Questionnaire, capacidad funcional, tendencia temporal',
        kpiKeys: ['functional_improvement'],
      },
      {
        key: 'reuma-recuento-articular',
        label: 'Recuento Articular',
        icon: 'Bone',
        route: '/dashboard/medico/reumatologia/recuento-articular',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Articulaciones tumefactas y dolorosas (28/44/66/68), homúnculo articular',
      },
      {
        key: 'reuma-biologicos',
        label: 'Terapia Biológica',
        icon: 'Syringe',
        route: '/dashboard/medico/reumatologia/biologicos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Seguimiento de biológicos/biosimilares, dosis, respuesta, efectos adversos',
        kpiKeys: ['biologic_response_rate'],
      },
      {
        key: 'reuma-autoanticuerpos',
        label: 'Paneles de Autoanticuerpos',
        icon: 'Shield',
        route: '/dashboard/medico/reumatologia/autoanticuerpos',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'FR, anti-CCP, ANA, anti-dsDNA, ENA, ANCA, complemento',
      },
      {
        key: 'reuma-densitometria',
        label: 'Densitometría Ósea',
        icon: 'Bone',
        route: '/dashboard/medico/reumatologia/densitometria',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'DEXA, T-score, Z-score, FRAX, seguimiento de osteoporosis',
      },
    ],

    lab: [
      {
        key: 'reuma-laboratorio',
        label: 'Laboratorio Reumatológico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/reumatologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'PCR, VSG, hemograma, función renal/hepática, perfil metabólico',
      },
      {
        key: 'reuma-imagenologia',
        label: 'Imagenología Reumatológica',
        icon: 'Image',
        route: '/dashboard/medico/reumatologia/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Rx articulares, ecografía musculoesquelética, resonancia',
      },
      {
        key: 'reuma-biopsia',
        label: 'Biopsia y Citología',
        icon: 'Microscope',
        route: '/dashboard/medico/reumatologia/biopsia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Artrocentesis, biopsia sinovial, análisis de líquido articular',
      },
    ],

    technology: [
      {
        key: 'reuma-calculadoras',
        label: 'Calculadoras Reumatológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/reumatologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'DAS28, HAQ, CDAI, SDAI, BASDAI, FRAX, SLEDAI',
      },
      {
        key: 'reuma-tendencias',
        label: 'Tendencias de Actividad',
        icon: 'LineChart',
        route: '/dashboard/medico/reumatologia/tendencias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Gráficos temporales de DAS28, HAQ, PCR, brotes, remisiones',
      },
    ],

    communication: [
      {
        key: 'reuma-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/reumatologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'reuma-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/reumatologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'reuma-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/reumatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'das28-trend',
      component: '@/components/dashboard/medico/reumatologia/widgets/das28-trend-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'joint-count-homunculus',
      component: '@/components/dashboard/medico/reumatologia/widgets/joint-count-homunculus-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'biologic-therapy-tracker',
      component: '@/components/dashboard/medico/reumatologia/widgets/biologic-therapy-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'autoantibody-panel',
      component: '@/components/dashboard/medico/reumatologia/widgets/autoantibody-panel-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'das28_remission_rate',
    'biologic_response_rate',
    'functional_improvement',
    'steroid_reduction_rate',
    'flare_rate',
    'bone_density_maintenance',
  ],

  kpiDefinitions: {
    das28_remission_rate: {
      label: 'Tasa de Remisión DAS28',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    biologic_response_rate: {
      label: 'Tasa de Respuesta a Biológicos',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    functional_improvement: {
      label: 'Mejora Funcional (HAQ)',
      format: 'percentage',
      goal: 0.4,
      direction: 'higher_is_better',
    },
    steroid_reduction_rate: {
      label: 'Tasa de Reducción de Esteroides',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    flare_rate: {
      label: 'Tasa de Brotes',
      format: 'percentage',
      goal: 0.2,
      direction: 'lower_is_better',
    },
    bone_density_maintenance: {
      label: 'Mantenimiento de Densidad Ósea',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_biologico',
      'evaluacion_das28',
      'densitometria',
      'artrocentesis',
      'evaluacion_funcional',
      'infusion_biologico',
      'control_laboratorio',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_reumatologica',
      'examen_reumatologico',
      'recuento_articular',
      'evaluacion_das28',
      'evaluacion_haq',
      'seguimiento_biologico',
      'informe_densitometria',
      'plan_tratamiento_reumatologico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresDAS28Tracking: true,
      supportsHAQAssessment: true,
      requiresJointCountDocumentation: true,
      supportsBiologicTherapy: true,
      tracksAutoantibodies: true,
      supportsDensitometry: true,
    },
  },

  theme: {
    primaryColor: '#7C3AED',
    accentColor: '#5B21B6',
    icon: 'Bone',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO REUMATOLÓGICO
// ============================================================================

/**
 * Articulaciones evaluadas en DAS28
 */
export const DAS28_JOINTS = [
  // Hombros (2)
  { key: 'shoulder_r', label: 'Hombro Derecho', side: 'right' },
  { key: 'shoulder_l', label: 'Hombro Izquierdo', side: 'left' },
  // Codos (2)
  { key: 'elbow_r', label: 'Codo Derecho', side: 'right' },
  { key: 'elbow_l', label: 'Codo Izquierdo', side: 'left' },
  // Muñecas (2)
  { key: 'wrist_r', label: 'Muñeca Derecha', side: 'right' },
  { key: 'wrist_l', label: 'Muñeca Izquierda', side: 'left' },
  // MCF (10)
  { key: 'mcp1_r', label: 'MCF 1 Derecha', side: 'right' },
  { key: 'mcp2_r', label: 'MCF 2 Derecha', side: 'right' },
  { key: 'mcp3_r', label: 'MCF 3 Derecha', side: 'right' },
  { key: 'mcp4_r', label: 'MCF 4 Derecha', side: 'right' },
  { key: 'mcp5_r', label: 'MCF 5 Derecha', side: 'right' },
  { key: 'mcp1_l', label: 'MCF 1 Izquierda', side: 'left' },
  { key: 'mcp2_l', label: 'MCF 2 Izquierda', side: 'left' },
  { key: 'mcp3_l', label: 'MCF 3 Izquierda', side: 'left' },
  { key: 'mcp4_l', label: 'MCF 4 Izquierda', side: 'left' },
  { key: 'mcp5_l', label: 'MCF 5 Izquierda', side: 'left' },
  // IFP (10)
  { key: 'pip1_r', label: 'IFP 1 Derecha', side: 'right' },
  { key: 'pip2_r', label: 'IFP 2 Derecha', side: 'right' },
  { key: 'pip3_r', label: 'IFP 3 Derecha', side: 'right' },
  { key: 'pip4_r', label: 'IFP 4 Derecha', side: 'right' },
  { key: 'pip5_r', label: 'IFP 5 Derecha', side: 'right' },
  { key: 'pip1_l', label: 'IFP 1 Izquierda', side: 'left' },
  { key: 'pip2_l', label: 'IFP 2 Izquierda', side: 'left' },
  { key: 'pip3_l', label: 'IFP 3 Izquierda', side: 'left' },
  { key: 'pip4_l', label: 'IFP 4 Izquierda', side: 'left' },
  { key: 'pip5_l', label: 'IFP 5 Izquierda', side: 'left' },
  // Rodillas (2)
  { key: 'knee_r', label: 'Rodilla Derecha', side: 'right' },
  { key: 'knee_l', label: 'Rodilla Izquierda', side: 'left' },
] as const;

/**
 * Rangos de actividad DAS28
 */
export const DAS28_ACTIVITY_RANGES = [
  { range: '<2.6', label: 'Remisión', color: '#22C55E' },
  { range: '2.6-3.2', label: 'Baja Actividad', color: '#84CC16' },
  { range: '3.2-5.1', label: 'Actividad Moderada', color: '#F59E0B' },
  { range: '>5.1', label: 'Alta Actividad', color: '#EF4444' },
] as const;

/**
 * Autoanticuerpos reumatológicos principales
 */
export const RHEUMATOLOGIC_AUTOANTIBODIES = [
  { key: 'rf', label: 'Factor Reumatoide (FR)', diseases: ['AR'], significance: 'Sensible pero no específico para AR' },
  { key: 'anti_ccp', label: 'Anti-CCP (Anti-Péptido Citrulinado)', diseases: ['AR'], significance: 'Altamente específico para AR (>95%)' },
  { key: 'ana', label: 'ANA (Anticuerpos Antinucleares)', diseases: ['LES', 'Sjögren', 'Esclerodermia'], significance: 'Screening de enfermedades autoinmunes sistémicas' },
  { key: 'anti_dsdna', label: 'Anti-dsDNA', diseases: ['LES'], significance: 'Específico para LES, correlaciona con actividad renal' },
  { key: 'anti_sm', label: 'Anti-Sm', diseases: ['LES'], significance: 'Muy específico para LES' },
  { key: 'anti_ssa', label: 'Anti-SSA (Ro)', diseases: ['Sjögren', 'LES'], significance: 'Sjögren, LES neonatal' },
  { key: 'anti_ssb', label: 'Anti-SSB (La)', diseases: ['Sjögren'], significance: 'Específico para Sjögren' },
  { key: 'anca', label: 'ANCA (c-ANCA / p-ANCA)', diseases: ['Vasculitis'], significance: 'Vasculitis: Wegener (c-ANCA), poliangeítis microscópica (p-ANCA)' },
  { key: 'anti_scl70', label: 'Anti-Scl-70 (Anti-Topoisomerasa I)', diseases: ['Esclerodermia'], significance: 'Esclerosis sistémica difusa' },
  { key: 'anti_centromere', label: 'Anti-Centrómero', diseases: ['Esclerodermia'], significance: 'Esclerosis sistémica limitada (CREST)' },
] as const;

/**
 * Terapias biológicas comunes en reumatología
 */
export const BIOLOGIC_THERAPIES = [
  { key: 'adalimumab', label: 'Adalimumab', target: 'Anti-TNF-α', route: 'SC', frequency: 'Cada 2 semanas' },
  { key: 'etanercept', label: 'Etanercept', target: 'Anti-TNF-α', route: 'SC', frequency: 'Semanal' },
  { key: 'infliximab', label: 'Infliximab', target: 'Anti-TNF-α', route: 'IV', frequency: 'Cada 6-8 semanas' },
  { key: 'rituximab', label: 'Rituximab', target: 'Anti-CD20', route: 'IV', frequency: 'Cada 6 meses' },
  { key: 'tocilizumab', label: 'Tocilizumab', target: 'Anti-IL-6R', route: 'IV/SC', frequency: 'Cada 4 semanas / semanal SC' },
  { key: 'abatacept', label: 'Abatacept', target: 'CTLA-4 Ig', route: 'IV/SC', frequency: 'Mensual IV / semanal SC' },
  { key: 'secukinumab', label: 'Secukinumab', target: 'Anti-IL-17A', route: 'SC', frequency: 'Mensual' },
  { key: 'tofacitinib', label: 'Tofacitinib', target: 'JAK inhibitor', route: 'Oral', frequency: 'Diario' },
  { key: 'baricitinib', label: 'Baricitinib', target: 'JAK inhibitor', route: 'Oral', frequency: 'Diario' },
  { key: 'upadacitinib', label: 'Upadacitinib', target: 'JAK inhibitor', route: 'Oral', frequency: 'Diario' },
] as const;
