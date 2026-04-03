/**
 * @file overrides/oncologia-medica.ts
 * @description Override de configuración para Oncología Médica.
 *
 * Manejo del cáncer con terapias sistémicas — quimioterapia, inmunoterapia,
 * terapias dirigidas. Seguimiento de protocolos, estadificación TNM,
 * respuesta RECIST, toxicidad CTCAE, planes de supervivencia y
 * documentación de junta tumoral.
 *
 * También exporta constantes de dominio: escalas ECOG, estadificación TNM,
 * criterios RECIST, grados CTCAE.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Oncología Médica.
 * Especialidad con módulos clínicos, de laboratorio, tecnología y comunicación.
 */
export const oncologiaMedicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'oncologia-medica',
  dashboardPath: '/dashboard/medico/oncologia-medica',

  modules: {
    clinical: [
      {
        key: 'onco-consulta',
        label: 'Consulta Oncológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/oncologia-medica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP oncológico, estadificación, performance status',
      },
      {
        key: 'onco-quimioterapia',
        label: 'Protocolos de Quimioterapia',
        icon: 'FlaskConical',
        route: '/dashboard/medico/oncologia-medica/quimioterapia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['protocol_adherence_rate'],
        description: 'Esquemas QT, ciclos, dosis, ajustes, pre-medicación',
      },
      {
        key: 'onco-ecog',
        label: 'Performance Status (ECOG)',
        icon: 'Activity',
        route: '/dashboard/medico/oncologia-medica/ecog',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Seguimiento ECOG/Karnofsky, funcionalidad del paciente',
      },
      {
        key: 'onco-estadificacion',
        label: 'Estadificación TNM',
        icon: 'Layers',
        route: '/dashboard/medico/oncologia-medica/estadificacion',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Tumor, ganglios, metástasis — AJCC/UICC 8va edición',
      },
      {
        key: 'onco-respuesta',
        label: 'Evaluación de Respuesta (RECIST)',
        icon: 'BarChart3',
        route: '/dashboard/medico/oncologia-medica/respuesta',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['response_rate'],
        description: 'RECIST 1.1, lesiones target/non-target, respuesta global',
      },
      {
        key: 'onco-toxicidad',
        label: 'Toxicidad (CTCAE)',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/oncologia-medica/toxicidad',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['toxicity_rate_grade3plus'],
        description: 'Grados CTCAE v5.0, manejo de efectos adversos, ajuste de dosis',
      },
      {
        key: 'onco-supervivencia',
        label: 'Plan de Supervivencia',
        icon: 'HeartHandshake',
        route: '/dashboard/medico/oncologia-medica/supervivencia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Survivorship care plan, tamizaje de segundos tumores, secuelas',
      },
      {
        key: 'onco-junta-tumoral',
        label: 'Junta Tumoral',
        icon: 'Users',
        route: '/dashboard/medico/oncologia-medica/junta-tumoral',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Documentación de tumor board, decisiones multidisciplinarias',
      },
    ],

    laboratory: [
      {
        key: 'onco-laboratorio',
        label: 'Panel de Laboratorio Oncológico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/oncologia-medica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, hepático, renal, marcadores tumorales',
      },
      {
        key: 'onco-marcadores',
        label: 'Marcadores Tumorales',
        icon: 'TrendingUp',
        route: '/dashboard/medico/oncologia-medica/marcadores',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'CEA, CA 19-9, AFP, PSA, CA-125, HER2, PDL-1',
      },
      {
        key: 'onco-imagenologia',
        label: 'Imagenología Oncológica',
        icon: 'Scan',
        route: '/dashboard/medico/oncologia-medica/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'TC, RM, PET-CT, gammagrafía ósea — medición RECIST',
      },
      {
        key: 'onco-patologia',
        label: 'Patología y Molecular',
        icon: 'Microscope',
        route: '/dashboard/medico/oncologia-medica/patologia',
        group: 'lab',
        order: 4,
        enabledByDefault: true,
        description: 'Biopsias, inmunohistoquímica, genómica tumoral, NGS',
      },
    ],

    financial: [
      {
        key: 'onco-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/oncologia-medica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'onco-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/oncologia-medica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Pre-autorización de QT, inmunoterapia, PET-CT',
      },
    ],

    technology: [
      {
        key: 'onco-calculadoras',
        label: 'Calculadoras Oncológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/oncologia-medica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'BSA, CrCl (Cockcroft-Gault), AUC (Calvert), dosis ajustada',
      },
      {
        key: 'onco-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/oncologia-medica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'NCCN, ESMO, ASCO — guías clínicas por tipo tumoral',
      },
    ],

    communication: [
      {
        key: 'onco-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/oncologia-medica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'onco-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/oncologia-medica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'onco-analytics',
        label: 'Análisis de Práctica Oncológica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/oncologia-medica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'chemo-schedule',
      component: '@/components/dashboard/medico/oncologia-medica/widgets/chemo-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'tumor-board-pending',
      component: '@/components/dashboard/medico/oncologia-medica/widgets/tumor-board-pending-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'response-tracker',
      component: '@/components/dashboard/medico/oncologia-medica/widgets/response-tracker-widget',
      size: 'medium',
    },
    {
      key: 'toxicity-alerts',
      component: '@/components/dashboard/medico/oncologia-medica/widgets/toxicity-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'protocol_adherence_rate',
    'response_rate',
    'five_year_survival',
    'toxicity_rate_grade3plus',
    'tumor_board_discussion_rate',
    'survivorship_plan_completion',
  ],

  kpiDefinitions: {
    protocol_adherence_rate: {
      label: 'Adherencia a Protocolo QT',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    response_rate: {
      label: 'Tasa de Respuesta (CR + PR)',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    five_year_survival: {
      label: 'Supervivencia a 5 Años',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    toxicity_rate_grade3plus: {
      label: 'Toxicidad Grado 3+ (CTCAE)',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    tumor_board_discussion_rate: {
      label: '% Casos en Junta Tumoral',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    survivorship_plan_completion: {
      label: '% Planes de Supervivencia Completados',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento_qt',
      'evaluacion_respuesta',
      'control_toxicidad',
      'junta_tumoral',
      'plan_supervivencia',
      'segunda_opinion',
      'urgencia_oncologica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_oncologica',
      'estadificacion_tnm',
      'protocolo_quimioterapia',
      'evaluacion_respuesta_recist',
      'reporte_toxicidad_ctcae',
      'nota_junta_tumoral',
      'plan_supervivencia',
      'consentimiento_qt',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksChemotherapyProtocols: true,
      requiresTNMStaging: true,
      usesRECISTCriteria: true,
      tracksCTCAEToxicity: true,
      requiresTumorBoard: true,
      tracksSurvivorshipPlans: true,
      tracksPerformanceStatus: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ONCOLOGÍA MÉDICA
// ============================================================================

/**
 * Escala ECOG Performance Status.
 * Evalúa la capacidad funcional del paciente oncológico.
 */
export const ECOG_PERFORMANCE_STATUS = [
  { grade: 0, label: 'Totalmente activo', description: 'Capaz de realizar todas las actividades previas a la enfermedad sin restricción' },
  { grade: 1, label: 'Restricción leve', description: 'Restricción en actividad física extenuante pero ambulatorio y capaz de trabajo ligero' },
  { grade: 2, label: 'Ambulatorio >50%', description: 'Ambulatorio y capaz de autocuidado pero incapaz de trabajo. Levantado >50% de horas de vigilia' },
  { grade: 3, label: 'Capacidad limitada', description: 'Capacidad limitada de autocuidado. Confinado a cama o sillón >50% de horas de vigilia' },
  { grade: 4, label: 'Completamente incapacitado', description: 'Completamente incapacitado. No puede realizar autocuidado. Confinado a cama o sillón' },
  { grade: 5, label: 'Muerto', description: 'Fallecido' },
] as const;

/**
 * Estadificación TNM — categorías principales (AJCC 8va edición).
 */
export const TNM_STAGING = {
  tumor: [
    { code: 'TX', label: 'Tumor primario no evaluable' },
    { code: 'T0', label: 'Sin evidencia de tumor primario' },
    { code: 'Tis', label: 'Carcinoma in situ' },
    { code: 'T1', label: 'Tumor ≤ 2 cm' },
    { code: 'T2', label: 'Tumor > 2 cm y ≤ 5 cm' },
    { code: 'T3', label: 'Tumor > 5 cm' },
    { code: 'T4', label: 'Tumor de cualquier tamaño con extensión directa' },
  ],
  nodes: [
    { code: 'NX', label: 'Ganglios regionales no evaluables' },
    { code: 'N0', label: 'Sin metástasis ganglionares regionales' },
    { code: 'N1', label: 'Metástasis en 1-3 ganglios regionales' },
    { code: 'N2', label: 'Metástasis en 4-9 ganglios regionales' },
    { code: 'N3', label: 'Metástasis en ≥10 ganglios regionales' },
  ],
  metastasis: [
    { code: 'MX', label: 'Metástasis a distancia no evaluable' },
    { code: 'M0', label: 'Sin metástasis a distancia' },
    { code: 'M1', label: 'Metástasis a distancia presente' },
  ],
} as const;

/**
 * Criterios RECIST 1.1 — Evaluación de respuesta tumoral.
 */
export const RECIST_CRITERIA = [
  { code: 'CR', label: 'Respuesta Completa', description: 'Desaparición de todas las lesiones target. Ganglios < 10 mm en eje corto' },
  { code: 'PR', label: 'Respuesta Parcial', description: 'Disminución ≥ 30% en la suma de diámetros de lesiones target' },
  { code: 'SD', label: 'Enfermedad Estable', description: 'Ni disminución suficiente para PR ni aumento suficiente para PD' },
  { code: 'PD', label: 'Progresión de Enfermedad', description: 'Aumento ≥ 20% en la suma de diámetros (mínimo 5 mm) o nueva lesión' },
] as const;

/**
 * Grados CTCAE v5.0 — Common Terminology Criteria for Adverse Events.
 */
export const CTCAE_GRADES = [
  { grade: 1, label: 'Leve', description: 'Asintomático o síntomas leves. Solo observación clínica o diagnóstica. Intervención no indicada' },
  { grade: 2, label: 'Moderado', description: 'Intervención mínima, local o no invasiva indicada. Limitación de actividades instrumentales de la vida diaria' },
  { grade: 3, label: 'Severo', description: 'Médicamente significativo pero no inmediatamente amenazante. Hospitalización o prolongación indicada. Limitación de autocuidado' },
  { grade: 4, label: 'Amenazante para la vida', description: 'Consecuencias amenazantes para la vida. Intervención urgente indicada' },
  { grade: 5, label: 'Muerte', description: 'Muerte relacionada con el evento adverso' },
] as const;
