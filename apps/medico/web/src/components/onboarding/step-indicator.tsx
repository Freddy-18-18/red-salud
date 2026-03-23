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
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
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
                        ? 'text-blue-700'
                        : isCompleted
                          ? 'text-emerald-600'
                          : 'text-gray-400'
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
                    ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}
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
