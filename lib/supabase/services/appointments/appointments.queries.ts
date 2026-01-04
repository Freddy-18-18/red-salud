import { supabase } from "../../client";
import type {
  MedicalSpecialty,
  DoctorProfile,
  DoctorSchedule,
  TimeSlot,
  Appointment,
} from "./appointments.types";

interface AvailabilityRow {
  id: string;
  doctor_id: string;
  dia_semana: number;
  hora_inicio: string | number;
  hora_fin: string | number;
  activo: boolean;
  created_at: string;
}

interface AppointmentIntervalRow {
  id: string;
  fecha_hora: string;
  duracion_minutos?: number;
}

interface TimeBlockRow {
  fecha_inicio: string;
  fecha_fin: string;
}

interface DoctorAppointmentRow {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  status: string;
  motivo?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    nombre_completo?: string;
    email?: string;
    avatar_url?: string;
    fecha_nacimiento?: string;
    genero?: string;
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

// Obtener todas las especialidades (con opción de filtrar solo las que tienen médicos)
export async function getMedicalSpecialties(onlyWithDoctors: boolean = false) {
  try {
    const data = await fetchPublicData<MedicalSpecialty[]>("/api/public/doctor-specialties", {
      onlyWithDoctors: onlyWithDoctors ? "true" : undefined,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Error fetching specialties:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener doctores disponibles (con filtros opcionales)
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

// Obtener perfil de un doctor específico
export async function getDoctorProfile(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_details")
      .select(`
        *,
        specialty:specialties(id, name, description, icon),
        profile:profiles!inner(id, nombre_completo, email, avatar_url)
      `)
      .eq("id", doctorId)
      .single();

    if (error) throw error;

    const doctor = {
      id: data.id,
      specialty_id: data.especialidad_id,
      license_number: data.licencia_medica,
      anos_experiencia: data.anos_experiencia,
      biografia: data.biografia,
      tarifa_consulta: data.tarifa_consulta ? parseFloat(data.tarifa_consulta) : undefined,
      consultation_duration: 30,
      verified: data.verified,
      created_at: data.created_at,
      updated_at: data.updated_at,
      profile: {
        id: data.profile?.id,
        nombre_completo: data.profile?.nombre_completo,
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

// Obtener horarios de un doctor
export async function getDoctorSchedules(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("id, dia_semana, hora_inicio, hora_fin, activo, doctor_id, created_at")
      .eq("doctor_id", doctorId)
      .eq("activo", true)
      .order("dia_semana", { ascending: true });

    if (error) throw error;

    const availabilityRows = (data || []) as AvailabilityRow[];
    const schedules: DoctorSchedule[] = availabilityRows.map((slot) => ({
      id: slot.id,
      doctor_id: slot.doctor_id,
      day_of_week: slot.dia_semana,
      start_time:
        typeof slot.hora_inicio === "string"
          ? slot.hora_inicio
          : `${slot.hora_inicio}:00`,
      end_time:
        typeof slot.hora_fin === "string"
          ? slot.hora_fin
          : `${slot.hora_fin}:00`,
      is_active: slot.activo,
      created_at: slot.created_at,
    }));

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener slots disponibles para un doctor en una fecha específica
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
        .select("hora_inicio, hora_fin")
        .eq("doctor_id", doctorId)
        .eq("dia_semana", dayOfWeek)
        .eq("activo", true),
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
      .select("id, fecha_hora, duracion_minutos, status")
      .eq("medico_id", doctorId)
      .gte("fecha_hora", startOfDay.toISOString())
      .lte("fecha_hora", endOfDay.toISOString())
      .not("status", "in", '("cancelada","rechazada")');

    if (appointmentsError) throw appointmentsError;

    const { data: timeBlocks, error: blocksError } = await supabase
      .from("doctor_time_blocks")
      .select("fecha_inicio, fecha_fin")
      .eq("doctor_id", doctorId)
      .lte("fecha_inicio", endOfDay.toISOString())
      .gte("fecha_fin", startOfDay.toISOString());

    if (blocksError) throw blocksError;

    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(":").map((part) => Number(part));
      return hours * 60 + minutes;
    };

    const toTimeString = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    const appointmentRows = (appointments || []) as AppointmentIntervalRow[];
    const appointmentIntervals = appointmentRows.map((apt) => {
      const startDate = new Date(apt.fecha_hora);
      const start = startDate.getHours() * 60 + startDate.getMinutes();
      const duration = apt.duracion_minutos || slotDuration;
      return {
        id: apt.id,
        start,
        end: start + duration,
      };
    });

    const blockRows = (timeBlocks || []) as TimeBlockRow[];
    const blockIntervals = blockRows.map((block) => {
      const startDate = new Date(block.fecha_inicio);
      const endDate = new Date(block.fecha_fin);
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
      const startMinutes = toMinutes(slot.hora_inicio);
      const endMinutes = toMinutes(slot.hora_fin);

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

// Obtener citas de un paciente
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

// Obtener citas de un doctor
export async function getDoctorAppointments(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_paciente_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        )
      `)
      .eq("medico_id", doctorId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;

    const appointmentRows = (data || []) as DoctorAppointmentRow[];
    const appointments = appointmentRows.map((apt) => {
      const fechaHora = new Date(apt.fecha_hora);

      // IMPORTANTE: Usar métodos locales para evitar problemas de timezone
      // .toISOString() devuelve UTC y puede causar desfase de días
      const year = fechaHora.getFullYear();
      const month = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const day = String(fechaHora.getDate()).padStart(2, '0');
      const appointmentDate = `${year}-${month}-${day}`;

      const hours = String(fechaHora.getHours()).padStart(2, '0');
      const minutes = String(fechaHora.getMinutes()).padStart(2, '0');
      const seconds = String(fechaHora.getSeconds()).padStart(2, '0');
      const appointmentTime = `${hours}:${minutes}:${seconds}`;

      return {
        id: apt.id,
        patient_id: apt.paciente_id,
        doctor_id: apt.medico_id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration: apt.duracion_minutos,
        status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
        consultation_type: 'video' as const,
        reason: apt.motivo,
        notes: apt.notas,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        patient: apt.patient || undefined,
      };
    });

    return { success: true, data: appointments as Appointment[] };
  } catch (error) {
    console.error("Error fetching doctor appointments:", JSON.stringify(error, null, 2));
    return { success: false, error, data: [] };
  }
}
