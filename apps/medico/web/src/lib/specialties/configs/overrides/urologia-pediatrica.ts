/**
 * @file overrides/urologia-pediatrica.ts
 * @description Override de configuración para Urología Pediátrica.
 *
 * Módulos especializados para el manejo urológico infantil:
 * clasificación de reflujo vesicoureteral (VUR), clasificación de hipospadia,
 * seguimiento de enuresis, seguimiento de hidronefrosis, registro de circuncisiones.
 *
 * También exporta constantes de dominio: grados de VUR, clasificación de hipospadia,
 * grados de hidronefrosis, criterios de enuresis.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Urología Pediátrica.
 * Especialidad con módulos clínicos especializados para el tracto urinario infantil.
 */
export const urologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'urologia-pediatrica',
  dashboardPath: '/dashboard/medico/urologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'uropedi-consulta',
        label: 'Consulta Urológica Pediátrica',
        icon: 'Droplets',
        route: '/dashboard/medico/urologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['vur_resolution_rate', 'surgical_outcomes'],
      },
      {
        key: 'uropedi-vur',
        label: 'Reflujo Vesicoureteral (VUR)',
        icon: 'ArrowUpDown',
        route: '/dashboard/medico/urologia-pediatrica/vur',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['vur_resolution_rate'],
      },
      {
        key: 'uropedi-hipospadia',
        label: 'Clasificación de Hipospadia',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/urologia-pediatrica/hipospadia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes'],
      },
      {
        key: 'uropedi-enuresis',
        label: 'Seguimiento de Enuresis',
        icon: 'Moon',
        route: '/dashboard/medico/urologia-pediatrica/enuresis',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['continence_achievement'],
      },
      {
        key: 'uropedi-hidronefrosis',
        label: 'Seguimiento de Hidronefrosis',
        icon: 'Scan',
        route: '/dashboard/medico/urologia-pediatrica/hidronefrosis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['vur_resolution_rate'],
      },
      {
        key: 'uropedi-circuncision',
        label: 'Registro de Circuncisiones',
        icon: 'FileText',
        route: '/dashboard/medico/urologia-pediatrica/circuncision',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['surgical_outcomes'],
      },
    ],

    technology: [
      {
        key: 'uropedi-imagenologia',
        label: 'Imagenología Urológica',
        icon: 'Scan',
        route: '/dashboard/medico/urologia-pediatrica/imagenologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'uropedi-uroflujometria',
        label: 'Uroflujometría Pediátrica',
        icon: 'Activity',
        route: '/dashboard/medico/urologia-pediatrica/uroflujometria',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'uropedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/urologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'vur-follow-up',
      component: '@/components/dashboard/medico/urologia-pediatrica/widgets/vur-follow-up-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hydronephrosis-tracker',
      component: '@/components/dashboard/medico/urologia-pediatrica/widgets/hydronephrosis-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'enuresis-diary',
      component: '@/components/dashboard/medico/urologia-pediatrica/widgets/enuresis-diary-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'vur_resolution_rate',
    'surgical_outcomes',
    'continence_achievement',
    'follow_up_rate',
    'complication_rate',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    vur_resolution_rate: {
      label: 'Tasa de Resolución de VUR',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    surgical_outcomes: {
      label: 'Resultados Quirúrgicos Favorables',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    continence_achievement: {
      label: 'Logro de Continencia',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    follow_up_rate: {
      label: 'Tasa de Seguimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
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
      'consulta_urologica_pediatrica',
      'seguimiento_vur',
      'evaluacion_hipospadia',
      'seguimiento_enuresis',
      'control_hidronefrosis',
      'control_circuncision',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_urologica_pediatrica',
      'examen_urologico_pediatrico',
      'clasificacion_vur',
      'clasificacion_hipospadia',
      'evaluacion_enuresis',
      'seguimiento_hidronefrosis',
      'registro_circuncision',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksVURGrading: true,
      classifiesHypospadias: true,
      tracksEnuresis: true,
      tracksHydronephrosis: true,
      logsCircumcisions: true,
      requiresParentalConsent: true,
      usesPediatricDosage: true,
    },
  },

  theme: {
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    icon: 'Droplets',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — UROLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Grados de Reflujo Vesicoureteral (VUR) — clasificación internacional
 */
export const VUR_GRADES = [
  { grade: 'I', label: 'Grado I', description: 'Reflujo al uréter solamente, sin dilatación.' },
  { grade: 'II', label: 'Grado II', description: 'Reflujo hasta pelvis renal, sin dilatación.' },
  { grade: 'III', label: 'Grado III', description: 'Dilatación leve a moderada de uréter y pelvis. Cálices normales o levemente romos.' },
  { grade: 'IV', label: 'Grado IV', description: 'Dilatación moderada de uréter y pelvis. Cálices moderadamente romos.' },
  { grade: 'V', label: 'Grado V', description: 'Dilatación severa y tortuosidad de uréter. Dilatación severa de pelvis y cálices.' },
];

/**
 * Clasificación de hipospadia
 */
export const HYPOSPADIAS_CLASSIFICATION = [
  { type: 'glanular', label: 'Glanular', description: 'Meato en la cara ventral del glande.', frequency: '50%' },
  { type: 'coronal', label: 'Coronal', description: 'Meato en el surco coronal.', frequency: '20%' },
  { type: 'penile_distal', label: 'Peniano Distal', description: 'Meato en el tercio distal del cuerpo del pene.', frequency: '10%' },
  { type: 'penile_mid', label: 'Peniano Medio', description: 'Meato en el tercio medio del cuerpo del pene.', frequency: '10%' },
  { type: 'penile_proximal', label: 'Peniano Proximal', description: 'Meato en el tercio proximal del cuerpo del pene.', frequency: '5%' },
  { type: 'penoscrotal', label: 'Penoescrotal', description: 'Meato en la unión penoescrotal.', frequency: '3%' },
  { type: 'scrotal', label: 'Escrotal', description: 'Meato en el escroto.', frequency: '1%' },
  { type: 'perineal', label: 'Perineal', description: 'Meato en el periné.', frequency: '1%' },
];

/**
 * Grados de hidronefrosis (SFU — Society for Fetal Urology)
 */
export const HYDRONEPHROSIS_GRADES = [
  { grade: 0, label: 'Grado 0', description: 'Sin hidronefrosis. Pelvis renal normal.' },
  { grade: 1, label: 'Grado 1', description: 'Dilatación leve de pelvis renal solamente.' },
  { grade: 2, label: 'Grado 2', description: 'Dilatación de pelvis con visualización de algunos cálices.' },
  { grade: 3, label: 'Grado 3', description: 'Dilatación de pelvis y todos los cálices. Parénquima preservado.' },
  { grade: 4, label: 'Grado 4', description: 'Dilatación severa con adelgazamiento del parénquima renal.' },
];

/**
 * Criterios diagnósticos de enuresis
 */
export const ENURESIS_CRITERIA = {
  monosymptomatic: {
    label: 'Enuresis Monosintomática',
    description: 'Enuresis nocturna SIN síntomas diurnos de tracto urinario bajo.',
    criteria: ['Edad ≥ 5 años', 'Episodios nocturnos ≥ 2/semana por ≥ 3 meses', 'Sin síntomas diurnos'],
  },
  nonMonosymptomatic: {
    label: 'Enuresis No Monosintomática',
    description: 'Enuresis nocturna CON síntomas diurnos (urgencia, frecuencia, incontinencia diurna).',
    criteria: ['Edad ≥ 5 años', 'Episodios nocturnos + síntomas diurnos', 'Requiere evaluación urológica completa'],
  },
  primary: {
    label: 'Enuresis Primaria',
    description: 'El niño NUNCA ha logrado ≥ 6 meses de noches secas consecutivas.',
  },
  secondary: {
    label: 'Enuresis Secundaria',
    description: 'Reaparición después de ≥ 6 meses de noches secas. Buscar causas orgánicas/psicológicas.',
  },
};
