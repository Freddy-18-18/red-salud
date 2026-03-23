// TODO: Complete dental type definitions
// This is a stub to allow the app to compile.

export interface PerioSite {
  probing_depth?: number;
  recession?: number;
  bleeding_on_probing?: boolean;
  plaque?: boolean;
  suppuration?: boolean;
}

export interface PerioMeasurement {
  buccal?: PerioSite[];
  lingual?: PerioSite[];
  palatal?: PerioSite[];
}

export interface PerioToothData {
  tooth_number: number;
  measurements?: PerioMeasurement;
  probing_depths?: number[];
  recession?: number[];
  bleeding_on_probing?: boolean[];
  plaque?: boolean[];
  mobility?: number;
  furcation?: number;
  missing?: boolean;
  implant?: boolean;
}

export interface PerioExam {
  id: string;
  patient_id?: string;
  patientId?: string;
  doctor_id?: string;
  doctorId?: string;
  exam_date?: string;
  teeth?: Record<number, PerioToothData>;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
