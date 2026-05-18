"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageSquareText,
  Quote,
  ShieldCheck,
  Star,
  ThumbsUp,
} from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface TabResenasProps {
  doctor: FullDoctorProfile;
}

interface ReviewPatient {
  first_name: string | null;
  avatar_url: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  punctuality_rating: number | null;
  communication_rating: number | null;
  professionalism_rating: number | null;
  time_dedicated_rating: number | null;
  bedside_manner_rating: number | null;
  is_anonymous: boolean;
  is_verified: boolean;
  doctor_response: string | null;
  doctor_response_at: string | null;
  helpful_count: number;
  patient: ReviewPatient | null;
}

interface ReviewsResponse {
  data: Review[];
  summary: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
}

const DIMENSION_LABELS: Record<string, string> = {
  punctuality_rating: "Puntualidad",
  communication_rating: "Claridad explicando",
  professionalism_rating: "Profesionalismo",
  time_dedicated_rating: "Tiempo dedicado",
  bedside_manner_rating: "Trato humano",
};

export function TabResenas({ doctor }: TabResenasProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/doctors/${doctor.id}/reviews?page_size=20`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        if (!ctrl.signal.aborted) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [doctor.id]);

  const summary = data?.summary;
  const total = summary?.total ?? 0;
  const average = summary?.average ?? 0;

  // Average per dimension across reviews returned
  const dims = (() => {
    const acc: Record<string, { sum: number; n: number }> = {};
    for (const r of data?.data ?? []) {
      for (const k of Object.keys(DIMENSION_LABELS)) {
        const v = (r as unknown as Record<string, number | null>)[k];
        if (typeof v === "number" && v > 0) {
          acc[k] ??= { sum: 0, n: 0 };
          acc[k].sum += v;
          acc[k].n += 1;
        }
      }
    }
    return Object.entries(acc).map(([k, { sum, n }]) => ({
      key: k,
      label: DIMENSION_LABELS[k],
      score: +(sum / n).toFixed(1),
    }));
  })();

  return (
    <section
      role="tabpanel"
      aria-label="Reseñas del doctor"
      className="space-y-4"
    >
      {/* Aggregate */}
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
          <MessageSquareText className="h-4 w-4 text-emerald-600" />
          Reseñas verificadas
          <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="inline h-3 w-3 mr-0.5" />
            Solo pacientes con cita confirmada
          </span>
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Big rating */}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[hsl(var(--foreground))] tabular-nums">
                {total > 0 ? average.toFixed(1) : "—"}
              </span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    total > 0 && s <= Math.round(average)
                      ? "fill-amber-400 text-amber-400"
                      : "text-[hsl(var(--muted-foreground))] opacity-30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {total === 0
                ? "Aún no hay reseñas"
                : `${total} ${total === 1 ? "reseña" : "reseñas"}`}
            </p>
          </div>

          {/* Distribution */}
          {summary && total > 0 && (
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution[String(star)] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-7 text-right tabular-nums text-[hsl(var(--muted-foreground))]">
                      {star} ★
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 tabular-nums text-[hsl(var(--muted-foreground))]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dimension averages */}
        {dims.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {dims.map((d) => (
              <div
                key={d.key}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-2.5 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {d.label}
                </p>
                <p className="mt-0.5 text-base font-bold text-[hsl(var(--foreground))] tabular-nums">
                  {d.score}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Reviews list */}
      {loading ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
          Cargando reseñas…
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
          Aún no hay reseñas para este doctor. Sé el primero después de tu próxima consulta.
        </div>
      ) : (
        <ul className="space-y-3">
          {(data?.data ?? []).map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {r.is_anonymous || !r.patient
                      ? "?"
                      : (r.patient.first_name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      {r.is_anonymous
                        ? "Paciente anónimo"
                        : r.patient?.first_name ?? "Paciente"}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {new Date(r.created_at).toLocaleDateString("es-VE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-[hsl(var(--muted-foreground))] opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  {r.is_verified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Verificada
                    </span>
                  )}
                </div>
              </header>

              {r.comment && (
                <p className="mt-3 text-sm text-[hsl(var(--foreground))]">
                  {r.comment}
                </p>
              )}

              {/* Per-dimension chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(DIMENSION_LABELS).map(([k, label]) => {
                  const v = (r as unknown as Record<string, number | null>)[k];
                  if (typeof v !== "number" || v <= 0) return null;
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]"
                    >
                      {label}: <strong className="text-[hsl(var(--foreground))]">{v}/5</strong>
                    </span>
                  );
                })}
              </div>

              {/* Doctor response */}
              {r.doctor_response && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border-l-2 border-emerald-400 bg-emerald-50/40 p-3 dark:bg-emerald-950/20">
                  <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      Respuesta del doctor
                      {r.doctor_response_at && (
                        <span className="ml-1.5 font-normal text-[hsl(var(--muted-foreground))]">
                          ·{" "}
                          {new Date(r.doctor_response_at).toLocaleDateString(
                            "es-VE",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--foreground))]">
                      {r.doctor_response}
                    </p>
                  </div>
                </div>
              )}

              <footer className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {r.helpful_count}{" "}
                  {r.helpful_count === 1 ? "persona la encontró útil" : "personas la encontraron útil"}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      )}

      {/* Methodology */}
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
          ¿Cómo se calculan estas reseñas?
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Sólo cuentan reseñas de pacientes con una <strong>cita confirmada y completada</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            Filtros anti-spam y revisión manual de reportes.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            El doctor puede responder públicamente a cada reseña — derecho a réplica.
          </li>
        </ul>
      </article>
    </section>
  );
}
