// ============================================
// MODULE SCHEMA — Schema-Driven CRUD Module Definitions
// Drives: data tables, forms, detail views
// Works with: lib/supabase/services/specialty-crud-factory.ts
// ============================================

// ============================================
// Type Definitions
// ============================================

/** Supported field types for forms and table columns */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'boolean'
  | 'badge'
  | 'hidden';

/** Column definition for data tables */
export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  type?: FieldType;
  /** Custom formatter for display value */
  format?: (value: unknown, row: Record<string, unknown>) => string;
  /** Badge color variant resolver */
  badgeVariant?: (value: unknown) => 'default' | 'secondary' | 'destructive' | 'outline';
  width?: string;
  hidden?: boolean;
}

/** Field definition for create/edit forms */
export interface FormFieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
  /** Grid column span: 1 = half width, 2 = full width */
  colSpan?: 1 | 2;
}

/** Section in a detail/view page */
export interface DetailSectionDef {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    format?: (value: unknown) => string;
    colSpan?: 1 | 2;
  }>;
}

/** Main schema that fully describes a CRUD module */
export interface ModuleSchema {
  // -- Metadata --
  name: string;
  slug: string;
  tableName: string;
  specialtySlug: string;
  icon: string;
  description: string;

  // -- Table --
  columns: ColumnDef[];
  defaultSort: { key: string; direction: 'asc' | 'desc' };

  // -- Form --
  formFields: FormFieldDef[];

  // -- Detail view --
  detailSections: DetailSectionDef[];

  // -- Labels --
  labels: {
    singular: string;
    plural: string;
    create: string;
    edit: string;
    delete: string;
    empty: string;
  };
}

// ============================================
// Helpers — Shared formatters
// ============================================

const fmtDate = (v: unknown) =>
  v ? new Date(v as string).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtDateTime = (v: unknown) =>
  v
    ? new Date(v as string).toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const fmtNumber = (v: unknown) => (v != null ? String(v) : '—');

const fmtMmHg = (v: unknown) => (v ? `${v} mmHg` : '—');

const fmtKg = (v: unknown) => (v != null ? `${v} kg` : '—');

const fmtCm = (v: unknown) => (v != null ? `${v} cm` : '—');

const fmtMin = (v: unknown) => (v != null ? `${v} min` : '—');

const fmtBool = (v: unknown) => (v ? 'Sí' : 'No');

const fmtPainLevel = (v: unknown) => (v != null ? `${v}/10` : '—');

const severityBadge = (v: unknown): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (v) {
    case 'leve':
      return 'secondary';
    case 'moderada':
      return 'default';
    case 'severa':
    case 'grave':
      return 'destructive';
    default:
      return 'outline';
  }
};

const statusBadge = (v: unknown): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (v) {
    case 'completado':
    case 'normal':
      return 'default';
    case 'en_progreso':
    case 'pendiente':
      return 'secondary';
    case 'cancelado':
    case 'anormal':
      return 'destructive';
    default:
      return 'outline';
  }
};

const riskBadge = (v: unknown): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (v) {
    case 'bajo':
      return 'default';
    case 'medio':
      return 'secondary';
    case 'alto':
      return 'destructive';
    default:
      return 'outline';
  }
};

// ============================================
// 1. CARDIOLOGÍA — cardiology_ecg
// ============================================

