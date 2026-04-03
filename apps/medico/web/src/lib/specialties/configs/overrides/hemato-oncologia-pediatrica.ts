/**
 * @file overrides/hemato-oncologia-pediatrica.ts
 * @description Override de configuración para Hemato-Oncología Pediátrica.
 *
 * Combina Hematología + Oncología + Pediatría: seguimiento de protocolos
 * de quimioterapia, manejo de neutropenia, crecimiento durante tratamiento,
 * monitoreo de efectos tardíos y cuidado de sobrevivientes.
 *
 * También exporta constantes de dominio: protocolos de QT pediátrica,
 * manejo de neutropenia febril, efectos tardíos del tratamiento.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Hemato-Oncología Pediátrica.
 * Especialidad con módulos clínicos especializados para cáncer y sangre en niños.
 */
export const hematoOncologiaPediatricaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'hemato-oncologia-pediatrica',
  dashboardPath: '/dashboard/medico/hemato-oncologia-pediatrica',

  modules: {
    clinical: [
      {
        key: 'hemonco-pedi-consulta',
        label: 'Consulta Hemato-Oncológica Pediátrica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'Evaluación integral del paciente oncológico pediátrico',
      },
      {
        key: 'hemonco-pedi-protocolo',
        label: 'Protocolo de Quimioterapia',
        icon: 'ClipboardList',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/protocolo',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        kpiKeys: ['protocol_adherence'],
        description: 'Esquema QT, ciclos, dosis, ajustes, toxicidad',
      },
      {
        key: 'hemonco-pedi-neutropenia',
        label: 'Manejo de Neutropenia',
        icon: 'ShieldAlert',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/neutropenia',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['infection_rate'],
        description: 'Neutropenia febril, profilaxis, G-CSF, aislamiento',
      },
      {
        key: 'hemonco-pedi-crecimiento',
        label: 'Crecimiento Durante Tratamiento',
        icon: 'TrendingUp',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/crecimiento',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Antropometría, nutrición oncológica, soporte nutricional',
      },
      {
        key: 'hemonco-pedi-efectos-tardios',
        label: 'Monitoreo de Efectos Tardíos',
        icon: 'Clock',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/efectos-tardios',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        description: 'Cardiotoxicidad, endocrinopatía, segunda neoplasia, fertilidad',
      },
      {
        key: 'hemonco-pedi-sobreviviente',
        label: 'Cuidado de Sobrevivientes',
        icon: 'Heart',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/sobreviviente',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        kpiKeys: ['survival_metrics'],
        description: 'Plan de seguimiento a largo plazo, calidad de vida, reintegración',
      },
    ],

    laboratory: [
      {
        key: 'hemonco-pedi-laboratorio',
        label: 'Panel Hemato-Oncológico',
        icon: 'FlaskConical',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'CBC, química, coagulación, marcadores tumorales, citometría',
      },
      {
        key: 'hemonco-pedi-medula',
        label: 'Médula Ósea',
        icon: 'Microscope',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/medula',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Aspirado, biopsia, ERM (enfermedad residual mínima)',
      },
      {
        key: 'hemonco-pedi-imagenologia',
        label: 'Imagenología Oncológica',
        icon: 'Scan',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/imagenologia',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'TC, RM, PET-CT, evaluación de respuesta',
      },
    ],

    financial: [
      {
        key: 'hemonco-pedi-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemonco-pedi-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'hemonco-pedi-calculadoras',
        label: 'Calculadoras Oncológicas Pediátricas',
        icon: 'Calculator',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Superficie corporal, dosis por peso, Lansky, riesgo febril',
      },
      {
        key: 'hemonco-pedi-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'COG, SIOP, St. Jude — protocolos pediátricos',
      },
    ],

    communication: [
      {
        key: 'hemonco-pedi-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemonco-pedi-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'hemonco-pedi-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/hemato-oncologia-pediatrica/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'chemo-protocol',
      component: '@/components/dashboard/medico/hemato-oncologia-pediatrica/widgets/chemo-protocol-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'neutropenia-dashboard',
      component: '@/components/dashboard/medico/hemato-oncologia-pediatrica/widgets/neutropenia-dashboard-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'growth-during-treatment',
      component: '@/components/dashboard/medico/hemato-oncologia-pediatrica/widgets/growth-during-treatment-widget',
      size: 'medium',
    },
    {
      key: 'survivorship-alerts',
      component: '@/components/dashboard/medico/hemato-oncologia-pediatrica/widgets/survivorship-alerts-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'protocol_adherence',
    'infection_rate',
    'survival_metrics',
    'growth_during_treatment',
    'late_effects_screening',
    'transfusion_support',
  ],

  kpiDefinitions: {
    protocol_adherence: {
      label: 'Adherencia al Protocolo QT',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
    infection_rate: {
      label: 'Tasa de Infecciones / Ciclo',
      format: 'percentage',
      goal: 0.15,
      direction: 'lower_is_better',
    },
    survival_metrics: {
      label: 'Supervivencia Libre de Evento',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    growth_during_treatment: {
      label: 'Crecimiento Adecuado en Tratamiento',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    late_effects_screening: {
      label: 'Tamizaje de Efectos Tardíos',
      format: 'percentage',
      goal: 0.9,
      direction: 'higher_is_better',
    },
    transfusion_support: {
      label: 'Soporte Transfusional Oportuno',
      format: 'percentage',
      goal: 0.95,
      direction: 'higher_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'ciclo_quimioterapia',
      'control_neutropenia',
      'evaluacion_nutricional',
      'control_efectos_tardios',
      'seguimiento_sobreviviente',
      'resultado_medula',
      'transfusion',
      'interconsulta_urgente',
    ],
    defaultDuration: 30,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_hemato_oncologica_pediatrica',
      'examen_fisico_pediatrico',
      'protocolo_quimioterapia',
      'manejo_neutropenia_febril',
      'evaluacion_nutricional_oncologica',
      'seguimiento_efectos_tardios',
      'plan_sobreviviente',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksChemoProtocols: true,
      requiresNeutropeniaManagement: true,
      tracksGrowthDuringTreatment: true,
      requiresLateEffectsMonitoring: true,
      supportsSurvivorshipCare: true,
      usesGrowthCharts: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#EF4444',
    icon: 'Shield',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — HEMATO-ONCOLOGÍA PEDIÁTRICA
// ============================================================================

/**
 * Neoplasias hematológicas pediátricas más frecuentes.
 */
export const PEDIATRIC_HEMATOLOGIC_NEOPLASMS = [
  { key: 'all_b', label: 'LLA de Células B', frequency: '~75% de leucemias pediátricas', peakAge: '2-5 años', prognosis: 'EFS ~90% en riesgo estándar' },
  { key: 'all_t', label: 'LLA de Células T', frequency: '~15% de leucemias pediátricas', peakAge: '> 5 años', prognosis: 'EFS ~85%' },
  { key: 'aml', label: 'LMA', frequency: '~20% de leucemias pediátricas', peakAge: '< 2 años', prognosis: 'EFS ~60-70%' },
  { key: 'hodgkin', label: 'Linfoma de Hodgkin', frequency: 'Común en adolescentes', peakAge: '15-19 años', prognosis: 'EFS ~95% en estadios tempranos' },
  { key: 'nhl', label: 'Linfoma No Hodgkin', frequency: '~7% de cánceres pediátricos', peakAge: '5-15 años', prognosis: 'Variable por subtipo' },
] as const;

/**
 * Manejo de neutropenia febril pediátrica.
 */
export const PEDIATRIC_FEBRILE_NEUTROPENIA = {
  definition: {
    fever: 'T° ≥ 38.3°C (1 toma) o ≥ 38.0°C sostenida por 1 hora',
    neutropenia: 'ANC < 500/µL o < 1000/µL con descenso esperado a < 500',
  },
  riskCategories: [
    { risk: 'bajo', label: 'Bajo Riesgo', criteria: 'Monocitos > 100, Rx tórax normal, sin comorbilidad', management: 'Considerar ambulatorio con antibiótico oral' },
    { risk: 'alto', label: 'Alto Riesgo', criteria: 'ANC < 100, bacteriemia probable, inestable', management: 'Hospitalización, antibiótico IV de amplio espectro' },
  ],
  empiricRegimens: [
    { key: 'monotherapy', label: 'Monoterapia', agents: 'Cefepime o Meropenem', indication: 'Primera línea' },
    { key: 'dual_coverage', label: 'Doble Cobertura', agents: 'β-lactámico + aminoglucósido', indication: 'Sepsis, inestabilidad' },
    { key: 'add_vancomycin', label: '+ Vancomicina', agents: 'Agregar vancomicina', indication: 'Mucositis severa, catéter infectado, MRSA' },
    { key: 'antifungal', label: '+ Antifúngico', agents: 'Agregar anfotericina/caspofungina', indication: 'Fiebre persistente ≥ 4-7 días' },
  ],
} as const;

/**
 * Efectos tardíos del tratamiento oncológico pediátrico.
 */
export const LATE_EFFECTS_MONITORING = [
  { system: 'Cardíaco', risk: 'Antraciclinas, radiación torácica', screening: 'Ecocardiograma anual', onset: '5-20+ años' },
  { system: 'Endocrino', risk: 'Radiación craneal/corporal total, alquilantes', screening: 'Perfil hormonal anual', onset: '2-10 años' },
  { system: 'Fertilidad', risk: 'Alquilantes, radiación gonadal', screening: 'Evaluación pubertal, hormonal', onset: 'Pubertad/adultez' },
  { system: 'Neurocognitivo', risk: 'Radiación craneal, metotrexato IT', screening: 'Evaluación neuropsicológica', onset: '1-5 años' },
  { system: 'Segunda Neoplasia', risk: 'Radiación, alquilantes, inhibidores de topoisomerasa II', screening: 'Seguimiento según exposición', onset: '5-30+ años' },
  { system: 'Óseo', risk: 'Corticoides, metotrexato', screening: 'DEXA, evaluación de osteonecrosis', onset: '1-5 años' },
  { system: 'Renal', risk: 'Cisplatino, ifosfamida', screening: 'Creatinina, electrolitos, TA', onset: '1-10 años' },
] as const;
