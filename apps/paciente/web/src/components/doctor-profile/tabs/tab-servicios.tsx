"use client";

import { Activity, Sparkles, Users, Video } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";
import { ageGroupLabel } from "../helpers";

interface TabServiciosProps {
  doctor: FullDoctorProfile;
}

export function TabServicios({ doctor }: TabServiciosProps) {
  const subspecs = (doctor.subspecialties ?? []).filter(Boolean);
  const areas = (doctor.specialization_areas ?? []).filter(Boolean);
  const conditions = (doctor.conditions_treated ?? []).filter(Boolean);
  const ageGroups = (doctor.age_groups ?? []).filter(Boolean);

  return (
    <section
      role="tabpanel"
      aria-label="Servicios del doctor"
      className="space-y-4"
    >
      {/* Modalidades */}
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
          Modalidades de consulta
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Presencial
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Visita el consultorio del doctor.
            </p>
          </div>
          <div
            className={`rounded-xl border p-3 ${
              doctor.accepts_telemedicine
                ? "border-sky-200 bg-sky-50 dark:border-sky-900/40 dark:bg-sky-950/30"
                : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 opacity-60"
            }`}
          >
            <p
              className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
                doctor.accepts_telemedicine
                  ? "text-sky-700 dark:text-sky-300"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              <Video className="h-3 w-3" />
              Telemedicina
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {doctor.accepts_telemedicine
                ? "Consultas por videollamada."
                : "Este doctor no ofrece videoconsultas."}
            </p>
          </div>
        </div>
      </article>

      {(subspecs.length > 0 || areas.length > 0) && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Sub-especialidades y enfoques
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...subspecs, ...areas].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      )}

      {conditions.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
            <Activity className="h-4 w-4 text-emerald-600" />
            Condiciones que trata
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm text-[hsl(var(--muted-foreground))]">
            {conditions.map((c) => (
              <li key={c} className="inline-flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </article>
      )}

      {ageGroups.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
            <Users className="h-4 w-4 text-emerald-600" />
            Grupos de pacientes
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {ageGroups.map((g) => (
              <span
                key={g}
                className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))]"
              >
                {ageGroupLabel(g)}
              </span>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}
