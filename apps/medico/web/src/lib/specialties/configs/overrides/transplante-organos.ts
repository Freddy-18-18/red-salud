/**
 * @file overrides/transplante-organos.ts
 * @description Override de configuración para Trasplante de Órganos.
 *
 * Módulos especializados: gestión de lista de espera, monitoreo
 * de inmunosupresión (niveles valle), clasificación de rechazo
 * (Banff), seguimiento de función del órgano (creatinina/LFTs/eco),
 * profilaxis infecciosa, compatibilidad donante-receptor,
 * supervivencia a largo plazo.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const transplanteOrganosOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'transplante-organos',
  dashboardPath: '/dashboard/medico/transplante-organos',

  modules: {
    clinical: [
      {
        key: 'transplante-consulta',
        label: 'Consulta de Trasplante',
        icon: 'Stethoscope',
        route: '/dashboard/medico/transplante-organos/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'transplante-lista-espera',
        label: 'Gestión de Lista de Espera',
        icon: 'ListTodo',
        route: '/dashboard/medico/transplante-organos/lista-espera',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'transplante-inmunosupresion',
        label: 'Monitoreo de Inmunosupresión',
        icon: 'Activity',
        route: '/dashboard/medico/transplante-organos/inmunosupresion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['medication_adherence_rate'],
      },
      {
        key: 'transplante-rechazo',
        label: 'Clasificación de Rechazo (Banff)',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/transplante-organos/rechazo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['rejection_rate'],
      },
      {
        key: 'transplante-funcion',
        label: 'Seguimiento de Función del Órgano',
        icon: 'HeartPulse',
        route: '/dashboard/medico/transplante-organos/funcion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['graft_survival_rate'],
      },
      {
        key: 'transplante-profilaxis',
        label: 'Profilaxis Infecciosa',
        icon: 'Shield',
        route: '/dashboard/medico/transplante-organos/profilaxis',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['infection_rate'],
      },
      {
        key: 'transplante-compatibilidad',
        label: 'Compatibilidad Donante-Receptor',
        icon: 'GitMerge',
        route: '/dashboard/medico/transplante-organos/compatibilidad',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'transplante-supervivencia',
        label: 'Supervivencia a Largo Plazo',
        icon: 'TrendingUp',
        route: '/dashboard/medico/transplante-organos/supervivencia',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'transplante-niveles',
        label: 'Niveles de Inmunosupresores',
        icon: 'FlaskConical',
        route: '/dashboard/medico/transplante-organos/niveles',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'transplante-laboratorios',
        label: 'Laboratorios de Función Orgánica',
        icon: 'BarChart3',
        route: '/dashboard/medico/transplante-organos/laboratorios',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'transplante-hla',
        label: 'Tipificación HLA / Crossmatch',
        icon: 'Dna',
        route: '/dashboard/medico/transplante-organos/hla',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'transplante-biopsia',
        label: 'Biopsia del Injerto',
        icon: 'Microscope',
        route: '/dashboard/medico/transplante-organos/biopsia',
        group: 'lab',
        order: 4,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'transplante-calculadoras',
        label: 'Calculadoras de Trasplante',
        icon: 'Calculator',
        route: '/dashboard/medico/transplante-organos/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'transplante-equipo',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/transplante-organos/equipo',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'transplante-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/transplante-organos/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
      {
        key: 'transplante-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/transplante-organos/remisiones',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'transplante-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/transplante-organos/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'graft-function-tracker',
      component: '@/components/dashboard/medico/transplante-organos/widgets/graft-function-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'immunosuppression-levels',
      component: '@/components/dashboard/medico/transplante-organos/widgets/immunosuppression-levels-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'waitlist-status',
      component: '@/components/dashboard/medico/transplante-organos/widgets/waitlist-status-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'rejection-alert',
      component: '@/components/dashboard/medico/transplante-organos/widgets/rejection-alert-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'graft_survival_rate',
    'rejection_rate',
    'infection_rate',
    'medication_adherence_rate',
    'waitlist_mortality_rate',
    'one_year_patient_survival',
  ],

  kpiDefinitions: {
    graft_survival_rate: {
      label: 'Supervivencia del Injerto',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    rejection_rate: {
      label: 'Tasa de Rechazo',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    infection_rate: {
      label: 'Tasa de Infecciones',
      format: 'percentage',
      goal: 0.2,
      direction: 'lower_is_better',
    },
    medication_adherence_rate: {
      label: 'Adherencia a la Medicación',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    waitlist_mortality_rate: {
      label: 'Mortalidad en Lista de Espera',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    one_year_patient_survival: {
      label: 'Supervivencia del Paciente a 1 Año',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_pre_transplante',
      'seguimiento_post_transplante',
      'control_inmunosupresion',
      'evaluacion_rechazo',
      'control_funcion_organo',
      'biopsia_injerto',
      'evaluacion_donante_vivo',
      'seguimiento_largo_plazo',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_pre_transplante',
      'protocolo_inmunosupresion',
      'clasificacion_banff',
      'seguimiento_funcion_organo',
      'profilaxis_infecciosa',
      'compatibilidad_donante_receptor',
      'nota_equipo_multidisciplinario',
      'consentimiento_transplante',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresWaitlistManagement: true,
      tracksImmunosuppression: true,
      supportsBanffClassification: true,
      tracksOrganFunction: true,
      requiresInfectionProphylaxis: true,
      supportsDonorRecipientMatching: true,
      tracksLongTermSurvivorship: true,
    },
  },

  theme: {
    primaryColor: '#10B981',
    accentColor: '#047857',
    icon: 'Heart',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE TRASPLANTE DE ÓRGANOS
// ============================================================================

/**
 * Tipos de trasplante de órganos sólidos
 */
