"use client";

import { Check } from "lucide-react";

import type { BookingStep } from "@/hooks/use-booking";

interface StepInfo {
  key: BookingStep;
  label: string;
  shortLabel: string;
}

const STEPS: StepInfo[] = [
  { key: "specialty", label: "Especialidad", shortLabel: "Espec." },
  { key: "doctor", label: "Doctor", shortLabel: "Doctor" },
  { key: "date", label: "Fecha", shortLabel: "Fecha" },
  { key: "time", label: "Hora", shortLabel: "Hora" },
  { key: "details", label: "Detalles", shortLabel: "Det." },
  { key: "confirm", label: "Confirmar", shortLabel: "Conf." },
];

interface StepIndicatorProps {
  currentStep: BookingStep;
  currentStepIndex: number;
  onStepClick?: (step: BookingStep) => void;
}

export function StepIndicator({
  currentStep,
  currentStepIndex,
  onStepClick,
}: StepIndicatorProps) {
  if (currentStep === "success") return null;

  return (
    <div className="w-full">
      {/* Desktop step indicator — compact, sits in the viewport-locked
          header band so the wizard never needs page scroll. */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = step.key === currentStep;
          const isClickable = isComplete && onStepClick;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`flex items-center gap-1.5 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    isCurrent
                      ? "text-emerald-700"
                      : isComplete
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 rounded ${
                    index < currentStepIndex
                      ? "bg-emerald-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator — compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-emerald-700">
            Paso {currentStepIndex + 1} de {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {STEPS[currentStepIndex]?.label}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index < currentStepIndex
                  ? "bg-emerald-500"
                  : index === currentStepIndex
                    ? "bg-emerald-600"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
