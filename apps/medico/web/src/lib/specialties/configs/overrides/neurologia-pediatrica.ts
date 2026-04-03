/**
 * @file overrides/neurologia-pediatrica.ts
 * @description Override de configuración para Neurología Pediátrica.
 *
 * Módulos especializados para el manejo neurológico infantil:
 * diario de crisis, seguimiento EEG, hitos del desarrollo (Denver II),
 * tamizaje de autismo (M-CHAT), clasificación de PC (GMFCS), diario de cefaleas.
 *
 * También exporta constantes de dominio: clasificación de crisis epilépticas,
 * hitos Denver II, ítems M-CHAT, niveles GMFCS.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neurología Pediátrica.
 * Especialidad con módulos clínicos especializados para el neurodesarrollo infantil.
 */
export const neurologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neurologia-pediatrica',
  dashboardPath: '/dashboard/medico/neurologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'neuropedi-consulta',
        label: 'Consulta Neurológica Pediátrica',
        icon: 'Brain',
        route: '/dashboard/medico/neurologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['seizure_freedom_rate', 'diagnosis_timeliness'],
      },
      {
        key: 'neuropedi-crisis',
        label: 'Diario de Crisis Epilépticas',
        icon: 'Zap',
        route: '/dashboard/medico/neurologia-pediatrica/crisis',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['seizure_freedom_rate'],
      },
      {
        key: 'neuropedi-eeg',
        label: 'Seguimiento EEG',
        icon: 'Activity',
        route: '/dashboard/medico/neurologia-pediatrica/eeg',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['seizure_freedom_rate'],
      },
      {
        key: 'neuropedi-desarrollo',
        label: 'Hitos del Desarrollo (Denver II)',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neurologia-pediatrica/desarrollo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['developmental_milestone_compliance'],
      },
      {
        key: 'neuropedi-autismo',
        label: 'Tamizaje Autismo (M-CHAT)',
        icon: 'ClipboardCheck',
        route: '/dashboard/medico/neurologia-pediatrica/autismo',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['diagnosis_timeliness'],
      },
      {
        key: 'neuropedi-paralisis-cerebral',
        label: 'Parálisis Cerebral (GMFCS)',
        icon: 'Accessibility',
        route: '/dashboard/medico/neurologia-pediatrica/paralisis-cerebral',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['developmental_milestone_compliance'],
      },
      {
        key: 'neuropedi-cefaleas',
        label: 'Diario de Cefaleas',
        icon: 'HeadsetOff',
        route: '/dashboard/medico/neurologia-pediatrica/cefaleas',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'neuropedi-neuroimagen',
        label: 'Neuroimagen',
        icon: 'Scan',
        route: '/dashboard/medico/neurologia-pediatrica/neuroimagen',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuropedi-calculadoras',
        label: 'Calculadoras Neurológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/neurologia-pediatrica/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'neuropedi-portal-padres',
        label: 'Portal de Padres',
        icon: 'Users',
        route: '/dashboard/medico/neurologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'neuropedi-reportes-escuela',
        label: 'Reportes Escolares',
        icon: 'GraduationCap',
        route: '/dashboard/medico/neurologia-pediatrica/reportes-escuela',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'seizure-diary-summary',
      component: '@/components/dashboard/medico/neurologia-pediatrica/widgets/seizure-diary-summary-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'developmental-tracker',
      component: '@/components/dashboard/medico/neurologia-pediatrica/widgets/developmental-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'eeg-schedule',
      component: '@/components/dashboard/medico/neurologia-pediatrica/widgets/eeg-schedule-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'seizure_freedom_rate',
    'developmental_milestone_compliance',
    'diagnosis_timeliness',
    'eeg_follow_up_rate',
    'therapy_adherence',
    'patient_satisfaction_score',
  ],

  kpiDefinitions: {
    seizure_freedom_rate: {
      label: 'Tasa de Libertad de Crisis',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    developmental_milestone_compliance: {
      label: 'Cumplimiento de Hitos del Desarrollo',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    diagnosis_timeliness: {
      label: 'Oportunidad Diagnóstica (días)',
      format: 'number',
      goal: 30,
      direction: 'lower_is_better',
    },
    eeg_follow_up_rate: {
      label: 'Tasa de Seguimiento EEG',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    therapy_adherence: {
      label: 'Adherencia a Tratamiento',
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
      'consulta_neurologica_pediatrica',
      'seguimiento_epilepsia',
      'evaluacion_eeg',
      'evaluacion_desarrollo_denver',
      'tamizaje_autismo',
      'evaluacion_gmfcs',
      'seguimiento_cefalea',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_neurologica_pediatrica',
      'examen_neurologico_pediatrico',
      'diario_crisis',
      'reporte_eeg',
      'evaluacion_denver_ii',
      'tamizaje_mchat',
      'clasificacion_gmfcs',
      'diario_cefaleas',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksSeizureDiary: true,
      usesEEGTracking: true,
      usesDenverIIMilestones: true,
      usesMCHATScreening: true,
      usesGMFCSClassification: true,
      tracksHeadacheDiary: true,
      requiresParentalConsent: true,
      usesPediatricDosage: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'Brain',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEUROLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Clasificación de crisis epilépticas (ILAE 2017)
 */
export const SEIZURE_CLASSIFICATION = {
  focal: [
    { key: 'focal_aware', label: 'Focal con Conciencia Preservada' },
    { key: 'focal_impaired', label: 'Focal con Conciencia Alterada' },
    { key: 'focal_to_bilateral', label: 'Focal a Bilateral Tónico-Clónica' },
  ],
  generalized: [
    { key: 'absence', label: 'Ausencia' },
    { key: 'tonic_clonic', label: 'Tónico-Clónica' },
    { key: 'tonic', label: 'Tónica' },
    { key: 'clonic', label: 'Clónica' },
    { key: 'myoclonic', label: 'Mioclónica' },
    { key: 'atonic', label: 'Atónica' },
  ],
  unknown: [
    { key: 'epileptic_spasms', label: 'Espasmos Epilépticos' },
    { key: 'unknown_onset', label: 'Inicio Desconocido' },
  ],
};

/**
 * Hitos del desarrollo según Denver II (resumen por área y edad)
 */
export const DENVER_II_MILESTONES: Record<
  string,
  { grossMotor: string[]; fineMotor: string[]; language: string[]; personalSocial: string[] }
> = {
  '0-3m': {
    grossMotor: ['Levanta cabeza en prono', 'Eleva tronco con brazos'],
    fineMotor: ['Sigue objeto 180°', 'Junta manos en línea media'],
    language: ['Vocaliza', 'Se ríe'],
    personalSocial: ['Sonrisa social', 'Mira cara'],
  },
  '3-6m': {
    grossMotor: ['Rolido', 'Se sienta con apoyo'],
    fineMotor: ['Alcanza objetos', 'Transfiere de mano'],
    language: ['Balbucea', 'Voltea al sonido'],
    personalSocial: ['Reconoce a padres', 'Se ríe a carcajadas'],
  },
  '6-12m': {
    grossMotor: ['Se sienta sin apoyo', 'Gatea', 'Se para con apoyo'],
    fineMotor: ['Pinza fina', 'Golpea cubos'],
    language: ['Dice mamá/papá', 'Imita sonidos'],
    personalSocial: ['Ansiedad por extraños', 'Juega peek-a-boo'],
  },
  '12-18m': {
    grossMotor: ['Camina solo', 'Sube escaleras con ayuda'],
    fineMotor: ['Torre 2 cubos', 'Garabatea'],
    language: ['3-6 palabras', 'Señala lo que quiere'],
    personalSocial: ['Usa cuchara', 'Ayuda a vestirse'],
  },
  '18-24m': {
    grossMotor: ['Corre', 'Patea pelota'],
    fineMotor: ['Torre 4-6 cubos', 'Línea vertical'],
    language: ['Frases de 2 palabras', '50+ palabras'],
    personalSocial: ['Se lava manos', 'Juego paralelo'],
  },
  '2-4y': {
    grossMotor: ['Salta en un pie', 'Sube escaleras alternando pies'],
    fineMotor: ['Copia círculo', 'Usa tijeras'],
    language: ['Oraciones completas', 'Cuenta hasta 10'],
    personalSocial: ['Se viste solo', 'Juego cooperativo'],
  },
};

/**
 * Ítems del M-CHAT-R/F (Modified Checklist for Autism in Toddlers)
 */
export const MCHAT_ITEMS = [
  { number: 1, text: '¿Si usted señala algo al otro lado de la habitación, su hijo/a lo mira?' },
  { number: 2, text: '¿Alguna vez se ha preguntado si su hijo/a es sordo/a?' },
  { number: 3, text: '¿Su hijo/a juega a hacer de cuenta o simular?' },
  { number: 4, text: '¿A su hijo/a le gusta trepar cosas?' },
  { number: 5, text: '¿Su hijo/a hace movimientos inusuales con los dedos cerca de sus ojos?' },
  { number: 6, text: '¿Su hijo/a señala con un dedo para pedir algo o para obtener ayuda?' },
  { number: 7, text: '¿Su hijo/a señala con un dedo para mostrarle algo interesante?' },
  { number: 8, text: '¿Su hijo/a se interesa en otros niños?' },
  { number: 9, text: '¿Su hijo/a le trae cosas para mostrárselas?' },
  { number: 10, text: '¿Su hijo/a responde cuando usted lo/la llama por su nombre?' },
  { number: 11, text: '¿Cuando usted le sonríe a su hijo/a, le devuelve la sonrisa?' },
  { number: 12, text: '¿A su hijo/a le molestan los ruidos cotidianos?' },
  { number: 13, text: '¿Su hijo/a camina?' },
  { number: 14, text: '¿Su hijo/a le mira a los ojos cuando usted le habla, juega con él/ella o lo/la viste?' },
  { number: 15, text: '¿Su hijo/a trata de copiar lo que usted hace?' },
  { number: 16, text: '¿Si usted voltea la cabeza para mirar algo, su hijo/a mira alrededor para ver qué está mirando?' },
  { number: 17, text: '¿Su hijo/a trata de que usted lo/la mire?' },
  { number: 18, text: '¿Su hijo/a le entiende cuando usted le dice que haga algo?' },
  { number: 19, text: '¿Si algo nuevo ocurre, su hijo/a mira su cara para ver cómo se siente usted al respecto?' },
  { number: 20, text: '¿A su hijo/a le gustan las actividades con movimiento?' },
];

/**
 * Niveles GMFCS (Gross Motor Function Classification System)
 */
export const GMFCS_LEVELS = [
  { level: 'I', label: 'Nivel I', description: 'Camina sin limitaciones. Limitaciones en habilidades motoras gruesas avanzadas.' },
  { level: 'II', label: 'Nivel II', description: 'Camina con limitaciones. Dificultad en superficies irregulares, inclinadas, espacios reducidos.' },
  { level: 'III', label: 'Nivel III', description: 'Camina con dispositivo de asistencia manual en interiores. Silla de ruedas en exteriores.' },
  { level: 'IV', label: 'Nivel IV', description: 'Auto-movilidad con limitaciones. Transportado o usa silla de ruedas motorizada.' },
  { level: 'V', label: 'Nivel V', description: 'Transportado en silla de ruedas manual. Limitaciones severas de control de cabeza y tronco.' },
];
