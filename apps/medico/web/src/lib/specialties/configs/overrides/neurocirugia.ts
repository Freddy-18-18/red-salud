/**
 * @file overrides/neurocirugia.ts
 * @description Override de configuración para Neurocirugía.
 *
 * Módulos especializados: planificación de craneotomía, mapeo de
 * localización tumoral, monitoreo de PIC, seguimiento de derivaciones,
 * coordenadas estereotácticas, neuromonitorización intraoperatoria.
 *
 * KPIs: tasa de resección total macroscópica (GTR), tasa de revisión
 * de derivación, resultados neurológicos.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Neurocirugía.
 * Especialidad quirúrgica con énfasis en planificación neuroquirúrgica,
 * monitoreo de presión intracraneal y resultados neurológicos.
 */
export const neurocirugiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'neurocirugia',
  dashboardPath: '/dashboard/medico/neurocirugia',

  modules: {
    clinical: [
      {
        key: 'neurocir-consulta',
        label: 'Consulta Neuroquirúrgica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/neurocirugia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'neurocir-craneotomia',
        label: 'Planificación de Craneotomía',
        icon: 'Circle',
        route: '/dashboard/medico/neurocirugia/craneotomia',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Tipo de craneotomía, acceso, posición, áreas elocuentes',
      },
      {
        key: 'neurocir-tumor',
        label: 'Mapeo de Localización Tumoral',
        icon: 'MapPin',
        route: '/dashboard/medico/neurocirugia/tumor',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Localización, tamaño, relación con estructuras elocuentes, efecto de masa',
      },
      {
        key: 'neurocir-pic',
        label: 'Monitoreo de PIC',
        icon: 'Gauge',
        route: '/dashboard/medico/neurocirugia/pic',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Presión intracraneal, PPC, ondas, tendencias',
      },
      {
        key: 'neurocir-derivaciones',
        label: 'Seguimiento de Derivaciones',
        icon: 'GitBranch',
        route: '/dashboard/medico/neurocirugia/derivaciones',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'DVP, DVE, registros de programación de válvula, complicaciones',
      },
      {
        key: 'neurocir-estereotaxia',
        label: 'Coordenadas Estereotácticas',
        icon: 'Crosshair',
        route: '/dashboard/medico/neurocirugia/estereotaxia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Planificación estereotáctica, biopsias guiadas, DBS',
      },
      {
        key: 'neurocir-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/neurocirugia/nota-operatoria',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
      {
        key: 'neurocir-neurologico',
        label: 'Seguimiento Neurológico',
        icon: 'Brain',
        route: '/dashboard/medico/neurocirugia/neurologico',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
        description: 'Glasgow, pupilas, focalidad, evolución post-quirúrgica',
      },
    ],

    lab: [
      {
        key: 'neurocir-neuroimagen',
        label: 'Neuroimagen',
        icon: 'Scan',
        route: '/dashboard/medico/neurocirugia/neuroimagen',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'RMN con espectroscopia, TC, angiografía, tractografía',
      },
      {
        key: 'neurocir-neuromonitoreo',
        label: 'Neuromonitorización Intraoperatoria',
        icon: 'Activity',
        route: '/dashboard/medico/neurocirugia/neuromonitoreo',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'SSEP, MEP, EMG, ECoG, mapeo cortical',
      },
      {
        key: 'neurocir-patologia',
        label: 'Neuropatología',
        icon: 'Microscope',
        route: '/dashboard/medico/neurocirugia/patologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Clasificación OMS de tumores del SNC, histología, biomarcadores',
      },
    ],

    technology: [
      {
        key: 'neurocir-neuronavegacion',
        label: 'Neuronavegación',
        icon: 'Navigation',
        route: '/dashboard/medico/neurocirugia/neuronavegacion',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Registro de imagen, planificación volumétrica, abordajes',
      },
      {
        key: 'neurocir-calculadoras',
        label: 'Calculadoras Neuroquirúrgicas',
        icon: 'Calculator',
        route: '/dashboard/medico/neurocirugia/calculadoras',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Glasgow, volumen de hematoma (ABC/2), riesgo de sangrado',
      },
      {
        key: 'neurocir-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/neurocirugia/planificacion',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'neurocir-multidisciplinario',
        label: 'Equipo Multidisciplinario',
        icon: 'Users',
        route: '/dashboard/medico/neurocirugia/multidisciplinario',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Neurología, neurorradiología, oncología, rehabilitación',
      },
      {
        key: 'neurocir-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/neurocirugia/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'neurocir-analytics',
        label: 'Análisis de Resultados Neuroquirúrgicos',
        icon: 'TrendingUp',
        route: '/dashboard/medico/neurocirugia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'gtr-rate',
      component: '@/components/dashboard/medico/neurocirugia/widgets/gtr-rate-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'shunt-tracker',
      component: '@/components/dashboard/medico/neurocirugia/widgets/shunt-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'icp-monitor',
      component: '@/components/dashboard/medico/neurocirugia/widgets/icp-monitor-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/neurocirugia/widgets/upcoming-surgeries-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'gross_total_resection_rate',
    'shunt_revision_rate',
    'neurological_outcome_improvement',
    'surgical_site_infection_rate',
    'mortality_30d',
    'avg_operative_time',
  ],

  kpiDefinitions: {
    gross_total_resection_rate: {
      label: 'Tasa de Resección Total Macroscópica (GTR)',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    shunt_revision_rate: {
      label: 'Tasa de Revisión de Derivación (1 año)',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    neurological_outcome_improvement: {
      label: 'Mejora en Resultado Neurológico',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    surgical_site_infection_rate: {
      label: 'Tasa de Infección del Sitio Quirúrgico',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    mortality_30d: {
      label: 'Mortalidad a 30 Días',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    avg_operative_time: {
      label: 'Tiempo Operatorio Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento_neurologico',
      'control_derivacion',
      'evaluacion_tumoral',
      'seguimiento',
      'urgencia_neuroquirurgica',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_neuroquirurgica',
      'examen_neurologico',
      'planificacion_craneotomia',
      'nota_operatoria',
      'registro_estereotactico',
      'monitoreo_pic',
      'seguimiento_derivacion',
      'evolucion_postquirurgica',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresCraniotomyPlanning: true,
      tracksTumorLocationMapping: true,
      monitorsICP: true,
      tracksShuntRegistry: true,
      supportsStereotacticCoordinates: true,
      supportsIntraoperativeNeuromonitoring: true,
      usesGlasgowComaScale: true,
      supportsNeuronavigation: true,
    },
  },

  theme: {
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
    icon: 'Brain',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NEUROCIRUGÍA
// ============================================================================

/**
 * Escala de Coma de Glasgow.
 */
export const GLASGOW_COMA_SCALE = {
  eye_response: [
    { score: 1, label: 'Sin apertura ocular' },
    { score: 2, label: 'Apertura al dolor' },
    { score: 3, label: 'Apertura a la voz' },
    { score: 4, label: 'Apertura espontánea' },
  ],
  verbal_response: [
    { score: 1, label: 'Sin respuesta verbal' },
    { score: 2, label: 'Sonidos incomprensibles' },
    { score: 3, label: 'Palabras inapropiadas' },
    { score: 4, label: 'Confuso' },
    { score: 5, label: 'Orientado' },
  ],
  motor_response: [
    { score: 1, label: 'Sin respuesta motora' },
    { score: 2, label: 'Extensión anormal (descerebración)' },
    { score: 3, label: 'Flexión anormal (decorticación)' },
    { score: 4, label: 'Retirada al dolor' },
    { score: 5, label: 'Localiza el dolor' },
    { score: 6, label: 'Obedece órdenes' },
  ],
  interpretation: [
    { range: '3-8', label: 'Severo', action: 'Intubación, TC urgente, considerar PIC' },
    { range: '9-12', label: 'Moderado', action: 'Monitoreo estrecho, neuroimagen' },
    { range: '13-15', label: 'Leve', action: 'Observación, considerar TC según criterios' },
  ],
} as const;

/**
 * Clasificación OMS de tumores del SNC (principales categorías).
 */
export const WHO_CNS_TUMOR_GRADES = [
  { grade: 1, label: 'Grado 1', description: 'Bajo potencial proliferativo, posibilidad de cura con resección', examples: 'Astrocitoma pilocítico, meningioma, schwannoma' },
  { grade: 2, label: 'Grado 2', description: 'Baja actividad mitótica, tendencia a recurrencia', examples: 'Astrocitoma difuso, oligodendroglioma, ependimoma' },
  { grade: 3, label: 'Grado 3', description: 'Evidencia histológica de malignidad (mitosis, anaplasia)', examples: 'Astrocitoma anaplásico, oligodendroglioma anaplásico' },
  { grade: 4, label: 'Grado 4', description: 'Altamente maligno, rápidamente fatal sin tratamiento', examples: 'Glioblastoma, DIPG, meduloblastoma' },
] as const;

/**
 * Tipos de derivaciones ventriculares.
 */
export const SHUNT_TYPES = [
  { key: 'DVP', label: 'Derivación Ventriculoperitoneal', description: 'Ventrículo lateral → peritoneo. La más común.', complications: ['Obstrucción', 'Infección', 'Sobredrenaje', 'Migración catéter distal'] },
  { key: 'DVA', label: 'Derivación Ventriculoatrial', description: 'Ventrículo lateral → aurícula derecha.', complications: ['Infección', 'Trombosis', 'Nefritis por shunt', 'Arritmias'] },
  { key: 'DVE', label: 'Derivación Ventricular Externa', description: 'Ventrículo lateral → bolsa externa. Temporal.', complications: ['Infección (riesgo alto)', 'Obstrucción', 'Sobredrenaje'] },
  { key: 'LP', label: 'Derivación Lumboperitoneal', description: 'Espacio subaracnoideo lumbar → peritoneo.', complications: ['Herniación tonsilar', 'Radiculopatía', 'Obstrucción'] },
  { key: 'ETV', label: 'Tercer Ventriculostomía Endoscópica', description: 'Fenestración del piso del tercer ventrículo. Sin hardware.', complications: ['Cierre de estoma', 'Lesión basilar', 'Infección'] },
] as const;

/**
 * Volumen de hematoma — fórmula ABC/2.
 */
export const HEMATOMA_VOLUME_FORMULA = {
  name: 'Fórmula ABC/2',
  description: 'Estimación rápida del volumen de un hematoma intracraneal en TC',
  formula: 'Volumen (mL) = (A × B × C) / 2',
  parameters: [
    { key: 'A', label: 'Diámetro mayor del hematoma en el corte de máximo diámetro (cm)' },
    { key: 'B', label: 'Diámetro perpendicular a A en el mismo corte (cm)' },
    { key: 'C', label: 'Número de cortes de TC con hematoma × grosor del corte (cm)' },
  ],
  clinicalRelevance: 'Volumen >30 mL en hematomas supratentoriales o >15 mL en infratentoriales generalmente indica cirugía',
} as const;
