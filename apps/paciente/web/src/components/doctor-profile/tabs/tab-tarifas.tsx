"use client";

import { CheckCircle2, CreditCard, Info, Wallet } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface TabTarifasProps {
  doctor: FullDoctorProfile;
}

export function TabTarifas({ doctor }: TabTarifasProps) {
  const fee = doctor.consultation_fee;
  const insurances = doctor.accepted_insurances ?? [];

  return (
    <section
      role="tabpanel"
      aria-label="Tarifas y seguros"
      className="space-y-4"
    >
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
          <Wallet className="h-4 w-4 text-emerald-600" />
          Costo de la consulta
        </h2>
        {fee != null ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
              ${fee.toFixed(2)}
            </span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              por consulta
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm italic text-[hsl(var(--muted-foreground))]">
            Tarifa a consultar al agendar.
          </p>
        )}
        {doctor.consultation_duration && (
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Duración estimada: <strong>{doctor.consultation_duration} min</strong>
          </p>
        )}
      </article>

      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
          <CreditCard className="h-4 w-4 text-emerald-600" />
          Formas de pago
        </h3>
        <ul className="mt-2 space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Efectivo en consulta (Bs / USD según el doctor).
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Transferencia bancaria.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Pagos digitales (Pago móvil, Zelle, Binance, etc. según acuerde el doctor).
          </li>
        </ul>
        <p className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          El pago se coordina <strong>directamente con el doctor</strong> al
          confirmar. Red-Salud no procesa pagos por consulta.
        </p>
      </article>

      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
          Seguros aceptados
        </h3>
        {insurances.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {insurances.map((entry, idx) => (
              <li
                key={`${entry.name ?? "ins"}-${idx}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {entry.name ?? "—"}
                  </p>
                  {entry.plan && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Plan: {entry.plan}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Aceptado
                </span>
              </li>
            ))}
          </ul>
        ) : doctor.accepts_insurance ? (
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Acepta seguros médicos. Confirmá tu plan al momento de agendar.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Este doctor no acepta seguros médicos en este momento.
          </p>
        )}
      </article>
    </section>
  );
}
