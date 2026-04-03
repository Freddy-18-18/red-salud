/**
 * @file overrides/oncologia-radioterapica.ts
 * @description Override de configuración para Oncología Radioterapéutica.
 *
 * Tratamiento del cáncer con radiación ionizante — planificación de
 * tratamiento, seguimiento de dosis (Gy), fraccionamiento, toxicidad
 * por radiación, contorneo de volúmenes, braquiterapia.
 *
 * También exporta constantes de dominio: esquemas de fraccionamiento,
 * volúmenes de contorneo, escalas de toxicidad por radiación.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Oncología Radioterapéutica.
 * Especialidad con módulos clínicos, de planificación y seguimiento.
 */
export const oncologiaRadioterapicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'oncologia-radioterapica',
  dashboardPath: '/dashboard/medico/oncologia-radioterapica',

  modules: {
    clinical: [
      {
        key: 'radio-consulta',
        label: 'Consulta de Radioterapia',
        icon: 'Stethoscope',
        route: '/dashboard/medico/oncologia-radioterapica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Evaluación inicial, indicación de RT, consentimiento',
      },
      {
        key: 'radio-planificacion',
        label: 'Planificación de Tratamiento',
        icon: 'Target',
        route: '/dashboard/medico/oncologia-radioterapica/planificacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Simulación, contorneo de volúmenes (GTV, CTV, PTV), plan dosimétrico',
      },
      {
        key: 'radio-dosis',
        label: 'Seguimiento de Dosis',
        icon: 'Gauge',
        route: '/dashboard/medico/oncologia-radioterapica/dosis',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['treatment_completion_rate'],
        description: 'Dosis total (Gy), dosis/fracción, fracciones completadas',
      },
      {
        key: 'radio-fracciones',
        label: 'Calendario de Fracciones',
        icon: 'Calendar',
        route: '/dashboard/medico/oncologia-radioterapica/fracciones',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Programación de sesiones, interrupciones, recuperación de fracciones',
      },
      {
        key: 'radio-toxicidad',
        label: 'Toxicidad por Radiación',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/oncologia-radioterapica/toxicidad',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['toxicity_rate'],
        description: 'RTOG/CTCAE, toxicidad aguda y tardía, manejo de efectos',
      },
      {
        key: 'radio-contorneo',
        label: 'Documentación de Contorneo',
        icon: 'PenTool',
        route: '/dashboard/medico/oncologia-radioterapica/contorneo',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Volúmenes blanco, órganos en riesgo, restricciones de dosis',
      },
      {
        key: 'radio-braquiterapia',
        label: 'Braquiterapia',
        icon: 'CircleDot',
        route: '/dashboard/medico/oncologia-radioterapica/braquiterapia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'HDR/LDR, planificación, inserción, dosimetría in vivo',
      },
    ],

    laboratory: [
      {
        key: 'radio-laboratorio',
        label: 'Laboratorio de Seguimiento',
        icon: 'FlaskConical',
        route: '/dashboard/medico/oncologia-radioterapica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma semanal, función renal/hepática durante RT',
      },
      {
        key: 'radio-imagenologia',
        label: 'Imagenología de Seguimiento',
        icon: 'Scan',
        route: '/dashboard/medico/oncologia-radioterapica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'TC de simulación, verificación portal, CBCT, RM de respuesta',
      },
    ],

    financial: [
      {
        key: 'radio-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/oncologia-radioterapica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'radio-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/oncologia-radioterapica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Pre-autorización de RT, braquiterapia, PET-CT',
      },
    ],

    technology: [
      {
        key: 'radio-calculadoras',
        label: 'Calculadoras de Radioterapia',
        icon: 'Calculator',
        route: '/dashboard/medico/oncologia-radioterapica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'BED, EQD2, conversión de fraccionamiento, NTD',
      },
      {
        key: 'radio-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/oncologia-radioterapica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'NCCN, ESTRO, QUANTEC — restricciones de dosis a OAR',
      },
    ],

    communication: [
      {
        key: 'radio-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/oncologia-radioterapica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'radio-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/oncologia-radioterapica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'radio-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/oncologia-radioterapica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'fraction-schedule',
      component: '@/components/dashboard/medico/oncologia-radioterapica/widgets/fraction-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'dose-tracker',
      component: '@/components/dashboard/medico/oncologia-radioterapica/widgets/dose-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'toxicity-monitor',
      component: '@/components/dashboard/medico/oncologia-radioterapica/widgets/toxicity-monitor-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'treatment-completion',
      component: '@/components/dashboard/medico/oncologia-radioterapica/widgets/treatment-completion-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'treatment_completion_rate',
    'toxicity_rate',
    'local_control_rate',
    'fraction_adherence',
    'plan_quality_score',
    'brachy_procedures_monthly',
  ],

  kpiDefinitions: {
    treatment_completion_rate: {
      label: 'Tasa de Completación de Tratamiento',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    toxicity_rate: {
      label: 'Toxicidad Grado 3+ (RTOG)',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    local_control_rate: {
      label: 'Tasa de Control Local',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    fraction_adherence: {
      label: 'Adherencia a Fracciones Programadas',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    plan_quality_score: {
      label: 'Score de Calidad del Plan',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    brachy_procedures_monthly: {
      label: 'Procedimientos de Braquiterapia / Mes',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'simulacion',
      'inicio_tratamiento',
      'control_semanal',
      'fin_de_tratamiento',
      'seguimiento_post_rt',
      'braquiterapia',
      'urgencia_radioterapia',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_inicial_rt',
      'prescripcion_radioterapia',
      'informe_planificacion',
      'nota_semanal_rt',
      'reporte_toxicidad_rt',
      'informe_braquiterapia',
      'nota_fin_tratamiento',
      'consentimiento_rt',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      tracksDoseDelivery: true,
      requiresFractionScheduling: true,
      tracksRadiationToxicity: true,
      requiresContouringDocumentation: true,
      supportsBrachytherapy: true,
      requiresTreatmentPlanQA: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Zap',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — ONCOLOGÍA RADIOTERAPÉUTICA
// ============================================================================

/**
 * Esquemas de fraccionamiento comunes.
 */
export const FRACTIONATION_SCHEMES = [
  { key: 'conventional', label: 'Convencional', dosePerFraction: 2.0, unit: 'Gy', description: '1.8-2.0 Gy/fracción, 5 fracciones/semana' },
  { key: 'hypofractionation', label: 'Hipofraccionamiento', dosePerFraction: 2.67, unit: 'Gy', description: '> 2.0 Gy/fracción, menos fracciones totales' },
  { key: 'sbrt', label: 'SBRT/SABR', dosePerFraction: 12.0, unit: 'Gy', description: '6-34 Gy/fracción, 1-5 fracciones, alta precisión' },
  { key: 'srs', label: 'Radiocirugía (SRS)', dosePerFraction: 20.0, unit: 'Gy', description: 'Dosis única 12-24 Gy, estereotáxica craneal' },
  { key: 'hyperfractionation', label: 'Hiperfraccionamiento', dosePerFraction: 1.2, unit: 'Gy', description: '< 1.8 Gy/fracción, 2 fracciones/día, más fracciones totales' },
  { key: 'palliative_short', label: 'Paliativo Corto', dosePerFraction: 8.0, unit: 'Gy', description: '8 Gy dosis única o 20 Gy/5 fracciones' },
  { key: 'palliative_standard', label: 'Paliativo Estándar', dosePerFraction: 3.0, unit: 'Gy', description: '30 Gy/10 fracciones' },
] as const;

/**
 * Volúmenes de contorneo según ICRU 83/91.
 */
export const CONTOURING_VOLUMES = [
  { code: 'GTV', label: 'Gross Tumor Volume', description: 'Extensión demostrable del tumor (visible/palpable)' },
  { code: 'CTV', label: 'Clinical Target Volume', description: 'GTV + extensión subclínica microscópica' },
  { code: 'ITV', label: 'Internal Target Volume', description: 'CTV + margen por movimiento interno del órgano' },
  { code: 'PTV', label: 'Planning Target Volume', description: 'CTV/ITV + margen por incertidumbre de posicionamiento' },
  { code: 'OAR', label: 'Organs At Risk', description: 'Órganos normales cuya sensibilidad puede influir el plan' },
  { code: 'PRV', label: 'Planning Organ at Risk Volume', description: 'OAR + margen por incertidumbre' },
] as const;

/**
 * Escala de toxicidad RTOG para efectos agudos de radiación.
 */
export const RTOG_ACUTE_TOXICITY = [
  { grade: 0, label: 'Sin cambios', description: 'Sin toxicidad observable' },
  { grade: 1, label: 'Leve', description: 'Cambios menores que no requieren tratamiento' },
  { grade: 2, label: 'Moderada', description: 'Requiere tratamiento sintomático ambulatorio' },
  { grade: 3, label: 'Severa', description: 'Requiere hospitalización o interrupción del tratamiento' },
  { grade: 4, label: 'Amenazante para la vida', description: 'Requiere intervención urgente' },
  { grade: 5, label: 'Fatal', description: 'Muerte relacionada con toxicidad por radiación' },
] as const;
