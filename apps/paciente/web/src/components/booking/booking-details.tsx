"use client";

import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Heart,
  Info,
  MapPin,
  Pill,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BookingDetailsProps {
  appointmentType: "presencial" | "telemedicina";
  reason: string;
  notes: string;
  onTypeChange: (type: "presencial" | "telemedicina") => void;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface ReasonChip {
  label: string;
  icon: LucideIcon;
}

// Chips with icons read better than a plain text list and give the user a
// shortcut for the most common reasons. Order matters — most-used first.
const REASON_CHIPS: ReasonChip[] = [
  { label: "Consulta general", icon: Stethoscope },
  { label: "Control de rutina", icon: ClipboardList },
  { label: "Dolor o molestia", icon: Heart },
  { label: "Revisión de resultados", icon: Eye },
  { label: "Segunda opinión", icon: FileText },
  { label: "Seguimiento de tratamiento", icon: Pill },
];

const REASON_MAX = 280;

export function BookingDetails({
  appointmentType,
  reason,
  notes,
  onTypeChange,
  onReasonChange,
  onNotesChange,
  onBack,
  onContinue,
}: BookingDetailsProps) {
  const trimmed = reason.trim();
  const canContinue = trimmed.length >= 3;
  const reasonOver = reason.length > REASON_MAX;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cambiar horario
        </button>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Detalles de la consulta
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Completa la información para que el doctor llegue preparado
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Appointment type */}
          <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <header className="mb-3">
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                Tipo de consulta
              </h3>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                ¿Cómo querés tener tu consulta?
              </p>
            </header>
            <div className="grid grid-cols-2 gap-3">
              <TypeOption
                active={appointmentType === "presencial"}
                onClick={() => onTypeChange("presencial")}
                icon={MapPin}
                title="Presencial"
                description="Visita el consultorio del doctor"
                accent="emerald"
              />
              <TypeOption
                active={appointmentType === "telemedicina"}
                onClick={() => onTypeChange("telemedicina")}
                icon={Video}
                title="Telemedicina"
                description="Consulta por videollamada"
                accent="sky"
              />
            </div>
          </section>

          {/* Reason */}
          <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <header className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Motivo de la consulta <span className="text-emerald-600">*</span>
                </h3>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Una línea es suficiente. Cuanto más específico, mejor.
                </p>
              </div>
              <span
                className={`text-[11px] tabular-nums ${
                  reasonOver
                    ? "text-red-600"
                    : reason.length > REASON_MAX * 0.8
                      ? "text-amber-600"
                      : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {reason.length}/{REASON_MAX}
              </span>
            </header>

            <textarea
              id="reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              placeholder="Ej: Dolor en el pecho recurrente desde hace 3 días."
              maxLength={REASON_MAX + 30}
              className={`w-full resize-none rounded-2xl border bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                reasonOver
                  ? "border-red-400 focus:border-red-500"
                  : "border-[hsl(var(--border))] focus:border-emerald-500"
              }`}
            />

            {/* Quick chips. Stay rendered even after the user has typed so
                they can swap their picked reason without manually clearing. */}
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Sugerencias rápidas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REASON_CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  const active =
                    trimmed.toLowerCase() === chip.label.toLowerCase();
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => onReasonChange(chip.label)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-[hsl(var(--muted-foreground))]"}`} />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <header className="mb-3">
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                Notas adicionales{" "}
                <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                  (opcional)
                </span>
              </h3>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Medicamentos que tomas, alergias, antecedentes relevantes...
              </p>
            </header>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              placeholder="Información que ayude al doctor a prepararse mejor."
              className="w-full resize-none rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </section>
        </div>

        {/* Aside */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-[hsl(var(--card))]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Casi listo
                </p>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Solo falta confirmar
                </p>
                <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  Tu cita queda en estado <strong>pendiente</strong> hasta que el doctor la acepte. Te avisamos al instante por notificación.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Buenas prácticas
            </p>
            <ul className="mt-2 space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Sé específico con tus síntomas y desde cuándo los tienes.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Menciona si ya tomas medicamentos.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Si tenés exámenes recientes, súbelos en tu historial.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                <Info className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Si necesitas asistencia urgente,{" "}
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    usa el botón de emergencia
                  </span>{" "}
                  en lugar de agendar.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
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
          disabled={!canContinue || reasonOver}
          title={
            !canContinue
              ? "Escribí brevemente el motivo de la consulta"
              : reasonOver
                ? `El motivo excede ${REASON_MAX} caracteres`
                : undefined
          }
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Revisar y confirmar
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── TypeOption (Presencial / Telemedicina) ────────────────────────────────

function TypeOption({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "emerald" | "sky";
}) {
  const accentClasses = active
    ? accent === "emerald"
      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15 dark:bg-emerald-950/40"
      : "border-sky-500 bg-sky-50 ring-2 ring-sky-500/15 dark:bg-sky-950/40"
    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-emerald-300";
  const iconBg = active
    ? accent === "emerald"
      ? "bg-emerald-600 text-white"
      : "bg-sky-600 text-white"
    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${accentClasses}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</span>
      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{description}</span>
    </button>
  );
}
