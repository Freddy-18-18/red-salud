// ============================================
// CARDIOLOGY WIDGETS - ECG Queue Widget
// Shows queue of ECGs pending review
// ============================================

"use client";

import { Activity, Clock, Syringe } from "lucide-react";
import { Badge } from "@red-salud/design-system";

interface ECGQueueWidgetProps {
  doctorId?: string;
  maxItems?: number;
}

interface ECGItem {
  id: string;
  patientName: string;
  urgency: "routine" | "urgent" | "emergency";
  timeInQueue: string;
  type: "resting" | "stress_test" | "holter";
  orderedBy?: string;
}

/**
 * ECG Queue Widget
 *
 * Shows ECGs pending review and triage
 */
export function ECGQueueWidget({ doctorId, maxItems = 5 }: ECGQueueWidgetProps) {
  // Mock data for ECG queue
  const queue: ECGItem[] = [
    {
      id: "ecg1",
      patientName: "Carmen López",
      urgency: "emergency",
      timeInQueue: "30 min",
      type: "resting",
    },
    {
      id: "ecg2",
      patientName: "Roberto Díaz",
      urgency: "urgent",
      timeInQueue: "2 horas",
      type: "holter",
    },
    {
      id: "ecg3",
      patientName: "Laura Sánchez",
      urgency: "urgent",
      timeInQueue: "3 horas",
      type: "stress_test",
    },
    {
      id: "ecg4",
      patientName: "Miguel Ángel",
      urgency: "routine",
      timeInQueue: "4 horas",
      type: "resting",
    },
    {
      id: "ecg5",
      patientName: "Isabella González",
      urgency: "routine",
      timeInQueue: "5 horas",
      type: "resting",
    },
    {
      id: "ecg6",
      patientName: "Jorge Fernández",
      urgency: "routine",
      timeInQueue: "6 horas",
      type: "holter",
    },
  ];

  const displayQueue = queue.slice(0, maxItems);

  const getUrgencyIcon = (urgency: ECGItem["urgency"]) => {
    switch (urgency) {
      case "emergency":
        return "alert-circle";
      case "urgent":
        return "alert-triangle";
      default:
        return "activity";
    }
  };

  const getUrgencyColor = (urgency: ECGItem["urgency"]) => {
    switch (urgency) {
      case "emergency":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case "urgent":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Cola de ECG</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {displayQueue.length}/{queue.length} pendientes
        </span>
      </div>

      {displayQueue.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Activity className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No ECGs pendientes de revisión</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                item.urgency === "emergency"
                  ? "bg-red-100"
                  : item.urgency === "urgent"
                    ? "bg-orange-100"
                    : "bg-muted"
              }`}>
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.timeInQueue} • {item.type}
                </p>
              </div>
              <Badge
                variant={
                  item.urgency === "emergency"
                    ? "destructive"
                    : item.urgency === "urgent"
                      ? "default"
                      : "secondary"
                }
                className="flex-shrink-0"
              >
                {item.urgency === "emergency"
                  ? "Emergencia"
                  : item.urgency === "urgent"
                    ? "Urgente"
                    : "Rutina"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {queue.length > maxItems && (
        <div className="text-center">
          <button className="text-xs text-primary hover:underline">
            +{queue.length - maxItems} más ECGs
          </button>
        </div>
      )}
    </div>
  );
}
