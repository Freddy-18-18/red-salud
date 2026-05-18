import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Specialty Detail — BFF API Route (Fase 2: educational dossier)
// -------------------------------------------------------------------
// Returns the catalog row + the editorial education record
// (specialty_education) joined by specialty_id, plus a small list of
// verified doctors registered in this specialty.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const limited = await checkRateLimit(request, "public");
    if (limited) return limited;
    const { slug } = await params;
    const supabase = await createClient();

    const { data: specialty, error } = await supabase
      .from("specialties")
      .select(
        `
        id,
        name,
        slug,
        description,
        icon,
        category,
        active
      `,
      )
      .eq("slug", slug)
      .single();

    if (error || !specialty) {
      return NextResponse.json(
        { error: "Especialidad no encontrada." },
        { status: 404 },
      );
    }

    const { data: education } = await supabase
      .from("specialty_education")
      .select(
        `
        intro,
        when_to_consult,
        what_to_expect,
        what_it_treats,
        symptoms_to_consult,
        preparation_tips,
        red_flags,
        common_procedures,
        faqs,
        sources,
        review_status,
        reviewed_at
      `,
      )
      .eq("specialty_id", specialty.id)
      .maybeSingle();

    // Read from the safe public view — see migration
    // create_public_doctor_directory_view (2026-05-08).
    const { data: doctorsRaw } = await supabase
      .from("public_doctor_directory")
      .select(
        `
        doctor_profile_id,
        slug,
        average_rating,
        total_reviews,
        consultation_fee,
        years_experience,
        accepts_telemedicine,
        accepts_insurance,
        sacs_verified,
        languages,
        subspecialties,
        full_name,
        avatar_url,
        city,
        state
      `,
      )
      .eq("specialty_id", specialty.id)
      .order("average_rating", { ascending: false, nullsFirst: false })
      .limit(8);

    const doctors = (doctorsRaw ?? []).map((d) => ({
      id: d.doctor_profile_id,
      slug: d.slug,
      average_rating: d.average_rating,
      total_reviews: d.total_reviews,
      consultation_fee: d.consultation_fee,
      years_experience: d.years_experience,
      accepts_telemedicine: d.accepts_telemedicine,
      accepts_insurance: d.accepts_insurance,
      sacs_verified: d.sacs_verified,
      languages: d.languages,
      subspecialties: d.subspecialties,
      profile: {
        full_name: d.full_name,
        avatar_url: d.avatar_url,
        city: d.city,
        state: d.state,
      },
    }));

    return NextResponse.json({
      data: {
        specialty,
        education: education ?? null,
        doctors,
      },
    });
  } catch (error) {
    console.error("[Specialty Detail] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
