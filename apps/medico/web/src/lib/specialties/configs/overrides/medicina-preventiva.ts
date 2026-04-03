/**
 * @file overrides/medicina-preventiva.ts
 * @description Override de configuración para Medicina Preventiva.
 *
 * Promoción de salud y prevención de enfermedades — seguimiento de
 * esquemas de tamizaje, registros de vacunación, evaluación de
 * factores de riesgo, planes de promoción de salud, salud
 * ocupacional, vigilancia epidemiológica.
 *
 * También exporta constantes de dominio: esquemas de tamizaje
 * por edad/sexo, calendario vacunal adulto, factores de riesgo
 * modificables.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Medicina Preventiva.
 * Especialidad con enfoque poblacional e individual de prevención.
 */
export const medicinaPreventivaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'medicina-preventiva',
  dashboardPath: '/dashboard/medico/medicina-preventiva',

  modules: {
    clinical: [
      {
        key: 'prevent-consulta',
        label: 'Consulta Preventiva',
        icon: 'Stethoscope',
        route: '/dashboard/medico/medicina-preventiva/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
        description: 'Examen periódico de salud, evaluación de riesgos',
      },
      {
        key: 'prevent-tamizaje',
        label: 'Esquemas de Tamizaje',
        icon: 'ClipboardList',
        route: '/dashboard/medico/medicina-preventiva/tamizaje',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['screening_compliance'],
        description: 'Screening según edad/sexo: cáncer, cardiovascular, metabólico',
      },
      {
        key: 'prevent-vacunacion',
        label: 'Registro de Vacunación',
        icon: 'Syringe',
        route: '/dashboard/medico/medicina-preventiva/vacunacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['vaccination_coverage'],
        description: 'Calendario vacunal adulto, esquemas especiales, reacciones',
      },
      {
        key: 'prevent-factores-riesgo',
        label: 'Factores de Riesgo',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/medicina-preventiva/factores-riesgo',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['risk_factor_modification'],
        description: 'Tabaquismo, obesidad, sedentarismo, alcohol, dieta',
      },
      {
        key: 'prevent-promocion',
        label: 'Promoción de Salud',
        icon: 'HeartPulse',
        route: '/dashboard/medico/medicina-preventiva/promocion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Planes de actividad física, nutrición, salud mental, sueño',
      },
      {
        key: 'prevent-ocupacional',
        label: 'Salud Ocupacional',
        icon: 'HardHat',
        route: '/dashboard/medico/medicina-preventiva/ocupacional',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Exámenes periódicos, exposiciones, aptitud laboral',
      },
      {
        key: 'prevent-vigilancia',
        label: 'Vigilancia Epidemiológica',
        icon: 'BarChart3',
        route: '/dashboard/medico/medicina-preventiva/vigilancia',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Notificación obligatoria, brotes, indicadores de salud pública',
      },
    ],

    laboratory: [
      {
        key: 'prevent-laboratorio',
        label: 'Panel de Laboratorio Preventivo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/medicina-preventiva/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Lípidos, glucosa, HbA1c, hemograma, función renal, PSA',
      },
      {
        key: 'prevent-imagenologia',
        label: 'Imagenología de Tamizaje',
        icon: 'Scan',
        route: '/dashboard/medico/medicina-preventiva/imagenologia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Mamografía, Rx tórax, densitometría ósea, ecografía',
      },
    ],

    financial: [
      {
        key: 'prevent-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/medicina-preventiva/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'prevent-seguros',
        label: 'Seguros y Programas',
        icon: 'Shield',
        route: '/dashboard/medico/medicina-preventiva/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        description: 'Programas de prevención, cobertura de tamizaje, vacunación',
      },
    ],

    technology: [
      {
        key: 'prevent-calculadoras',
        label: 'Calculadoras de Riesgo',
        icon: 'Calculator',
        route: '/dashboard/medico/medicina-preventiva/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Framingham, ASCVD, SCORE2, FRAX, riesgo de cáncer',
      },
      {
        key: 'prevent-guias',
        label: 'Guías de Tamizaje',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-preventiva/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'USPSTF, ACS, AHA — recomendaciones de tamizaje por evidencia',
      },
    ],

    communication: [
      {
        key: 'prevent-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/medicina-preventiva/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'prevent-educacion',
        label: 'Educación al Paciente',
        icon: 'BookOpen',
        route: '/dashboard/medico/medicina-preventiva/educacion',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
        description: 'Material educativo, consejos personalizados, autogestión',
      },
    ],

    growth: [
      {
        key: 'prevent-analytics',
        label: 'Indicadores de Prevención',
        icon: 'TrendingUp',
        route: '/dashboard/medico/medicina-preventiva/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'screening-compliance',
      component: '@/components/dashboard/medico/medicina-preventiva/widgets/screening-compliance-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'vaccination-tracker',
      component: '@/components/dashboard/medico/medicina-preventiva/widgets/vaccination-tracker-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'risk-factor-dashboard',
      component: '@/components/dashboard/medico/medicina-preventiva/widgets/risk-factor-dashboard-widget',
      size: 'medium',
    },
    {
      key: 'screening-due',
      component: '@/components/dashboard/medico/medicina-preventiva/widgets/screening-due-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'screening_compliance',
    'vaccination_coverage',
    'risk_factor_modification',
    'early_detection_rate',
    'health_promotion_adherence',
    'epidemiological_reporting',
  ],

  kpiDefinitions: {
    screening_compliance: {
      label: 'Adherencia a Tamizaje',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    vaccination_coverage: {
      label: 'Cobertura Vacunal',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    risk_factor_modification: {
      label: 'Modificación de Factores de Riesgo',
      format: 'percentage',
      goal: 0.5,
      direction: 'higher_is_better',
    },
    early_detection_rate: {
      label: 'Tasa de Detección Temprana',
      format: 'percentage',
      direction: 'higher_is_better',
    },
    health_promotion_adherence: {
      label: 'Adherencia a Plan de Promoción',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    epidemiological_reporting: {
      label: 'Notificación Epidemiológica Oportuna',
      format: 'percentage',
      goal: 1.0,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'examen_periodico',
      'consulta_tamizaje',
      'vacunacion',
      'consejeria_riesgo',
      'evaluacion_ocupacional',
      'control_factores_riesgo',
      'seguimiento_preventivo',
      'educacion_salud',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'examen_periodico_salud',
      'evaluacion_factores_riesgo',
      'registro_vacunacion',
      'plan_tamizaje_personalizado',
      'consejeria_habitos',
      'evaluacion_ocupacional',
      'notificacion_epidemiologica',
      'plan_promocion_salud',
    ],
    usesTreatmentPlans: false,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksScreeningSchedules: true,
      requiresVaccinationRecords: true,
      assessesRiskFactors: true,
      supportsHealthPromotion: true,
      tracksOccupationalHealth: true,
      requiresEpidemiologicalSurveillance: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'ShieldCheck',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — MEDICINA PREVENTIVA
// ============================================================================

/**
 * Esquemas de tamizaje recomendados por edad y sexo (USPSTF / adaptado).
 */
export const SCREENING_SCHEDULES = {
  cancer: [
    { key: 'cervical', label: 'Cáncer Cervicouterino', test: 'Papanicolaou + VPH', startAge: 21, endAge: 65, interval: '3-5 años', sex: 'F' },
    { key: 'breast', label: 'Cáncer de Mama', test: 'Mamografía', startAge: 40, endAge: 74, interval: '1-2 años', sex: 'F' },
    { key: 'colorectal', label: 'Cáncer Colorrectal', test: 'Colonoscopía o FIT', startAge: 45, endAge: 75, interval: '1-10 años según método', sex: 'M/F' },
    { key: 'prostate', label: 'Cáncer de Próstata', test: 'PSA (decisión compartida)', startAge: 50, endAge: 70, interval: '1-2 años', sex: 'M' },
    { key: 'lung', label: 'Cáncer de Pulmón', test: 'TC baja dosis', startAge: 50, endAge: 80, interval: 'Anual', sex: 'M/F', condition: '≥ 20 pack-years' },
  ],
  cardiovascular: [
    { key: 'lipids', label: 'Perfil Lipídico', test: 'Colesterol total, LDL, HDL, TG', startAge: 20, interval: '5 años (si normal)', sex: 'M/F' },
    { key: 'hta', label: 'Hipertensión Arterial', test: 'Medición de PA', startAge: 18, interval: 'Cada consulta', sex: 'M/F' },
    { key: 'diabetes', label: 'Diabetes', test: 'Glucosa ayunas o HbA1c', startAge: 35, interval: '3 años', sex: 'M/F', condition: 'Sobrepeso/obesidad' },
  ],
  other: [
    { key: 'osteoporosis', label: 'Osteoporosis', test: 'Densitometría ósea (DEXA)', startAge: 65, interval: 'Según riesgo', sex: 'F' },
    { key: 'hepatitis_c', label: 'Hepatitis C', test: 'Anti-VHC', startAge: 18, endAge: 79, interval: 'Una vez', sex: 'M/F' },
    { key: 'hiv', label: 'VIH', test: 'ELISA 4ta gen', startAge: 15, endAge: 65, interval: 'Una vez (más si riesgo)', sex: 'M/F' },
    { key: 'depression', label: 'Depresión', test: 'PHQ-9', startAge: 12, interval: 'Anual', sex: 'M/F' },
  ],
} as const;

/**
 * Calendario vacunal del adulto (adaptado para Venezuela).
 */
export const ADULT_VACCINATION_SCHEDULE = [
  { vaccine: 'Influenza', frequency: 'Anual', indication: 'Todos los adultos', priority: 'alta' },
  { vaccine: 'COVID-19', frequency: 'Según esquema vigente', indication: 'Todos los adultos', priority: 'alta' },
  { vaccine: 'Td/Tdap', frequency: 'Cada 10 años (1 dosis Tdap)', indication: 'Todos los adultos', priority: 'alta' },
  { vaccine: 'Hepatitis B', frequency: '3 dosis (0-1-6 meses)', indication: 'No vacunados, personal de salud, riesgo', priority: 'alta' },
  { vaccine: 'Neumococo (PCV20 o PCV15+PPSV23)', frequency: '1-2 dosis', indication: '≥ 65 años, enfermedades crónicas, inmunosupresión', priority: 'alta' },
  { vaccine: 'Herpes Zóster (Shingrix)', frequency: '2 dosis', indication: '≥ 50 años', priority: 'media' },
  { vaccine: 'VPH', frequency: '2-3 dosis', indication: 'Hasta 26 años (catch-up hasta 45)', priority: 'media' },
  { vaccine: 'Fiebre Amarilla', frequency: 'Dosis única', indication: 'Viajeros a zonas endémicas, residentes de áreas de riesgo', priority: 'según riesgo' },
] as const;

/**
 * Factores de riesgo modificables con metas.
 */
export const MODIFIABLE_RISK_FACTORS = [
  { key: 'smoking', label: 'Tabaquismo', goal: 'Cesación completa', intervention: '5A: Ask, Advise, Assess, Assist, Arrange' },
  { key: 'obesity', label: 'Obesidad', goal: 'IMC 18.5-24.9', intervention: 'Dieta + actividad física + consejería' },
  { key: 'sedentarism', label: 'Sedentarismo', goal: '≥ 150 min/semana actividad moderada', intervention: 'Prescripción de ejercicio' },
  { key: 'alcohol', label: 'Consumo de Alcohol', goal: '≤ 1 copa/día mujeres, ≤ 2 hombres', intervention: 'AUDIT + intervención breve' },
  { key: 'diet', label: 'Dieta Inadecuada', goal: 'Dieta mediterránea / DASH', intervention: 'Consejería nutricional' },
  { key: 'stress', label: 'Estrés Crónico', goal: 'Manejo adaptativo', intervention: 'Mindfulness, psicoterapia, actividad física' },
] as const;
