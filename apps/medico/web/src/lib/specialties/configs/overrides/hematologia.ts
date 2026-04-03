/**
 * @file overrides/hematologia.ts
 * @description Override de configuración para Hematología.
 *
 * Especialidad de la sangre — análisis de tendencias de hemograma,
 * seguimiento de cascada de coagulación, registro de biopsias de
 * médula ósea, registros de transfusión, manejo de anticoagulación
 * y estudios de hierro.
 *
 * También exporta constantes de dominio: líneas celulares,
 * trastornos de coagulación, clasificaciones de neoplasias.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Hematología.
 * Especialidad con módulos clínicos y de laboratorio hematológico.
 */
export const hematologiaOverride: SpecialtyConfigOverride = {
  dashboardVariant: 'hematologia',
  dashboardPath: '/dashboard/medico/hematologia',

  modules: {
    clinical: [
      {
        key: 'hemato-consulta',
        label: 'Consulta Hematológica',
        icon: 'Stethoscope',
        route: '/dashboard/medico/hematologia/consulta',
        group: 'clinical',
        order: 1,
        enabledByDefault: true,
        kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
        description: 'SOAP hematológico, evaluación de citopenias, adenopatías',
      },
      {
        key: 'hemato-hemograma',
        label: 'Tendencias de Hemograma',
        icon: 'BarChart',
        route: '/dashboard/medico/hematologia/hemograma',
        group: 'clinical',
        order: 2,
        enabledByDefault: true,
        description: 'CBC trending: Hb, WBC, plaquetas, diferencial, reticulocitos',
      },
      {
        key: 'hemato-coagulacion',
        label: 'Cascada de Coagulación',
        icon: 'Timer',
        route: '/dashboard/medico/hematologia/coagulacion',
        group: 'clinical',
        order: 3,
        enabledByDefault: true,
        kpiKeys: ['inr_time_in_range'],
        description: 'TP, TTPa, INR, fibrinógeno, dímero D, factores, anticoagulación',
      },
      {
        key: 'hemato-medula',
        label: 'Biopsia de Médula Ósea',
        icon: 'Microscope',
        route: '/dashboard/medico/hematologia/medula',
        group: 'clinical',
        order: 4,
        enabledByDefault: true,
        description: 'Registro de aspirados/biopsias, citometría, citogenética',
      },
      {
        key: 'hemato-transfusion',
        label: 'Registros de Transfusión',
        icon: 'Droplets',
        route: '/dashboard/medico/hematologia/transfusion',
        group: 'clinical',
        order: 5,
        enabledByDefault: true,
        kpiKeys: ['transfusion_needs'],
        description: 'GRE, plaquetas, plasma, crioprecipitado, reacciones adversas',
      },
      {
        key: 'hemato-anticoagulacion',
        label: 'Manejo de Anticoagulación',
        icon: 'Clock',
        route: '/dashboard/medico/hematologia/anticoagulacion',
        group: 'clinical',
        order: 6,
        enabledByDefault: true,
        description: 'Warfarina/INR, DOACs, heparina, puente perioperatorio',
      },
      {
        key: 'hemato-hierro',
        label: 'Estudios de Hierro',
        icon: 'Pill',
        route: '/dashboard/medico/hematologia/hierro',
        group: 'clinical',
        order: 7,
        enabledByDefault: true,
        description: 'Ferritina, TIBC, saturación, hierro sérico, anemia ferropénica',
      },
    ],

    laboratory: [
      {
        key: 'hemato-laboratorio',
        label: 'Panel Hematológico Completo',
        icon: 'FlaskConical',
        route: '/dashboard/medico/hematologia/laboratorio',
        group: 'lab',
        order: 1,
        enabledByDefault: true,
        description: 'CBC, reticulocitos, frotis, Coombs, haptoglobina, LDH',
      },
      {
        key: 'hemato-citometria',
        label: 'Citometría de Flujo',
        icon: 'Scan',
        route: '/dashboard/medico/hematologia/citometria',
        group: 'lab',
        order: 2,
        enabledByDefault: true,
        description: 'Inmunofenotipo, clonalidad, enfermedad residual mínima',
      },
      {
        key: 'hemato-molecular',
        label: 'Biología Molecular',
        icon: 'Dna',
        route: '/dashboard/medico/hematologia/molecular',
        group: 'lab',
        order: 3,
        enabledByDefault: true,
        description: 'BCR-ABL, JAK2, CALR, NPM1, FLT3, citogenética',
      },
    ],

    financial: [
      {
        key: 'hemato-facturacion',
        label: 'Facturación',
        icon: 'FileText',
        route: '/dashboard/medico/hematologia/facturacion',
        group: 'financial',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemato-seguros',
        label: 'Seguros y Autorizaciones',
        icon: 'Shield',
        route: '/dashboard/medico/hematologia/seguros',
        group: 'financial',
        order: 2,
        enabledByDefault: true,
      },
    ],

    technology: [
      {
        key: 'hemato-calculadoras',
        label: 'Calculadoras Hematológicas',
        icon: 'Calculator',
        route: '/dashboard/medico/hematologia/calculadoras',
        group: 'technology',
        order: 1,
        enabledByDefault: true,
        description: 'Reticulocitos corregidos, HAS-BLED, CHA2DS2-VASc, IPSS-R',
      },
      {
        key: 'hemato-guias',
        label: 'Guías y Protocolos',
        icon: 'BookOpen',
        route: '/dashboard/medico/hematologia/guias',
        group: 'technology',
        order: 2,
        enabledByDefault: true,
        description: 'ASH, EHA, NCCN — guías de hematología',
      },
    ],

    communication: [
      {
        key: 'hemato-interconsultas',
        label: 'Interconsultas',
        icon: 'Share2',
        route: '/dashboard/medico/hematologia/interconsultas',
        group: 'communication',
        order: 1,
        enabledByDefault: true,
      },
      {
        key: 'hemato-portal',
        label: 'Portal del Paciente',
        icon: 'User',
        route: '/dashboard/medico/hematologia/portal',
        group: 'communication',
        order: 2,
        enabledByDefault: false,
      },
    ],

    growth: [
      {
        key: 'hemato-analytics',
        label: 'Análisis de Práctica',
        icon: 'TrendingUp',
        route: '/dashboard/medico/hematologia/analytics',
        group: 'growth',
        order: 1,
        enabledByDefault: true,
      },
    ],
  },

  widgets: [
    {
      key: 'cbc-trends',
      component: '@/components/dashboard/medico/hematologia/widgets/cbc-trends-widget',
      size: 'large',
      required: true,
    },
    {
      key: 'anticoagulation-dashboard',
      component: '@/components/dashboard/medico/hematologia/widgets/anticoagulation-dashboard-widget',
      size: 'medium',
      required: true,
    },
    {
      key: 'transfusion-log',
      component: '@/components/dashboard/medico/hematologia/widgets/transfusion-log-widget',
      size: 'medium',
    },
    {
      key: 'bone-marrow-registry',
      component: '@/components/dashboard/medico/hematologia/widgets/bone-marrow-registry-widget',
      size: 'small',
      required: true,
    },
  ],

  prioritizedKpis: [
    'transfusion_needs',
    'inr_time_in_range',
    'remission_rates',
    'bone_marrow_biopsy_turnaround',
    'iron_deficiency_correction',
    'anticoagulation_complications',
  ],

  kpiDefinitions: {
    transfusion_needs: {
      label: 'Requerimientos Transfusionales / Mes',
      format: 'number',
      direction: 'lower_is_better',
    },
    inr_time_in_range: {
      label: 'INR en Rango Terapéutico (TTR)',
      format: 'percentage',
      goal: 0.65,
      direction: 'higher_is_better',
    },
    remission_rates: {
      label: 'Tasas de Remisión',
      format: 'percentage',
      goal: 0.7,
      direction: 'higher_is_better',
    },
    bone_marrow_biopsy_turnaround: {
      label: 'Tiempo de Resultado Médula Ósea (días)',
      format: 'number',
      goal: 7,
      direction: 'lower_is_better',
    },
    iron_deficiency_correction: {
      label: 'Corrección de Ferropenia',
      format: 'percentage',
      goal: 0.8,
      direction: 'higher_is_better',
    },
    anticoagulation_complications: {
      label: 'Complicaciones de Anticoagulación',
      format: 'percentage',
      goal: 0.05,
      direction: 'lower_is_better',
    },
  },

  settings: {
    appointmentTypes: [
      'primera_vez',
      'seguimiento',
      'control_hemograma',
      'control_anticoagulacion',
      'aspirado_medula',
      'consulta_transfusion',
      'control_hierro',
      'resultado_biopsia',
      'evaluacion_adenopatias',
      'control_quimioterapia',
    ],
    defaultDuration: 25,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    clinicalTemplateCategories: [
      'anamnesis_hematologica',
      'examen_fisico_hematologico',
      'evaluacion_citopenias',
      'informe_medula_osea',
      'registro_transfusion',
      'protocolo_anticoagulacion',
      'estudios_hierro',
      'plan_tratamiento',
    ],
    usesTreatmentPlans: true,
    requiresInsuranceVerification: true,
    supportsImagingIntegration: true,
    supportsTelemedicine: true,
    customFlags: {
      tracksCBCTrends: true,
      requiresCoagulationCascade: true,
      tracksBoneMarrowBiopsies: true,
      requiresTransfusionRecords: true,
      tracksAnticoagulation: true,
      requiresIronStudies: true,
    },
  },

  theme: {
    primaryColor: '#DC2626',
    accentColor: '#EF4444',
    icon: 'Droplets',
  },
};

