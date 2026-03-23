"use client";

import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { key: "ordenada", label: "Ordenada" },
  { key: "muestra_tomada", label: "Muestra" },
  { key: "en_proceso", label: "En proceso" },
  { key: "completada", label: "Completada" },
] as const;

const STEP_ORDER: Record<string, number> = {
  ordenada: 0,
  muestra_tomada: 1,
  en_proceso: 2,
  completada: 3,
  cancelada: -1,
};

interface StatusTimelineProps {
  status: string;
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  const currentIndex = STEP_ORDER[status] ?? 0;
  const isCancelled = status === "cancelada";

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 rounded-xl">
          <Circle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-700">
            Orden cancelada
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200" />
          {/* Progress line */}
          <div
            className="absolute top-4 left-6 h-0.5 bg-emerald-500 transition-all duration-500"
            style={{
              width: `calc(${(currentIndex / (STEPS.length - 1)) * 100}% - 48px)`,
            }}
          />

          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-gray-200"
                  } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-1.5 font-medium text-center ${
                    isCompleted ? "text-emerald-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
