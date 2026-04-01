import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  patient?: {
    id: string;
    full_name?: string;
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
  years_experience?: number;
  biografia?: string;
  consultation_fee?: number;
  verified?: boolean;
  profile?: {
    id?: string;
    full_name?: string;
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["appointments", patientId],
    queryFn: async () => {
      // TODO: Replace with @red-salud/api-client call
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(
          `
          *,
          doctor:profiles!appointments_medico_id_fkey(
            id, full_name, email, avatar_url
          )
        `
        )
        .eq("paciente_id", patientId)
        .order("fecha_hora", { ascending: false });

      if (fetchError) throw fetchError;

      const mapped = (data || []).map((apt: Record<string, unknown>) => {
        const fechaHora = new Date(apt.fecha_hora as string);
        return {
          id: apt.id,
          patient_id: apt.paciente_id,
          doctor_id: apt.medico_id,
          appointment_date: fechaHora.toISOString().split("T")[0],
          appointment_time: fechaHora.toTimeString().split(" ")[0],
          duration: apt.duracion_minutos,
          status:
            apt.status === "pendiente"
              ? "pending"
              : apt.status === "confirmada"
                ? "confirmed"
                : apt.status === "completada"
                  ? "completed"
                  : "cancelled",
          consultation_type: "presencial" as const,
          reason: apt.motivo,
          notes: apt.notas,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          doctor: apt.doctor,
        } as Appointment;
      });

      return mapped;
    },
    enabled: !!patientId,
  });

  return {
    appointments: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refreshAppointments: query.refetch,
  };
}

// Hook para especialidades médicas
export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  const query = useQuery({
    queryKey: ["specialties", onlyWithDoctors],
    queryFn: async () => {
      // TODO: Replace with @red-salud/api-client call
      let query = supabase.from("specialties").select("*").order("name");

      if (onlyWithDoctors) {
        // Filter to specialties that have at least one verified doctor
        const { data: doctorSpecialties } = await supabase
          .from("doctor_details")
          .select("specialty_id")
          .eq("verified", true);

        const specialtyIds = [
          ...new Set((doctorSpecialties || []).map((d) => d.specialty_id)),
        ];
        if (specialtyIds.length > 0) {
          query = query.in("id", specialtyIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MedicalSpecialty[];
    },
  });

  return {
    specialties: query.data ?? [],
    loading: query.isLoading,
  };
}

// Hook para doctores disponibles
export function useAvailableDoctors(specialtyId?: string) {
  const query = useQuery({
    queryKey: ["doctors", specialtyId],
    queryFn: async () => {
      // TODO: Replace with @red-salud/api-client call
      let query = supabase
        .from("doctor_details")
        .select(
          `
          *,
          specialty:specialties(id, name, description),
          profile:profiles!inner(id, full_name, email, avatar_url)
        `
        )
        .eq("verified", true);

      if (specialtyId) {
        query = query.eq("specialty_id", specialtyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((d: Record<string, unknown>) => ({
        id: d.id,
        specialty_id: d.specialty_id,
        years_experience: d.years_experience,
        biografia: d.biografia,
        consultation_fee: d.consultation_fee
          ? parseFloat(d.consultation_fee as string)
          : undefined,
        verified: d.verified,
        profile: d.profile,
        specialty: d.specialty,
      })) as DoctorProfile[];

      return mapped;
    },
    enabled: !!specialtyId,
  });

  return {
    doctors: query.data ?? [],
    loading: query.isLoading,
  };
}

// Hook para slots de tiempo disponibles
export function useAvailableTimeSlots(
  doctorId: string | undefined,
  date: string | undefined
) {
  const query = useQuery({
    queryKey: ["timeSlots", doctorId, date],
    queryFn: async () => {
      const dayOfWeek = new Date(date!).getDay();
      const startOfDay = new Date(`${date!}T00:00:00`);
      const endOfDay = new Date(`${date!}T23:59:59.999`);

      // Get doctor availability for this day of week
      const { data: availability } = await supabase
        .from("doctor_availability")
        .select("hora_inicio, hora_fin")
        .eq("doctor_id", doctorId!)
        .eq("dia_semana", dayOfWeek)
        .eq("activo", true);

      if (!availability || availability.length === 0) {
        return [] as TimeSlot[];
      }

      // Get existing appointments for this date
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, fecha_hora, duracion_minutos, status")
        .eq("medico_id", doctorId!)
        .gte("fecha_hora", startOfDay.toISOString())
        .lte("fecha_hora", endOfDay.toISOString())
        .not("status", "in", '("cancelada","rechazada")');

      const slotDuration = 30; // Default duration

      const toMinutes = (value: string) => {
        const [hoursStr = "0", minutesStr = "0"] = value.split(":");
        return (Number(hoursStr) || 0) * 60 + (Number(minutesStr) || 0);
      };

      const toTimeString = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
      };

      const appointmentIntervals = (
        appointments || []
      ).map((apt: Record<string, unknown>) => {
        const startDate = new Date(apt.fecha_hora as string);
        const start =
          startDate.getHours() * 60 + startDate.getMinutes();
        return {
          start,
          end: start + ((apt.duracion_minutos as number) || slotDuration),
        };
      });

      const hasConflict = (start: number, end: number) =>
        appointmentIntervals.some(
          (interval: { start: number; end: number }) =>
            interval.start < end && interval.end > start
        );

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

      return slots;
    },
    enabled: !!doctorId && !!date,
  });

  return {
    timeSlots: query.data ?? [],
    loading: query.isLoading,
  };
}

// Hook para crear cita
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      patientId,
      appointmentData,
    }: {
      patientId: string;
      appointmentData: CreateAppointmentData;
    }) => {
      const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

      const { data, error: insertError } = await supabase
        .from("appointments")
        .insert({
          paciente_id: patientId,
          medico_id: appointmentData.doctor_id,
          fecha_hora: fechaHora,
          duracion_minutos: 30,
          motivo: appointmentData.reason || "",
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

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", variables.patientId],
      });
    },
  });

  const create = async (
    patientId: string,
    appointmentData: CreateAppointmentData
  ) => {
    try {
      const data = await mutation.mutateAsync({
        patientId,
        appointmentData,
      });
      return { success: true as const, data };
    } catch (err) {
      return { success: false as const, error: err, data: null };
    }
  };

  return { create, loading: mutation.isPending, error: mutation.error?.message ?? null };
}

// Hook para cancelar cita
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      appointmentId,
      userId,
      reason,
    }: {
      appointmentId: string;
      userId: string;
      reason?: string;
    }) => {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          status: "cancelada",
          notas: reason
            ? `Cancelada: ${reason}`
            : "Cancelada por paciente",
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      await supabase.from("user_activity_log").insert({
        user_id: userId,
        activity_type: "appointment_cancelled",
        description: `Cita cancelada: ${appointmentId}`,
        status: "success",
      });

      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const cancel = async (
    appointmentId: string,
    userId: string,
    reason?: string
  ) => {
    try {
      await mutation.mutateAsync({ appointmentId, userId, reason });
      return { success: true as const, data: null };
    } catch (err) {
      return { success: false as const, error: err, data: null };
    }
  };

  return { cancel, loading: mutation.isPending, error: mutation.error?.message ?? null };
}