// ============================================================================
// CONSTANTES DE DOMINIO — HEMATOLOGÍA
// ============================================================================

/**
 * Líneas celulares y valores de referencia del hemograma.
 */
export const CBC_REFERENCE_RANGES = {
  erythrocytes: {
    label: 'Serie Roja',
    parameters: [
      { key: 'hemoglobin', label: 'Hemoglobina (g/dL)', male: '13.5-17.5', female: '12.0-16.0' },
      { key: 'hematocrit', label: 'Hematocrito (%)', male: '40-54', female: '36-48' },
      { key: 'rbc', label: 'GR (×10⁶/µL)', male: '4.5-5.9', female: '4.0-5.2' },
      { key: 'mcv', label: 'VCM (fL)', range: '80-100' },
      { key: 'mch', label: 'HCM (pg)', range: '27-33' },
      { key: 'mchc', label: 'CHCM (g/dL)', range: '32-36' },
      { key: 'rdw', label: 'ADE (%)', range: '11.5-14.5' },
      { key: 'reticulocytes', label: 'Reticulocitos (%)', range: '0.5-2.5' },
    ],
  },
  leukocytes: {
    label: 'Serie Blanca',
    parameters: [
      { key: 'wbc', label: 'Leucocitos (×10³/µL)', range: '4.5-11.0' },
      { key: 'neutrophils', label: 'Neutrófilos (%)', range: '40-70' },
      { key: 'lymphocytes', label: 'Linfocitos (%)', range: '20-40' },
      { key: 'monocytes', label: 'Monocitos (%)', range: '2-8' },
      { key: 'eosinophils', label: 'Eosinófilos (%)', range: '1-4' },
      { key: 'basophils', label: 'Basófilos (%)', range: '0-1' },
    ],
  },
  platelets: {
    label: 'Serie Plaquetaria',
    parameters: [
      { key: 'platelets', label: 'Plaquetas (×10³/µL)', range: '150-400' },
      { key: 'mpv', label: 'VPM (fL)', range: '7.5-12.0' },
    ],
  },
} as const;

