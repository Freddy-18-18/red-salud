/**
 * @file overrides/psicologia-clinica.ts
 * @description Override de configuración para Psicología Clínica.
 *
 * Módulos especializados: baterías neuropsicológicas, formulación diagnóstica,
 * protocolos de terapia basada en evidencia (TCC, DBT, EMDR),
 * gestión de terapia grupal.
 *
 * También exporta constantes de dominio: protocolos terapéuticos
 * basados en evidencia, baterías de evaluación clínica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Psicología Clínica.
 * Especialidad avanzada con enfoque en evaluación diagnóstica,
 * protocolos terapéuticos basados en evidencia y terapia grupal.
 */
export const psicologiaClinicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'psicologia-clinica',
  dashboardPath: '/dashboard/medico/psicologia-clinica',

  modules: {
    clinical: [
      {
        key: 'psicol-consulta',
        label: 'Consulta de Psicología Clínica',
        icon: 'FileSearch',
        route: '/dashboard/medico/psicologia-clinica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'diagnostic_accuracy'],
        description: 'Evaluación clínica integral, entrevista estructurada',
      },
      {
        key: 'psicol-bateria-neuropsicologica',
        label: 'Batería Neuropsicológica',
        icon: 'Brain',
        route: '/dashboard/medico/psicologia-clinica/bateria-neuropsicologica',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'WAIS, WMS, Rorschach, TAT, baterías proyectivas y psicométricas',
      },
      {
        key: 'psicol-formulacion-diagnostica',
        label: 'Formulación Diagnóstica',
        icon: 'FileSearch',
        route: '/dashboard/medico/psicologia-clinica/formulacion-diagnostica',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['diagnostic_accuracy'],
        description: 'Formulación de caso, diagnóstico diferencial, conceptualización',
      },
      {
        key: 'psicol-tcc',
        label: 'Protocolo TCC',
        icon: 'ListChecks',
        route: '/dashboard/medico/psicologia-clinica/tcc',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['treatment_response_rate'],
        description: 'Terapia Cognitivo-Conductual — protocolos estructurados',
      },
      {
        key: 'psicol-dbt',
        label: 'Protocolo DBT',
        icon: 'HeartPulse',
        route: '/dashboard/medico/psicologia-clinica/dbt',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Terapia Dialéctica Conductual — mindfulness, regulación emocional',
      },
      {
        key: 'psicol-emdr',
        label: 'Protocolo EMDR',
        icon: 'Eye',
        route: '/dashboard/medico/psicologia-clinica/emdr',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Desensibilización y Reprocesamiento por Movimiento Ocular',
      },
      {
        key: 'psicol-terapia-grupal',
        label: 'Terapia Grupal',
        icon: 'Users',
        route: '/dashboard/medico/psicologia-clinica/terapia-grupal',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Gestión de grupos terapéuticos, dinámicas, asistencia',
      },
    ],

    financial: [
      {
        key: 'psicol-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/psicologia-clinica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/psicologia-clinica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'psicol-telepsicologia',
        label: 'Telepsicología',
        icon: 'Video',
        route: '/dashboard/medico/psicologia-clinica/telepsicologia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol-protocolos',
        label: 'Biblioteca de Protocolos EBP',
        icon: 'BookOpen',
        route: '/dashboard/medico/psicologia-clinica/protocolos',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Protocolos de terapia basada en evidencia',
      },
    ],

    communication: [
      {
        key: 'psicol-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/psicologia-clinica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'psicol-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/psicologia-clinica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'psicol-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/psicologia-clinica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'diagnostic-formulations',
      component: '@/components/dashboard/medico/psicologia-clinica/widgets/diagnostic-formulations-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'treatment-protocols',
      component: '@/components/dashboard/medico/psicologia-clinica/widgets/treatment-protocols-widget',
      size: 'medium',
    },
    {
      key: 'group-therapy-schedule',
      component: '@/components/dashboard/medico/psicologia-clinica/widgets/group-therapy-schedule-widget',
      size: 'medium',
    },
    {
      key: 'relapse-prevention-alerts',
      component: '@/components/dashboard/medico/psicologia-clinica/widgets/relapse-prevention-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'diagnostic_accuracy',
    'treatment_response_rate',
    'relapse_prevention_rate',
    'sessions_completed',
    'group_therapy_attendance',
    'protocol_adherence',
  ],

  kpiDefinitions: {
    diagnostic_accuracy: {
      label: 'Precisión Diagnóstica',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    treatment_response_rate: {
      label: 'Tasa de Respuesta al Tratamiento',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    relapse_prevention_rate: {
      label: 'Tasa de Prevención de Recaídas',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    sessions_completed: {
      label: 'Sesiones Completadas',
      format: 'number',
      direction: 'higher_is_better',
    },
    group_therapy_attendance: {
      label: 'Asistencia Terapia Grupal',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    protocol_adherence: {
      label: 'Adherencia a Protocolos EBP',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_diagnostica',
      'sesion_tcc',
      'sesion_dbt',
      'sesion_emdr',
      'terapia_grupal',
      'devolucion_bateria',
      'seguimiento',
      'telepsicologia',
    ],
    defaultDuration: 50,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_clinica_integral',
      'informe_bateria_neuropsicologica',
      'formulacion_caso',
      'protocolo_tcc',
      'protocolo_dbt',
      'protocolo_emdr',
      'nota_terapia_grupal',
      'informe_evolucion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresNeuropsychologicalBatteries: true,
      supportsDiagnosticFormulation: true,
      usesEvidenceBasedProtocols: true,
      supportsGroupTherapy: true,
      tracksRelapsePrevention: true,
      requiresConfidentialityProtocol: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    icon: 'FileSearch',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — PSICOLOGÍA CLÍNICA
// ============================================================================

/**
 * Protocolos terapéuticos basados en evidencia (EBP)
 */
export const EVIDENCE_BASED_PROTOCOLS = [
  { key: 'cbt_depression', label: 'TCC para Depresión (Beck)', sessions: '12-20', evidenceLevel: 'A', indication: 'Trastorno Depresivo Mayor' },
  { key: 'cbt_anxiety', label: 'TCC para Ansiedad (Clark & Wells)', sessions: '12-16', evidenceLevel: 'A', indication: 'Trastornos de Ansiedad' },
  { key: 'cbt_ocd', label: 'ERP para TOC (Foa & Kozak)', sessions: '16-20', evidenceLevel: 'A', indication: 'Trastorno Obsesivo-Compulsivo' },
  { key: 'dbt_bpd', label: 'DBT para TLP (Linehan)', sessions: '52+ (1 año)', evidenceLevel: 'A', indication: 'Trastorno Límite de Personalidad' },
  { key: 'emdr_ptsd', label: 'EMDR para TEPT (Shapiro)', sessions: '8-12', evidenceLevel: 'A', indication: 'Trastorno de Estrés Postraumático' },
  { key: 'cbt_insomnia', label: 'TCC-i para Insomnio', sessions: '6-8', evidenceLevel: 'A', indication: 'Insomnio Crónico' },
  { key: 'act_chronic_pain', label: 'ACT para Dolor Crónico', sessions: '8-12', evidenceLevel: 'A', indication: 'Dolor Crónico' },
  { key: 'cbt_eating', label: 'TCC-E para Trastornos Alimentarios (Fairburn)', sessions: '20-40', evidenceLevel: 'A', indication: 'Bulimia, Trastorno por Atracón' },
] as const;

/**
 * Baterías de evaluación clínica comunes
 */
export const CLINICAL_ASSESSMENT_BATTERIES = [
  { key: 'wais_iv', label: 'WAIS-IV (Escala Wechsler de Inteligencia para Adultos)', domain: 'inteligencia', duration: '90-120 min' },
  { key: 'wisc_v', label: 'WISC-V (Escala Wechsler de Inteligencia para Niños)', domain: 'inteligencia', duration: '60-90 min' },
  { key: 'mmpi_2', label: 'MMPI-2 (Inventario Multifásico de Personalidad)', domain: 'personalidad', duration: '60-90 min' },
  { key: 'rorschach', label: 'Test de Rorschach (Sistema Comprehensivo)', domain: 'personalidad_proyectiva', duration: '45-60 min' },
  { key: 'beck_inventories', label: 'Inventarios de Beck (BDI-II, BAI, BHS)', domain: 'sintomas', duration: '15-20 min' },
  { key: 'scl90', label: 'SCL-90-R (Symptom Checklist)', domain: 'sintomatologia_general', duration: '15-20 min' },
  { key: 'mcmi_iv', label: 'MCMI-IV (Inventario Clínico Multiaxial de Millon)', domain: 'personalidad', duration: '30-45 min' },
] as const;
