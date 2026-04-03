/**
 * @file overrides/alergologia.ts
 * @description Override de configuración para Alergología.
 *
 * Módulos especializados: resultados de prick test, paneles de IgE
 * específica, seguimiento de inmunoterapia (desensibilización),
 * correlación con asma, planes de acción para anafilaxia,
 * registros de food challenges.
 *
 * También exporta constantes de dominio: paneles de alérgenos,
 * escalas de severidad, tipos de inmunoterapia.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Alergología.
 * Especialidad centrada en diagnóstico y tratamiento de enfermedades alérgicas.
 */
export const alergologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'alergologia',
  dashboardPath: '/dashboard/medico/alergologia',

  modules: {
    clinical: [
      {
        key: 'alergo-consulta',
        label: 'Consulta Alergológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/alergologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'alergo-prick-test',
        label: 'Pruebas Cutáneas (Prick Test)',
        icon: 'Target',
        route: '/dashboard/medico/alergologia/prick-test',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Resultados de prick test, intradermorreacción, lectura inmediata y tardía',
      },
      {
        key: 'alergo-ige-paneles',
        label: 'Paneles de IgE Específica',
        icon: 'FlaskConical',
        route: '/dashboard/medico/alergologia/ige-paneles',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'IgE específica, componentes moleculares (CRD), perfiles de sensibilización',
      },
      {
        key: 'alergo-inmunoterapia',
        label: 'Inmunoterapia / Desensibilización',
        icon: 'Syringe',
        route: '/dashboard/medico/alergologia/inmunoterapia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Esquema de desensibilización subcutánea/sublingual, dosis, reacciones',
        kpiKeys: ['immunotherapy_completion_rate'],
      },
      {
        key: 'alergo-asma',
        label: 'Correlación Asma-Alergia',
        icon: 'Wind',
        route: '/dashboard/medico/alergologia/asma',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Control de asma alérgica, espirometría, ACT score, step therapy',
        kpiKeys: ['symptom_reduction_rate'],
      },
      {
        key: 'alergo-anafilaxia',
        label: 'Planes de Acción Anafilaxia',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/alergologia/anafilaxia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Planes personalizados, prescripción de autoinyectores, educación',
        kpiKeys: ['anaphylaxis_prevention_rate'],
      },
      {
        key: 'alergo-food-challenge',
        label: 'Provocación Alimentaria',
        icon: 'Apple',
        route: '/dashboard/medico/alergologia/food-challenge',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Provocación oral controlada, protocolo escalonado, registro de reacciones',
      },
    ],

    lab: [
      {
        key: 'alergo-laboratorio',
        label: 'Laboratorio Alergológico',
        icon: 'TestTube',
        route: '/dashboard/medico/alergologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'IgE total, eosinófilos, triptasa, complemento',
      },
      {
        key: 'alergo-espirometria',
        label: 'Espirometría y Funcional Respiratorio',
        icon: 'Activity',
        route: '/dashboard/medico/alergologia/espirometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'alergo-patch-test',
        label: 'Pruebas de Parche (Contacto)',
        icon: 'SquareStack',
        route: '/dashboard/medico/alergologia/patch-test',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Pruebas epicutáneas para dermatitis de contacto, lectura 48/96h',
      },
    ],

    technology: [
      {
        key: 'alergo-calculadoras',
        label: 'Calculadoras Alergológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/alergologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'ACT score, riesgo de anafilaxia, dosis de inmunoterapia',
      },
    ],

    communication: [
      {
        key: 'alergo-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/alergologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'alergo-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/alergologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'alergo-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/alergologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'immunotherapy-tracking',
      component: '@/components/dashboard/medico/alergologia/widgets/immunotherapy-tracking-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'allergen-sensitization-profile',
      component: '@/components/dashboard/medico/alergologia/widgets/allergen-sensitization-profile-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'anaphylaxis-action-plans',
      component: '@/components/dashboard/medico/alergologia/widgets/anaphylaxis-action-plans-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'prick-test-results',
      component: '@/components/dashboard/medico/alergologia/widgets/prick-test-results-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'immunotherapy_completion_rate',
    'symptom_reduction_rate',
    'anaphylaxis_prevention_rate',
    'prick_test_sensitivity',
    'asthma_control_rate',
    'food_challenge_safety',
  ],

  kpiDefinitions: {
    immunotherapy_completion_rate: {
      label: 'Tasa de Completación de Inmunoterapia',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    symptom_reduction_rate: {
      label: 'Tasa de Reducción de Síntomas',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    anaphylaxis_prevention_rate: {
      label: 'Tasa de Prevención de Anafilaxia',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    prick_test_sensitivity: {
      label: 'Sensibilidad de Prick Test',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    asthma_control_rate: {
      label: 'Tasa de Control de Asma',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    food_challenge_safety: {
      label: 'Seguridad en Provocación Alimentaria',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'prick_test',
      'sesion_inmunoterapia',
      'provocacion_alimentaria',
      'evaluacion_asma',
      'patch_test',
      'control_anafilaxia',
      'espirometria',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_alergologica',
      'examen_alergologico',
      'informe_prick_test',
      'protocolo_inmunoterapia',
      'plan_accion_anafilaxia',
      'protocolo_provocacion_alimentaria',
      'evaluacion_asma',
      'informe_patch_test',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresPrickTestRecording: true,
      supportsImmunotherapyProtocols: true,
      requiresAnaphylaxisPlans: true,
      supportsFoodChallenges: true,
      tracksAllergenPanels: true,
      supportsAsthmaCorrelation: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO ALERGOLÓGICO
// ============================================================================

/**
 * Paneles de alérgenos comunes
 */
export const ALLERGEN_PANELS = [
  { key: 'inhalants', label: 'Aeroalérgenos', allergens: ['Ácaros (D. pteronyssinus, D. farinae)', 'Epitelios (gato, perro)', 'Pólenes (gramíneas, árboles, malezas)', 'Hongos (Alternaria, Aspergillus, Cladosporium)'] },
  { key: 'foods', label: 'Alimentos', allergens: ['Leche de vaca', 'Huevo', 'Trigo', 'Soja', 'Frutos secos', 'Mariscos', 'Pescado', 'Maní'] },
  { key: 'venoms', label: 'Venenos de Himenópteros', allergens: ['Abeja (Apis mellifera)', 'Avispa (Vespula, Polistes)', 'Hormiga de fuego'] },
  { key: 'drugs', label: 'Medicamentos', allergens: ['Betalactámicos', 'AINES', 'Anestésicos locales', 'Medios de contraste'] },
  { key: 'latex', label: 'Látex', allergens: ['Látex natural (Hevea brasiliensis)', 'Reactividad cruzada con frutas (banana, kiwi, aguacate)'] },
] as const;

/**
 * Grados de severidad de reacción alérgica
 */
export const ALLERGIC_REACTION_GRADES = [
  { grade: 1, label: 'Leve', symptoms: 'Urticaria localizada, prurito, rinitis', treatment: 'Antihistamínico oral' },
  { grade: 2, label: 'Moderada', symptoms: 'Urticaria generalizada, angioedema, asma leve', treatment: 'Antihistamínico + corticoide, observación' },
  { grade: 3, label: 'Severa (Anafilaxia)', symptoms: 'Broncoespasmo severo, hipotensión, compromiso cardiovascular', treatment: 'Epinefrina IM inmediata + emergencia' },
  { grade: 4, label: 'Paro Cardiorrespiratorio', symptoms: 'Colapso cardiovascular, arritmia, paro respiratorio', treatment: 'RCP + epinefrina + soporte vital avanzado' },
] as const;

/**
 * Tipos de inmunoterapia
 */
export const IMMUNOTHERAPY_TYPES = [
  { key: 'scit', label: 'Subcutánea (SCIT)', route: 'Inyección subcutánea', buildup: '3-6 meses', maintenance: '3-5 años' },
  { key: 'slit_drops', label: 'Sublingual Gotas (SLIT)', route: 'Gotas sublinguales diarias', buildup: '1-2 semanas', maintenance: '3-5 años' },
  { key: 'slit_tablets', label: 'Sublingual Tabletas', route: 'Tableta sublingual diaria', buildup: 'Dosis fija desde inicio', maintenance: '3-5 años' },
  { key: 'venom_it', label: 'Inmunoterapia con Veneno', route: 'Inyección subcutánea', buildup: '2-3 meses', maintenance: '3-5 años' },
  { key: 'oit', label: 'Oral (OIT) — Alimentos', route: 'Ingestión oral escalonada', buildup: '6-12 meses', maintenance: 'Indefinida' },
] as const;
