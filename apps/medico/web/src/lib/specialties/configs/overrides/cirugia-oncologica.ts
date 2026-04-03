/**
 * @file overrides/cirugia-oncologica.ts
 * @description Override de configuración para Cirugía Oncológica.
 *
 * Módulos especializados: preparación para junta tumoral, documentación
 * de estadificación (TNM), seguimiento de márgenes, mapeo ganglionar,
 * respuesta a neoadyuvancia, planificación de supervivencia.
 *
 * KPIs: tasa de resección R0, precisión de estadificación, métricas de sobrevida.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Oncológica.
 * Especialidad quirúrgica con énfasis en oncología, estadificación TNM
 * y seguimiento de márgenes quirúrgicos.
 */
export const cirugiaOncologicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-oncologica',
  dashboardPath: '/dashboard/medico/cirugia-oncologica',

  modules: {
    clinical: [
      {
        key: 'cionco-consulta',
        label: 'Consulta Oncoquirúrgica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-oncologica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cionco-estadificacion',
        label: 'Estadificación TNM',
        icon: 'Layers',
        route: '/dashboard/medico/cirugia-oncologica/estadificacion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Clasificación Tumor-Nódulo-Metástasis, estadios clínicos y patológicos',
      },
      {
        key: 'cionco-junta-tumoral',
        label: 'Preparación Junta Tumoral',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-oncologica/junta-tumoral',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Resumen de caso, imágenes, patología, propuesta terapéutica',
      },
      {
        key: 'cionco-margenes',
        label: 'Seguimiento de Márgenes',
        icon: 'Target',
        route: '/dashboard/medico/cirugia-oncologica/margenes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Estado de márgenes quirúrgicos: R0, R1, R2',
      },
      {
        key: 'cionco-ganglios',
        label: 'Mapeo Ganglionar',
        icon: 'GitBranch',
        route: '/dashboard/medico/cirugia-oncologica/ganglios',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Ganglio centinela, linfadenectomía, ratio ganglionar',
      },
      {
        key: 'cionco-neoadyuvancia',
        label: 'Respuesta a Neoadyuvancia',
        icon: 'TrendingDown',
        route: '/dashboard/medico/cirugia-oncologica/neoadyuvancia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Evaluación de respuesta tumoral pre-quirúrgica (RECIST, Mandard)',
      },
      {
        key: 'cionco-nota-operatoria',
        label: 'Nota Operatoria Oncológica',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-oncologica/nota-operatoria',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'cionco-supervivencia',
        label: 'Planificación de Supervivencia',
        icon: 'Heart',
        route: '/dashboard/medico/cirugia-oncologica/supervivencia',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Plan de seguimiento post-oncológico, vigilancia de recurrencia',
      },
    ],

    lab: [
      {
        key: 'cionco-patologia',
        label: 'Resultados de Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-oncologica/patologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Biopsia, pieza quirúrgica, inmunohistoquímica, biomarcadores',
      },
      {
        key: 'cionco-imagenologia',
        label: 'Imagenología Oncológica',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-oncologica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cionco-marcadores',
        label: 'Marcadores Tumorales',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-oncologica/marcadores',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'CEA, CA 19-9, CA 125, AFP, PSA, etc.',
      },
    ],

    technology: [
      {
        key: 'cionco-calculadoras',
        label: 'Calculadoras Oncológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-oncologica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Nomogramas de pronóstico, riesgo de recurrencia',
      },
      {
        key: 'cionco-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-oncologica/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cionco-multidisciplinario',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-oncologica/multidisciplinario',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Coordinación con oncología médica, radioterapia, paliativo',
      },
      {
        key: 'cionco-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-oncologica/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cionco-analytics',
        label: 'Análisis de Resultados Oncológicos',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-oncologica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'r0-resection-rate',
      component: '@/components/dashboard/medico/cirugia-oncologica/widgets/r0-resection-rate-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'staging-accuracy',
      component: '@/components/dashboard/medico/cirugia-oncologica/widgets/staging-accuracy-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'tumor-board-schedule',
      component: '@/components/dashboard/medico/cirugia-oncologica/widgets/tumor-board-schedule-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'tumor-markers-trend',
      component: '@/components/dashboard/medico/cirugia-oncologica/widgets/tumor-markers-trend-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'r0_resection_rate',
    'staging_accuracy',
    'disease_free_survival_1yr',
    'overall_survival_5yr',
    'lymph_node_ratio',
    'neoadjuvant_response_rate',
  ],

  kpiDefinitions: {
    r0_resection_rate: {
      label: 'Tasa de Resección R0 (Márgenes Libres)',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    staging_accuracy: {
      label: 'Precisión de Estadificación',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    disease_free_survival_1yr: {
      label: 'Sobrevida Libre de Enfermedad a 1 Año',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    overall_survival_5yr: {
      label: 'Sobrevida Global a 5 Años',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    lymph_node_ratio: {
      label: 'Ratio Ganglionar (Positivos/Total)',
      format: 'percentage',
      direction: 'lower_is_better',
    },
    neoadjuvant_response_rate: {
      label: 'Tasa de Respuesta a Neoadyuvancia',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_oncologica',
      'junta_tumoral',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento_oncologico',
      'evaluacion_respuesta',
      'plan_supervivencia',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_oncoquirurgica',
      'estadificacion_tnm',
      'resumen_junta_tumoral',
      'nota_operatoria_oncologica',
      'reporte_margenes',
      'mapeo_ganglionar',
      'evaluacion_neoadyuvancia',
      'plan_supervivencia',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresTNMStaging: true,
      tracksSurgicalMargins: true,
      requiresTumorBoard: true,
      tracksLymphNodeMapping: true,
      tracksNeoadjuvantResponse: true,
      requiresSurvivorshipPlan: true,
      tracksTumorMarkers: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Target',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA ONCOLÓGICA
// ============================================================================

/**
 * Clasificación TNM — Categorías principales.
 */
export const TNM_CATEGORIES = [
  { category: 'T', label: 'Tumor Primario', values: ['TX', 'T0', 'Tis', 'T1', 'T1a', 'T1b', 'T2', 'T2a', 'T2b', 'T3', 'T4', 'T4a', 'T4b'] },
  { category: 'N', label: 'Ganglios Linfáticos Regionales', values: ['NX', 'N0', 'N1', 'N1a', 'N1b', 'N2', 'N2a', 'N2b', 'N3'] },
  { category: 'M', label: 'Metástasis a Distancia', values: ['M0', 'M1', 'M1a', 'M1b', 'M1c'] },
] as const;

/**
 * Estado de márgenes quirúrgicos.
 */
export const SURGICAL_MARGIN_STATUS = [
  { key: 'R0', label: 'R0 — Márgenes libres', description: 'Resección completa sin tumor residual microscópico', prognosis: 'Favorable' },
  { key: 'R1', label: 'R1 — Margen positivo microscópico', description: 'Tumor residual microscópico en el margen de resección', prognosis: 'Intermedio' },
  { key: 'R2', label: 'R2 — Tumor residual macroscópico', description: 'Tumor residual visible macroscópicamente', prognosis: 'Desfavorable' },
] as const;

/**
 * Criterios RECIST de respuesta tumoral.
 */
export const RECIST_RESPONSE_CRITERIA = [
  { key: 'CR', label: 'Respuesta Completa (RC)', description: 'Desaparición de todas las lesiones diana', criteria: 'Todos los ganglios patológicos <10mm en eje corto' },
  { key: 'PR', label: 'Respuesta Parcial (RP)', description: 'Disminución ≥30% de la suma de diámetros de lesiones diana', criteria: 'Tomando como referencia la suma basal' },
  { key: 'SD', label: 'Enfermedad Estable (EE)', description: 'No cumple criterios de RP ni PD', criteria: 'Cambio insuficiente para clasificar como RP o PD' },
  { key: 'PD', label: 'Progresión de Enfermedad (PE)', description: 'Aumento ≥20% de la suma de diámetros + aumento absoluto ≥5mm', criteria: 'O aparición de nuevas lesiones' },
] as const;

/**
 * Marcadores tumorales comunes y sus neoplasias asociadas.
 */
export const TUMOR_MARKERS = [
  { key: 'CEA', label: 'Antígeno Carcinoembrionario', tumors: ['Colorrectal', 'Gástrico', 'Pancreático', 'Pulmonar'] },
  { key: 'CA_19_9', label: 'CA 19-9', tumors: ['Pancreático', 'Biliar', 'Gástrico'] },
  { key: 'CA_125', label: 'CA 125', tumors: ['Ovario', 'Endometrio', 'Peritoneal'] },
  { key: 'AFP', label: 'Alfa-fetoproteína', tumors: ['Hepatocelular', 'Tumores germinales'] },
  { key: 'CA_15_3', label: 'CA 15-3', tumors: ['Mama'] },
  { key: 'HCG', label: 'Gonadotropina Coriónica', tumors: ['Tumores germinales', 'Coriocarcinoma'] },
  { key: 'LDH', label: 'Lactato Deshidrogenasa', tumors: ['Linfoma', 'Melanoma', 'Tumores germinales'] },
  { key: 'PSA', label: 'Antígeno Prostático Específico', tumors: ['Próstata'] },
] as const;
