/**
 * @file overrides/odontologia.ts
 * @description Override de configuración para Odontología.
 *
 * Preserva los módulos, widgets, KPIs y settings originales de dental/config.ts
 * que van más allá del template genérico dental.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Odontología General.
 * Especialidad madura con 15 módulos personalizados.
 */
export const odontologiaOverride: SpecialtyConfigOverride = {
  // Mantener los IDs legacy para la transición
  dashboardVariant: 'odontologia',
  dashboardPath: '/dashboard/medico/odontologia',

  modules: {
    // 🦷 Gestión Clínica
    clinical: [
      {
        key: 'dental-consultation',
        label: 'Consulta Dental',
        icon: 'Stethoscope',
        route: '/dashboard/medico/odontologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
      },
      {
        key: 'dental-periodontogram',
        label: 'Periodontograma',
        icon: 'Activity',
        route: '/dashboard/medico/odontologia/periodontograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        componentPath: '@/components/dashboard/medico/odontologia/periodontogram/periodontogram-professional',
      },
      {
        key: 'dental-recipes',
        label: 'Recetas',
        icon: 'Pill',
        route: '/dashboard/medico/recetas',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
      },
      {
        key: 'dental-intake-forms',
        label: 'Formularios',
        icon: 'Clipboard',
        route: '/dashboard/medico/odontologia/formularios',
        group: 'clinical',
        order: 4,
        enabledByDefault: false,
      },
    ],

    // 💰 Gestión Financiera
    financial: [
      {
        key: 'dental-treatment-estimates',
        label: 'Presupuestos',
        icon: 'FileText',
        route: '/dashboard/medico/odontologia/presupuestos',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['case_acceptance_rate', 'avg_treatment_value'],
      },
      {
        key: 'dental-insurance',
        label: 'Seguros',
        icon: 'Shield',
        route: '/dashboard/medico/odontologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['claim_first_pass_acceptance', 'avg_claim_processing_time'],
      },
      {
        key: 'dental-memberships',
        label: 'Membresías',
        icon: 'CreditCard',
        route: '/dashboard/medico/odontologia/membresias',
        group: 'financial',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['active_memberships', 'membership_revenue'],
      },
      {
        key: 'dental-rcm',
        label: 'RCM Dental',
        icon: 'DollarSign',
        route: '/dashboard/medico/odontologia/rcm',
        group: 'financial',
        order: 4,
        enabledByDefault: true,
      },
    ],

    // 🔬 Laboratorio
    lab: [
      {
        key: 'dental-lab-tracking',
        label: 'Laboratorio',
        icon: 'FlaskConical',
        route: '/dashboard/medico/odontologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['lab_cases_pending', 'avg_lab_turnaround'],
      },
      {
        key: 'dental-inventory',
        label: 'Inventario',
        icon: 'Package',
        route: '/dashboard/medico/odontologia/inventario',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
    ],

    // 📸 Tecnología
    technology: [
      {
        key: 'dental-imaging',
        label: 'Imágenes IA',
        icon: 'Scan',
        route: '/dashboard/medico/odontologia/imaging',
        group: 'technology',
        order: 1,
        enabledByDefault: false,
      },
      {
        key: 'dental-3d-models',
        label: 'Modelos 3D',
        icon: 'Box',
        route: '/dashboard/medico/odontologia/modelos-3d',
        group: 'technology',
        order: 2,
        enabledByDefault: false,
      },
    ],

    // 📞 Comunicación
    communication: [
      {
        key: 'dental-remote-monitoring',
        label: 'Teledentología',
        icon: 'Video',
        route: '/dashboard/medico/odontologia/teledentologia',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'dental-voip',
        label: 'Llamadas',
        icon: 'Phone',
        route: '/dashboard/medico/odontologia/llamadas',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    // 📈 Crecimiento
    growth: [
      {
        key: 'dental-growth',
        label: 'Practice Growth',
        icon: 'TrendingUp',
        route: '/dashboard/medico/odontologia/growth',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  // Widgets personalizados
  widgets: [
    {
      key: 'morning-huddle',
      component: '@/components/dashboard/medico/odontologia/widgets/morning-huddle-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'odontogram',
      component: '@/components/dashboard/medico/odontologia/widgets/odontogram-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'ai-imaging',
      component: '@/components/dashboard/medico/odontologia/widgets/ai-imaging-widget',
      size: 'medium',
    },
    {
      key: 'eligibility',
      component: '@/components/dashboard/medico/odontologia/widgets/eligibility-widget',
      size: 'small',
    },
    {
      key: 'practice-growth',
      component: '@/components/dashboard/medico/odontologia/widgets/practice-growth-widget',
      size: 'full',
    },
  ],

  // KPIs priorizados
  prioritizedKpis: [
    'case_acceptance_rate',
    'no_show_rate',
    'claim_first_pass_acceptance',
    'recall_recovery_rate',
    'production_per_day',
    'new_patient_acquisition',
  ],

  // Definiciones de KPI
  kpiDefinitions: {
    case_acceptance_rate: {
      label: 'Tasa de Aceptación de Tratamiento',
      format: 'percentage',
      goal: 0.6,
      direction: 'higher_is_better',
    },
    no_show_rate: {
      label: 'Tasa de Inasistencia',
      format: 'percentage',
      goal: 0.1,
      direction: 'lower_is_better',
    },
    claim_first_pass_acceptance: {
      label: 'Aceptación 1er Paso de Reclamaciones',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    recall_recovery_rate: {
      label: 'Tasa de Recuperación de Recall',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    production_per_day: {
      label: 'Producción Diaria',
      format: 'currency',
      direction: 'higher_is_better',
    },
    new_patient_acquisition: {
      label: 'Nuevos Pacientes',
      format: 'number',
      direction: 'higher_is_better',
    },
  },

  // Settings especializados
  settings: {
    appointmentTypes: [
      'primera_vez',
      'revision',
      'limpieza',
      'restauracion',
      'extraccion',
      'ortodoncia',
      'endodoncia',
      'blanqueamiento',
      'urgencia',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis',
      'examen_clinico',
      'plan_tratamiento',
      'consentimiento',
      'post_operatorio',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      usesTeethNumbering: true,
      requiresQuadrantTracking: true,
      supportsMultipleChairs: true,
    },
  },

  // Tema visual
  theme: {
    primaryColor: '#0ea5e9',
    accentColor: '#6366f1',
    icon: 'Activity',
  },
};
