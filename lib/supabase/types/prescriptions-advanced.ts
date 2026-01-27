/**
 * Tipos TypeScript para el Sistema de Recetas Médicas Avanzado
 * Incluye templates, firmas digitales, escaneos OCR e impresiones
 */

// ============================================================================
// PRESCRIPTION TEMPLATES
// ============================================================================

export type TemplateType = 'sistema' | 'personalizado' | 'escaneado';
export type TemplateCategory = 'general' | 'pediatria' | 'cardiologia' | 'medicina-interna' | 'otro';
export type Orientation = 'portrait' | 'landscape';

export interface PatientField {
  field: string;
  required: boolean;
  label: string;
}

export interface LayoutConfig {
  show_logo: boolean;
  show_header: boolean;
  show_medico_name: boolean;
  show_medico_specialty: boolean;
  show_medico_address: boolean;
  show_patient_details: boolean;
  show_patient_fields: string[];
  show_horario: boolean;
  show_firma: boolean;
  show_instrucciones: boolean;
  show_footer: boolean;
  orientation: Orientation;
}

export interface CustomStyles {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  font_size: number;
  line_height: number;
}

export interface HeaderConfig {
  logo_type: 'esculapio' | 'custom' | 'none';
  logo_url?: string | null;
  show_medico_data: boolean;
}

export interface FooterConfig {
  show_firma: boolean;
  show_horario: boolean;
  horario_texto?: string | null;
  show_instrucciones: boolean;
}