const cardiologyEcgSchema: ModuleSchema = {
  name: 'Electrocardiograma',
  slug: 'ecg',
  tableName: 'cardiology_ecg',
  specialtySlug: 'cardiologia',
  icon: 'Activity',
  description: 'Registros de electrocardiogramas del paciente',

  columns: [
    { key: 'ecg_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'ecg_type', label: 'Tipo de ECG', sortable: true },
    { key: 'heart_rate', label: 'FC (lpm)', sortable: true, type: 'number' },
    { key: 'rhythm', label: 'Ritmo', sortable: false },
    { key: 'pr_interval', label: 'PR (ms)', type: 'number' },
    { key: 'qrs_duration', label: 'QRS (ms)', type: 'number' },
    { key: 'qt_interval', label: 'QT (ms)', type: 'number' },
    { key: 'interpretation', label: 'Interpretación', sortable: false },
    {
      key: 'abnormalities',
      label: 'Anomalías',
      type: 'badge',
      badgeVariant: (v) => (v && (v as string).length > 0 ? 'destructive' : 'default'),
    },
  ],
  defaultSort: { key: 'ecg_date', direction: 'desc' },

  formFields: [
    { key: 'ecg_date', label: 'Fecha del ECG', type: 'date', required: true, colSpan: 1 },
    {
      key: 'ecg_type',
      label: 'Tipo de ECG',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'reposo', label: 'ECG en reposo' },
        { value: 'esfuerzo', label: 'Prueba de esfuerzo' },
        { value: 'holter_24h', label: 'Holter 24h' },
        { value: 'holter_48h', label: 'Holter 48h' },
        { value: 'holter_7d', label: 'Holter 7 días' },
      ],
    },
    {
      key: 'heart_rate',
      label: 'Frecuencia Cardíaca (lpm)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 20, max: 300, message: 'FC debe estar entre 20 y 300 lpm' },
    },
    { key: 'rhythm', label: 'Ritmo', type: 'text', required: true, placeholder: 'Ej: Sinusal', colSpan: 1 },
    {
      key: 'pr_interval',
      label: 'Intervalo PR (ms)',
      type: 'number',
      colSpan: 1,
      validation: { min: 80, max: 400 },
    },
    {
      key: 'qrs_duration',
      label: 'Duración QRS (ms)',
      type: 'number',
      colSpan: 1,
      validation: { min: 60, max: 200 },
    },
    {
      key: 'qt_interval',
      label: 'Intervalo QT (ms)',
      type: 'number',
      colSpan: 1,
      validation: { min: 300, max: 600 },
    },
    { key: 'interpretation', label: 'Interpretación', type: 'textarea', required: true, colSpan: 2, placeholder: 'Descripción del trazado e interpretación clínica' },
    { key: 'abnormalities', label: 'Anomalías', type: 'textarea', colSpan: 2, placeholder: 'Anormalidades detectadas (dejar vacío si normal)' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del ECG',
      fields: [
        { key: 'ecg_date', label: 'Fecha', format: fmtDate },
        { key: 'ecg_type', label: 'Tipo de ECG' },
        { key: 'heart_rate', label: 'Frecuencia Cardíaca', format: (v) => `${v} lpm` },
        { key: 'rhythm', label: 'Ritmo' },
      ],
    },
    {
      title: 'Intervalos',
      fields: [
        { key: 'pr_interval', label: 'Intervalo PR', format: (v) => `${v} ms` },
        { key: 'qrs_duration', label: 'Duración QRS', format: (v) => `${v} ms` },
        { key: 'qt_interval', label: 'Intervalo QT', format: (v) => `${v} ms` },
      ],
    },
    {
      title: 'Interpretación',
      fields: [
        { key: 'interpretation', label: 'Interpretación', colSpan: 2 },
        { key: 'abnormalities', label: 'Anomalías', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Electrocardiograma',
    plural: 'Electrocardiogramas',
    create: 'Registrar ECG',
    edit: 'Editar ECG',
    delete: '¿Eliminar este electrocardiograma?',
    empty: 'No hay electrocardiogramas registrados',
  },
};

// ============================================
// 2. CARDIOLOGÍA — cardiology_procedures
// ============================================

const cardiologyProceduresSchema: ModuleSchema = {
  name: 'Procedimientos Cardíacos',
  slug: 'procedimientos-cardiacos',
  tableName: 'cardiology_procedures',
  specialtySlug: 'cardiologia',
  icon: 'HeartPulse',
  description: 'Registro de procedimientos cardíacos realizados',

  columns: [
    { key: 'procedure_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'procedure_type', label: 'Procedimiento', sortable: true },
    { key: 'indication', label: 'Indicación' },
    { key: 'duration_minutes', label: 'Duración', type: 'number', format: (v) => fmtMin(v) },
    { key: 'findings', label: 'Hallazgos' },
    {
      key: 'complications',
      label: 'Complicaciones',
      type: 'badge',
      badgeVariant: (v) => (v && (v as string).length > 0 ? 'destructive' : 'default'),
    },
    { key: 'outcome', label: 'Resultado', type: 'badge', badgeVariant: statusBadge },
  ],
  defaultSort: { key: 'procedure_date', direction: 'desc' },

  formFields: [
    { key: 'procedure_date', label: 'Fecha del Procedimiento', type: 'date', required: true, colSpan: 1 },
    {
      key: 'procedure_type',
      label: 'Tipo de Procedimiento',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'cateterismo', label: 'Cateterismo Cardíaco' },
        { value: 'angioplastia', label: 'Angioplastia' },
        { value: 'ecocardiograma', label: 'Ecocardiograma' },
        { value: 'cardioversion', label: 'Cardioversión' },
        { value: 'ablacion', label: 'Ablación' },
        { value: 'marcapaso', label: 'Implante de Marcapaso' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'indication', label: 'Indicación', type: 'textarea', required: true, colSpan: 2, placeholder: 'Motivo clínico del procedimiento' },
    {
      key: 'duration_minutes',
      label: 'Duración (minutos)',
      type: 'number',
      colSpan: 1,
      validation: { min: 1, max: 600 },
    },
    { key: 'findings', label: 'Hallazgos', type: 'textarea', colSpan: 2, placeholder: 'Hallazgos durante el procedimiento' },
    { key: 'complications', label: 'Complicaciones', type: 'textarea', colSpan: 2, placeholder: 'Complicaciones (dejar vacío si ninguna)' },
    {
      key: 'outcome',
      label: 'Resultado',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'exitoso', label: 'Exitoso' },
        { value: 'parcial', label: 'Parcialmente exitoso' },
        { value: 'fallido', label: 'Fallido' },
        { value: 'en_progreso', label: 'En progreso' },
      ],
    },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Procedimiento',
      fields: [
        { key: 'procedure_date', label: 'Fecha', format: fmtDate },
        { key: 'procedure_type', label: 'Tipo' },
        { key: 'duration_minutes', label: 'Duración', format: (v) => fmtMin(v) },
        { key: 'outcome', label: 'Resultado' },
      ],
    },
    {
      title: 'Detalles Clínicos',
      fields: [
        { key: 'indication', label: 'Indicación', colSpan: 2 },
        { key: 'findings', label: 'Hallazgos', colSpan: 2 },
        { key: 'complications', label: 'Complicaciones', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Procedimiento Cardíaco',
    plural: 'Procedimientos Cardíacos',
    create: 'Registrar Procedimiento',
    edit: 'Editar Procedimiento',
    delete: '¿Eliminar este procedimiento cardíaco?',
    empty: 'No hay procedimientos cardíacos registrados',
  },
};

// ============================================
// 3. NEUROLOGÍA — neurology_studies
// ============================================

const neurologyStudiesSchema: ModuleSchema = {
  name: 'Estudios Neurológicos',
  slug: 'estudios-neurologicos',
  tableName: 'neurology_studies',
  specialtySlug: 'neurologia',
  icon: 'Brain',
  description: 'Registro de estudios neurológicos (EEG, EMG, potenciales evocados, etc.)',

  columns: [
    { key: 'study_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'study_type', label: 'Tipo de Estudio', sortable: true },
    { key: 'region', label: 'Región' },
    { key: 'laterality', label: 'Lateralidad' },
    { key: 'findings', label: 'Hallazgos' },
    { key: 'interpretation', label: 'Interpretación' },
  ],
  defaultSort: { key: 'study_date', direction: 'desc' },

  formFields: [
    { key: 'study_date', label: 'Fecha del Estudio', type: 'date', required: true, colSpan: 1 },
    {
      key: 'study_type',
      label: 'Tipo de Estudio',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'eeg', label: 'Electroencefalograma (EEG)' },
        { value: 'emg', label: 'Electromiografía (EMG)' },
        { value: 'potenciales_evocados', label: 'Potenciales Evocados' },
        { value: 'velocidad_conduccion', label: 'Velocidad de Conducción' },
        { value: 'rmn_cerebral', label: 'RMN Cerebral' },
        { value: 'tac_cerebral', label: 'TAC Cerebral' },
        { value: 'doppler_carotideo', label: 'Doppler Carotídeo' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'region', label: 'Región Anatómica', type: 'text', colSpan: 1, placeholder: 'Ej: Lóbulo temporal, extremidad superior' },
    {
      key: 'laterality',
      label: 'Lateralidad',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'derecha', label: 'Derecha' },
        { value: 'izquierda', label: 'Izquierda' },
        { value: 'bilateral', label: 'Bilateral' },
        { value: 'central', label: 'Central' },
      ],
    },
    { key: 'findings', label: 'Hallazgos', type: 'textarea', required: true, colSpan: 2, placeholder: 'Hallazgos del estudio' },
    { key: 'interpretation', label: 'Interpretación', type: 'textarea', required: true, colSpan: 2, placeholder: 'Interpretación clínica de los hallazgos' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Estudio',
      fields: [
        { key: 'study_date', label: 'Fecha', format: fmtDate },
        { key: 'study_type', label: 'Tipo de Estudio' },
        { key: 'region', label: 'Región' },
        { key: 'laterality', label: 'Lateralidad' },
      ],
    },
    {
      title: 'Resultados',
      fields: [
        { key: 'findings', label: 'Hallazgos', colSpan: 2 },
        { key: 'interpretation', label: 'Interpretación', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Estudio Neurológico',
    plural: 'Estudios Neurológicos',
    create: 'Registrar Estudio',
    edit: 'Editar Estudio',
    delete: '¿Eliminar este estudio neurológico?',
    empty: 'No hay estudios neurológicos registrados',
  },
};

// ============================================
// 4. NEUROLOGÍA — neurology_assessments
// ============================================

const neurologyAssessmentsSchema: ModuleSchema = {
  name: 'Evaluaciones Neurológicas',
  slug: 'evaluaciones-neurologicas',
  tableName: 'neurology_assessments',
  specialtySlug: 'neurologia',
  icon: 'ClipboardCheck',
  description: 'Escalas y evaluaciones neurológicas estandarizadas',

  columns: [
    { key: 'assessment_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'assessment_type', label: 'Tipo de Evaluación', sortable: true },
    { key: 'glasgow_score', label: 'Glasgow', type: 'number', format: (v) => (v != null ? `${v}/15` : '—') },
    { key: 'nihss_score', label: 'NIHSS', type: 'number', format: fmtNumber },
    { key: 'mmse_score', label: 'MMSE', type: 'number', format: (v) => (v != null ? `${v}/30` : '—') },
    { key: 'berg_score', label: 'Berg', type: 'number', format: (v) => (v != null ? `${v}/56` : '—') },
    { key: 'notes', label: 'Notas' },
  ],
  defaultSort: { key: 'assessment_date', direction: 'desc' },

  formFields: [
    { key: 'assessment_date', label: 'Fecha de Evaluación', type: 'date', required: true, colSpan: 1 },
    {
      key: 'assessment_type',
      label: 'Tipo de Evaluación',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'glasgow', label: 'Escala de Glasgow' },
        { value: 'nihss', label: 'NIHSS (Ictus)' },
        { value: 'mmse', label: 'Mini-Mental (MMSE)' },
        { value: 'berg', label: 'Escala de Berg (Equilibrio)' },
        { value: 'completa', label: 'Evaluación Completa' },
      ],
    },
    {
      key: 'glasgow_score',
      label: 'Puntuación Glasgow',
      type: 'number',
      colSpan: 1,
      validation: { min: 3, max: 15, message: 'Glasgow: 3 (mínimo) a 15 (máximo)' },
      helpText: '3-8: Grave | 9-12: Moderado | 13-15: Leve',
    },
    {
      key: 'nihss_score',
      label: 'Puntuación NIHSS',
      type: 'number',
      colSpan: 1,
      validation: { min: 0, max: 42, message: 'NIHSS: 0 a 42' },
      helpText: '0: Sin déficit | 1-4: Menor | 5-15: Moderado | 16-20: Moderado-Severo | 21+: Severo',
    },
    {
      key: 'mmse_score',
      label: 'Puntuación MMSE',
      type: 'number',
      colSpan: 1,
      validation: { min: 0, max: 30, message: 'MMSE: 0 a 30' },
      helpText: '27-30: Normal | 24-26: Leve | 16-23: Moderado | <16: Severo',
    },
    {
      key: 'berg_score',
      label: 'Puntuación Berg',
      type: 'number',
      colSpan: 1,
      validation: { min: 0, max: 56, message: 'Berg: 0 a 56' },
      helpText: '0-20: Alto riesgo de caída | 21-40: Medio | 41-56: Bajo riesgo',
    },
    { key: 'notes', label: 'Notas Clínicas', type: 'textarea', colSpan: 2, placeholder: 'Observaciones adicionales de la evaluación' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos de la Evaluación',
      fields: [
        { key: 'assessment_date', label: 'Fecha', format: fmtDate },
        { key: 'assessment_type', label: 'Tipo de Evaluación' },
      ],
    },
    {
      title: 'Puntuaciones',
      fields: [
        { key: 'glasgow_score', label: 'Glasgow (GCS)', format: (v) => (v != null ? `${v}/15` : '—') },
        { key: 'nihss_score', label: 'NIHSS', format: fmtNumber },
        { key: 'mmse_score', label: 'MMSE', format: (v) => (v != null ? `${v}/30` : '—') },
        { key: 'berg_score', label: 'Berg', format: (v) => (v != null ? `${v}/56` : '—') },
      ],
    },
    {
      title: 'Observaciones',
      fields: [{ key: 'notes', label: 'Notas', colSpan: 2 }],
    },
  ],

  labels: {
    singular: 'Evaluación Neurológica',
    plural: 'Evaluaciones Neurológicas',
    create: 'Registrar Evaluación',
    edit: 'Editar Evaluación',
    delete: '¿Eliminar esta evaluación neurológica?',
    empty: 'No hay evaluaciones neurológicas registradas',
  },
};

// ============================================
// 5. TRAUMATOLOGÍA — traumatology_injuries
// ============================================

const traumatologyInjuriesSchema: ModuleSchema = {
  name: 'Lesiones',
  slug: 'lesiones',
  tableName: 'traumatology_injuries',
  specialtySlug: 'traumatologia',
  icon: 'Bone',
  description: 'Registro de lesiones traumatológicas y plan de tratamiento',

  columns: [
    { key: 'injury_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'injury_type', label: 'Tipo de Lesión', sortable: true },
    { key: 'anatomical_zone', label: 'Zona Anatómica', sortable: true },
    { key: 'laterality', label: 'Lateralidad' },
    { key: 'severity', label: 'Severidad', type: 'badge', badgeVariant: severityBadge },
    { key: 'mechanism', label: 'Mecanismo' },
    { key: 'surgery_required', label: 'Cirugía', type: 'boolean', format: (v) => fmtBool(v) },
  ],
  defaultSort: { key: 'injury_date', direction: 'desc' },

  formFields: [
    { key: 'injury_date', label: 'Fecha de Lesión', type: 'date', required: true, colSpan: 1 },
    {
      key: 'injury_type',
      label: 'Tipo de Lesión',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'fractura', label: 'Fractura' },
        { value: 'esguince', label: 'Esguince' },
        { value: 'luxacion', label: 'Luxación' },
        { value: 'tendinitis', label: 'Tendinitis' },
        { value: 'rotura_ligamento', label: 'Rotura de Ligamento' },
        { value: 'rotura_menisco', label: 'Rotura de Menisco' },
        { value: 'contusion', label: 'Contusión' },
        { value: 'hernia_discal', label: 'Hernia Discal' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'anatomical_zone', label: 'Zona Anatómica', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: Rodilla, Hombro, Columna lumbar' },
    {
      key: 'laterality',
      label: 'Lateralidad',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'derecha', label: 'Derecha' },
        { value: 'izquierda', label: 'Izquierda' },
        { value: 'bilateral', label: 'Bilateral' },
        { value: 'central', label: 'Central / Axial' },
      ],
    },
    {
      key: 'severity',
      label: 'Severidad',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'leve', label: 'Leve' },
        { value: 'moderada', label: 'Moderada' },
        { value: 'severa', label: 'Severa' },
        { value: 'grave', label: 'Grave' },
      ],
    },
    { key: 'mechanism', label: 'Mecanismo de Lesión', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: Caída, Accidente de tránsito, Deportivo' },
    { key: 'surgery_required', label: '¿Requiere Cirugía?', type: 'boolean', colSpan: 1, defaultValue: false },
    { key: 'treatment_plan', label: 'Plan de Tratamiento', type: 'textarea', required: true, colSpan: 2, placeholder: 'Plan terapéutico: inmovilización, cirugía, rehabilitación, etc.' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos de la Lesión',
      fields: [
        { key: 'injury_date', label: 'Fecha', format: fmtDate },
        { key: 'injury_type', label: 'Tipo de Lesión' },
        { key: 'anatomical_zone', label: 'Zona Anatómica' },
        { key: 'laterality', label: 'Lateralidad' },
      ],
    },
    {
      title: 'Evaluación',
      fields: [
        { key: 'severity', label: 'Severidad' },
        { key: 'mechanism', label: 'Mecanismo' },
        { key: 'surgery_required', label: '¿Requiere Cirugía?', format: fmtBool },
      ],
    },
    {
      title: 'Tratamiento',
      fields: [{ key: 'treatment_plan', label: 'Plan de Tratamiento', colSpan: 2 }],
    },
  ],

  labels: {
    singular: 'Lesión',
    plural: 'Lesiones',
    create: 'Registrar Lesión',
    edit: 'Editar Lesión',
    delete: '¿Eliminar este registro de lesión?',
    empty: 'No hay lesiones registradas',
  },
};

// ============================================
// 6. TRAUMATOLOGÍA — traumatology_rehab
// ============================================

const traumatologyRehabSchema: ModuleSchema = {
  name: 'Rehabilitación',
  slug: 'rehabilitacion',
  tableName: 'traumatology_rehab',
  specialtySlug: 'traumatologia',
  icon: 'Dumbbell',
  description: 'Seguimiento de sesiones de rehabilitación física',

  columns: [
    { key: 'session_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'rehab_type', label: 'Tipo de Rehabilitación', sortable: true },
    {
      key: 'session_number',
      label: 'Sesión',
      type: 'number',
      format: (v, row) => `${v}/${row['total_sessions'] ?? '?'}`,
    },
    { key: 'pain_level_pre', label: 'Dolor Pre', type: 'number', format: (v) => fmtPainLevel(v) },
    { key: 'pain_level_post', label: 'Dolor Post', type: 'number', format: (v) => fmtPainLevel(v) },
    { key: 'exercises', label: 'Ejercicios' },
  ],
  defaultSort: { key: 'session_date', direction: 'desc' },

  formFields: [
    { key: 'session_date', label: 'Fecha de Sesión', type: 'date', required: true, colSpan: 1 },
    {
      key: 'rehab_type',
      label: 'Tipo de Rehabilitación',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'fisioterapia', label: 'Fisioterapia' },
        { value: 'kinesiologia', label: 'Kinesiología' },
        { value: 'hidroterapia', label: 'Hidroterapia' },
        { value: 'electroterapia', label: 'Electroterapia' },
        { value: 'terapia_manual', label: 'Terapia Manual' },
        { value: 'ejercicio_terapeutico', label: 'Ejercicio Terapéutico' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    {
      key: 'session_number',
      label: 'Número de Sesión',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 1, max: 200 },
    },
    {
      key: 'total_sessions',
      label: 'Total de Sesiones Planificadas',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 1, max: 200 },
    },
    {
      key: 'pain_level_pre',
      label: 'Nivel de Dolor Pre-sesión (0-10)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 0, max: 10, message: 'Escala de dolor 0-10' },
      helpText: '0: Sin dolor | 10: Máximo dolor',
    },
    {
      key: 'pain_level_post',
      label: 'Nivel de Dolor Post-sesión (0-10)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 0, max: 10, message: 'Escala de dolor 0-10' },
    },
    { key: 'exercises', label: 'Ejercicios Realizados', type: 'textarea', required: true, colSpan: 2, placeholder: 'Descripción de ejercicios y repeticiones' },
    { key: 'progress_notes', label: 'Notas de Progreso', type: 'textarea', colSpan: 2, placeholder: 'Evolución y observaciones de la sesión' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos de Sesión',
      fields: [
        { key: 'session_date', label: 'Fecha', format: fmtDate },
        { key: 'rehab_type', label: 'Tipo de Rehabilitación' },
        { key: 'session_number', label: 'Sesión Nro.' },
        { key: 'total_sessions', label: 'Total Planificado' },
      ],
    },
    {
      title: 'Evaluación del Dolor',
      fields: [
        { key: 'pain_level_pre', label: 'Dolor Pre-sesión', format: fmtPainLevel },
        { key: 'pain_level_post', label: 'Dolor Post-sesión', format: fmtPainLevel },
      ],
    },
    {
      title: 'Tratamiento',
      fields: [
        { key: 'exercises', label: 'Ejercicios', colSpan: 2 },
        { key: 'progress_notes', label: 'Notas de Progreso', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Sesión de Rehabilitación',
    plural: 'Sesiones de Rehabilitación',
    create: 'Registrar Sesión',
    edit: 'Editar Sesión',
    delete: '¿Eliminar esta sesión de rehabilitación?',
    empty: 'No hay sesiones de rehabilitación registradas',
  },
};

// ============================================
// 7. OFTALMOLOGÍA — ophthalmology_exams
// ============================================

const ophthalmologyExamsSchema: ModuleSchema = {
  name: 'Exámenes Oftalmológicos',
  slug: 'examenes-oftalmologicos',
  tableName: 'ophthalmology_exams',
  specialtySlug: 'oftalmologia',
  icon: 'Eye',
  description: 'Registro de exámenes oftalmológicos (agudeza visual, PIO, fondo de ojo)',

  columns: [
    { key: 'exam_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'exam_type', label: 'Tipo de Examen', sortable: true },
    { key: 'va_od_sc', label: 'AV OD s/c' },
    { key: 'va_od_cc', label: 'AV OD c/c' },
    { key: 'va_oi_sc', label: 'AV OI s/c' },
    { key: 'va_oi_cc', label: 'AV OI c/c' },
    { key: 'iop_od', label: 'PIO OD', type: 'number', format: (v) => fmtMmHg(v) },
    { key: 'iop_oi', label: 'PIO OI', type: 'number', format: (v) => fmtMmHg(v) },
  ],
  defaultSort: { key: 'exam_date', direction: 'desc' },

  formFields: [
    { key: 'exam_date', label: 'Fecha del Examen', type: 'date', required: true, colSpan: 1 },
    {
      key: 'exam_type',
      label: 'Tipo de Examen',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'refraccion', label: 'Refracción' },
        { value: 'fondo_ojo', label: 'Fondo de Ojo' },
        { value: 'campo_visual', label: 'Campo Visual' },
        { value: 'tonometria', label: 'Tonometría' },
        { value: 'oct', label: 'OCT (Tomografía de Coherencia Óptica)' },
        { value: 'biomicroscopia', label: 'Biomicroscopía' },
        { value: 'completo', label: 'Examen Completo' },
      ],
    },
    { key: 'va_od_sc', label: 'Agudeza Visual OD sin corrección', type: 'text', colSpan: 1, placeholder: 'Ej: 20/20' },
    { key: 'va_od_cc', label: 'Agudeza Visual OD con corrección', type: 'text', colSpan: 1, placeholder: 'Ej: 20/20' },
    { key: 'va_oi_sc', label: 'Agudeza Visual OI sin corrección', type: 'text', colSpan: 1, placeholder: 'Ej: 20/25' },
    { key: 'va_oi_cc', label: 'Agudeza Visual OI con corrección', type: 'text', colSpan: 1, placeholder: 'Ej: 20/20' },
    {
      key: 'iop_od',
      label: 'Presión Intraocular OD (mmHg)',
      type: 'number',
      colSpan: 1,
      validation: { min: 5, max: 60, message: 'PIO normal: 10-21 mmHg' },
      helpText: 'Normal: 10-21 mmHg',
    },
    {
      key: 'iop_oi',
      label: 'Presión Intraocular OI (mmHg)',
      type: 'number',
      colSpan: 1,
      validation: { min: 5, max: 60, message: 'PIO normal: 10-21 mmHg' },
      helpText: 'Normal: 10-21 mmHg',
    },
    { key: 'fundoscopy', label: 'Fondo de Ojo', type: 'textarea', colSpan: 2, placeholder: 'Hallazgos de fundoscopía: papila, mácula, vasos, periferia' },
    { key: 'biomicroscopy', label: 'Biomicroscopía', type: 'textarea', colSpan: 2, placeholder: 'Hallazgos de lámpara de hendidura: párpados, conjuntiva, córnea, iris, cristalino' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Examen',
      fields: [
        { key: 'exam_date', label: 'Fecha', format: fmtDate },
        { key: 'exam_type', label: 'Tipo de Examen' },
      ],
    },
    {
      title: 'Agudeza Visual',
      fields: [
        { key: 'va_od_sc', label: 'OD sin corrección' },
        { key: 'va_od_cc', label: 'OD con corrección' },
        { key: 'va_oi_sc', label: 'OI sin corrección' },
        { key: 'va_oi_cc', label: 'OI con corrección' },
      ],
    },
    {
      title: 'Presión Intraocular',
      fields: [
        { key: 'iop_od', label: 'PIO Ojo Derecho', format: fmtMmHg },
        { key: 'iop_oi', label: 'PIO Ojo Izquierdo', format: fmtMmHg },
      ],
    },
    {
      title: 'Hallazgos',
      fields: [
        { key: 'fundoscopy', label: 'Fondo de Ojo', colSpan: 2 },
        { key: 'biomicroscopy', label: 'Biomicroscopía', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Examen Oftalmológico',
    plural: 'Exámenes Oftalmológicos',
    create: 'Registrar Examen',
    edit: 'Editar Examen',
    delete: '¿Eliminar este examen oftalmológico?',
    empty: 'No hay exámenes oftalmológicos registrados',
  },
};

// ============================================
// 8. OFTALMOLOGÍA — ophthalmology_procedures
// ============================================

const ophthalmologyProceduresSchema: ModuleSchema = {
  name: 'Procedimientos Oftalmológicos',
  slug: 'procedimientos-oftalmologicos',
  tableName: 'ophthalmology_procedures',
  specialtySlug: 'oftalmologia',
  icon: 'Glasses',
  description: 'Registro de procedimientos y cirugías oftalmológicas',

  columns: [
    { key: 'procedure_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'procedure_type', label: 'Procedimiento', sortable: true },
    { key: 'eye', label: 'Ojo', sortable: true },
    { key: 'technique', label: 'Técnica' },
    { key: 'anesthesia', label: 'Anestesia' },
    { key: 'outcome', label: 'Resultado', type: 'badge', badgeVariant: statusBadge },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeVariant: statusBadge,
    },
    {
      key: 'complications',
      label: 'Complicaciones',
      type: 'badge',
      badgeVariant: (v) => (v && (v as string).length > 0 ? 'destructive' : 'default'),
    },
  ],
  defaultSort: { key: 'procedure_date', direction: 'desc' },

  formFields: [
    { key: 'procedure_date', label: 'Fecha del Procedimiento', type: 'date', required: true, colSpan: 1 },
    {
      key: 'procedure_type',
      label: 'Tipo de Procedimiento',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'facoemulsificacion', label: 'Facoemulsificación (Cataratas)' },
        { value: 'lasik', label: 'LASIK' },
        { value: 'prk', label: 'PRK' },
        { value: 'trabeculectomia', label: 'Trabeculectomía (Glaucoma)' },
        { value: 'vitrectomia', label: 'Vitrectomía' },
        { value: 'inyeccion_intravitrea', label: 'Inyección Intravítrea' },
        { value: 'pterigion', label: 'Cirugía de Pterigión' },
        { value: 'blefaroplastia', label: 'Blefaroplastia' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    {
      key: 'eye',
      label: 'Ojo',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'OD', label: 'Ojo Derecho (OD)' },
        { value: 'OI', label: 'Ojo Izquierdo (OI)' },
        { value: 'AO', label: 'Ambos Ojos (AO)' },
      ],
    },
    { key: 'technique', label: 'Técnica Quirúrgica', type: 'text', colSpan: 1, placeholder: 'Ej: Facoemulsificación con LIO plegable' },
    {
      key: 'anesthesia',
      label: 'Anestesia',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'topica', label: 'Tópica' },
        { value: 'peribulbar', label: 'Peribulbar' },
        { value: 'retrobulbar', label: 'Retrobulbar' },
        { value: 'general', label: 'General' },
        { value: 'sedacion', label: 'Sedación' },
      ],
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'programado', label: 'Programado' },
        { value: 'completado', label: 'Completado' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'en_progreso', label: 'En Progreso' },
      ],
    },
    {
      key: 'outcome',
      label: 'Resultado',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'exitoso', label: 'Exitoso' },
        { value: 'parcial', label: 'Parcialmente exitoso' },
        { value: 'complicado', label: 'Con complicaciones' },
        { value: 'pendiente', label: 'Pendiente de evaluación' },
      ],
    },
    { key: 'complications', label: 'Complicaciones', type: 'textarea', colSpan: 2, placeholder: 'Complicaciones intra y postoperatorias (dejar vacío si ninguna)' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Procedimiento',
      fields: [
        { key: 'procedure_date', label: 'Fecha', format: fmtDate },
        { key: 'procedure_type', label: 'Tipo' },
        { key: 'eye', label: 'Ojo' },
        { key: 'status', label: 'Estado' },
      ],
    },
    {
      title: 'Técnica',
      fields: [
        { key: 'technique', label: 'Técnica Quirúrgica' },
        { key: 'anesthesia', label: 'Anestesia' },
      ],
    },
    {
      title: 'Resultado',
      fields: [
        { key: 'outcome', label: 'Resultado' },
        { key: 'complications', label: 'Complicaciones', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Procedimiento Oftalmológico',
    plural: 'Procedimientos Oftalmológicos',
    create: 'Registrar Procedimiento',
    edit: 'Editar Procedimiento',
    delete: '¿Eliminar este procedimiento oftalmológico?',
    empty: 'No hay procedimientos oftalmológicos registrados',
  },
};

// ============================================
// 9. GINECOLOGÍA — gynecology_controls
// ============================================

const gynecologyControlsSchema: ModuleSchema = {
  name: 'Controles Ginecológicos',
  slug: 'controles-ginecologicos',
  tableName: 'gynecology_controls',
  specialtySlug: 'ginecologia',
  icon: 'Heart',
  description: 'Registro de controles ginecológicos periódicos',

  columns: [
    { key: 'control_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'control_type', label: 'Tipo de Control', sortable: true },
    { key: 'last_menstrual_period', label: 'FUM', type: 'date', format: (v) => fmtDate(v) },
    { key: 'pap_result', label: 'Papanicolau', type: 'badge', badgeVariant: statusBadge },
    { key: 'hpv_result', label: 'VPH', type: 'badge', badgeVariant: statusBadge },
    { key: 'breast_exam_result', label: 'Examen Mamario', type: 'badge', badgeVariant: statusBadge },
    { key: 'contraception_method', label: 'Anticoncepción' },
  ],
  defaultSort: { key: 'control_date', direction: 'desc' },

  formFields: [
    { key: 'control_date', label: 'Fecha del Control', type: 'date', required: true, colSpan: 1 },
    {
      key: 'control_type',
      label: 'Tipo de Control',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'anual', label: 'Control Anual' },
        { value: 'papanicolau', label: 'Papanicolau' },
        { value: 'colposcopia', label: 'Colposcopía' },
        { value: 'ecografia', label: 'Ecografía Ginecológica' },
        { value: 'mamografia', label: 'Mamografía' },
        { value: 'seguimiento', label: 'Seguimiento' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'last_menstrual_period', label: 'Fecha de Última Menstruación (FUM)', type: 'date', colSpan: 1 },
    {
      key: 'pap_result',
      label: 'Resultado Papanicolau',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'ascus', label: 'ASCUS' },
        { value: 'lsil', label: 'LSIL' },
        { value: 'hsil', label: 'HSIL' },
        { value: 'no_realizado', label: 'No realizado' },
        { value: 'pendiente', label: 'Pendiente' },
      ],
    },
    {
      key: 'hpv_result',
      label: 'Resultado VPH',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'negativo', label: 'Negativo' },
        { value: 'positivo_bajo_riesgo', label: 'Positivo - Bajo riesgo' },
        { value: 'positivo_alto_riesgo', label: 'Positivo - Alto riesgo' },
        { value: 'no_realizado', label: 'No realizado' },
        { value: 'pendiente', label: 'Pendiente' },
      ],
    },
    {
      key: 'breast_exam_result',
      label: 'Examen Mamario',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'anormal', label: 'Anormal - Requiere seguimiento' },
        { value: 'nodulo', label: 'Nódulo palpable' },
        { value: 'no_realizado', label: 'No realizado' },
      ],
    },
    {
      key: 'contraception_method',
      label: 'Método Anticonceptivo',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'ninguno', label: 'Ninguno' },
        { value: 'aco', label: 'Anticonceptivos Orales' },
        { value: 'diu', label: 'DIU' },
        { value: 'implante', label: 'Implante Subdérmico' },
        { value: 'inyectable', label: 'Inyectable' },
        { value: 'preservativo', label: 'Preservativo' },
        { value: 'ligadura', label: 'Ligadura Tubárica' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'notes', label: 'Notas Clínicas', type: 'textarea', colSpan: 2, placeholder: 'Observaciones del control ginecológico' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Control',
      fields: [
        { key: 'control_date', label: 'Fecha', format: fmtDate },
        { key: 'control_type', label: 'Tipo de Control' },
        { key: 'last_menstrual_period', label: 'Última Menstruación', format: fmtDate },
        { key: 'contraception_method', label: 'Método Anticonceptivo' },
      ],
    },
    {
      title: 'Resultados',
      fields: [
        { key: 'pap_result', label: 'Papanicolau' },
        { key: 'hpv_result', label: 'VPH' },
        { key: 'breast_exam_result', label: 'Examen Mamario' },
      ],
    },
    {
      title: 'Observaciones',
      fields: [{ key: 'notes', label: 'Notas', colSpan: 2 }],
    },
  ],

  labels: {
    singular: 'Control Ginecológico',
    plural: 'Controles Ginecológicos',
    create: 'Registrar Control',
    edit: 'Editar Control',
    delete: '¿Eliminar este control ginecológico?',
    empty: 'No hay controles ginecológicos registrados',
  },
};

