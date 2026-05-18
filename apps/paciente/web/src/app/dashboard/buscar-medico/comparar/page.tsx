import { ArrowLeft, CheckCircle2, ShieldCheck, Star, Video, X } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          href="/dashboard/buscar-medico"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold">Comparar doctores</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Pasá hasta 3 doctores como{" "}
          <code>?ids=uuid1,uuid2,uuid3</code> para comparar.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  // Read from the safe public view — see migration
  // create_public_doctor_directory_view (2026-05-08).
  const { data: viewRows } = await supabase
    .from("public_doctor_directory")
    .select(
      `
      doctor_profile_id,
      slug,
      consultation_fee,
      consultation_duration,
      years_experience,
      accepts_telemedicine,
      accepts_insurance,
      sacs_verified,
      verified,
      languages,
      subspecialties,
      average_rating,
      total_reviews,
      total_consultations,
      full_name,
      avatar_url,
      city,
      state,
      specialty_id
    `,
    )
    .in("doctor_profile_id", ids);

  // Hydrate specialty names in one round-trip
  const specialtyIds = Array.from(
    new Set(
      (viewRows ?? [])
        .map((r) => r.specialty_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  );
  const specialtyMap = new Map<string, string>();
  if (specialtyIds.length > 0) {
    const { data: specs } = await supabase
      .from("specialties")
      .select("id, name")
      .in("id", specialtyIds);
    for (const s of specs ?? []) specialtyMap.set(s.id, s.name);
  }

  const doctors = (viewRows ?? []).map((r) => ({
    id: r.doctor_profile_id,
    slug: r.slug,
    consultation_fee: r.consultation_fee,
    consultation_duration: r.consultation_duration,
    years_experience: r.years_experience,
    accepts_telemedicine: r.accepts_telemedicine,
    accepts_insurance: r.accepts_insurance,
    sacs_verified: r.sacs_verified,
    verified: r.verified,
    languages: r.languages,
    subspecialties: r.subspecialties,
    average_rating: r.average_rating,
    total_reviews: r.total_reviews,
    total_consultations: r.total_consultations,
    profile: {
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      city: r.city,
      state: r.state,
    },
    specialty: r.specialty_id
      ? { name: specialtyMap.get(r.specialty_id) ?? null }
      : null,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <Link
        href="/dashboard/buscar-medico"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a buscar médicos
      </Link>

      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Comparar doctores</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {doctors.length} {doctors.length === 1 ? "doctor" : "doctores"} en comparación.
        </p>
      </header>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-32 bg-[hsl(var(--card))] p-2 text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Atributo
              </th>
              {doctors.map((d) => (
                <th
                  key={d.id}
                  className="min-w-[200px] border-b border-[hsl(var(--border))] p-3 text-left align-top"
                >
                  <div className="flex items-start gap-2">
                    {(() => {
                      const prof = (d.profile as unknown) as {
                        full_name?: string | null;
                        avatar_url?: string | null;
                      } | null;
                      const spec = (d.specialty as unknown) as {
                        name?: string | null;
                      } | null;
                      return (
                        <>
                          {prof?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prof.avatar_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              {(prof?.full_name ?? "?")
                                .split(" ")
                                .filter(Boolean)
                                .map((p: string) => p[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/buscar-medico/doctor/${d.slug || d.id}`}
                              className="text-sm font-bold text-[hsl(var(--foreground))] hover:underline"
                            >
                              {prof?.full_name}
                            </Link>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                              {spec?.name}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Consulta">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.consultation_fee != null ? (
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      ${d.consultation_fee.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      A consultar
                    </span>
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Rating">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.average_rating ? (
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <strong className="tabular-nums">
                        {d.average_rating.toFixed(1)}
                      </strong>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        ({d.total_reviews ?? 0})
                      </span>
                    </span>
                  ) : (
                    <Dash />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Experiencia">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.years_experience != null && d.years_experience > 0 ? (
                    <span className="text-sm">
                      <strong>{d.years_experience}</strong>{" "}
                      {d.years_experience === 1 ? "año" : "años"}
                    </span>
                  ) : (
                    <Dash />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Consultas">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.total_consultations != null && d.total_consultations > 0 ? (
                    <span className="text-sm tabular-nums">
                      {d.total_consultations.toLocaleString("es-VE")}
                    </span>
                  ) : (
                    <Dash />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="SACS verificado">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.sacs_verified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Sí
                    </span>
                  ) : (
                    <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Telemedicina">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.accepts_telemedicine ? (
                    <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300">
                      <Video className="h-3.5 w-3.5" />
                      Sí
                    </span>
                  ) : (
                    <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Acepta seguro">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  {d.accepts_insurance ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </Cell>
              ))}
            </Row>
            <Row label="Idiomas">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  <span className="text-xs">
                    {(d.languages ?? []).join(", ") || "—"}
                  </span>
                </Cell>
              ))}
            </Row>
            <Row label="Ubicación">
              {doctors.map((d) => {
                const prof = (d.profile as unknown) as {
                  city?: string | null;
                  state?: string | null;
                } | null;
                return (
                  <Cell key={d.id}>
                    <span className="text-xs">
                      {[prof?.city, prof?.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </Cell>
                );
              })}
            </Row>
            <Row label="Sub-especialidades">
              {doctors.map((d) => (
                <Cell key={d.id}>
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {(d.subspecialties ?? []).slice(0, 3).join(" · ") || "—"}
                  </span>
                </Cell>
              ))}
            </Row>
          </tbody>
          <tfoot>
            <tr>
              <td />
              {doctors.map((d) => (
                <td key={d.id} className="p-2 text-center">
                  <Link
                    href={`/dashboard/agendar?doctor=${d.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Agendar
                  </Link>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-[hsl(var(--border))]">
      <td className="sticky left-0 z-10 bg-[hsl(var(--card))] p-2 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
        {label}
      </td>
      {children}
    </tr>
  );
}
function Cell({ children }: { children: React.ReactNode }) {
  return <td className="p-3 text-[hsl(var(--foreground))]">{children}</td>;
}
function Dash() {
  return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
}
