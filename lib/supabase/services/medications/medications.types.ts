// Types for medications service
export type {
  MedicationCatalog,
  Prescription,
  PrescriptionMedication,
  MedicationReminder,
  MedicationIntakeLog,
  CreatePrescriptionData,
  CreateReminderData,
  AdherenceStats,
  ActiveMedicationsSummary,
} from "../../types/medications";

// Internal types for service
export interface MedicationServiceResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export interface IntakeScheduleData {
  reminder_id: string;
  paciente_id: string;
  fecha_programada: string;
  status: string;
}

export interface ProximaToma {
  medicamento: string;
  hora: string;
  minutos_restantes: number;
}

export interface MedicamentoActivo {
  nombre: string;
  dosis: string;
  frecuencia: string;
  proxima_toma: string;
}
