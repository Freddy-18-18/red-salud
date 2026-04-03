/**
 * @file overrides/medicina-familiar.ts
 * @description Override de configuración para Medicina Familiar.
 *
 * Atención centrada en la familia — genograma familiar, cuidado
 * por ciclo de vida, visitas domiciliarias, seguimiento de crónicos
 * y abordaje multigeneracional.
 *
 * También exporta constantes de dominio: ciclos de vida familiar,
 * categorías de visita domiciliaria, indicadores familiares.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Familiar.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const medicinaFamiliarOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-familiar',
  dashboardPath: '/dashboard/medico/medicina-familiar',

  modules: {
    clinical: [
      {
        key: 'medfam-consulta',
        label: 'Consulta Familiar',
        icon: 'Users',
        route: '/dashboard/medico/medicina-familiar/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['family_coverage', 'patients_per_day'],
        description: 'Consulta integral — contexto familiar, SOAP, revisión por sistemas',
      },
      {
        key: 'medfam-genograma',
        label: 'Genograma Familiar',
        icon: 'GitBranch',
        route: '/dashboard/medico/medicina-familiar/genograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Estructura familiar, patrones de enfermedad, dinámica relacional',
      },
      {
        key: 'medfam-ciclo-vida',
        label: 'Cuidado por Ciclo de Vida',
        icon: 'RotateCw',
        route: '/dashboard/medico/medicina-familiar/ciclo-vida',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Neonatal, pediátrico, adolescente, adulto, geriátrico',
      },
      {
        key: 'medfam-domiciliaria',
        label: 'Visitas Domiciliarias',
        icon: 'Home',
        route: '/dashboard/medico/medicina-familiar/domiciliaria',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['home_visits_per_month'],
        description: 'Programación, seguimiento y reporte de visitas a domicilio',
      },
      {
        key: 'medfam-cronicos',
        label: 'Seguimiento de Crónicos',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-familiar/cronicos',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['chronic_control_rate'],
        description: 'HTA, diabetes, asma, EPOC — panel de crónicos por familia',
      },
      {
        key: 'medfam-multigeneracional',
        label: 'Abordaje Multigeneracional',
        icon: 'Layers',
        route: '/dashboard/medico/medicina-familiar/multigeneracional',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Riesgo hereditario, patrones familiares, intervención grupal',
      },
    ],

    laboratory: [
      {
        key: 'medfam-laboratorio',
        label: 'Laboratorio Familiar',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-familiar/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Exámenes de rutina, tamizaje familiar, perfiles metabólicos',
      },
      {
        key: 'medfam-imagenologia',
        label: 'Imagenología Básica',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-familiar/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Rx, ecografía — solicitudes y resultados',
      },
    ],

    technology: [
      {
        key: 'medfam-calculadoras',
        label: 'Calculadoras Clínicas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-familiar/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'IMC, riesgo CV, curvas de crecimiento, clearance creatinina',
      },
      {
        key: 'medfam-guias',
        label: 'Guías de Atención Familiar',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-familiar/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Protocolos de atención primaria, guías AAFP, WONCA',
      },
    ],
  },

  widgets: [
    {
      key: 'family-overview',
      component: '@/components/dashboard/medico/medicina-familiar/widgets/family-overview-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'chronic-family-tracker',
      component: '@/components/dashboard/medico/medicina-familiar/widgets/chronic-family-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'home-visits-schedule',
      component: '@/components/dashboard/medico/medicina-familiar/widgets/home-visits-schedule-widget',
      size: 'medium',
    },
    {
      key: 'lifecycle-alerts',
      component: '@/components/dashboard/medico/medicina-familiar/widgets/lifecycle-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'family_coverage',
    'chronic_control_rate',
    'home_visits_per_month',
    'preventive_compliance',
    'patient_satisfaction',
    'avg_consultation_duration',
  ],

  kpiDefinitions: {
    family_coverage: {
      label: 'Cobertura Familiar',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    chronic_control_rate: {
      label: '% Crónicos Controlados',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    home_visits_per_month: {
      label: 'Visitas Domiciliarias / Mes',
      format: 'number',
      goal: 15,
      direction: 'higher_is_better',
    },
    preventive_compliance: {
      label: 'Adherencia Tamizaje',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    avg_consultation_duration: {
      label: 'Duración Promedio Consulta (min)',
      format: 'number',
      goal: 25,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'control_familiar',
      'visita_domiciliaria',
      'control_cronico',
      'control_prenatal',
      'control_nino_sano',
      'consejeria_familiar',
      'vacunacion',
      'urgencia_consultorio',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_familiar',
      'genograma',
      'examen_fisico',
      'nota_domiciliaria',
      'plan_familiar',
      'control_nino_sano',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresGenogram: true,
      tracksChronicDiseases: true,
      supportsHomeVisits: true,
      tracksLifecycleStages: true,
      managesMultiGenerational: true,
    },
  },

  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    icon: 'Users',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA FAMILIAR
// ============================================================================

/**
 * Etapas del ciclo de vida familiar (modelo Duvall adaptado).
 */
