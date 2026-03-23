// TODO: Define complete advanced prescription types
// This is a stub to allow the app to compile.

export interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export interface DoctorSignature {
  id: string;
  medico_id: string;
  firma_url?: string;
  firma_tipo?: string;
  activa: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateDoctorSignatureInput {
  medico_id: string;
  firma_url: string;
  firma_tipo?: string;
  activa?: boolean;
}

export interface UpdateDoctorSignatureInput {
  firma_url?: string;
  firma_tipo?: string;
  activa?: boolean;
}
