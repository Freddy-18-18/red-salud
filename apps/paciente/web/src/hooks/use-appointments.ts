import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, postJson } from "@/lib/utils/fetch";

import type {
  Appointment,
  MedicalSpecialty,
  DoctorProfile,
  TimeSlot,
  CreateAppointmentData,
} from "@/lib/services/appointments/appointments.types";

// ── usePatientAppointments ───────────────────────────────────────────

export function usePatientAppointments(patientId: string | undefined) {
  const query = useQuery({
    queryKey: ["appointments", patientId],
    queryFn: async () => {
      // The API route uses the session cookie — patientId is implicit
      return fetchJson<Appointment[]>("/api/appointments");
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

// ── useMedicalSpecialties ────────────────────────────────────────────

export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  const query = useQuery({
    queryKey: ["specialties", onlyWithDoctors],
    queryFn: async () => {
      const url = onlyWithDoctors
        ? "/api/specialties?with_doctors=true"
        : "/api/specialties";
      return fetchJson<MedicalSpecialty[]>(url);
    },
  });

  return {
    specialties: query.data ?? [],
    loading: query.isLoading,
  };
}

// ── useAvailableDoctors ──────────────────────────────────────────────

export function useAvailableDoctors(specialtyId?: string) {
  const query = useQuery({
    queryKey: ["doctors", specialtyId],
    queryFn: async () => {
      const url = `/api/doctors/search?specialty_id=${encodeURIComponent(specialtyId!)}`;
      return fetchJson<DoctorProfile[]>(url);
    },
    enabled: !!specialtyId,
  });

  return {
    doctors: query.data ?? [],
    loading: query.isLoading,
  };
}

// ── useAvailableTimeSlots ────────────────────────────────────────────

export function useAvailableTimeSlots(
  doctorId: string | undefined,
  date: string | undefined
) {
  const query = useQuery({
    queryKey: ["timeSlots", doctorId, date],
    queryFn: async () => {
      const url = `/api/doctors/${doctorId}/availability?date=${encodeURIComponent(date!)}`;
      return fetchJson<TimeSlot[]>(url);
    },
    enabled: !!doctorId && !!date,
  });

  return {
    timeSlots: query.data ?? [],
    loading: query.isLoading,
  };
}

// ── useCreateAppointment ─────────────────────────────────────────────

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      appointmentData,
    }: {
      patientId: string;
      appointmentData: CreateAppointmentData;
    }) => {
      return postJson<Appointment>("/api/appointments", appointmentData);
    },
    onSuccess: (_data, variables) => {
      // The patient's own appointments list shows the new row.
      queryClient.invalidateQueries({
        queryKey: ["appointments", variables.patientId],
      });
      // The doctor's slot we just consumed is no longer available — invalidate
      // every cache that fed the booking UI for that doctor so the next user
      // who lands on the picker doesn't see a stale "available" badge.
      queryClient.invalidateQueries({
        queryKey: ["timeSlots", variables.appointmentData.doctor_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctors", variables.appointmentData.doctor_id],
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

  return {
    create,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// ── useCancelAppointment ─────────────────────────────────────────────

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      appointmentId,
      reason,
    }: {
      appointmentId: string;
      userId: string;
      reason?: string;
    }) => {
      await postJson(`/api/appointments/${appointmentId}/cancel`, { reason }, "PATCH");
      return null;
    },
    onSuccess: () => {
      // The patient's own list needs a refresh, AND every availability cache
      // for any doctor needs to drop because the cancelled slot is now free.
      // We don't know the doctor_id at this layer (the cancel endpoint takes
      // only appointment_id), so we invalidate the prefixes broadly.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
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

  return {
    cancel,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
