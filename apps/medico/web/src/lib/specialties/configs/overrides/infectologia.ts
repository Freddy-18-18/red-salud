/**
 * @file overrides/infectologia.ts
 * @description Override de configuración para Infectología (Adultos).
 *
 * Manejo de enfermedades infecciosas — antibiograma, stewardship
 * antimicrobiano, VIH (carga viral, CD4), tuberculosis (DOT),
 * medicina del viajero, control de infecciones.
 *
 * También exporta constantes de dominio: categorías de antimicrobianos,
 * esquemas ARV, clasificación CDC de VIH.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Infectología (Adultos).
 * Especialidad médica con módulos clínicos, de laboratorio y epidemiología.
 */
export const infectologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'infectologia',
  dashboardPath: '/dashboard/medico/infectologia',

  modules: {
    clinical: [
      {
        key: 'infecto-consulta',
        label: 'Consulta de Infectología',
        icon: 'Stethoscope',
        route: '/dashboard/medico/infectologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'SOAP infectológico, síndromes febriles, foco infeccioso',
      },
      {
        key: 'infecto-antibiograma',
        label: 'Antibiogramas',
        icon: 'TestTubes',
        route: '/dashboard/medico/infectologia/antibiograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['antibiotic_appropriateness'],
        description: 'Cultivos, sensibilidad, resistencia, MIC, interpretación',
      },
      {
        key: 'infecto-stewardship',
        label: 'Stewardship Antimicrobiano',
        icon: 'ShieldCheck',
        route: '/dashboard/medico/infectologia/stewardship',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Optimización de uso de antibióticos, de-escalación, auditoría',
      },
      {
        key: 'infecto-vih',
        label: 'Manejo de VIH',
        icon: 'Activity',
        route: '/dashboard/medico/infectologia/vih',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['viral_suppression_rate'],
        description: 'Carga viral, CD4, TAR, resistencia, profilaxis oportunista',
      },
      {
        key: 'infecto-tuberculosis',
        label: 'Tuberculosis y DOT',
        icon: 'Wind',
        route: '/dashboard/medico/infectologia/tuberculosis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Diagnóstico, esquemas, tratamiento directamente observado, MDR-TB',
      },
      {
        key: 'infecto-viajero',
        label: 'Medicina del Viajero',
        icon: 'Plane',
        route: '/dashboard/medico/infectologia/viajero',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Profilaxis, vacunación, fiebre post-viaje, enfermedades tropicales',
      },
      {
        key: 'infecto-control',
        label: 'Control de Infecciones',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/infectologia/control',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['mdr_rate'],
        description: 'Vigilancia nosocomial, brotes, aislamiento, higiene de manos',
      },
    ],

    laboratory: [
      {
        key: 'infecto-laboratorio',
        label: 'Microbiología',
        icon: 'FlaskConical',
        route: '/dashboard/medico/infectologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Cultivos, hemocultivos, urocultivos, PCR, serologías',
      },
      {
        key: 'infecto-molecular',
        label: 'Diagnóstico Molecular',
        icon: 'Dna',
        route: '/dashboard/medico/infectologia/molecular',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'PCR viral, genotipificación, resistencia molecular',
      },
      {
        key: 'infecto-imagenologia',
        label: 'Imagenología',
        icon: 'Scan',
        route: '/dashboard/medico/infectologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Rx tórax, TC, RM, ecografía — localización de foco',
      },
    ],

    financial: [
      {
        key: 'infecto-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/infectologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'infecto-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/infectologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'infecto-calculadoras',
        label: 'Calculadoras Infectológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/infectologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Dosis ajustada de aminoglucósidos, vancomicina, CrCl',
      },
      {
        key: 'infecto-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/infectologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'IDSA, OMS, GESIDA, Sanford — guías de tratamiento',
      },
      {
        key: 'infecto-interacciones',
        label: 'Interacciones Antimicrobianas',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/infectologia/interacciones',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'Interacciones ARV, antimicóticos, QT prolongación',
      },
    ],

    communication: [
      {
        key: 'infecto-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/infectologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'infecto-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/infectologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'infecto-analytics',
        label: 'Análisis Epidemiológico',
        icon: 'TrendingUp',
        route: '/dashboard/medico/infectologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'antibiogram-alerts',
      component: '@/components/dashboard/medico/infectologia/widgets/antibiogram-alerts-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hiv-dashboard',
      component: '@/components/dashboard/medico/infectologia/widgets/hiv-dashboard-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'stewardship-metrics',
      component: '@/components/dashboard/medico/infectologia/widgets/stewardship-metrics-widget',
      size: 'medium',
    },
    {
      key: 'mdr-surveillance',
      component: '@/components/dashboard/medico/infectologia/widgets/mdr-surveillance-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'antibiotic_appropriateness',
    'viral_suppression_rate',
    'mdr_rate',
    'stewardship_deescalation_rate',
    'tb_treatment_completion',
    'nosocomial_infection_rate',
  ],

  kpiDefinitions: {
    antibiotic_appropriateness: {
      label: 'Adecuación de Antibióticos',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    viral_suppression_rate: {
      label: 'Supresión Viral VIH (< 50 copias)',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    mdr_rate: {
      label: 'Tasa de Multirresistencia',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    stewardship_deescalation_rate: {
      label: 'Tasa de De-escalación',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    tb_treatment_completion: {
      label: 'Completación Tratamiento TB',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    nosocomial_infection_rate: {
      label: 'Tasa de Infección Nosocomial',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_vih',
      'seguimiento_tb',
      'interconsulta_hospitalaria',
      'stewardship',
      'consulta_viajero',
      'control_infeccion',
      'urgencia_infectologica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_infectologica',
      'evaluacion_sindrome_febril',
      'protocolo_vih',
      'protocolo_tuberculosis',
      'auditoria_antibioticos',
      'nota_stewardship',
      'evaluacion_viajero',
      'reporte_brote',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksAntibiograms: true,
      requiresAntimicrobialStewardship: true,
      tracksHIVViralLoad: true,
      tracksTBManagement: true,
      supportsTravelMedicine: true,
      tracksInfectionControl: true,
      tracksMDROrganisms: true,
    },
  },

  theme: {
    primaryColor: '#10B981',
    accentColor: '#047857',
    icon: 'Bug',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — INFECTOLOGÍA
// ============================================================================

/**
 * Categorías de antimicrobianos para stewardship.
 */
export const ANTIMICROBIAL_CATEGORIES = [
  { key: 'betalactams', label: 'Beta-lactámicos', examples: ['Amoxicilina', 'Ampicilina/Sulbactam', 'Pip/Tazo', 'Ceftriaxona', 'Meropenem'] },
  { key: 'quinolones', label: 'Quinolonas', examples: ['Ciprofloxacina', 'Levofloxacina', 'Moxifloxacina'], restriction: 'Uso restringido — requiere justificación' },
  { key: 'glycopeptides', label: 'Glucopéptidos', examples: ['Vancomicina', 'Teicoplanina'], restriction: 'Requiere autorización de infectología' },
  { key: 'carbapenems', label: 'Carbapenémicos', examples: ['Meropenem', 'Imipenem', 'Ertapenem'], restriction: 'Reserva — requiere autorización' },
  { key: 'aminoglycosides', label: 'Aminoglucósidos', examples: ['Gentamicina', 'Amikacina', 'Tobramicina'], restriction: 'Monitoreo de niveles requerido' },
  { key: 'antifungals', label: 'Antifúngicos', examples: ['Fluconazol', 'Voriconazol', 'Anfotericina B', 'Caspofungina'] },
  { key: 'antivirals', label: 'Antivirales', examples: ['Aciclovir', 'Oseltamivir', 'Ganciclovir'] },
] as const;

/**
 * Clasificación CDC de infección por VIH (2014).
 */
export const CDC_HIV_CLASSIFICATION = {
  stages: [
    { stage: 0, label: 'Estadio 0', description: 'Infección temprana (< 6 meses desde diagnóstico negativo previo)' },
    { stage: 1, label: 'Estadio 1', description: 'CD4 ≥ 500 células/μL, sin condiciones definitorias de SIDA' },
    { stage: 2, label: 'Estadio 2', description: 'CD4 200-499 células/μL, sin condiciones definitorias de SIDA' },
    { stage: 3, label: 'Estadio 3 (SIDA)', description: 'CD4 < 200 células/μL o condición definitoria de SIDA' },
  ],
  viralLoadTargets: [
    { key: 'suppressed', label: 'Suprimida', threshold: '< 50 copias/mL' },
    { key: 'low_level', label: 'Viremia de bajo nivel', threshold: '50-199 copias/mL' },
    { key: 'detectable', label: 'Detectable', threshold: '200-999 copias/mL' },
    { key: 'failure', label: 'Fallo virológico', threshold: '≥ 1,000 copias/mL' },
  ],
} as const;

/**
 * Esquemas de tratamiento de tuberculosis (OMS, primera línea).
 */
export const TB_TREATMENT_SCHEMES = [
  { key: 'new_case', label: 'Caso Nuevo (2HRZE/4HR)', phases: [
    { phase: 'intensiva', duration: '2 meses', drugs: ['Isoniazida (H)', 'Rifampicina (R)', 'Pirazinamida (Z)', 'Etambutol (E)'] },
    { phase: 'continuacion', duration: '4 meses', drugs: ['Isoniazida (H)', 'Rifampicina (R)'] },
  ]},
  { key: 'retreatment', label: 'Retratamiento (2HRZES/1HRZE/5HRE)', phases: [
    { phase: 'intensiva_1', duration: '2 meses', drugs: ['Isoniazida', 'Rifampicina', 'Pirazinamida', 'Etambutol', 'Estreptomicina'] },
    { phase: 'intensiva_2', duration: '1 mes', drugs: ['Isoniazida', 'Rifampicina', 'Pirazinamida', 'Etambutol'] },
    { phase: 'continuacion', duration: '5 meses', drugs: ['Isoniazida', 'Rifampicina', 'Etambutol'] },
  ]},
] as const;
