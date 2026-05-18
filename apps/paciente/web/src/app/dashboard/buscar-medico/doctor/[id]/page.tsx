import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DoctorProfileView } from "@/components/doctor-profile/doctor-profile-view";
import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

// Public doctor detail page. Reads from `public_doctor_directory` which projects
// only safe columns from profiles (no email/phone/national_id) — see migration
// `create_public_doctor_directory_view` (2026-05-08).

const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUBLIC_DOCTOR_SELECT = `
  doctor_profile_id,
  id,
  verified,
  sacs_verified,
  is_featured,
  consultation_fee,
  consultation_price,
  consultation_duration,
  accepts_insurance,
  accepts_telemedicine,
  accepts_new_patients,
  accepted_insurances,
  clinic_address,
  website,
  social_media,
  years_experience,
  biography,
  slug,
  average_rating,
  total_reviews,
  total_consultations,
  languages,
  certifications,
  subspecialties,
  specialization_areas,
  conditions_treated,
  age_groups,
  awards,
  publications,
  associations,
  work_experience,
  university,
  graduation_year,
  professional_type,
  verified_at,
  full_name,
  avatar_url,
  city,
  state,
  specialty_id
`;

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const matchColumn = UUID_RX.test(id) ? "doctor_profile_id" : "slug";

  const { data, error } = await supabase
    .from("public_doctor_directory")
    .select(PUBLIC_DOCTOR_SELECT)
    .eq(matchColumn, id)
    .single();

  if (error || !data) {
    notFound();
  }

  let specialty:
    | {
        id: string;
        name: string;
        icon: string | null;
        description: string | null;
        slug: string | null;
      }
    | null = null;
  if (data.specialty_id) {
    const { data: spec } = await supabase
      .from("specialties")
      .select("id, name, icon, description, slug")
      .eq("id", data.specialty_id)
      .single();
    if (spec) {
      specialty = {
        id: spec.id,
        name: spec.name,
        icon: spec.icon ?? null,
        description: spec.description ?? null,
        slug: spec.slug ?? null,
      };
    }
  }

  const doctor = {
    id: data.doctor_profile_id,
    profile_id: data.id,
    verified: data.verified,
    sacs_verified: data.sacs_verified,
    is_featured: data.is_featured,
    consultation_fee: data.consultation_fee,
    consultation_price: data.consultation_price,
    consultation_duration: data.consultation_duration,
    accepts_insurance: data.accepts_insurance,
    accepts_telemedicine: data.accepts_telemedicine,
    accepts_new_patients: data.accepts_new_patients,
    accepted_insurances: data.accepted_insurances,
    clinic_address: data.clinic_address,
    website: data.website,
    social_media: data.social_media,
    years_experience: data.years_experience,
    biography: data.biography,
    slug: data.slug,
    average_rating: data.average_rating,
    total_reviews: data.total_reviews,
    total_consultations: data.total_consultations,
    languages: data.languages,
    certifications: data.certifications,
    subspecialties: data.subspecialties,
    specialization_areas: data.specialization_areas,
    conditions_treated: data.conditions_treated,
    age_groups: data.age_groups,
    awards: data.awards,
    publications: data.publications,
    associations: data.associations,
    work_experience: data.work_experience,
    university: data.university,
    graduation_year: data.graduation_year,
    professional_type: data.professional_type,
    verified_at: data.verified_at,
    profile: {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      city: data.city,
      state: data.state,
    },
    specialty,
    avg_rating: data.average_rating ?? null,
    review_count: data.total_reviews ?? 0,
  } as unknown as FullDoctorProfile;

  return <DoctorProfileView doctor={doctor} />;
}