/**
 * Trastornos de coagulación con patrones de laboratorio.
 */
export const COAGULATION_PATTERNS = [
  { pattern: 'TP prolongado, TTPa normal', suggests: 'Déficit factor VII, warfarina temprana, enfermedad hepática leve' },
  { pattern: 'TP normal, TTPa prolongado', suggests: 'Déficit VIII/IX/XI/XII, heparina, lupus anticoagulante, von Willebrand' },
  { pattern: 'TP y TTPa prolongados', suggests: 'CID, enfermedad hepática avanzada, déficit vía común (V/X/II/I)' },
  { pattern: 'TP y TTPa normales, sangrado', suggests: 'Disfunción plaquetaria, von Willebrand leve, déficit XIII' },
  { pattern: 'Plaquetas bajas', suggests: 'PTI, CID, PTT/SHU, aplasia, hiperesplenismo, fármacos' },
] as const;

/**
 * Clasificaciones WHO de neoplasias hematológicas (simplificada).
 */
export const HEMATOLOGIC_NEOPLASM_CATEGORIES = [
  { key: 'myeloid_acute', label: 'Leucemia Mieloide Aguda (LMA)', lineage: 'mieloide' },
  { key: 'lymphoid_acute', label: 'Leucemia Linfoblástica Aguda (LLA)', lineage: 'linfoide' },
  { key: 'cml', label: 'Leucemia Mieloide Crónica (LMC)', lineage: 'mieloide' },
  { key: 'cll', label: 'Leucemia Linfocítica Crónica (LLC)', lineage: 'linfoide' },
  { key: 'mds', label: 'Síndromes Mielodisplásicos (SMD)', lineage: 'mieloide' },
  { key: 'mpn', label: 'Neoplasias Mieloproliferativas (NMP)', lineage: 'mieloide' },
  { key: 'hodgkin', label: 'Linfoma de Hodgkin', lineage: 'linfoide' },
  { key: 'nhl', label: 'Linfoma No Hodgkin', lineage: 'linfoide' },
  { key: 'myeloma', label: 'Mieloma Múltiple', lineage: 'linfoide' },
] as const;
