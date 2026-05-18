'use client';

import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { Button } from '@red-salud/design-system';

interface CollapsibleSectionProps {
  index: number;
  icon: LucideIcon;
  title: string;
  /** Resumen visible cuando está colapsada (ej: "Juan Pérez · V-12345678"). */
  summary?: string;
  /** Si está completo, muestra check verde + auto-collapse. */
  completed: boolean;
  /** Si es requerido y no está completo, muestra badge. */
  required?: boolean;
  /** Estado controlado: si está abierta. */
  open: boolean;
  onToggle: (open: boolean) => void;
  /**
   * Si se pasa, renderiza un botón "Continuar →" abajo de la sección que
   * lleva al siguiente step. La llamada se delega al padre (acordeón).
   */
  onContinue?: () => void;
  /** Label del botón continuar (default: "Continuar"). */
  continueLabel?: string;
  /** Deshabilita el botón continuar si la sección requiere completarse antes. */
  continueDisabled?: boolean;
  children: ReactNode;
}

/**
 * Sección colapsable estilo acordeón con:
 *   - Index pill + ícono + título
 *   - Resumen inline cuando está colapsada
 *   - Badge de estado (Completo / Requerido)
 *   - Chevron rotativo
 *   - Botón "Continuar →" opcional para avanzar al siguiente step
 *
 * Visual:
 *   - completed → border success
 *   - required pending → border warning
 *   - open → border primary suave
 *   - default → border base
 */
export function CollapsibleSection({
  index,
  icon: Icon,
  title,
  summary,
  completed,
  required = false,
  open,
  onToggle,
  onContinue,
  continueLabel = 'Continuar',
  continueDisabled = false,
  children,
}: CollapsibleSectionProps) {
  const borderClass = open
    ? 'border-primary/40 ring-1 ring-primary/10'
    : completed
      ? 'border-success/30'
      : required
        ? 'border-warning/30'
        : 'border-border';

  return (
    <section
      className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-all ${borderClass}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30 sm:px-4"
      >
        {/* Index pill */}
        <span
          className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            completed
              ? 'bg-success text-success-foreground shadow-sm'
              : open
                ? 'bg-primary text-primary-foreground shadow-sm'
                : required
                  ? 'bg-warning/15 text-warning ring-1 ring-warning/30'
                  : 'bg-muted text-muted-foreground'
          }`}
        >
          {completed ? <Check className="h-4 w-4" /> : index}
        </span>

        {/* Icon + title + summary */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Icon
            className={`h-4 w-4 flex-shrink-0 ${
              open ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {summary && !open && (
              <p className="truncate text-[11px] text-muted-foreground">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* Status badge + chevron */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {completed && !open && (
            <span className="hidden rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success sm:inline">
              Completo
            </span>
          )}
          {!completed && required && !open && (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
              Requerido
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-border bg-background/40">
          <div className="space-y-3 px-3 py-3 sm:px-4">{children}</div>
          {onContinue && (
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-3 py-2 sm:px-4">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onToggle(false)}
                className="h-7 text-xs"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onContinue}
                disabled={continueDisabled}
                className="h-7 text-xs"
              >
                {continueLabel}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Hook que maneja un acordeón "una sección abierta a la vez".
 * Llamar con la sección que querés abrir (o null para colapsar todas).
 */
export function useAccordion(initialOpen: string | null = null) {
  const [openSection, setOpenSection] = useState<string | null>(initialOpen);

  const toggle = (id: string, isOpen: boolean) => {
    setOpenSection(isOpen ? id : null);
  };

  const isOpen = (id: string) => openSection === id;

  return { openSection, setOpenSection, toggle, isOpen };
}