export interface PrescriptionTemplate {
  id: string;
  medico_id: string | null;
  nombre: string;
  descripcion?: string | null;
  tipo: TemplateType;
  categoria?: TemplateCategory;
  layout_config: LayoutConfig;
  custom_styles: CustomStyles;
  header_config: HeaderConfig;
  patient_fields: PatientField[];
  footer_config: FooterConfig;
  texto_encabezado?: string | null;
  texto_pie?: string | null;
  texto_instrucciones: string;
  es_predeterminado: boolean;
  activo: boolean;
  usos_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DOCTOR SIGNATURES
// ============================================================================

export type SignatureType = 'digital' | 'upload' | 'touch';

export interface DoctorSignature {
  id: string;
  medico_id: string;
  firma_url?: string | null;
  firma_type: SignatureType;
  firma_data?: string | null;
  es_firma_autografa: boolean;
  fecha_creacion: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRESCRIPTION SCANS
// ============================================================================

export type ScanType = 'scan' | 'photo' | 'upload';

export interface OCRData {
  patient_name?: string;
  medications?: string[];
  diagnosis?: string;
  raw_text?: string;
  confidence?: number;
}

export interface PrescriptionScan {
  id: string;
  medico_id: string;
  paciente_id?: string | null;
  imagen_url: string;
  imagen_type: ScanType;
  ocr_data?: OCRData | null;
  procesada: boolean;
  template_id?: string | null;
  prescription_id?: string | null;
  notas?: string | null;
  fecha_escaneo: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRESCRIPTION PRINTS
// ============================================================================

export type PrintFormat = 'pdf' | 'print';

export interface PrescriptionPrint {
  id: string;
  prescription_id: string;
  medico_id: string;
  template_id?: string | null;
  formato: PrintFormat;
  copias: number;
  ip_address?: string | null;
  user_agent?: string | null;
  fecha_impresion: string;
  created_at: string;
}

// ============================================================================
// PRESCRIPTION EXTENSIONS
// ============================================================================

export interface PrescriptionExtended {
  id: string;
  template_id?: string | null;
  custom_layout?: LayoutConfig | null;
  signature_id?: string | null;
  numero_receta?: string | null;
  paciente_data?: PatientDataSnapshot | null;
  medico_data?: MedicoDataSnapshot | null;
  medicamentos?: PrescriptionMedication[] | null;
  indicaciones?: string | null;
  diagnostico?: string | null;
  fecha_emision?: string | null;
  estado?: string | null;
  medico_id?: string | null;
  paciente_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PatientDataSnapshot {
  id: string;
  nombre_completo: string;
  cedula?: string;
  edad?: number;
  sexo?: string;
  peso?: number;
  email?: string;
  telefono?: string;
}

export interface MedicoDataSnapshot {
  id: string;
  nombre_completo: string;
  especialidad?: string;
  direccion?: string;
  telefono?: string;
  mpps?: string;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreatePrescriptionTemplateInput {
  nombre: string;
  descripcion?: string;
  categoria?: TemplateCategory;
  layout_config?: Partial<LayoutConfig>;
  custom_styles?: Partial<CustomStyles>;
  header_config?: Partial<HeaderConfig>;
  patient_fields?: PatientField[];
  footer_config?: Partial<FooterConfig>;
  texto_encabezado?: string;
  texto_pie?: string;
  texto_instrucciones?: string;
}

export interface UpdatePrescriptionTemplateInput {
  nombre?: string;
  descripcion?: string;
  categoria?: TemplateCategory;
  layout_config?: Partial<LayoutConfig>;
  custom_styles?: Partial<CustomStyles>;
  header_config?: Partial<HeaderConfig>;
  patient_fields?: PatientField[];
  footer_config?: Partial<FooterConfig>;
  texto_encabezado?: string;
  texto_pie?: string;
  texto_instrucciones?: string;
  activo?: boolean;
}

export interface CreatePrescriptionScanInput {
  paciente_id?: string;
  imagen_url: string;
  imagen_type: ScanType;
  ocr_data?: OCRData;
  notas?: string;
}

export interface CreateDoctorSignatureInput {
  firma_url?: string;
  firma_type: SignatureType;
  firma_data?: string;
  es_firma_autografa?: boolean;
}

export interface UpdateDoctorSignatureInput {
  firma_url?: string;
  firma_type?: SignatureType;
  firma_data?: string;
  es_firma_autografa?: boolean;
  activa?: boolean;
}

// ============================================================================
// PRINT TYPES
// ============================================================================

export interface PrescriptionPrintOptions {
  template_id?: string;
  formato?: PrintFormat;
  copias?: number;
  include_background?: boolean;
  high_quality?: boolean;
}

export interface PrintData {
  prescription: PrescriptionExtended;
  template?: PrescriptionTemplate;
  signature?: DoctorSignature;
  doctor: MedicoDataSnapshot;
  patient: PatientDataSnapshot;
  medications: PrescriptionMedication[];
  layout_config: LayoutConfig;
  custom_styles: CustomStyles;
}

export interface PrescriptionMedication {
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion_dias?: number;
  instrucciones_especiales?: string;
}

// ============================================================================
// PREVIEW TYPES
// ============================================================================

export interface TemplatePreview {
  template: PrescriptionTemplate;
  preview_url?: string;
  medico_nombre?: string;
  usos_count: number;
}

export interface PrescriptionPreviewData {
  paciente: PatientDataSnapshot;
  medico: MedicoDataSnapshot;
  medications: PrescriptionMedication[];
  diagnostico?: string;
  notas?: string;
  template?: PrescriptionTemplate;
  numero_receta?: string;
  fecha_emision: Date;
  fecha_vencimiento?: Date;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface TemplateFilters {
  tipo?: TemplateType;
  categoria?: TemplateCategory;
  activo?: boolean;
  search?: string;
  medico_id?: string;
}

export interface PrescriptionScanFilters {
  procesada?: boolean;
  paciente_id?: string;
  search?: string;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

export interface PrescriptionPrintFilters {
  template_id?: string;
  formato?: PrintFormat;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
  message?: string;
}

export interface TemplateListResponse {
  templates: PrescriptionTemplate[];
  total: number;
  page: number;
  per_page: number;
}

export interface PrescriptionDetailResponse {
  prescription: PrescriptionExtended;
  template?: PrescriptionTemplate;
  signature?: DoctorSignature;
  scan?: PrescriptionScan;
  medications: PrescriptionMedication[];
  patient: PatientDataSnapshot;
  doctor: MedicoDataSnapshot;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PrescriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PrescriptionError';
  }
}

export enum PrescriptionErrorCode {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  INVALID_TEMPLATE_CONFIG = 'INVALID_TEMPLATE_CONFIG',
  SIGNATURE_NOT_FOUND = 'SIGNATURE_NOT_FOUND',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SCAN_NOT_FOUND = 'SCAN_NOT_FOUND',
  OCR_PROCESSING_FAILED = 'OCR_PROCESSING_FAILED',
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  PRINT_FAILED = 'PRINT_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;