// ============================================
// 10. GINECOLOGÍA — gynecology_obstetric
// ============================================

const gynecologyObstetricSchema: ModuleSchema = {
  name: 'Control Obstétrico',
  slug: 'control-obstetrico',
  tableName: 'gynecology_obstetric',
  specialtySlug: 'ginecologia',
  icon: 'Baby',
  description: 'Seguimiento de embarazo y controles prenatales',

  columns: [
    { key: 'control_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'gestational_weeks', label: 'Sem. Gestación', sortable: true, type: 'number' },
    { key: 'weight_kg', label: 'Peso', type: 'number', format: (v) => fmtKg(v) },
    { key: 'blood_pressure', label: 'T/A' },
    { key: 'fetal_heart_rate', label: 'FCF (lpm)', type: 'number' },
    { key: 'fundal_height', label: 'AU (cm)', type: 'number', format: (v) => fmtCm(v) },
    { key: 'presentation', label: 'Presentación' },
    { key: 'risk_level', label: 'Riesgo', type: 'badge', badgeVariant: riskBadge },
  ],
  defaultSort: { key: 'control_date', direction: 'desc' },

  formFields: [
    { key: 'control_date', label: 'Fecha del Control', type: 'date', required: true, colSpan: 1 },
    { key: 'pregnancy_id', label: 'ID de Embarazo', type: 'text', required: true, colSpan: 1, helpText: 'Identificador único del embarazo' },
    {
      key: 'gestational_weeks',
      label: 'Semanas de Gestación',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 1, max: 45, message: 'Semanas: 1-45' },
    },
    {
      key: 'weight_kg',
      label: 'Peso (kg)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 30, max: 200 },
    },
    { key: 'blood_pressure', label: 'Tensión Arterial', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: 120/80' },
    {
      key: 'fetal_heart_rate',
      label: 'Frecuencia Cardíaca Fetal (lpm)',
      type: 'number',
      colSpan: 1,
      validation: { min: 100, max: 200, message: 'FCF normal: 110-160 lpm' },
      helpText: 'Normal: 110-160 lpm',
    },
    {
      key: 'fundal_height',
      label: 'Altura Uterina (cm)',
      type: 'number',
      colSpan: 1,
      validation: { min: 5, max: 45 },
    },
    {
      key: 'presentation',
      label: 'Presentación',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'cefalica', label: 'Cefálica' },
        { value: 'podalica', label: 'Podálica' },
        { value: 'transversa', label: 'Transversa' },
        { value: 'no_determinada', label: 'No determinada' },
      ],
    },
    {
      key: 'risk_level',
      label: 'Nivel de Riesgo',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'bajo', label: 'Bajo' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto' },
      ],
    },
    { key: 'notes', label: 'Notas del Control', type: 'textarea', colSpan: 2, placeholder: 'Observaciones del control prenatal' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Control',
      fields: [
        { key: 'control_date', label: 'Fecha', format: fmtDate },
        { key: 'pregnancy_id', label: 'ID de Embarazo' },
        { key: 'gestational_weeks', label: 'Semanas de Gestación' },
        { key: 'risk_level', label: 'Nivel de Riesgo' },
      ],
    },
    {
      title: 'Signos Vitales y Mediciones',
      fields: [
        { key: 'weight_kg', label: 'Peso', format: fmtKg },
        { key: 'blood_pressure', label: 'Tensión Arterial' },
        { key: 'fetal_heart_rate', label: 'FCF', format: (v) => `${v} lpm` },
        { key: 'fundal_height', label: 'Altura Uterina', format: fmtCm },
      ],
    },
    {
      title: 'Evaluación Fetal',
      fields: [
        { key: 'presentation', label: 'Presentación' },
      ],
    },
    {
      title: 'Observaciones',
      fields: [{ key: 'notes', label: 'Notas', colSpan: 2 }],
    },
  ],

  labels: {
    singular: 'Control Obstétrico',
    plural: 'Controles Obstétricos',
    create: 'Registrar Control',
    edit: 'Editar Control',
    delete: '¿Eliminar este control obstétrico?',
    empty: 'No hay controles obstétricos registrados',
  },
};

