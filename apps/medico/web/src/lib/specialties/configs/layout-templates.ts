/**
 * @file layout-templates.ts
 * @description Plantillas de módulos por tipo de dashboard layout.
 *
 * Cada categoría de especialidad tiene un dashboardLayout que define
 * qué módulos estándar recibe. Estos templates proveen módulos base
 * que el config-factory personaliza con el slug de cada especialidad.
 *
 * Los 10 tipos de layout:
 * - clinical-standard:   Consulta → Historia → Receta (mayoría médicas)
 * - surgical:            Pre-op → Cirugía → Post-op
 * - dental:              Odontograma → Periodoncia → Imágenes
 * - diagnostic-imaging:  Estudios → Informes → Comparativa
 * - emergency-critical:  Triage → Monitoreo → Protocolos
 * - mental-health:       Sesiones → Notas → Seguimiento
 * - pediatric:           Crecimiento → Vacunas → Desarrollo
 * - rehabilitation:      Evaluación → Plan → Progreso
 * - laboratory:          Muestras → Análisis → Resultados
 * - administrative:      Gestión, registros, reportes
 */

import type { SpecialtyModule, ModuleGroup } from '../core/types';
import type { SpecialtyCategoryMeta } from '@red-salud/types';

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

/**
 * Template de módulo — versión parcial antes de personalizar con slug.
 * El config-factory rellena key, route completa, etc.
 */
export interface ModuleTemplate {
  /** Sufijo del key — se combina con specialty prefix: "{prefix}-{keySuffix}" */
  keySuffix: string;
  /** Label */
  label: string;
  /** Icono Lucide */
  icon: string;
  /** Sufijo de ruta — se combina con basePath: "/dashboard/medico/{slug}/{routeSuffix}" */
  routeSuffix: string;
  /** Grupo */
  group: ModuleGroup;
  /** Orden dentro del grupo */
  order: number;
  /** Habilitado por defecto */
  enabledByDefault: boolean;
  /** KPI keys opcionales */
  kpiKeys?: string[];
}

/**
 * Template completo para un layout — módulos organizados por grupo
 */
export interface LayoutTemplate {
  clinical: ModuleTemplate[];
  financial: ModuleTemplate[];
  lab?: ModuleTemplate[];
  technology: ModuleTemplate[];
  communication: ModuleTemplate[];
  growth: ModuleTemplate[];
  administrative?: ModuleTemplate[];
  education?: ModuleTemplate[];
}

// ============================================================================
// MÓDULOS COMPARTIDOS — Módulos que aparecen en casi todos los layouts
// ============================================================================

const SHARED_CONSULTATION: ModuleTemplate = {
  keySuffix: 'consulta',
  label: 'Consulta',
  icon: 'Stethoscope',
  routeSuffix: 'consulta',
  group: 'clinical',
  order: 1,
  enabledByDefault: true,
  kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
};

const SHARED_RECIPES: ModuleTemplate = {
  keySuffix: 'recetas',
  label: 'Recetas',
  icon: 'Pill',
  routeSuffix: 'recetas',
  group: 'clinical',
  order: 3,
  enabledByDefault: true,
};

const SHARED_CLINICAL_HISTORY: ModuleTemplate = {
  keySuffix: 'historia-clinica',
  label: 'Historia Clínica',
  icon: 'FileText',
  routeSuffix: 'historia-clinica',
  group: 'clinical',
  order: 2,
  enabledByDefault: true,
};

const SHARED_INSURANCE: ModuleTemplate = {
  keySuffix: 'seguros',
  label: 'Seguros',
  icon: 'Shield',
  routeSuffix: 'seguros',
  group: 'financial',
  order: 2,
  enabledByDefault: true,
};

const SHARED_BILLING: ModuleTemplate = {
  keySuffix: 'facturacion',
  label: 'Facturación',
  icon: 'CreditCard',
  routeSuffix: 'facturacion',
  group: 'financial',
  order: 1,
  enabledByDefault: true,
};

const SHARED_TELEMEDICINE: ModuleTemplate = {
  keySuffix: 'telemedicina',
  label: 'Telemedicina',
  icon: 'Video',
  routeSuffix: 'telemedicina',
  group: 'technology',
  order: 2,
  enabledByDefault: true,
};

const SHARED_MESSAGING: ModuleTemplate = {
  keySuffix: 'mensajeria',
  label: 'Mensajería',
  icon: 'MessageCircle',
  routeSuffix: 'mensajeria',
  group: 'communication',
  order: 1,
  enabledByDefault: true,
};

