/**
 * @file overrides/dermatologia.ts
 * @description Override de configuración para Dermatología.
 *
 * Módulos especializados: mapeo de lesiones (diagrama corporal),
 * seguimiento dermatoscópico, registro de biopsias, scoring SCORAD/PASI,
 * fototerapia UV, screening de cáncer de piel.
 *
 * También exporta constantes de dominio dermatológico: regla ABCDE,
 * escalas de severidad, tipos de biopsia, fototipos de Fitzpatrick.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Dermatología.
 * Especialidad con módulos clínicos centrados en diagnóstico visual y seguimiento de lesiones.
 */
export const dermatologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'dermatologia',
  dashboardPath: '/dashboard/medico/dermatologia',

  modules: {
    clinical: [
      {
        key: 'dermato-consulta',
        label: 'Consulta Dermatológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/dermatologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'dermato-mapeo-lesiones',
        label: 'Mapeo de Lesiones',
        icon: 'MapPin',
        route: '/dashboard/medico/dermatologia/mapeo-lesiones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'Diagrama corporal interactivo para documentar localización y evolución de lesiones',
      },
      {
        key: 'dermato-dermatoscopia',
        label: 'Dermatoscopía',
        icon: 'Scan',
        route: '/dashboard/medico/dermatologia/dermatoscopia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Imágenes dermatoscópicas, comparación temporal, algoritmos diagnósticos',
      },
      {
        key: 'dermato-biopsia',
        label: 'Registro de Biopsias',
        icon: 'Microscope',
        route: '/dashboard/medico/dermatologia/biopsia',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['biopsy_rate'],
      },
      {
        key: 'dermato-scoring',
        label: 'Scoring SCORAD / PASI',
        icon: 'Calculator',
        route: '/dashboard/medico/dermatologia/scoring',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Escalas de severidad: SCORAD (dermatitis atópica), PASI (psoriasis), DLQI',
        kpiKeys: ['pasi_improvement'],
      },
      {
        key: 'dermato-fototerapia',
        label: 'Fototerapia UV',
        icon: 'Sun',
        route: '/dashboard/medico/dermatologia/fototerapia',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Registro de sesiones UVB/PUVA, dosis acumulada, fototipo',
      },
      {
        key: 'dermato-screening-cancer',
        label: 'Screening Cáncer de Piel',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/dermatologia/screening-cancer',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['melanoma_detection_rate'],
      },
    ],

    lab: [
      {
        key: 'dermato-histopatologia',
        label: 'Histopatología',
        icon: 'FlaskConical',
        route: '/dashboard/medico/dermatologia/histopatologia',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dermato-patch-test',
        label: 'Pruebas de Parche',
        icon: 'SquareStack',
        route: '/dashboard/medico/dermatologia/patch-test',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Pruebas epicutáneas para dermatitis de contacto',
      },
      {
        key: 'dermato-imagenologia',
        label: 'Imagenología Dermatológica',
        icon: 'Image',
        route: '/dashboard/medico/dermatologia/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'Fotografía clínica, dermatoscopía digital, mapeo corporal total',
      },
    ],

    technology: [
      {
        key: 'dermato-calculadoras',
        label: 'Calculadoras Dermatológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/dermatologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'BSA, PASI, SCORAD, DLQI, fototipo Fitzpatrick',
      },
    ],

    communication: [
      {
        key: 'dermato-portal-paciente',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/dermatologia/portal',
        group: 'communication',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'dermato-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/dermatologia/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'dermato-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/dermatologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'lesion-body-map',
      component: '@/components/dashboard/medico/dermatologia/widgets/lesion-body-map-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'dermoscopy-tracking',
      component: '@/components/dashboard/medico/dermatologia/widgets/dermoscopy-tracking-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'biopsy-registry',
      component: '@/components/dashboard/medico/dermatologia/widgets/biopsy-registry-widget',
      size: 'medium',
    },
    {
      key: 'pasi-scorad-trend',
      component: '@/components/dashboard/medico/dermatologia/widgets/pasi-scorad-trend-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'biopsy_rate',
    'melanoma_detection_rate',
    'pasi_improvement',
    'scorad_improvement',
    'phototherapy_compliance',
    'avg_consultation_duration',
  ],

  kpiDefinitions: {
    biopsy_rate: {
      label: 'Tasa de Biopsias',
      format: 'percentage',
      goal: 0.15,
      direction: 'higher_is_better',
    },
    melanoma_detection_rate: {
      label: 'Tasa de Detección de Melanoma',
      format: 'percentage',
      goal: 0.05,
      direction: 'higher_is_better',
    },
    pasi_improvement: {
      label: 'Mejora PASI Promedio',
      format: 'percentage',
      goal: 0.75,
      direction: 'higher_is_better',
    },
    scorad_improvement: {
      label: 'Mejora SCORAD Promedio',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    phototherapy_compliance: {
      label: 'Adherencia a Fototerapia',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    avg_consultation_duration: {
      label: 'Duración Promedio de Consulta',
      format: 'duration',
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'dermatoscopia',
      'biopsia',
      'fototerapia',
      'cirugia_dermatologica',
      'screening_cancer_piel',
      'patch_test',
      'control_tratamiento',
    ],
    defaultDuration: 20,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_dermatologica',
      'examen_dermatologico',
      'descripcion_lesion',
      'informe_dermatoscopia',
      'informe_biopsia',
      'plan_fototerapia',
      'screening_cancer_piel',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      requiresBodyDiagram: true,
      supportsDermoscopy: true,
      requiresPhotographicDocumentation: true,
      usesScoringScales: true,
      supportsPhototherapy: true,
      tracksFitzpatrickPhototype: true,
    },
  },

  theme: {
    primaryColor: '#EC4899',
    accentColor: '#BE185D',
    icon: 'Scan',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DERMATOLÓGICO
// ============================================================================

/**
 * Regla ABCDE para evaluación de lesiones pigmentadas
 */
export const ABCDE_CRITERIA = [
  { key: 'asymmetry', label: 'Asimetría', description: 'La mitad de la lesión no coincide con la otra mitad' },
  { key: 'border', label: 'Bordes', description: 'Bordes irregulares, mal definidos o dentados' },
  { key: 'color', label: 'Color', description: 'Variación de color dentro de la lesión (marrón, negro, rojo, blanco, azul)' },
  { key: 'diameter', label: 'Diámetro', description: 'Mayor a 6mm (tamaño de un borrador de lápiz)' },
  { key: 'evolution', label: 'Evolución', description: 'Cambios en tamaño, forma, color o síntomas en el tiempo' },
] as const;

/**
 * Fototipos de Fitzpatrick
 */
export const FITZPATRICK_PHOTOTYPES = [
  { type: 'I', skin: 'Muy clara', sunResponse: 'Siempre se quema, nunca se broncea', uvSensitivity: 'Muy alta' },
  { type: 'II', skin: 'Clara', sunResponse: 'Se quema fácilmente, bronceado mínimo', uvSensitivity: 'Alta' },
  { type: 'III', skin: 'Intermedia', sunResponse: 'Se quema moderadamente, bronceado gradual', uvSensitivity: 'Moderada' },
  { type: 'IV', skin: 'Oliva', sunResponse: 'Se quema poco, bronceado fácil', uvSensitivity: 'Baja' },
  { type: 'V', skin: 'Morena', sunResponse: 'Rara vez se quema, bronceado profundo', uvSensitivity: 'Muy baja' },
  { type: 'VI', skin: 'Oscura', sunResponse: 'Nunca se quema', uvSensitivity: 'Mínima' },
] as const;

/**
 * Tipos de biopsia dermatológica
 */
export const BIOPSY_TYPES = [
  { key: 'shave', label: 'Biopsia por Afeitado (Shave)', description: 'Corte tangencial superficial', depth: 'Epidermis y dermis superficial' },
  { key: 'punch', label: 'Biopsia en Sacabocados (Punch)', description: 'Cilindro de piel con sacabocados', depth: 'Espesor total hasta hipodermis' },
  { key: 'excisional', label: 'Biopsia Excisional', description: 'Extirpación completa de la lesión', depth: 'Espesor total' },
  { key: 'incisional', label: 'Biopsia Incisional', description: 'Extirpación parcial de la lesión', depth: 'Variable' },
  { key: 'curettage', label: 'Curetaje', description: 'Raspado de la lesión con cureta', depth: 'Superficial' },
] as const;
