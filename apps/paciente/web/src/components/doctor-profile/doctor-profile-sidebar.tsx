"use client";

import {
  CalendarPlus,
  Clock,
  CreditCard,
  Lock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface DoctorProfileSidebarProps {
  doctor: FullDoctorProfile;
  onBook: () => void;
}

export function DoctorProfileSidebar({
  doctor,
  onBook,
}: DoctorProfileSidebarProps) {
  return (
    <div className="space-y-3">
      {/* Booking card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Listo para agendar
        </p>
        {doctor.consultation_fee != null ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
              ${doctor.consultation_fee.toFixed(2)}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              consulta
            </span>
          </div>
        ) : (
          <p className="mt-1 text-base font-semibold text-[hsl(var(--foreground))]">
            Tarifa a consultar
          </p>
        )}
        {doctor.consultation_duration && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3 w-3" />
            {doctor.consultation_duration} min por consulta
          </p>
        )}

        <button
          type="button"
          onClick={onBook}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar cita
        </button>

        <Link
          href="/dashboard/mensajes"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <MessageSquare className="h-4 w-4" />
          Enviar mensaje
        </Link>
      </div>

      {/* Payment & insurance highlights */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Formas de pago
        </p>
        <div className="mt-2 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
          <p className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Pago directo al doctor al confirmar (efectivo, transferencia, pago digital).
          </p>
          {doctor.accepts_insurance && (
            <p className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              Acepta seguros médicos privados.
            </p>
          )}
          {doctor.accepts_telemedicine && (
            <p className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              Disponible para videoconsulta.
            </p>
          )}
        </div>
      </div>

      {/* Trust signals */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Seguro y privado
            </p>
            <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
              Tu información médica es confidencial. Sólo el doctor que elijas verá tu motivo y notas.
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
            <CreditCard className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Cancelación flexible
            </p>
            <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
              Cancela hasta 24h antes sin costo. Después queda registrada como inasistencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