const SHARED_ANALYTICS: ModuleTemplate = {
  keySuffix: 'analytics',
  label: 'Análisis de Práctica',
  icon: 'TrendingUp',
  routeSuffix: 'analytics',
  group: 'growth',
  order: 1,
  enabledByDefault: true,
};

const SHARED_STATISTICS: ModuleTemplate = {
  keySuffix: 'estadisticas',
  label: 'Estadísticas',
  icon: 'BarChart',
  routeSuffix: 'estadisticas',
  group: 'growth',
  order: 2,
  enabledByDefault: true,
};

// ============================================================================
// LAYOUT TEMPLATES
// ============================================================================

/**
 * clinical-standard: La mayoría de especialidades médicas.
 * Consulta → Historia Clínica → Recetas → Laboratorio → etc.
 */
const CLINICAL_STANDARD: LayoutTemplate = {
  clinical: [
    SHARED_CONSULTATION,
    SHARED_CLINICAL_HISTORY,
    SHARED_RECIPES,
    {
      keySuffix: 'ordenes',
      label: 'Órdenes Médicas',
      icon: 'ClipboardList',
      routeSuffix: 'ordenes',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  lab: [
    {
      keySuffix: 'laboratorio',
      label: 'Laboratorio',
      icon: 'FlaskConical',
      routeSuffix: 'laboratorio',
      group: 'lab',
      order: 1,
      enabledByDefault: true,
    },
  ],
  technology: [
    {
      keySuffix: 'imagenologia',
      label: 'Imagenología',
      icon: 'Scan',
      routeSuffix: 'imagenologia',
      group: 'technology',
      order: 1,
      enabledByDefault: false,
    },
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'remisiones',
      label: 'Remisiones',
      icon: 'Share2',
      routeSuffix: 'remisiones',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * surgical: Especialidades quirúrgicas.
 * Evaluación pre-op → Programación quirúrgica → Post-operatorio
 */
const SURGICAL: LayoutTemplate = {
  clinical: [
    SHARED_CONSULTATION,
    SHARED_CLINICAL_HISTORY,
    SHARED_RECIPES,
    {
      keySuffix: 'evaluacion-preoperatoria',
      label: 'Evaluación Pre-Operatoria',
      icon: 'ClipboardCheck',
      routeSuffix: 'pre-op',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
    {
      keySuffix: 'programacion-quirurgica',
      label: 'Programación Quirúrgica',
      icon: 'Calendar',
      routeSuffix: 'programacion-quirurgica',
      group: 'clinical',
      order: 5,
      enabledByDefault: true,
      kpiKeys: ['surgeries_per_month', 'surgical_complication_rate'],
    },
    {
      keySuffix: 'seguimiento-postoperatorio',
      label: 'Seguimiento Post-Operatorio',
      icon: 'HeartPulse',
      routeSuffix: 'post-op',
      group: 'clinical',
      order: 6,
      enabledByDefault: true,
    },
    {
      keySuffix: 'consentimientos',
      label: 'Consentimientos',
      icon: 'FileSignature',
      routeSuffix: 'consentimientos',
      group: 'clinical',
      order: 7,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
    {
      keySuffix: 'presupuestos',
      label: 'Presupuestos Quirúrgicos',
      icon: 'Calculator',
      routeSuffix: 'presupuestos',
      group: 'financial',
      order: 3,
      enabledByDefault: true,
    },
  ],
  technology: [
    {
      keySuffix: 'imagenologia',
      label: 'Imagenología',
      icon: 'Scan',
      routeSuffix: 'imagenologia',
      group: 'technology',
      order: 1,
      enabledByDefault: true,
    },
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'remisiones',
      label: 'Remisiones',
      icon: 'Share2',
      routeSuffix: 'remisiones',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * dental: Odontología y subespecialidades.
 * Odontograma → Periodoncia → Imágenes → Presupuestos
 */
const DENTAL: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'consulta',
      label: 'Consulta Dental',
      icon: 'Stethoscope',
      routeSuffix: 'consulta',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
    },
    {
      keySuffix: 'periodontograma',
      label: 'Periodontograma',
      icon: 'Activity',
      routeSuffix: 'periodontograma',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    SHARED_RECIPES,
    {
      keySuffix: 'formularios',
      label: 'Formularios',
      icon: 'Clipboard',
      routeSuffix: 'formularios',
      group: 'clinical',
      order: 4,
      enabledByDefault: false,
    },
  ],
  financial: [
    {
      keySuffix: 'presupuestos',
      label: 'Presupuestos',
      icon: 'FileText',
      routeSuffix: 'presupuestos',
      group: 'financial',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['case_acceptance_rate', 'avg_treatment_value'],
    },
    SHARED_INSURANCE,
    {
      keySuffix: 'membresias',
      label: 'Membresías',
      icon: 'CreditCard',
      routeSuffix: 'membresias',
      group: 'financial',
      order: 3,
      enabledByDefault: true,
      kpiKeys: ['active_memberships', 'membership_revenue'],
    },
    {
      keySuffix: 'rcm',
      label: 'RCM Dental',
      icon: 'DollarSign',
      routeSuffix: 'rcm',
      group: 'financial',
      order: 4,
      enabledByDefault: true,
    },
  ],
  lab: [
    {
      keySuffix: 'laboratorio',
      label: 'Laboratorio Dental',
      icon: 'FlaskConical',
      routeSuffix: 'laboratorio',
      group: 'lab',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['lab_cases_pending', 'avg_lab_turnaround'],
    },
    {
      keySuffix: 'inventario',
      label: 'Inventario',
      icon: 'Package',
      routeSuffix: 'inventario',
      group: 'lab',
      order: 2,
      enabledByDefault: true,
    },
  ],
  technology: [
    {
      keySuffix: 'imaging',
      label: 'Imágenes IA',
      icon: 'Scan',
      routeSuffix: 'imaging',
      group: 'technology',
      order: 1,
      enabledByDefault: false,
    },
    {
      keySuffix: 'modelos-3d',
      label: 'Modelos 3D',
      icon: 'Box',
      routeSuffix: 'modelos-3d',
      group: 'technology',
      order: 2,
      enabledByDefault: false,
    },
  ],
  communication: [
    {
      keySuffix: 'teledentologia',
      label: 'Teledentología',
      icon: 'Video',
      routeSuffix: 'teledentologia',
      group: 'communication',
      order: 1,
      enabledByDefault: true,
    },
    {
      keySuffix: 'llamadas',
      label: 'Llamadas',
      icon: 'Phone',
      routeSuffix: 'llamadas',
      group: 'communication',
      order: 2,
      enabledByDefault: false,
    },
  ],
  growth: [
    {
      keySuffix: 'growth',
      label: 'Practice Growth',
      icon: 'TrendingUp',
      routeSuffix: 'growth',
      group: 'growth',
      order: 1,
      enabledByDefault: true,
    },
  ],
};

/**
 * diagnostic-imaging: Radiología, medicina nuclear, ecografía.
 * Estudios → Informes → Comparativa histórica
 */
const DIAGNOSTIC_IMAGING: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'estudios',
      label: 'Estudios',
      icon: 'ScanLine',
      routeSuffix: 'estudios',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['studies_per_day', 'avg_report_time'],
    },
    {
      keySuffix: 'informes',
      label: 'Informes',
      icon: 'FileText',
      routeSuffix: 'informes',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    {
      keySuffix: 'comparativa',
      label: 'Comparativa Histórica',
      icon: 'GitCompare',
      routeSuffix: 'comparativa',
      group: 'clinical',
      order: 3,
      enabledByDefault: true,
    },
    {
      keySuffix: 'worklist',
      label: 'Worklist',
      icon: 'ListChecks',
      routeSuffix: 'worklist',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    {
      keySuffix: 'pacs',
      label: 'PACS / Visor',
      icon: 'Monitor',
      routeSuffix: 'pacs',
      group: 'technology',
      order: 1,
      enabledByDefault: true,
    },
    {
      keySuffix: 'dicom',
      label: 'DICOM Viewer',
      icon: 'Layers',
      routeSuffix: 'dicom',
      group: 'technology',
      order: 2,
      enabledByDefault: true,
    },
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'remisiones',
      label: 'Remisiones',
      icon: 'Share2',
      routeSuffix: 'remisiones',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * emergency-critical: Emergencias y medicina intensiva.
 * Triage → Monitoreo → Protocolos → Alertas
 */
const EMERGENCY_CRITICAL: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'triage',
      label: 'Triage',
      icon: 'AlertTriangle',
      routeSuffix: 'triage',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['triage_time', 'patients_in_department'],
    },
    {
      keySuffix: 'monitoreo',
      label: 'Monitoreo',
      icon: 'Activity',
      routeSuffix: 'monitoreo',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    {
      keySuffix: 'protocolos',
      label: 'Protocolos',
      icon: 'BookOpen',
      routeSuffix: 'protocolos',
      group: 'clinical',
      order: 3,
      enabledByDefault: true,
    },
    SHARED_RECIPES,
    {
      keySuffix: 'alertas-criticas',
      label: 'Alertas Críticas',
      icon: 'Bell',
      routeSuffix: 'alertas',
      group: 'clinical',
      order: 5,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    {
      keySuffix: 'monitor-signos',
      label: 'Signos Vitales',
      icon: 'HeartPulse',
      routeSuffix: 'signos-vitales',
      group: 'technology',
      order: 1,
      enabledByDefault: true,
    },
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'interconsultas',
      label: 'Interconsultas',
      icon: 'UserPlus',
      routeSuffix: 'interconsultas',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * mental-health: Psiquiatría y salud mental.
 * Sesiones → Notas de progreso → Seguimiento → Escalas
 */
const MENTAL_HEALTH: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'sesiones',
      label: 'Sesiones',
      icon: 'MessageSquare',
      routeSuffix: 'sesiones',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['sessions_per_week', 'avg_session_duration'],
    },
    {
      keySuffix: 'notas-progreso',
      label: 'Notas de Progreso',
      icon: 'NotebookPen',
      routeSuffix: 'notas',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    SHARED_RECIPES,
    {
      keySuffix: 'escalas',
      label: 'Escalas y Tests',
      icon: 'ClipboardList',
      routeSuffix: 'escalas',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
    {
      keySuffix: 'plan-terapeutico',
      label: 'Plan Terapéutico',
      icon: 'Target',
      routeSuffix: 'plan-terapeutico',
      group: 'clinical',
      order: 5,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'seguimiento',
      label: 'Seguimiento',
      icon: 'CalendarCheck',
      routeSuffix: 'seguimiento',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * pediatric: Pediatría y neonatología.
 * Crecimiento → Vacunas → Desarrollo → Well-child
 */
const PEDIATRIC: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'well-child',
      label: 'Visita de Bienestar',
      icon: 'Baby',
      routeSuffix: 'well-child',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['well_child_completion', 'growth_tracking_compliance'],
    },
    {
      ...SHARED_CONSULTATION,
      label: 'Consulta Pediátrica',
    },
    {
      keySuffix: 'crecimiento',
      label: 'Crecimiento y Desarrollo',
      icon: 'TrendingUp',
      routeSuffix: 'crecimiento',
      group: 'clinical',
      order: 3,
      enabledByDefault: true,
      kpiKeys: ['growth_percentile_compliance'],
    },
    {
      keySuffix: 'vacunacion',
      label: 'Vacunación',
      icon: 'Syringe',
      routeSuffix: 'vacunacion',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
      kpiKeys: ['vaccination_coverage', 'up_to_date_rate'],
    },
    SHARED_RECIPES,
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    {
      keySuffix: 'curvas-crecimiento',
      label: 'Curvas de Crecimiento',
      icon: 'LineChart',
      routeSuffix: 'curvas-crecimiento',
      group: 'technology',
      order: 1,
      enabledByDefault: true,
    },
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'portal-padres',
      label: 'Portal de Padres',
      icon: 'Users',
      routeSuffix: 'portal-padres',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * rehabilitation: Medicina física y rehabilitación.
 * Evaluación → Plan → Sesiones → Progreso
 */
const REHABILITATION: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'evaluacion',
      label: 'Evaluación Funcional',
      icon: 'ClipboardCheck',
      routeSuffix: 'evaluacion',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['evaluations_per_week'],
    },
    {
      keySuffix: 'plan-rehabilitacion',
      label: 'Plan de Rehabilitación',
      icon: 'Target',
      routeSuffix: 'plan',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    {
      keySuffix: 'sesiones',
      label: 'Sesiones de Terapia',
      icon: 'Dumbbell',
      routeSuffix: 'sesiones',
      group: 'clinical',
      order: 3,
      enabledByDefault: true,
      kpiKeys: ['sessions_completed', 'adherence_rate'],
    },
    {
      keySuffix: 'progreso',
      label: 'Progreso',
      icon: 'TrendingUp',
      routeSuffix: 'progreso',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
    SHARED_RECIPES,
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * laboratory: Patología y laboratorio clínico.
 * Muestras → Análisis → Resultados → Control de calidad
 */
const LABORATORY: LayoutTemplate = {
  clinical: [
    {
      keySuffix: 'muestras',
      label: 'Recepción de Muestras',
      icon: 'TestTube',
      routeSuffix: 'muestras',
      group: 'clinical',
      order: 1,
      enabledByDefault: true,
      kpiKeys: ['samples_per_day', 'avg_turnaround'],
    },
    {
      keySuffix: 'analisis',
      label: 'Análisis',
      icon: 'Microscope',
      routeSuffix: 'analisis',
      group: 'clinical',
      order: 2,
      enabledByDefault: true,
    },
    {
      keySuffix: 'resultados',
      label: 'Resultados',
      icon: 'FileCheck',
      routeSuffix: 'resultados',
      group: 'clinical',
      order: 3,
      enabledByDefault: true,
    },
    {
      keySuffix: 'control-calidad',
      label: 'Control de Calidad',
      icon: 'ShieldCheck',
      routeSuffix: 'control-calidad',
      group: 'clinical',
      order: 4,
      enabledByDefault: true,
    },
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    {
      keySuffix: 'lis',
      label: 'LIS (Sistema Info Lab)',
      icon: 'Database',
      routeSuffix: 'lis',
      group: 'technology',
      order: 1,
      enabledByDefault: true,
    },
  ],
  communication: [
    SHARED_MESSAGING,
    {
      keySuffix: 'remisiones',
      label: 'Remisiones',
      icon: 'Share2',
      routeSuffix: 'remisiones',
      group: 'communication',
      order: 2,
      enabledByDefault: true,
    },
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

/**
 * administrative: Gestión, registros, reportes.
 * (Usado como fallback para categorías muy especializadas)
 */
const ADMINISTRATIVE: LayoutTemplate = {
  clinical: [
    SHARED_CONSULTATION,
    SHARED_CLINICAL_HISTORY,
    SHARED_RECIPES,
  ],
  financial: [
    SHARED_BILLING,
    SHARED_INSURANCE,
  ],
  technology: [
    SHARED_TELEMEDICINE,
  ],
  communication: [
    SHARED_MESSAGING,
  ],
  growth: [
    SHARED_ANALYTICS,
    SHARED_STATISTICS,
  ],
};

// ============================================================================
// REGISTRY DE TEMPLATES
// ============================================================================

const LAYOUT_TEMPLATES: Record<SpecialtyCategoryMeta['dashboardLayout'], LayoutTemplate> = {
  'clinical-standard': CLINICAL_STANDARD,
  surgical: SURGICAL,
  dental: DENTAL,
  'diagnostic-imaging': DIAGNOSTIC_IMAGING,
  'emergency-critical': EMERGENCY_CRITICAL,
  'mental-health': MENTAL_HEALTH,
  pediatric: PEDIATRIC,
  rehabilitation: REHABILITATION,
  laboratory: LABORATORY,
  administrative: ADMINISTRATIVE,
};

// ============================================================================
// API PÚBLICA
// ============================================================================

/**
 * Obtener el template de layout para un tipo de dashboard.
 */
export function getLayoutTemplate(
  layout: SpecialtyCategoryMeta['dashboardLayout']
): LayoutTemplate {
  return LAYOUT_TEMPLATES[layout] ?? LAYOUT_TEMPLATES['clinical-standard'];
}

/**
 * Materializar un ModuleTemplate en un SpecialtyModule concreto.
 * Recibe el prefix de la especialidad y su basePath.
 *
 * @param template   - Template base
 * @param prefix     - Prefijo: "cardio", "pedi", "dental", etc.
 * @param basePath   - "/dashboard/medico/cardiologia"
 */
export function materializeModule(
  template: ModuleTemplate,
  prefix: string,
  basePath: string
): SpecialtyModule {
  return {
    key: `${prefix}-${template.keySuffix}`,
    label: template.label,
    icon: template.icon,
    route: `${basePath}/${template.routeSuffix}`,
    group: template.group,
    order: template.order,
    enabledByDefault: template.enabledByDefault,
    kpiKeys: template.kpiKeys,
  };
}

/**
 * Materializar un layout template completo en módulos concretos.
 */
export function materializeLayout(
  layout: LayoutTemplate,
  prefix: string,
  basePath: string
): Record<string, SpecialtyModule[]> {
  const result: Record<string, SpecialtyModule[]> = {};

  for (const [group, templates] of Object.entries(layout)) {
    if (!templates || templates.length === 0) continue;
    result[group] = (templates as ModuleTemplate[]).map((t) => materializeModule(t, prefix, basePath));
  }

  return result;
}
