/**
 * @file overrides/genetica-medica.ts
 * @description Override de configuración para Genética Médica.
 *
 * Módulos especializados: construcción de pedigrí, seguimiento
 * de pruebas genéticas, clasificación de variantes (ACMG),
 * notas de asesoramiento genético, tamizaje de portadores,
 * genética prenatal, farmacogenómica.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const geneticaMedicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'genetica-medica',
  dashboardPath: '/dashboard/medico/genetica-medica',

  modules: {
    clinical: [
      {
        key: 'genet-consulta',
        label: 'Consulta de Genética',
        icon: 'Stethoscope',
        route: '/dashboard/medico/genetica-medica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'genet-pedigri',
        label: 'Construcción de Pedigrí',
        icon: 'GitBranch',
        route: '/dashboard/medico/genetica-medica/pedigri',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'genet-pruebas',
        label: 'Seguimiento de Pruebas Genéticas',
        icon: 'Dna',
        route: '/dashboard/medico/genetica-medica/pruebas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['diagnostic_yield_rate'],
      },
      {
        key: 'genet-variantes',
        label: 'Clasificación de Variantes (ACMG)',
        icon: 'Filter',
        route: '/dashboard/medico/genetica-medica/variantes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'genet-asesoramiento',
        label: 'Asesoramiento Genético',
        icon: 'MessageCircle',
        route: '/dashboard/medico/genetica-medica/asesoramiento',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['counseling_completion_rate'],
      },
      {
        key: 'genet-portadores',
        label: 'Tamizaje de Portadores',
        icon: 'Users',
        route: '/dashboard/medico/genetica-medica/portadores',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'genet-prenatal',
        label: 'Genética Prenatal',
        icon: 'Baby',
        route: '/dashboard/medico/genetica-medica/prenatal',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'genet-farmacogenomica',
        label: 'Farmacogenómica',
        icon: 'Pill',
        route: '/dashboard/medico/genetica-medica/farmacogenomica',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'genet-cariotipo',
        label: 'Cariotipo / FISH',
        icon: 'Microscope',
        route: '/dashboard/medico/genetica-medica/cariotipo',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'genet-ngs',
        label: 'Secuenciación (NGS / Exoma)',
        icon: 'Database',
        route: '/dashboard/medico/genetica-medica/ngs',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'genet-microarray',
        label: 'Microarray / CGH',
        icon: 'Grid3x3',
        route: '/dashboard/medico/genetica-medica/microarray',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'genet-bases-datos',
        label: 'Bases de Datos Genéticas',
        icon: 'Search',
        route: '/dashboard/medico/genetica-medica/bases-datos',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'genet-calculadoras',
        label: 'Calculadoras de Riesgo Genético',
        icon: 'Calculator',
        route: '/dashboard/medico/genetica-medica/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'genet-cascada',
        label: 'Testeo en Cascada Familiar',
        icon: 'Share2',
        route: '/dashboard/medico/genetica-medica/cascada',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['cascade_testing_rate'],
      },
      {
        key: 'genet-remisiones',
        label: 'Remisiones',
        icon: 'ExternalLink',
        route: '/dashboard/medico/genetica-medica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'genet-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/genetica-medica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'genetic-test-pipeline',
      component: '@/components/dashboard/medico/genetica-medica/widgets/genetic-test-pipeline-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'variant-classification-summary',
      component: '@/components/dashboard/medico/genetica-medica/widgets/variant-classification-summary-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'cascade-testing-tracker',
      component: '@/components/dashboard/medico/genetica-medica/widgets/cascade-testing-tracker-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'diagnostic_yield_rate',
    'counseling_completion_rate',
    'cascade_testing_rate',
    'variant_classification_turnaround',
    'prenatal_testing_volume',
    'pharmacogenomic_consultations',
  ],

  kpiDefinitions: {
    diagnostic_yield_rate: {
      label: 'Rendimiento Diagnóstico',
      format: 'percentage',
      goal: 0.35,
      direction: 'higher_is_better',
    },
    counseling_completion_rate: {
      label: 'Completación de Asesoramiento',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    cascade_testing_rate: {
      label: 'Tasa de Testeo en Cascada',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    variant_classification_turnaround: {
      label: 'Tiempo de Clasificación de Variantes',
      format: 'duration',
      direction: 'lower_is_better',
    },
    prenatal_testing_volume: {
      label: 'Volumen de Pruebas Prenatales',
      format: 'number',
      direction: 'higher_is_better',
    },
    pharmacogenomic_consultations: {
      label: 'Consultas Farmacogenómicas',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'asesoramiento_genetico',
      'resultado_prueba',
      'seguimiento',
      'prenatal',
      'portadores',
      'farmacogenomica',
      'testeo_cascada',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_genetica',
      'pedigri',
      'asesoramiento_pre_test',
      'asesoramiento_post_test',
      'clasificacion_variantes',
      'nota_farmacogenomica',
      'consentimiento_prueba_genetica',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresPedigreeConstruction: true,
      supportsACMGClassification: true,
      tracksGeneticTests: true,
      requiresCounseling: true,
      supportsCarrierScreening: true,
      supportsPrenatalGenetics: true,
      supportsPharmacogenomics: true,
    },
  },

  theme: {
    primaryColor: '#7C3AED',
    accentColor: '#5B21B6',
    icon: 'Dna',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE GENÉTICA MÉDICA
// ============================================================================

/**
 * Clasificación de variantes ACMG/AMP (2015)
 */
export const ACMG_VARIANT_CLASSIFICATION = [
  { class: 5, label: 'Patogénica', abbreviation: 'P', actionable: true, color: '#EF4444' },
  { class: 4, label: 'Probablemente Patogénica', abbreviation: 'LP', actionable: true, color: '#F97316' },
  { class: 3, label: 'Significado Incierto (VUS)', abbreviation: 'VUS', actionable: false, color: '#F59E0B' },
  { class: 2, label: 'Probablemente Benigna', abbreviation: 'LB', actionable: false, color: '#22C55E' },
  { class: 1, label: 'Benigna', abbreviation: 'B', actionable: false, color: '#3B82F6' },
] as const;

/**
 * Tipos de pruebas genéticas
 */
export const GENETIC_TEST_TYPES = [
  { key: 'karyotype', label: 'Cariotipo', turnaround: '7-14 días', resolution: 'Cromosómica' },
  { key: 'fish', label: 'FISH', turnaround: '2-5 días', resolution: 'Cromosómica dirigida' },
  { key: 'cma', label: 'Microarray Cromosómico (CMA)', turnaround: '14-21 días', resolution: '50-100 kb' },
  { key: 'gene_panel', label: 'Panel de Genes', turnaround: '4-8 semanas', resolution: 'Exónica' },
  { key: 'wes', label: 'Exoma Completo (WES)', turnaround: '8-16 semanas', resolution: 'Exónica global' },
  { key: 'wgs', label: 'Genoma Completo (WGS)', turnaround: '12-16 semanas', resolution: 'Genómica' },
  { key: 'methylation', label: 'Análisis de Metilación', turnaround: '3-6 semanas', resolution: 'Epigenética' },
] as const;
