"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MessageCircle,
  Plus,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import Link from "next/link";

import type { BookingState } from "@/hooks/use-booking";
import type { AppointmentResult } from "@/lib/services/booking-service";

interface BookingSuccessProps {
  state: BookingState;
  appointment: AppointmentResult | null;
  onBookAnother: () => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function honorific(fullName: string): "Dr." | "Dra." {
  const first = (fullName?.split(" ")[0] || "").toLowerCase();
  return first.endsWith("a") ? "Dra." : "Dr.";
}

function generateICSContent(
  state: BookingState,
  appointment: AppointmentResult | null,
): string {
  if (!state.date || !state.timeSlot) return "";
  const fullName = state.doctor?.profile.full_name || "Doctor";

  const [startH, startM] = state.timeSlot.start.split(":").map(Number);
  const start = new Date(`${state.date}T12:00:00`);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const formatICSDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const uid = appointment?.id || crypto.randomUUID();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Red-Salud//Citas//ES",
    "BEGIN:VEVENT",
    `UID:${uid}@redsalud.com`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:Cita médica con ${honorific(fullName)} ${fullName}`,
    `DESCRIPTION:${state.appointmentType === "telemedicina" ? "Consulta por telemedicina" : "Consulta presencial"} — ${state.specialty?.name || ""} — Motivo: ${state.reason}`,
    `LOCATION:${state.appointmentType === "telemedicina" ? "Telemedicina (enlace pendiente)" : "Consultorio del doctor"}`,
    "STATUS:TENTATIVE",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de cita médica en 30 minutos",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function BookingSuccess({
  state,
  appointment,
  onBookAnother,
}: BookingSuccessProps) {
  const fullName = state.doctor?.profile.full_name || "Doctor";
  const title = honorific(fullName);
  const isTele = state.appointmentType === "telemedicina";

  const handleDownloadICS = () => {
    const ics = generateICSContent(state, appointment);
    if (!ics) return;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cita-${state.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 flex-1 min-h-0 lg:gap-4">
      {/* On lg+ we split into two columns: left = hero + recap (the "what
          you booked"), right = next steps + actions (the "what now").
          Mobile/tablet stays as a single scrolling column. */}
      <div className="grid flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-5">
        {/* LEFT column: hero + summary. Internal scroll only if both cards
            don't fit (very rarely on lg+). */}
        <div className="flex min-h-0 flex-col gap-3 lg:gap-4 overflow-y-auto scrollbar-hide">
          {/* Hero */}
          <div className="shrink-0 relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 text-center shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-emerald-950/30 sm:p-5 lg:p-7 lg:text-left">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/20 lg:h-40 lg:w-40"
            />

            <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 lg:mx-0 lg:mb-4 lg:h-16 lg:w-16">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-emerald-300/40 opacity-60"
              />
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-500/40 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-[hsl(var(--foreground))] sm:text-xl lg:text-3xl">
              ¡Cita agendada!
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-xs text-[hsl(var(--muted-foreground))] sm:text-sm lg:mx-0 lg:mt-2 lg:max-w-none lg:text-base">
              Tu solicitud con {title} {fullName} fue registrada. Te avisamos cuando el doctor la confirme.
            </p>

            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400 lg:mt-3 lg:px-3 lg:py-1 lg:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pendiente de confirmación
            </span>
          </div>

          {/* Appointment summary */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm lg:gap-4 lg:p-5">
            <SummaryRow
              icon={Calendar}
              label="Fecha"
              value={
                state.date ? (
                  <span className="capitalize">{formatDateLabel(state.date)}</span>
                ) : (
                  "—"
                )
              }
            />
            <SummaryRow
              icon={Clock}
              label="Hora"
              value={
                state.timeSlot ? (
                  <span className="tabular-nums">
                    {state.timeSlot.start}–{state.timeSlot.end}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <SummaryRow
              icon={Stethoscope}
              label="Especialidad"
              value={state.specialty?.name ?? "—"}
            />
            <SummaryRow
              icon={isTele ? Video : Stethoscope}
              label="Modalidad"
              value={isTele ? "Telemedicina" : "Presencial"}
            />
          </div>
        </div>

        {/* RIGHT column: what's next + actions stacked. */}
        <div className="flex min-h-0 flex-col gap-3 lg:gap-4 overflow-y-auto scrollbar-hide">
          {/* What happens next */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm lg:p-5">
            <header className="mb-2 flex items-center gap-1.5 lg:mb-4">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 lg:h-4 lg:w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] lg:text-sm lg:normal-case lg:tracking-normal lg:text-[hsl(var(--foreground))]">
                ¿Qué sigue?
              </h3>
            </header>
            <ol className="space-y-2 text-sm text-[hsl(var(--muted-foreground))] lg:space-y-4">
              <NextStep
                number={1}
                title="El doctor revisa tu solicitud"
                description="Te avisamos apenas acepte (normalmente <24h)."
              />
              <NextStep
                number={2}
                title="Recibís confirmación"
                description={
                  isTele
                    ? "Enlace de videollamada al email y push."
                    : "Te confirmamos la dirección del consultorio."
                }
              />
              <li className="hidden sm:flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 lg:h-7 lg:w-7 lg:text-xs">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Asistís a tu cita</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] lg:text-sm">
                    Agregala al calendario o gestionala desde &apos;Mis citas&apos;.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Actions — primary CTA stays prominent on lg+ */}
          <div className="flex flex-col gap-2 lg:gap-3">
            <Link
              href="/dashboard/citas"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] lg:py-3 lg:text-base"
            >
              Ver mis citas
            </Link>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadICS}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] lg:py-3"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar al calendario</span>
                <span className="sm:hidden">Calendario</span>
              </button>
              <Link
                href="/dashboard/mensajes"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] lg:py-3"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Escribir al doctor</span>
                <span className="sm:hidden">Mensaje</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-centered tertiary action shared across breakpoints. */}
      <button
        type="button"
        onClick={onBookAnother}
        className="shrink-0 self-center inline-flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-colors lg:text-xs"
      >
        <Plus className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
        Agendar otra cita
      </button>
    </div>
  );
}

// ─── Sub components ────────────────────────────────────────────────────────

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0 lg:gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 lg:h-9 lg:w-9 lg:rounded-xl">
        <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] lg:text-[10px]">
          {label}
        </p>
        <div className="text-xs font-semibold text-[hsl(var(--foreground))] truncate lg:text-sm">
          {value}
        </div>
      </div>
    </div>
  );
}

function NextStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</p>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
    </li>
  );
}
