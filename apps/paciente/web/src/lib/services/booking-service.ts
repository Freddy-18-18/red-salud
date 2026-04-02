import { supabase } from "@/lib/supabase/client";

// --- Types ---

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface DoctorProfile {
  id: string;
  profile_id: string;
  specialty_id: string;
  consultation_fee: number | null;
  accepts_insurance: boolean;
  years_experience: number | null;
  biografia: string | null;
  verified: boolean;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  specialty: {
    id: string;
    name: string;
  };
  avg_rating: number | null;
  review_count: number;
  next_available: string | null;
}

export interface DoctorFilters {
  city?: string;
  accepts_insurance?: boolean;
  gender?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating";
}

export interface AvailableDate {
  date: string; // ISO date YYYY-MM-DD
  dayOfWeek: number;
  hasSlots: boolean;
}

export interface TimeSlotGroup {
  label: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  available: boolean;
}

export interface CreateAppointmentData {
  doctor_id: string;
  scheduled_at: string; // ISO datetime
  duration_minutes: number;
  reason: string;
  notes?: string;
  appointment_type: "presencial" | "telemedicina";
}

export interface AppointmentResult {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes: string | null;
  status: string;
  appointment_type: string;
}

// --- Service ---

export const bookingService = {
  /**
   * Get all specialties, optionally only those with active verified doctors
   */
  async getSpecialties(
    _onlyWithDoctors: boolean = false
  ): Promise<Specialty[]> {
    // Always fetch all specialties — filter by doctor availability at the doctor step
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get doctors by specialty with optional filters
   */
  async getDoctorsBySpecialty(
    specialtyId: string,
    filters?: DoctorFilters
  ): Promise<DoctorProfile[]> {
    // Main doctor query
    const { data, error } = await supabase
      .from("doctor_details")
      .select(
        `
        *,
        specialty:specialties(id, name),
        profile:profiles!inner(id, full_name, email, avatar_url, city, state)
      `
      )
      .eq("specialty_id", specialtyId)
      .eq("verified", true);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get ratings for these doctors
    const doctorProfileIds = data.map(
      (d: { profile_id: string }) => d.profile_id
    );
    const { data: reviews } = await supabase
      .from("doctor_reviews")
      .select("doctor_id, rating")
      .in("doctor_id", doctorProfileIds);

    // Calculate avg ratings per doctor
    const ratingMap = new Map<
      string,
      { sum: number; count: number }
    >();
    (reviews || []).forEach(
      (r: { doctor_id: string; rating: number }) => {
        const existing = ratingMap.get(r.doctor_id) || {
          sum: 0,
          count: 0,
        };
        existing.sum += r.rating;
        existing.count += 1;
        ratingMap.set(r.doctor_id, existing);
      }
    );

    // Map to DoctorProfile type
    let doctors: DoctorProfile[] = data.map(
      (d: Record<string, unknown>) => {
        const profileData = d.profile as {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          city: string | null;
          state: string | null;
        };
        const ratingInfo = ratingMap.get(profileData.id);
        return {
          id: d.id as string,
          profile_id: d.profile_id as string,
          specialty_id: d.specialty_id as string,
          consultation_fee: d.consultation_fee
            ? parseFloat(d.consultation_fee as string)
            : null,
          accepts_insurance: (d.accepts_insurance as boolean) || false,
          years_experience: (d.years_experience as number) || null,
          biografia: (d.biografia as string) || null,
          verified: true,
          profile: profileData,
          specialty: d.specialty as { id: string; name: string },
          avg_rating: ratingInfo
            ? Math.round((ratingInfo.sum / ratingInfo.count) * 10) / 10
            : null,
          review_count: ratingInfo?.count || 0,
          next_available: null,
        };
      }
    );

    // Apply filters
    if (filters?.city) {
      doctors = doctors.filter(
        (d) =>
          d.profile.city
            ?.toLowerCase()
            .includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.accepts_insurance) {
      doctors = doctors.filter((d) => d.accepts_insurance);
    }

    // Sort
    switch (filters?.sortBy) {
      case "price_asc":
        doctors.sort(
          (a, b) =>
            (a.consultation_fee ?? Infinity) - (b.consultation_fee ?? Infinity)
        );
        break;
      case "price_desc":
        doctors.sort(
          (a, b) =>
            (b.consultation_fee ?? 0) - (a.consultation_fee ?? 0)
        );
        break;
      case "rating":
        doctors.sort(
          (a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
        );
        break;
      default:
        // Relevance: verified + rating weighted
        doctors.sort(
          (a, b) =>
            (b.avg_rating ?? 0) * (b.review_count || 1) -
            (a.avg_rating ?? 0) * (a.review_count || 1)
        );
    }

    return doctors;
  },

  /**
   * Get available dates for a doctor in a date range (next 30 days)
   */
  async getAvailableDates(
    doctorId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailableDate[]> {
    // Get doctor schedule template (which days of week they work)
    const { data: schedules, error: schedError } = await supabase
      .from("doctor_availability")
      .select("dia_semana, hora_inicio, hora_fin, activo")
      .eq("doctor_id", doctorId)
      .eq("activo", true);

    if (schedError) throw schedError;
    if (!schedules || schedules.length === 0) return [];

    const activeDays = new Set(
      schedules.map(
        (s: { dia_semana: number }) => s.dia_semana
      )
    );

    // Get existing appointments count per date in range
    const { data: appointments } = await supabase
      .from("appointments")
      .select("scheduled_at, duration_minutes, status")
      .eq("doctor_id", doctorId)
      .gte("scheduled_at", `${startDate}T00:00:00`)
      .lte("scheduled_at", `${endDate}T23:59:59`)
      .not("status", "in", '("cancelada","rechazada")');

    // Count booked slots per date
    const bookedPerDate = new Map<string, number>();
    (appointments || []).forEach(
      (a: { scheduled_at: string }) => {
        const date = a.scheduled_at.split("T")[0];
        bookedPerDate.set(date, (bookedPerDate.get(date) || 0) + 1);
      }
    );

    // Generate available dates
    const dates: AvailableDate[] = [];
    const current = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= end) {
      if (current >= today) {
        const dayOfWeek = current.getDay();
        const dateStr = current.toISOString().split("T")[0];
        const isWorkDay = activeDays.has(dayOfWeek);

        // Rough estimate: if doctor works 8h in 30min slots = ~16 slots max
        const bookedCount = bookedPerDate.get(dateStr) || 0;
        const hasSlots = isWorkDay && bookedCount < 16;

        dates.push({
          date: dateStr,
          dayOfWeek,
          hasSlots,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  },

  /**
   * Get available time slots for a specific doctor on a specific date
   */
  async getAvailableSlots(
    doctorId: string,
    date: string
  ): Promise<TimeSlotGroup[]> {
    const dayOfWeek = new Date(date + "T12:00:00").getDay();

    // Get doctor availability for this day of week
    const { data: availability, error: availError } = await supabase
      .from("doctor_availability")
      .select("hora_inicio, hora_fin")
      .eq("doctor_id", doctorId)
      .eq("dia_semana", dayOfWeek)
      .eq("activo", true);

    if (availError) throw availError;
    if (!availability || availability.length === 0) return [];

    // Get existing appointments for this date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59.999`;

    const { data: appointments } = await supabase
      .from("appointments")
      .select("scheduled_at, duration_minutes, status")
      .eq("doctor_id", doctorId)
      .gte("scheduled_at", startOfDay)
      .lte("scheduled_at", endOfDay)
      .not("status", "in", '("cancelada","rechazada")');

    const slotDuration = 30; // Default 30 min slots

    // Parse booked intervals
    const bookedIntervals = (appointments || []).map(
      (apt: {
        scheduled_at: string;
        duration_minutes: number;
      }) => {
        const d = new Date(apt.scheduled_at);
        const start = d.getHours() * 60 + d.getMinutes();
        return {
          start,
          end: start + (apt.duration_minutes || slotDuration),
        };
      }
    );

    const hasConflict = (start: number, end: number) =>
      bookedIntervals.some(
        (interval: { start: number; end: number }) =>
          interval.start < end && interval.end > start
      );

    // Check if date is today — filter past times
    const now = new Date();
    const isToday = date === now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Generate all slots
    const allSlots: TimeSlot[] = [];

    availability.forEach(
      (slot: { hora_inicio: string; hora_fin: string }) => {
        const [startH = 0, startM = 0] = slot.hora_inicio
          .split(":")
          .map(Number);
        const [endH = 0, endM = 0] = slot.hora_fin
          .split(":")
          .map(Number);
        let cursor = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (cursor + slotDuration <= endMinutes) {
          // Skip past times if today
          if (isToday && cursor <= currentMinutes) {
            cursor += slotDuration;
            continue;
          }

          const startStr = `${Math.floor(cursor / 60)
            .toString()
            .padStart(2, "0")}:${(cursor % 60)
            .toString()
            .padStart(2, "0")}`;
          const endStr = `${Math.floor((cursor + slotDuration) / 60)
            .toString()
            .padStart(2, "0")}:${((cursor + slotDuration) % 60)
            .toString()
            .padStart(2, "0")}`;

          allSlots.push({
            start: startStr,
            end: endStr,
            available: !hasConflict(cursor, cursor + slotDuration),
          });

          cursor += slotDuration;
        }
      }
    );

    // Group by morning/afternoon/evening
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    allSlots.forEach((slot) => {
      const hour = parseInt(slot.start.split(":")[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    const groups: TimeSlotGroup[] = [];
    if (morning.length > 0)
      groups.push({ label: "Manana", slots: morning });
    if (afternoon.length > 0)
      groups.push({ label: "Tarde", slots: afternoon });
    if (evening.length > 0)
      groups.push({ label: "Noche", slots: evening });

    return groups;
  },

  /**
   * Create an appointment
   */
  async createAppointment(
    patientId: string,
    data: CreateAppointmentData
  ): Promise<AppointmentResult> {
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientId,
        doctor_id: data.doctor_id,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        reason: data.reason,
        notes: data.notes || null,
        status: "pendiente",
        tipo_cita: data.appointment_type,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "appointment_created",
      description: `Cita agendada para ${data.scheduled_at}`,
      status: "success",
    });

    return {
      id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      scheduled_at: appointment.scheduled_at,
      duration_minutes: appointment.duration_minutes,
      reason: appointment.reason,
      notes: appointment.notes,
      status: appointment.status,
      appointment_type: appointment.tipo_cita,
    };
  },
};
