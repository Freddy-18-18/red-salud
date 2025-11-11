import { useState, useEffect } from "react";
import {
  getPatientAppointments,
  getDoctorAppointments,
  getMedicalSpecialties,
  getAvailableDoctors,
  getDoctorProfile,
  getAvailableTimeSlots,
  createAppointment,
  cancelAppointment,
} from "@/lib/supabase/services/appointments-service";
import type {
  Appointment,
  MedicalSpecialty,
  DoctorProfile,
  TimeSlot,
  CreateAppointmentData,
} from "@/lib/supabase/types/appointments";

// Hook para citas del paciente
export function usePatientAppointments(patientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadAppointments = async () => {
      setLoading(true);
      const result = await getPatientAppointments(patientId);
      if (result.success) {
        setAppointments(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadAppointments();
  }, [patientId]);

  const refreshAppointments = async () => {
    if (!patientId) return;
    const result = await getPatientAppointments(patientId);
    if (result.success) {
      setAppointments(result.data);
    }
  };

  return { appointments, loading, error, refreshAppointments };
}

// Hook para citas del doctor
export function useDoctorAppointments(doctorId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!doctorId) return;

    const loadAppointments = async () => {
      setLoading(true);
      const result = await getDoctorAppointments(doctorId);
      if (result.success) {
        setAppointments(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadAppointments();
  }, [doctorId]);

  const refreshAppointments = async () => {
    if (!doctorId) return;
    const result = await getDoctorAppointments(doctorId);
    if (result.success) {
      setAppointments(result.data);
    }
  };

  return { appointments, loading, error, refreshAppointments };
}

// Hook para especialidades médicas
export function useMedicalSpecialties(onlyWithDoctors: boolean = false) {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎣 useMedicalSpecialties hook called with onlyWithDoctors:', onlyWithDoctors);
    
    const loadSpecialties = async () => {
      console.log('⏳ Loading specialties...');
      const result = await getMedicalSpecialties(onlyWithDoctors);
      console.log('📦 Result from getMedicalSpecialties:', result);
      
      if (result.success) {
        console.log('✅ Setting specialties:', result.data.length);
        setSpecialties(result.data);
      } else {
        console.error('❌ Failed to load specialties:', result.error);
      }
      setLoading(false);
    };

    loadSpecialties();
  }, [onlyWithDoctors]);

  console.log('🎣 Hook returning:', { specialties: specialties.length, loading });

  return { specialties, loading };
}

// Hook para doctores disponibles
export function useAvailableDoctors(specialtyId?: string) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      const result = await getAvailableDoctors(specialtyId);
      if (result.success) {
        setDoctors(result.data);
      }
      setLoading(false);
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
      const result = await getDoctorProfile(doctorId);
      if (result.success) {
        setDoctor(result.data);
      }
      setLoading(false);
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
    if (!doctorId || !date) {
      setTimeSlots([]);
      return;
    }

    const loadTimeSlots = async () => {
      setLoading(true);
      const result = await getAvailableTimeSlots(doctorId, date);
      if (result.success) {
        setTimeSlots(result.data);
      }
      setLoading(false);
    };

    loadTimeSlots();
  }, [doctorId, date]);

  return { timeSlots, loading };
}

// Hook para crear cita
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = async (
    patientId: string,
    appointmentData: CreateAppointmentData
  ) => {
    setLoading(true);
    setError(null);
    const result = await createAppointment(patientId, appointmentData);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para cancelar cita
export function useCancelAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const cancel = async (
    appointmentId: string,
    userId: string,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);
    const result = await cancelAppointment(appointmentId, userId, reason);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return { cancel, loading, error };
}
