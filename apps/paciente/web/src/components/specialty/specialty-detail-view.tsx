"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

import type { SpecialtyDetail } from "@/lib/services/specialty/types";

interface SpecialtyDetailViewProps {
  detail: SpecialtyDetail;
}

export function SpecialtyDetailView({ detail }: SpecialtyDetailViewProps) {
  const { specialty, education, doctors } = detail;

  const totalDoctors = doctors.length;
  const avgFee = (() => {
    const fees = doctors
      .map((d) => d.consultation_fee)
      .filter((f): f is number => typeof f === "number" && f > 0);
    if (fees.length === 0) return null;
    return Math.round(fees.reduce((a, b) => a + b, 0) / fees.length);
  })();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 lg:space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/buscar-medico"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a buscar médicos
      </Link>

      {/* Pending review banner */}
      {education && education.review_status === "pending_medical_review" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Contenido pendiente de revisión médica
            </p>
            <p className="mt-0.5 text-[11px] text-amber-800/90 dark:text-amber-200/80">
              Esta información se generó como borrador y aún espera la
              validación de un médico revisor. No reemplaza la consulta con un
              profesional. Las fuentes se citan al final.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-emerald-950/30 lg:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/15"
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 lg:h-20 lg:w-20">
            <Stethoscope className="h-8 w-8 lg:h-10 lg:w-10" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <BookOpen className="h-3 w-3" />
              Especialidad
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[hsl(var(--foreground))] lg:text-4xl">
              {specialty.name}
            </h1>
            {education?.intro ? (
              <p className="mt-2 max-w-3xl text-sm text-[hsl(var(--muted-foreground))] lg:text-base">
                {education.intro}
              </p>
            ) : specialty.description ? (
              <p className="mt-2 max-w-3xl text-sm text-[hsl(var(--muted-foreground))]">
                {specialty.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-2.5 py-0.5 text-[hsl(var(--foreground))]">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {totalDoctors} {totalDoctors === 1 ? "doctor" : "doctores"} verificados
              </span>
              {avgFee != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-2.5 py-0.5 text-[hsl(var(--foreground))]">
                  Consulta promedio ${avgFee}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:shrink-0 lg:w-56">
            <Link
              href={`/dashboard/buscar-medico?specialty=${specialty.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Ver doctores ({totalDoctors})
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/agendar?specialty=${specialty.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              Agendar directo
            </Link>
          </div>
        </div>
      </section>

      {!education && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            El contenido educativo para esta especialidad aún no está disponible. Mientras tanto, podés agendar directamente con un especialista verificado.
          </p>
        </section>
      )}

      {education && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-6">
          <main className="space-y-4">
            {/* Red flags — top priority for safety */}
            {education.red_flags.length > 0 && (
              <SectionCard
                tone="danger"
                icon={AlertTriangle}
                title="Señales de alarma"
                subtitle="Si tenés alguno de estos síntomas, considera urgencia o emergencia."
              >
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-[hsl(var(--foreground))]">
                  {education.red_flags.map((rf) => (
                    <li key={rf} className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 dark:border-red-900/40 dark:bg-red-950/30">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                      <span className="text-xs">{rf}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* When to consult */}
            {education.when_to_consult && (
              <SectionCard
                icon={HelpCircle}
                title="¿Cuándo deberías consultar?"
              >
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {education.when_to_consult}
                </p>
                {education.symptoms_to_consult.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {education.symptoms_to_consult.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {/* What it treats */}
            {education.what_it_treats.length > 0 && (
              <SectionCard icon={Stethoscope} title="¿Qué trata esta especialidad?">
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {education.what_it_treats.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* What to expect */}
            {education.what_to_expect && (
              <SectionCard icon={ClipboardList} title="¿Qué esperar en la consulta?">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {education.what_to_expect}
                </p>
              </SectionCard>
            )}

            {/* Preparation */}
            {education.preparation_tips.length > 0 && (
              <SectionCard icon={Sparkles} title="Cómo prepararte">
                <ul className="space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                  {education.preparation_tips.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Common procedures */}
            {education.common_procedures.length > 0 && (
              <SectionCard icon={ClipboardList} title="Procedimientos comunes">
                <ul className="space-y-2">
                  {education.common_procedures.map((p, idx) => (
                    <li
                      key={`${p.name ?? "proc"}-${idx}`}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                          {p.name ?? "—"}
                        </p>
                        {p.typical_cost_range_usd && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-300">
                            ${p.typical_cost_range_usd}
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          {p.description}
                        </p>
                      )}
                      {p.typical_duration_minutes != null && (
                        <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                          ~{p.typical_duration_minutes} min
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* FAQs */}
            {education.faqs.length > 0 && (
              <SectionCard icon={HelpCircle} title="Preguntas frecuentes">
                <ul className="space-y-3">
                  {education.faqs.map((f, idx) => (
                    <li
                      key={idx}
                      className="border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {f.question}
                      </p>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {f.answer}
                      </p>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Sources */}
            {education.sources.length > 0 && (
              <SectionCard icon={BookOpen} title="Fuentes consultadas">
                <p className="mb-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                  Este contenido se basa en fuentes oficiales. Tu doctor es la única autoridad para diagnóstico y tratamiento personalizado.
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                  {education.sources.map((src) => (
                    <li key={src.url}>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 text-emerald-600" />
                        <span className="truncate">{src.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </main>

          {/* Doctors aside */}
          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto scrollbar-hide">
            <SectionCard icon={Stethoscope} title="Doctores destacados">
              {doctors.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Aún no hay doctores verificados en esta especialidad.
                </p>
              ) : (
                <ul className="space-y-2">
                  {doctors.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/dashboard/buscar-medico/doctor/${d.slug || d.id}`}
                        className="flex items-start gap-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-2.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {d.profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.profile.avatar_url}
                              alt={d.profile.full_name ?? ""}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (d.profile.full_name ?? "?")
                              .split(" ")
                              .filter(Boolean)
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                              {d.profile.full_name}
                            </p>
                            {d.sacs_verified && (
                              <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                            {[d.profile.city, d.profile.state]
                              .filter(Boolean)
                              .join(", ") || "Venezuela"}
                          </p>
                          {d.consultation_fee != null && (
                            <p className="mt-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                              ${d.consultation_fee.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {doctors.length > 0 && (
                <Link
                  href={`/dashboard/buscar-medico?specialty=${specialty.id}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                >
                  Ver todos
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </SectionCard>
          </aside>
        </div>
      )}
    </div>
  );
}

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  tone = "default",
  children,
}: SectionCardProps) {
  const danger = tone === "danger";
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        danger
          ? "border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      }`}
    >
      <header className="mb-3 flex items-start gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[hsl(var(--foreground))]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {subtitle}
            </p>
          )}
        </div>
      </header>
      {children}
    </article>
  );
}
