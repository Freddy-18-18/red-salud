'use client';

import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del registro" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? '' : 'flex-1'}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    text-sm font-semibold transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                        : isCurrent
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 ring-4 ring-teal-500/20'
                          : 'bg-white/5 text-zinc-500 border border-white/10'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`
                    text-xs font-medium text-center max-w-[80px] leading-tight
                    ${
                      isCurrent
                        ? 'text-teal-400'
                        : isCompleted
                          ? 'text-teal-500'
                          : 'text-zinc-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-3 mt-[-20px] transition-all duration-500
                    ${isCompleted ? 'bg-teal-500' : 'bg-white/10'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
