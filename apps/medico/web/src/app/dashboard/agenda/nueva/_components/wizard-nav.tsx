'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Loader2,
  SkipForward,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';

interface WizardNavProps {
  /** Si está en el primer paso, deshabilita "Anterior". */
  canGoPrevious: boolean;
  /** Si se puede avanzar (paso requerido cumplido o paso opcional). */
  canGoNext: boolean;
  /** Si es el último paso, renderizamos "Crear cita" en vez de "Siguiente". */
  isLastStep: boolean;
  /** Si el step actual es opcional, mostramos botón "Saltar" separado de "Siguiente". */
  isOptional: boolean;
  /** Mensaje contextual de por qué no se puede avanzar (ej: "Faltan datos del responsable"). */
  blockedReason?: string | null;
  /** Loading state en el submit final. */
  submitting?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

/**
 * Barra de navegación sticky abajo del wizard.
 *
 * Layout (desktop): [ Cancelar ] [ ← Anterior ] [ Saltar* ] [ Siguiente → / Crear cita ]
 * Layout (mobile):  apilado con full-width buttons
 */
export function WizardNav({
  canGoPrevious,
  canGoNext,
  isLastStep,
  isOptional,
  blockedReason,
  submitting = false,
  onPrevious,
  onNext,
  onSkip,
  onCancel,
}: WizardNavProps) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-4 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
      {/* Reason banner cuando blocked */}
      {!canGoNext && blockedReason && !isOptional && (
        <p className="mb-2 text-center text-[11px] font-medium text-warning">
          {blockedReason}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {/* Cancelar a la izquierda */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
          className="hidden sm:inline-flex"
        >
          Cancelar
        </Button>

        {/* Acciones principales a la derecha */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!canGoPrevious || submitting}
            className="flex-1 sm:flex-initial"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Anterior
          </Button>

          {isOptional && !isLastStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSkip}
              disabled={submitting}
              className="flex-1 sm:flex-initial"
            >
              <SkipForward className="mr-1 h-3.5 w-3.5" />
              Saltar
            </Button>
          )}

          {isLastStep ? (
            <Button
              type="submit"
              size="sm"
              disabled={!canGoNext || submitting}
              className="flex-[2] sm:flex-initial"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creando…
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Crear cita
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext || submitting}
              className="flex-[2] sm:flex-initial"
            >
              Siguiente
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
