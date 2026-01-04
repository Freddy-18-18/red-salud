import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { format, addMinutes } from "date-fns";
import { AppointmentFormValues } from "@/lib/validations/appointment";

interface ConflictingAppointment {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
  paciente?: { nombre_completo: string } | null;
  offline_patient?: { nombre_completo: string } | null;
}

interface Patient {
  id: string;
  nombre_completo: string;
  email: string | null;
  cedula: string | null;
  type: "registered" | "offline";
}

interface FormState {
  loading: boolean;
  error: string | null;
  checkingConflict: boolean;
  conflictingAppointments: ConflictingAppointment[];
  patients: Patient[];
  loadingPatients: boolean;
  isInitialLoad: boolean;
}

interface AppointmentFormHookReturn extends FormState {
  checkTimeConflicts: (fecha: string, hora: string, duracion: number) => Promise<void>;
  loadPatients: () => Promise<void>;
  submitAppointment: (data: AppointmentFormValues) => Promise<void>;
  clearError: () => void;
  getMinDate: () => string;
  getMinTime: (fecha: string) => string;
  isTimeValid: (fecha: string, hora: string) => boolean;
  saveFormToLocalStorage: (data: Partial<AppointmentFormValues>) => void;
  loadFormFromLocalStorage: () => Partial<AppointmentFormValues> | null;
  clearFormFromLocalStorage: () => void;
}

const STORAGE_KEY = "appointment_form_draft";

