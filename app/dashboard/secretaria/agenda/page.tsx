"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CalendarMain } from "@/components/dashboard/medico/calendar/calendar-main";
import { PatientSummaryModal } from "@/components/dashboard/medico/calendar/patient-summary-modal";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { useSecretaryPermissions } from "@/hooks/use-secretary-permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SecretariaAgendaPage() {
  const router = useRouter();
  const { context, loading: permissionsLoading, hasPermission } = useSecretaryPermissions();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!permissionsLoading && context.currentDoctorId) {
      loadAppointments(context.currentDoctorId);
    }
  }, [context.currentDoctorId, permissionsLoading]);

  const loadAppointments = async (doctorId: string) => {
    try {
      setLoading(true);
      
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
        const formattedAppointments: CalendarAppointment[] = data.map((apt: any) => {
          const isOfflinePatient = !apt.paciente_id && apt.offline_patient_id;
          const patientData = isOfflinePatient ? apt.offline_patient : apt.paciente;

          return {
            id: apt.id,
            paciente_id: apt.paciente_id,
            offline_patient_id: apt.offline_patient_id,
            paciente_nombre: patientData?.nombre_completo || "Paciente",
            paciente_telefono: patientData?.telefono || null,
            paciente_email: patientData?.email || null,
            paciente_avatar: isOfflinePatient ? null : (patientData?.avatar_url || null),
            fecha_hora: apt.fecha_hora,
            fecha_hora_fin: new Date(
              new Date(apt.fecha_hora).getTime() + (apt.duracion_minutos || 30) * 60000
            ).toISOString(),
            duracion_minutos: apt.duracion_minutos || 30,
            motivo: apt.motivo || "Sin motivo",
            status: apt.status || "pendiente",
            tipo_cita: apt.tipo_cita || "presencial",
            color: apt.color || "#3B82F6",
            notas_internas: apt.notas_internas || null,
          };
        });

        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAppointment = () => {
    if (!hasPermission("can_create_appointments")) {
      alert("No tienes permiso para crear citas");
      return;
    }
    router.push("/dashboard/secretaria/agenda/nueva");
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
    if (!hasPermission("can_create_appointments")) {
      alert("No tienes permiso para crear citas");
      return;
    }

    // Validar que no sea fecha/hora pasada
    const now = new Date();
    const selectedDateTime = new Date(date);

    if (hour !== undefined) {
      selectedDateTime.setHours(hour, 0, 0, 0);
    }

    if (selectedDateTime < now) {
      alert("No puedes agendar citas en fechas u horas pasadas");
      return;
    }

    const dateParam = date.toISOString();
    const hourParam = hour !== undefined ? `&hour=${hour}` : "";
    router.push(`/dashboard/secretaria/agenda/nueva?date=${dateParam}${hourParam}`);
  };

  const handleMessage = (appointment: CalendarAppointment) => {
    if (!hasPermission("can_send_messages")) {
      alert("No tienes permiso para enviar mensajes");
      return;
    }
    if (!appointment.paciente_id) {
      alert("No se puede enviar mensajes a pacientes sin cuenta en el sistema");
      return;
    }
    router.push(`/dashboard/secretaria/mensajes?patient=${appointment.paciente_id}`);
  };

  const handleStartVideo = (appointment: CalendarAppointment) => {
    alert("Las secretarias no pueden iniciar videollamadas. Solo el médico puede hacerlo.");
  };

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasPermission("can_view_agenda")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permiso para ver la agenda del médico.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda del Médico</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las citas y disponibilidad
        </p>
      </div>

      <CalendarMain
        appointments={appointments}
        onNewAppointment={handleNewAppointment}
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
        onMessage={handleMessage}
        onStartVideo={handleStartVideo}
        loading={loading}
      />

      <PatientSummaryModal
        appointment={selectedAppointment}
        open={modalOpen}
        onClose={handleCloseModal}
        onMessage={handleMessage}
        onStartVideo={handleStartVideo}
      />
    </div>
  );
}
