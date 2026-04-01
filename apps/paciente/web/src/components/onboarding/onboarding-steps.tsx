"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isActive
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/40"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {labels?.[i] && (
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive || isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {labels[i]}
                </span>
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 h-0.5 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-emerald-600"
                    : "bg-[hsl(var(--border))]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