export const ORGAN_TRANSPLANT_TYPES = [
  { key: 'kidney', label: 'Renal', marker: 'Creatinina sérica', rejection_biopsy: 'Banff renal' },
  { key: 'liver', label: 'Hepático', marker: 'AST/ALT/Bilirrubina', rejection_biopsy: 'Banff hepático' },
  { key: 'heart', label: 'Cardíaco', marker: 'Fracción de eyección', rejection_biopsy: 'ISHLT grading' },
  { key: 'lung', label: 'Pulmonar', marker: 'FEV1 / Espirometría', rejection_biopsy: 'ISHLT A/B grading' },
  { key: 'pancreas', label: 'Pancreático', marker: 'HbA1c / C-péptido', rejection_biopsy: 'Banff pancreático' },
  { key: 'intestine', label: 'Intestinal', marker: 'Citrulina / Absorción', rejection_biopsy: 'Histología intestinal' },
] as const;

/**
 * Inmunosupresores comunes y niveles terapéuticos
 */
export const IMMUNOSUPPRESSANT_LEVELS = [
  { drug: 'Tacrolimus', target_trough: '5-15 ng/mL', monitoring: 'Nivel valle (C0)', frequency: 'Semanal → Mensual', toxicity: 'Nefrotoxicidad, neurotoxicidad, diabetes' },
  { drug: 'Ciclosporina', target_trough: '100-300 ng/mL', monitoring: 'C0 o C2', frequency: 'Semanal → Mensual', toxicity: 'Nefrotoxicidad, hipertensión, hirsutismo' },
  { drug: 'Sirolimus', target_trough: '4-12 ng/mL', monitoring: 'Nivel valle (C0)', frequency: 'Semanal → Mensual', toxicity: 'Dislipidemia, trombocitopenia, neumonitis' },
  { drug: 'Everolimus', target_trough: '3-8 ng/mL', monitoring: 'Nivel valle (C0)', frequency: 'Semanal → Mensual', toxicity: 'Estomatitis, dislipidemia' },
  { drug: 'Micofenolato', target_trough: '1-3.5 μg/mL (AUC)', monitoring: 'AUC o nivel valle', frequency: 'Variable', toxicity: 'GI, leucopenia' },
] as const;

/**
 * Clasificación de rechazo de Banff (simplificada — renal)
 */
export const BANFF_REJECTION_CLASSIFICATION = [
  { category: 1, label: 'Borderline', description: 'Cambios borderline sospechosos de rechazo agudo mediado por células T', treatment: 'Observación o pulso de esteroides' },
  { category: 2, label: 'Rechazo Agudo Mediado por Anticuerpos (ABMR)', description: 'C4d+, anticuerpos donante-específicos, daño microvascular', treatment: 'Plasmaféresis, IVIG, rituximab' },
  { category: 3, label: 'Rechazo Agudo Mediado por Células T (TCMR)', description: 'Infiltrado tubulointersticial ± arteritis', treatment: 'Pulso de esteroides, ATG si severo' },
  { category: 4, label: 'Rechazo Crónico Activo (ABMR)', description: 'Glomerulopatía del trasplante, fibrosis intimal', treatment: 'Difícil tratamiento, optimizar IS' },
  { category: 5, label: 'Fibrosis Intersticial / Atrofia Tubular (IFTA)', description: 'Cambios crónicos sin rechazo activo específico', treatment: 'Ajuste de inmunosupresión' },
] as const;
