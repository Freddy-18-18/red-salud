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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 text-center shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-emerald-950/30">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-700/15"
        />

        {/* Check icon with halo */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-emerald-300/40 opacity-60"
          />
          <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/40">
            <CheckCircle2 className="h-10 w-10" />
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-[hsl(var(--foreground))] sm:text-3xl">
          ¡Cita agendada!
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[hsl(var(--muted-foreground))]">
          Tu solicitud con {title} {fullName} fue registrada. Te avisamos cuando el doctor la confirme.
        </p>

        {/* Status pill */}
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pendiente de confirmación
        </span>
      </div>

      {/* Appointment summary */}
      <div className="grid grid-cols-1 gap-3 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:grid-cols-2">
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
                {state.timeSlot.start} – {state.timeSlot.end}
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

      {/* What happens next — sets expectations */}
      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <header className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
            ¿Qué sigue ahora?
          </h3>
        </header>
        <ol className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
          <NextStep
            number={1}
            title="El doctor revisa tu solicitud"
            description="Recibirás una notificación apenas la acepte (normalmente en menos de 24 horas)."
          />
          <NextStep
            number={2}
            title="Recibís la confirmación"
            description={
              isTele
                ? "Te llegará el enlace de la videollamada al email y como push."
                : "Te confirmamos la dirección exacta del consultorio."
            }
          />
          <NextStep
            number={3}
            title="Asistís a tu cita"
            description="Podés agregarla a tu calendario o gestionarla desde 'Mis citas'."
          />
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownloadICS}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <Download className="h-4 w-4" />
          Agregar al calendario
        </button>
        <Link
          href="/dashboard/mensajes"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <MessageCircle className="h-4 w-4" />
          Escribir al doctor
        </Link>
        <Link
          href="/dashboard/citas"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          Ver mis citas
        </Link>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onBookAnother}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Agendar otra cita
        </button>
      </div>
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
    <div className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
        <div className="text-sm font-semibold text-[hsl(var(--foreground))]">
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