// ============================================
// 11. PEDIATRÍA — pediatrics_growth
// ============================================

const pediatricsGrowthSchema: ModuleSchema = {
  name: 'Crecimiento',
  slug: 'crecimiento',
  tableName: 'pediatrics_growth',
  specialtySlug: 'pediatria',
  icon: 'TrendingUp',
  description: 'Seguimiento de crecimiento y desarrollo del paciente pediátrico',

  columns: [
    { key: 'measurement_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'age_months', label: 'Edad (meses)', sortable: true, type: 'number' },
    { key: 'weight_kg', label: 'Peso', type: 'number', format: (v) => fmtKg(v) },
    { key: 'height_cm', label: 'Talla', type: 'number', format: (v) => fmtCm(v) },
    { key: 'head_circumference_cm', label: 'P. Cefálico', type: 'number', format: (v) => fmtCm(v) },
    { key: 'bmi', label: 'IMC', type: 'number', format: (v) => (v != null ? (v as number).toFixed(1) : '—') },
    { key: 'weight_percentile', label: '% Peso', type: 'number', format: (v) => (v != null ? `P${v}` : '—') },
    { key: 'height_percentile', label: '% Talla', type: 'number', format: (v) => (v != null ? `P${v}` : '—') },
    {
      key: 'nutritional_status',
      label: 'Estado Nutricional',
      type: 'badge',
      badgeVariant: (v) => {
        switch (v) {
          case 'normal': return 'default';
          case 'sobrepeso': case 'desnutricion_leve': return 'secondary';
          case 'obesidad': case 'desnutricion_moderada': case 'desnutricion_severa': return 'destructive';
          default: return 'outline';
        }
      },
    },
  ],
  defaultSort: { key: 'measurement_date', direction: 'desc' },

  formFields: [
    { key: 'measurement_date', label: 'Fecha de Medición', type: 'date', required: true, colSpan: 1 },
    {
      key: 'age_months',
      label: 'Edad (meses)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 0, max: 216, message: 'Edad en meses: 0-216 (0-18 años)' },
    },
    {
      key: 'weight_kg',
      label: 'Peso (kg)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 0.5, max: 150 },
    },
    {
      key: 'height_cm',
      label: 'Talla (cm)',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 30, max: 200 },
    },
    {
      key: 'head_circumference_cm',
      label: 'Perímetro Cefálico (cm)',
      type: 'number',
      colSpan: 1,
      validation: { min: 25, max: 60 },
      helpText: 'Relevante hasta 36 meses',
    },
    {
      key: 'bmi',
      label: 'IMC',
      type: 'number',
      colSpan: 1,
      helpText: 'Se calcula automáticamente si se deja vacío',
    },
    {
      key: 'weight_percentile',
      label: 'Percentil de Peso',
      type: 'number',
      colSpan: 1,
      validation: { min: 0, max: 100 },
    },
    {
      key: 'height_percentile',
      label: 'Percentil de Talla',
      type: 'number',
      colSpan: 1,
      validation: { min: 0, max: 100 },
    },
    {
      key: 'nutritional_status',
      label: 'Estado Nutricional',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'sobrepeso', label: 'Sobrepeso' },
        { value: 'obesidad', label: 'Obesidad' },
        { value: 'desnutricion_leve', label: 'Desnutrición Leve' },
        { value: 'desnutricion_moderada', label: 'Desnutrición Moderada' },
        { value: 'desnutricion_severa', label: 'Desnutrición Severa' },
      ],
    },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos de Medición',
      fields: [
        { key: 'measurement_date', label: 'Fecha', format: fmtDate },
        { key: 'age_months', label: 'Edad', format: (v) => `${v} meses` },
      ],
    },
    {
      title: 'Antropometría',
      fields: [
        { key: 'weight_kg', label: 'Peso', format: fmtKg },
        { key: 'height_cm', label: 'Talla', format: fmtCm },
        { key: 'head_circumference_cm', label: 'Perímetro Cefálico', format: fmtCm },
        { key: 'bmi', label: 'IMC', format: (v) => (v != null ? (v as number).toFixed(1) : '—') },
      ],
    },
    {
      title: 'Percentiles y Estado',
      fields: [
        { key: 'weight_percentile', label: 'Percentil de Peso', format: (v) => (v != null ? `P${v}` : '—') },
        { key: 'height_percentile', label: 'Percentil de Talla', format: (v) => (v != null ? `P${v}` : '—') },
        { key: 'nutritional_status', label: 'Estado Nutricional' },
      ],
    },
  ],

  labels: {
    singular: 'Medición de Crecimiento',
    plural: 'Mediciones de Crecimiento',
    create: 'Registrar Medición',
    edit: 'Editar Medición',
    delete: '¿Eliminar esta medición de crecimiento?',
    empty: 'No hay mediciones de crecimiento registradas',
  },
};