export function useAppointmentForm(): AppointmentFormHookReturn {
  const router = useRouter();

  // Estado consolidado
  const [state, setState] = useState<FormState>({
    loading: false,
    error: null,
    checkingConflict: false,
    conflictingAppointments: [],
    patients: [],
    loadingPatients: true,
    isInitialLoad: true,
  });

  // Refs para evitar race conditions
  const conflictCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LocalStorage utilities
  const saveFormToLocalStorage = useCallback((data: Partial<AppointmentFormValues>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Error saving form to localStorage:", err);
    }
  }, []);

  const loadFormFromLocalStorage = useCallback((): Partial<AppointmentFormValues> | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      // Validar que no sea muy antiguo (24 horas)
      const savedTimestamp = new Date(parsed.timestamp);
      const now = new Date();
      if (now.getTime() - savedTimestamp.getTime() > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timestamp, ...formData } = parsed;
      return formData;
    } catch (err) {
      console.error("Error loading form from localStorage:", err);
      return null;
    }
  }, []);

  const clearFormFromLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Error clearing form from localStorage:", err);
    }
  }, []);

  // Actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<FormState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Cargar pacientes
  const loadPatients = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [registeredResult, offlineResult] = await Promise.all([
        supabase
          .from("doctor_patients")
          .select(`
            patient_id,
            patient:profiles!doctor_patients_patient_id_fkey(
              id,
              nombre_completo,
              email
            )
          `)
          .eq("doctor_id", user.id),
        supabase
          .from("offline_patients")
          .select("id, nombre_completo, cedula")
          .eq("doctor_id", user.id)
          .eq("status", "offline"),
      ]);

      const allPatients: Patient[] = [
        ...(registeredResult.data?.map((rp) => {
          const patient = rp.patient as Array<{ id: string; nombre_completo: string; email: string }>;
          const patientData = Array.isArray(patient) ? patient[0] : patient;
          return {
            id: patientData.id,
            nombre_completo: patientData.nombre_completo,
            email: patientData.email,
            cedula: null,
            type: "registered" as const,
          };
        }) || []),
        ...(offlineResult.data?.map((op) => ({
          id: op.id,
          nombre_completo: op.nombre_completo,
          email: null,
          cedula: op.cedula,
          type: "offline" as const,
        })) || []),
      ];

      updateState({ patients: allPatients, loadingPatients: false });
    } catch (err) {
      console.error("Error loading patients:", err);
      updateState({ loadingPatients: false });
    } finally {
      // Marcar que ya no es carga inicial
      updateState({ isInitialLoad: false });
    }
  }, [updateState]);

  // Verificar conflictos de horario (con debounce real)
  const checkTimeConflicts = useCallback(
    async (fecha: string, hora: string, duracion: number) => {
      if (!fecha || !hora) return;

      // Limpiar timeout anterior
      if (conflictCheckTimeoutRef.current) {
        clearTimeout(conflictCheckTimeoutRef.current);
      }

      updateState({ checkingConflict: true });

      conflictCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const startDateTime = new Date(`${fecha}T${hora}:00`);
          const endDateTime = addMinutes(startDateTime, duracion);

          // Obtener todas las citas del doctor (no canceladas)
          const { data: appointments } = await supabase
            .from("appointments")
            .select(`
              id,
              fecha_hora,
              duracion_minutos,
              motivo,
              paciente:profiles!appointments_paciente_id_fkey(nombre_completo),
              offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo)
            `)
            .eq("medico_id", user.id)
            .neq("status", "cancelada") as unknown as {
            data: Array<{
              id: string;
              fecha_hora: string;
              duracion_minutos: number;
              motivo: string;
              paciente: { nombre_completo: string } | null;
              offline_patient: { nombre_completo: string } | null;
            }> | null;
          };

          // Detectar solapamientos
          const conflicts = (appointments || []).filter((apt) => {
            const aptStart = new Date(apt.fecha_hora);
            const aptEnd = addMinutes(aptStart, apt.duracion_minutos);

            return (
              (startDateTime >= aptStart && startDateTime < aptEnd) ||
              (endDateTime > aptStart && endDateTime <= aptEnd) ||
              (startDateTime <= aptStart && endDateTime >= aptEnd)
            );
          });

          if (conflicts.length > 0) {
            const conflictList = conflicts
              .map((apt) => {
                const patientName =
                  apt.paciente?.nombre_completo ||
                  apt.offline_patient?.nombre_completo ||
                  "Paciente";
                const time = format(new Date(apt.fecha_hora), "HH:mm");
                return `${time} - ${patientName}`;
              })
              .join(", ");

            updateState({
              conflictingAppointments: conflicts,
              error: `⚠️ Conflicto de horario: Ya tienes ${conflicts.length} cita(s): ${conflictList}`,
            });
          } else {
            updateState({ conflictingAppointments: [], error: null });
          }
        } catch (err) {
          console.error("Error checking conflicts:", err);
        } finally {
          updateState({ checkingConflict: false });
        }
      }, 1000); // Debounce de 1 segundo
    },
    [updateState]
  );

  // Validaciones de fecha y hora
  const getMinDate = useCallback(() => format(new Date(), "yyyy-MM-dd"), []);

  const getMinTime = useCallback((fecha: string) => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    if (fecha === today) {
      const minTime = addMinutes(now, 15);
      return format(minTime, "HH:mm");
    }
    return "00:00";
  }, []);

  const isTimeValid = useCallback((fecha: string, hora: string) => {
    if (!fecha || !hora) return true;

    const selectedDateTime = new Date(`${fecha}T${hora}:00`);
    const now = new Date();

    return selectedDateTime > now;
  }, []);

  // Enviar cita (con validación triple eliminada)
  const submitAppointment = useCallback(
    async (data: AppointmentFormValues) => {
      updateState({ loading: true, error: null });

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login/medico");
          return;
        }

        // Validar hora futura
        if (!isTimeValid(data.fecha, data.hora)) {
          updateState({
            loading: false,
            error: "La fecha y hora seleccionadas ya pasaron.",
          });
          return;
        }

        // Validación FINAL de conflictos antes de guardar
        const startDateTime = new Date(`${data.fecha}T${data.hora}:00`);
        const endDateTime = addMinutes(startDateTime, data.duracion_minutos);

        const { data: finalCheck } = await supabase
          .from("appointments")
          .select("id, fecha_hora, duracion_minutos")
          .eq("medico_id", user.id)
          .neq("status", "cancelada");

        const hasConflict = (finalCheck || []).some((apt) => {
          const aptStart = new Date(apt.fecha_hora);
          const aptEnd = addMinutes(aptStart, apt.duracion_minutos);

          return (
            (startDateTime >= aptStart && startDateTime < aptEnd) ||
            (endDateTime > aptStart && endDateTime <= aptEnd) ||
            (startDateTime <= aptStart && endDateTime >= aptEnd)
          );
        });

        if (hasConflict) {
          updateState({
            loading: false,
            error: "⛔ Conflicto: Ya existe una cita en este horario.",
          });
          return;
        }

        // Preparar datos
        const selectedPatient = state.patients.find((p) => p.id === data.paciente_id);
        const isOfflinePatient = selectedPatient?.type === "offline";

        const colors: Record<string, string> = {
          presencial: "#3B82F6",
          telemedicina: "#10B981",
          urgencia: "#EF4444",
          seguimiento: "#8B5CF6",
          primera_vez: "#F59E0B",
        };

        const appointmentId = crypto.randomUUID();
        const meetingUrl =
          data.tipo_cita === "telemedicina" && !isOfflinePatient
            ? `https://meet.jit.si/cita-${appointmentId.substring(0, 8)}`
            : null;

        const appointmentData: Record<string, unknown> = {
          id: appointmentId,
          medico_id: user.id,
          fecha_hora: startDateTime.toISOString(),
          duracion_minutos: data.duracion_minutos,
          tipo_cita: data.tipo_cita,
          motivo: data.motivo,
          notas_internas: data.notas_internas || null,
          status: "pendiente",
          color: colors[data.tipo_cita] || colors.presencial,
          price: data.precio ? parseFloat(data.precio) : null,
          meeting_url: meetingUrl,
        };

        if (isOfflinePatient) {
          appointmentData.offline_patient_id = data.paciente_id;
          appointmentData.paciente_id = null;
        } else {
          appointmentData.paciente_id = data.paciente_id;
          appointmentData.offline_patient_id = null;
        }

        const { error: insertError } = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (insertError) throw insertError;

        // Log de actividad
        await supabase.from("user_activity_log").insert({
          user_id: user.id,
          activity_type: "appointment_created",
          description: `Cita creada para ${startDateTime.toLocaleString()}`,
          status: "success",
        });

        // Limpiar localStorage
        clearFormFromLocalStorage();

        // Redirigir
        updateState({ loading: false });
        router.push("/dashboard/medico/citas");
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error creating appointment:", error);
        updateState({
          loading: false,
          error: error.message || "Error al crear la cita",
        });
      }
    },
    [state.patients, isTimeValid, router, clearFormFromLocalStorage, updateState]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Cargar pacientes al montar
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (conflictCheckTimeoutRef.current) {
        clearTimeout(conflictCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    checkTimeConflicts,
    loadPatients,
    submitAppointment,
    clearError,
    getMinDate,
    getMinTime,
    isTimeValid,
    saveFormToLocalStorage,
    loadFormFromLocalStorage,
    clearFormFromLocalStorage,
  };
}
