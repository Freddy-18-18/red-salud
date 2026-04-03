/**
 * @file overrides/medicina-legal.ts
 * @description Override de configuración para Medicina Legal / Forense.
 *
 * Módulos especializados: documentación de lesiones (fotografía
 * forense), cadena de custodia, estimación de edad, determinación
 * de causa de muerte, informes periciales, examen de agresión
 * sexual (SAFE).
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaLegalOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-legal',
  dashboardPath: '/dashboard/medico/medicina-legal',

  modules: {
    clinical: [
      {
        key: 'forense-consulta',
        label: 'Consulta Médico-Legal',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-legal/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['cases_per_day'],
      },
      {
        key: 'forense-documentacion-lesiones',
        label: 'Documentación de Lesiones',
        icon: 'Camera',
        route: '/dashboard/medico/medicina-legal/documentacion-lesiones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['report_accuracy_rate'],
      },
      {
        key: 'forense-cadena-custodia',
        label: 'Cadena de Custodia',
        icon: 'Link',
        route: '/dashboard/medico/medicina-legal/cadena-custodia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'forense-edad',
        label: 'Estimación de Edad',
        icon: 'Calendar',
        route: '/dashboard/medico/medicina-legal/estimacion-edad',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'forense-causa-muerte',
        label: 'Determinación de Causa de Muerte',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-legal/causa-muerte',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'forense-pericial',
        label: 'Informes Periciales',
        icon: 'Scale',
        route: '/dashboard/medico/medicina-legal/pericial',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['turnaround_time'],
      },
      {
        key: 'forense-safe',
        label: 'Examen de Agresión Sexual (SAFE)',
        icon: 'ShieldCheck',
        route: '/dashboard/medico/medicina-legal/safe',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'forense-toxicologia',
        label: 'Toxicología Forense',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-legal/toxicologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'forense-histopatologia',
        label: 'Histopatología Forense',
        icon: 'Microscope',
        route: '/dashboard/medico/medicina-legal/histopatologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'forense-imagenologia',
        label: 'Imagenología Forense',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-legal/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'forense-fotografia',
        label: 'Fotografía Forense',
        icon: 'Camera',
        route: '/dashboard/medico/medicina-legal/fotografia',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'forense-plantillas',
        label: 'Plantillas de Informes Periciales',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-legal/plantillas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'forense-judicial',
        label: 'Comunicación Judicial',
        icon: 'Scale',
        route: '/dashboard/medico/medicina-legal/judicial',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'forense-autoridades',
        label: 'Coordinación con Autoridades',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-legal/autoridades',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'forense-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-legal/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'case-volume-tracker',
      component: '@/components/dashboard/medico/medicina-legal/widgets/case-volume-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'report-turnaround',
      component: '@/components/dashboard/medico/medicina-legal/widgets/report-turnaround-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'testimony-schedule',
      component: '@/components/dashboard/medico/medicina-legal/widgets/testimony-schedule-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'report_accuracy_rate',
    'court_testimony_outcomes',
    'turnaround_time',
    'chain_of_custody_compliance',
    'cases_per_month',
    'safe_exam_completion_rate',
  ],

  kpiDefinitions: {
    report_accuracy_rate: {
      label: 'Precisión de Informes',
      format: 'percentage',
      goal: 0.98,
      direction: 'higher_is_better',
    },
    court_testimony_outcomes: {
      label: 'Resultados de Testimonio en Corte',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    turnaround_time: {
      label: 'Tiempo de Entrega de Informes',
      format: 'duration',
      direction: 'lower_is_better',
    },
    chain_of_custody_compliance: {
      label: 'Cumplimiento de Cadena de Custodia',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
    cases_per_month: {
      label: 'Casos por Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
    safe_exam_completion_rate: {
      label: 'Tasa de Completación de SAFE',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_medico_legal',
      'documentacion_lesiones',
      'examen_safe',
      'estimacion_edad',
      'autopsia',
      'revision_pericial',
      'preparacion_testimonio',
    ],
    defaultDuration: 45,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'informe_lesiones',
      'certificado_defuncion',
      'protocolo_autopsia',
      'informe_pericial',
      'examen_safe',
      'cadena_custodia',
      'estimacion_edad',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: false,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresForensicPhotography: true,
      tracksChainOfCustody: true,
      supportsAgeEstimation: true,
      requiresExpertWitnessReports: true,
      supportsSAFEExam: true,
      requiresLegalDocumentation: true,
    },
  },

  theme: {
    primaryColor: '#475569',
    accentColor: '#334155',
    icon: 'Scale',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE MEDICINA LEGAL
// ============================================================================

/**
 * Clasificación de heridas según mecanismo
 */
export const WOUND_CLASSIFICATION_FORENSIC = [
  { key: 'contusion', label: 'Contusión', mechanism: 'Impacto con objeto romo', characteristics: 'Equimosis, hematoma, edema' },
  { key: 'laceration', label: 'Laceración', mechanism: 'Desgarro por fuerza roma', characteristics: 'Bordes irregulares, puentes tisulares' },
  { key: 'incision', label: 'Incisión', mechanism: 'Corte con objeto cortante', characteristics: 'Bordes limpios, mayor longitud que profundidad' },
  { key: 'stab', label: 'Herida Punzante', mechanism: 'Penetración con objeto puntiagudo', characteristics: 'Mayor profundidad que longitud' },
  { key: 'gunshot', label: 'Herida por Proyectil de Arma de Fuego', mechanism: 'Proyectil de alta/baja velocidad', characteristics: 'Orificio de entrada/salida, tatuaje, ahumamiento' },
  { key: 'abrasion', label: 'Abrasión / Excoriación', mechanism: 'Fricción contra superficie rugosa', characteristics: 'Pérdida epidérmica, dirección del movimiento' },
  { key: 'burn', label: 'Quemadura', mechanism: 'Agente térmico, químico, eléctrico', characteristics: 'Grado variable, patrón de distribución' },
] as const;

/**
 * Clasificación de causa de muerte
 */
export const MANNER_OF_DEATH = [
  { key: 'natural', label: 'Natural', description: 'Enfermedad o proceso patológico' },
  { key: 'accident', label: 'Accidental', description: 'Evento no intencional' },
  { key: 'suicide', label: 'Suicidio', description: 'Autoinfligida intencionalmente' },
  { key: 'homicide', label: 'Homicidio', description: 'Causada por otra persona intencionalmente' },
  { key: 'undetermined', label: 'Indeterminada', description: 'No puede establecerse con certeza' },
] as const;
