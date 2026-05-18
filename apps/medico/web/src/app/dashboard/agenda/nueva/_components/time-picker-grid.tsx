'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@red-salud/design-system';
import type {
  AppointmentRow,
  TimeBlockRow,
  WeeklyScheduleRow,
} from '@red-salud/core';

interface TimePickerGridProps {
  /** Valor HH:mm (24h) */
  value: string;
  onChange: (next: string) => void;
  /** Fecha (YYYY-MM-DD) sobre la que computar la disponibilidad. */
  date: string;
  /** Duración de la cita propuesta en minutos. */
  durationMin: number;
  /** Horario semanal del doctor. */
  weeklySchedule: WeeklyScheduleRow[];
  /** Bloqueos de tiempo (vacaciones, reuniones, etc). */
  timeBlocks: TimeBlockRow[];
  /** Citas existentes del doctor en `date`. */
  dayAppointments: AppointmentRow[];
  disabled?: boolean;
  className?: string;
}

/** Slot status — determina color del botón. */
type SlotStatus = 'free' | 'busy' | 'break' | 'blocked' | 'outside';

const STATUSES_THAT_BLOCK_SLOT = new Set([
  'scheduled',
  'pending',
  'confirmed',
  'waiting',
  'in_progress',
]);

const SLOT_MIN = 15;
const START_HOUR = 6;
const END_HOUR = 22;

