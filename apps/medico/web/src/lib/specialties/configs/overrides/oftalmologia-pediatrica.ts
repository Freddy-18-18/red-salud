/**
 * @file overrides/oftalmologia-pediatrica.ts
 * @description Override de configuración para Oftalmología Pediátrica.
 *
 * Módulos especializados para el manejo oftalmológico infantil:
 * seguimiento de ambliopía, medición de estrabismo, tamizaje ROP,
 * agudeza visual por normas de edad, cumplimiento de oclusión.
 *
 * También exporta constantes de dominio: grados de estrabismo,
 * normas de agudeza visual por edad, estadios ROP, protocolos de oclusión.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Oftalmología Pediátrica.
 * Especialidad con módulos clínicos especializados para la visión infantil.
 */
export const oftalmologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'oftalmologia-pediatrica',
  dashboardPath: '/dashboard/medico/oftalmologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'oftalpedi-consulta',
        label: 'Consulta Oftalmológica Pediátrica',
        icon: 'Eye',
        route: '/dashboard/medico/oftalmologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['amblyopia_resolution', 'visual_acuity_improvement'],
      },
      {
        key: 'oftalpedi-ambliopia',
        label: 'Seguimiento de Ambliopía',
        icon: 'EyeOff',
        route: '/dashboard/medico/oftalmologia-pediatrica/ambliopia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['amblyopia_resolution', 'patching_compliance'],
      },
      {
        key: 'oftalpedi-estrabismo',
        label: 'Medición de Estrabismo',
        icon: 'Move',
        route: '/dashboard/medico/oftalmologia-pediatrica/estrabismo',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['visual_acuity_improvement'],
      },
      {
        key: 'oftalpedi-rop',
        label: 'Tamizaje ROP',
        icon: 'Search',
        route: '/dashboard/medico/oftalmologia-pediatrica/rop',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['rop_detection_rate'],
      },
      {
        key: 'oftalpedi-agudeza-visual',
        label: 'Agudeza Visual por Edad',
        icon: 'Target',
        route: '/dashboard/medico/oftalmologia-pediatrica/agudeza-visual',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['visual_acuity_improvement'],
      },
      {
        key: 'oftalpedi-oclusion',
        label: 'Cumplimiento de Oclusión',
        icon: 'Clock',
        route: '/dashboard/medico/oftalmologia-pediatrica/oclusion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['patching_compliance', 'amblyopia_resolution'],
      },
    ],

    technology: [
      {
        key: 'oftalpedi-imagenologia',
        label: 'Imagenología Ocular',
        icon: 'Scan',
        route: '/dashboard/medico/oftalmologia-pediatrica/imagenologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'oftalpedi-refraccion',
        label: 'Refracción Pediátrica',
        icon: 'Glasses',
        route: '/dashboard/medico/oftalmologia-pediatrica/refraccion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'oftalpedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/oftalmologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'amblyopia-tracker',
      component: '@/components/dashboard/medico/oftalmologia-pediatrica/widgets/amblyopia-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'rop-screening-queue',
      component: '@/components/dashboard/medico/oftalmologia-pediatrica/widgets/rop-screening-queue-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'patching-compliance',
      component: '@/components/dashboard/medico/oftalmologia-pediatrica/widgets/patching-compliance-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'amblyopia_resolution',
    'rop_detection_rate',
    'visual_acuity_improvement',
    'patching_compliance',
    'follow_up_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    amblyopia_resolution: {
      label: 'Resolución de Ambliopía',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    rop_detection_rate: {
      label: 'Tasa de Detección ROP',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    visual_acuity_improvement: {
      label: 'Mejoría de Agudeza Visual',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patching_compliance: {
      label: 'Cumplimiento de Oclusión',
      format: 'percentage',
      goal: 0.7,
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
      'consulta_oftalmologica_pediatrica',
      'seguimiento_ambliopia',
      'medicion_estrabismo',
      'tamizaje_rop',
      'control_agudeza_visual',
      'revision_oclusion',
      'refraccion_cicloplejica',
      'evaluacion_prequirurgica',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_oftalmologica_pediatrica',
      'examen_oftalmologico_pediatrico',
      'evaluacion_ambliopia',
      'medicion_estrabismo',
      'tamizaje_rop',
      'agudeza_visual_por_edad',
      'plan_oclusion',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksAmblyopiaTreatment: true,
      measuresStrabismus: true,
      tracksROPScreening: true,
      usesAgeNormsVisualAcuity: true,
      tracksPatchingCompliance: true,
      requiresParentalConsent: true,
    },
  },

  theme: {
    primaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    icon: 'Eye',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — OFTALMOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Normas de agudeza visual por edad
 */
export const VISUAL_ACUITY_AGE_NORMS = [
  { ageRange: '0-3 meses', expectedVA: 'Fija y sigue', method: 'Fijación/Seguimiento' },
  { ageRange: '3-6 meses', expectedVA: '20/400 - 20/200', method: 'Fijación preferencial (Teller)' },
  { ageRange: '6-12 meses', expectedVA: '20/200 - 20/100', method: 'Fijación preferencial (Teller)' },
  { ageRange: '1-2 años', expectedVA: '20/100 - 20/60', method: 'Lea Symbols / Kay Pictures' },
  { ageRange: '2-3 años', expectedVA: '20/60 - 20/40', method: 'Lea Symbols / HOTV' },
  { ageRange: '3-5 años', expectedVA: '20/40 - 20/30', method: 'Lea Symbols / HOTV / Snellen' },
  { ageRange: '5+ años', expectedVA: '20/25 - 20/20', method: 'Snellen' },
];

/**
 * Clasificación de estrabismo
 */
export const STRABISMUS_CLASSIFICATION = {
  horizontal: [
    { key: 'esotropia', label: 'Esotropía', description: 'Desviación hacia adentro (convergente)' },
    { key: 'exotropia', label: 'Exotropía', description: 'Desviación hacia afuera (divergente)' },
  ],
  vertical: [
    { key: 'hipertropia', label: 'Hipertropía', description: 'Desviación hacia arriba' },
    { key: 'hipotropia', label: 'Hipotropía', description: 'Desviación hacia abajo' },
  ],
  frequency: [
    { key: 'constant', label: 'Constante' },
    { key: 'intermittent', label: 'Intermitente' },
    { key: 'alternating', label: 'Alternante' },
  ],
};

/**
 * Estadios de Retinopatía del Prematuro (ROP)
 */
export const ROP_STAGES = [
  { stage: 1, label: 'Estadio 1', description: 'Línea de demarcación fina entre retina vascular y avascular' },
  { stage: 2, label: 'Estadio 2', description: 'Cresta elevada (ridge) en la unión vascular/avascular' },
  { stage: 3, label: 'Estadio 3', description: 'Proliferación fibrovascular extraretinal (neovascularización)' },
  { stage: 4, label: 'Estadio 4', description: 'Desprendimiento parcial de retina (4A: sin fóvea, 4B: con fóvea)' },
  { stage: 5, label: 'Estadio 5', description: 'Desprendimiento total de retina' },
];

/**
 * Protocolos de oclusión para ambliopía
 */
export const PATCHING_PROTOCOLS = {
  mild: { severity: 'Leve (20/30 - 20/40)', hoursPerDay: 2, durationWeeks: 12 },
  moderate: { severity: 'Moderada (20/40 - 20/80)', hoursPerDay: 4, durationWeeks: 16 },
  severe: { severity: 'Severa (20/100 o peor)', hoursPerDay: 6, durationWeeks: 24 },
};
