'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface WizardStepProps {
  /** ID único del paso — usado como key para resetear la animación de entrada. */
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Si el paso es opcional, mostramos el badge "Opcional". */
  optional?: boolean;
  /** Posición del paso en la wizard (1-based). */
  stepNumber: number;
  totalSteps: number;
  children: ReactNode;
}

/**
 * Wrapper de cada paso del wizard. Header ULTRA-COMPACTO en una sola línea
 * con micro-icono + "Paso N/M" + título + descripción opcional. Único
 * indicador de progreso ya que el StepperProgress visual fue removido.
 *
 * Anima la entrada con fade + slide leve. La animación reutiliza la `key={id}`
 * del padre para reiniciar al cambiar de paso.
 *
 * Layout (1 línea, wrap en mobile):
 *   [📅 PASO N/M]  [Título]  [pill Opcional]  · descripción (solo lg+)
 */
export function WizardStep({
  id,
  icon: Icon,
  title,
  description,
  optional = false,
  stepNumber,
  totalSteps,
  children,
}: WizardStepProps) {
  return (
    <div
      key={id}
      className="animate-in fade-in slide-in-from-right-2 duration-300"
    >
      {/* Header ULTRA compacto en una línea */}
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3 w-3" />
          Paso {stepNumber}/{totalSteps}
        </span>
        <h1 className="text-sm font-semibold leading-tight text-foreground sm:text-base">
          {title}
        </h1>
        {optional && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Opcional
          </span>
        )}
        {description && (
          <span className="hidden text-xs text-muted-foreground lg:inline">
            · {description}
          </span>
        )}
      </div>

      {/* Body */}
      <div>{children}</div>
    </div>
  );
}
