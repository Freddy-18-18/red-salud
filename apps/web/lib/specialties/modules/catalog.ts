// ============================================
// MODULE CATALOG — Shared Module Definitions
// All reusable modules that specialties compose from
// ============================================

import type { ModuleDefinition } from '@red-salud/types';

// ============================================================================
// CLINICAL MODULES
// ============================================================================

export const CONSULTA: ModuleDefinition = {
  id: 'clinical-consultation',
  name: 'Consulta Médica',
  slug: 'consulta',
  version: '2.0.0',
  group: 'clinical',
  icon: 'Stethoscope',
  description: 'Consulta médica con notas SOAP y examen clínico',
  route: '/dashboard/medico/consulta',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId', 'appointmentId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: false,
    defaultSize: 'medium',
    defaultVisible: false,
  },
};

export const RECETAS: ModuleDefinition = {
  id: 'clinical-prescriptions',
  name: 'Recetas',
  slug: 'recetas',
  version: '2.0.0',
  group: 'clinical',
  icon: 'Pill',
  description: 'Prescripciones médicas con firma digital',
  route: '/dashboard/medico/recetas',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 2,
  tags: ['prescripcion', 'medicamento', 'firma'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'sacs',
    compatibleSpecialties: ['*'],
    optionalCapabilities: ['print'],
    permissions: [
      {
        permission: 'can_prescribe',
        required: true,
        description: 'Permiso para emitir recetas médicas',
      },
    ],
  },
  widget: {
    enabled: false,
    defaultSize: 'small',
    defaultVisible: false,
  },
};

