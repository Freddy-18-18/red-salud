import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

// TODO: Import types from @red-salud/types once available
interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  consultation_type: "video" | "presencial" | "telefono";
  reason?: string;
  notes?: string;
  price?: number;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    nombre_completo?: string;
    email?: string;
    avatar_url?: string;
  };
  patient?: {
    id: string;
    nombre_completo?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface DoctorProfile {
  id: string;
  specialty_id?: string;
  anos_experiencia?: number;
  biografia?: string;
  tarifa_consulta?: number;
  verified?: boolean;
  profile?: {
    id?: string;
    nombre_completo?: string;
    email?: string;
    avatar_url?: string;
  };
  specialty?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
}

interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: "video" | "presencial" | "telefono";
  reason?: string;
}

// Hook para citas del paciente
export function usePatientAppointments(patientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAppointments = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with @red-salud/api-client call
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(`
          *,
          doctor:profiles!appointments_medico_id_fkey(
            id, nombre_completo, email, avatar_url
          )
        `)
        .eq("paciente_id", patientId)
        .order("fecha_hora", { ascending: false });

      if (fetchError) throw fetchError;

      const mapped = (data || []).map((apt: Record<string, unknown>) => {
        const fechaHora = new Date(apt.fecha_hora as string);
        return {
          id: apt.id,
          patient_id: apt.paciente_id,
          doctor_id: apt.medico_id,
          appointment_date: fechaHora.toISOString().split('T')[0],
          appointment_time: fechaHora.toTimeString().split(' ')[0],
          duration: apt.duracion_minutos,
          status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
          consultation_type: 'presencial' as const,
          reason: apt.motivo,
          notes: apt.notas,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          doctor: apt.doctor,
        } as Appointment;
      });

      setAppointments(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      refreshAppointments();
    }
  }, [patientId, refreshAppointments]);

  return { appointments, loading, error, refreshAppointments };
}

// Hook para especialidades médicas
export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        // TODO: Replace with @red-salud/api-client call
        let query = supabase.from("specialties").select("*").order("name");

        if (onlyWithDoctors) {
          // Filter to specialties that have at least one verified doctor
          const { data: doctorSpecialties } = await supabase
            .from("doctor_details")
            .select("especialidad_id")
            .eq("verified", true);

          const specialtyIds = [...new Set((doctorSpecialties || []).map(d => d.especialidad_id))];
          if (specialtyIds.length > 0) {
            query = query.in("id", specialtyIds);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setSpecialties(data || []);
      } catch (error) {
        console.error('Error loading specialties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, [onlyWithDoctors]);

  return { specialties, loading };
}

// Hook para doctores disponibles
export function useAvailableDoctors(specialtyId?: string) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        // TODO: Replace with @red-salud/api-client call
        let query = supabase
          .from("doctor_details")
          .select(`
            *,
            specialty:specialties(id, name, description),
            profile:profiles!inner(id, nombre_completo, email, avatar_url)
          `)
          .eq("verified", true);

        if (specialtyId) {
          query = query.eq("especialidad_id", specialtyId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const mapped = (data || []).map((d: Record<string, unknown>) => ({
          id: d.id,
          specialty_id: d.especialidad_id,
          anos_experiencia: d.anos_experiencia,
          biografia: d.biografia,
          tarifa_consulta: d.tarifa_consulta ? parseFloat(d.tarifa_consulta as string) : undefined,
          verified: d.verified,
          profile: d.profile,
          specialty: d.specialty,
        })) as DoctorProfile[];

        setDoctors(mapped);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [specialtyId]);

  return { doctors, loading };
}

// Hook para slots de tiempo disponibles
export function useAvailableTimeSlots(
  doctorId: string | undefined,
  date: string | undefined
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!doctorId || !date) {
        setTimeSlots([]);
        return;
      }

      setLoading(true);
      try {
        const dayOfWeek = new Date(date).getDay();
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59.999`);

        // Get doctor availability for this day of week
        const { data: availability } = await supabase
          .from("doctor_availability")
          .select("hora_inicio, hora_fin")
          .eq("doctor_id", doctorId)
          .eq("dia_semana", dayOfWeek)
          .eq("activo", true);

        if (!availability || availability.length === 0) {
          setTimeSlots([]);
          return;
        }

        // Get existing appointments for this date
        const { data: appointments } = await supabase
          .from("appointments")
          .select("id, fecha_hora, duracion_minutos, status")
          .eq("medico_id", doctorId)
          .gte("fecha_hora", startOfDay.toISOString())
          .lte("fecha_hora", endOfDay.toISOString())
          .not("status", "in", '("cancelada","rechazada")');

        const slotDuration = 30; // Default duration

        const toMinutes = (value: string) => {
          const [hoursStr = '0', minutesStr = '0'] = value.split(':');
          return (Number(hoursStr) || 0) * 60 + (Number(minutesStr) || 0);
        };

        const toTimeString = (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
        };

        const appointmentIntervals = (appointments || []).map((apt: Record<string, unknown>) => {
          const startDate = new Date(apt.fecha_hora as string);
          const start = startDate.getHours() * 60 + startDate.getMinutes();
          return { start, end: start + ((apt.duracion_minutos as number) || slotDuration) };
        });

        const hasConflict = (start: number, end: number) =>
          appointmentIntervals.some((interval: { start: number; end: number }) => interval.start < end && interval.end > start);

        const slots: TimeSlot[] = [];

        availability.forEach((slot: Record<string, unknown>) => {
          const startMinutes = toMinutes(slot.hora_inicio as string);
          const endMinutes = toMinutes(slot.hora_fin as string);
          let cursor = startMinutes;

          while (cursor + slotDuration <= endMinutes) {
            slots.push({
              time: toTimeString(cursor),
              available: !hasConflict(cursor, cursor + slotDuration),
            });
            cursor += slotDuration;
          }
        });

        setTimeSlots(slots);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [doctorId, date]);

  return { timeSlots, loading };
}

// Hook para crear cita
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    patientId: string,
    appointmentData: CreateAppointmentData
  ) => {
    setLoading(true);
    setError(null);
    try {
      const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

      const { data, error: insertError } = await supabase
        .from("appointments")
        .insert({
          paciente_id: patientId,
          medico_id: appointmentData.doctor_id,
          fecha_hora: fechaHora,
          duracion_minutos: 30,
          motivo: appointmentData.reason || '',
          status: "pendiente",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log activity
      await supabase.from("user_activity_log").insert({
        user_id: patientId,
        activity_type: "appointment_created",
        description: `Cita creada para ${appointmentData.appointment_date}`,
        status: "success",
      });

      return { success: true as const, data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      return { success: false as const, error: err, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

// Hook para cancelar cita
export function useCancelAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async (
    appointmentId: string,
    userId: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          status: "cancelada",
          notas: reason ? `Cancelada: ${reason}` : 'Cancelada por paciente',
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      await supabase.from("user_activity_log").insert({
        user_id: userId,
        activity_type: "appointment_cancelled",
        description: `Cita cancelada: ${appointmentId}`,
        status: "success",
      });

      return { success: true as const, data: null };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return { success: false as const, error: err, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { cancel, loading, error };
}
