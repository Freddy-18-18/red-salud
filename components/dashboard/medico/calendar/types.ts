export interface CalendarAppointment {
  id: string;
  paciente_id: string | null; // Puede ser null si es un paciente offline
  offline_patient_id?: string | null; // ID del paciente offline si aplica
  paciente_nombre: string;
  paciente_telefono: string | null;
  paciente_email: string | null;
  paciente_avatar: string | null;
  fecha_hora: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  motivo: string;
  status: "pendiente" | "confirmada" | "en_espera" | "en_consulta" | "completada" | "no_asistio" | "cancelada" | "rechazada";
  tipo_cita: "presencial" | "telemedicina" | "urgencia" | "seguimiento" | "primera_vez";
  color: string;
  notas_internas: string | null;
  // Nuevos campos de timestamps
  confirmed_at?: string | null;
  patient_arrived_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  medical_record_id?: string | null;
}

export interface TimeBlock {
  id: string;
  doctor_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  tipo: "bloqueo" | "almuerzo" | "reunion" | "vacaciones" | "emergencia";
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  dia_semana: number; // 0=Domingo, 6=Sábado
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export const APPOINTMENT_COLORS = {
  presencial: "#3B82F6", // blue-500
  telemedicina: "#10B981", // green-500
  urgencia: "#EF4444", // red-500
  seguimiento: "#8B5CF6", // purple-500
  primera_vez: "#F59E0B", // amber-500
};

export const APPOINTMENT_STATUS_LABELS = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_espera: "En Espera",
  en_consulta: "En Consulta",
  completada: "Completada",
  no_asistio: "No Asistió",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

export const APPOINTMENT_TYPE_LABELS = {
  presencial: "Presencial",
  telemedicina: "Telemedicina",
  urgencia: "Urgencia",
  seguimiento: "Seguimiento",
  primera_vez: "Primera Vez",
};
