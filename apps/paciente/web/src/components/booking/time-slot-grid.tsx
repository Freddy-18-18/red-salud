"use client";

import {
  ArrowLeft,
  CalendarCheck,
  ChevronRight,
  Clock,
  Info,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TimeSlotGroup } from "@/lib/services/booking-service";

// ─── Section visuals ───────────────────────────────────────────────────────

interface SectionStyle {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

const SECTION_STYLE: Record<string, SectionStyle> = {
  Mañana: {
    icon: Sunrise,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
  },
  Manana: {
    icon: Sunrise,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
  },
  Tarde: {
    icon: Sun,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
  },
  Noche: {
    icon: Moon,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
};

const FALLBACK_STYLE: SectionStyle = {
  icon: Clock,
  iconColor: "text-emerald-600 dark:text-emerald-400",
  iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {[0, 1].map((g) => (
          <div key={g} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 animate-pulse">
            <div className="mb-4 h-5 w-32 rounded bg-[hsl(var(--muted))]" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-[hsl(var(--muted))]" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <div className="h-40 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="h-4 w-24 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

interface TimeSlotGridProps {
  groups: TimeSlotGroup[];
  loading: boolean;
  selectedSlot: { start: string; end: string } | null;
  dateLabel: string;
  onSelect: (slot: { start: string; end: string }) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function TimeSlotGrid({
  groups,
  loading,
  selectedSlot,
  dateLabel,
  onSelect,
  onBack,
  onContinue,
}: TimeSlotGridProps) {
  // Defensive normalization. The BFF mapping in booking-service should
  // already ship an array, but if a stale fixture or edge cache sneaks an
  // object back through, we fall back to an empty list instead of crashing.
  const safeGroups: TimeSlotGroup[] = Array.isArray(groups) ? groups : [];

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
            Cambiar fecha
          </button>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Cargando horarios...
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Buscando cupos disponibles para {dateLabel}
          </p>
        </div>
        <SlotSkeleton />
      </div>
    );
  }

  const allSlots = safeGroups.flatMap((g) => g.slots);
  const availableSlots = allSlots.filter((s) => s.available);

  // ─── Empty state ───────────────────────────────────────────────────────
  if (availableSlots.length === 0) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cambiar fecha
        </button>
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <Clock className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Sin cupos
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                No hay horarios disponibles para {dateLabel}
              </p>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                Probá con otra fecha — la agenda se actualiza cuando otros pacientes cancelan o se agregan turnos.
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Elegir otra fecha
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Populated grid ────────────────────────────────────────────────────
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
            Cambiar fecha
          </button>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Selecciona la hora
          </h2>
        </div>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          {availableSlots.length} {availableSlots.length === 1 ? "horario" : "horarios"} para{" "}
          <span className="capitalize text-[hsl(var(--foreground))] font-medium">
            {dateLabel}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px] flex-1 min-h-0">
        {/* Slots column */}
        <div className="space-y-2 overflow-y-auto scrollbar-hide pr-1 -mr-1">
          {safeGroups.map((group) => {
            const available = group.slots.filter((s) => s.available);
            if (available.length === 0) return null;
            const style = SECTION_STYLE[group.label] ?? FALLBACK_STYLE;
            const Icon = style.icon;

            return (
              <section
                key={group.label}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm"
              >
                <header className="mb-2 flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[hsl(var(--foreground))]">
                      {group.label}
                    </h3>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {available.length}{" "}
                      {available.length === 1 ? "cupo libre" : "cupos libres"}
                    </p>
                  </div>
                </header>

                {/* Slot pills. Unavailable slots stay visible but dimmed. */}
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {group.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.start === slot.start &&
                      selectedSlot?.end === slot.end;
                    const baseClasses =
                      "relative inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

                    if (!slot.available) {
                      return (
                        <span
                          key={`${slot.start}-${slot.end}`}
                          aria-label={`${slot.start} no disponible`}
                          className={`${baseClasses} bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] line-through opacity-50 cursor-not-allowed`}
                        >
                          {slot.start}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={`${slot.start}-${slot.end}`}
                        type="button"
                        onClick={() => onSelect({ start: slot.start, end: slot.end })}
                        aria-pressed={isSelected}
                        className={`${baseClasses} ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                            : "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                        }`}
                      >
                        {slot.start}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Side panel */}
        <aside className="hidden md:flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {selectedSlot ? (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-[hsl(var(--card))]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Cita elegida
                  </p>
                  <p className="text-sm font-bold capitalize text-[hsl(var(--foreground))]">
                    {dateLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-emerald-100 dark:bg-[hsl(var(--card))] dark:ring-emerald-900/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Horario
                </p>
                <p className="mt-0.5 text-2xl font-extrabold text-[hsl(var(--foreground))] tabular-nums">
                  {selectedSlot.start}
                  <span className="mx-1.5 text-base font-medium text-[hsl(var(--muted-foreground))]">
                    →
                  </span>
                  {selectedSlot.end}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  <Clock className="h-3 w-3" />
                  Cita estándar de 30 minutos
                </p>
              </div>

              <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-emerald-800/80 dark:text-emerald-200/80">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                Falta poco — sigue para confirmar el motivo de la consulta.
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
                    Elige un horario
                  </p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    Tocá cualquier botón verde para reservar ese turno. Los grises ya están ocupados o fuera de horario.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Resumen del día
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {availableSlots.length}{" "}
              <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {availableSlots.length === 1 ? "horario libre" : "horarios libres"}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {safeGroups
                .filter((g) => g.slots.some((s) => s.available))
                .map((g) => {
                  const style = SECTION_STYLE[g.label] ?? FALLBACK_STYLE;
                  const Icon = style.icon;
                  const cnt = g.slots.filter((s) => s.available).length;
                  return (
                    <span
                      key={g.label}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.iconBg} ${style.iconColor}`}
                    >
                      <Icon className="h-3 w-3" />
                      {g.label} · {cnt}
                    </span>
                  );
                })}
            </div>
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
          disabled={!selectedSlot}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
