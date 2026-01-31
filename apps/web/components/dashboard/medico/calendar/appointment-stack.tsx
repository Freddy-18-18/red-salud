/**
 * @file appointment-stack.tsx
 * @description Componente para mostrar múltiples citas en el mismo horario sin solapamiento
 * @module Dashboard/Medico/Calendar
 */

"use client";

import { useState } from "react";
import { cn } from "@red-salud/core/utils";
import type { CalendarAppointment } from "./types";
import { ChevronDown, ChevronUp, Video, MapPin, Clock, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@red-salud/ui";

interface AppointmentStackProps {
  appointments: CalendarAppointment[];
  maxVisible?: number;
  compact?: boolean;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function AppointmentStack({
  appointments,
  maxVisible = 3,
  compact = false,
  onAppointmentClick,
}: AppointmentStackProps) {
  const [expanded, setExpanded] = useState(false);

  if (appointments.length === 0) return null;

  const visibleAppointments = expanded
    ? appointments
    : appointments.slice(0, maxVisible);
  const hiddenCount = appointments.length - maxVisible;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeIcon = (tipo: string, className = "h-3 w-3") => {
    if (tipo === "telemedicina") return <Video className={className} />;
    if (tipo === "urgencia") return <AlertCircle className={className} />;
    return <MapPin className={className} />;
  };

  return (
    <div className="space-y-1 w-full">
      <TooltipProvider delayDuration={200}>
        {visibleAppointments.map((apt) => (
          <Tooltip key={apt.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded cursor-pointer hover:brightness-95 transition-all w-full flex items-center gap-1",
                  compact ? "p-0.5 text-[10px]" : "p-1.5 text-xs"
                )}
                style={{
                  backgroundColor: apt.color + "15", // 15 = ~8% opacity
                  borderLeft: `${compact ? "2px" : "3px"} solid ${apt.color}`,
                  color: "hsl(var(--foreground))"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAppointmentClick?.(apt);
                }}
              >
                {/* Icono de tipo small */}
                <span className="text-muted-foreground opacity-70 flex-shrink-0">
                  {getTypeIcon(apt.tipo_cita, compact ? "h-2.5 w-2.5" : "h-3 w-3")}
                </span>

                <div className="font-medium truncate flex-1 leading-tight">
                  {apt.paciente_nombre}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-0 border-none shadow-lg">
              <div className="w-[280px] bg-card border rounded-md overflow-hidden shadow-xl animate-in fade-in-0 zoom-in-95">
                {/* Header: Color & Status */}
                <div className="px-3 py-2 border-b flex items-center justify-between" style={{ backgroundColor: apt.color + "15" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: apt.color }} />
                    <span className="text-xs font-semibold capitalize">
                      {apt.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(apt.fecha_hora), "HH:mm")} - {format(new Date(apt.fecha_hora_fin), "HH:mm")}
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 bg-background">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={apt.paciente_avatar || undefined} />
                      <AvatarFallback>{getInitials(apt.paciente_nombre)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm leading-none mb-1">{apt.paciente_nombre}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {apt.motivo || "Sin motivo especificado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] gap-1 h-5 px-1.5 font-normal">
                      {getTypeIcon(apt.tipo_cita, "h-3 w-3")}
                      <span className="capitalize">{apt.tipo_cita}</span>
                    </Badge>
                    {apt.notas_internas && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                        Nota interna
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      {/* Botón para expandir/colapsar */}
      {hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn(
            "w-full text-center text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50",
            compact ? "text-[9px] py-0.5" : "text-[10px] py-1"
          )}
        >
          {expanded ? (
            <div className="flex items-center justify-center gap-0.5">
              <ChevronUp className="h-2.5 w-2.5" />
              <span>Menos</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-0.5">
              <ChevronDown className="h-2.5 w-2.5" />
              <span>+{hiddenCount}</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