function toMinutes(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

function formatHHMM(totalMinutes: number): string {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Time picker visual que muestra TODOS los slots de 15min del día con código
 * de color basado en disponibilidad real:
 *
 *   - libre   → bg-card hover bg-muted (clickeable)
 *   - ocupado → bg-destructive/10 ring destructive (no clickeable)
 *   - break   → bg-warning/10 text-warning (no clickeable, tachado)
 *   - bloqueado → bg-muted text-muted-foreground (no clickeable)
 *   - fuera del horario → bg-muted/30 muy tenue (no clickeable)
 *
 * El doctor SABE inmediatamente qué horarios están libres sin tener que
 * adivinar ni leer la agenda en otra pestaña.
 *
 * Si el `value` coincide con un slot, queda highlightado con primary.
 *
 * IMPORTANTE: el input de arriba sigue siendo editable manualmente (escribir
 * la hora con teclado) — la grilla es UI complementaria, no único método.
 */
export function TimePickerGrid({
  value,
  onChange,
  date,
  durationMin,
  weeklySchedule,
  timeBlocks,
  dayAppointments,
  disabled = false,
  className = '',
}: TimePickerGridProps) {
  const [open, setOpen] = useState(false);

  // Mounted guard — Radix Popover usa useId() y diverge en hidratación
  // si el árbol de React cambia entre SSR y CSR. Render del Popover solo
  // post-mount evita el bug. Input visible desde el primer frame.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mensaje sutil cuando la hora tipeada fue auto-ajustada al slot disponible
  // más cercano. Se autoclear después de 3 segundos.
  const [adjustNotice, setAdjustNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!adjustNotice) return;
    const t = setTimeout(() => setAdjustNotice(null), 3000);
    return () => clearTimeout(t);
  }, [adjustNotice]);

  // Generar slots de 15min entre START_HOUR y END_HOUR
  const slots = useMemo(() => {
    const result: Array<{ time: string; status: SlotStatus; label?: string }> = [];

    const dow = new Date(`${date}T00:00:00`).getDay();
    const dayTemplate = weeklySchedule.find(
      (row) => row.day_of_week === dow && row.is_active,
    );

    // Citas activas del día
    const busyIntervals = dayAppointments
      .filter(
        (apt) =>
          apt.scheduled_at.slice(0, 10) === date &&
          STATUSES_THAT_BLOCK_SLOT.has(apt.status),
      )
      .map((apt) => {
        const dt = new Date(apt.scheduled_at);
        const startMin = dt.getHours() * 60 + dt.getMinutes();
        return { start: startMin, end: startMin + (apt.duration_minutes || 30) };
      });

    // Time blocks del día
    const blockedIntervals = timeBlocks
      .filter((b) => {
        const startDay = b.starts_at.slice(0, 10);
        const endDay = b.ends_at.slice(0, 10);
        return startDay <= date && date <= endDay;
      })
      .map((b) => {
        const bs = new Date(b.starts_at);
        const be = new Date(b.ends_at);
        const startMin =
          bs.toISOString().slice(0, 10) < date
            ? 0
            : bs.getHours() * 60 + bs.getMinutes();
        const endMin =
          be.toISOString().slice(0, 10) > date
            ? 24 * 60
            : be.getHours() * 60 + be.getMinutes();
        return { start: startMin, end: endMin, title: b.title };
      });

    for (let h = START_HOUR; h < END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MIN) {
        const slotStart = h * 60 + m;
        const slotEnd = slotStart + durationMin;
        const time = formatHHMM(slotStart);

        let status: SlotStatus = 'free';
        let label: string | undefined;

        if (!dayTemplate) {
          status = 'outside';
          label = 'Día no laborable';
        } else {
          const insideHours = dayTemplate.slots.some((s) => {
            const ws = toMinutes(s.start);
            const we = toMinutes(s.end);
            return slotStart >= ws && slotEnd <= we;
          });
          if (!insideHours) {
            status = 'outside';
            label = 'Fuera de horario habitual';
          }

          if (status === 'free') {
            const insideBreak = dayTemplate.breaks.find((b) => {
              const bs = toMinutes(b.start);
              const be = toMinutes(b.end);
              return intervalsOverlap(slotStart, slotEnd, bs, be);
            });
            if (insideBreak) {
              status = 'break';
              label = `Pausa: ${insideBreak.label}`;
            }
          }
        }

        if (status === 'free') {
          const blocked = blockedIntervals.find((b) =>
            intervalsOverlap(slotStart, slotEnd, b.start, b.end),
          );
          if (blocked) {
            status = 'blocked';
            label = blocked.title;
          }
        }

        if (status === 'free') {
          const busy = busyIntervals.find((b) =>
            intervalsOverlap(slotStart, slotEnd, b.start, b.end),
          );
          if (busy) {
            status = 'busy';
            label = `Ocupado ${formatHHMM(busy.start)}–${formatHHMM(busy.end)}`;
          }
        }

        result.push({ time, status, label });
      }
    }

    return result;
  }, [date, durationMin, weeklySchedule, timeBlocks, dayAppointments]);

  // Scroll al slot seleccionado cuando se abre
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !gridRef.current) return;
    const el = gridRef.current.querySelector<HTMLElement>(
      `[data-time="${value}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    }
  }, [open, value]);

  /**
   * Manejo manual del input text (formato HH:mm). Permite escribir con
   * teclado sin el feo icono nativo del `<input type="time">`. Soporta:
   *   - "9" → "09:00"
   *   - "930" → "09:30"
   *   - "1430" → "14:30"
   *   - "12:45" → "12:45"
   * Snap automático al slot de 15min al perder foco.
   */
  const [textInput, setTextInput] = useState(value);
  useEffect(() => setTextInput(value), [value]);

  const handleTextInputChange = useCallback((raw: string) => {
    // Solo dígitos y dos puntos. Limitar a 5 chars (HH:mm).
    const cleaned = raw.replace(/[^\d:]/g, '').slice(0, 5);
    setTextInput(cleaned);
  }, []);

  /**
   * Al perder foco: snappea a slot de 15min Y valida contra el horario
   * laboral del doctor. Si la hora cae en un slot NO disponible
   * (fuera de horario, en break, en time block, ocupado por otra cita),
   * busca el slot 'free' más cercano (preferentemente DESPUÉS para no
   * adelantar contra la intención del usuario) y snappea ahí. Mensaje
   * sutil "Hora ajustada al próximo slot disponible" se muestra 3s.
   */
  const handleTextInputBlur = useCallback(() => {
    const digits = textInput.replace(/\D/g, '');
    if (digits.length === 0) {
      setTextInput(value);
      return;
    }

    let hours = 0;
    let mins = 0;
    if (digits.length <= 2) {
      hours = Number(digits);
    } else if (digits.length === 3) {
      hours = Number(digits.slice(0, 1));
      mins = Number(digits.slice(1));
    } else {
      hours = Number(digits.slice(0, 2));
      mins = Number(digits.slice(2));
    }

    hours = Math.max(0, Math.min(23, hours));
    mins = Math.max(0, Math.min(59, mins));
    const total = hours * 60 + mins;
    const snappedMin = Math.round(total / SLOT_MIN) * SLOT_MIN;
    const candidateTime = formatHHMM(
      Math.max(0, Math.min(snappedMin, 23 * 60 + 45)),
    );

    // Buscar el slot candidato en el array de slots calculados
    const candidateSlot = slots.find((s) => s.time === candidateTime);

    // Si el slot es libre, todo OK
    if (candidateSlot && candidateSlot.status === 'free') {
      setTextInput(candidateTime);
      onChange(candidateTime);
      return;
    }

    // Slot inválido — buscar el más cercano que sea 'free'
    // Estrategia: buscar adelante primero (más natural), si no, atrás
    const candidateIdx = slots.findIndex((s) => s.time === candidateTime);
    let bestIdx = -1;
    if (candidateIdx !== -1) {
      // Adelante
      for (let i = candidateIdx + 1; i < slots.length; i++) {
        if (slots[i].status === 'free') {
          bestIdx = i;
          break;
        }
      }
      // Si no hay adelante, atrás
      if (bestIdx === -1) {
        for (let i = candidateIdx - 1; i >= 0; i--) {
          if (slots[i].status === 'free') {
            bestIdx = i;
            break;
          }
        }
      }
    } else {
      // Candidato fuera del rango del grid (ej: 23:50). Tomamos el primer
      // 'free' del array que tenga.
      bestIdx = slots.findIndex((s) => s.status === 'free');
    }

    if (bestIdx === -1) {
      // No hay ningún slot libre en todo el día → restauramos valor anterior
      setTextInput(value);
      setAdjustNotice(
        'No hay horarios disponibles este día. Cambiá de fecha.',
      );
      return;
    }

    const adjusted = slots[bestIdx].time;
    setTextInput(adjusted);
    onChange(adjusted);

    // Mensaje específico según por qué se ajustó
    const reason =
      candidateSlot?.status === 'busy'
        ? 'ocupado por otra cita'
        : candidateSlot?.status === 'break'
          ? 'pausa del horario'
          : candidateSlot?.status === 'blocked'
            ? 'horario bloqueado'
            : 'fuera del horario habitual';
    setAdjustNotice(
      `Hora ajustada — ${candidateTime} cae en ${reason}. Movida a ${adjusted}.`,
    );
  }, [textInput, value, onChange, slots]);

  const handleSelectSlot = useCallback(
    (time: string) => {
      onChange(time);
      setOpen(false);
    },
    [onChange],
  );

  // Stats del día — útil mostrar en el header del popover
  const stats = useMemo(() => {
    const free = slots.filter((s) => s.status === 'free').length;
    const busy = slots.filter((s) => s.status === 'busy').length;
    return { free, busy, total: slots.length };
  }, [slots]);

  // Pre-mount: solo input visible (sin Popover trigger) — evita useId mismatch.
  // Usamos <input type="text"> en vez de "time" para evitar el icono nativo
  // del browser (era el segundo icono que el usuario quería eliminar).
  if (!mounted) {
    return (
      <div className={className}>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={textInput}
            onChange={(e) => handleTextInputChange(e.target.value)}
            onBlur={handleTextInputBlur}
            disabled={disabled}
            placeholder="HH:mm"
            maxLength={5}
            aria-label="Hora"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
          <span
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground/50"
            aria-hidden="true"
          >
            <Clock className="h-4 w-4" />
          </span>
        </div>
        {adjustNotice && <AdjustNoticeBanner msg={adjustNotice} />}
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={textInput}
            onChange={(e) => handleTextInputChange(e.target.value)}
            onBlur={handleTextInputBlur}
            disabled={disabled}
            placeholder="HH:mm"
            maxLength={5}
            aria-label="Hora"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="Ver disponibilidad por hora"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </div>
      <PopoverContent align="start" className="w-[320px] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Disponibilidad del día
          </p>
          <p className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-success">{stats.free}</span> libres
            {' · '}
            <span className="font-semibold text-destructive">{stats.busy}</span> ocupadas
          </p>
        </div>

        {/* Leyenda */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-card ring-1 ring-inset ring-border" />
            libre
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-destructive/30" />
            ocupado
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-warning/30" />
            pausa
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-muted" />
            bloqueado
          </span>
        </div>

        <div
          ref={gridRef}
          className="grid max-h-[280px] grid-cols-4 gap-1 overflow-y-auto pr-1"
        >
          {slots.map((slot) => {
            const isSelected = slot.time === value;
            const baseClass =
              'h-8 rounded-md text-xs font-medium transition-colors flex items-center justify-center';
            let cls = baseClass;
            let disabled = false;

            if (isSelected) {
              cls += ' bg-primary text-primary-foreground shadow-sm ring-2 ring-inset ring-primary';
            } else {
              switch (slot.status) {
                case 'free':
                  cls += ' bg-card text-foreground ring-1 ring-inset ring-border hover:bg-muted hover:ring-ring/40';
                  break;
                case 'busy':
                  cls += ' bg-destructive/10 text-destructive/80 ring-1 ring-inset ring-destructive/30 cursor-not-allowed';
                  disabled = true;
                  break;
                case 'break':
                  cls += ' bg-warning/10 text-warning/70 ring-1 ring-inset ring-warning/30 cursor-not-allowed line-through';
                  disabled = true;
                  break;
                case 'blocked':
                  cls += ' bg-muted text-muted-foreground ring-1 ring-inset ring-border cursor-not-allowed';
                  disabled = true;
                  break;
                case 'outside':
                  cls += ' bg-muted/30 text-muted-foreground/40 cursor-not-allowed';
                  disabled = true;
                  break;
              }
            }

            return (
              <button
                key={slot.time}
                type="button"
                data-time={slot.time}
                onClick={() => !disabled && handleSelectSlot(slot.time)}
                disabled={disabled}
                title={slot.label ?? slot.time}
                aria-label={`${slot.time}${slot.label ? ` — ${slot.label}` : ''}`}
                aria-pressed={isSelected}
                className={cls}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </PopoverContent>
      </Popover>
      {adjustNotice && <AdjustNoticeBanner msg={adjustNotice} />}
    </div>
  );
}

/**
 * Banner sutil que aparece bajo el input cuando la hora tipeada fue
 * auto-ajustada porque caía en un slot no disponible. Se autodestruye
 * a los 3 segundos (timer manejado en el padre).
 */
function AdjustNoticeBanner({ msg }: { msg: string }) {
  return (
    <div
      role="status"
      className="mt-1 flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/5 px-2 py-1 text-[10px] leading-tight text-warning"
    >
      <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
      <span>{msg}</span>
    </div>
  );
}
