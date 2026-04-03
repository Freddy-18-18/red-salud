/**
 * @file overrides/nutriologia.ts
 * @description Override de configuración para Nutriología.
 *
 * Nutrición clínica — seguimiento antropométrico, planificación
 * de comidas, evaluación de micronutrientes, composición corporal,
 * historia dietética y panel metabólico.
 *
 * También exporta constantes de dominio: clasificación IMC,
 * requerimientos calóricos, grupos alimenticios.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Nutriología.
 * Especialidad con módulos clínicos, de laboratorio y tecnología.
 */
export const nutriologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'nutriologia',
  dashboardPath: '/dashboard/medico/nutriologia',

  modules: {
    clinical: [
      {
        key: 'nutri-consulta',
        label: 'Consulta Nutricional',
        icon: 'Apple',
        route: '/dashboard/medico/nutriologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['patients_per_day', 'avg_consultation_duration'],
        description: 'Evaluación nutricional integral, anamnesis alimentaria, plan',
      },
      {
        key: 'nutri-antropometria',
        label: 'Seguimiento Antropométrico',
        icon: 'Ruler',
        route: '/dashboard/medico/nutriologia/antropometria',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['weight_goal_achievement'],
        description: 'Peso, talla, IMC, perímetros, pliegues, composición corporal',
      },
      {
        key: 'nutri-plan-alimentario',
        label: 'Plan Alimentario',
        icon: 'UtensilsCrossed',
        route: '/dashboard/medico/nutriologia/plan-alimentario',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        description: 'Planificación de comidas, porciones, macros, intercambios',
      },
      {
        key: 'nutri-micronutrientes',
        label: 'Evaluación de Micronutrientes',
        icon: 'Sparkles',
        route: '/dashboard/medico/nutriologia/micronutrientes',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Hierro, zinc, vitaminas, calcio — déficit y suplementación',
      },
      {
        key: 'nutri-composicion',
        label: 'Composición Corporal',
        icon: 'BarChart',
        route: '/dashboard/medico/nutriologia/composicion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Bioimpedancia, masa grasa/magra, agua corporal, metabolismo basal',
      },
      {
        key: 'nutri-historia-dietetica',
        label: 'Historia Dietética',
        icon: 'FileText',
        route: '/dashboard/medico/nutriologia/historia-dietetica',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['adherence_rate'],
        description: 'Recordatorio 24h, frecuencia de consumo, diario alimentario',
      },
      {
        key: 'nutri-metabolico',
        label: 'Panel Metabólico',
        icon: 'Activity',
        route: '/dashboard/medico/nutriologia/metabolico',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        kpiKeys: ['metabolic_improvement_rate'],
        description: 'Glucosa, lípidos, ácido úrico, hígado graso — correlación nutricional',
      },
    ],

    laboratory: [
      {
        key: 'nutri-laboratorio',
        label: 'Laboratorio Nutricional',
        icon: 'FlaskConical',
        route: '/dashboard/medico/nutriologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'Hemograma, perfil lipídico, glucosa, hierro, vitaminas, proteínas',
      },
      {
        key: 'nutri-bioimpedancia',
        label: 'Bioimpedancia',
        icon: 'Waves',
        route: '/dashboard/medico/nutriologia/bioimpedancia',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Análisis de composición corporal por bioimpedancia eléctrica',
      },
    ],

    technology: [
      {
        key: 'nutri-calculadoras',
        label: 'Calculadoras Nutricionales',
        icon: 'Calculator',
        route: '/dashboard/medico/nutriologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'IMC, Harris-Benedict, Mifflin-St Jeor, requerimientos calóricos',
      },
      {
        key: 'nutri-tablas',
        label: 'Tablas de Composición',
        icon: 'Table',
        route: '/dashboard/medico/nutriologia/tablas',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'Composición nutricional de alimentos, intercambios, porciones',
      },
      {
        key: 'nutri-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/nutriologia/guias',
        group: 'technology',
        order: 3,
        enabledByDefault: true,
        description: 'ASPEN, ESPEN, guías nutricionales por patología',
      },
    ],
  },

  widgets: [
    {
      key: 'anthropometric-trends',
      component: '@/components/dashboard/medico/nutriologia/widgets/anthropometric-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'meal-plan-summary',
      component: '@/components/dashboard/medico/nutriologia/widgets/meal-plan-summary-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'metabolic-panel',
      component: '@/components/dashboard/medico/nutriologia/widgets/metabolic-panel-widget',
      size: 'medium',
    },
    {
      key: 'adherence-tracker',
      component: '@/components/dashboard/medico/nutriologia/widgets/adherence-tracker-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'weight_goal_achievement',
    'metabolic_improvement_rate',
    'adherence_rate',
    'patients_per_day',
    'micronutrient_correction_rate',
    'patient_satisfaction',
  ],

  kpiDefinitions: {
    weight_goal_achievement: {
      label: 'Meta de Peso Alcanzada',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    metabolic_improvement_rate: {
      label: 'Mejoría Metabólica',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    adherence_rate: {
      label: 'Adherencia al Plan',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    patients_per_day: {
      label: 'Pacientes / Día',
      format: 'number',
      goal: 12,
      direction: 'higher_is_better',
    },
    micronutrient_correction_rate: {
      label: 'Corrección Micronutrientes',
      format: 'percentage',
      goal: 0.75,
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
      'primera_vez',
      'control_nutricional',
      'bioimpedancia',
      'plan_alimentario',
      'educacion_nutricional',
      'control_metabolico',
      'nutricion_deportiva',
      'nutricion_pediatrica',
      'interconsulta',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_nutricional',
      'evaluacion_antropometrica',
      'recordatorio_24h',
      'plan_alimentario',
      'evaluacion_micronutrientes',
      'nota_composicion_corporal',
      'educacion_nutricional',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      tracksAnthropometrics: true,
      managesMealPlans: true,
      tracksMicronutrients: true,
      tracksBodyComposition: true,
      tracksDietaryHistory: true,
      tracksMetabolicPanel: true,
    },
  },

  theme: {
    primaryColor: '#22C55E',
    accentColor: '#15803D',
    icon: 'Apple',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — NUTRIOLOGÍA
// ============================================================================

/**
 * Clasificación de IMC (OMS).
 */
export const BMI_CLASSIFICATION = [
  { range: [0, 18.4], label: 'Bajo Peso', severity: 'underweight', color: '#3B82F6' },
  { range: [18.5, 24.9], label: 'Normal', severity: 'normal', color: '#22C55E' },
  { range: [25.0, 29.9], label: 'Sobrepeso', severity: 'overweight', color: '#F59E0B' },
  { range: [30.0, 34.9], label: 'Obesidad Grado I', severity: 'obese_1', color: '#F97316' },
  { range: [35.0, 39.9], label: 'Obesidad Grado II', severity: 'obese_2', color: '#EF4444' },
  { range: [40.0, 100], label: 'Obesidad Grado III (Mórbida)', severity: 'obese_3', color: '#DC2626' },
] as const;

/**
 * Fórmulas de requerimiento calórico.
 */
export const CALORIC_FORMULAS = {
  harris_benedict: {
    label: 'Harris-Benedict',
    male: 'TMB = 88.362 + (13.397 × peso kg) + (4.799 × talla cm) - (5.677 × edad)',
    female: 'TMB = 447.593 + (9.247 × peso kg) + (3.098 × talla cm) - (4.330 × edad)',
  },
  mifflin_st_jeor: {
    label: 'Mifflin-St Jeor (preferida)',
    male: 'TMB = (10 × peso kg) + (6.25 × talla cm) - (5 × edad) + 5',
    female: 'TMB = (10 × peso kg) + (6.25 × talla cm) - (5 × edad) - 161',
  },
  activity_factors: [
    { key: 'sedentary', label: 'Sedentario', factor: 1.2 },
    { key: 'light', label: 'Actividad Ligera', factor: 1.375 },
    { key: 'moderate', label: 'Actividad Moderada', factor: 1.55 },
    { key: 'active', label: 'Muy Activo', factor: 1.725 },
    { key: 'extra_active', label: 'Extremadamente Activo', factor: 1.9 },
  ],
} as const;

/**
 * Macronutrientes: distribución recomendada por objetivo.
 */
export const MACRONUTRIENT_DISTRIBUTION = {
  general: { label: 'General Saludable', carbs: '45-65%', protein: '10-35%', fat: '20-35%' },
  weight_loss: { label: 'Pérdida de Peso', carbs: '40-50%', protein: '25-30%', fat: '25-30%' },
  muscle_gain: { label: 'Ganancia Muscular', carbs: '45-55%', protein: '25-35%', fat: '20-25%' },
  diabetes: { label: 'Diabetes', carbs: '40-45%', protein: '20-25%', fat: '30-35%' },
  renal: { label: 'Enfermedad Renal', carbs: '50-60%', protein: '0.6-0.8 g/kg', fat: '25-35%' },
  ketogenic: { label: 'Cetogénica', carbs: '5-10%', protein: '20-25%', fat: '65-75%' },
} as const;

/**
 * Micronutrientes críticos y sus fuentes principales.
 */
export const CRITICAL_MICRONUTRIENTS = [
  { key: 'iron', label: 'Hierro', rda: 'M: 8 mg, F: 18 mg', sources: 'Carnes rojas, legumbres, espinaca', deficiency: 'Anemia ferropénica' },
  { key: 'vitamin_d', label: 'Vitamina D', rda: '600-800 UI', sources: 'Sol, pescado graso, huevos', deficiency: 'Osteomalacia, raquitismo' },
  { key: 'calcium', label: 'Calcio', rda: '1000-1200 mg', sources: 'Lácteos, brócoli, sardinas', deficiency: 'Osteoporosis' },
  { key: 'vitamin_b12', label: 'Vitamina B12', rda: '2.4 μg', sources: 'Carnes, huevos, lácteos', deficiency: 'Anemia megaloblástica, neuropatía' },
  { key: 'folate', label: 'Ácido Fólico', rda: '400 μg (600 en embarazo)', sources: 'Vegetales verdes, legumbres, cereales', deficiency: 'Anemia, defectos tubo neural' },
  { key: 'zinc', label: 'Zinc', rda: 'M: 11 mg, F: 8 mg', sources: 'Carnes, mariscos, nueces', deficiency: 'Inmunidad reducida, alopecia' },
  { key: 'vitamin_a', label: 'Vitamina A', rda: 'M: 900 μg, F: 700 μg', sources: 'Hígado, zanahoria, batata', deficiency: 'Ceguera nocturna, xeroftalmía' },
  { key: 'omega3', label: 'Omega-3 (EPA/DHA)', rda: '250-500 mg', sources: 'Pescado graso, nueces, linaza', deficiency: 'Riesgo cardiovascular, inflamación' },
] as const;
