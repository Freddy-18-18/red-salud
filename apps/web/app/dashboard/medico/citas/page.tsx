
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { UnifiedCalendar } from "@/components/dashboard/medico/calendar/unified-calendar";
import { PatientSummaryModal } from "@/components/dashboard/medico/calendar/patient-summary-modal";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { startOfMonth, endOfMonth, addMonths, isSameDay } from "date-fns";
import { Toast, type ToastType } from "@red-salud/ui";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "@red-salud/core/hooks";
import { tauriApiService } from "@/lib/services/tauri-api-service";

interface RawAppointment {
  id: string;
  paciente_id: string | null;
  offline_patient_id: string | null;
  fecha_hora: string;
  duracion_minutos: number | null;
  motivo: string | null;
  status: string | null;
  tipo_cita: string | null;
  color: string | null;
  notas_internas: string | null;
  paciente: {
    nombre_completo: string;
    telefono: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  offline_patient: {
    nombre_completo: string;
    telefono: string | null;
    email: string | null;
  } | null;
}


import { Suspense } from "react";

import { CalendarFilters } from "@/components/dashboard/medico/calendar/calendar-filters";

function CitasContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const doctorIdRef = useRef<string | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  // Handlers - deben declararse antes de los hooks customizados
  const handleNewAppointment = () => {
    router.push("/dashboard/medico/citas/nueva");
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    // Validar que no sea fecha/hora pasada
    const now = new Date();
    const selectedDateTime = new Date(date);

    if (hour !== undefined) {
      selectedDateTime.setHours(hour, 0, 0, 0);
    }

    // Check for double booking
    if (selectedDateTime < now) {
      showToast("No puedes agendar citas en fechas u horas pasadas", "warning");
      return;
    }

    // Check if slot is taken (basic check)
    const isSlotTaken = appointments.some(apt => {
      const aptDate = new Date(apt.fecha_hora);
      const aptEndDate = new Date(apt.fecha_hora_fin);
      const selectedEndTime = new Date(selectedDateTime.getTime() + (apt.duracion_minutos || 30) * 60000); // Assuming default 30 min for new slot check

      // Check for overlap:
      // (StartA < EndB) && (EndA > StartB)
      return (
        isSameDay(aptDate, selectedDateTime) &&
        selectedDateTime.getTime() < aptEndDate.getTime() &&
        selectedEndTime.getTime() > aptDate.getTime()
      );
    });

    if (isSlotTaken) {
      showToast("Ya existe una cita en este horario o se superpone con otra. Por favor selecciona otro.", "warning");
      return;
    }

    // Si es fecha/hora pasada, no permitir
    if (selectedDateTime < now) {
      showToast("No puedes agendar citas en fechas u horas pasadas", "warning");
      return;
    }

    const dateParam = date.toISOString();
    const hourParam = hour !== undefined ? `&hour=${hour}` : "";
    router.push(`/dashboard/medico/citas/nueva?date=${dateParam}${hourParam}`);
  };

  const handleMessage = (appointment: CalendarAppointment) => {
    if (!appointment.paciente_id) {
      showToast("No se puede enviar mensajes a pacientes sin cuenta en el sistema", "warning");
      return;
    }
    router.push(`/dashboard/medico/mensajeria?patient=${appointment.paciente_id}`);
  };

