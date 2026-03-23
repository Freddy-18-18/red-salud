import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  bookingService,
  type Specialty,
  type DoctorProfile,
  type DoctorFilters,
  type AvailableDate,
  type TimeSlotGroup,
  type AppointmentResult,
} from "@/lib/services/booking-service";

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
  const [userId, setUserId] = useState<string | null>(null);

  // Data for each step
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [timeSlotGroups, setTimeSlotGroups] = useState<TimeSlotGroup[]>([]);
  const [createdAppointment, setCreatedAppointment] =
    useState<AppointmentResult | null>(null);

  // Loading states per step
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Filters for doctor step
  const [doctorFilters, setDoctorFilters] = useState<DoctorFilters>({});

  // Global error
  const [error, setError] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Load specialties on mount
  useEffect(() => {
    const load = async () => {
      setLoadingSpecialties(true);
      try {
        const data = await bookingService.getSpecialties(true);
        setSpecialties(data);
      } catch (err) {
        console.error("Error loading specialties:", err);
        setError("No se pudieron cargar las especialidades");
      } finally {
        setLoadingSpecialties(false);
      }
    };
    load();
  }, []);

  // Load doctors when specialty changes
  useEffect(() => {
    if (!state.specialty) {
      setDoctors([]);
      return;
    }

    const load = async () => {
      setLoadingDoctors(true);
      setError(null);
      try {
        const data = await bookingService.getDoctorsBySpecialty(
          state.specialty!.id,
          doctorFilters
        );
        setDoctors(data);
      } catch (err) {
        console.error("Error loading doctors:", err);
        setError("No se pudieron cargar los doctores");
      } finally {
        setLoadingDoctors(false);
      }
    };
    load();
  }, [state.specialty, doctorFilters]);

  // Load available dates when doctor changes
  useEffect(() => {
    if (!state.doctor) {
      setAvailableDates([]);
      return;
    }

    const load = async () => {
      setLoadingDates(true);
      setError(null);
      try {
        const now = new Date();
        const start = now.toISOString().split("T")[0];
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        const end = endDate.toISOString().split("T")[0];

        const data = await bookingService.getAvailableDates(
          state.doctor!.profile_id,
          start,
          end
        );
        setAvailableDates(data);
      } catch (err) {
        console.error("Error loading dates:", err);
        setError("No se pudieron cargar las fechas disponibles");
      } finally {
        setLoadingDates(false);
      }
    };
    load();
  }, [state.doctor]);

  // Load time slots when date changes
  useEffect(() => {
    if (!state.doctor || !state.date) {
      setTimeSlotGroups([]);
      return;
    }

    const load = async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const data = await bookingService.getAvailableSlots(
          state.doctor!.profile_id,
          state.date!
        );
        setTimeSlotGroups(data);
      } catch (err) {
        console.error("Error loading slots:", err);
        setError("No se pudieron cargar los horarios");
      } finally {
        setLoadingSlots(false);
      }
    };
    load();
  }, [state.doctor, state.date]);

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

    setLoadingSubmit(true);
    setError(null);

    try {
      const scheduledAt = `${state.date}T${state.timeSlot.start}:00`;
      const result = await bookingService.createAppointment(userId, {
        doctor_id: state.doctor.profile_id,
        scheduled_at: scheduledAt,
        duration_minutes: 30,
        reason: state.reason,
        notes: state.notes || undefined,
        appointment_type: state.appointmentType,
      });

      setCreatedAppointment(result);
      setState((prev) => ({ ...prev, step: "success" }));
      return true;
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo agendar la cita. Intenta de nuevo."
      );
      return false;
    } finally {
      setLoadingSubmit(false);
    }
  }, [userId, state]);

  const resetBooking = useCallback(() => {
    setState(INITIAL_STATE);
    setCreatedAppointment(null);
    setDoctors([]);
    setAvailableDates([]);
    setTimeSlotGroups([]);
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
    specialties,
    doctors,
    availableDates,
    timeSlotGroups,
    createdAppointment,

    // Loading
    loadingSpecialties,
    loadingDoctors,
    loadingDates,
    loadingSlots,
    loadingSubmit,

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
