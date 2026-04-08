import type { ApiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '../types';
import type { Appointment, AppointmentStatus } from '@red-salud/contracts';

// ── Request/Response interfaces ──────────────────────────────────────

export interface AppointmentFilters {
  status?: AppointmentStatus;
  medico_id?: string;
  paciente_id?: string;
  from?: string;
  to?: string;
  tipo_cita?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateAppointmentData {
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_cita: string;
  motivo?: string;
  notas_internas?: string;
  price?: number;
  metodo_pago?: string;
  meeting_url?: string;
  office_id?: string;
  enviar_recordatorio?: boolean;
}

export interface UpdateAppointmentData {
  fecha_hora?: string;
  duracion_minutos?: number;
  tipo_cita?: string;
  motivo?: string;
  notas_internas?: string;
  status?: AppointmentStatus;
  price?: number;
  metodo_pago?: string;
  meeting_url?: string;
  office_id?: string;
}

export interface CancelAppointmentData {
  motivo?: string;
}

export interface RescheduleAppointmentData {
  fecha_hora: string;
  motivo?: string;
}

export interface ScheduleFilters {
  from?: string;
  to?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// ── Helper: convert typed filters to Record<string, string> ──────────

function toParams(obj?: Record<string, unknown>): Record<string, string> | undefined {
  if (!obj) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

// ── Domain client ────────────────────────────────────────────────────

export class AppointmentsApi {
  constructor(private client: ApiClient) {}

  /** List appointments with optional filters */
  getAppointments(params?: AppointmentFilters) {
    return this.client.get<PaginatedResponse<Appointment>>(
      '/appointments',
      toParams(params as Record<string, unknown>),
    );
  }

  /** Create a new appointment */
  createAppointment(data: CreateAppointmentData) {
    return this.client.post<ApiResponse<Appointment>>('/appointments', data);
  }

  /** Update an existing appointment */
  updateAppointment(id: string, data: UpdateAppointmentData) {
    return this.client.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
  }

  /** Cancel an appointment with optional reason */
  cancelAppointment(id: string, data?: CancelAppointmentData) {
    return this.client.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/cancel`,
      data,
    );
  }

  /** Confirm a pending appointment */
  confirmAppointment(id: string) {
    return this.client.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/confirm`,
    );
  }

  /** Reschedule an appointment to a new date/time */
  rescheduleAppointment(id: string, data: RescheduleAppointmentData) {
    return this.client.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/reschedule`,
      data,
    );
  }

  /** Get appointments for a specific patient */
  getPatientAppointments(
    patientId: string,
    params?: { status?: AppointmentStatus; from?: string; to?: string },
  ) {
    return this.client.get<PaginatedResponse<Appointment>>(
      `/appointments/patients/${patientId}`,
      toParams(params as Record<string, unknown>),
    );
  }

  /** Get a doctor's schedule (existing appointments) for a date range */
  getDoctorSchedule(doctorId: string, params?: ScheduleFilters) {
    return this.client.get<ApiResponse<Appointment[]>>(
      `/appointments/doctors/${doctorId}/schedule`,
      toParams(params as Record<string, unknown>),
    );
  }

  /** Get available time slots for a doctor on a specific date */
  getAvailableSlots(doctorId: string, date: string) {
    return this.client.get<ApiResponse<TimeSlot[]>>(
      `/appointments/doctors/${doctorId}/slots`,
      { date },
    );
  }
}
