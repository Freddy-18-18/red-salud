/**
 * @file overrides/audiologia.ts
 * @description Override de configuración para Audiología.
 *
 * Módulos especializados: audiograma tonal puro, scores de
 * reconocimiento de habla, adaptación de audífonos, resultados ABR,
 * evaluación de tinnitus (THI), pruebas vestibulares.
 *
 * También exporta constantes de dominio: tipos de audiometría,
 * clasificación de tinnitus, pruebas vestibulares.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Audiología.
 * Especialidad centrada en evaluación y rehabilitación auditiva y vestibular.
 */
export const audiologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'audiologia',
  dashboardPath: '/dashboard/medico/audiologia',

  modules: {
    clinical: [
      {
        key: 'audio-consulta',
        label: 'Consulta Audiológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/audiologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'audio-audiograma',
        label: 'Audiograma Tonal Puro',
        icon: 'Headphones',
        route: '/dashboard/medico/audiologia/audiograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Audiometría tonal liminar, vía aérea y ósea, PTA, configuración de pérdida',
      },
      {
        key: 'audio-logoaudiometria',
        label: 'Reconocimiento de Habla',
        icon: 'MessageCircle',
        route: '/dashboard/medico/audiologia/logoaudiometria',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'SRT, WRS (Word Recognition Score), discriminación del habla',
        kpiKeys: ['speech_recognition_improvement'],
      },
      {
        key: 'audio-adaptacion-audifonos',
        label: 'Adaptación de Audífonos',
        icon: 'Ear',
        route: '/dashboard/medico/audiologia/adaptacion-audifonos',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Selección, fitting, REM (Real Ear Measurement), verificación, seguimiento',
        kpiKeys: ['hearing_aid_satisfaction'],
      },
      {
        key: 'audio-potenciales-evocados',
        label: 'Potenciales Evocados Auditivos (ABR)',
        icon: 'Activity',
        route: '/dashboard/medico/audiologia/potenciales-evocados',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'ABR, ASSR, screening neonatal, umbrales electrofisiológicos',
      },
      {
        key: 'audio-tinnitus',
        label: 'Evaluación de Tinnitus',
        icon: 'Bell',
        route: '/dashboard/medico/audiologia/tinnitus',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'THI (Tinnitus Handicap Inventory), caracterización, plan de manejo',
      },
      {
        key: 'audio-vestibular',
        label: 'Pruebas Vestibulares',
        icon: 'RotateCcw',
        route: '/dashboard/medico/audiologia/vestibular',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'VNG, VEMP, vHIT, pruebas calóricas, Dix-Hallpike',
        kpiKeys: ['vestibular_recovery_rate'],
      },
    ],

    lab: [
      {
        key: 'audio-impedanciometria',
        label: 'Impedanciometría',
        icon: 'BarChart',
        route: '/dashboard/medico/audiologia/impedanciometria',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Timpanometría, reflejos acústicos, compliance',
      },
      {
        key: 'audio-oae',
        label: 'Emisiones Otoacústicas (OAE)',
        icon: 'Waves',
        route: '/dashboard/medico/audiologia/oae',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'TEOAE, DPOAE, screening auditivo, función coclear',
      },
      {
        key: 'audio-imagenologia',
        label: 'Imagenología Audiológica',
        icon: 'Image',
        route: '/dashboard/medico/audiologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'TC de oído, resonancia de CAI, estudios de implante coclear',
      },
    ],

    technology: [
      {
        key: 'audio-calculadoras',
        label: 'Calculadoras Audiológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/audiologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'PTA, fórmulas de ganancia (NAL-NL2, DSLv5), THI scoring',
      },
    ],

    communication: [
      {
        key: 'audio-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/audiologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'audio-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/audiologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'audio-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/audiologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'audiogram-display',
      component: '@/components/dashboard/medico/audiologia/widgets/audiogram-display-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'hearing-aid-fitting',
      component: '@/components/dashboard/medico/audiologia/widgets/hearing-aid-fitting-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'tinnitus-assessment',
      component: '@/components/dashboard/medico/audiologia/widgets/tinnitus-assessment-widget',
      size: 'medium',
    },
    {
      key: 'vestibular-summary',
      component: '@/components/dashboard/medico/audiologia/widgets/vestibular-summary-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'hearing_aid_satisfaction',
    'speech_recognition_improvement',
    'vestibular_recovery_rate',
    'thi_improvement',
    'neonatal_screening_coverage',
    'follow_up_compliance',
  ],

  kpiDefinitions: {
    hearing_aid_satisfaction: {
      label: 'Satisfacción con Audífonos',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    speech_recognition_improvement: {
      label: 'Mejora en Reconocimiento de Habla',
      format: 'percentage',
      goal: 0.3,
      direction: 'higher_is_better',
    },
    vestibular_recovery_rate: {
      label: 'Tasa de Recuperación Vestibular',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    thi_improvement: {
      label: 'Mejora en THI',
      format: 'number',
      goal: 20,
      direction: 'higher_is_better',
    },
    neonatal_screening_coverage: {
      label: 'Cobertura de Screening Neonatal',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    follow_up_compliance: {
      label: 'Adherencia al Seguimiento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'audiometria_tonal',
      'logoaudiometria',
      'adaptacion_audifonos',
      'control_audifonos',
      'potenciales_evocados',
      'evaluacion_tinnitus',
      'evaluacion_vestibular',
      'screening_neonatal',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_audiologica',
      'informe_audiometria',
      'informe_logoaudiometria',
      'informe_impedanciometria',
      'informe_abr',
      'informe_oae',
      'adaptacion_audifonos',
      'evaluacion_tinnitus',
      'evaluacion_vestibular',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: false,
    customFlags: {
      requiresAudiogram: true,
      supportsHearingAidFitting: true,
      supportsABR: true,
      tracksTinnitus: true,
      supportsVestibularTesting: true,
      supportsNeonatalScreening: true,
    },
  },

  theme: {
    primaryColor: '#0891B2',
    accentColor: '#0E7490',
    icon: 'Headphones',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO AUDIOLÓGICO
// ============================================================================

/**
 * Tipos de audiometría
 */
export const AUDIOMETRY_TYPES = [
  { key: 'pure_tone_air', label: 'Tonal Liminar Vía Aérea', description: 'Umbrales por vía aérea (125-8000 Hz)', clinical: 'Detecta tipo y grado de pérdida' },
  { key: 'pure_tone_bone', label: 'Tonal Liminar Vía Ósea', description: 'Umbrales por vía ósea (250-4000 Hz)', clinical: 'Diferencia conductiva vs neurosensorial' },
  { key: 'speech_srt', label: 'Logoaudiometría SRT', description: 'Umbral de recepción del habla', clinical: 'Correlaciona con PTA' },
  { key: 'speech_wrs', label: 'Logoaudiometría WRS', description: 'Score de reconocimiento de palabras', clinical: 'Predice beneficio de amplificación' },
  { key: 'high_frequency', label: 'Alta Frecuencia (>8kHz)', description: 'Umbrales 8000-16000 Hz', clinical: 'Detección temprana de ototoxicidad' },
] as const;

/**
 * Clasificación de severidad del tinnitus (THI)
 */
export const TINNITUS_SEVERITY_THI = [
  { grade: 1, range: '0-16', label: 'Leve (Grado 1)', description: 'Solo percibido en ambientes silenciosos' },
  { grade: 2, range: '18-36', label: 'Leve (Grado 2)', description: 'Fácilmente enmascarado, no interfiere con sueño' },
  { grade: 3, range: '38-56', label: 'Moderado (Grado 3)', description: 'Notado en presencia de ruido de fondo, puede interferir con sueño' },
  { grade: 4, range: '58-76', label: 'Severo (Grado 4)', description: 'Casi siempre percibido, interfiere con sueño y actividades' },
  { grade: 5, range: '78-100', label: 'Catastrófico (Grado 5)', description: 'Siempre percibido, incapacitante' },
] as const;

/**
 * Pruebas vestibulares comunes
 */
export const VESTIBULAR_TESTS = [
  { key: 'dix_hallpike', label: 'Dix-Hallpike', target: 'VPPB posterior', description: 'Maniobra provocadora para vértigo posicional' },
  { key: 'head_impulse_test', label: 'vHIT (Video Head Impulse)', target: 'Función canales semicirculares', description: 'Evaluación del reflejo vestíbulo-ocular' },
  { key: 'caloric_test', label: 'Prueba Calórica', target: 'Función canal horizontal', description: 'Irrigación agua fría/caliente, evalúa simetría' },
  { key: 'vemp', label: 'VEMP (cVEMP/oVEMP)', target: 'Sáculo y utrículo', description: 'Potenciales evocados vestibulares miogénicos' },
  { key: 'vng', label: 'VNG (Videonistagmografía)', target: 'Nistagmo espontáneo/provocado', description: 'Registro de movimientos oculares con videocámaras' },
  { key: 'posturography', label: 'Posturografía Dinámica', target: 'Equilibrio global', description: 'Evaluación objetiva del equilibrio' },
] as const;
