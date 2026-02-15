"use client";

import { Badge } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import {
  Video,
  MessageSquare,
  Eye,
  Clock,
  MapPin,
  CheckCircle,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import type { CalendarAppointment } from "./types";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from "./types";
import {
  getAvailableTransitions,
  TERMINAL_STATUSES,
  type AppointmentStatus,
} from "@/lib/services/appointment-status";

/** Map icon name → Lucide component for transition buttons */
const TRANSITION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  UserX,
};

interface AppointmentCardProps {
  appointment: CalendarAppointment;
  onView?: (appointment: CalendarAppointment) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  /** Called when the user clicks a state-machine action button */
  onStatusChange?: (appointment: CalendarAppointment, newStatus: AppointmentStatus) => void;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  onView,
  onMessage,
  onStartVideo,
  onStatusChange,
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
      pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmada: "bg-blue-50 text-blue-700 border-blue-200",
      en_espera: "bg-purple-50 text-purple-700 border-purple-200",
      en_consulta: "bg-indigo-50 text-indigo-700 border-indigo-200",
      completada: "bg-green-50 text-green-700 border-green-200",
      no_asistio: "bg-orange-50 text-orange-700 border-orange-200",
      cancelada: "bg-red-50 text-red-700 border-red-200",
      rechazada: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.pendiente;
  };

  const shouldPulse = (status: string) => {
    return status === "en_espera" || status === "en_consulta";
  };

  const getTypeIcon = (tipo: string) => {
    if (tipo === "telemedicina") return <Video className="h-3.5 w-3.5" />;
    if (tipo === "urgencia") return <Clock className="h-3.5 w-3.5" />;
    return <MapPin className="h-3.5 w-3.5" />;
  };

  if (compact) {
    return (
      <div
        className="p-2 rounded-md border-l-4 hover:shadow-md transition-shadow cursor-pointer bg-card group"
        style={{ borderLeftColor: appointment.color }}
        data-tour="appointment-card"
        data-type={appointment.tipo_cita}
        onClick={(e) => {
          e.stopPropagation();
          onView?.(appointment);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0 ring-1 ring-border group-hover:ring-primary/50 transition-all">
              <AvatarImage src={appointment.paciente_avatar || undefined} />
              <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                {getInitials(appointment.paciente_nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground leading-tight">{appointment.paciente_nombre}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Card Layout (Vertical)
  return (
    <div
      className="group flex flex-col bg-card rounded-xl border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 h-full"
      data-tour="appointment-card"
      data-type={appointment.tipo_cita}
    >
      {/* Top Decoration Line */}
      <div className="h-1.5 w-full" style={{ backgroundColor: appointment.color }} />

      <div className="p-4 flex flex-col flex-1 gap-4">
        {/* Header: User & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
              <AvatarImage src={appointment.paciente_avatar || undefined} className="object-cover" />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {getInitials(appointment.paciente_nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {appointment.paciente_nombre}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {appointment.motivo}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 h-fit border flex-shrink-0 ${getStatusColor(appointment.status)} ${shouldPulse(appointment.status) ? 'animate-pulse' : ''}`}
          >
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            <span className="font-medium text-foreground">
              {format(new Date(appointment.fecha_hora), "HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="tabular-nums opacity-80">{appointment.duracion_minutos} min</span>
          </div>

          <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-border/50">
            {getTypeIcon(appointment.tipo_cita)}
            <span className="capitalize truncate">{APPOINTMENT_TYPE_LABELS[appointment.tipo_cita]}</span>
          </div>
        </div>

        {/* Internal Note (if any) */}
        {appointment.notas_internas && (
          <div className="text-[10px] text-muted-foreground bg-yellow-50/50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/30 line-clamp-2">
            <span className="font-medium text-yellow-700 dark:text-yellow-500 mr-1">Nota:</span>
            {appointment.notas_internas}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(appointment);
            }}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(appointment);
            }}
            title="Mensaje"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {/* State-machine action buttons */}
          {onStatusChange &&
            !TERMINAL_STATUSES.has(appointment.status) &&
            getAvailableTransitions(appointment.status, "medico")
              .filter((t) => t.to !== "cancelada" && t.to !== "rechazada" && t.to !== "no_asistio")
              .slice(0, 1) // Only the primary next action
              .map((transition) => {
                const Icon = TRANSITION_ICON_MAP[transition.icon];
                return (
                  <Button
                    key={transition.to}
                    size="sm"
                    className={`h-7 px-3 text-xs shadow-sm ${transition.color}`}
                    title={transition.description}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment, transition.to);
                    }}
                  >
                    {Icon && <Icon className="h-3 w-3 mr-1.5" />}
                    {transition.action}
                  </Button>
                );
              })}

          {/* Telemedicine video button */}
          {appointment.tipo_cita === "telemedicina" && appointment.status === "confirmada" && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartVideo?.(appointment);
              }}
            >
              <Video className="h-3 w-3 mr-1.5" />
              Iniciar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
