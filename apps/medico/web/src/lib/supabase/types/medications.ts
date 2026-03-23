// TODO: Define complete medication types
// This is a stub to allow the app to compile.

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

export interface Prescription {
  id?: string;
  doctor_id?: string;
  patient_id?: string;
  fecha_prescripcion?: string;
  diagnostico?: string;
  medications?: PrescriptionMedication[];
  paciente?: {
    nombre_completo?: string;
    fecha_nacimiento?: string;
    genero?: string;
  };
  offline_patient?: {
    nombre_completo?: string;
    fecha_nacimiento?: string;
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
}
