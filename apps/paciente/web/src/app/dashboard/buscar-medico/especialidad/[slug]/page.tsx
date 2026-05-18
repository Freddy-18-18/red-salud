import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SpecialtyDetailView } from "@/components/specialty/specialty-detail-view";
import type { SpecialtyDetail } from "@/lib/services/specialty/types";

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: specialty, error } = await supabase
    .from("specialties")
    .select("id, name, slug, description, icon, category, active")
    .eq("slug", slug)
    .single();

  if (error || !specialty) {
    notFound();
  }

  const [educationRes, doctorsRes] = await Promise.all([
    supabase
      .from("specialty_education")
      .select(
        "intro, when_to_consult, what_to_expect, what_it_treats, symptoms_to_consult, preparation_tips, red_flags, common_procedures, faqs, sources, review_status, reviewed_at",
      )
      .eq("specialty_id", specialty.id)
      .maybeSingle(),
    supabase
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
      .limit(8),
  ]);

  // Reshape into the legacy { id, profile: {...} } envelope for the
  // SpecialtyDetailView component which still expects the embedded join.
  const doctors = (doctorsRes.data ?? []).map((d) => ({
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

  const detail = {
    specialty,
    education: educationRes.data ?? null,
    doctors,
  } as unknown as SpecialtyDetail;

  return <SpecialtyDetailView detail={detail} />;
}
