import {
  usePatientAppointments as useSdkPatientAppointments,
  useDoctorAppointments as useSdkDoctorAppointments,
  useMedicalSpecialties as useSdkMedicalSpecialties,
  useDoctorProfile as useSdkDoctorProfile,
  type CreateAppointmentData
} from "@red-salud/sdk-medico";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { createMedicoSdk } from "@red-salud/sdk-medico";

const medicoSdk = createMedicoSdk(supabase);

export function usePatientAppointments(patientId: string | undefined) {
  return useSdkPatientAppointments(supabase, patientId);
}

export function useDoctorAppointments(doctorId: string | undefined) {
  return useSdkDoctorAppointments(supabase, doctorId);
}

export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  return useSdkMedicalSpecialties(supabase, onlyWithDoctors);
}

export function useDoctorProfile(doctorId: string | undefined) {
  return useSdkDoctorProfile(supabase, doctorId);
}

// Keep local logic for creation/cancellation if not fully in SDK hooks yet
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
      return await medicoSdk.appointments.createAppointment(patientId, appointmentData);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      return { success: false as const, error, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

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
      await medicoSdk.appointments.cancel({ appointmentId, reason });
      return { success: true as const, data: null };
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      return { success: false as const, error, data: null };
    } finally {
      void userId;
      setLoading(false);
    }
  };

  return { cancel, loading, error };
}

