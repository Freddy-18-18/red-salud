import { fetchJson, postJson } from "@/lib/utils/fetch";

import type {
  Specialty,
  BookingDoctorProfile,
  DoctorFilters,
  AvailableDate,
  TimeSlotGroup,
  BookingCreateAppointmentData,
  AppointmentResult,
} from "@/lib/services/appointments/appointments.types";

// Re-export types so existing consumers don't break
export type {
  Specialty,
  DoctorFilters,
  AvailableDate,
  TimeSlotGroup,
  AppointmentResult,
} from "@/lib/services/appointments/appointments.types";

export type { BookingDoctorProfile as DoctorProfile } from "@/lib/services/appointments/appointments.types";
export type { BookingTimeSlot as TimeSlot } from "@/lib/services/appointments/appointments.types";
export type { BookingCreateAppointmentData as CreateAppointmentData } from "@/lib/services/appointments/appointments.types";

// --- Service ---

export const bookingService = {
  /**
   * Get all specialties, optionally only those with active verified doctors
   */
  async getSpecialties(
    onlyWithDoctors: boolean = false
  ): Promise<Specialty[]> {
    const params = new URLSearchParams();
    if (onlyWithDoctors) params.set("with_doctors", "true");

    return fetchJson<Specialty[]>(
      `/api/specialties?${params}`
    );
  },

  /**
   * Get doctors by specialty with optional filters
   */
  async getDoctorsBySpecialty(
    specialtyId: string,
    filters?: DoctorFilters
  ): Promise<BookingDoctorProfile[]> {
    const params = new URLSearchParams();
    params.set("specialty_id", specialtyId);

    if (filters?.city) params.set("city", filters.city);
    if (filters?.accepts_insurance) params.set("accepts_insurance", "true");
    if (filters?.gender) params.set("gender", filters.gender);
    if (filters?.sortBy) params.set("sort_by", filters.sortBy);

    return fetchJson<BookingDoctorProfile[]>(
      `/api/doctors/search?${params}`
    );
  },

  /**
   * Get available dates for a doctor in a date range (next 30 days).
   *
   * The BFF returns `{ available_dates: string[], day_counts: { date,
   * available_count }[] }`, not the `AvailableDate[]` the booking flow
   * consumes. Map here so the calendar picker can keep filtering/iterating
   * an array — without this mapping, `availableDates.filter is not a
   * function` blows up the calendar step on first render.
   */
  async getAvailableDates(
    doctorId: string,
    _startDate: string,
    _endDate: string
  ): Promise<AvailableDate[]> {
    const res = await fetchJson<{
      available_dates?: string[];
      day_counts?: { date: string; available_count: number }[];
    }>(`/api/doctors/${doctorId}/availability`);

    // Some payload shapes already arrive as an array (legacy or test fixtures);
    // accept that too so we don't double-blow up here.
    if (Array.isArray(res)) return res as AvailableDate[];

    const rows = res.day_counts ?? [];
    return rows.map((r) => {
      const d = new Date(`${r.date}T00:00:00`);
      return {
        date: r.date,
        dayOfWeek: d.getDay(),
        hasSlots: r.available_count > 0,
      };
    });
  },

  /**
   * Get available time slots for a specific doctor on a specific date
   */
  async getAvailableSlots(
    doctorId: string,
    date: string
  ): Promise<TimeSlotGroup[]> {
    const params = new URLSearchParams();
    params.set("date", date);

    return fetchJson<TimeSlotGroup[]>(
      `/api/doctors/${doctorId}/availability?${params}`
    );
  },

  /**
   * Create an appointment via the BFF route. The route resolves patient_id
   * from the authenticated session and calls book_appointment_atomic on the
   * database, so checks + insert + double-book guard happen in one txn.
   * The Rust gateway PoC is intentionally bypassed for now.
   */
  async createAppointment(
    _patientId: string,
    data: BookingCreateAppointmentData
  ): Promise<AppointmentResult> {
    const a = await postJson<{
      id: string;
      patient_id: string | null;
      doctor_id: string;
      scheduled_at: string;
      duration_minutes: number;
      reason: string;
      notes: string | null;
      status: string;
      appointment_type: string | null;
    }>("/api/appointments", {
      doctor_id: data.doctor_id,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      reason: data.reason,
      notes: data.notes,
      appointment_type: data.appointment_type,
    });

    return {
      id: a.id,
      patient_id: a.patient_id ?? "",
      doctor_id: a.doctor_id,
      scheduled_at: a.scheduled_at,
      duration_minutes: a.duration_minutes,
      reason: a.reason,
      notes: a.notes,
      status: a.status,
      appointment_type: a.appointment_type ?? "in_person",
    };
  },
};