export const FAMILY_LIFECYCLE_STAGES = [
  { key: 'formation', label: 'Formación de Pareja', ageRange: null, focus: 'Planificación familiar, salud sexual' },
  { key: 'childbearing', label: 'Familia con Hijos Pequeños', ageRange: '0-5', focus: 'Prenatal, neonatal, vacunación, desarrollo' },
  { key: 'preschool', label: 'Familia con Preescolares', ageRange: '3-6', focus: 'Crecimiento, nutrición, neurodesarrollo' },
  { key: 'school_age', label: 'Familia con Escolares', ageRange: '6-12', focus: 'Rendimiento escolar, conducta, prevención' },
  { key: 'adolescent', label: 'Familia con Adolescentes', ageRange: '12-18', focus: 'Salud mental, sexualidad, adicciones' },
  { key: 'launching', label: 'Familia Lanzadera', ageRange: '18-30', focus: 'Independencia, salud laboral' },
  { key: 'middle_aged', label: 'Familia Edad Media', ageRange: '40-64', focus: 'Crónicos, tamizaje, menopausia/andropausia' },
  { key: 'aging', label: 'Familia Envejeciente', ageRange: '65+', focus: 'Fragilidad, polifarmacia, dependencia' },
] as const;

/**
 * Categorías de visita domiciliaria y sus indicaciones.
 */
export const HOME_VISIT_CATEGORIES = [
  { key: 'postpartum', label: 'Puerperio', indication: 'Control post-parto, lactancia, tamizaje neonatal' },
  { key: 'chronic_complex', label: 'Crónico Complejo', indication: 'Paciente con 3+ comorbilidades, movilidad reducida' },
  { key: 'palliative', label: 'Cuidado Paliativo', indication: 'Enfermedad terminal, control de síntomas' },
  { key: 'elderly_frail', label: 'Adulto Mayor Frágil', indication: 'Caídas, dependencia, evaluación funcional' },
  { key: 'mental_health', label: 'Salud Mental', indication: 'Depresión severa, riesgo suicida, psicosis' },
  { key: 'disability', label: 'Discapacidad', indication: 'Rehabilitación, adaptación del hogar' },
] as const;

/**
 * Indicadores de salud familiar.
 */
export const FAMILY_HEALTH_INDICATORS = [
  { key: 'family_apgar', label: 'APGAR Familiar', description: 'Adaptabilidad, participación, crecimiento, afecto, resolución', scale: '0-10' },
  { key: 'family_faces', label: 'FACES III', description: 'Cohesión y adaptabilidad familiar', scale: 'likert' },
  { key: 'genogram_risk', label: 'Riesgo del Genograma', description: 'Patrones de enfermedad heredable', scale: 'bajo/medio/alto' },
  { key: 'social_determinants', label: 'Determinantes Sociales', description: 'Vivienda, ingreso, educación, acceso a salud', scale: 'cualitativo' },
] as const;
