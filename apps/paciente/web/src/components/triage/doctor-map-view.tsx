"use client";

import { ShieldCheck, Star, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { VenezuelaMapSVG } from "@/components/public/map/venezuela-map-svg";

interface DoctorPin {
  id: string;
  slug: string | null;
  consultation_fee: number | null;
  accepts_telemedicine: boolean | null;
  sacs_verified: boolean | null;
  average_rating: number | null;
  total_reviews: number | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  specialty: { name: string | null };
}

interface DoctorMapViewProps {
  doctors: DoctorPin[];
}

export function DoctorMapView({ doctors }: DoctorMapViewProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Group doctors by `profile.state`
  const stateMap = useMemo(() => {
    const m = new Map<string, DoctorPin[]>();
    for (const d of doctors) {
      const s = (d.profile.state || "").trim();
      if (!s) continue;
      const arr = m.get(s) ?? [];
      arr.push(d);
      m.set(s, arr);
    }
    return m;
  }, [doctors]);

  const stateData = useMemo(
    () =>
      Array.from(stateMap.entries()).map(([stateName, list]) => ({
        stateId: stateName,
        stateName,
        doctorCount: list.length,
      })),
    [stateMap],
  );

  const selectedDoctors = selectedState
    ? stateMap.get(selectedState) ?? []
    : [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      {/* Map */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        <VenezuelaMapSVG
          stateData={stateData}
          selectedState={selectedState}
          onStateClick={setSelectedState}
        />
        <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
          Tocá un estado en el mapa para ver los doctores disponibles ahí.
        </p>
      </div>

      {/* Aside */}
      <aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
        {selectedState ? (
          <>
            <header className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
                {selectedState}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedState(null)}
                className="text-[11px] font-medium text-emerald-700 hover:underline dark:text-emerald-300"
              >
                Limpiar
              </button>
            </header>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {selectedDoctors.length}{" "}
              {selectedDoctors.length === 1 ? "doctor" : "doctores"} verificados
            </p>
            {selectedDoctors.length === 0 ? (
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                Aún no hay doctores en {selectedState}.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {selectedDoctors.map((d) => (
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
                            alt=""
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
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          {d.specialty?.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                          {d.profile.city && <span>{d.profile.city}</span>}
                          {d.average_rating != null && d.average_rating > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              {d.average_rating.toFixed(1)}
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
            )}
          </>
        ) : (
          <>
            <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
              Top estados
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Estados con más doctores verificados.
            </p>
            <ul className="mt-3 space-y-1.5">
              {[...stateData]
                .sort((a, b) => b.doctorCount - a.doctorCount)
                .slice(0, 8)
                .map((s) => (
                  <li key={s.stateId}>
                    <button
                      type="button"
                      onClick={() => setSelectedState(s.stateName)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[hsl(var(--muted))]"
                    >
                      <span className="text-[hsl(var(--foreground))]">{s.stateName}</span>
                      <span className="text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                        {s.doctorCount}{" "}
                        {s.doctorCount === 1 ? "doctor" : "doctores"}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
