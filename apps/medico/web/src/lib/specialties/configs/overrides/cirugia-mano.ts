/**
 * @file overrides/cirugia-mano.ts
 * @description Override de configuración para Cirugía de Mano.
 *
 * Módulos especializados: seguimiento de reparación tendinosa, resultados
 * de conducción nerviosa, medición de fuerza de agarre, documentación
 * de ROM, registros de microcirugía, reimplantación.
 *
 * KPIs: recuperación de ROM, mejora de fuerza de agarre, retorno a función.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Cirugía de Mano.
 * Especialidad quirúrgica con énfasis en función, microcirugía
 * y rehabilitación de la mano.
 */
export const cirugiaManoOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'cirugia-mano',
  dashboardPath: '/dashboard/medico/cirugia-mano',

  modules: {
    clinical: [
      {
        key: 'cirmano-consulta',
        label: 'Consulta de Mano',
        icon: 'Stethoscope',
        route: '/dashboard/medico/cirugia-mano/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'cirmano-tendones',
        label: 'Reparación Tendinosa',
        icon: 'Link',
        route: '/dashboard/medico/cirugia-mano/tendones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Seguimiento de reparación de tendones flexores y extensores',
      },
      {
        key: 'cirmano-nervios',
        label: 'Conducción Nerviosa',
        icon: 'Zap',
        route: '/dashboard/medico/cirugia-mano/nervios',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'EMG/VCN, neurorrafia, injerto nervioso, evaluación sensitiva',
      },
      {
        key: 'cirmano-fuerza',
        label: 'Medición de Fuerza de Agarre',
        icon: 'Grip',
        route: '/dashboard/medico/cirugia-mano/fuerza',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Dinamometría Jamar, pinch test, evolución comparativa',
      },
      {
        key: 'cirmano-rom',
        label: 'Documentación de ROM',
        icon: 'RotateCw',
        route: '/dashboard/medico/cirugia-mano/rom',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Rango de movimiento activo y pasivo, TAM, TPM',
      },
      {
        key: 'cirmano-microcirugia',
        label: 'Registros de Microcirugía',
        icon: 'Microscope',
        route: '/dashboard/medico/cirugia-mano/microcirugia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Anastomosis vasculares, neurorrafias, transferencias',
      },
      {
        key: 'cirmano-reimplantacion',
        label: 'Reimplantación',
        icon: 'RefreshCw',
        route: '/dashboard/medico/cirugia-mano/reimplantacion',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Amputaciones traumáticas, revascularización, viabilidad',
      },
      {
        key: 'cirmano-nota-operatoria',
        label: 'Nota Operatoria',
        icon: 'FileText',
        route: '/dashboard/medico/cirugia-mano/nota-operatoria',
        group: 'clinical',
        order: 8,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'cirmano-emg',
        label: 'Electromiografía / VCN',
        icon: 'Activity',
        route: '/dashboard/medico/cirugia-mano/emg',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Resultados de estudios de conducción nerviosa y EMG',
      },
      {
        key: 'cirmano-imagenologia',
        label: 'Imagenología de Mano',
        icon: 'Scan',
        route: '/dashboard/medico/cirugia-mano/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Radiografías, ecografía, RMN de muñeca y mano',
      },
    ],

    technology: [
      {
        key: 'cirmano-calculadoras',
        label: 'Calculadoras de Mano',
        icon: 'Calculator',
        route: '/dashboard/medico/cirugia-mano/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'TAM/TPM, DASH score, capacidad funcional',
      },
      {
        key: 'cirmano-planificacion',
        label: 'Planificación Quirúrgica',
        icon: 'Calendar',
        route: '/dashboard/medico/cirugia-mano/planificacion',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'cirmano-rehabilitacion',
        label: 'Coordinación de Rehabilitación',
        icon: 'Users',
        route: '/dashboard/medico/cirugia-mano/rehabilitacion',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
        description: 'Terapia de mano, férulas, protocolos de movilización',
      },
      {
        key: 'cirmano-consentimiento',
        label: 'Consentimiento Informado',
        icon: 'FileSignature',
        route: '/dashboard/medico/cirugia-mano/consentimiento',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'cirmano-analytics',
        label: 'Análisis de Resultados Funcionales',
        icon: 'TrendingUp',
        route: '/dashboard/medico/cirugia-mano/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'rom-recovery',
      component: '@/components/dashboard/medico/cirugia-mano/widgets/rom-recovery-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'grip-strength',
      component: '@/components/dashboard/medico/cirugia-mano/widgets/grip-strength-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'microsurgery-log',
      component: '@/components/dashboard/medico/cirugia-mano/widgets/microsurgery-log-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'upcoming-surgeries',
      component: '@/components/dashboard/medico/cirugia-mano/widgets/upcoming-surgeries-widget',
      size: 'large',
    },
  ],

  prioritizedKpis: [
    'rom_recovery_rate',
    'grip_strength_improvement',
    'return_to_function_rate',
    'nerve_recovery_rate',
    'replantation_survival_rate',
    'dash_score_improvement',
  ],

  kpiDefinitions: {
    rom_recovery_rate: {
      label: 'Recuperación de Rango de Movimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    grip_strength_improvement: {
      label: 'Mejora de Fuerza de Agarre',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    return_to_function_rate: {
      label: 'Retorno a Función',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    nerve_recovery_rate: {
      label: 'Recuperación Nerviosa (S3+ en escala MRC)',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    replantation_survival_rate: {
      label: 'Sobrevida de Reimplantación',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    dash_score_improvement: {
      label: 'Mejora en Score DASH',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_prequirurgica',
      'control_postquirurgico',
      'evaluacion_rom',
      'evaluacion_fuerza',
      'control_tendon',
      'control_nervio',
      'retiro_material',
      'seguimiento_reimplantacion',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_mano',
      'examen_fisico_mano',
      'evaluacion_rom',
      'evaluacion_fuerza_agarre',
      'nota_operatoria',
      'registro_microcirugia',
      'protocolo_reimplantacion',
      'plan_rehabilitacion',
      'consentimiento_informado',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksTendonRepair: true,
      tracksNerveConductionResults: true,
      tracksGripStrength: true,
      documentsROM: true,
      supportsMicrosurgeryLogs: true,
      tracksReplantation: true,
      usesDASHScore: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#991B1B',
    icon: 'Hand',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — CIRUGÍA DE MANO
// ============================================================================

/**
 * Zonas de tendones flexores de la mano.
 */
export const FLEXOR_TENDON_ZONES = [
  { zone: 'I', label: 'Zona I — Distal a FDS', description: 'Solo FDP, desde inserción en falange distal hasta inserción de FDS', prognosis: 'Buena' },
  { zone: 'II', label: 'Zona II — "Tierra de Nadie"', description: 'FDP y FDS dentro de vaina sinovial digital (A1-A5)', prognosis: 'Más difícil — adherencias frecuentes' },
  { zone: 'III', label: 'Zona III — Palma (lumbricales)', description: 'Desde borde distal del túnel carpiano hasta polea A1', prognosis: 'Buena' },
  { zone: 'IV', label: 'Zona IV — Túnel Carpiano', description: 'Dentro del retináculo flexor', prognosis: 'Intermedia' },
  { zone: 'V', label: 'Zona V — Antebrazo distal', description: 'Proximal al túnel carpiano hasta unión miotendinosa', prognosis: 'Buena' },
] as const;

/**
 * Clasificación de Strickland para resultados de reparación de tendones flexores.
 * Basada en TAM (Total Active Motion).
 */
export const STRICKLAND_CLASSIFICATION = [
  { result: 'Excelente', tamPercentage: '≥85%', criteria: 'TAM ≥ 85% del lado normal' },
  { result: 'Bueno', tamPercentage: '70-84%', criteria: 'TAM 70-84% del lado normal' },
  { result: 'Regular', tamPercentage: '50-69%', criteria: 'TAM 50-69% del lado normal' },
  { result: 'Pobre', tamPercentage: '<50%', criteria: 'TAM < 50% del lado normal' },
] as const;

/**
 * Criterios para reimplantación de dígitos.
 */
export const REPLANTATION_CRITERIA = {
  absolute_indications: [
    'Amputación de pulgar',
    'Amputación múltiple de dedos',
    'Amputación en niños',
    'Amputación a nivel de muñeca o antebrazo',
    'Amputación a nivel de palma (a través de metacarpianos)',
  ],
  relative_indications: [
    'Amputación de dedo único (excepto pulgar) — depende de ocupación',
    'Avulsión de anillo (clasificación Urbaniak)',
    'Amputación individual distal a inserción FDS',
  ],
  contraindications: [
    'Aplastamiento severo o multilevel',
    'Isquemia caliente >12 horas (>24h si isquemia fría)',
    'Paciente inestable hemodinámicamente',
    'Enfermedades sistémicas severas que impidan microcirugía',
    'Contaminación severa con tejidos no viables',
    'Paciente no cooperador o con trastorno psiquiátrico severo',
  ],
} as const;

/**
 * Escala de recuperación sensitiva del Medical Research Council (MRC).
 */
export const MRC_SENSORY_RECOVERY = [
  { grade: 'S0', label: 'Sin recuperación', description: 'Anestesia completa en territorio autónomo' },
  { grade: 'S1', label: 'Dolor profundo', description: 'Recuperación de sensibilidad dolorosa profunda cutánea' },
  { grade: 'S2', label: 'Dolor superficial + tacto', description: 'Recuperación de dolor superficial y algo de tacto' },
  { grade: 'S2+', label: 'Como S2 + hiperestesia', description: 'S2 con respuesta exagerada al estímulo' },
  { grade: 'S3', label: 'Dolor + tacto sin sobrerespuesta', description: 'Recuperación de dolor y tacto, desaparece hiperestesia' },
  { grade: 'S3+', label: 'S3 + localización', description: 'Buena localización del estímulo, discriminación 2 puntos 7-15mm' },
  { grade: 'S4', label: 'Recuperación completa', description: 'Discriminación 2 puntos 2-6mm, normal' },
] as const;
