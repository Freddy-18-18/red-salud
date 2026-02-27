"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Loader2, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  fecha_hora: string;
  paciente?: { id: string; nombre_completo: string; cedula: string } | null;
  offline_patient?: { id: string; nombre_completo: string; cedula: string } | null;
  motivo: string;
  status: string;
}

import { useDoctorAppointments } from "@red-salud/sdk-medico";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth exists for doctorId

export function TodaysAppointmentsWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const { appointments: rawAppointments, loading } = useDoctorAppointments(supabase, user?.id);

  const today = new Date().toISOString().split('T')[0];
  const appointments: Appointment[] = (rawAppointments || [])
    .filter(apt => apt.appointment_date === today)
    .map(apt => ({
      id: apt.id,
      fecha_hora: `${apt.appointment_date}T${apt.appointment_time}`,
      paciente: apt.patient ? {
        id: apt.patient.id,
        nombre_completo: apt.patient.nombre_completo,
        cedula: "" // Cedula not in standard SDK profile yet, but can be added if needed
      } : null,
      motivo: apt.reason || "",
      status: apt.status
    }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completada':
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Completada</Badge>;
      case 'cancelada':
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-700">Cancelada</Badge>;
      case 'confirmada':
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Confirmada</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>;
    }
  };

  const handleStartConsultation = (apt: Appointment) => {
    const patientId = apt.paciente?.id || apt.offline_patient?.id;
    if (patientId) {
      router.push(`/consultorio/pacientes/consulta?appointment_id=${apt.id}&paciente_id=${patientId}&from=today`);
    }
  };

  if (loading) {
    return (
      <Card className="bg-muted/50 border-dashed h-full min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b shrink-0 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Citas de Hoy
          </CardTitle>
          <Badge variant="secondary" className="font-normal text-xs h-6">
            {appointments.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 custom-scrollbar min-h-0">
        {appointments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">Sin citas hoy</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const patientName = apt.paciente?.nombre_completo || apt.offline_patient?.nombre_completo || "Paciente sin nombre";
            const time = format(new Date(apt.fecha_hora), "h:mm a");
            const isCompleted = apt.status === 'completada' || apt.status === 'completed';

            return (
              <div key={apt.id} className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center h-10 w-12 rounded bg-primary/10 text-primary text-xs font-bold">
                    <span>{time}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-none">{patientName}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{apt.motivo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(apt.status)}
                  {!isCompleted && apt.status !== 'cancelada' && apt.status !== 'cancelled' && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleStartConsultation(apt)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
