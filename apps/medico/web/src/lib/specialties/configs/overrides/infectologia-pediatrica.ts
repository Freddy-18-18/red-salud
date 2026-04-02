/**
 * @file overrides/infectologia-pediatrica.ts
 * @description Override de configuración para Infectología Pediátrica.
 *
 * Combina Pediatría + Infectología: módulos especializados para el
 * manejo de infecciones en pacientes pediátricos, incluyendo
 * antibiogramas, esquemas antibióticos, cultivos, serologías,
 * vacunación de inmunocomprometidos y aislamiento.
 *
 * También exporta constantes de dominio: infecciones pediátricas comunes,
 * categorías de antibióticos y tipos de aislamiento.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Infectología Pediátrica.
 * Especialidad con módulos clínicos especializados para infecciones en niños.
 */
export const infectologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'infectologia-pediatrica',
  dashboardPath: '/dashboard/medico/infectologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'infecto-pedi-consulta',
        label: 'Consulta Infectológica Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/infectologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['infection_cure_rate', 'avg_treatment_days'],
      },
      {
        key: 'infecto-pedi-antibiograma',
        label: 'Antibiograma y Sensibilidad',
        icon: 'FlaskConical',
        route: '/dashboard/medico/infectologia-pediatrica/antibiograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['antibiotic_compliance', 'culture_turnaround'],
      },
      {
        key: 'infecto-pedi-esquema-antibiotico',
        label: 'Esquemas Antibióticos',
        icon: 'Pill',
        route: '/dashboard/medico/infectologia-pediatrica/esquema-antibiotico',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['antibiotic_compliance', 'avg_treatment_days'],
      },
      {
        key: 'infecto-pedi-vacunacion',
        label: 'Vacunación Especial',
        icon: 'Syringe',
        route: '/dashboard/medico/infectologia-pediatrica/vacunacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['vaccination_coverage'],
      },
      {
        key: 'infecto-pedi-aislamiento',
        label: 'Precauciones de Aislamiento',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/infectologia-pediatrica/aislamiento',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['readmission_rate'],
      },
      {
        key: 'infecto-pedi-crecimiento',
        label: 'Crecimiento y Desarrollo',
        icon: 'TrendingUp',
        route: '/dashboard/medico/infectologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'infecto-pedi-cultivos',
        label: 'Cultivos y PCR',
        icon: 'Microscope',
        route: '/dashboard/medico/infectologia-pediatrica/cultivos',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['culture_turnaround'],
      },
      {
        key: 'infecto-pedi-serologias',
        label: 'Serologías',
        icon: 'TestTube',
        route: '/dashboard/medico/infectologia-pediatrica/serologias',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'infecto-pedi-hemocultivos',
        label: 'Hemocultivos',
        icon: 'Droplets',
        route: '/dashboard/medico/infectologia-pediatrica/hemocultivos',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['culture_turnaround'],
      },
    ],

    technology: [
      {
        key: 'infecto-pedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/infectologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'infecto-pedi-guias',
        label: 'Guías Clínicas',
        icon: 'BookOpen',
        route: '/dashboard/medico/infectologia-pediatrica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'active-infections',
      component: '@/components/dashboard/medico/infectologia-pediatrica/widgets/active-infections-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'pending-cultures',
      component: '@/components/dashboard/medico/infectologia-pediatrica/widgets/pending-cultures-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'antibiotic-regimens',
      component: '@/components/dashboard/medico/infectologia-pediatrica/widgets/antibiotic-regimens-widget',
      size: 'medium',
      required: true,
    },
  ],

  prioritizedKpis: [
    'infection_cure_rate',
    'antibiotic_compliance',
    'culture_turnaround',
    'vaccination_coverage',
    'readmission_rate',
    'avg_treatment_days',
  ],

  kpiDefinitions: {
    infection_cure_rate: {
      label: 'Tasa de Resolución de Infecciones',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    antibiotic_compliance: {
      label: 'Adherencia a Esquemas Antibióticos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    culture_turnaround: {
      label: 'Tiempo Promedio Resultados de Cultivos',
      format: 'duration',
      goal: 48,
      direction: 'lower_is_better',
    },
    vaccination_coverage: {
      label: 'Cobertura de Vacunación Especial',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    readmission_rate: {
      label: 'Tasa de Reingresos por Infección',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    avg_treatment_days: {
      label: 'Días Promedio de Tratamiento',
      format: 'number',
      goal: 10,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_infectologica',
      'seguimiento_infeccion',
      'revision_cultivos',
      'ajuste_antibioticos',
      'vacunacion_especial',
      'control_aislamiento',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_infecciosa',
      'examen_fisico_pediatrico',
      'antibiograma',
      'esquema_antibiotico',
      'precauciones_aislamiento',
      'plan_tratamiento_infeccioso',
      'consentimiento_padres',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresAgeGroupTracking: true,
      usesGrowthPercentiles: true,
      tracksCultureResults: true,
      requiresAntibioticStewardship: true,
      tracksIsolationPrecautions: true,
      usesPediatricDosage: true,
      requiresParentalConsent: true,
    },
  },

  theme: {
    primaryColor: '#10B981',
    accentColor: '#34D399',
    icon: 'Bug',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — INFECTOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Infecciones pediátricas comunes
 */
export const COMMON_PEDIATRIC_INFECTIONS = [
  { key: 'otitis_media', label: 'Otitis Media Aguda', icd11: 'AB20' },
  { key: 'faringoamigdalitis', label: 'Faringoamigdalitis', icd11: 'CA03' },
  { key: 'neumonia_adquirida', label: 'Neumonía Adquirida en la Comunidad', icd11: 'CA40' },
  { key: 'bronquiolitis', label: 'Bronquiolitis', icd11: 'CA41' },
  { key: 'itu', label: 'Infección del Tracto Urinario', icd11: 'GC08' },
  { key: 'gastroenteritis', label: 'Gastroenteritis Aguda', icd11: 'DA63' },
  { key: 'celulitis', label: 'Celulitis', icd11: 'EB60' },
  { key: 'meningitis', label: 'Meningitis Bacteriana', icd11: '1D01' },
  { key: 'sepsis_neonatal', label: 'Sepsis Neonatal', icd11: 'KA61' },
  { key: 'varicela', label: 'Varicela', icd11: '1E90' },
  { key: 'dengue', label: 'Dengue', icd11: '1D20' },
  { key: 'tuberculosis', label: 'Tuberculosis Pulmonar', icd11: '1B10' },
  { key: 'vih_pediatrico', label: 'VIH Pediátrico', icd11: '1C60' },
  { key: 'hepatitis_a', label: 'Hepatitis A', icd11: '1E50' },
  { key: 'impetigo', label: 'Impétigo', icd11: '1B70' },
];

/**
 * Categorías de antibióticos usados en pediatría
 */
export const ANTIBIOTIC_CATEGORIES = {
  penicilinas: {
    label: 'Penicilinas',
    agents: [
      'Amoxicilina',
      'Amoxicilina/Ácido Clavulánico',
      'Ampicilina',
      'Ampicilina/Sulbactam',
      'Penicilina Benzatínica',
      'Oxacilina',
      'Piperacilina/Tazobactam',
    ],
  },
  cefalosporinas: {
    label: 'Cefalosporinas',
    agents: [
      'Cefalexina',
      'Cefazolina',
      'Cefuroxima',
      'Ceftriaxona',
      'Cefotaxima',
      'Ceftazidima',
      'Cefepime',
    ],
  },
  macrolidos: {
    label: 'Macrólidos',
    agents: ['Azitromicina', 'Claritromicina', 'Eritromicina'],
  },
  aminoglucosidos: {
    label: 'Aminoglucósidos',
    agents: ['Gentamicina', 'Amikacina', 'Tobramicina'],
  },
  carbapenemes: {
    label: 'Carbapenemes',
    agents: ['Meropenem', 'Imipenem/Cilastatina', 'Ertapenem'],
  },
  glucopeptidos: {
    label: 'Glucopéptidos',
    agents: ['Vancomicina', 'Teicoplanina'],
  },
  antivirales: {
    label: 'Antivirales',
    agents: ['Aciclovir', 'Oseltamivir', 'Ganciclovir'],
  },
  antifungicos: {
    label: 'Antifúngicos',
    agents: ['Fluconazol', 'Anfotericina B', 'Caspofungina', 'Voriconazol'],
  },
};

/**
 * Tipos de aislamiento hospitalario
 */
export const ISOLATION_TYPES = {
  contact: {
    key: 'contact',
    label: 'Aislamiento de Contacto',
    description: 'Guantes y bata para contacto directo con el paciente o superficies',
    icon: 'Hand',
    color: '#EAB308',
    examples: ['SAMR', 'C. difficile', 'Rotavirus', 'Impétigo', 'Sarna'],
    ppe: ['guantes', 'bata'],
  },
  droplet: {
    key: 'droplet',
    label: 'Aislamiento por Gotas',
    description: 'Mascarilla quirúrgica al entrar en la habitación del paciente',
    icon: 'Droplets',
    color: '#3B82F6',
    examples: ['Influenza', 'Parotiditis', 'Rubeola', 'Meningococo', 'Tos ferina'],
    ppe: ['mascarilla_quirurgica', 'guantes', 'bata'],
  },
  airborne: {
    key: 'airborne',
    label: 'Aislamiento por Vía Aérea',
    description: 'Respirador N95 y habitación con presión negativa',
    icon: 'Wind',
    color: '#EF4444',
    examples: ['Tuberculosis', 'Varicela', 'Sarampión', 'COVID-19'],
    ppe: ['respirador_n95', 'guantes', 'bata', 'proteccion_ocular'],
  },
};