// ============================================
// 12. PEDIATRÍA — pediatrics_vaccines
// ============================================

const pediatricsVaccinesSchema: ModuleSchema = {
  name: 'Vacunación',
  slug: 'vacunacion',
  tableName: 'pediatrics_vaccines',
  specialtySlug: 'pediatria',
  icon: 'Syringe',
  description: 'Registro de vacunación y esquema de inmunización',

  columns: [
    { key: 'administration_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'vaccine_name', label: 'Vacuna', sortable: true },
    { key: 'vaccine_type', label: 'Tipo' },
    { key: 'dose_number', label: 'Dosis', type: 'number' },
    { key: 'batch_number', label: 'Lote' },
    { key: 'administration_site', label: 'Sitio' },
    { key: 'administered_by', label: 'Aplicada por' },
    {
      key: 'reactions',
      label: 'Reacciones',
      type: 'badge',
      badgeVariant: (v) => (v && (v as string).length > 0 ? 'destructive' : 'default'),
    },
    { key: 'next_dose_date', label: 'Próxima Dosis', type: 'date', format: (v) => fmtDate(v) },
  ],
  defaultSort: { key: 'administration_date', direction: 'desc' },

  formFields: [
    { key: 'administration_date', label: 'Fecha de Administración', type: 'date', required: true, colSpan: 1 },
    { key: 'vaccine_name', label: 'Nombre de Vacuna', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: Pentavalente, BCG, MR' },
    {
      key: 'vaccine_type',
      label: 'Tipo de Vacuna',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'inactivada', label: 'Inactivada' },
        { value: 'atenuada', label: 'Atenuada' },
        { value: 'toxoide', label: 'Toxoide' },
        { value: 'conjugada', label: 'Conjugada' },
        { value: 'recombinante', label: 'Recombinante' },
        { value: 'arnm', label: 'ARNm' },
        { value: 'viral_vector', label: 'Vector Viral' },
      ],
    },
    {
      key: 'dose_number',
      label: 'Número de Dosis',
      type: 'number',
      required: true,
      colSpan: 1,
      validation: { min: 1, max: 10 },
    },
    { key: 'batch_number', label: 'Número de Lote', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: AB1234' },
    {
      key: 'administration_site',
      label: 'Sitio de Administración',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'brazo_derecho', label: 'Brazo Derecho (Deltoides)' },
        { value: 'brazo_izquierdo', label: 'Brazo Izquierdo (Deltoides)' },
        { value: 'muslo_derecho', label: 'Muslo Derecho' },
        { value: 'muslo_izquierdo', label: 'Muslo Izquierdo' },
        { value: 'gluteo', label: 'Glúteo' },
        { value: 'oral', label: 'Oral' },
        { value: 'intranasal', label: 'Intranasal' },
      ],
    },
    { key: 'administered_by', label: 'Aplicada por', type: 'text', colSpan: 1, placeholder: 'Nombre del profesional que administró' },
    { key: 'reactions', label: 'Reacciones Adversas', type: 'textarea', colSpan: 2, placeholder: 'Reacciones adversas observadas (dejar vacío si ninguna)' },
    { key: 'next_dose_date', label: 'Fecha Próxima Dosis', type: 'date', colSpan: 1, helpText: 'Dejar vacío si no aplica' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos de la Vacuna',
      fields: [
        { key: 'administration_date', label: 'Fecha', format: fmtDate },
        { key: 'vaccine_name', label: 'Vacuna' },
        { key: 'vaccine_type', label: 'Tipo' },
        { key: 'dose_number', label: 'Dosis Nro.' },
      ],
    },
    {
      title: 'Administración',
      fields: [
        { key: 'batch_number', label: 'Lote' },
        { key: 'administration_site', label: 'Sitio de Administración' },
        { key: 'administered_by', label: 'Aplicada por' },
      ],
    },
    {
      title: 'Seguimiento',
      fields: [
        { key: 'reactions', label: 'Reacciones Adversas', colSpan: 2 },
        { key: 'next_dose_date', label: 'Próxima Dosis', format: fmtDate },
      ],
    },
  ],

  labels: {
    singular: 'Registro de Vacuna',
    plural: 'Registros de Vacunación',
    create: 'Registrar Vacuna',
    edit: 'Editar Registro',
    delete: '¿Eliminar este registro de vacunación?',
    empty: 'No hay registros de vacunación',
  },
};

