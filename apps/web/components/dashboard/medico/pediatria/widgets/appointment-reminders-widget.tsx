// ============================================
// PEDIATRICS WIDGETS - Appointment Reminders
// Reminders for well-child visits and vaccinations
// ============================================

"use client";

import { Bell, Clock } from "lucide-react";

interface AppointmentRemindersWidgetProps {
  doctorId?: string;
}

interface Reminder {
  id: string;
  type: "well_child" | "vaccination" | "follow_up";
  patientName: string;
  dueDate: string;
  daysUntilDue: number;
}

/**
 * Appointment Reminders Widget
 *
 * Shows upcoming well-child visits and vaccination reminders
 */
export function AppointmentRemindersWidget({ doctorId }: AppointmentRemindersWidgetProps) {
  // Mock data for reminders
  const reminders: Reminder[] = [
    {
      id: "1",
      type: "well_child",
      patientName: "Sofía Martínez",
      dueDate: "Mañana, 09:00",
      daysUntilDue: 1,
    },
    {
      id: "2",
      type: "vaccination",
      patientName: "Mateo Rodríguez",
      dueDate: "En 3 días",
      daysUntilDue: 3,
    },
    {
      id: "3",
      type: "follow_up",
      patientName: "Valentina Sánchez",
      dueDate: "En 5 días",
      daysUntilDue: 5,
    },
    {
      id: "4",
      type: "well_child",
      patientName: "Daniel López",
      dueDate: "En 1 semana",
      daysUntilDue: 7,
    },
  ];

  const getReminderIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "well_child":
        return "calendar";
      case "vaccination":
        return "syringe";
      case "follow_up":
        return "phone";
      default:
        return "bell";
    }
  };

  const getReminderLabel = (type: Reminder["type"]) => {
    switch (type) {
      case "well_child":
        return "Visita Bienestar";
      case "vaccination":
        return "Vacuna";
      case "follow_up":
        return "Seguimiento";
      default:
        return "Recordatorio";
    }
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntilDue <= 1) return "text-red-600";
    if (daysUntilDue <= 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Recordatorios</h4>
      </div>

      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="flex items-center gap-3 p-2 rounded-lg border border-border/60 bg-card"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{reminder.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {getReminderLabel(reminder.type)} • {reminder.dueDate}
            </p>
          </div>
          <span className={`text-xs font-medium ${getUrgencyColor(reminder.daysUntilDue)}`}>
            {reminder.daysUntilDue === 0
              ? "Hoy"
              : reminder.daysUntilDue === 1
                ? "Mañana"
                : `En ${reminder.daysUntilDue} días`}
          </span>
        </div>
      ))}
    </div>
  );
}