export const HISTORIA_CLINICA: ModuleDefinition = {
  id: 'clinical-medical-history',
  name: 'Historia Clínica',
  slug: 'historia-clinica',
  version: '1.0.0',
  group: 'clinical',
  icon: 'ClipboardList',
  description: 'Historial clínico completo del paciente',
  route: '/dashboard/medico/pacientes/historial',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 3,
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

export const PLANTILLAS_CLINICAS: ModuleDefinition = {
  id: 'clinical-templates',
  name: 'Plantillas Clínicas',
  slug: 'templates',
  version: '1.0.0',
  group: 'clinical',
  icon: 'FileTemplate',
  description: 'Plantillas para notas y formularios clínicos',
  route: '/dashboard/medico/templates',
  lifecycle: 'stable',
  enabledByDefault: false,
  order: 5,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

export const ICD11: ModuleDefinition = {
  id: 'clinical-icd11',
  name: 'Diagnósticos ICD-11',
  slug: 'icd11',
  version: '1.0.0',
  group: 'clinical',
  icon: 'Search',
  description: 'Búsqueda y codificación ICD-11 con IA',
  route: '/dashboard/medico/consulta/icd11',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 4,
  tags: ['diagnostico', 'codificacion', 'ia'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId', 'consultationId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

// ============================================================================
// FINANCIAL MODULES
// ============================================================================

export const PRESUPUESTOS: ModuleDefinition = {
  id: 'financial-estimates',
  name: 'Presupuestos',
  slug: 'presupuestos',
  version: '1.0.0',
  group: 'financial',
  icon: 'FileText',
  description: 'Presupuestos de tratamiento para pacientes',
  route: '/dashboard/medico/presupuestos',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  kpiKeys: ['case_acceptance_rate', 'avg_treatment_value'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

export const SEGUROS: ModuleDefinition = {
  id: 'financial-insurance',
  name: 'Seguros',
  slug: 'seguros',
  version: '1.0.0',
  group: 'financial',
  icon: 'Shield',
  description: 'Verificación y gestión de seguros médicos',
  route: '/dashboard/medico/seguros',
  lifecycle: 'stable',
  enabledByDefault: false,
  order: 2,
  kpiKeys: ['claim_first_pass_acceptance', 'avg_claim_processing_time'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

export const FACTURACION: ModuleDefinition = {
  id: 'financial-billing',
  name: 'Facturación',
  slug: 'facturacion',
  version: '1.0.0',
  group: 'financial',
  icon: 'Receipt',
  description: 'Facturación y cobros a pacientes',
  route: '/dashboard/medico/facturacion',
  lifecycle: 'beta',
  enabledByDefault: false,
  order: 3,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria', 'admin'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
    optionalCapabilities: ['print'],
  },
};

export const MEMBRESIAS: ModuleDefinition = {
  id: 'financial-memberships',
  name: 'Membresías',
  slug: 'membresias',
  version: '1.0.0',
  group: 'financial',
  icon: 'CreditCard',
  description: 'Planes de membresía para pacientes',
  route: '/dashboard/medico/membresias',
  lifecycle: 'stable',
  enabledByDefault: false,
  order: 4,
  kpiKeys: ['active_memberships', 'membership_revenue'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

// ============================================================================
// LAB MODULES
// ============================================================================

export const LABORATORIO: ModuleDefinition = {
  id: 'lab-orders',
  name: 'Laboratorio',
  slug: 'laboratorio',
  version: '1.0.0',
  group: 'lab',
  icon: 'FlaskConical',
  description: 'Órdenes de laboratorio y seguimiento de resultados',
  route: '/dashboard/medico/laboratorio',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  kpiKeys: ['lab_cases_pending', 'avg_lab_turnaround'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/lab-results-pending-widget',
    defaultSize: 'small',
    defaultVisible: true,
    realtime: false,
    refreshInterval: 60000,
  },
};

export const INVENTARIO: ModuleDefinition = {
  id: 'lab-inventory',
  name: 'Inventario',
  slug: 'inventario',
  version: '1.0.0',
  group: 'lab',
  icon: 'Package',
  description: 'Gestión de inventario de insumos médicos',
  route: '/dashboard/medico/inventario',
  lifecycle: 'stable',
  enabledByDefault: false,
  order: 2,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria', 'admin'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

export const IMAGENOLOGIA: ModuleDefinition = {
  id: 'lab-imaging',
  name: 'Imagenología',
  slug: 'radiografias',
  version: '1.0.0',
  group: 'lab',
  icon: 'Scan',
  description: 'Órdenes y visualización de estudios de imagen',
  route: '/dashboard/medico/radiografias',
  lifecycle: 'stable',
  enabledByDefault: false,
  order: 3,
  tags: ['radiografia', 'imagen', 'dicom', 'rayos-x'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
    compatibleCategories: ['diagnostic', 'dental', 'surgical', 'medical'],
  },
};

// ============================================================================
// TECHNOLOGY MODULES
// ============================================================================

export const TELEMEDICINA: ModuleDefinition = {
  id: 'tech-telemedicine',
  name: 'Telemedicina',
  slug: 'telemedicina',
  version: '1.0.0',
  group: 'technology',
  icon: 'Video',
  description: 'Videoconsultas con pacientes',
  route: '/dashboard/medico/telemedicina',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  tags: ['video', 'consulta-online', 'remoto'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId', 'appointmentId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
    requiredCapabilities: ['camera', 'microphone', 'websocket'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/upcoming-telemedicine-widget',
    defaultSize: 'small',
    defaultVisible: true,
    realtime: true,
  },
};

export const IA_ASISTENTE: ModuleDefinition = {
  id: 'tech-ai-assistant',
  name: 'Asistente IA',
  slug: 'asistente-ia',
  version: '1.0.0',
  group: 'technology',
  icon: 'Sparkles',
  description: 'Asistente médico con inteligencia artificial',
  route: '/dashboard/medico/consulta/ia',
  lifecycle: 'beta',
  enabledByDefault: false,
  order: 2,
  tags: ['ia', 'gemini', 'sugerencias', 'diagnostico'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId', 'consultationId'],
    allowedRoles: ['medico'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
};

// ============================================================================
// COMMUNICATION MODULES
// ============================================================================

export const MENSAJERIA: ModuleDefinition = {
  id: 'comm-messaging',
  name: 'Mensajería',
  slug: 'mensajeria',
  version: '1.0.0',
  group: 'communication',
  icon: 'MessageSquare',
  description: 'Chat seguro con pacientes y colegas',
  route: '/dashboard/medico/mensajeria',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'profesional_salud', 'secretaria'],
    minimumVerification: 'email',
    compatibleSpecialties: ['*'],
    requiredCapabilities: ['websocket'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/messages-widget',
    defaultSize: 'small',
    defaultVisible: true,
    realtime: true,
  },
};

export const VOIP: ModuleDefinition = {
  id: 'comm-voip',
  name: 'Llamadas VoIP',
  slug: 'llamadas',
  version: '1.0.0',
  group: 'communication',
  icon: 'Phone',
  description: 'Llamadas de voz sobre IP con pacientes',
  route: '/dashboard/medico/llamadas',
  lifecycle: 'beta',
  enabledByDefault: false,
  order: 2,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
    requiredCapabilities: ['microphone', 'websocket'],
  },
};

// ============================================================================
// GROWTH MODULES
// ============================================================================

export const ESTADISTICAS: ModuleDefinition = {
  id: 'growth-statistics',
  name: 'Estadísticas',
  slug: 'estadisticas',
  version: '1.0.0',
  group: 'growth',
  icon: 'TrendingUp',
  description: 'Métricas y estadísticas del consultorio',
  route: '/dashboard/medico/estadisticas',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'admin'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/performance-chart-widget',
    defaultSize: 'large',
    defaultVisible: true,
  },
};

// ============================================================================
// ADMINISTRATIVE MODULES
// ============================================================================

export const CITAS: ModuleDefinition = {
  id: 'admin-appointments',
  name: 'Agenda',
  slug: 'citas',
  version: '2.0.0',
  group: 'administrative',
  icon: 'Calendar',
  description: 'Gestión de citas y agenda médica',
  route: '/dashboard/medico/citas',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  kpiKeys: ['appointments_today', 'no_show_rate'],
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/today-timeline-widget',
    defaultSize: 'medium',
    defaultVisible: true,
    realtime: true,
  },
};

export const PACIENTES: ModuleDefinition = {
  id: 'admin-patients',
  name: 'Pacientes',
  slug: 'pacientes',
  version: '2.0.0',
  group: 'administrative',
  icon: 'Users',
  description: 'Registro y gestión de pacientes',
  route: '/dashboard/medico/pacientes',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 2,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/pending-patients-widget',
    defaultSize: 'small',
    defaultVisible: true,
    realtime: true,
  },
};

export const CONFIGURACION: ModuleDefinition = {
  id: 'admin-settings',
  name: 'Configuración',
  slug: 'configuracion',
  version: '1.0.0',
  group: 'administrative',
  icon: 'Settings',
  description: 'Configuración del perfil y consultorio',
  route: '/dashboard/medico/configuracion',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 10,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico'],
    minimumVerification: 'email',
    compatibleSpecialties: ['*'],
  },
};

export const TAREAS: ModuleDefinition = {
  id: 'admin-tasks',
  name: 'Tareas',
  slug: 'tareas',
  version: '1.0.0',
  group: 'administrative',
  icon: 'CheckSquare',
  description: 'Lista de tareas y pendientes',
  route: '/dashboard/medico/tareas',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 3,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'email',
    compatibleSpecialties: ['*'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/dashboard/widgets/tasks-widget',
    defaultSize: 'small',
    defaultVisible: true,
  },
};

// ============================================================================
// DENTAL-SPECIFIC MODULES (solo compatible con categoría 'dental')
// ============================================================================

export const PERIODONTOGRAMA: ModuleDefinition = {
  id: 'dental-periodontogram',
  name: 'Periodontograma',
  slug: 'periodontograma',
  version: '1.0.0',
  group: 'clinical',
  icon: 'Gum',
  description: 'Examen periodontal con gráfico interactivo',
  route: '/dashboard/medico/odontologia/periodontograma',
  componentPath: '@/components/dashboard/medico/odontologia/periodontogram/periodontogram-professional',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 2,
  tags: ['periodontal', 'examen', 'dientes', 'encias'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'sacs',
    compatibleSpecialties: ['dental', 'dental-periodontics', 'dental-implantology'],
    compatibleCategories: ['dental'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/odontologia/widgets/odontogram-widget',
    defaultSize: 'medium',
    defaultVisible: true,
  },
};

export const DENTAL_IMAGING: ModuleDefinition = {
  id: 'dental-imaging',
  name: 'Imágenes IA Dental',
  slug: 'imaging',
  version: '1.0.0',
  group: 'technology',
  icon: 'Scan',
  description: 'Análisis de imágenes dentales con inteligencia artificial',
  route: '/dashboard/medico/odontologia/imaging',
  lifecycle: 'beta',
  enabledByDefault: false,
  order: 1,
  tags: ['ia', 'imagen', 'rayos-x', 'dental'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['dental', 'dental-radiology', 'dental-oral-surgery'],
    compatibleCategories: ['dental'],
    optionalCapabilities: ['webgl'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/odontologia/widgets/ai-imaging-widget',
    defaultSize: 'medium',
    defaultVisible: false,
  },
};

export const DENTAL_3D: ModuleDefinition = {
  id: 'dental-3d-models',
  name: 'Modelos 3D',
  slug: '3d',
  version: '1.0.0',
  group: 'technology',
  icon: 'Box',
  description: 'Visualización 3D de modelos dentales',
  route: '/dashboard/medico/odontologia/3d',
  lifecycle: 'alpha',
  enabledByDefault: false,
  order: 3,
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['dental', 'dental-orthodontics', 'dental-prosthodontics'],
    compatibleCategories: ['dental'],
    requiredCapabilities: ['webgl'],
  },
};

export const DENTAL_RCM: ModuleDefinition = {
  id: 'dental-rcm',
  name: 'RCM Dental',
  slug: 'rcm',
  version: '1.0.0',
  group: 'financial',
  icon: 'DollarSign',
  description: 'Revenue Cycle Management para práctica dental',
  route: '/dashboard/medico/odontologia/rcm',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 4,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'secretaria'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['dental'],
    compatibleCategories: ['dental'],
  },
};

export const TELEDENTOLOGIA: ModuleDefinition = {
  id: 'dental-teledentistry',
  name: 'Teledentología',
  slug: 'teledentologia',
  version: '1.0.0',
  group: 'communication',
  icon: 'Video',
  description: 'Teledentología y seguimiento remoto dental',
  route: '/dashboard/medico/odontologia/teledentologia',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['dental'],
    compatibleCategories: ['dental'],
    requiredCapabilities: ['camera', 'microphone', 'websocket'],
  },
};

export const DENTAL_GROWTH: ModuleDefinition = {
  id: 'dental-practice-growth',
  name: 'Practice Growth',
  slug: 'growth',
  version: '1.0.0',
  group: 'growth',
  icon: 'TrendingUp',
  description: 'Análisis de crecimiento de la práctica dental',
  route: '/dashboard/medico/odontologia/growth',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 1,
  context: {
    requiredContextKeys: ['userId', 'profileId'],
    allowedRoles: ['medico', 'admin'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['dental'],
    compatibleCategories: ['dental'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/odontologia/widgets/practice-growth-widget',
    defaultSize: 'full',
    defaultVisible: true,
  },
};

// ============================================================================
// CARDIOLOGY-SPECIFIC MODULES
// ============================================================================

export const ECG_VIEWER: ModuleDefinition = {
  id: 'cardiology-ecg',
  name: 'Electrocardiograma',
  slug: 'ecg',
  version: '1.0.0',
  group: 'clinical',
  icon: 'Heart',
  description: 'Visor y análisis de ECG',
  route: '/dashboard/medico/cardiologia/ecg',
  lifecycle: 'beta',
  enabledByDefault: true,
  order: 2,
  tags: ['ecg', 'electrocardiograma', 'ritmo', 'arritmia'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico'],
    minimumVerification: 'sacs',
    compatibleSpecialties: ['cardiology', 'cardiac-surgery'],
    compatibleCategories: ['medical'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/cardiology/widgets/ecg-queue-widget',
    defaultSize: 'medium',
    defaultVisible: true,
    realtime: true,
  },
};

export const CRITICAL_ALERTS: ModuleDefinition = {
  id: 'cardiology-critical-alerts',
  name: 'Alertas Críticas',
  slug: 'alertas-criticas',
  version: '1.0.0',
  group: 'clinical',
  icon: 'AlertTriangle',
  description: 'Panel de alertas para pacientes cardiovasculares críticos',
  route: '/dashboard/medico/cardiologia/alertas',
  lifecycle: 'beta',
  enabledByDefault: true,
  order: 1,
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    allowedRoles: ['medico'],
    minimumVerification: 'sacs',
    compatibleSpecialties: ['cardiology', 'cardiac-surgery', 'critical-care'],
    compatibleCategories: ['medical'],
    requiredCapabilities: ['websocket'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/cardiology/widgets/critical-alerts-widget',
    defaultSize: 'large',
    defaultVisible: true,
    realtime: true,
  },
};

// ============================================================================
// PEDIATRICS-SPECIFIC MODULES
// ============================================================================

export const GROWTH_CURVES: ModuleDefinition = {
  id: 'pediatrics-growth-curves',
  name: 'Curvas de Crecimiento',
  slug: 'curvas-crecimiento',
  version: '1.0.0',
  group: 'clinical',
  icon: 'TrendingUp',
  description: 'Curvas de crecimiento OMS/CDC para pacientes pediátricos',
  route: '/dashboard/medico/pediatria/curvas-crecimiento',
  lifecycle: 'beta',
  enabledByDefault: true,
  order: 2,
  tags: ['crecimiento', 'percentil', 'oms', 'peso', 'talla'],
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    dataRequirements: [
      {
        key: 'patientAge',
        type: 'number',
        required: false,
        description: 'Edad del paciente en meses para seleccionar la curva correcta',
      },
    ],
    allowedRoles: ['medico'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['pediatrics', 'dental-pediatric'],
    compatibleCategories: ['pediatric'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/pediatria/widgets/growth-alerts-widget',
    defaultSize: 'medium',
    defaultVisible: true,
  },
};

export const VACCINATION_TRACKER: ModuleDefinition = {
  id: 'pediatrics-vaccinations',
  name: 'Vacunación',
  slug: 'vacunacion',
  version: '1.0.0',
  group: 'clinical',
  icon: 'Syringe',
  description: 'Seguimiento del esquema de vacunación pediátrica',
  route: '/dashboard/medico/pediatria/vacunacion',
  lifecycle: 'stable',
  enabledByDefault: true,
  order: 3,
  context: {
    requiredContextKeys: ['userId', 'profileId', 'specialtyId'],
    optionalContextKeys: ['patientId'],
    allowedRoles: ['medico', 'profesional_salud'],
    minimumVerification: 'profile',
    compatibleSpecialties: ['pediatrics', 'family-medicine'],
    compatibleCategories: ['pediatric', 'primary_care'],
  },
  widget: {
    enabled: true,
    componentPath: '@/components/dashboard/medico/pediatria/widgets/vaccination-tracker-widget',
    defaultSize: 'medium',
    defaultVisible: true,
  },
};

// ============================================================================
// FULL CATALOG EXPORT
// ============================================================================

/**
 * All shared module definitions, indexed by ID.
 * Use this to compose specialty configs.
 */
export const MODULE_CATALOG: Record<string, ModuleDefinition> = {
  // Clinical
  [CONSULTA.id]: CONSULTA,
  [RECETAS.id]: RECETAS,
  [HISTORIA_CLINICA.id]: HISTORIA_CLINICA,
  [PLANTILLAS_CLINICAS.id]: PLANTILLAS_CLINICAS,
  [ICD11.id]: ICD11,

  // Financial
  [PRESUPUESTOS.id]: PRESUPUESTOS,
  [SEGUROS.id]: SEGUROS,
  [FACTURACION.id]: FACTURACION,
  [MEMBRESIAS.id]: MEMBRESIAS,

  // Lab
  [LABORATORIO.id]: LABORATORIO,
  [INVENTARIO.id]: INVENTARIO,
  [IMAGENOLOGIA.id]: IMAGENOLOGIA,

  // Technology
  [TELEMEDICINA.id]: TELEMEDICINA,
  [IA_ASISTENTE.id]: IA_ASISTENTE,

  // Communication
  [MENSAJERIA.id]: MENSAJERIA,
  [VOIP.id]: VOIP,

  // Growth
  [ESTADISTICAS.id]: ESTADISTICAS,

  // Administrative
  [CITAS.id]: CITAS,
  [PACIENTES.id]: PACIENTES,
  [CONFIGURACION.id]: CONFIGURACION,
  [TAREAS.id]: TAREAS,

  // Dental specialty
  [PERIODONTOGRAMA.id]: PERIODONTOGRAMA,
  [DENTAL_IMAGING.id]: DENTAL_IMAGING,
  [DENTAL_3D.id]: DENTAL_3D,
  [DENTAL_RCM.id]: DENTAL_RCM,
  [TELEDENTOLOGIA.id]: TELEDENTOLOGIA,
  [DENTAL_GROWTH.id]: DENTAL_GROWTH,

  // Cardiology specialty
  [ECG_VIEWER.id]: ECG_VIEWER,
  [CRITICAL_ALERTS.id]: CRITICAL_ALERTS,

  // Pediatrics specialty
  [GROWTH_CURVES.id]: GROWTH_CURVES,
  [VACCINATION_TRACKER.id]: VACCINATION_TRACKER,
};

/**
 * Get all module definitions as an array.
 */
export function getCatalogModules(): ModuleDefinition[] {
  return Object.values(MODULE_CATALOG);
}

/**
 * Get a module from the catalog by ID.
 */
export function getCatalogModule(id: string): ModuleDefinition | undefined {
  return MODULE_CATALOG[id];
}

/**
 * Get modules by group from the catalog.
 */
export function getCatalogModulesByGroup(group: ModuleDefinition['group']): ModuleDefinition[] {
  return Object.values(MODULE_CATALOG).filter((m) => m.group === group);
}
