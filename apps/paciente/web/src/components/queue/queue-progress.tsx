"use client";

import {
  UserPlus,
  Clock,
  Bell,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

import { type QueueStatus } from "@/lib/services/queue-service";

interface QueueProgressProps {
  status: QueueStatus;
}

const STEPS = [
  {
    key: "joined",
    label: "En cola",
    description: "Te has unido a la cola virtual",
    icon: UserPlus,
  },
  {
    key: "waiting",
    label: "Esperando",
    description: "Esperando tu turno",
    icon: Clock,
  },
  {
    key: "called",
    label: "Llamado",
    description: "Es tu turno, dirigete a la consulta",
    icon: Bell,
  },
  {
    key: "in_progress",
    label: "En atencion",
    description: "Tu consulta esta en curso",
    icon: Stethoscope,
  },
  {
    key: "completed",
    label: "Completado",
    description: "Tu consulta ha sido completada",
    icon: CheckCircle2,
  },
] as const;

function getActiveStepIndex(status: QueueStatus): number {
  switch (status) {
    case "waiting":
      return 1;
    case "in_progress":
      return 3;
    case "completed":
      return 4;
    case "cancelled":
    case "no_show":
      return -1;
    default:
      return 0;
  }
}

export function QueueProgress({ status }: QueueProgressProps) {
  const activeIndex = getActiveStepIndex(status);

  if (activeIndex < 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-900">Progreso</p>
      <div className="space-y-0">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-3">
              {/* Step line and dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 mt-1 ${
                      isCompleted ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              {/* Step text */}
              <div className="pb-4">
                <p
                  className={`text-sm font-medium ${
                    isCompleted || isCurrent
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-xs ${
                    isCurrent ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
