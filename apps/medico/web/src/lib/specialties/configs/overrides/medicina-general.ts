/**
 * @file overrides/medicina-general.ts
 * @description Override de configuración para Medicina General.
 *
 * Atención primaria — tamizaje preventivo, manejo de crónicos,
 * derivaciones, vacunación y anamnesis familiar.
 *
 * También exporta constantes de dominio: tamizaje preventivo,
 * protocolos de vacunación, criterios de derivación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina General.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const medicinaGeneralOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-general',
  dashboardPath: '/dashboard/medico/medicina-general',

  modules: {
    clinical: [
      {
        key: 'medgen-consulta',
        label: 'Consulta General',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-general/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'avg_consultation_duration'],
        description: 'SOAP general, anamnesis completa, revisión por sistemas',
      },
      {
        key: 'medgen-preventivo',
        label: 'Tamizaje Preventivo',
        icon: 'ShieldCheck',
        route: '/dashboard/medico/medicina-general/preventivo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['preventive_compliance'],
        description: 'Screening cáncer, cardiovascular, metabólico, inmunizaciones',
      },
      {
        key: 'medgen-cronicos',
        label: 'Gestión de Crónicos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-general/cronicos',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['chronic_control_rate'],
        description: 'HTA, diabetes, dislipidemia — seguimiento y control',
      },
      {
        key: 'medgen-derivaciones',
        label: 'Derivaciones a Especialista',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-general/derivaciones',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['referral_rate'],
        description: 'Interconsultas, criterios de derivación, seguimiento',
      },
      {
        key: 'medgen-vacunacion',
        label: 'Vacunación',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-general/vacunacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Esquema PAI, refuerzos, vacunas estacionales',
      },
      {
        key: 'medgen-historia-familiar',
        label: 'Historia Familiar',
        icon: 'Users',
        route: '/dashboard/medico/medicina-general/historia-familiar',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Antecedentes familiares, factores de riesgo hereditarios',
      },
    ],

    laboratory: [
      {
        key: 'medgen-laboratorio',
        label: 'Laboratorio de Rutina',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-general/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hematología, química, perfil lipídico, uroanálisis',
      },
      {
        key: 'medgen-imagenologia',
        label: 'Imagenología Básica',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-general/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Rx tórax, ecografía abdominal, radiografías',
      },
    ],

    technology: [
      {
        key: 'medgen-calculadoras',
        label: 'Calculadoras Clínicas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-general/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'IMC, riesgo cardiovascular, Framingham, clearance creatinina',
      },
      {
        key: 'medgen-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-general/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Guías de atención primaria, protocolos de tamizaje',
      },
    ],
  },

  widgets: [
    {
      key: 'preventive-screening',
      component: '@/components/dashboard/medico/medicina-general/widgets/preventive-screening-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'chronic-patients',
      component: '@/components/dashboard/medico/medicina-general/widgets/chronic-patients-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'pending-referrals',
      component: '@/components/dashboard/medico/medicina-general/widgets/pending-referrals-widget',
      size: 'small',
    },
    {
      key: 'vaccination-alerts',
      component: '@/components/dashboard/medico/medicina-general/widgets/vaccination-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'patients_per_day',
    'referral_rate',
    'preventive_compliance',
    'chronic_control_rate',
    'vaccination_coverage',
    'avg_consultation_duration',
  ],

  kpiDefinitions: {
    patients_per_day: {
      label: 'Pacientes / Día',
      format: 'number',
      goal: 20,
      direction: 'higher_is_better',
    },
    referral_rate: {
      label: 'Tasa de Derivación',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    preventive_compliance: {
      label: 'Adherencia Tamizaje',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    chronic_control_rate: {
      label: '% Crónicos Controlados',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    vaccination_coverage: {
      label: 'Cobertura Vacunación',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    avg_consultation_duration: {
      label: 'Duración Promedio Consulta (min)',
      format: 'number',
      goal: 20,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'control',
      'tamizaje_preventivo',
      'control_cronico',
      'vacunacion',
      'certificado_medico',
      'urgencia_consultorio',
      'derivacion',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_general',
      'revision_por_sistemas',
      'examen_fisico',
      'plan_preventivo',
      'nota_derivacion',
      'certificado_medico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresPreventiveScreening: true,
      tracksChronicDiseases: true,
      managesVaccination: true,
      tracksFamilyHistory: true,
      handlesReferrals: true,
    },
  },

  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    icon: 'Stethoscope',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA GENERAL
// ============================================================================

/**
 * Protocolos de tamizaje preventivo por grupo etario.
 */
