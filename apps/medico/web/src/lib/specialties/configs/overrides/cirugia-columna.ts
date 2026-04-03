/**
 * @file overrides/cirugia-columna.ts
 * @description Override de configuración para Cirugía de Columna.
 *
 * Módulos especializados: documentación de nivel espinal, medición de
 * deformidades (ángulo de Cobb), registro de hardware, seguimiento
 * neurológico, evaluación de fusión.
 *
 * KPIs: tasa de fusión, mejora neurológica, reducción de dolor VAS.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía de Columna.
 * Especialidad quirúrgica con énfasis en instrumentación,
 * corrección de deformidades y preservación neurológica.
 */
export const cirugiaColumnaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-columna',
  dashboardPath: '/dashboard/medico/cirugia-columna',

  modules: {
    clinical: [
      {
        key: 'cirespina-consulta',
        label: 'Consulta de Columna',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-columna/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirespina-nivel-espinal',
        label: 'Documentación de Nivel Espinal',
        icon: 'AlignCenter',
        route: '/dashboard/medico/cirugia-columna/nivel-espinal',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Identificación de niveles afectados, patología por segmento',
      },
      {
        key: 'cirespina-deformidad',
        label: 'Medición de Deformidades',
        icon: 'Ruler',
        route: '/dashboard/medico/cirugia-columna/deformidad',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Ángulo de Cobb, balance sagital, lordosis/cifosis, SVA',
      },
      {
        key: 'cirespina-hardware',
        label: 'Registro de Hardware',
        icon: 'Wrench',
        route: '/dashboard/medico/cirugia-columna/hardware',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Tornillos pediculares, barras, cajas intersomáticas, prótesis discales',
      },
      {
        key: 'cirespina-neurologico',
        label: 'Seguimiento Neurológico',
        icon: 'Zap',
        route: '/dashboard/medico/cirugia-columna/neurologico',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Escala ASIA, reflejos, fuerza por miotomas, sensibilidad por dermatomas',
      },
      {
        key: 'cirespina-fusion',
        label: 'Evaluación de Fusión',
        icon: 'Link',
        route: '/dashboard/medico/cirugia-columna/fusion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Criterios de Bridwell, TC para evaluación de fusión, pseudoartrosis',
      },
      {
        key: 'cirespina-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-columna/nota-operatoria',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'cirespina-dolor',
        label: 'Seguimiento del Dolor',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-columna/dolor',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'VAS, ODI, NDI, evolución del dolor post-quirúrgico',
      },
    ],

    lab: [
      {
        key: 'cirespina-imagenologia',
        label: 'Imagenología de Columna',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-columna/imagenologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Radiografías dinámicas, RMN, TC, mielografía',
      },
      {
        key: 'cirespina-neurofisiologia',
        label: 'Neuromonitorización',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-columna/neurofisiologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Potenciales evocados, EMG intraoperatorio, neuromonitoreo',
      },
      {
        key: 'cirespina-densitometria',
        label: 'Densitometría Ósea',
        icon: 'Bone',
        route: '/dashboard/medico/cirugia-columna/densitometria',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'DEXA, T-score — evaluación de calidad ósea para instrumentación',
      },
    ],

    technology: [
      {
        key: 'cirespina-calculadoras',
        label: 'Calculadoras de Columna',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-columna/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Balance sagital, ángulo de Cobb, riesgo de pseudoartrosis',
      },
      {
        key: 'cirespina-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-columna/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirespina-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-columna/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Neurología, neurocirugía, rehabilitación, dolor crónico',
      },
      {
        key: 'cirespina-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-columna/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirespina-analytics',
        label: 'Análisis de Resultados',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-columna/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'fusion-rate-tracker',
      component: '@/components/dashboard/medico/cirugia-columna/widgets/fusion-rate-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'vas-pain-trend',
      component: '@/components/dashboard/medico/cirugia-columna/widgets/vas-pain-trend-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'hardware-registry',
      component: '@/components/dashboard/medico/cirugia-columna/widgets/hardware-registry-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'neurological-outcomes',
      component: '@/components/dashboard/medico/cirugia-columna/widgets/neurological-outcomes-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'fusion_rate',
    'neurological_improvement',
    'vas_pain_reduction',
    'odi_improvement',
    'hardware_complication_rate',
    'reoperation_rate',
  ],

  kpiDefinitions: {
    fusion_rate: {
      label: 'Tasa de Fusión (Bridwell I-II)',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    neurological_improvement: {
      label: 'Mejora Neurológica (ASIA)',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    vas_pain_reduction: {
      label: 'Reducción de Dolor VAS (≥50%)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    odi_improvement: {
      label: 'Mejora en ODI (≥15 puntos)',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    hardware_complication_rate: {
      label: 'Tasa de Complicaciones de Hardware',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    reoperation_rate: {
      label: 'Tasa de Reoperación',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'evaluacion_neurologica',
      'control_fusion',
      'manejo_dolor',
      'evaluacion_deformidad',
      'seguimiento',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_columna',
      'examen_neurologico_espinal',
      'medicion_deformidad',
      'nota_operatoria',
      'registro_hardware',
      'evaluacion_fusion',
      'seguimiento_dolor',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      documentsSpinalLevel: true,
      measuresCobbAngle: true,
      tracksHardwareRegistry: true,
      tracksNeurologicalExam: true,
      assessesFusionStatus: true,
      usesVASPainScale: true,
      usesODI: true,
      supportsIntraoperativeNeuromonitoring: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Bone',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA DE COLUMNA
// ============================================================================

/**
 * Escala ASIA (American Spinal Injury Association) de clasificación
 * de lesión medular.
 */
export const ASIA_IMPAIRMENT_SCALE = [
  { grade: 'A', label: 'Completa', description: 'Sin función motora ni sensitiva preservada en segmentos sacros S4-S5' },
  { grade: 'B', label: 'Sensitiva incompleta', description: 'Función sensitiva pero NO motora preservada por debajo del nivel neurológico, incluyendo S4-S5' },
  { grade: 'C', label: 'Motora incompleta', description: 'Función motora preservada por debajo del nivel neurológico, más de la mitad de músculos clave con grado <3' },
  { grade: 'D', label: 'Motora incompleta', description: 'Función motora preservada por debajo del nivel neurológico, al menos la mitad de músculos clave con grado ≥3' },
  { grade: 'E', label: 'Normal', description: 'Funciones motora y sensitiva normales en todos los segmentos' },
] as const;

/**
 * Clasificación de Bridwell para evaluación de fusión espinal.
 */
export const BRIDWELL_FUSION_GRADES = [
  { grade: 'I', label: 'Fusión completa', description: 'Fusión con remodelado y trabéculas presentes', status: 'Fusionado' },
  { grade: 'II', label: 'Fusión parcial', description: 'Injerto intacto, no remodelado completamente pero sin lucencias', status: 'Probablemente fusionado' },
  { grade: 'III', label: 'Fusión dudosa', description: 'Injerto intacto, lucencias potenciales en la parte superior o inferior', status: 'Probablemente no fusionado' },
  { grade: 'IV', label: 'No fusionado', description: 'Injerto no presente, colapso definitivo, lucencias claras', status: 'Pseudoartrosis' },
] as const;

/**
 * Parámetros de balance sagital espinal.
 */
export const SAGITTAL_BALANCE_PARAMETERS = [
  { key: 'SVA', label: 'Sagittal Vertical Axis', normal: '<5cm', unit: 'cm', description: 'Distancia desde la plomada de C7 al borde posterosuperior de S1' },
  { key: 'PI', label: 'Pelvic Incidence', normal: '40-65°', unit: '°', description: 'Ángulo fijo entre la perpendicular al platillo sacro y la línea al centro de las cabezas femorales' },
  { key: 'PT', label: 'Pelvic Tilt', normal: '<25°', unit: '°', description: 'Ángulo entre la vertical y la línea del punto medio de S1 al centro de las cabezas femorales' },
  { key: 'SS', label: 'Sacral Slope', normal: '30-45°', unit: '°', description: 'Ángulo entre el platillo sacro y la horizontal (PI = PT + SS)' },
  { key: 'LL', label: 'Lumbar Lordosis', normal: '40-70°', unit: '°', description: 'Ángulo de Cobb L1-S1, debe estar dentro de ±10° de PI' },
  { key: 'TK', label: 'Thoracic Kyphosis', normal: '20-45°', unit: '°', description: 'Ángulo de Cobb T4-T12' },
  { key: 'PI_LL', label: 'PI-LL Mismatch', normal: '<10°', unit: '°', description: 'Diferencia entre PI y LL — objetivo <10°' },
] as const;
