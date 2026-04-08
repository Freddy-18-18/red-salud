import { fetchJson } from "@/lib/utils/fetch";

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
   * Get available dates for a doctor in a date range (next 30 days)
   */
  async getAvailableDates(
    doctorId: string,
    _startDate: string,
    _endDate: string
  ): Promise<AvailableDate[]> {
    return fetchJson<AvailableDate[]>(
      `/api/doctors/${doctorId}/availability`
    );
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
   * Create an appointment
   */
  async createAppointment(
    patientId: string,
    data: BookingCreateAppointmentData
  ): Promise<AppointmentResult> {
    return fetchJson<AppointmentResult>("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        ...data,
      }),
    });
  },
};
