
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { CalendarMain } from "@/components/dashboard/medico/calendar/calendar-main";
import { PatientSummaryModal } from "@/components/dashboard/medico/calendar/patient-summary-modal";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { startOfMonth, endOfMonth, addMonths, addWeeks, subWeeks, isSameDay, format, addDays, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Toast, type ToastType } from "@/components/ui/toast";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useDragAndDrop } from "@/hooks/use-drag-drop";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MessageCircle, HelpCircle } from "lucide-react";
import { CalendarViewSelector, type CalendarView } from "@/components/dashboard/medico/calendar/calendar-view-selector";
import { SessionTimer } from "@/components/auth";


export default function DoctorCitasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'list'>('week');
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const doctorIdRef = useRef<string | null>(null);

  // Leer parámetros de URL para navegación desde widget
  const searchParams = useSearchParams();
  const urlDate = searchParams.get('date');
  const urlView = searchParams.get('view');

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

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
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

  // Drag & Drop
  const { dragState, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } = useDragAndDrop(
    (updatedAppointment) => {
      setAppointments(prev =>
        prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
      );
      showToast('Cita reprogramada exitosamente', 'success');
    },
    (error) => showToast(error, 'error')
  );

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: DEFAULT_SHORTCUTS.NEW_APPOINTMENT.key,
      handler: handleNewAppointment,
      description: DEFAULT_SHORTCUTS.NEW_APPOINTMENT.description,
    },
    {
      key: DEFAULT_SHORTCUTS.TODAY.key,
      handler: () => setCurrentDate(new Date()),
      description: DEFAULT_SHORTCUTS.TODAY.description,
    },
    {
      key: DEFAULT_SHORTCUTS.NEXT_WEEK.key,
      handler: () => setCurrentDate(prev => addWeeks(prev, 1)),
      description: DEFAULT_SHORTCUTS.NEXT_WEEK.description,
    },
    {
      key: DEFAULT_SHORTCUTS.PREV_WEEK.key,
      handler: () => setCurrentDate(prev => subWeeks(prev, 1)),
      description: DEFAULT_SHORTCUTS.PREV_WEEK.description,
    },
    {
      key: DEFAULT_SHORTCUTS.DAY_VIEW.key,
      handler: () => setView('day'),
      description: DEFAULT_SHORTCUTS.DAY_VIEW.description,
    },
    {
      key: DEFAULT_SHORTCUTS.WEEK_VIEW.key,
      handler: () => setView('week'),
      description: DEFAULT_SHORTCUTS.WEEK_VIEW.description,
    },
    {
      key: DEFAULT_SHORTCUTS.MONTH_VIEW.key,
      handler: () => setView('month'),
      description: DEFAULT_SHORTCUTS.MONTH_VIEW.description,
    },
    {
      key: DEFAULT_SHORTCUTS.LIST_VIEW.key,
      handler: () => setView('list'),
      description: DEFAULT_SHORTCUTS.LIST_VIEW.description,
    },
  ]);

  // Efecto para establecer fecha y vista desde URL
  useEffect(() => {
    // Si hay fecha en la URL, establecerla
    if (urlDate) {
      // IMPORTANTE: Parsear la fecha manualmente para evitar problemas de timezone
      // new Date("YYYY-MM-DD") interpreta como UTC, causando desfase de 1 día
      const dateParts = urlDate.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Los meses son 0-indexed
        const day = parseInt(dateParts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          setCurrentDate(parsedDate);
        }
      }
    }
    // Si hay vista en la URL, establecerla
    if (urlView && ['day', 'week', 'month', 'list'].includes(urlView)) {
      setView(urlView as 'day' | 'week' | 'month' | 'list');
    }
  }, [urlDate, urlView]);

  useEffect(() => {
    loadData();

    // Cleanup al desmontar
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
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
  };

  const loadAppointments = async (doctorId: string) => {
    // Cargar citas del mes actual y siguiente
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(addMonths(new Date(), 1));

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        paciente_id,
        offline_patient_id,
        fecha_hora,
        duracion_minutos,
        motivo,
        status,
        tipo_cita,
        color,
        notas_internas,
        paciente:profiles!appointments_paciente_id_fkey(
          nombre_completo,
          telefono,
          email,
          avatar_url
        ),
        offline_patient:offline_patients!appointments_offline_patient_id_fkey(
          nombre_completo,
          telefono,
          email
        )
      `)
      .eq("medico_id", doctorId)
      .gte("fecha_hora", startDate.toISOString())
      .lte("fecha_hora", endDate.toISOString())
      .order("fecha_hora", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
      return;
    }

    if (data) {
      const formattedAppointments: CalendarAppointment[] = data.map((apt: Record<string, unknown>) => {
        // Determinar si es paciente registrado u offline
        const isOfflinePatient = !apt.paciente_id && apt.offline_patient_id;
        const patientData = isOfflinePatient ? apt.offline_patient : apt.paciente;

        return {
          id: apt.id as string,
          paciente_id: apt.paciente_id as string | null,
          offline_patient_id: apt.offline_patient_id as string | null,
          paciente_nombre: (patientData as Record<string, unknown> & { nombre_completo?: string })?.nombre_completo || "Paciente",
          paciente_telefono: (patientData as Record<string, unknown> & { telefono?: string })?.telefono || null,
          paciente_email: (patientData as Record<string, unknown> & { email?: string })?.email || null,
          paciente_avatar: isOfflinePatient ? null : ((patientData as Record<string, unknown> & { avatar_url?: string })?.avatar_url || null),
          fecha_hora: apt.fecha_hora as string,
          fecha_hora_fin: new Date(
            new Date(apt.fecha_hora as string).getTime() + ((apt.duracion_minutos as number) || 30) * 60000
          ).toISOString(),
          duracion_minutos: (apt.duracion_minutos as number) || 30,
          motivo: (apt.motivo as string) || "Sin motivo",
          status: (apt.status as "pendiente" | "confirmada" | "en_espera" | "en_consulta" | "completada" | "no_asistio" | "cancelada" | "rechazada") || "pendiente",
          tipo_cita: (apt.tipo_cita as "presencial" | "telemedicina" | "urgencia" | "seguimiento" | "primera_vez") || "presencial",
          color: (apt.color as string) || "#3B82F6",
          notas_internas: (apt.notas_internas as string) || null,
        };
      });

      console.log(`Loaded ${formattedAppointments.length} appointments (${data.filter((a: Record<string, unknown>) => a.offline_patient_id).length} offline patients)`);
      setAppointments(formattedAppointments);
    }
  };

  const setupRealtimeSubscription = (doctorId: string) => {
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
            // Nueva cita creada
            const newAppointment = await formatAppointment(payload.new);
            if (newAppointment) {
              setAppointments(prev => [...prev, newAppointment]);
              showToast('Nueva cita agregada', 'success');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Cita actualizada
            const updatedAppointment = await formatAppointment(payload.new);
            if (updatedAppointment) {
              setAppointments(prev =>
                prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
              );
              showToast('Cita actualizada', 'info');
            }
          } else if (payload.eventType === 'DELETE') {
            // Cita eliminada
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            showToast('Cita eliminada', 'info');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const formatAppointment = async (aptData: Record<string, unknown>): Promise<CalendarAppointment | null> => {
    try {
      // Determinar si es paciente registrado u offline
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
        paciente_avatar: isOfflinePatient ? null : (patientData as Record<string, unknown> & { avatar_url?: string })?.avatar_url || null,
        fecha_hora: aptData.fecha_hora as string,
        fecha_hora_fin: aptData.fecha_hora_fin as string,
        duracion_minutos: aptData.duracion_minutos as number,
        motivo: aptData.motivo as string,
        status: aptData.status as "pendiente" | "confirmada" | "completada" | "cancelada",
        tipo_cita: aptData.tipo_cita as "presencial" | "telemedicina" | "urgencia" | "seguimiento" | "primera_vez",
        color: aptData.color as string,
        notas_internas: aptData.notas_internas as string | null,
      };
    } catch (error) {
      console.error('Error formatting appointment:', error);
      return null;
    }
  };

  return (
    <VerificationGuard>
      <div className="flex flex-col h-screen overflow-hidden" data-tour="calendar-section">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-4 py-6 sm:px-6 border-b border-gray-200/60 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
                {!loading && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                    data-tour="realtime-indicator"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    En vivo
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Gestiona tus citas y disponibilidad • Actualizaciones en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Integrated Tools - Timer, Chat & Tour */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border-l border-gray-200/60 pl-3">
                  <SessionTimer showWarning={true} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-blue-600"
                    data-tour="chatbot-button"
                    onClick={() => document.dispatchEvent(new Event('toggle-chat'))}
                    title="Abrir Chatbot"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-purple-600"
                    onClick={() => document.dispatchEvent(new Event('start-tour'))}
                    title="Iniciar Tour"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar - Flexible height */}
        <div className="flex-1 min-h-0 px-4 py-6 sm:px-6" data-tour="calendar-grid">
          <CalendarMain
            appointments={appointments}
            onNewAppointment={handleNewAppointment}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
            onMessage={handleMessage}
            onStartVideo={handleStartVideo}
            loading={loading}
            currentDate={currentDate}
            view={view}
            onDateChange={setCurrentDate}
            onViewChange={setView}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          />
        </div>

        <PatientSummaryModal
          appointment={selectedAppointment}
          open={modalOpen}
          onClose={handleCloseModal}
          onMessage={handleMessage}
          onStartVideo={handleStartVideo}
        />

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div >
    </VerificationGuard >
  );
}
