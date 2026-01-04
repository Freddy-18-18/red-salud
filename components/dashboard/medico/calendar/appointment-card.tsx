"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, MessageSquare, Eye, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from "./types";

interface AppointmentCardProps {
  appointment: CalendarAppointment;
  onView?: (appointment: CalendarAppointment) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  onView,
  onMessage,
  onStartVideo,
  compact = false,
}: AppointmentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmada: "bg-blue-100 text-blue-800 border-blue-300",
      en_espera: "bg-purple-100 text-purple-800 border-purple-300",
      en_consulta: "bg-indigo-100 text-indigo-800 border-indigo-300",
      completada: "bg-green-100 text-green-800 border-green-300",
      no_asistio: "bg-orange-100 text-orange-800 border-orange-300",
      cancelada: "bg-red-100 text-red-800 border-red-300",
      rechazada: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.pendiente;
  };

  const shouldPulse = (status: string) => {
    return status === "en_espera" || status === "en_consulta";
  };

  const getTypeIcon = (tipo: string) => {
    if (tipo === "telemedicina") return <Video className="h-3 w-3" />;
    if (tipo === "urgencia") return <Clock className="h-3 w-3" />;
    return <MapPin className="h-3 w-3" />;
  };

  if (compact) {
    return (
      <div
        className="p-2 rounded-md border-l-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
        style={{ borderLeftColor: appointment.color }}
        data-tour="appointment-card"
        data-type={appointment.tipo_cita}
        onClick={(e) => {
          e.stopPropagation(); // Evitar que el click se propague al contenedor padre
          onView?.(appointment);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={appointment.paciente_avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(appointment.paciente_nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{appointment.paciente_nombre}</p>
              <p className="text-xs text-gray-500 truncate">{appointment.motivo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getTypeIcon(appointment.tipo_cita)}
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor(appointment.status)} ${shouldPulse(appointment.status) ? 'animate-pulse' : ''}`}
            >
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg border-l-4 hover:shadow-lg transition-shadow bg-white"
      style={{ borderLeftColor: appointment.color }}
      data-tour="appointment-card"
      data-type={appointment.tipo_cita}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={appointment.paciente_avatar || undefined} />
          <AvatarFallback>{getInitials(appointment.paciente_nombre)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{appointment.paciente_nombre}</h3>
              <p className="text-sm text-gray-600">{appointment.motivo}</p>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(appointment.status)} ${shouldPulse(appointment.status) ? 'animate-pulse' : ''}`}
            >
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(appointment.fecha_hora), "HH:mm")} -
              {format(new Date(appointment.fecha_hora_fin), "HH:mm")}
              <span className="text-xs">({appointment.duracion_minutos} min)</span>
            </div>
            <div className="flex items-center gap-1">
              {getTypeIcon(appointment.tipo_cita)}
              {APPOINTMENT_TYPE_LABELS[appointment.tipo_cita]}
            </div>
          </div>

          {appointment.notas_internas && (
            <p className="text-xs text-gray-500 italic mb-3">
              Nota: {appointment.notas_internas}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(appointment);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.(appointment);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Mensaje
            </Button>
            {appointment.tipo_cita === "telemedicina" && appointment.status === "confirmada" && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartVideo?.(appointment);
                }}
              >
                <Video className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
