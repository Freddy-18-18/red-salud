"use client";

import {
  ArrowRight,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface DoctorHit {
  id: string;
  slug: string | null;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  specialty_name: string | null;
  consultation_fee: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepts_telemedicine: boolean | null;
  sacs_verified: boolean | null;
}
interface SpecialtyHit {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  doctor_count: number;
}
interface OrientationSpec {
  name: string;
  weight: number;
  reason: string;
  slug: string | null;
  doctor_count: number;
  specialty_id: string | null;
}
interface OrientationData {
  summary: string;
  advice: string;
  needs_urgent_attention: boolean;
  specialties: OrientationSpec[];
}
interface SearchResponse {
  doctors: DoctorHit[];
  specialties: SpecialtyHit[];
  orientation: OrientationData | null;
  used_ai: boolean;
}

const CHIPS = [
  "Cardiología",
  "Pediatría",
  "Dermatología",
  "Ginecología",
  "Caracas",
  "Telemedicina",
];

export function SmartSearch() {
  const [text, setText] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");

  const submit = async (raw?: string) => {
    const q = (raw ?? text).trim();
    if (q.length < 1) return;
    if (q === lastQueryRef.current && data) return;
    lastQueryRef.current = q;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error al buscar.");
      } else {
        setData(json);
      }
    } catch {
      setError("Hubo un problema. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-search as the user types (only for short queries — long
  // free-text descriptions wait for explicit submit to avoid wasting Gemini).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const len = text.trim().length;
    if (len < 2) {
      setData(null);
      return;
    }
    if (len > 60) return; // long descriptions → manual submit
    debounceRef.current = setTimeout(() => submit(), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const empty =
    data &&
    data.doctors.length === 0 &&
    data.specialties.length === 0 &&
    !data.orientation;

  return (
    <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-emerald-950/30 lg:p-6">
      <header className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Búsqueda inteligente
          </p>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] lg:text-lg">
            Buscá doctor, especialidad, ciudad — o contanos lo que sentís
          </h2>
        </div>
      </header>

      <div className="mt-3">
        <div
          className={`flex items-center gap-2 rounded-xl border bg-[hsl(var(--card))] px-3 py-2.5 transition-all ${
            loading
              ? "border-emerald-500"
              : "border-[hsl(var(--border))] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
          }`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))]" />
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder='"Cardiología", "Dr. González", "Caracas", o "me duele el pecho"'
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
          />
          {text.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setData(null);
              }}
              className="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              Limpiar
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        {!data && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Ejemplos:
            </span>
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setText(c);
                  submit(c);
                }}
                className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {data && (
        <div className="mt-4 space-y-4">
          {/* Specialties */}
          {data.specialties.length > 0 && (
            <ResultsBlock
              title="Especialidades"
              icon={Stethoscope}
            >
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.specialties.map((sp) => (
                  <li key={sp.id}>
                    <Link
                      href={
                        sp.slug
                          ? `/dashboard/buscar-medico/especialidad/${sp.slug}`
                          : `/dashboard/buscar-medico?specialty=${sp.id}`
                      }
                      className="flex items-start justify-between gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                          {sp.name}
                        </p>
                        {sp.description && (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                            {sp.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        {sp.doctor_count}{" "}
                        {sp.doctor_count === 1 ? "doctor" : "doctores"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ResultsBlock>
          )}

          {/* Doctors */}
          {data.doctors.length > 0 && (
            <ResultsBlock title="Doctores" icon={Stethoscope}>
              <ul className="space-y-2">
                {data.doctors.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/dashboard/buscar-medico/doctor/${d.slug || d.id}`}
                      className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {d.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={d.avatar_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          d.full_name
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
                            {d.full_name}
                          </p>
                          {d.sacs_verified && (
                            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          {d.specialty_name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                          {d.average_rating != null && d.average_rating > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              {d.average_rating.toFixed(1)}
                            </span>
                          )}
                          {(d.city || d.state) && (
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {[d.city, d.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {d.accepts_telemedicine && (
                            <span className="inline-flex items-center gap-0.5 text-sky-700 dark:text-sky-300">
                              <Video className="h-2.5 w-2.5" />
                              Tele
                            </span>
                          )}
                          {d.consultation_fee != null && (
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                              ${d.consultation_fee.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ResultsBlock>
          )}

          {/* Orientation (AI) */}
          {data.orientation && (
            <ResultsBlock
              title="Orientación según lo que escribiste"
              icon={MessageCircle}
              accent="ai"
            >
              {data.orientation.summary && (
                <p className="text-sm text-[hsl(var(--foreground))]">
                  {data.orientation.summary}
                </p>
              )}
              {data.orientation.specialties.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {data.orientation.specialties.map((sp) => (
                    <li
                      key={sp.name}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                          {sp.name}
                        </p>
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {sp.doctor_count}{" "}
                          {sp.doctor_count === 1
                            ? "doctor disponible"
                            : "doctores disponibles"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {sp.reason}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {sp.slug && (
                          <Link
                            href={`/dashboard/buscar-medico/especialidad/${sp.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                          >
                            Aprender más
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                        {sp.specialty_id && sp.doctor_count > 0 && (
                          <Link
                            href={`/dashboard/buscar-medico?specialty=${sp.specialty_id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Ver doctores
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {(data.orientation.advice ||
                data.orientation.needs_urgent_attention) && (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${
                    data.orientation.needs_urgent_attention
                      ? "border-amber-300 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40"
                  }`}
                >
                  <Info
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      data.orientation.needs_urgent_attention
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-[hsl(var(--muted-foreground))]"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      data.orientation.needs_urgent_attention
                        ? "text-amber-900 dark:text-amber-200"
                        : "text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {data.orientation.advice ||
                      "Si tus síntomas son severos o persistentes, consultá pronto."}
                  </p>
                </div>
              )}
            </ResultsBlock>
          )}

          {empty && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4 text-sm text-[hsl(var(--muted-foreground))]">
              Sin resultados para &quot;{text}&quot;. Probá con otro término o
              describí lo que sentís en una frase completa.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ResultsBlock({
  title,
  icon: Icon,
  accent = "default",
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "default" | "ai";
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
        <Icon className="h-3 w-3" />
        {title}
        {accent === "ai" && (
          <span className="ml-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
            IA
          </span>
        )}
      </h3>
      {children}
    </div>
  );
}
