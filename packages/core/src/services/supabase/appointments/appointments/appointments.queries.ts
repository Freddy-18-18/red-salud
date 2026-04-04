import { supabase } from "../../client";
import type {
  MedicalSpecialty,
  DoctorProfile,
  DoctorSchedule,
  TimeSlot,
  Appointment,
} from "./appointments.types";
// TODO: Import tauriApiService from runtime layer when available
declare const tauriApiService: any;

interface AvailabilityRow {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string | number;
  end_time: string | number;
  is_active: boolean;
  created_at: string;
}

interface AppointmentIntervalRow {
  id: string;
  scheduled_at: string;
  duration_minutes?: number;
}

interface TimeBlockRow {
  start_date: string;
  end_date: string;
}

interface DoctorAppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
  } | null;
}


interface PublicApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function fetchPublicData<T>(
  path: string,
  params?: Record<string, string | undefined>,
  options: { includeCredentials?: boolean } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const queryString = params
    ? Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&")
    : "";

  const url = `${baseUrl}${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    cache: "no-store",
    credentials: options.includeCredentials ? "include" : "same-origin",
  });
  const payload = (await response.json()) as PublicApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || `Request to ${path} failed`);
  }

  return payload.data;
}

// Get all specialties (with option to filter only those with doctors)
export async function getMedicalSpecialties(onlyWithDoctors: boolean = false) {
  try {
    const data = await fetchPublicData<MedicalSpecialty[]>("/api/public/doctor-specialties", {
      onlyWithDoctors: onlyWithDoctors ? "true" : undefined,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}

// Get available doctors (with optional filters)
export async function getAvailableDoctors(specialtyId?: string) {
  try {
    const doctors = await fetchPublicData<DoctorProfile[]>("/api/public/doctors", {
      specialtyId,
    });

    return { success: true, data: doctors };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error, data: [] };
  }
}

// Get a specific doctor's profile
export async function getDoctorProfile(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_profiles")
      .select(`
        *,
        specialty:specialties(id, name, description, icon),
        profile:profiles!inner(id, full_name, email, avatar_url)
      `)
      .eq("id", doctorId)
      .single();

    if (error) throw error;

    const doctor = {
      id: data.id,
      specialty_id: data.specialty_id,
      license_number: data.license_number,
      years_experience: data.years_experience,
      bio: data.bio,
      consultation_price: data.consultation_price ? parseFloat(data.consultation_price) : undefined,
      consultation_duration: 30,
      is_verified: data.is_verified,
      created_at: data.created_at,
      updated_at: data.updated_at,
      profile: {
        id: data.profile?.id,
        full_name: data.profile?.full_name,
        email: data.profile?.email,
        avatar_url: data.profile?.avatar_url,
      },
      specialty: data.specialty,
    };

    return { success: true, data: doctor as DoctorProfile };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return { success: false, error, data: null };
  }
}

// Get doctor schedules
export async function getDoctorSchedules(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("id, day_of_week, start_time, end_time, is_active, doctor_id, created_at")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)
      .order("day_of_week", { ascending: true });

    if (error) throw error;

    const availabilityRows = (data || []) as AvailabilityRow[];
    const schedules: DoctorSchedule[] = availabilityRows.map((slot) => ({
      id: slot.id,
      doctor_id: slot.doctor_id,
      day_of_week: slot.day_of_week,
      start_time:
        typeof slot.start_time === "string"
          ? slot.start_time
          : `${slot.start_time}:00`,
      end_time:
        typeof slot.end_time === "string"
          ? slot.end_time
          : `${slot.end_time}:00`,
      is_active: slot.is_active,
      created_at: slot.created_at,
    }));

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return { success: false, error, data: [] };
  }
}

// Get available time slots for a doctor on a specific date
export async function getAvailableTimeSlots(
  doctorId: string,
  date: string
): Promise<{ success: boolean; data: TimeSlot[]; error?: unknown }> {
  try {
    const dayOfWeek = new Date(date).getDay();
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const [availabilityResult, profileResult] = await Promise.all([
      supabase
        .from("doctor_availability")
        .select("start_time, end_time")
        .eq("doctor_id", doctorId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true),
      // Default duration as it's not in DB yet
      Promise.resolve({ data: { consultation_duration: 30 }, error: null }),
    ]);

    if (availabilityResult.error) throw availabilityResult.error;
    if (profileResult.error) throw profileResult.error;

    const availability = availabilityResult.data || [];
    if (availability.length === 0) {
      return { success: true, data: [] };
    }

    const slotDuration = profileResult.data?.consultation_duration || 30;

    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("doctor_id", doctorId)
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
      .not("status", "in", '("cancelled","rejected")');

    if (appointmentsError) throw appointmentsError;

    const { data: timeBlocks, error: blocksError } = await supabase
      .from("doctor_time_blocks")
      .select("start_date, end_date")
      .eq("doctor_id", doctorId)
      .lte("start_date", endOfDay.toISOString())
      .gte("end_date", startOfDay.toISOString());

    if (blocksError) throw blocksError;

    const toMinutes = (value: string) => {
      const [hoursStr = '0', minutesStr = '0'] = value.split(':');
      const parsedHours = Number(hoursStr);
      const parsedMinutes = Number(minutesStr);
      const hours = Number.isFinite(parsedHours) ? parsedHours : 0;
      const minutes = Number.isFinite(parsedMinutes) ? parsedMinutes : 0;
      return hours * 60 + minutes;
    };

    const toTimeString = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    const appointmentRows = (appointments || []) as AppointmentIntervalRow[];
    const appointmentIntervals = appointmentRows.map((apt) => {
      const startDate = new Date(apt.scheduled_at);
      const start = startDate.getHours() * 60 + startDate.getMinutes();
      const duration = apt.duration_minutes || slotDuration;
      return {
        id: apt.id,
        start,
        end: start + duration,
      };
    });

    const blockRows = (timeBlocks || []) as TimeBlockRow[];
    const blockIntervals = blockRows.map((block) => {
      const startDate = new Date(block.start_date);
      const endDate = new Date(block.end_date);
      return {
        start: Math.max(0, startDate.getHours() * 60 + startDate.getMinutes()),
        end: Math.min(24 * 60, endDate.getHours() * 60 + endDate.getMinutes()),
      };
    });

    const hasConflict = (start: number, end: number) => {
      const appointmentConflict = appointmentIntervals.find(
        (interval) => interval.start < end && interval.end > start
      );

      if (appointmentConflict) {
        return { conflicted: true, appointmentId: appointmentConflict.id };
      }

      const blockConflict = blockIntervals.some(
        (interval) => interval.start < end && interval.end > start
      );

      return { conflicted: blockConflict, appointmentId: undefined };
    };

    const timeSlots: TimeSlot[] = [];

    availability.forEach((slot) => {
      const startMinutes = toMinutes(slot.start_time);
      const endMinutes = toMinutes(slot.end_time);

      let cursor = startMinutes;
      while (cursor + slotDuration <= endMinutes) {
        const slotEnd = cursor + slotDuration;
        const conflict = hasConflict(cursor, slotEnd);

        timeSlots.push({
          time: toTimeString(cursor),
          available: !conflict.conflicted,
          appointment_id: conflict.appointmentId,
        });

        cursor += slotDuration;
      }
    });

    return { success: true, data: timeSlots };
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return { success: false, error, data: [] };
  }
}

// Get patient appointments
export async function getPatientAppointments(patientId: string) {
  try {
    const data = await fetchPublicData<Appointment[]>(
      "/api/patient/appointments",
      { patientId },
      { includeCredentials: true }
    );

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return { success: false, error, data: [] };
  }
}

// Get doctor appointments
export async function getDoctorAppointments(doctorId: string, accessToken?: string) {
  try {
    if (tauriApiService.isDesktop() && accessToken) {
      const data = await tauriApiService.supabaseGet<DoctorAppointmentRow[]>(
        `/rest/v1/appointments?select=*,patient:profiles!appointments_patient_id_fkey(id,full_name,email,avatar_url)&doctor_id=eq.${doctorId}&order=scheduled_at.desc`,
        accessToken,
        `appointments_doctor_${doctorId}`
      );
      const appointments = (data || []).map(transformAppointmentRow);
      return { success: true, data: appointments };
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("doctor_id", doctorId)
      .order("scheduled_at", { ascending: false });

    if (error) throw error;

    const appointmentRows = (data || []) as DoctorAppointmentRow[];
    const appointments = appointmentRows.map(transformAppointmentRow);

    return { success: true, data: appointments };
  } catch (error) {
    console.error("Error fetching doctor appointments:", JSON.stringify(error, null, 2));
    return { success: false, error, data: [] };
  }
}

function transformAppointmentRow(apt: DoctorAppointmentRow): Appointment {
  const scheduledAt = new Date(apt.scheduled_at);

  // IMPORTANT: Use local methods to avoid timezone issues
  // .toISOString() returns UTC and can cause day offset
  const year = scheduledAt.getFullYear();
  const month = String(scheduledAt.getMonth() + 1).padStart(2, '0');
  const day = String(scheduledAt.getDate()).padStart(2, '0');
  const appointmentDate = `${year}-${month}-${day}`;

  const hours = String(scheduledAt.getHours()).padStart(2, '0');
  const minutes = String(scheduledAt.getMinutes()).padStart(2, '0');
  const seconds = String(scheduledAt.getSeconds()).padStart(2, '0');
  const appointmentTime = `${hours}:${minutes}:${seconds}`;

  return {
    id: apt.id,
    patient_id: apt.patient_id,
    doctor_id: apt.doctor_id,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    duration: apt.duration_minutes,
    status: apt.status === 'pending' ? 'pending' : apt.status === 'confirmed' ? 'confirmed' : apt.status === 'completed' ? 'completed' : 'cancelled',
    consultation_type: 'video' as const,
    reason: apt.reason,
    notes: apt.notes,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
    patient: apt.patient
      ? {
        id: apt.patient.id,
        full_name: apt.patient.full_name || "Patient",
        email: apt.patient.email || "",
        avatar_url: apt.patient.avatar_url,
      }
      : undefined,
  };
}