// ============================================
// 13. ODONTOLOGÍA — dental_treatments
// ============================================

const dentalTreatmentsSchema: ModuleSchema = {
  name: 'Tratamientos Dentales',
  slug: 'tratamientos-dentales',
  tableName: 'dental_treatments',
  specialtySlug: 'odontologia',
  icon: 'Cross',
  description: 'Registro de tratamientos y procedimientos dentales',

  columns: [
    { key: 'treatment_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'treatment_type', label: 'Tratamiento', sortable: true },
    { key: 'tooth_number', label: 'Diente', sortable: true, type: 'number' },
    { key: 'surface', label: 'Superficie' },
    { key: 'material', label: 'Material' },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeVariant: statusBadge,
    },
    {
      key: 'cost',
      label: 'Costo',
      type: 'number',
      format: (v) => (v != null ? `$${(v as number).toFixed(2)}` : '—'),
    },
  ],
  defaultSort: { key: 'treatment_date', direction: 'desc' },

  formFields: [
    { key: 'treatment_date', label: 'Fecha del Tratamiento', type: 'date', required: true, colSpan: 1 },
    {
      key: 'treatment_type',
      label: 'Tipo de Tratamiento',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'restauracion', label: 'Restauración' },
        { value: 'endodoncia', label: 'Endodoncia' },
        { value: 'extraccion', label: 'Extracción' },
        { value: 'profilaxis', label: 'Profilaxis' },
        { value: 'corona', label: 'Corona' },
        { value: 'puente', label: 'Puente' },
        { value: 'implante', label: 'Implante' },
        { value: 'blanqueamiento', label: 'Blanqueamiento' },
        { value: 'ortodoncia', label: 'Ortodoncia' },
        { value: 'cirugia', label: 'Cirugía Oral' },
        { value: 'periodoncia', label: 'Periodoncia' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    {
      key: 'tooth_number',
      label: 'Número de Diente',
      type: 'number',
      colSpan: 1,
      validation: { min: 11, max: 85, message: 'Numeración FDI: 11-48 (permanentes), 51-85 (temporales)' },
      helpText: 'Numeración FDI (11-48 permanentes, 51-85 temporales)',
    },
    {
      key: 'surface',
      label: 'Superficie',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'mesial', label: 'Mesial (M)' },
        { value: 'distal', label: 'Distal (D)' },
        { value: 'oclusal', label: 'Oclusal (O)' },
        { value: 'vestibular', label: 'Vestibular (V)' },
        { value: 'lingual', label: 'Lingual/Palatino (L/P)' },
        { value: 'incisal', label: 'Incisal (I)' },
        { value: 'mo', label: 'Mesio-Oclusal (MO)' },
        { value: 'do', label: 'Disto-Oclusal (DO)' },
        { value: 'mod', label: 'Mesio-Ocluso-Distal (MOD)' },
        { value: 'completa', label: 'Completa' },
      ],
    },
    {
      key: 'material',
      label: 'Material',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'resina_compuesta', label: 'Resina Compuesta' },
        { value: 'amalgama', label: 'Amalgama' },
        { value: 'ceramica', label: 'Cerámica' },
        { value: 'zirconia', label: 'Zirconia' },
        { value: 'metal', label: 'Metal' },
        { value: 'iononomero', label: 'Ionómero de Vidrio' },
        { value: 'titanio', label: 'Titanio (Implante)' },
        { value: 'no_aplica', label: 'No Aplica' },
      ],
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'completado', label: 'Completado' },
        { value: 'en_progreso', label: 'En Progreso' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'cancelado', label: 'Cancelado' },
      ],
    },
    {
      key: 'cost',
      label: 'Costo ($)',
      type: 'number',
      colSpan: 1,
      validation: { min: 0 },
    },
    { key: 'notes', label: 'Notas', type: 'textarea', colSpan: 2, placeholder: 'Observaciones del tratamiento' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Tratamiento',
      fields: [
        { key: 'treatment_date', label: 'Fecha', format: fmtDate },
        { key: 'treatment_type', label: 'Tipo de Tratamiento' },
        { key: 'tooth_number', label: 'Diente' },
        { key: 'surface', label: 'Superficie' },
      ],
    },
    {
      title: 'Material y Estado',
      fields: [
        { key: 'material', label: 'Material' },
        { key: 'status', label: 'Estado' },
        { key: 'cost', label: 'Costo', format: (v) => (v != null ? `$${(v as number).toFixed(2)}` : '—') },
      ],
    },
    {
      title: 'Observaciones',
      fields: [{ key: 'notes', label: 'Notas', colSpan: 2 }],
    },
  ],

  labels: {
    singular: 'Tratamiento Dental',
    plural: 'Tratamientos Dentales',
    create: 'Registrar Tratamiento',
    edit: 'Editar Tratamiento',
    delete: '¿Eliminar este tratamiento dental?',
    empty: 'No hay tratamientos dentales registrados',
  },
};

