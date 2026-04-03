/**
 * @file overrides/medicina-deporte.ts
 * @description Override de configuración para Medicina del Deporte.
 *
 * Módulos especializados: documentación de lesiones, protocolos
 * de retorno al juego, pruebas de rendimiento (VO2max, lactato),
 * manejo de conmoción (SCAT5), ecografía musculoesquelética,
 * prescripción de ejercicio.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const medicinaDeporteOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-deporte',
  dashboardPath: '/dashboard/medico/medicina-deporte',

  modules: {
    clinical: [
      {
        key: 'deportiva-consulta',
        label: 'Consulta de Medicina Deportiva',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-deporte/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'deportiva-lesiones',
        label: 'Documentación de Lesiones',
        icon: 'AlertCircle',
        route: '/dashboard/medico/medicina-deporte/lesiones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-retorno-juego',
        label: 'Protocolos de Retorno al Juego',
        icon: 'Trophy',
        route: '/dashboard/medico/medicina-deporte/retorno-juego',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['return_to_play_time'],
      },
      {
        key: 'deportiva-rendimiento',
        label: 'Pruebas de Rendimiento',
        icon: 'Activity',
        route: '/dashboard/medico/medicina-deporte/rendimiento',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['performance_metrics_tracked'],
      },
      {
        key: 'deportiva-conmocion',
        label: 'Manejo de Conmoción (SCAT5)',
        icon: 'Brain',
        route: '/dashboard/medico/medicina-deporte/conmocion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-ecografia',
        label: 'Ecografía Musculoesquelética',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-deporte/ecografia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-prescripcion-ejercicio',
        label: 'Prescripción de Ejercicio',
        icon: 'Dumbbell',
        route: '/dashboard/medico/medicina-deporte/prescripcion-ejercicio',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'deportiva-vo2max',
        label: 'Ergoespirometría (VO2max)',
        icon: 'Wind',
        route: '/dashboard/medico/medicina-deporte/vo2max',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-lactato',
        label: 'Curvas de Lactato',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-deporte/lactato',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-composicion',
        label: 'Composición Corporal',
        icon: 'BarChart3',
        route: '/dashboard/medico/medicina-deporte/composicion',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'deportiva-calculadoras',
        label: 'Calculadoras Deportivas',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-deporte/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-wearables',
        label: 'Datos de Wearables',
        icon: 'Watch',
        route: '/dashboard/medico/medicina-deporte/wearables',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'deportiva-portal-atleta',
        label: 'Portal del Atleta',
        icon: 'User',
        route: '/dashboard/medico/medicina-deporte/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'deportiva-equipo-tecnico',
        label: 'Comunicación con Equipo Técnico',
        icon: 'Users',
        route: '/dashboard/medico/medicina-deporte/equipo-tecnico',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'deportiva-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-deporte/remisiones',
        group: 'communication',
        order: 3,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'deportiva-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-deporte/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'injury-tracker',
      component: '@/components/dashboard/medico/medicina-deporte/widgets/injury-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'return-to-play-status',
      component: '@/components/dashboard/medico/medicina-deporte/widgets/return-to-play-status-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'performance-metrics',
      component: '@/components/dashboard/medico/medicina-deporte/widgets/performance-metrics-widget',
      size: 'medium',
    },
  ],

  prioritizedKpis: [
    'return_to_play_time',
    'reinjury_rate',
    'performance_metrics_tracked',
    'concussion_clearance_compliance',
    'injury_prevention_rate',
    'athlete_satisfaction_score',
  ],

  kpiDefinitions: {
    return_to_play_time: {
      label: 'Tiempo de Retorno al Juego',
      format: 'duration',
      direction: 'lower_is_better',
    },
    reinjury_rate: {
      label: 'Tasa de Relesión',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    performance_metrics_tracked: {
      label: 'Métricas de Rendimiento Registradas',
      format: 'number',
      direction: 'higher_is_better',
    },
    concussion_clearance_compliance: {
      label: 'Cumplimiento de Protocolo de Conmoción',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
    injury_prevention_rate: {
      label: 'Tasa de Prevención de Lesiones',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    athlete_satisfaction_score: {
      label: 'Satisfacción del Atleta',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'evaluacion_predeportiva',
      'lesion_aguda',
      'seguimiento_lesion',
      'retorno_al_juego',
      'evaluacion_conmocion',
      'ergoespirometria',
      'prescripcion_ejercicio',
      'ecografia_msk',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'evaluacion_predeportiva',
      'documentacion_lesion',
      'protocolo_retorno_juego',
      'evaluacion_scat5',
      'informe_ergoespirometria',
      'prescripcion_ejercicio',
      'informe_ecografia_msk',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksInjuries: true,
      supportsReturnToPlayProtocols: true,
      requiresConcussionProtocol: true,
      supportsPerformanceTesting: true,
      supportsMSKUltrasound: true,
      tracksExercisePrescription: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'Dumbbell',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE MEDICINA DEL DEPORTE
// ============================================================================

/**
 * Etapas del protocolo de retorno al juego (conmoción cerebral)
 */
export const CONCUSSION_RETURN_TO_PLAY_STAGES = [
  { stage: 1, label: 'Reposo Sintomático', activity: 'Actividades diarias que no provocan síntomas', duration: '24h mínimo' },
  { stage: 2, label: 'Ejercicio Aeróbico Ligero', activity: 'Caminata, natación, bicicleta estática (<70% FCmax)', duration: '24h mínimo' },
  { stage: 3, label: 'Ejercicio Específico del Deporte', activity: 'Drills de carrera, patinaje sin contacto', duration: '24h mínimo' },
  { stage: 4, label: 'Entrenamiento sin Contacto', activity: 'Drills complejos, entrenamiento de resistencia', duration: '24h mínimo' },
  { stage: 5, label: 'Práctica con Contacto Completo', activity: 'Participación normal en entrenamiento', duration: 'Aprobación médica' },
  { stage: 6, label: 'Retorno al Juego', activity: 'Competición normal', duration: 'Completado' },
] as const;

/**
 * Clasificación de lesiones musculares (Munich Consensus)
 */
export const MUSCLE_INJURY_CLASSIFICATION = [
  { type: 'functional', grade: '1A', label: 'Fatiga Muscular', description: 'Sobrecarga sin daño estructural', recovery: '1-3 días' },
  { type: 'functional', grade: '1B', label: 'DOMS', description: 'Dolor muscular de aparición tardía', recovery: '1-3 días' },
  { type: 'functional', grade: '2A', label: 'Contractura Neuromuscular', description: 'Espasmo sin daño estructural', recovery: '5-7 días' },
  { type: 'functional', grade: '2B', label: 'Contractura Muscular', description: 'Aumento de tono persistente', recovery: '7-14 días' },
  { type: 'structural', grade: '3A', label: 'Desgarro Parcial Menor', description: '< 5mm de fibras afectadas', recovery: '2-3 semanas' },
  { type: 'structural', grade: '3B', label: 'Desgarro Parcial Moderado', description: '> 5mm, afecta fascia parcialmente', recovery: '4-8 semanas' },
  { type: 'structural', grade: '4', label: 'Desgarro Completo / Avulsión', description: 'Rotura total de fibras o avulsión tendinosa', recovery: '12+ semanas' },
] as const;
