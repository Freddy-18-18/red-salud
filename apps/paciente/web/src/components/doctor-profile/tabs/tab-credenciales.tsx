"use client";

import { Award, BookOpen, Briefcase, GraduationCap, Users } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface TabCredencialesProps {
  doctor: FullDoctorProfile;
}

export function TabCredenciales({ doctor }: TabCredencialesProps) {
  const certs = (doctor.certifications ?? []).filter(Boolean);
  const awards = doctor.awards ?? [];
  const publications = doctor.publications ?? [];
  const associations = doctor.associations ?? [];
  const work = doctor.work_experience ?? [];

  return (
    <section
      role="tabpanel"
      aria-label="Credenciales del doctor"
      className="space-y-4"
    >
      {/* Education + license */}
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
          <GraduationCap className="h-4 w-4 text-emerald-600" />
          Formación y matrícula
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {doctor.university && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Universidad
              </p>
              <p className="text-sm text-[hsl(var(--foreground))]">
                {doctor.university}
              </p>
              {doctor.graduation_year && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Egresó en {doctor.graduation_year}
                </p>
              )}
            </div>
          )}
          {doctor.medical_license && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Cédula profesional / MPPS
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">
                {doctor.medical_license}
              </p>
            </div>
          )}
          {doctor.college_number && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Colegio / N° de inscripción
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">
                {doctor.college_number}
              </p>
            </div>
          )}
          {doctor.sacs_verified && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Verificación SACS
              </p>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Confirmada
              </p>
              {doctor.verified_at && (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Verificado el{" "}
                  {new Date(doctor.verified_at).toLocaleDateString("es-VE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </article>

      {certs.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Award className="h-4 w-4 text-emerald-600" />
            Certificaciones
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-sm text-[hsl(var(--muted-foreground))]">
            {certs.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </article>
      )}

      {awards.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Award className="h-4 w-4 text-amber-600" />
            Premios y reconocimientos
          </h3>
          <ul className="mt-3 space-y-2">
            {awards.map((a, idx) => (
              <li
                key={`${a.title ?? "award"}-${idx}`}
                className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-[hsl(var(--muted-foreground))]"
              >
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    {a.title ?? "—"}
                  </p>
                  {a.issuer && (
                    <p className="text-xs">{a.issuer}</p>
                  )}
                </div>
                {a.year && (
                  <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                    {a.year}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </article>
      )}

      {publications.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <BookOpen className="h-4 w-4 text-violet-600" />
            Publicaciones
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
            {publications.map((p, idx) => (
              <li key={`${p.title ?? "pub"}-${idx}`}>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  {p.title ?? "—"}
                </p>
                <p className="text-xs">
                  {[p.journal, p.year].filter(Boolean).join(" · ")}
                </p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    Ver publicación →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </article>
      )}

      {associations.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Users className="h-4 w-4 text-emerald-600" />
            Sociedades médicas
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            {associations.map((a, idx) => (
              <li key={`${a.name ?? "ass"}-${idx}`} className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {a.name ?? "—"}
                  </span>
                  {a.role && <span className="text-xs"> · {a.role}</span>}
                </div>
                {a.since && (
                  <span className="text-xs tabular-nums">desde {a.since}</span>
                )}
              </li>
            ))}
          </ul>
        </article>
      )}

      {work.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Briefcase className="h-4 w-4 text-emerald-600" />
            Experiencia profesional
          </h3>
          <ol className="mt-3 space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
            {work.map((w, idx) => (
              <li
                key={`${w.position ?? "work"}-${idx}`}
                className="border-l-2 border-emerald-200 pl-3 dark:border-emerald-900/40"
              >
                <p className="font-medium text-[hsl(var(--foreground))]">
                  {w.position ?? "—"}
                  {w.organization && (
                    <span className="text-xs font-normal">
                      {" "}· {w.organization}
                    </span>
                  )}
                </p>
                {(w.start_year || w.end_year) && (
                  <p className="text-[11px] tabular-nums">
                    {w.start_year ?? "—"} → {w.end_year ?? "actual"}
                  </p>
                )}
                {w.description && (
                  <p className="mt-1 text-xs">{w.description}</p>
                )}
              </li>
            ))}
          </ol>
        </article>
      )}
    </section>
  );
}