// ============================================
// 14. ODONTOLOGÍA — dental_imaging
// ============================================

const dentalImagingSchema: ModuleSchema = {
  name: 'Imagenología Dental',
  slug: 'imagenologia-dental',
  tableName: 'dental_imaging',
  specialtySlug: 'odontologia',
  icon: 'ScanLine',
  description: 'Registro de imágenes diagnósticas dentales',

  columns: [
    { key: 'imaging_date', label: 'Fecha', sortable: true, type: 'date', format: (v) => fmtDate(v), width: '120px' },
    { key: 'imaging_type', label: 'Tipo de Imagen', sortable: true },
    { key: 'region', label: 'Región' },
    { key: 'technique', label: 'Técnica' },
    { key: 'findings', label: 'Hallazgos' },
    {
      key: 'file_url',
      label: 'Archivo',
      format: (v) => (v ? '📎 Ver imagen' : '—'),
    },
  ],
  defaultSort: { key: 'imaging_date', direction: 'desc' },

  formFields: [
    { key: 'imaging_date', label: 'Fecha del Estudio', type: 'date', required: true, colSpan: 1 },
    {
      key: 'imaging_type',
      label: 'Tipo de Imagen',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { value: 'periapical', label: 'Radiografía Periapical' },
        { value: 'panoramica', label: 'Radiografía Panorámica' },
        { value: 'bite_wing', label: 'Bite-Wing (Aleta de Mordida)' },
        { value: 'oclusal', label: 'Radiografía Oclusal' },
        { value: 'cefalometria', label: 'Cefalometría' },
        { value: 'cbct', label: 'CBCT (Tomografía Cone Beam)' },
        { value: 'fotografia_intraoral', label: 'Fotografía Intraoral' },
        { value: 'fotografia_extraoral', label: 'Fotografía Extraoral' },
        { value: 'otro', label: 'Otro' },
      ],
    },
    { key: 'region', label: 'Región', type: 'text', required: true, colSpan: 1, placeholder: 'Ej: Zona 1-3, Maxilar superior, Panorámica completa' },
    {
      key: 'technique',
      label: 'Técnica',
      type: 'select',
      colSpan: 1,
      options: [
        { value: 'digital', label: 'Digital' },
        { value: 'convencional', label: 'Convencional' },
        { value: 'sensor', label: 'Sensor Digital' },
        { value: 'fosforo', label: 'Placa de Fósforo' },
      ],
    },
    { key: 'findings', label: 'Hallazgos', type: 'textarea', required: true, colSpan: 2, placeholder: 'Descripción de hallazgos radiográficos o imagenológicos' },
    { key: 'file_url', label: 'URL del Archivo', type: 'text', colSpan: 2, placeholder: 'URL de la imagen almacenada' },
    { key: 'notes', label: 'Notas', type: 'textarea', colSpan: 2, placeholder: 'Observaciones adicionales' },
    { key: 'patient_id', label: 'Paciente', type: 'hidden', required: true, colSpan: 1 },
  ],

  detailSections: [
    {
      title: 'Datos del Estudio',
      fields: [
        { key: 'imaging_date', label: 'Fecha', format: fmtDate },
        { key: 'imaging_type', label: 'Tipo de Imagen' },
        { key: 'region', label: 'Región' },
        { key: 'technique', label: 'Técnica' },
      ],
    },
    {
      title: 'Resultados',
      fields: [
        { key: 'findings', label: 'Hallazgos', colSpan: 2 },
        { key: 'file_url', label: 'Archivo de Imagen', colSpan: 2 },
        { key: 'notes', label: 'Notas', colSpan: 2 },
      ],
    },
  ],

  labels: {
    singular: 'Imagen Dental',
    plural: 'Imágenes Dentales',
    create: 'Registrar Imagen',
    edit: 'Editar Imagen',
    delete: '¿Eliminar esta imagen dental?',
    empty: 'No hay imágenes dentales registradas',
  },
};

