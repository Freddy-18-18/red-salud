/**
 * @file overrides/cirugia-pediatrica.ts
 * @description Override de configuración para Cirugía Pediátrica.
 *
 * Módulos especializados: registro de anomalías congénitas, dosificación
 * ajustada por edad, seguimiento del impacto en crecimiento, procedimientos
 * mínimamente invasivos, cirugía neonatal.
 *
 * KPIs: resultados quirúrgicos, tasa de complicaciones, recuperación de crecimiento.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía Pediátrica.
 * Especialidad quirúrgica con énfasis en anomalías congénitas,
 * dosificación por peso/edad y seguimiento de crecimiento.
 */
export const cirugiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-pediatrica',
  dashboardPath: '/dashboard/medico/cirugia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'cirpedi-consulta',
        label: 'Consulta Quirúrgica Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirpedi-anomalias',
        label: 'Registro de Anomalías Congénitas',
        icon: 'ClipboardList',
        route: '/dashboard/medico/cirugia-pediatrica/anomalias',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Clasificación y seguimiento de malformaciones congénitas',
      },
      {
        key: 'cirpedi-neonatal',
        label: 'Cirugía Neonatal',
        icon: 'Baby',
        route: '/dashboard/medico/cirugia-pediatrica/neonatal',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Procedimientos en neonatos: atresias, onfalocele, gastrosquisis',
      },
      {
        key: 'cirpedi-minimamente-invasiva',
        label: 'Procedimientos Mínimamente Invasivos',
        icon: 'Monitor',
        route: '/dashboard/medico/cirugia-pediatrica/minimamente-invasiva',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Laparoscopia y toracoscopia pediátrica',
      },
      {
        key: 'cirpedi-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-pediatrica/nota-operatoria',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'cirpedi-postop',
        label: 'Seguimiento Post-Operatorio',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-pediatrica/postop',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Evolución, manejo del dolor pediátrico, criterios de alta',
      },
      {
        key: 'cirpedi-crecimiento',
        label: 'Seguimiento de Crecimiento',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-pediatrica/crecimiento',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Impacto de cirugía en curvas de crecimiento y desarrollo',
      },
    ],

    lab: [
      {
        key: 'cirpedi-prequirurgico',
        label: 'Laboratorio Pre-Quirúrgico Pediátrico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/cirugia-pediatrica/prequirurgico',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'cirpedi-imagenologia',
        label: 'Imagenología Pediátrica',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-pediatrica/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'cirpedi-dosificacion',
        label: 'Dosificación Ajustada',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-pediatrica/dosificacion',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Cálculo de dosis por peso, superficie corporal y edad',
      },
    ],

    technology: [
      {
        key: 'cirpedi-calculadoras',
        label: 'Calculadoras Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Superficie corporal, dosis, líquidos IV, riesgo anestésico',
      },
      {
        key: 'cirpedi-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-pediatrica/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirpedi-familia',
        label: 'Comunicación con Familia',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-pediatrica/familia',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Explicación del procedimiento, expectativas, consentimiento de padres',
      },
      {
        key: 'cirpedi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/cirugia-pediatrica/interconsultas',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirpedi-analytics',
        label: 'Análisis de Resultados',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'congenital-anomaly-registry',
      component: '@/components/dashboard/medico/cirugia-pediatrica/widgets/congenital-anomaly-registry-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'surgical-outcomes',
      component: '@/components/dashboard/medico/cirugia-pediatrica/widgets/surgical-outcomes-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'growth-impact',
      component: '@/components/dashboard/medico/cirugia-pediatrica/widgets/growth-impact-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-pediatrica/widgets/upcoming-surgeries-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'surgical_outcomes_success',
    'complication_rate',
    'growth_recovery_rate',
    'neonatal_surgery_survival',
    'avg_hospital_stay',
    'minimally_invasive_rate',
  ],

  kpiDefinitions: {
    surgical_outcomes_success: {
      label: 'Tasa de Éxito Quirúrgico',
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
    growth_recovery_rate: {
      label: 'Recuperación de Curva de Crecimiento',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    neonatal_surgery_survival: {
      label: 'Sobrevida en Cirugía Neonatal',
      format: 'percentage',
      goal: 0.92,
      direction: 'higher_is_better',
    },
    avg_hospital_stay: {
      label: 'Estancia Hospitalaria Promedio',
      format: 'duration',
      direction: 'lower_is_better',
    },
    minimally_invasive_rate: {
      label: 'Tasa de Procedimientos Mínimamente Invasivos',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'seguimiento_crecimiento',
      'evaluacion_anomalia_congenita',
      'consulta_neonatal',
      'seguimiento',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_pediatrica_quirurgica',
      'examen_fisico_pediatrico',
      'nota_operatoria',
      'evaluacion_anomalia_congenita',
      'seguimiento_neonatal',
      'evolucion_postquirurgica',
      'consentimiento_padres',
      'curva_crecimiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresAgeAdjustedDosing: true,
      tracksCongenitalAnomalies: true,
      tracksGrowthImpact: true,
      supportsNeonatalSurgery: true,
      requiresParentalConsent: true,
      usesWeightBasedCalculations: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Baby',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA PEDIÁTRICA
// ============================================================================

/**
 * Anomalías congénitas más frecuentes en cirugía pediátrica.
 */
export const COMMON_CONGENITAL_ANOMALIES = [
  { key: 'inguinal_hernia', label: 'Hernia Inguinal', system: 'Pared abdominal', frequency: 'Muy común' },
  { key: 'umbilical_hernia', label: 'Hernia Umbilical', system: 'Pared abdominal', frequency: 'Muy común' },
  { key: 'cryptorchidism', label: 'Criptorquidia', system: 'Genitourinario', frequency: 'Común' },
  { key: 'hypospadias', label: 'Hipospadia', system: 'Genitourinario', frequency: 'Común' },
  { key: 'pyloric_stenosis', label: 'Estenosis Pilórica', system: 'Gastrointestinal', frequency: 'Común' },
  { key: 'esophageal_atresia', label: 'Atresia Esofágica', system: 'Gastrointestinal', frequency: 'Poco frecuente' },
  { key: 'duodenal_atresia', label: 'Atresia Duodenal', system: 'Gastrointestinal', frequency: 'Poco frecuente' },
  { key: 'hirschsprung', label: 'Enfermedad de Hirschsprung', system: 'Gastrointestinal', frequency: 'Poco frecuente' },
  { key: 'omphalocele', label: 'Onfalocele', system: 'Pared abdominal', frequency: 'Raro' },
  { key: 'gastroschisis', label: 'Gastrosquisis', system: 'Pared abdominal', frequency: 'Raro' },
  { key: 'diaphragmatic_hernia', label: 'Hernia Diafragmática Congénita', system: 'Torácico', frequency: 'Raro' },
  { key: 'biliary_atresia', label: 'Atresia de Vías Biliares', system: 'Hepatobiliar', frequency: 'Raro' },
] as const;

/**
 * Grupos etarios pediátricos quirúrgicos con consideraciones anestésicas.
 */
export const PEDIATRIC_SURGICAL_AGE_GROUPS = [
  { key: 'neonatal', label: 'Neonatal (0-28 días)', considerations: 'Termorregulación, vía aérea pequeña, inmadurez hepática/renal, accesos vasculares difíciles' },
  { key: 'infant', label: 'Lactante (1-12 meses)', considerations: 'Volumen sanguíneo bajo, vía aérea anterior, riesgo de apnea post-anestésica' },
  { key: 'toddler', label: 'Preescolar (1-5 años)', considerations: 'Ansiedad de separación, cooperación limitada, vía aérea reactiva' },
  { key: 'school_age', label: 'Escolar (6-12 años)', considerations: 'Cooperación variable, considerar impacto psicológico de hospitalización' },
  { key: 'adolescent', label: 'Adolescente (13-17 años)', considerations: 'Considerar dosis adultas, aspectos de privacidad y autonomía' },
] as const;