  const handleStartVideo = (appointment: CalendarAppointment) => {
    if (!appointment.paciente_id) {
      showToast("No se puede iniciar videollamada con pacientes sin cuenta en el sistema", "warning");
      return;
    }
    router.push(`/dashboard/medico/telemedicina/${appointment.id}`);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: DEFAULT_SHORTCUTS.NEW_APPOINTMENT.key,
      handler: handleNewAppointment,
      description: DEFAULT_SHORTCUTS.NEW_APPOINTMENT.description,
    },
  ]);

  const formatAppointment = useCallback(async (aptData: Record<string, unknown>): Promise<CalendarAppointment | null> => {
    try {
      const isOfflinePatient = !aptData.paciente_id && aptData.offline_patient_id;

      let patientData = null;
      if (isOfflinePatient) {
        const { data } = await supabase
          .from('offline_patients')
          .select('nombre_completo, telefono, email')
          .eq('id', aptData.offline_patient_id)
          .single();
        patientData = data;
      } else if (aptData.paciente_id) {
        const { data } = await supabase
          .from('profiles')
          .select('nombre_completo, telefono, email, avatar_url')
          .eq('id', aptData.paciente_id)
          .single();
        patientData = data;
      }

      return {
        id: aptData.id as string,
        paciente_id: aptData.paciente_id as string | null,
        offline_patient_id: aptData.offline_patient_id as string | null,
        paciente_nombre: patientData?.nombre_completo || "Paciente",
        paciente_telefono: patientData?.telefono,
        paciente_email: patientData?.email,
        paciente_avatar: isOfflinePatient ? null : (patientData as { avatar_url?: string | null } | null)?.avatar_url || null,
        fecha_hora: aptData.fecha_hora as string,
        fecha_hora_fin: new Date(
          new Date(aptData.fecha_hora as string).getTime() + ((aptData.duracion_minutos as number) || 30) * 60000
        ).toISOString(),
        duracion_minutos: aptData.duracion_minutos as number || 30,
        motivo: aptData.motivo as string,
        status: aptData.status as CalendarAppointment['status'],
        tipo_cita: aptData.tipo_cita as CalendarAppointment['tipo_cita'],
        color: aptData.color as string,
        notas_internas: aptData.notas_internas as string | null,
      };
    } catch (error) {
      console.error('Error formatting appointment:', error);
      return null;
    }
  }, []);

  const setupRealtimeSubscription = useCallback((doctorId: string) => {
    // Limpiar suscripción anterior si existe
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    // Crear nueva suscripción
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `medico_id=eq.${doctorId}`
        },
        async (payload) => {
          console.log('Realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            const newAppointment = await formatAppointment(payload.new);
            if (newAppointment) {
              setAppointments(prev => [...prev, newAppointment]);
              showToast('Nueva cita agregada', 'success');
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAppointment = await formatAppointment(payload.new);
            if (updatedAppointment) {
              setAppointments(prev =>
                prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
              );
              showToast('Cita actualizada', 'info');
            }
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            showToast('Cita eliminada', 'info');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [formatAppointment]);

  const appointmentsRef = useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  const loadAppointments = useCallback(async (doctorId: string) => {
    // Cargar citas del mes actual y siguiente
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(addMonths(new Date(), 1));
    const cacheKey = `calendar_appointments_${doctorId}`;

    try {
      // 1. Intentar cargar caché offline primero para mostrar datos inmediatos
      const cachedData = await tauriApiService.getOfflineData<CalendarAppointment[]>(cacheKey);
      if (cachedData) {
        setAppointments(cachedData);
        console.log("Loaded appointments from offline cache");
      }

      // 2. Obtener sesión para token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn("No auth token available for sync");
        return;
      }

      // 3. Consulta REST a Supabase a través del proxy de Tauri
      const selectQuery = "id,paciente_id,offline_patient_id,fecha_hora,duracion_minutos,motivo,status,tipo_cita,color,notas_internas,paciente:profiles!appointments_paciente_id_fkey(nombre_completo,telefono,email,avatar_url),offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo,telefono,email)";

      const queryParams = new URLSearchParams({
        select: selectQuery,
        medico_id: `eq.${doctorId}`,
        fecha_hora: `gte.${startDate.toISOString()}`,
      });
      const queryString = `${queryParams.toString()}&fecha_hora=lte.${endDate.toISOString()}&order=fecha_hora.asc`;

      const data = await tauriApiService.supabaseGet<RawAppointment[]>(
        `/rest/v1/appointments?${queryString}`,
        token
      );

      if (data) {
        const formattedAppointments: CalendarAppointment[] = data.map((apt) => {
          const isOfflinePatient = !apt.paciente_id && apt.offline_patient_id;
          const patientData = isOfflinePatient ? apt.offline_patient : apt.paciente;

          return {
            id: apt.id,
            paciente_id: apt.paciente_id,
            offline_patient_id: apt.offline_patient_id,
            paciente_nombre: patientData?.nombre_completo || "Paciente",
            paciente_telefono: patientData?.telefono || null,
            paciente_email: patientData?.email || null,
            paciente_avatar: isOfflinePatient ? null : (patientData as any)?.avatar_url || null,
            fecha_hora: apt.fecha_hora,
            fecha_hora_fin: new Date(
              new Date(apt.fecha_hora).getTime() + (apt.duracion_minutos || 30) * 60000
            ).toISOString(),
            duracion_minutos: apt.duracion_minutos || 30,
            motivo: apt.motivo || "Sin motivo",
            status: apt.status as CalendarAppointment['status'] || "pendiente",
            tipo_cita: apt.tipo_cita as CalendarAppointment['tipo_cita'] || "presencial",
            color: apt.color || "#3B82F6",
            notas_internas: apt.notas_internas || null,
          };
        });

        console.log(`Synced ${formattedAppointments.length} appointments from server`);
        setAppointments(formattedAppointments);

        await tauriApiService.saveOfflineData(cacheKey, formattedAppointments);
      }
    } catch (error) {
      console.error("Error syncing appointments:", error);
      if (!appointmentsRef.current.length) {
        showToast("Error de conexión. Mostrando datos offline si están disponibles.", "error");
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      doctorIdRef.current = user.id;
      await loadAppointments(user.id);
      setupRealtimeSubscription(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [router, loadAppointments, setupRealtimeSubscription]);

  useEffect(() => {
    loadData();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [loadData]);

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(apt.status)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(apt.tipo_cita)) return false;
    return true;
  });

  // Updated JSX with Glassmorphism
  return (
    <VerificationGuard>
      <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-shrink-0">
          <div className="glass px-4 py-2 rounded-lg">
            <CalendarFilters
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
              selectedTypes={selectedTypes}
              onTypeChange={setSelectedTypes}
            />
          </div>
        </div>

        {/* Calendario unificado - ocupa todo el espacio disponible */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden shadow-glow border border-white/20 glass-card">
          <UnifiedCalendar
            appointments={filteredAppointments}
            onNewAppointment={handleNewAppointment}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
            onMessage={handleMessage}
            onStartVideo={handleStartVideo}
            loading={loading}
          />
        </div>

        {/* Modal de resumen del paciente */}
        <PatientSummaryModal
          appointment={selectedAppointment}
          open={modalOpen}
          onClose={handleCloseModal}
          onMessage={handleMessage}
          onStartVideo={handleStartVideo}
        />

        {/* Toast notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </VerificationGuard>
  );
}

export default function DoctorCitasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <CitasContent />
    </Suspense>
  );
}
