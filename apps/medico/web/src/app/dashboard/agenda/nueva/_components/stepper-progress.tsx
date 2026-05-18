'use client';

import { Check, Lock, type LucideIcon } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Datos válidos Y confirmados por el doctor (Siguiente apretado). Tilde verde. */
  completed: boolean;
  /**
   * Datos válidos pero el doctor AÚN NO confirmó. Estado intermedio:
   * el dot se ve "preview" (bg info/primary suave) — distinto de "vacío"
   * (warning) y de "verde" (completed).
   */
  inProgress?: boolean;
  /** Si es requerido y NO completed, se marca con ring warning. */
  required?: boolean;
  /** Si es opcional, el dot tiene estilo neutro (no warning) cuando pending. */
  optional?: boolean;
  /** Si la sección NO aplica (ej: companion solo para menores). */
  visible: boolean;
}

interface StepperProgressProps {
  steps: Step[];
  /** ID del step actualmente activo. */
  activeId: string | null;
  onSelect: (id: string) => void;
  /**
   * Hook de gating — si retorna false para el idx del step, el dot se
   * renderiza deshabilitado (cursor not-allowed, opacity reducida) y el
   * onClick no dispara.
   */
  canJumpTo?: (visibleIdx: number) => boolean;
}

/**
 * Indicador horizontal compacto y sticky.
 *
 * Diseño minimalista: solo dots conectados por línea + contador mini a la
 * derecha (sin barra de progreso duplicada, sin header "Progreso de la
 * cita" — los dots YA comunican el avance).
 *
 * Layout:
 *   - Mobile: solo dots (sin labels). Altura ~36px.
 *   - Desktop: dots + labels muy compactos. Altura ~56px.
 *
 * Sticky top — siempre visible al scrollear el contenido del step.
 *
 * Estados visuales de cada dot:
 *   - completed     → bg success, check verde
 *   - active        → bg primary, ring expandido
 *   - inProgress    → bg info, datos cargados pero sin confirmar
 *   - required(!ok) → ring warning (necesita atención)
 *   - optional      → ring neutro (no urge)
 *   - locked        → opacity 50 + icono lock (canJumpTo false)
 */
export function StepperProgress({
  steps,
  activeId,
  onSelect,
  canJumpTo,
}: StepperProgressProps) {
  const visible = steps.filter((s) => s.visible);
  const required = visible.filter((s) => !s.optional);
  const completedRequired = required.filter((s) => s.completed).length;
  const totalRequired = required.length;

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:bg-card/95 sm:px-3 sm:shadow-sm">
      <div className="flex items-center gap-3">
        <ol
          role="list"
          className="flex min-w-0 flex-1 items-start gap-0 overflow-x-auto pb-0.5"
        >
          {visible.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === activeId;
            const isLast = idx === visible.length - 1;
            const isReachable = canJumpTo ? canJumpTo(idx) : true;

            const stateClass = !isReachable
              ? 'bg-muted/40 text-muted-foreground/60 ring-border'
              : step.completed
                ? 'bg-success text-success-foreground ring-success/30'
                : isActive
                  ? 'bg-primary text-primary-foreground ring-primary/40 scale-110'
                  : step.inProgress
                    ? 'bg-info/15 text-info ring-info/40'
                    : step.required
                      ? 'bg-warning/15 text-warning ring-warning/30'
                      : step.optional
                        ? 'bg-muted/60 text-muted-foreground ring-border'
                        : 'bg-muted text-muted-foreground ring-border';

            const lineClass = step.completed ? 'bg-success' : 'bg-border';

            const ariaLabel = `Paso ${idx + 1}: ${step.label}${
              step.completed
                ? ' (completado)'
                : step.inProgress
                  ? ' (datos cargados, falta confirmar)'
                  : ''
            }${step.optional ? ' (opcional)' : ''}${
              !isReachable ? ' — bloqueado, completá los pasos anteriores' : ''
            }`;

            return (
              <li
                key={step.id}
                className="flex flex-1 flex-col items-center min-w-[40px]"
              >
                <div className="flex w-full items-center">
                  <div className="h-0.5 flex-1" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => isReachable && onSelect(step.id)}
                    disabled={!isReachable}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={ariaLabel}
                    title={
                      !isReachable
                        ? 'Completá los pasos anteriores para llegar acá'
                        : step.label
                    }
                    className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-2 transition-all ${stateClass} ${
                      isReachable
                        ? 'cursor-pointer hover:scale-105'
                        : 'cursor-not-allowed'
                    }`}
                  >
                    {!isReachable ? (
                      <Lock className="h-3 w-3" />
                    ) : step.completed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </button>
                  {!isLast && <div className={`h-0.5 flex-1 ${lineClass}`} />}
                </div>
                {/* Labels solo desktop — mobile = solo dots para máxima compresión */}
                <span
                  className={`mt-1 hidden max-w-[72px] truncate text-center text-[10px] font-medium leading-tight sm:block ${
                    !isReachable
                      ? 'text-muted-foreground/60'
                      : isActive
                        ? 'text-foreground'
                        : step.completed
                          ? 'text-success/80'
                          : 'text-muted-foreground'
                  }`}
                  title={step.label}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Contador inline mini — desktop only. Sin "%" ni "requeridos",
            los dots verdes ya comunican avance. */}
        <span className="hidden flex-shrink-0 text-[11px] font-medium text-muted-foreground sm:inline">
          {completedRequired}/{totalRequired}
        </span>
      </div>
    </div>
  );
}
