// TODO: Move to @red-salud/types when the shared package supports these types
// Local type definitions for prescription-related entities

export interface ServiceResponse<T> {
  success: boolean;
  data?: T | null;
  error?: unknown;
}

export interface PrescriptionTemplate {
  id: string;
  medico_id: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  categoria?: string;
  contenido?: Record<string, unknown>;
  layout_config?: LayoutConfig;
  custom_styles?: Record<string, unknown>;
  header_config?: Record<string, unknown>;
  patient_fields?: string[];
  footer_config?: Record<string, unknown>;
  texto_encabezado?: string;
  texto_pie?: string;
  texto_instrucciones?: string;
  is_default?: boolean;
  es_predeterminado?: boolean;
  activo?: boolean;
  usos_count?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreatePrescriptionTemplateInput {
  medico_id?: string;
  nombre: string;
  descripcion?: string;
  contenido?: Record<string, unknown>;
  layout_config?: LayoutConfig;
  is_default?: boolean;
  categoria?: string;
  custom_styles?: Record<string, unknown>;
  header_config?: Record<string, unknown>;
  patient_fields?: string[];
  footer_config?: Record<string, unknown>;
  texto_encabezado?: string;
  texto_pie?: string;
  texto_instrucciones?: string;
}

export interface UpdatePrescriptionTemplateInput {
  nombre?: string;
  descripcion?: string;
  contenido?: Record<string, unknown>;
  layout_config?: LayoutConfig;
  is_default?: boolean;
  activo?: boolean;
  categoria?: string;
  custom_styles?: Record<string, unknown>;
  header_config?: Record<string, unknown>;
  patient_fields?: string[];
  footer_config?: Record<string, unknown>;
  texto_encabezado?: string;
  texto_pie?: string;
  texto_instrucciones?: string;
}

export interface DoctorSignature {
  id: string;
  medico_id: string;
  firma_url?: string;
  firma_tipo?: string;
  activa: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  [key: string]: unknown;
}

export interface CreateDoctorSignatureInput {
  medico_id?: string;
  firma_url?: string;
  firma_tipo?: string;
  firma_type?: string;
  activa?: boolean;
  [key: string]: unknown;
}

export interface UpdateDoctorSignatureInput {
  firma_url?: string;
  firma_tipo?: string;
  activa?: boolean;
  [key: string]: unknown;
}

export interface PrescriptionScan {
  id: string;
  medico_id: string;
  prescription_id?: string;
  imagen_url: string;
  ocr_data?: OCRData;
  estado?: string;
  fecha_creacion?: string;
  [key: string]: unknown;
}

export interface CreatePrescriptionScanInput {
  medico_id?: string;
  prescription_id?: string;
  imagen_url?: string;
  ocr_data?: OCRData;
  [key: string]: unknown;
}

export interface PrescriptionPrint {
  id: string;
  prescription_id: string;
  template_id?: string;
  pdf_url?: string;
  fecha_impresion?: string;
  [key: string]: unknown;
}

export interface OCRData {
  text?: string;
  confidence?: number;
  medications?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface LayoutConfig {
  template_id?: string;
  margins?: { top: number; right: number; bottom: number; left: number };
  font_size?: number;
  [key: string]: unknown;
}

export interface PrescriptionMedication {
  id?: string;
  prescription_id?: string;
  nombre_medicamento?: string;
  medication?: {
    nombre_comercial?: string;
    forma_farmaceutica?: string;
    concentracion?: string;
  };
  frecuencia: string;
  duracion_dias?: number;
  instrucciones_especiales?: string;
}

export interface PatientDataSnapshot {
  id?: string;
  nombre_completo?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  genero?: string;
  [key: string]: unknown;
}

export interface MedicoDataSnapshot {
  id?: string;
  nombre_completo?: string;
  cedula_profesional?: string;
  especialidad?: string;
  [key: string]: unknown;
}

export interface PrescriptionExtended {
  id: string;
  medico_id: string;
  paciente_id?: string;
  template_id?: string;
  medications?: PrescriptionMedication[];
  paciente?: PatientDataSnapshot;
  medico?: MedicoDataSnapshot;
  diagnostico?: string;
  notas?: string;
  status?: string;
  fecha_prescripcion?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface PrescriptionDetailResponse {
  prescription: PrescriptionExtended;
  template?: PrescriptionTemplate;
  signature?: DoctorSignature;
  [key: string]: unknown;
}

export interface TemplateFilters {
  medico_id?: string;
  activo?: boolean;
  is_default?: boolean;
  [key: string]: unknown;
}

export interface PrescriptionScanFilters {
  medico_id?: string;
  prescription_id?: string;
  estado?: string;
  [key: string]: unknown;
}

export interface PrescriptionPrintFilters {
  prescription_id?: string;
  medico_id?: string;
  formato?: string;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  [key: string]: unknown;
}
