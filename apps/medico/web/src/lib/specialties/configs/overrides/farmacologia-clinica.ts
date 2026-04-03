/**
 * @file overrides/farmacologia-clinica.ts
 * @description Override de configuración para Farmacología Clínica.
 *
 * Módulos especializados: verificación de interacciones
 * medicamentosas, monitoreo terapéutico de fármacos (TDM),
 * reporte de ADR, farmacovigilancia, cálculos de ajuste
 * de dosis, ensayos clínicos.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

export const farmacologiaClinicaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'farmacologia-clinica',
  dashboardPath: '/dashboard/medico/farmacologia-clinica',

  modules: {
    clinical: [
      {
        key: 'farmaco-consulta',
        label: 'Consulta de Farmacología Clínica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/farmacologia-clinica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day'],
      },
      {
        key: 'farmaco-interacciones',
        label: 'Verificación de Interacciones',
        icon: 'AlertTriangle',
        route: '/dashboard/medico/farmacologia-clinica/interacciones',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['drug_interaction_prevention_rate'],
      },
      {
        key: 'farmaco-tdm',
        label: 'Monitoreo Terapéutico (TDM)',
        icon: 'Activity',
        route: '/dashboard/medico/farmacologia-clinica/tdm',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['tdm_compliance_rate'],
      },
      {
        key: 'farmaco-adr',
        label: 'Reporte de RAM (ADR)',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/farmacologia-clinica/adr',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        kpiKeys: ['adr_detection_rate'],
      },
      {
        key: 'farmaco-farmacovigilancia',
        label: 'Farmacovigilancia',
        icon: 'Eye',
        route: '/dashboard/medico/farmacologia-clinica/farmacovigilancia',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-ajuste-dosis',
        label: 'Cálculos de Ajuste de Dosis',
        icon: 'Calculator',
        route: '/dashboard/medico/farmacologia-clinica/ajuste-dosis',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-ensayos',
        label: 'Ensayos Clínicos',
        icon: 'FlaskConical',
        route: '/dashboard/medico/farmacologia-clinica/ensayos',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
      },
    ],

    lab: [
      {
        key: 'farmaco-niveles',
        label: 'Niveles Plasmáticos',
        icon: 'TrendingUp',
        route: '/dashboard/medico/farmacologia-clinica/niveles',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-farmacocinetica',
        label: 'Parámetros Farmacocinéticos',
        icon: 'BarChart3',
        route: '/dashboard/medico/farmacologia-clinica/farmacocinetica',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-farmacogenomica',
        label: 'Farmacogenómica',
        icon: 'Dna',
        route: '/dashboard/medico/farmacologia-clinica/farmacogenomica',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'farmaco-calculadoras',
        label: 'Calculadoras Farmacológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/farmacologia-clinica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-base-datos',
        label: 'Base de Datos de Medicamentos',
        icon: 'Database',
        route: '/dashboard/medico/farmacologia-clinica/base-datos',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
      },
    ],

    communication: [
      {
        key: 'farmaco-interconsultas',
        label: 'Interconsultas',
        icon: 'MessageSquare',
        route: '/dashboard/medico/farmacologia-clinica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'farmaco-remisiones',
        label: 'Remisiones',
        icon: 'Share2',
        route: '/dashboard/medico/farmacologia-clinica/remisiones',
        group: 'communication',
        order: 2,
        enabledByDefault: true,
      },
    ],

    growth: [
      {
        key: 'farmaco-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/farmacologia-clinica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'drug-interaction-alerts',
      component: '@/components/dashboard/medico/farmacologia-clinica/widgets/drug-interaction-alerts-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'tdm-compliance-tracker',
      component: '@/components/dashboard/medico/farmacologia-clinica/widgets/tdm-compliance-tracker-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'adr-reporting-summary',
      component: '@/components/dashboard/medico/farmacologia-clinica/widgets/adr-reporting-summary-widget',
      size: 'small',
    },
  ],

  prioritizedKpis: [
    'adr_detection_rate',
    'drug_interaction_prevention_rate',
    'tdm_compliance_rate',
    'dose_adjustment_accuracy',
    'clinical_trial_enrollment',
    'pharmacovigilance_reporting_rate',
  ],

  kpiDefinitions: {
    adr_detection_rate: {
      label: 'Tasa de Detección de RAM',
      format: 'percentage',
      goal: 0.85,
      direction: 'higher_is_better',
    },
    drug_interaction_prevention_rate: {
      label: 'Tasa de Prevención de Interacciones',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    tdm_compliance_rate: {
      label: 'Cumplimiento de TDM',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    dose_adjustment_accuracy: {
      label: 'Precisión de Ajuste de Dosis',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    clinical_trial_enrollment: {
      label: 'Enrolamiento en Ensayos Clínicos',
      format: 'number',
      direction: 'higher_is_better',
    },
    pharmacovigilance_reporting_rate: {
      label: 'Tasa de Reporte de Farmacovigilancia',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'consulta_farmacologica',
      'revision_medicamentos',
      'ajuste_dosis',
      'monitoreo_tdm',
      'evaluacion_adr',
      'interconsulta',
      'seguimiento_ensayo',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'revision_farmacologica',
      'reporte_interacciones',
      'protocolo_tdm',
      'reporte_ram',
      'ajuste_renal_hepatico',
      'nota_farmacovigilancia',
      'protocolo_ensayo_clinico',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: false,
    supportsTelemedicine: true,
    customFlags: {
      requiresDrugInteractionCheck: true,
      supportsTDM: true,
      requiresADRReporting: true,
      supportsPharmacovigilance: true,
      supportsDoseCalculation: true,
      supportsPharmacogenomics: true,
    },
  },

  theme: {
    primaryColor: '#F59E0B',
    accentColor: '#D97706',
    icon: 'Pill',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO DE FARMACOLOGÍA CLÍNICA
// ============================================================================

/**
 * Categorías de gravedad de RAM (Reacciones Adversas a Medicamentos)
 */
