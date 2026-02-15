"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UnifiedCalendar } from "@/components/dashboard/medico/calendar/unified-calendar";
import { PatientSummaryModal } from "@/components/dashboard/medico/calendar/patient-summary-modal";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { startOfMonth, endOfMonth, addMonths, isSameDay } from "date-fns";
import { Toast, type ToastType } from "@red-salud/ui";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "@red-salud/core/hooks";
import { tauriApiService } from "@/lib/services/tauri-api-service";
import { useAutoNoShow } from "@/hooks/use-auto-no-show";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import {
  changeAppointmentStatus,
  isTransitionAllowed,
  type AppointmentStatus,
} from "@/lib/services/appointment-status";
import { CalendarFilters } from "@/components/dashboard/medico/calendar/calendar-filters";
import { useDragAndDrop } from "@/hooks/use-drag-drop";

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
  location_id: string | null;
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
  dental_details: {
    chair_id: string | null;
    procedure_code: string | null;
    procedure_name: string | null;
    tooth_numbers: number[];
    surfaces: string[];
    requires_anesthesia: boolean;
    estimated_cost: number | null;
  } | null;
}

interface AgendaTabProps {
  selectedOfficeId: string | null;
  specialtyName?: string;
}

export function AgendaTab({ selectedOfficeId }: AgendaTabProps) {
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

  // Google Calendar integration
  const { syncAppointment } = useGoogleCalendar();

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  // Drag & Drop handlers
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(
    appointments,
    setAppointments,
    (message) => showToast(message, "error"),
    (message) => showToast(message, "success")
  );

  // Handlers
  const handleNewAppointment = () => {
    if (!selectedOfficeId) {
      showToast("Debes seleccionar un consultorio específico arriba para crear una cita", "warning");
      return;
    }

    const params = new URLSearchParams();
    if (selectedOfficeId) {
      params.append("officeId", selectedOfficeId);
    }
    const queryString = params.toString();
    router.push(`/dashboard/medico/citas/nueva${queryString ? `?${queryString}` : ""}`);
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
    const now = new Date();
    const selectedDateTime = new Date(date);

    if (hour !== undefined) {
      selectedDateTime.setHours(hour, 0, 0, 0);
    }

    if (!selectedOfficeId) {
      showToast("Debes seleccionar un consultorio específico para agendar en esta hora", "warning");
      return;
    }

    if (selectedDateTime < now) {
      showToast("No puedes agendar citas en fechas u horas pasadas", "warning");
      return;
    }

    // Check if slot is taken
    const isSlotTaken = appointments.some(apt => {
      if (selectedOfficeId && apt.location_id && apt.location_id !== selectedOfficeId) {
        return false;
      }

      const aptDate = new Date(apt.fecha_hora);
      const aptEndDate = new Date(apt.fecha_hora_fin);
      const selectedEndTime = new Date(selectedDateTime.getTime() + (apt.duracion_minutos || 30) * 60000);

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

    const dateParam = date.toISOString();
    const hourParam = hour !== undefined ? `&hour=${hour}` : "";
    const officeParam = selectedOfficeId ? `&officeId=${selectedOfficeId}` : "";

    router.push(`/dashboard/medico/citas/nueva?date=${dateParam}${hourParam}${officeParam}`);
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

  const handleStatusChange = useCallback(
    async (appointment: CalendarAppointment, newStatus: AppointmentStatus) => {
      if (!doctorIdRef.current) return;

      if (!isTransitionAllowed(appointment.status, newStatus, "medico")) {
        showToast("Transición de estado no permitida", "error");
        return;
      }

      const result = await changeAppointmentStatus(
        appointment.id,
        newStatus,
        doctorIdRef.current
      );

      if (result.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointment.id ? { ...a, status: newStatus } : a))
        );
        showToast(`Estado cambiado a "${newStatus.replace("_", " ")}"`, "success");

        const updatedAppointment = { ...appointment, status: newStatus };
        syncAppointment(updatedAppointment).catch((error) => {
          console.error("Error syncing with Google Calendar:", error);
        });
      } else {
        showToast(result.error || "Error al cambiar estado", "error");
      }
    },
    [showToast, syncAppointment]
  );

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
        location_id: aptData.location_id as string | null,
      };
    } catch (error) {
      console.error('Error formatting appointment:', error);
      return null;
    }
  }, []);

  const setupRealtimeSubscription = useCallback((doctorId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

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
              
              syncAppointment(newAppointment).catch((error) => {
                console.error("Error syncing new appointment with Google Calendar:", error);
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAppointment = await formatAppointment(payload.new);
            if (updatedAppointment) {
              setAppointments(prev =>
                prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
              );
              showToast('Cita actualizada', 'info');
              
              syncAppointment(updatedAppointment).catch((error) => {
                console.error("Error syncing updated appointment with Google Calendar:", error);
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            showToast('Cita eliminada', 'info');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [formatAppointment, syncAppointment]);

  const appointmentsRef = useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  const loadAppointments = useCallback(async (doctorId: string) => {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(addMonths(new Date(), 1));
    const cacheKey = `calendar_appointments_${doctorId}`;

    try {
      const cachedData = await tauriApiService.getOfflineData<CalendarAppointment[]>(cacheKey);
      if (cachedData) {
        setAppointments(cachedData);
        console.log("Loaded appointments from offline cache");
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn("No auth token available for sync");
        return;
      }

      const selectQuery = "id,paciente_id,offline_patient_id,fecha_hora,duracion_minutos,motivo,status,tipo_cita,color,notas_internas,location_id,paciente:profiles!appointments_paciente_id_fkey(nombre_completo,telefono,email,avatar_url),offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo,telefono,email),dental_details:dental_appointment_details(chair_id,procedure_code,procedure_name,tooth_numbers,surfaces,requires_anesthesia,estimated_cost)";

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

      if (data && Array.isArray(data)) {
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
            paciente_avatar: isOfflinePatient ? null : (patientData as { avatar_url?: string | null })?.avatar_url || null,
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
            location_id: apt.location_id || null,
            // Campos dentales
            dental_chair_id: apt.dental_details?.chair_id || null,
            dental_procedure_code: apt.dental_details?.procedure_code || null,
            dental_procedure_name: apt.dental_details?.procedure_name || null,
            dental_tooth_numbers: apt.dental_details?.tooth_numbers || [],
            dental_surfaces: apt.dental_details?.surfaces || [],
            dental_requires_anesthesia: apt.dental_details?.requires_anesthesia || false,
            dental_estimated_cost: apt.dental_details?.estimated_cost || null,
          };
        });

        console.log(`✅ Synced ${formattedAppointments.length} appointments from server`);
        setAppointments(formattedAppointments);
        setLoading(false);
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

  // Auto-marcar citas vencidas como no_asistio
  useAutoNoShow({
    appointments,
    enabled: !loading && appointments.length > 0,
    onUpdated: (updatedIds) => {
      if (updatedIds.length > 0) {
        showToast(
          `${updatedIds.length} cita(s) marcada(s) como "No Asistió" automáticamente`,
          "info"
        );
        if (doctorIdRef.current) loadAppointments(doctorIdRef.current);
      }
    },
  });

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(apt.status)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(apt.tipo_cita)) return false;
    if (selectedOfficeId && apt.location_id && apt.location_id !== selectedOfficeId) return false;
    return true;
  });

  console.log("🔍 Filtered appointments for calendar:", {
    total: appointments.length,
    filtered: filteredAppointments.length,
    selectedOfficeId,
    selectedStatuses,
    selectedTypes
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex-none px-6 pt-4 pb-3">
        <div className="glass px-4 py-2 rounded-lg inline-block">
          <CalendarFilters
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            selectedTypes={selectedTypes}
            onTypeChange={setSelectedTypes}
          />
        </div>
      </div>

      {/* Calendar - ocupa todo el espacio restante */}
      <div className="flex-1 min-h-0 px-6 pb-6">
        <div className="h-full rounded-xl border border-border/50 flex flex-col">
          <UnifiedCalendar
            appointments={filteredAppointments}
            onNewAppointment={handleNewAppointment}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
            onMessage={handleMessage}
            onStartVideo={handleStartVideo}
            onStatusChange={handleStatusChange}
            loading={loading}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          />
        </div>
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
  );
}

