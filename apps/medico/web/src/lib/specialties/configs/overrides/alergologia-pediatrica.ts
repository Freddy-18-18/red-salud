/**
 * @file overrides/alergologia-pediatrica.ts
 * @description Override de configuración para Alergología Pediátrica.
 *
 * Combina Alergología + Pediatría: módulos especializados para el
 * manejo de alergias alimentarias, marcha atópica (eczema-alergia),
 * programación de oral food challenges, planes de acción escolares.
 *
 * También exporta constantes de dominio: alimentos alergénicos pediátricos,
 * etapas de la marcha atópica, protocolo de food challenge.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Alergología Pediátrica.
 * Especialidad centrada en manejo de alergias en pacientes pediátricos.
 */
export const alergologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'alergologia-pediatrica',
  dashboardPath: '/dashboard/medico/alergologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'alergo-pedi-consulta',
        label: 'Consulta Alergia Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/alergologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'alergo-pedi-alergia-alimentaria',
        label: 'Manejo de Alergia Alimentaria',
        icon: 'Apple',
        route: '/dashboard/medico/alergologia-pediatrica/alergia-alimentaria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Identificación de alérgenos, dietas de eliminación, reintroducción guiada',
        kpiKeys: ['outgrowth_rate'],
      },
      {
        key: 'alergo-pedi-marcha-atopica',
        label: 'Marcha Atópica (Eczema-Alergia)',
        icon: 'TrendingUp',
        route: '/dashboard/medico/alergologia-pediatrica/marcha-atopica',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Seguimiento de la progresión: eczema → alergia alimentaria → asma → rinitis',
      },
      {
        key: 'alergo-pedi-oral-food-challenge',
        label: 'Provocación Oral (OFC)',
        icon: 'ClipboardList',
        route: '/dashboard/medico/alergologia-pediatrica/oral-food-challenge',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Programación y registro de open/single-blind/double-blind food challenges',
        kpiKeys: ['oral_challenge_success_rate'],
      },
      {
        key: 'alergo-pedi-plan-escolar',
        label: 'Planes de Acción Escolares',
        icon: 'GraduationCap',
        route: '/dashboard/medico/alergologia-pediatrica/plan-escolar',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Planes de emergencia para escuelas, autoinyectores, educación del personal',
        kpiKeys: ['action_plan_compliance'],
      },
      {
        key: 'alergo-pedi-crecimiento',
        label: 'Crecimiento y Desarrollo',
        icon: 'Ruler',
        route: '/dashboard/medico/alergologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Monitoreo nutricional en dietas de eliminación, curvas de crecimiento',
      },
    ],

    lab: [
      {
        key: 'alergo-pedi-laboratorio',
        label: 'Laboratorio Alergológico Pediátrico',
        icon: 'TestTube',
        route: '/dashboard/medico/alergologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'IgE específica, componentes moleculares, eosinófilos, triptasa',
      },
      {
        key: 'alergo-pedi-prick-test',
        label: 'Prick Test Pediátrico',
        icon: 'Target',
        route: '/dashboard/medico/alergologia-pediatrica/prick-test',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'alergo-pedi-espirometria',
        label: 'Espirometría Pediátrica',
        icon: 'Activity',
        route: '/dashboard/medico/alergologia-pediatrica/espirometria',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'alergo-pedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/alergologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Dosis de adrenalina por peso, riesgo de anafilaxia, probabilidad de tolerancia',
      },
    ],

    communication: [
      {
        key: 'alergo-pedi-portal-padres',
        label: 'Portal para Padres',
        icon: 'Users',
        route: '/dashboard/medico/alergologia-pediatrica/portal-padres',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'alergo-pedi-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/alergologia-pediatrica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'alergo-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/alergologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'food-allergy-tracker',
      component: '@/components/dashboard/medico/alergologia-pediatrica/widgets/food-allergy-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'atopic-march-timeline',
      component: '@/components/dashboard/medico/alergologia-pediatrica/widgets/atopic-march-timeline-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'school-action-plans',
      component: '@/components/dashboard/medico/alergologia-pediatrica/widgets/school-action-plans-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'ofc-schedule',
      component: '@/components/dashboard/medico/alergologia-pediatrica/widgets/ofc-schedule-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'oral_challenge_success_rate',
    'action_plan_compliance',
    'outgrowth_rate',
    'anaphylaxis_event_rate',
    'nutritional_adequacy',
    'parent_education_completion',
  ],

  kpiDefinitions: {
    oral_challenge_success_rate: {
      label: 'Tasa de Éxito en Provocación Oral',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    action_plan_compliance: {
      label: 'Cumplimiento de Planes de Acción',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    outgrowth_rate: {
      label: 'Tasa de Superación de Alergia',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    anaphylaxis_event_rate: {
      label: 'Tasa de Eventos de Anafilaxia',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    nutritional_adequacy: {
      label: 'Adecuación Nutricional',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    parent_education_completion: {
      label: 'Completación de Educación a Padres',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'oral_food_challenge',
      'prick_test',
      'control_dieta_eliminacion',
      'plan_accion_escolar',
      'evaluacion_marcha_atopica',
      'control_crecimiento',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_alergia_pediatrica',
      'evaluacion_alergia_alimentaria',
      'protocolo_oral_food_challenge',
      'plan_accion_escolar',
      'seguimiento_marcha_atopica',
      'evaluacion_nutricional',
      'plan_dieta_eliminacion',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresFoodAllergyTracking: true,
      supportsAtopicMarchMonitoring: true,
      requiresSchoolActionPlans: true,
      supportsOralFoodChallenges: true,
      tracksNutritionalAdequacy: true,
      requiresGrowthMonitoring: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ALERGOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Alérgenos alimentarios pediátricos más comunes (Big 8 + regional)
 */
export const PEDIATRIC_FOOD_ALLERGENS = [
  { key: 'cow_milk', label: 'Leche de Vaca', prevalence: 'Más común en lactantes (2-3%)', outgrowthAge: '80% a los 5 años' },
  { key: 'egg', label: 'Huevo', prevalence: 'Muy común (1-2%)', outgrowthAge: '70% a los 6 años' },
  { key: 'peanut', label: 'Maní', prevalence: 'Común (1-2%)', outgrowthAge: '20% superan, mayoría persiste' },
  { key: 'tree_nuts', label: 'Frutos Secos', prevalence: 'Moderado (0.5-1%)', outgrowthAge: 'Generalmente persiste' },
  { key: 'wheat', label: 'Trigo', prevalence: 'Moderado', outgrowthAge: '65% a los 12 años' },
  { key: 'soy', label: 'Soja', prevalence: 'Moderado', outgrowthAge: '70% a los 10 años' },
  { key: 'fish', label: 'Pescado', prevalence: 'Variable (regional)', outgrowthAge: 'Generalmente persiste' },
  { key: 'shellfish', label: 'Mariscos', prevalence: 'Variable (regional)', outgrowthAge: 'Generalmente persiste' },
] as const;

/**
 * Etapas de la Marcha Atópica
 */
export const ATOPIC_MARCH_STAGES = [
  { stage: 1, label: 'Dermatitis Atópica', ageOnset: '0-6 meses', prevalence: '15-20%', description: 'Primera manifestación típica' },
  { stage: 2, label: 'Alergia Alimentaria', ageOnset: '6-12 meses', prevalence: '6-8%', description: 'Frecuentemente leche y huevo' },
  { stage: 3, label: 'Asma', ageOnset: '3-7 años', prevalence: '8-10%', description: 'Hiperreactividad bronquial alérgica' },
  { stage: 4, label: 'Rinitis Alérgica', ageOnset: '7-15 años', prevalence: '20-30%', description: 'Frecuentemente polen y ácaros' },
] as const;

/**
 * Protocolo de Oral Food Challenge (OFC) — fases de dosificación
 */
export const OFC_DOSE_PROTOCOL = [
  { step: 1, dose: 'Contacto labial', waitMinutes: 15, description: 'Tocar labio con el alimento' },
  { step: 2, dose: '1/100 de porción', waitMinutes: 15, description: 'Dosis inicial mínima' },
  { step: 3, dose: '1/10 de porción', waitMinutes: 15, description: 'Incremento gradual' },
  { step: 4, dose: '1/4 de porción', waitMinutes: 15, description: 'Cuarto de porción' },
  { step: 5, dose: '1/2 de porción', waitMinutes: 15, description: 'Media porción' },
  { step: 6, dose: '1 porción completa', waitMinutes: 120, description: 'Porción completa, observación extendida' },
] as const;