// ============================================
// ALL SCHEMAS — Aggregated collection
// ============================================

/** All module schemas across all specialties */
export const ALL_MODULE_SCHEMAS: ModuleSchema[] = [
  // Cardiología
  cardiologyEcgSchema,
  cardiologyProceduresSchema,
  // Neurología
  neurologyStudiesSchema,
  neurologyAssessmentsSchema,
  // Traumatología
  traumatologyInjuriesSchema,
  traumatologyRehabSchema,
  // Oftalmología
  ophthalmologyExamsSchema,
  ophthalmologyProceduresSchema,
  // Ginecología
  gynecologyControlsSchema,
  gynecologyObstetricSchema,
  // Pediatría
  pediatricsGrowthSchema,
  pediatricsVaccinesSchema,
  // Odontología
  dentalTreatmentsSchema,
  dentalImagingSchema,
];

// ============================================
// Lookup Helpers
// ============================================

/**
 * Get all module schemas for a given specialty slug.
 * @example getModuleSchemas('cardiologia') → [cardiologyEcgSchema, cardiologyProceduresSchema]
 */
export function getModuleSchemas(specialtySlug: string): ModuleSchema[] {
  return ALL_MODULE_SCHEMAS.filter((s) => s.specialtySlug === specialtySlug);
}

/**
 * Get a specific module schema by specialty and module slug.
 * @example getModuleSchema('cardiologia', 'ecg') → cardiologyEcgSchema
 */
export function getModuleSchema(
  specialtySlug: string,
  moduleSlug: string,
): ModuleSchema | undefined {
  return ALL_MODULE_SCHEMAS.find(
    (s) => s.specialtySlug === specialtySlug && s.slug === moduleSlug,
  );
}

// ============================================
// Named Exports — Individual schemas
// ============================================

export {
  // Cardiología
  cardiologyEcgSchema,
  cardiologyProceduresSchema,
  // Neurología
  neurologyStudiesSchema,
  neurologyAssessmentsSchema,
  // Traumatología
  traumatologyInjuriesSchema,
  traumatologyRehabSchema,
  // Oftalmología
  ophthalmologyExamsSchema,
  ophthalmologyProceduresSchema,
  // Ginecología
  gynecologyControlsSchema,
  gynecologyObstetricSchema,
  // Pediatría
  pediatricsGrowthSchema,
  pediatricsVaccinesSchema,
  // Odontología
  dentalTreatmentsSchema,
  dentalImagingSchema,
};
