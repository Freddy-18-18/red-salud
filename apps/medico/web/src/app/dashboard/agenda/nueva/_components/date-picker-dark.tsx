'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@red-salud/design-system';
import type {
  AvailabilityExceptionRow,
  WeeklyScheduleRow,
} from '@red-salud/core';

interface DatePickerDarkProps {
  /** ISO date YYYY-MM-DD */
  value: string;
  onChange: (next: string) => void;
  /** ISO date min (inclusive). Default: hoy. */
  minDate?: string;
  /** ISO date max (inclusive). */
  maxDate?: string;
  disabled?: boolean;
  /** Días marcados con un dot (e.g., días que ya tienen citas). YYYY-MM-DD. */
  highlightedDays?: Set<string>;
  /**
   * Horario semanal del doctor. Si se pasa, los días donde el doctor NO
   * trabaja (no hay slot activo en weekly_schedule) se renderizan
   * deshabilitados. Esto evita que el doctor seleccione un día "Fuera del
   * horario habitual" por error.
   */
  weeklySchedule?: WeeklyScheduleRow[];
  /**
   * Excepciones (vacaciones, días cerrados). Si una fecha tiene
   * `is_available=false`, se deshabilita aunque el weekly_schedule la
   * marque como working day.
   */
  availabilityExceptions?: AvailabilityExceptionRow[];
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function todayIso(): string {
  return formatIso(new Date());
}

/**
 * Date picker dark-mode-friendly que usa los design tokens del proyecto
 * (`bg-card`, `border-input`, `text-foreground`) en lugar de `bg-white`
 * hardcoded como el DatePicker viejo del design-system.
 *
 * Features:
 *   - Input formato DD/MM/AAAA editable + popover con calendario mensual
 *   - Navegación por mes (chevrons) y click directo en label de mes para
 *     elegir mes/año rápido
 *   - Min/max date — días fuera del rango se renderizan disabled
 *   - `highlightedDays` opcional para marcar días con citas existentes
 *     (dot bajo el número)
 *   - "Hoy" button en el footer del popover
 */
export function DatePickerDark({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  highlightedDays,
  weeklySchedule,
  availabilityExceptions,
  className = '',
}: DatePickerDarkProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? new Date(`${value}T12:00:00`) : new Date(),
  );

  // Mounted guard — Radix Popover usa useId() internamente, y si el árbol
  // de React tiene cualquier diferencia entre SSR y CSR (otros componentes
  // que se montan después), los IDs divergen y se rompe la hidratación.
  // Renderizar el Popover SOLO después del mount evita el bug por completo
  // sin afectar la UX: el input está visible desde el primer frame, solo el
  // botón trigger (📅) aparece tras mount (~16ms, imperceptible).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mantener viewMonth sincronizado si value cambia externamente
  useEffect(() => {
    if (value) setViewMonth(new Date(`${value}T12:00:00`));
  }, [value]);

  const minDateIso = minDate ?? todayIso();

