/**
 * @file overrides/medicina-reproductiva.ts
 * @description Override de configuración para Medicina Reproductiva.
 *
 * Módulos especializados: seguimiento de ciclos FIV, monitoreo folicular,
 * análisis de semen, protocolos de estimulación hormonal, grading embrionario,
 * tasas de éxito, screening genético preimplantacional (PGT).
 *
 * También exporta constantes de dominio: clasificación embrionaria,
 * protocolos de estimulación, grados de varicocele.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Reproductiva.
 * Especialidad centrada en fertilidad, reproducción asistida e infertilidad.
 */
export const medicinaReproductivaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-reproductiva',
  dashboardPath: '/dashboard/medico/medicina-reproductiva',

  modules: {
    clinical: [
      {
        key: 'reprod-ciclo-fiv',
        label: 'Ciclo FIV / ICSI',
        icon: 'Sparkles',
        route: '/dashboard/medico/medicina-reproductiva/ciclo-fiv',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['clinical_pregnancy_rate', 'live_birth_rate'],
      },
      {
        key: 'reprod-monitoreo-folicular',
        label: 'Monitoreo Folicular',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-reproductiva/monitoreo-folicular',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento ecográfico de folículos y endometrio',
      },
      {
        key: 'reprod-espermatograma',
        label: 'Espermatograma',
        icon: 'Microscope',
        route: '/dashboard/medico/medicina-reproductiva/espermatograma',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Tendencias de análisis de semen según criterios OMS',
      },
      {
        key: 'reprod-estimulacion',
        label: 'Protocolo de Estimulación',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-reproductiva/estimulacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['ohss_rate'],
      },
      {
        key: 'reprod-embriones',
        label: 'Grading Embrionario',
        icon: 'Star',
        route: '/dashboard/medico/medicina-reproductiva/embriones',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Clasificación de embriones (Gardner), criopreservación',
      },
      {
        key: 'reprod-pgt',
        label: 'Screening Genético (PGT)',
        icon: 'Dna',
        route: '/dashboard/medico/medicina-reproductiva/pgt',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'PGT-A, PGT-M, PGT-SR: test genético preimplantacional',
      },
    ],

    lab: [
      {
        key: 'reprod-hormonas',
        label: 'Panel Hormonal',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-reproductiva/hormonas',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'FSH, LH, E2, progesterona, AMH, prolactina',
      },
      {
        key: 'reprod-embriologia',
        label: 'Laboratorio de Embriología',
        icon: 'Microscope',
        route: '/dashboard/medico/medicina-reproductiva/embriologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'reprod-calculadoras',
        label: 'Calculadoras Reproductivas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-reproductiva/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Reserva ovárica, dosis gonadotropinas, probabilidad de embarazo',
      },
    ],

    communication: [
      {
        key: 'reprod-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/medicina-reproductiva/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'reprod-analytics',
        label: 'Tasas de Éxito',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-reproductiva/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'ivf-cycle-tracker',
      component: '@/components/dashboard/medico/medicina-reproductiva/widgets/ivf-cycle-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'follicular-monitoring',
      component: '@/components/dashboard/medico/medicina-reproductiva/widgets/follicular-monitoring-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'success-rates',
      component: '@/components/dashboard/medico/medicina-reproductiva/widgets/success-rates-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'clinical_pregnancy_rate',
    'live_birth_rate',
    'ohss_rate',
    'implantation_rate',
    'fertilization_rate',
    'cycle_cancellation_rate',
  ],

  kpiDefinitions: {
    clinical_pregnancy_rate: {
      label: 'Tasa de Embarazo Clínico',
      format: 'percentage',
      goal: 0.45,
      direction: 'higher_is_better',
    },
    live_birth_rate: {
      label: 'Tasa de Nacido Vivo',
      format: 'percentage',
      goal: 0.35,
      direction: 'higher_is_better',
    },
    ohss_rate: {
      label: 'Tasa de SHO (OHSS)',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    implantation_rate: {
      label: 'Tasa de Implantación',
      format: 'percentage',
      goal: 0.4,
      direction: 'higher_is_better',
    },
    fertilization_rate: {
      label: 'Tasa de Fertilización',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    cycle_cancellation_rate: {
      label: 'Tasa de Cancelación de Ciclo',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_infertilidad',
      'monitoreo_folicular',
      'transferencia_embrionaria',
      'puncion_ovarica',
      'inseminacion_artificial',
      'control_estimulacion',
      'beta_hcg',
      'consejeria_genetica',
      'espermatograma',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_fertilidad',
      'protocolo_estimulacion',
      'monitoreo_folicular',
      'informe_puncion',
      'informe_transferencia',
      'informe_embriologia',
      'consentimiento_tra',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksIVFCycles: true,
      requiresFollicularMonitoring: true,
      usesEmbryoGrading: true,
      supportsPGT: true,
      tracksHormoneProtocols: true,
      requiresSemenAnalysis: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Sparkles',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO MEDICINA REPRODUCTIVA
// ============================================================================

/**
 * Clasificación de embriones (Gardner)
 */
export const EMBRYO_GRADING_GARDNER = [
  { stage: 1, label: 'Blastocisto temprano', description: 'Cavidad <50% del volumen' },
  { stage: 2, label: 'Blastocisto', description: 'Cavidad ≥50% del volumen' },
  { stage: 3, label: 'Blastocisto expandido', description: 'Cavidad llena, zona adelgazada' },
  { stage: 4, label: 'Blastocisto eclosionado', description: 'Herniando fuera de la zona pelúcida' },
  { stage: 5, label: 'Blastocisto eclosionando', description: 'Parcialmente fuera de la zona' },
  { stage: 6, label: 'Completamente eclosionado', description: 'Fuera de la zona pelúcida' },
] as const;

/**
 * Protocolos de estimulación ovárica
 */
export const STIMULATION_PROTOCOLS = [
  { key: 'long_agonist', label: 'Protocolo Largo con Agonista', description: 'Downregulation con GnRH agonista + FSH/HMG' },
  { key: 'short_antagonist', label: 'Protocolo Corto con Antagonista', description: 'FSH/HMG + GnRH antagonista flexible' },
  { key: 'mild_stimulation', label: 'Estimulación Suave', description: 'Dosis bajas de gonadotropinas, menos óvulos de mejor calidad' },
  { key: 'natural_cycle', label: 'Ciclo Natural', description: 'Sin estimulación o estimulación mínima' },
  { key: 'flare_protocol', label: 'Protocolo Flare-Up', description: 'Agonista en fase folicular temprana (poor responders)' },
] as const;

/**
 * Criterios OMS para análisis de semen (6ta edición, 2021)
 */
export const WHO_SEMEN_CRITERIA = {
  volume: { min: 1.4, unit: 'mL', label: 'Volumen' },
  concentration: { min: 16, unit: 'millones/mL', label: 'Concentración' },
  totalCount: { min: 39, unit: 'millones', label: 'Conteo Total' },
  progressiveMotility: { min: 30, unit: '%', label: 'Movilidad Progresiva' },
  totalMotility: { min: 42, unit: '%', label: 'Movilidad Total' },
  morphology: { min: 4, unit: '%', label: 'Morfología Normal (Kruger)' },
  vitality: { min: 54, unit: '%', label: 'Vitalidad' },
} as const;
