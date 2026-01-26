export interface ConsultationData {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: Date;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status: "active" | "completed" | "cancelled";
}

export interface ActiveConsultation extends ConsultationData {
  patientName: string;
  patientAge: number;
  startTime: Date;
}

export interface ConsultationStats {
  waitingPatients: number;
  completedToday: number;
  averageTime: number;
  efficiencyRate: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  lastVisit: Date;
  condition?: string;
}

export interface TodayAppointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  type: string;
}