export const PREVENTIVE_SCREENING_PROTOCOLS = {
  adults_18_39: {
    label: 'Adultos 18-39 años',
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'anual' },
      { key: 'lipid_panel', label: 'Perfil Lipídico', frequency: 'cada_5_anos', startAge: 20 },
      { key: 'glucose_fasting', label: 'Glucosa Ayunas', frequency: 'cada_3_anos', startAge: 35 },
      { key: 'pap_smear', label: 'Papanicolaou', frequency: 'cada_3_anos', gender: 'female', startAge: 21 },
      { key: 'hpv_test', label: 'VPH', frequency: 'cada_5_anos', gender: 'female', startAge: 30 },
      { key: 'hiv_screening', label: 'VIH', frequency: 'al_menos_una_vez' },
      { key: 'hepatitis_b', label: 'Hepatitis B', frequency: 'segun_riesgo' },
    ],
  },
  adults_40_64: {
    label: 'Adultos 40-64 años',
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'anual' },
      { key: 'lipid_panel', label: 'Perfil Lipídico', frequency: 'cada_2_anos' },
      { key: 'glucose_fasting', label: 'Glucosa Ayunas / HbA1c', frequency: 'cada_3_anos' },
      { key: 'colonoscopy', label: 'Colonoscopía', frequency: 'cada_10_anos', startAge: 45 },
      { key: 'mammography', label: 'Mamografía', frequency: 'cada_2_anos', gender: 'female', startAge: 40 },
      { key: 'psa', label: 'PSA (discutir)', frequency: 'anual', gender: 'male', startAge: 50 },
      { key: 'dexa', label: 'Densitometría Ósea', frequency: 'segun_riesgo', gender: 'female' },
    ],
  },
  adults_65_plus: {
    label: 'Adultos ≥65 años',
    screenings: [
      { key: 'bp_check', label: 'Control Tensión Arterial', frequency: 'cada_consulta' },
      { key: 'glucose_hba1c', label: 'HbA1c', frequency: 'semestral' },
      { key: 'renal_function', label: 'Función Renal', frequency: 'anual' },
      { key: 'dexa', label: 'Densitometría Ósea', frequency: 'cada_2_anos', gender: 'female' },
      { key: 'cognitive_screening', label: 'Tamizaje Cognitivo', frequency: 'anual' },
      { key: 'fall_risk', label: 'Riesgo de Caídas', frequency: 'anual' },
      { key: 'vision_hearing', label: 'Visión y Audición', frequency: 'anual' },
    ],
  },
} as const;

/**
 * Criterios de derivación a especialista por condición.
 */
export const REFERRAL_CRITERIA = [
  { key: 'cardiology', label: 'Cardiología', triggers: ['dolor_toracico_atipico', 'arritmia', 'soplo_nuevo', 'ic_sospecha'] },
  { key: 'endocrinology', label: 'Endocrinología', triggers: ['diabetes_descompensada', 'tiroides_anomala', 'nodulo_tiroideo'] },
  { key: 'gastroenterology', label: 'Gastroenterología', triggers: ['hemorragia_digestiva', 'ictericia', 'hepatopatia'] },
  { key: 'neurology', label: 'Neurología', triggers: ['cefalea_alarma', 'deficit_focal', 'convulsion_primera_vez'] },
  { key: 'psychiatry', label: 'Psiquiatría', triggers: ['depresion_severa', 'ideacion_suicida', 'psicosis'] },
  { key: 'surgery', label: 'Cirugía', triggers: ['hernia', 'masa_abdominal', 'colecistitis'] },
] as const;

/**
 * Esquema de vacunación adultos (basado en PAI Venezuela + CDC).
 */
export const ADULT_VACCINATION_SCHEDULE = [
  { key: 'influenza', label: 'Influenza', frequency: 'anual', targetGroup: 'todos' },
  { key: 'tdap', label: 'Tdap / Td', frequency: 'cada_10_anos', targetGroup: 'todos' },
  { key: 'pneumococcal', label: 'Neumococo (PCV13/PPSV23)', frequency: 'segun_riesgo', targetGroup: '65_plus' },
  { key: 'herpes_zoster', label: 'Herpes Zóster', frequency: 'una_vez', targetGroup: '50_plus' },
  { key: 'hepatitis_b', label: 'Hepatitis B', frequency: 'esquema_3_dosis', targetGroup: 'no_vacunados' },
  { key: 'covid19', label: 'COVID-19', frequency: 'segun_recomendacion', targetGroup: 'todos' },
] as const;
