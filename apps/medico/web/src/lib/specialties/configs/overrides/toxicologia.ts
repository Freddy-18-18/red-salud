/**
 * @file overrides/toxicologia.ts
 * @description Override de configuración para Toxicología.
 *
 * Módulos especializados: manejo de intoxicaciones (protocolos
 * de antídotos), seguimiento de niveles de fármacos,
 * identificación de sustancias, documentación de
 * descontaminación, coordinación con centro de venenos,
 * clasificación de envenenamiento (Dart).
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const toxicologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'toxicologia',
  dashboardPath: '/dashboard/medico/toxicologia',

  modules: {
    clinical: [
      {
        key: 'toxi-consulta',
        label: 'Consulta Toxicológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/toxicologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['cases_per_day'],
      },
      {
        key: 'toxi-intoxicacion',
        label: 'Manejo de Intoxicaciones',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/toxicologia/intoxicacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['antidote_timeliness_rate'],
      },
      {
        key: 'toxi-niveles',
        label: 'Seguimiento de Niveles de Fármacos',
        icon: 'TrendingUp',
        route: '/dashboard/medico/toxicologia/niveles',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'toxi-identificacion',
        label: 'Identificación de Sustancias',
        icon: 'Search',
        route: '/dashboard/medico/toxicologia/identificacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'toxi-descontaminacion',
        label: 'Documentación de Descontaminación',
        icon: 'ShieldCheck',
        route: '/dashboard/medico/toxicologia/descontaminacion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'toxi-envenenamiento',
        label: 'Clasificación de Envenenamiento (Dart)',
        icon: 'FileText',
        route: '/dashboard/medico/toxicologia/envenenamiento',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'toxi-laboratorio',
        label: 'Panel Toxicológico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/toxicologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'toxi-gasometria',
        label: 'Gasometría / Equilibrio Ácido-Base',
        icon: 'Activity',
        route: '/dashboard/medico/toxicologia/gasometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'toxi-tamizaje',
        label: 'Tamizaje de Drogas',
        icon: 'Scan',
        route: '/dashboard/medico/toxicologia/tamizaje',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'toxi-antidotos',
        label: 'Base de Datos de Antídotos',
        icon: 'Database',
        route: '/dashboard/medico/toxicologia/antidotos',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'toxi-calculadoras',
        label: 'Calculadoras Toxicológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/toxicologia/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'toxi-centro-venenos',
        label: 'Centro de Venenos',
        icon: 'Phone',
        route: '/dashboard/medico/toxicologia/centro-venenos',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'toxi-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/toxicologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'toxi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/toxicologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'poisoning-case-tracker',
      component: '@/components/dashboard/medico/toxicologia/widgets/poisoning-case-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'antidote-inventory',
      component: '@/components/dashboard/medico/toxicologia/widgets/antidote-inventory-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'outcome-by-substance',
      component: '@/components/dashboard/medico/toxicologia/widgets/outcome-by-substance-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'antidote_timeliness_rate',
    'outcome_by_substance_survival',
    'mortality_rate',
    'decontamination_compliance',
    'poison_center_coordination_rate',
    'avg_time_to_identification',
  ],

  kpiDefinitions: {
    antidote_timeliness_rate: {
      label: 'Oportunidad de Administración de Antídoto',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    outcome_by_substance_survival: {
      label: 'Supervivencia por Sustancia',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    mortality_rate: {
      label: 'Tasa de Mortalidad',
      format: 'percentage',
      goal: 0.02,
      direction: 'lower_is_better',
    },
    decontamination_compliance: {
      label: 'Cumplimiento de Descontaminación',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    poison_center_coordination_rate: {
      label: 'Coordinación con Centro de Venenos',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    avg_time_to_identification: {
      label: 'Tiempo Promedio de Identificación',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'emergencia_intoxicacion',
      'consulta_toxicologica',
      'seguimiento_niveles',
      'evaluacion_exposicion',
      'seguimiento_envenenamiento',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: true,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_intoxicacion',
      'protocolo_antidoto',
      'descontaminacion',
      'seguimiento_niveles',
      'clasificacion_envenenamiento',
      'informe_centro_venenos',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresPoisoningManagement: true,
      tracksAntidoteProtocols: true,
      tracksDrugLevels: true,
      supportsSubstanceIdentification: true,
      requiresDecontamination: true,
      supportsPoisonCenterCoordination: true,
      supportsEnvenomationGrading: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'AlertTriangle',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE TOXICOLOGÍA
// ============================================================================

/**
 * Antídotos comunes y sus indicaciones
 */
export const COMMON_ANTIDOTES = [
  { antidote: 'N-acetilcisteína (NAC)', poison: 'Acetaminofén (Paracetamol)', route: 'IV / VO', timing: 'Idealmente < 8h post-ingesta' },
  { antidote: 'Naloxona', poison: 'Opioides', route: 'IV / IM / IN', timing: 'Inmediato' },
  { antidote: 'Flumazenil', poison: 'Benzodiacepinas', route: 'IV', timing: 'Inmediato (precaución: convulsiones)' },
  { antidote: 'Atropina + Pralidoxima', poison: 'Organofosforados', route: 'IV', timing: 'Inmediato' },
  { antidote: 'Fomepizol / Etanol', poison: 'Metanol / Etilenglicol', route: 'IV', timing: 'Inmediato' },
  { antidote: 'Deferoxamina', poison: 'Hierro', route: 'IV', timing: 'Si niveles séricos elevados' },
  { antidote: 'Glucagón', poison: 'Betabloqueantes / BCC', route: 'IV', timing: 'Inmediato' },
  { antidote: 'Fab antidigoxina', poison: 'Digoxina', route: 'IV', timing: 'Si arritmia o hiperkalemia' },
  { antidote: 'Antiveneno', poison: 'Ofidismo (serpientes)', route: 'IV', timing: 'Según gravedad del envenenamiento' },
  { antidote: 'Hidroxocobalamina', poison: 'Cianuro', route: 'IV', timing: 'Inmediato' },
] as const;

/**
 * Toxíndromes clásicos
 */
export const TOXIDROMES = [
  { key: 'anticholinergic', label: 'Anticolinérgico', signs: 'Midriasis, taquicardia, fiebre, piel seca, retención urinaria, delirium', agents: 'Atropina, antihistamínicos, antidepresivos tricíclicos' },
  { key: 'cholinergic', label: 'Colinérgico (SLUDGE)', signs: 'Salivación, lagrimeo, urinario, diarrea, GI (cólicos), emesis, miosis, bradicardia', agents: 'Organofosforados, carbamatos, pilocarpina' },
  { key: 'sympathomimetic', label: 'Simpaticomimético', signs: 'Taquicardia, hipertensión, midriasis, diaforesis, agitación, hipertermia', agents: 'Cocaína, anfetaminas, efedrina' },
  { key: 'opioid', label: 'Opioide', signs: 'Miosis, depresión respiratoria, sedación, hipotensión, bradicardia', agents: 'Morfina, heroína, fentanilo, metadona' },
  { key: 'sedative_hypnotic', label: 'Sedante-Hipnótico', signs: 'Sedación, depresión respiratoria, hipotensión, hipotermia', agents: 'Benzodiacepinas, barbitúricos, etanol' },
  { key: 'serotonin', label: 'Serotoninérgico', signs: 'Agitación, clonus, hiperreflexia, diaforesis, hipertermia, diarrea', agents: 'ISRS, IMAO, tramadol, linezolid' },
] as const;
