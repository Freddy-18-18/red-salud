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
      <ol className="flex items-start w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-start ${isLast ? '' : 'flex-1'}`}
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-full',
                    'text-sm font-semibold transition-all duration-200',
                    'motion-reduce:transition-none',
                    isCompleted
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15'
                        : 'bg-muted text-muted-foreground border border-border',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={[
                    'text-xs font-medium text-center leading-tight max-w-[88px]',
                    isCurrent
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-primary'
                        : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  aria-hidden="true"
                  className={[
                    'flex-1 h-px mx-3 mt-[18px] transition-colors duration-300',
                    'motion-reduce:transition-none',
                    isCompleted ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
