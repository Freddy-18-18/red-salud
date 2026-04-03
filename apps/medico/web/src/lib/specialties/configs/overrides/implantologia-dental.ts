/**
 * @file overrides/implantologia-dental.ts
 * @description Override de configuración para Implantología Dental.
 *
 * Módulos especializados: registro de implantes (marca, tamaño, posición),
 * seguimiento de osteointegración, documentación de injerto óseo,
 * planificación protésica, monitoreo de periimplantitis.
 *
 * También exporta constantes de dominio: sistemas de implantes,
 * clasificación de defectos óseos, fases de tratamiento.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Implantología Dental.
 * Especialidad odontológica centrada en implantes dentales y rehabilitación.
 */
export const implantologiaDentalOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'implantologia-dental',
  dashboardPath: '/dashboard/medico/implantologia-dental',

  modules: {
    clinical: [
      {
        key: 'dental-implant-registro',
        label: 'Registro de Implantes',
        icon: 'Pin',
        route: '/dashboard/medico/implantologia-dental/registro',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['survival_rate', 'osseointegration_success'],
        description: 'Marca, modelo, diámetro, longitud, posición, torque de inserción',
      },
      {
        key: 'dental-implant-oseointegracion',
        label: 'Osteointegración',
        icon: 'Bone',
        route: '/dashboard/medico/implantologia-dental/oseointegracion',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'ISQ (Implant Stability Quotient), seguimiento temporal',
      },
      {
        key: 'dental-implant-injerto',
        label: 'Injerto Óseo',
        icon: 'Layers',
        route: '/dashboard/medico/implantologia-dental/injerto',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'ROG, seno maxilar (sinus lift), bloque óseo, biomateriales',
      },
      {
        key: 'dental-implant-protesica',
        label: 'Planificación Protésica',
        icon: 'FileText',
        route: '/dashboard/medico/implantologia-dental/protesica',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
      },
      {
        key: 'dental-implant-periimplantitis',
        label: 'Periimplantitis',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/implantologia-dental/periimplantitis',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['complication_rate'],
        description: 'Monitoreo de mucositis y periimplantitis',
      },
    ],

    lab: [
      {
        key: 'dental-implant-cbct',
        label: 'CBCT / Planificación Digital',
        icon: 'Scan',
        route: '/dashboard/medico/implantologia-dental/cbct',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Planificación 3D, guías quirúrgicas, cirugía guiada',
      },
      {
        key: 'dental-implant-radiologia',
        label: 'Radiología de Implantes',
        icon: 'Image',
        route: '/dashboard/medico/implantologia-dental/radiologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'dental-implant-quirofano',
        label: 'Planificación Quirúrgica',
        icon: 'Scissors',
        route: '/dashboard/medico/implantologia-dental/quirofano',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'dental-implant-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/implantologia-dental/remisiones',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dental-implant-analytics',
        label: 'Análisis de Práctica',
        icon: 'BarChart',
        route: '/dashboard/medico/implantologia-dental/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'implant-registry',
      component: '@/components/dashboard/medico/implantologia-dental/widgets/implant-registry-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'osseointegration-tracking',
      component: '@/components/dashboard/medico/implantologia-dental/widgets/osseointegration-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'periimplantitis-alerts',
      component: '@/components/dashboard/medico/implantologia-dental/widgets/periimplantitis-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'survival_rate',
    'osseointegration_success',
    'complication_rate',
    'prosthetic_completion_rate',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    survival_rate: {
      label: 'Tasa de Supervivencia',
      format: 'percentage',
      goal: 0.97,
      direction: 'higher_is_better',
    },
    osseointegration_success: {
      label: 'Éxito de Osteointegración',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    complication_rate: {
      label: 'Tasa de Complicaciones',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    prosthetic_completion_rate: {
      label: 'Tasa de Finalización Protésica',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    patient_satisfaction: {
      label: 'Satisfacción del Paciente',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'evaluacion_implantologica',
      'cirugia_implante',
      'injerto_oseo',
      'sinus_lift',
      'descubrimiento_implante',
      'toma_impresion',
      'colocacion_protesis',
      'control_oseointegracion',
      'mantenimiento_implante',
    ],
    defaultDuration: 60,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_implantologica',
      'planificacion_quirurgica',
      'informe_cirugia_implante',
      'informe_injerto_oseo',
      'informe_protesica',
      'consentimiento_implante',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresImplantRegistry: true,
      tracksOsseointegration: true,
      supportsBoneGraftDocumentation: true,
      requiresCBCTPlanning: true,
      monitorsPeriimplantitis: true,
      usesISQTracking: true,
    },
  },

  theme: {
    primaryColor: '#14B8A6',
    accentColor: '#0F766E',
    icon: 'Pin',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO IMPLANTOLOGÍA
// ============================================================================

/**
 * Clasificación de defectos óseos para implantes (Seibert / Wang-Al-Shammari)
 */
export const BONE_DEFECT_CLASSIFICATION = [
  { class: 'I', label: 'Clase I', description: 'Pérdida bucolingual con altura normal' },
  { class: 'II', label: 'Clase II', description: 'Pérdida apicocoronal con ancho normal' },
  { class: 'III', label: 'Clase III', description: 'Pérdida combinada (ancho y altura)' },
] as const;

/**
 * Fases del tratamiento con implantes
 */
export const IMPLANT_TREATMENT_PHASES = [
  { phase: 1, label: 'Evaluación y Planificación', description: 'CBCT, planificación 3D, guía quirúrgica' },
  { phase: 2, label: 'Preparación del Sitio', description: 'Injerto óseo, sinus lift si necesario' },
  { phase: 3, label: 'Colocación del Implante', description: 'Cirugía de primera fase, torque de inserción' },
  { phase: 4, label: 'Osteointegración', description: '3-6 meses de cicatrización, ISQ tracking' },
  { phase: 5, label: 'Segunda Fase / Descubrimiento', description: 'Exposición del implante, pilar de cicatrización' },
  { phase: 6, label: 'Restauración Protésica', description: 'Impresión, fabricación y cementado/atornillado' },
  { phase: 7, label: 'Mantenimiento', description: 'Controles periódicos, higiene periimplantaria' },
] as const;
