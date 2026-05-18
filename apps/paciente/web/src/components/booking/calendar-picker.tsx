"use client";

import {
  ArrowLeft,
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { AvailableDate } from "@/lib/services/booking-service";

const DAYS_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const DAYS_LONG = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey(): string {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

function formatLongDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="animate-pulse rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))]" />
          <div className="h-5 w-32 rounded bg-[hsl(var(--muted))]" />
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))]" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        <div className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="h-4 w-24 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

interface CalendarPickerProps {
  availableDates: AvailableDate[];
  loading: boolean;
  selectedDate: string | null;
  doctorName: string;
  onSelectDate: (date: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CalendarPicker({
  availableDates,
  loading,
  selectedDate,
  doctorName,
  onSelectDate,
  onBack,
  onContinue,
}: CalendarPickerProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Map available dates to slot counts so we can show "Available · N slots"
  // hints on hover and a side panel summary.
  const dateCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of availableDates) {
      const count = (d as unknown as { available_count?: number }).available_count;
      // dateCountMap supports both API shapes (count via available_count, or
      // a boolean hasSlots from the legacy mapping).
      map.set(d.date, count ?? (d.hasSlots ? 1 : 0));
    }
    return map;
  }, [availableDates]);

  const availableSet = useMemo(() => {
    const s = new Set<string>();
    for (const [date, count] of dateCountMap.entries()) {
      if (count > 0) s.add(date);
    }
    return s;
  }, [dateCountMap]);

  // Calendar grid: leading blanks + numbered days. Padded so the grid is
  // always 6 rows tall — keeps month transitions stable visually.
  const calendarDays = useMemo(() => {
    const startDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length < 42) days.push(null);
    return days;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const todayStr = todayKey();
  const totalAvailableThisMonth = useMemo(() => {
    const yearMonthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    let count = 0;
    for (const d of availableSet) if (d.startsWith(yearMonthPrefix)) count++;
    return count;
  }, [availableSet, viewMonth, viewYear]);

  // ─── Loading shell ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cambiar doctor
          </button>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Buscando disponibilidad...
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cargando agenda de Dr. {doctorName} para los próximos 30 días
          </p>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  const noAvailability = availableSet.size === 0;

  // ─── Empty state ───────────────────────────────────────────────────────
  if (noAvailability) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cambiar doctor
        </button>
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <CalendarX className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Sin disponibilidad
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Dr. {doctorName} no tiene horarios libres en los próximos 30 días
              </p>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                Probá con otro doctor o vuelve más tarde — los doctores actualizan su agenda con frecuencia.
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Elegir otro doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Populated calendar ────────────────────────────────────────────────
  const selectedSlots = selectedDate ? dateCountMap.get(selectedDate) ?? 0 : 0;

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Header — compact */}
      <div className="shrink-0 flex items-baseline justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Cambiar doctor
          </button>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Selecciona la fecha
          </h2>
        </div>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          Disponibilidad de Dr. {doctorName} · próximos 30 días
        </p>
      </div>

      {/* Layout: calendar + side panel on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px] flex-1 min-h-0">
        {/* Calendar */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
          {/* Month nav */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              aria-label="Mes anterior"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[hsl(var(--border))] disabled:hover:text-[hsl(var(--muted-foreground))]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                {MONTHS[viewMonth]} {viewYear}
              </h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                {totalAvailableThisMonth} {totalAvailableThisMonth === 1 ? "día disponible" : "días disponibles"}
              </p>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              aria-label="Mes siguiente"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[hsl(var(--border))] disabled:hover:text-[hsl(var(--muted-foreground))]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers — tight */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS_SHORT.map((d) => (
              <div
                key={d}
                className="py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid — tighter */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="h-9" />;
              }
              const dStr = dateKey(viewYear, viewMonth, day);
              const isPast = dStr < todayStr;
              const isAvailable = availableSet.has(dStr);
              const isSelected = dStr === selectedDate;
              const isToday = dStr === todayStr;
              const slotCount = dateCountMap.get(dStr) ?? 0;
              const disabled = isPast || !isAvailable;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => !disabled && onSelectDate(dStr)}
                  disabled={disabled}
                  aria-label={`${day} de ${MONTHS[viewMonth]}${
                    isAvailable ? `, ${slotCount} horarios disponibles` : ", sin horarios"
                  }`}
                  className={`group relative h-9 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                      : disabled
                        ? "text-[hsl(var(--muted-foreground))] opacity-40 cursor-not-allowed"
                        : isToday
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40"
                          : "text-[hsl(var(--foreground))] hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                  }`}
                >
                  <span className="relative z-10">{day}</span>
                  {isAvailable && !isSelected && !isPast && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex h-1.5 items-center gap-0.5`}
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center justify-center gap-4 border-t border-[hsl(var(--border))] pt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Disponible
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900/40" />
              Hoy
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald-600" />
              Seleccionado
            </div>
          </div>
        </div>

        {/* Side panel: selection summary or hint */}
        <aside className="hidden md:flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {selectedDate ? (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-[hsl(var(--card))]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Fecha elegida
                  </p>
                  <p className="text-sm font-bold capitalize text-[hsl(var(--foreground))]">
                    {formatLongDate(selectedDate)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100 dark:bg-[hsl(var(--card))] dark:ring-emerald-900/40">
                  <p className="text-lg font-extrabold text-emerald-700 tabular-nums dark:text-emerald-400">
                    {selectedSlots}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Horarios libres
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100 dark:bg-[hsl(var(--card))] dark:ring-emerald-900/40">
                  <p className="inline-flex items-center gap-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                    <Clock className="h-4 w-4" />
                    30
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Min/cita
                  </p>
                </div>
              </div>
              <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-emerald-800/80 dark:text-emerald-200/80">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                Continúa para elegir un horario específico.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  <Info className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    Elige un día
                  </p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    Los días con punto verde tienen horarios disponibles. Toca uno para ver los detalles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              En los próximos 30 días
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {availableSet.size}{" "}
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {availableSet.size === 1 ? "día disponible" : "días disponibles"}
              </span>
            </p>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              Mañanas y tardes. Cita estándar de 30 minutos.
            </p>
          </div>
        </aside>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedDate}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
