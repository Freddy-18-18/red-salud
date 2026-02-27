// ============================================
// CARDIOLOGY WIDGETS - Upcoming Procedures Widget
// Shows scheduled cardiac procedures
// ============================================

"use client";

import { Calendar, Clock, Scale, Video, Scissors } from "lucide-react";
import { Badge } from "@red-salud/design-system";

interface UpcomingProceduresWidgetProps {
  doctorId?: string;
  maxProcedures?: number;
}

interface Procedure {
  id: string;
  procedureName: string;
  patientName: string;
  scheduledDate: string;
  type: "diagnostic" | "interventional" | "follow_up";
  urgency: "low" | "medium" | "high";
  duration?: string;
}

/**
 * Upcoming Procedures Widget for Cardiology
 *
 * Shows scheduled cardiac procedures with priority indicators
 */
export function UpcomingProceduresWidget({
  doctorId,
  maxProcedures = 5,
}: UpcomingProceduresWidgetProps) {
  // Mock data for upcoming procedures
  const procedures: Procedure[] = [
    {
      id: "proc1",
      procedureName: "Cateterismo Cardíaco",
      patientName: "María González",
      scheduledDate: "Hoy, 15:00",
      type: "interventional",
      urgency: "high",
      duration: "90 min",
    },
    {
      id: "proc2",
      procedureName: "Ecocardiograma Transtorácica",
      patientName: "Carlos Rodríguez",
      scheduledDate: "Hoy, 16:30",
      type: "diagnostic",
      urgency: "low",
      duration: "30 min",
    },
    {
      id: "proc3",
      procedureName: "Prueba de Esfuerzo",
      patientName: "Ana Martínez",
      scheduledDate: "Mañana, 09:00",
      type: "diagnostic",
      urgency: "low",
      duration: "45 min",
    },
    {
      id: "proc4",
      procedureName: "Holter 24 Horas",
      patientName: "Pedro Pérez",
      scheduledDate: "Mañana, 10:00",
      type: "diagnostic",
      urgency: "low",
      duration: "",
    },
    {
      id: "proc5",
      procedureName: "Implante de Marcapasos",
      patientName: "Lucía Ramírez",
      scheduledDate: "En 2 días, 08:00",
      type: "interventional",
      urgency: "medium",
      duration: "120 min",
    },
  ];

  const displayProcedures = procedures.slice(0, maxProcedures);

  const getProcedureIcon = (type: Procedure["type"]) => {
    switch (type) {
      case "diagnostic":
        return "file-search";
      case "interventional":
        return "scissors";
      case "follow_up":
        return "video";
      default:
        return "calendar";
    }
  };

  const getUrgencyColor = (urgency: Procedure["urgency"]) => {
    switch (urgency) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: Procedure["type"]) => {
    switch (type) {
      case "diagnostic":
        return "Diagnóstico";
      case "interventional":
        return "Intervención";
      case "follow_up":
        return "Seguimiento";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Procedimientos Próximos</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          Próximos 7 días
        </span>
      </div>

      {displayProcedures.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No procedimientos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayProcedures.map((proc) => (
            <div
              key={proc.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  proc.urgency === "high"
                    ? "bg-red-100"
                    : proc.urgency === "medium"
                      ? "bg-orange-100"
                      : "bg-muted"
                }`}
              >
                <Scissors className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{proc.procedureName}</p>
                <p className="text-xs text-muted-foreground">
                  {proc.patientName}
                  {proc.duration && ` • ${proc.duration}`}
                </p>
              </div>
              <div className="flex flex-shrink-0 text-right">
                <Badge
                  variant={proc.urgency === "high" ? "destructive" : proc.urgency === "medium" ? "default" : "secondary"}
                  className="mb-1"
                >
                  {getTypeLabel(proc.type)}
                </Badge>
                <p className="text-xs text-muted-foreground">{proc.scheduledDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {procedures.length > maxProcedures && (
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            +{procedures.length - maxProcedures} más procedimientos
          </button>
        </div>
      )}
    </div>
  );
}