export const ADR_SEVERITY_CATEGORIES = [
  { key: 'mild', label: 'Leve', description: 'No requiere cambio de tratamiento', naranjo: '1-4' },
  { key: 'moderate', label: 'Moderada', description: 'Requiere modificación del tratamiento', naranjo: '5-8' },
  { key: 'severe', label: 'Grave', description: 'Amenaza la vida o requiere hospitalización', naranjo: '≥ 9' },
  { key: 'fatal', label: 'Fatal', description: 'Contribuye a la muerte del paciente', naranjo: 'N/A' },
] as const;

/**
 * Fármacos comunes que requieren TDM (Monitoreo Terapéutico)
 */
export const TDM_COMMON_DRUGS = [
  { key: 'vancomycin', label: 'Vancomicina', therapeutic_range: '15-20 μg/mL (valle)', category: 'antibiótico' },
  { key: 'gentamicin', label: 'Gentamicina', therapeutic_range: '5-10 μg/mL (pico)', category: 'antibiótico' },
  { key: 'phenytoin', label: 'Fenitoína', therapeutic_range: '10-20 μg/mL', category: 'antiepiléptico' },
  { key: 'valproic_acid', label: 'Ácido Valproico', therapeutic_range: '50-100 μg/mL', category: 'antiepiléptico' },
  { key: 'carbamazepine', label: 'Carbamazepina', therapeutic_range: '4-12 μg/mL', category: 'antiepiléptico' },
  { key: 'lithium', label: 'Litio', therapeutic_range: '0.6-1.2 mEq/L', category: 'estabilizador' },
  { key: 'digoxin', label: 'Digoxina', therapeutic_range: '0.8-2.0 ng/mL', category: 'cardíaco' },
  { key: 'theophylline', label: 'Teofilina', therapeutic_range: '10-20 μg/mL', category: 'broncodilatador' },
  { key: 'tacrolimus', label: 'Tacrolimus', therapeutic_range: '5-15 ng/mL', category: 'inmunosupresor' },
  { key: 'cyclosporine', label: 'Ciclosporina', therapeutic_range: '100-400 ng/mL', category: 'inmunosupresor' },
] as const;
