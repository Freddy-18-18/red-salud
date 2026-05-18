import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { DoctorCard } from "@/components/ui/doctor-card";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/buscar-medico"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Iniciá sesión para ver tus médicos guardados.
        </p>
      </div>
    );
  }

  // Step 1: get the patient's saved favorites (RLS-scoped to user).
  const { data: favRows } = await supabase
    .from("patient_doctor_favorites")
    .select("id, created_at, doctor_profile_id")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  // Step 2: hydrate doctor data from the safe public view (no PII).
  // See migration create_public_doctor_directory_view (2026-05-08).
  const doctorIds = Array.from(
    new Set(
      (favRows ?? [])
        .map((r) => r.doctor_profile_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  );

  const doctorMap = new Map<
    string,
    {
      id: string;
      slug: string | null;
      consultation_fee: number | null;
      years_experience: number | null;
      accepts_telemedicine: boolean | null;
      accepts_insurance: boolean | null;
      sacs_verified: boolean | null;
      languages: string[] | null;
      subspecialties: string[] | null;
      average_rating: number | null;
      total_reviews: number | null;
      total_consultations: number | null;
      verified: boolean | null;
      profile: { full_name: string | null; avatar_url: string | null; city: string | null; state: string | null };
      specialty: { name: string | null };
    }
  >();

  if (doctorIds.length > 0) {
    const { data: viewRows } = await supabase
      .from("public_doctor_directory")
      .select(
        `
        doctor_profile_id, slug, consultation_fee, years_experience,
        accepts_telemedicine, accepts_insurance, sacs_verified,
        languages, subspecialties, average_rating, total_reviews,
        total_consultations, verified, full_name, avatar_url, city, state, specialty_id
      `,
      )
      .in("doctor_profile_id", doctorIds);

    const specialtyIds = Array.from(
      new Set(
        (viewRows ?? [])
          .map((r) => r.specialty_id)
          .filter((id): id is string => typeof id === "string"),
      ),
    );
    const specialtyNameMap = new Map<string, string>();
    if (specialtyIds.length > 0) {
      const { data: specs } = await supabase
        .from("specialties")
        .select("id, name")
        .in("id", specialtyIds);
      for (const s of specs ?? []) specialtyNameMap.set(s.id, s.name);
    }

    for (const r of viewRows ?? []) {
      doctorMap.set(r.doctor_profile_id, {
        id: r.doctor_profile_id,
        slug: r.slug,
        consultation_fee: r.consultation_fee,
        years_experience: r.years_experience,
        accepts_telemedicine: r.accepts_telemedicine,
        accepts_insurance: r.accepts_insurance,
        sacs_verified: r.sacs_verified,
        languages: r.languages,
        subspecialties: r.subspecialties,
        average_rating: r.average_rating,
        total_reviews: r.total_reviews,
        total_consultations: r.total_consultations,
        verified: r.verified,
        profile: {
          full_name: r.full_name,
          avatar_url: r.avatar_url,
          city: r.city,
          state: r.state,
        },
        specialty: {
          name: r.specialty_id ? specialtyNameMap.get(r.specialty_id) ?? null : null,
        },
      });
    }
  }

  const favorites = (favRows ?? [])
    .map((r) => ({
      id: r.id,
      doctor: doctorMap.get(r.doctor_profile_id) ?? null,
    }))
    .filter((r): r is { id: string; doctor: NonNullable<typeof r.doctor> } => r.doctor !== null);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <Link
        href="/dashboard/buscar-medico"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a buscar médicos
      </Link>

      <header>
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
          <Heart className="h-6 w-6 text-rose-500" />
          Médicos guardados
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Tu lista privada de doctores favoritos.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
          <Heart className="mx-auto h-10 w-10 text-rose-300" />
          <p className="mt-3 text-sm font-semibold text-[hsl(var(--foreground))]">
            Aún no guardaste ningún doctor
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Tocá el botón &quot;Guardar&quot; en el perfil de cualquier doctor para agregarlo acá.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((f) => {
            const d = f.doctor!;
            return (
              <DoctorCard
                key={f.id}
                id={d.id}
                slug={d.slug}
                name={d.profile?.full_name || "Médico"}
                specialty={d.specialty?.name || ""}
                avatarUrl={d.profile?.avatar_url ?? undefined}
                fee={d.consultation_fee ?? undefined}
                city={d.profile?.city ?? undefined}
                state={d.profile?.state ?? undefined}
                yearsExperience={d.years_experience ?? undefined}
                verified={d.verified ?? undefined}
                sacsVerified={d.sacs_verified}
                acceptsTelemedicine={d.accepts_telemedicine}
                acceptsInsurance={d.accepts_insurance}
                languages={d.languages}
                subspecialties={d.subspecialties}
                totalConsultations={d.total_consultations}
                rating={d.average_rating ?? undefined}
                reviewCount={d.total_reviews ?? undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
