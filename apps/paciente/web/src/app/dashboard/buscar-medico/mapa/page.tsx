import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { DoctorMapView } from "@/components/triage/doctor-map-view";

export default async function MapaPage() {
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
      accepts_telemedicine,
      sacs_verified,
      average_rating,
      total_reviews,
      full_name,
      avatar_url,
      city,
      state,
      specialty_id
    `,
    )
    .limit(200);

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
    accepts_telemedicine: r.accepts_telemedicine,
    sacs_verified: r.sacs_verified,
    average_rating: r.average_rating,
    total_reviews: r.total_reviews,
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
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <MapPin className="h-6 w-6 text-emerald-600" />
          Doctores por estado
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Explorá médicos verificados según su ubicación en Venezuela.
        </p>
      </header>

      <DoctorMapView doctors={(doctors ?? []) as never} />
    </div>
  );
}
