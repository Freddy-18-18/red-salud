/**
 * @file professional-types.ts
 * @description Tipos TypeScript para información profesional del médico
 */

/**
 * Certificación profesional con soporte para archivos
 */
export interface Certification {
  id: string;
  name: string;
  institution: string;
  year: number;
  file_url?: string;
  file_name?: string;
  verified_by_sacs: boolean;
  created_at?: string;
}

/**
 * Experiencia laboral del médico
 */
export interface WorkExperience {
  id: string;
  institution: string;
  position: string;
  from_year: number;
  to_year?: number | null;
  current: boolean;
  description?: string;
  location?: string;
}

/**
 * Premio o reconocimiento médico
 */
export interface Award {
  id: string;
  name: string;
  institution: string;
  year: number;
  description?: string;
}

/**
 * Seguro médico aceptado
 */
export interface MedicalInsurance {
  id: string;
  name: string;
  plans: string[];
  copay_info?: string;
}

/**
 * Publicación científica
 */
export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  authors?: string;
}

/**
 * Asociación médica o científica
 */
export interface MedicalAssociation {
  id: string;
  name: string;
  member_id?: string;
  since_year: number;
  active: boolean;
}

/**
 * Datos completos del perfil profesional
 */
export interface ProfessionalData {
  // Formación Académica
  universidad: string;
  numero_colegio: string;
  matricula: string;
  anio_graduacion: number | null;
  anios_experiencia: number;

  // Certificaciones y Logros
  certificaciones: Certification[];
  subespecialidades: string;
  premios: Award[];
  publicaciones?: Publication[];
  asociaciones?: MedicalAssociation[];

  // Áreas de Atención
  condiciones_tratadas: string[];
  idiomas: string[];
  grupos_edad?: string[]; // 'niños', 'adolescentes', 'adultos', 'adultos mayores'

  // Experiencia Profesional
  experiencia_laboral: WorkExperience[];

  // Seguros y Facturación
  seguros_aceptados: MedicalInsurance[];

  // Presencia Digital
  redes_sociales: Record<string, string>;
  website?: string;
}

/**
 * Estado del formulario de edición
 */
export interface ProfessionalFormState {
  isEditing: boolean;
  isSaving: boolean;
  activeTab: string;
  hasUnsavedChanges: boolean;
}

/**
 * Props compartidos para tabs
 */
export interface TabComponentProps {
  data: ProfessionalData;
  isEditing: boolean;
  onUpdate: (updates: Partial<ProfessionalData>) => void;
}

/**
 * Resultado de carga de datos desde SACS
 */
export interface SacsDataResult {
  success: boolean;
  data?: {
    certificaciones: Certification[];
    matricula: string;
    universidad?: string;
  };
  error?: string;
}

/**
 * Configuración de upload de archivos
 */
export interface FileUploadConfig {
  bucket: string;
  path: string;
  maxSizeMB: number;
  allowedTypes: string[];
}
