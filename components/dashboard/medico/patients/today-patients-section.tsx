"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarClock, 
  Clock, 
  Play, 
  CheckCircle2, 
  UserX,
  Loader2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";

// Funciones locales para evitar problemas de importación
async function changeAppointmentStatus(
  appointmentId: string,
  newStatus: string,
  userId: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase.rpc("change_appointment_status", {
      p_appointment_id: appointmentId,
      p_new_status: newStatus,
      p_user_id: userId,
      p_reason: reason || null,
    });

    if (error) {
      console.error("Error changing appointment status:", error);
      return { success: false, error: error.message };
    }

    return data as { success: boolean; error?: string };
  } catch (err: any) {
    console.error("Exception changing appointment status:", err);
    return { success: false, error: err.message };
  }
}

async function getTodayAppointments(doctorId: string, date?: Date) {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("get_today_appointments", {
      p_doctor_id: doctorId,
      p_date: dateStr,
    });

    if (error) {
      console.error("Error getting today appointments:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("Exception getting today appointments:", err);
    return { data: null, error: err };
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmada: "bg-blue-100 text-blue-800 border-blue-300",
    en_espera: "bg-purple-100 text-purple-800 border-purple-300",
    en_consulta: "bg-indigo-100 text-indigo-800 border-indigo-300",
    completada: "bg-green-100 text-green-800 border-green-300",
    no_asistio: "bg-orange-100 text-orange-800 border-orange-300",
    cancelada: "bg-red-100 text-red-800 border-red-300",
    rechazada: "bg-gray-100 text-gray-800 border-gray-300",
  };
  return colors[status] || colors.pendiente;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    en_espera: "En Espera",
    en_consulta: "En Consulta",
    completada: "Completada",
    no_asistio: "No Asistió",
    cancelada: "Cancelada",
    rechazada: "Rechazada",
  };
  return labels[status] || status;
}
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TodayAppointment {
  id: string;
  paciente_id: string | null;
  offline_patient_id: string | null;
  paciente_nombre: string;
  paciente_avatar: string | null;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
  status: string;
  tipo_cita: string;
  started_at: string | null;
  completed_at: string | null;
  patient_arrived_at: string | null;
}

interface TodayPatientsSectionProps {
  doctorId: string;
}

export function TodayPatientsSection({ doctorId }: TodayPatientsSectionProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTodayAppointments();
    // Recargar cada 30 segundos
    const interval = setInterval(loadTodayAppointments, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const loadTodayAppointments = async () => {
    try {
      const { data, error } = await getTodayAppointments(doctorId);
      if (error) throw error;
      setAppointments(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading today appointments:", err);
      setError("Error al cargar las citas del día");
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (appointment: TodayAppointment) => {
    setActionLoading(appointment.id);
    try {
      // Cambiar estado a "en_consulta"
      const result = await changeAppointmentStatus(
        appointment.id,
        "en_consulta",
        doctorId
      );

      if (!result.success) {
        throw new Error(result.error || "Error al iniciar consulta");
      }

      // Redirigir al editor de consulta
      const params = new URLSearchParams({
        appointment_id: appointment.id,
        paciente_id: appointment.paciente_id || appointment.offline_patient_id || "",
        from: "today",
      });

      router.push(`/dashboard/medico/pacientes/consulta?${params.toString()}`);
    } catch (err: any) {
      console.error("Error starting consultation:", err);
      alert(err.message || "Error al iniciar la consulta");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkArrival = async (appointment: TodayAppointment) => {
    setActionLoading(appointment.id);
    try {
      const result = await changeAppointmentStatus(
        appointment.id,
        "en_espera",
        doctorId
      );

      if (!result.success) {
        throw new Error(result.error || "Error al marcar llegada");
      }

      await loadTodayAppointments();
    } catch (err: any) {
      console.error("Error marking arrival:", err);
      alert(err.message || "Error al marcar la llegada");
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActionButton = (appointment: TodayAppointment) => {
    const isLoading = actionLoading === appointment.id;

    switch (appointment.status) {
      case "confirmada":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkArrival(appointment)}
            disabled={isLoading}
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Clock className="h-4 w-4 mr-1" />
                Marcar Llegada
              </>
            )}
          </Button>
        );
      case "en_espera":
        return (
          <Button
            size="sm"
            onClick={() => handleStartConsultation(appointment)}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Iniciar Consulta
              </>
            )}
          </Button>
        );
      case "en_consulta":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStartConsultation(appointment)}
            disabled={isLoading}
            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
          >
            Continuar Consulta
          </Button>
        );
      case "completada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Pacientes de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Pacientes de Hoy
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {appointments.length} {appointments.length === 1 ? "paciente" : "pacientes"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No hay pacientes programados para hoy
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`
                  flex items-center justify-between p-4 border rounded-lg 
                  transition-all hover:shadow-md
                  ${appointment.status === "en_consulta" ? "bg-indigo-50 border-indigo-200" : ""}
                  ${appointment.status === "en_espera" ? "bg-purple-50 border-purple-200" : ""}
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={appointment.paciente_avatar || undefined} />
                    <AvatarFallback className="text-sm">
                      {getInitials(appointment.paciente_nombre)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {appointment.paciente_nombre}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(appointment.status as any)} ${
                          (appointment.status === "en_espera" || appointment.status === "en_consulta") 
                            ? "animate-pulse" 
                            : ""
                        }`}
                      >
                        {getStatusLabel(appointment.status as any)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.fecha_hora), "HH:mm", { locale: es })}
                      </span>
                      <span className="truncate">{appointment.motivo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-3">
                  {getActionButton(appointment)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
