/**
 * @file overrides/cirugia-general.ts
 * @description Override de configuración para Cirugía General.
 *
 * Módulos especializados: notas operatorias, seguimiento de heridas,
 * manejo de drenajes, clasificación ASA, checklist de seguridad
 * quirúrgica, seguimiento post-operatorio.
 *
 * KPIs: volumen quirúrgico, tasa de complicaciones (Clavien-Dindo),
 * tasa de reingreso.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía General.
 * Especialidad quirúrgica con énfasis en seguridad perioperatoria.
 */
export const cirugiaGeneralOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-general',
  dashboardPath: '/dashboard/medico/cirugia-general',

  modules: {
    clinical: [
      {
        key: 'cirgen-consulta',
        label: 'Consulta Quirúrgica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-general/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirgen-nota-operatoria',
        label: 'Notas Operatorias',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-general/nota-operatoria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Registro estandarizado de procedimientos quirúrgicos',
      },
      {
        key: 'cirgen-heridas',
        label: 'Seguimiento de Heridas',
        icon: 'Bandage',
        route: '/dashboard/medico/cirugia-general/heridas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Evolución de herida quirúrgica, signos de infección, dehiscencia',
      },
      {
        key: 'cirgen-drenajes',
        label: 'Manejo de Drenajes',
        icon: 'Droplets',
        route: '/dashboard/medico/cirugia-general/drenajes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Registro de débito, características, criterios de retiro',
      },
      {
        key: 'cirgen-checklist',
        label: 'Checklist de Seguridad Quirúrgica',
        icon: 'CheckSquare',
        route: '/dashboard/medico/cirugia-general/checklist',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Lista de verificación OMS — Sign In, Time Out, Sign Out',
      },
      {
        key: 'cirgen-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-general/postop',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Evolución post-quirúrgica, complicaciones, alta',
      },
    ],

    lab: [
      {
        key: 'cirgen-prequirurgico',
        label: 'Laboratorio Pre-Quirúrgico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-general/prequirurgico',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['preop_lab_compliance'],
      },
      {
        key: 'cirgen-imagenologia',
        label: 'Imagenología Quirúrgica',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-general/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cirgen-patologia',
        label: 'Resultados de Patología',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-general/patologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'cirgen-calculadoras',
        label: 'Calculadoras Quirúrgicas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-general/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'ASA, riesgo cardiovascular, Goldman, Caprini',
      },
      {
        key: 'cirgen-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-general/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirgen-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-general/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirgen-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-general/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirgen-analytics',
        label: 'Análisis de Práctica Quirúrgica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-general/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'surgical-volume',
      component: '@/components/dashboard/medico/cirugia-general/widgets/surgical-volume-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'complication-tracker',
      component: '@/components/dashboard/medico/cirugia-general/widgets/complication-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-general/widgets/upcoming-surgeries-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'wound-status',
      component: '@/components/dashboard/medico/cirugia-general/widgets/wound-status-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'surgical_volume_monthly',
    'complication_rate_clavien_dindo',
    'readmission_rate_30d',
    'surgical_site_infection_rate',
    'avg_operative_time',
    'checklist_compliance',
  ],

  kpiDefinitions: {
    surgical_volume_monthly: {
      label: 'Volumen Quirúrgico Mensual',
      format: 'number',
      direction: 'higher_is_better',
    },
    complication_rate_clavien_dindo: {
      label: 'Tasa de Complicaciones (Clavien-Dindo III+)',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
    readmission_rate_30d: {
      label: 'Tasa de Reingreso a 30 Días',
      format: 'percentage',
      goal: 0.08,
      direction: 'lower_is_better',
    },
    surgical_site_infection_rate: {
      label: 'Tasa de Infección del Sitio Quirúrgico',
      format: 'percentage',
      goal: 0.03,
      direction: 'lower_is_better',
    },
    avg_operative_time: {
      label: 'Tiempo Operatorio Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    checklist_compliance: {
      label: 'Cumplimiento de Checklist de Seguridad',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'curacion',
      'retiro_puntos',
      'retiro_drenaje',
      'seguimiento',
      'urgencia_quirurgica',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_quirurgica',
      'examen_fisico_prequirurgico',
      'nota_operatoria',
      'evolucion_postquirurgica',
      'checklist_seguridad_oms',
      'consentimiento_informado',
      'protocolo_heridas',
      'registro_drenajes',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresASAClassification: true,
      requiresSurgicalChecklist: true,
      tracksWoundEvolution: true,
      tracksDrainOutput: true,
      usesClavienDindoClassification: true,
      requiresConsentForm: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Scissors',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA GENERAL
// ============================================================================

/**
 * Clasificación ASA (American Society of Anesthesiologists)
 * Evaluación del estado físico preoperatorio.
 */
export const ASA_CLASSIFICATION = [
  { class: 'ASA I', label: 'Paciente sano', description: 'Sin enfermedades orgánicas, fisiológicas, bioquímicas o psiquiátricas' },
  { class: 'ASA II', label: 'Enfermedad sistémica leve', description: 'Sin limitaciones funcionales (ej: HTA controlada, DM controlada, obesidad leve, embarazo)' },
  { class: 'ASA III', label: 'Enfermedad sistémica severa', description: 'Limitaciones funcionales definidas (ej: DM no controlada, EPOC, obesidad mórbida, HTA no controlada)' },
  { class: 'ASA IV', label: 'Enfermedad sistémica severa con amenaza vital', description: 'Disfunción severa de uno o más sistemas (ej: angina inestable, ICC descompensada, IRC en diálisis)' },
  { class: 'ASA V', label: 'Moribundo', description: 'No se espera sobrevida sin cirugía (ej: aneurisma aórtico roto, trauma masivo)' },
  { class: 'ASA VI', label: 'Muerte cerebral — Donante de órganos', description: 'Paciente con muerte cerebral declarada, mantenido para donación de órganos' },
] as const;

/**
 * Clasificación Clavien-Dindo de complicaciones quirúrgicas.
 */
export const CLAVIEN_DINDO_CLASSIFICATION = [
  { grade: 'I', label: 'Grado I', description: 'Desviación del curso post-op normal sin necesidad de tratamiento farmacológico, quirúrgico, endoscópico o radiológico. Permite antieméticos, antipiréticos, analgésicos, diuréticos, electrolitos, fisioterapia.' },
  { grade: 'II', label: 'Grado II', description: 'Requiere tratamiento farmacológico con fármacos distintos a los permitidos en Grado I. Incluye transfusiones y nutrición parenteral total.' },
  { grade: 'IIIa', label: 'Grado IIIa', description: 'Requiere intervención quirúrgica, endoscópica o radiológica SIN anestesia general.' },
  { grade: 'IIIb', label: 'Grado IIIb', description: 'Requiere intervención quirúrgica, endoscópica o radiológica CON anestesia general.' },
  { grade: 'IVa', label: 'Grado IVa', description: 'Complicación con riesgo vital — disfunción de UN órgano (incluye diálisis).' },
  { grade: 'IVb', label: 'Grado IVb', description: 'Complicación con riesgo vital — disfunción MULTIORGÁNICA.' },
  { grade: 'V', label: 'Grado V', description: 'Muerte del paciente.' },
] as const;

/**
 * Checklist de Seguridad Quirúrgica OMS — Fases.
 */
export const SURGICAL_SAFETY_CHECKLIST_PHASES = [
  {
    phase: 'sign_in',
    label: 'Sign In (Antes de la inducción anestésica)',
    items: [
      'Identidad del paciente confirmada',
      'Sitio quirúrgico marcado',
      'Consentimiento informado firmado',
      'Pulsioxímetro colocado y funcionando',
      'Alergias conocidas verificadas',
      'Vía aérea difícil evaluada',
      'Riesgo de hemorragia evaluado',
    ],
  },
  {
    phase: 'time_out',
    label: 'Time Out (Antes de la incisión)',
    items: [
      'Todos los miembros del equipo se presentan',
      'Confirmación de paciente, sitio y procedimiento',
      'Profilaxis antibiótica administrada (últimos 60 min)',
      'Imágenes esenciales disponibles',
      'Eventos críticos anticipados por cirujano',
      'Eventos críticos anticipados por anestesiólogo',
      'Esterilidad del instrumental confirmada',
    ],
  },
  {
    phase: 'sign_out',
    label: 'Sign Out (Antes de salir del quirófano)',
    items: [
      'Nombre del procedimiento registrado',
      'Recuento de instrumental, gasas y agujas correcto',
      'Muestras etiquetadas correctamente',
      'Problemas con equipos identificados',
      'Plan de recuperación y cuidados post-operatorios comunicado',
    ],
  },
] as const;
