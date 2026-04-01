import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  bookingService,
  type Specialty,
  type DoctorProfile,
  type DoctorFilters,
  type AvailableDate,
  type TimeSlotGroup,
  type AppointmentResult,
} from "@/lib/services/booking-service";
import { supabase } from "@/lib/supabase/client";

// --- Types ---

export type BookingStep =
  | "specialty"
  | "doctor"
  | "date"
  | "time"
  | "details"
  | "confirm"
  | "success";

export interface BookingState {
  step: BookingStep;
  specialty: { id: string; name: string } | null;
  doctor: DoctorProfile | null;
  date: string | null; // ISO date
  timeSlot: { start: string; end: string } | null;
  reason: string;
  notes: string;
  appointmentType: "presencial" | "telemedicina";
}

const INITIAL_STATE: BookingState = {
  step: "specialty",
  specialty: null,
  doctor: null,
  date: null,
  timeSlot: null,
  reason: "",
  notes: "",
  appointmentType: "presencial",
};

const STEP_ORDER: BookingStep[] = [
  "specialty",
  "doctor",
  "date",
  "time",
  "details",
  "confirm",
  "success",
];

// --- Hook ---

export function useBooking() {
  const [state, setState] = useState<BookingState>(INITIAL_STATE);
  const userIdRef = useRef<string | null>(null);

  // Filters for doctor step (local UI state)
  const [doctorFilters, setDoctorFilters] = useState<DoctorFilters>({});

  // Global error (local UI state)
  const [error, setError] = useState<string | null>(null);

  // Created appointment (local state, set on mutation success)
  const [createdAppointment, setCreatedAppointment] =
    useState<AppointmentResult | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userIdRef.current = user?.id ?? null;
    };
    getUser();
  }, []);

  // --- Queries ---

  const specialtiesQuery = useQuery({
    queryKey: ["booking-specialties"],
    queryFn: () => bookingService.getSpecialties(true),
  });

  const doctorsQuery = useQuery({
    queryKey: ["booking-doctors", state.specialty?.id, doctorFilters],
    queryFn: () =>
      bookingService.getDoctorsBySpecialty(state.specialty!.id, doctorFilters),
    enabled: !!state.specialty,
  });

  const availableDatesQuery = useQuery({
    queryKey: ["booking-dates", state.doctor?.profile_id],
    queryFn: () => {
      const now = new Date();
      const start = now.toISOString().split("T")[0];
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);
      const end = endDate.toISOString().split("T")[0];
      return bookingService.getAvailableDates(
        state.doctor!.profile_id,
        start,
        end
      );
    },
    enabled: !!state.doctor,
  });

  const timeSlotsQuery = useQuery({
    queryKey: ["booking-slots", state.doctor?.profile_id, state.date],
    queryFn: () =>
      bookingService.getAvailableSlots(state.doctor!.profile_id, state.date!),
    enabled: !!state.doctor && !!state.date,
  });

  // --- Mutation ---

  const createAppointmentMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        doctor_id: string;
        scheduled_at: string;
        duration_minutes: number;
        reason: string;
        notes: string | undefined;
        appointment_type: "presencial" | "telemedicina";
      };
    }) => bookingService.createAppointment(userId, data),
  });

  // --- Actions ---

  const selectSpecialty = useCallback(
    (specialty: { id: string; name: string }) => {
      setState((prev) => ({
        ...prev,
        specialty,
        doctor: null,
        date: null,
        timeSlot: null,
      }));
    },
    []
  );

  const selectDoctor = useCallback((doctor: DoctorProfile) => {
    setState((prev) => ({
      ...prev,
      doctor,
      date: null,
      timeSlot: null,
    }));
  }, []);

  const selectDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      date,
      timeSlot: null,
    }));
  }, []);

  const selectTimeSlot = useCallback(
    (slot: { start: string; end: string }) => {
      setState((prev) => ({ ...prev, timeSlot: slot }));
    },
    []
  );

  const setReason = useCallback((reason: string) => {
    setState((prev) => ({ ...prev, reason }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  const setAppointmentType = useCallback(
    (appointmentType: "presencial" | "telemedicina") => {
      setState((prev) => ({ ...prev, appointmentType }));
    },
    []
  );

  const goToStep = useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, step }));
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step);
      if (currentIndex < STEP_ORDER.length - 1) {
        return { ...prev, step: STEP_ORDER[currentIndex + 1] };
      }
      return prev;
    });
    setError(null);
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: STEP_ORDER[currentIndex - 1] };
      }
      return prev;
    });
    setError(null);
  }, []);

  const confirmAppointment = useCallback(async () => {
    const userId = userIdRef.current;
    if (
      !userId ||
      !state.doctor ||
      !state.date ||
      !state.timeSlot ||
      !state.reason.trim()
    ) {
      setError("Faltan datos para confirmar la cita");
      return false;
    }

    setError(null);

    try {
      const scheduledAt = `${state.date}T${state.timeSlot.start}:00`;
      const result = await createAppointmentMutation.mutateAsync({
        userId,
        data: {
          doctor_id: state.doctor.profile_id,
          scheduled_at: scheduledAt,
          duration_minutes: 30,
          reason: state.reason,
          notes: state.notes || undefined,
          appointment_type: state.appointmentType,
        },
      });

      setCreatedAppointment(result);
      setState((prev) => ({ ...prev, step: "success" }));
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo agendar la cita. Intenta de nuevo."
      );
      return false;
    }
  }, [state, createAppointmentMutation]);

  const resetBooking = useCallback(() => {
    setState(INITIAL_STATE);
    setCreatedAppointment(null);
    setDoctorFilters({});
    setError(null);
  }, []);

  // Current step index for progress indicator
  const currentStepIndex = STEP_ORDER.indexOf(state.step);
  const totalSteps = STEP_ORDER.length - 1; // Exclude "success"

  return {
    // State
    state,
    currentStepIndex,
    totalSteps,

    // Data
    specialties: specialtiesQuery.data ?? [],
    doctors: doctorsQuery.data ?? [],
    availableDates: availableDatesQuery.data ?? [],
    timeSlotGroups: timeSlotsQuery.data ?? [],
    createdAppointment,

    // Loading
    loadingSpecialties: specialtiesQuery.isLoading,
    loadingDoctors: doctorsQuery.isLoading,
    loadingDates: availableDatesQuery.isLoading,
    loadingSlots: timeSlotsQuery.isLoading,
    loadingSubmit: createAppointmentMutation.isPending,

    // Filters
    doctorFilters,
    setDoctorFilters,

    // Error
    error,

    // Actions
    selectSpecialty,
    selectDoctor,
    selectDate,
    selectTimeSlot,
    setReason,
    setNotes,
    setAppointmentType,
    goToStep,
    nextStep,
    prevStep,
    confirmAppointment,
    resetBooking,
  };
}
