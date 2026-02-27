// ============================================
// PEDIATRICS WIDGETS - Well Child Schedule
// Shows today's well-child visits
// ============================================

"use client";

import { Baby, Calendar } from "lucide-react";

interface WellChildScheduleWidgetProps {
  doctorId?: string;
  maxItems?: number;
}

interface Appointment {
  patientName: string;
  age: string;
  visitType: string;
  scheduledTime: string;
}

/**
 * Well Child Schedule Widget
 *
 * Displays today's well-child visit appointments
 */
export function WellChildScheduleWidget({ doctorId, maxItems = 5 }: WellChildScheduleWidgetProps) {
  // In production, this would fetch from Supabase
  // For now, using mock data
  const mockAppointments: Appointment[] = [
    { patientName: "Sofía Martínez", age: "2 meses", visitType: "2 meses", scheduledTime: "09:00" },
    { patientName: "Mateo Rodríguez", age: "4 meses", visitType: "4 meses", scheduledTime: "10:30" },
    { patientName: "Valentina Sánchez", age: "6 meses", visitType: "6 meses", scheduledTime: "11:00" },
    { patientName: "Daniel López", age: "9 meses", visitType: "9 meses", scheduledTime: "14:00" },
    { patientName: "Isabella González", age: "12 meses", visitType: "12 meses", scheduledTime: "15:30" },
    { patientName: "Maximiliano Pérez", age: "15 meses", visitType: "15 meses", scheduledTime: "16:00" },
  ];

  const appointments = mockAppointments.slice(0, maxItems);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Visitas de Bienestar Hoy</h4>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Baby className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No visitas programadas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Baby className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{apt.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  {apt.age} • {apt.visitType}
                </p>
              </div>
              <span className="text-xs font-medium text-primary">{apt.scheduledTime}</span>
            </div>
          ))}
        </div>
      )}

      {appointments.length > 0 && maxItems < appointments.length && (
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            +{appointments.length - maxItems} más
          </button>
        </div>
      )}
    </div>
  );
}
