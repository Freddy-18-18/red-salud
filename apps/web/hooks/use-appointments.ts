import { useState, useEffect, useCallback } from "react";
import {
  createMedicoSdk,
  type Appointment,
  type CreateAppointmentData,
  type DoctorProfile,
  type MedicalSpecialty,
  type TimeSlot,
} from "@red-salud/sdk-medico";

import { supabase } from "@/lib/supabase/client";

const medicoSdk = createMedicoSdk(supabase);

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
      const data = await medicoSdk.appointments.getPatientAppointments(patientId);
      setAppointments(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await medicoSdk.appointments.getPatientAppointments(patientId);
        setAppointments(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error loading appointments');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  return { appointments, loading, error, refreshAppointments };
}

// Hook para citas del doctor
export function useDoctorAppointments(doctorId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAppointments = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await medicoSdk.appointments.getDoctorAppointments(doctorId);
      setAppointments(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await medicoSdk.appointments.getDoctorAppointments(doctorId);
        setAppointments(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error loading appointments');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [doctorId]);

  return { appointments, loading, error, refreshAppointments };
}

// Hook para especialidades médicas
export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await medicoSdk.appointments.getMedicalSpecialties(onlyWithDoctors);
        setSpecialties(data);
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
        const data = await medicoSdk.appointments.getAvailableDoctors(specialtyId);
        setDoctors(data);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [specialtyId]);

  return { doctors, loading };
}

// Hook para perfil de doctor
export function useDoctorProfile(doctorId: string | undefined) {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;

    const loadDoctor = async () => {
      setLoading(true);
      try {
        const data = await medicoSdk.appointments.getDoctorProfile(doctorId);
        setDoctor(data);
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  return { doctor, loading };
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
        const data = await medicoSdk.appointments.getAvailableTimeSlots(doctorId, date);
        setTimeSlots(data);
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

