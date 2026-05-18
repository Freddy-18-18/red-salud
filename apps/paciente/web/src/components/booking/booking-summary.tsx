"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Lock,
  MapPin,
  Stethoscope,
  Video,
} from "lucide-react";

import type { BookingState } from "@/hooks/use-booking";

interface BookingSummaryProps {
  state: BookingState;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
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

function honorific(fullName: string, gender?: string | null): "Dr." | "Dra." {
  const g = (gender || "").toLowerCase();
  if (g === "femenino" || g === "f" || g === "female") return "Dra.";
  if (g === "masculino" || g === "m" || g === "male") return "Dr.";
  // Heuristic by first name (vowel ending → Dra. for Venezuelan female names)
  const first = (fullName?.split(" ")[0] || "").toLowerCase();
  if (first.endsWith("a")) return "Dra.";
  return "Dr.";
}

export function BookingSummary({
  state,
  loading,
  error,
  onConfirm,
  onBack,
}: BookingSummaryProps) {
  const fullName = state.doctor?.profile.full_name || "Doctor";
  const title = honorific(
    fullName,
    (state.doctor?.profile as { gender?: string })?.gender
  );
  const initials = fullName
    .split(" ")
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fee = state.doctor?.consultation_fee ?? null;
  const isTele = state.appointmentType === "telemedicina";
  const location =
    [state.doctor?.profile.city, state.doctor?.profile.state]
      .filter(Boolean)
      .join(", ") || null;

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Header — compact */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-3 w-3" />
          Modificar detalles
        </button>
        <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
          Confirma tu cita
        </h2>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px] flex-1 min-h-0">
        {/* Main column — appointment details */}
        <div className="space-y-2.5 overflow-y-auto scrollbar-hide pr-1 -mr-1">
          {/* Doctor compact card — avatar + name + specialty in one row */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-3 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-[hsl(var(--card))]">
            {state.doctor?.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.doctor.profile.avatar_url}
                alt={fullName}
                className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[hsl(var(--foreground))]">
                {title} {fullName}
              </h3>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <Stethoscope className="h-2.5 w-2.5" />
                <span className="truncate">{state.specialty?.name}</span>
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div className="space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
            <DetailRow
              icon={Calendar}
              accent="emerald"
              label="Fecha"
              value={
                state.date ? (
                  <span className="capitalize">{formatDateLabel(state.date)}</span>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              icon={Clock}
              accent="amber"
              label="Hora"
              value={
                state.timeSlot ? (
                  <>
                    <span className="font-bold tabular-nums">
                      {state.timeSlot.start} → {state.timeSlot.end}
                    </span>
                    <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                      30 min
                    </span>
                  </>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              icon={isTele ? Video : MapPin}
              accent={isTele ? "sky" : "indigo"}
              label="Modalidad"
              value={
                isTele
                  ? "Telemedicina (videollamada)"
                  : `Presencial${location ? ` · ${location}` : ""}`
              }
            />
            <DetailRow
              icon={FileText}
              accent="violet"
              label="Motivo"
              value={
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    {state.reason || "—"}
                  </p>
                  {state.notes && (
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="font-semibold">Notas:</span> {state.notes}
                    </p>
                  )}
                </div>
              }
            />
          </div>

          {/* Mobile-only price summary — duplicates aside content for <md
              where the aside is hidden. Critical: user must see the cost
              before confirming. */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/30 md:hidden">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Costo
                </p>
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums leading-none">
                  {fee !== null && fee !== undefined ? `$${fee.toFixed(2)}` : "Sin precio"}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 max-w-[180px] text-right">
              Pago directo con el doctor al confirmar la cita.
            </p>
          </div>

          {/* Pending notice — compact */}
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[11px] text-amber-800 dark:text-amber-200">
              Tu cita queda <strong>pendiente</strong> hasta que {title} {fullName.split(" ")[0]} la revise. Te avisamos por notificación.
            </p>
          </div>
        </div>

        {/* Aside — billing + security. Hidden on mobile to keep page in viewport;
             critical info (price + pending notice) lives in main column. */}
        <aside className="hidden md:flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-[hsl(var(--card))]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Costo de la consulta
                </p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {fee !== null && fee !== undefined ? `$${fee.toFixed(2)}` : "Sin precio"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
              El pago se coordina directamente con el doctor al confirmar la cita. Aceptamos efectivo, transferencia o pago digital según lo que el doctor indique.
            </p>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[hsl(var(--foreground))]">
                  Seguro y privado
                </p>
                <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                  Tus datos están cifrados. Sólo el doctor que elegiste verá tu motivo y notas.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Política de cancelación
            </p>
            <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              Podés cancelar la cita hasta <strong>24 horas antes</strong> sin costo. Después de eso queda registrada como inasistencia.
            </p>
          </div>
        </aside>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Agendando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirmar cita
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Detail row ────────────────────────────────────────────────────────────

type Accent = "emerald" | "amber" | "sky" | "indigo" | "violet";

function DetailRow({
  icon: Icon,
  accent,
  label,
  value,
}: {
  icon: typeof Calendar;
  accent: Accent;
  label: string;
  value: React.ReactNode;
}) {
  const tones: Record<Accent, { bg: string; text: string }> = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400" },
    sky: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-400" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400" },
  };
  const tone = tones[accent];
  return (
    <div className="flex items-start gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.bg}`}>
        <Icon className={`h-4 w-4 ${tone.text}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-[hsl(var(--foreground))]">{value}</div>
      </div>
    </div>
  );
}