  /**
   * Set de days-of-week (0=Dom..6=Sáb) donde el doctor trabaja, según
   * weekly_schedule. Si NO se pasó weeklySchedule, todos los días son
   * working (comportamiento legacy).
   */
  const workingDaysOfWeek = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return null; // null = no aplicar filtro
    }
    const set = new Set<number>();
    for (const row of weeklySchedule) {
      if (row.is_active && row.slots && row.slots.length > 0) {
        set.add(row.day_of_week);
      }
    }
    return set;
  }, [weeklySchedule]);

  /** Set de fechas (YYYY-MM-DD) cerradas por excepción. */
  const closedExceptions = useMemo(() => {
    if (!availabilityExceptions) return new Set<string>();
    const set = new Set<string>();
    for (const ex of availabilityExceptions) {
      if (!ex.is_available) set.add(ex.date);
    }
    return set;
  }, [availabilityExceptions]);

  /** Set de fechas que el doctor abrió como EXCEPCIÓN (día normalmente cerrado pero abierto puntual). */
  const openedExceptions = useMemo(() => {
    if (!availabilityExceptions) return new Set<string>();
    const set = new Set<string>();
    for (const ex of availabilityExceptions) {
      if (ex.is_available) set.add(ex.date);
    }
    return set;
  }, [availabilityExceptions]);

  const grid = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Lun=0 .. Dom=6 (Monday-start)
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: Array<{
      day: number;
      iso: string;
      inMonth: boolean;
      disabled: boolean;
      isToday: boolean;
      isSelected: boolean;
      isHighlighted: boolean;
    }> = [];

    // Días del mes previo para llenar el grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const date = new Date(year, month - 1, d);
      const iso = formatIso(date);
      days.push({
        day: d,
        iso,
        inMonth: false,
        disabled: true,
        isToday: false,
        isSelected: false,
        isHighlighted: false,
      });
    }

    const today = todayIso();
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const iso = formatIso(date);
      const dow = date.getDay();

      // Disabled si:
      //  - antes del min o después del max
      //  - excepción explícitamente cerrada (vacaciones, etc.)
      //  - no es working day Y no fue abierto como excepción
      let isDisabled =
        iso < minDateIso || (!!maxDate && iso > maxDate);
      if (!isDisabled && closedExceptions.has(iso)) {
        isDisabled = true;
      }
      if (!isDisabled && workingDaysOfWeek !== null) {
        const isWorking = workingDaysOfWeek.has(dow);
        const isOpenException = openedExceptions.has(iso);
        if (!isWorking && !isOpenException) {
          isDisabled = true;
        }
      }

      days.push({
        day: d,
        iso,
        inMonth: true,
        disabled: isDisabled,
        isToday: iso === today,
        isSelected: iso === value,
        isHighlighted: highlightedDays?.has(iso) ?? false,
      });
    }

    // Días del mes siguiente para completar a 6 filas (42 celdas)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const iso = formatIso(date);
      days.push({
        day: d,
        iso,
        inMonth: false,
        disabled: true,
        isToday: false,
        isSelected: false,
        isHighlighted: false,
      });
    }

    return days;
  }, [
    viewMonth,
    value,
    minDateIso,
    maxDate,
    highlightedDays,
    workingDaysOfWeek,
    closedExceptions,
    openedExceptions,
  ]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }, []);
  const nextMonth = useCallback(() => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }, []);

  const handleSelect = useCallback(
    (iso: string) => {
      onChange(iso);
      setOpen(false);
    },
    [onChange],
  );

  const handleToday = useCallback(() => {
    const t = todayIso();
    if (t < minDateIso || (maxDate && t > maxDate)) return;
    onChange(t);
    setViewMonth(new Date());
    setOpen(false);
  }, [minDateIso, maxDate, onChange]);

  // Manual text entry: DD/MM/YYYY
  const [localText, setLocalText] = useState(formatDisplay(value));
  useEffect(() => setLocalText(formatDisplay(value)), [value]);

  const handleTextChange = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setLocalText(formatted);

    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4);
      const iso = `${year}-${month}-${day}`;
      const parsed = new Date(`${iso}T12:00:00`);
      if (!Number.isNaN(parsed.getTime()) && formatIso(parsed) === iso) {
        if (iso >= minDateIso && (!maxDate || iso <= maxDate)) {
          onChange(iso);
        }
      }
    }
  }, [minDateIso, maxDate, onChange]);

  const headerLabel = `${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  // Pre-mount: solo input visible (sin Popover trigger) — evita useId mismatch.
  if (!mounted) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          inputMode="numeric"
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={disabled}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          aria-label="Fecha"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        />
        <span
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/50"
          aria-hidden="true"
        >
          <Calendar className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={`relative ${className}`}>
        <input
          type="text"
          inputMode="numeric"
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={disabled}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          aria-label="Fecha"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Abrir calendario"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="start" className="w-[280px] p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mes anterior"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold capitalize text-foreground">
            {headerLabel}
          </p>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_NAMES_SHORT.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold uppercase text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            const baseClass = 'relative h-8 rounded-md text-xs font-medium transition-colors';
            let cls = baseClass;
            if (!cell.inMonth) {
              cls += ' text-muted-foreground/30 cursor-default';
            } else if (cell.disabled) {
              cls += ' text-muted-foreground/40 cursor-not-allowed';
            } else if (cell.isSelected) {
              cls += ' bg-primary text-primary-foreground shadow-sm';
            } else if (cell.isToday) {
              cls += ' bg-info/15 text-info ring-1 ring-inset ring-info/30 hover:bg-info/20';
            } else {
              cls += ' text-foreground hover:bg-muted';
            }
            return (
              <button
                key={i}
                type="button"
                disabled={cell.disabled || !cell.inMonth}
                onClick={() => cell.inMonth && !cell.disabled && handleSelect(cell.iso)}
                className={cls}
                aria-label={cell.iso}
                aria-pressed={cell.isSelected}
              >
                {cell.day}
                {cell.isHighlighted && cell.inMonth && (
                  <span
                    className={`absolute inset-x-0 bottom-0.5 mx-auto h-1 w-1 rounded-full ${
                      cell.isSelected ? 'bg-primary-foreground/80' : 'bg-primary'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cerrar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
