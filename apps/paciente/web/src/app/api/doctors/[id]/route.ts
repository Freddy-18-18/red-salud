import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Profile — BFF API Route (Fase 1: dossier de decisión completo)
// -------------------------------------------------------------------
// Returns a single verified doctor's COMPLETE profile for the public
// `/dashboard/buscar-medico/doctor/[idOrSlug]` decision page.
//
// `id` accepts either the doctor_profiles UUID or the URL slug. Slugs
// look like "dra-maria-gonzalez" so the resolver falls back to slug
// when the param fails UUID format.
//
// Security note (2026-05-08):
// - Reads from `public_doctor_directory` view. No PII columns are exposed
//   (email, phone, national_id, address, etc. on profiles are now blocked
//   by RLS for non-owners).
// - The few legacy columns that came directly from `doctor_profiles` and
//   are NOT in the view (sacs_data, clinic_phone, professional_email,
//   college_number, medical_license, age_groups) are intentionally dropped
//   from this public payload — they leak licence numbers and contact info.
// - Specialty join uses the safe `specialties` catalog table.
// -------------------------------------------------------------------

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(_request, 'public');
    if (limited) return limited;
    const { id } = await params;
    const supabase = await createClient();

    const isUuid = UUID_RX.test(id);
    const matchColumn = isUuid ? 'doctor_profile_id' : 'slug';

    const { data: doctor, error } = await supabase
      .from('public_doctor_directory')
      .select(PUBLIC_DOCTOR_SELECT)
      .eq(matchColumn, id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Médico no encontrado.' },
          { status: 404 },
        );
      }
      console.error('[Doctor Profile] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener perfil del médico.' },
        { status: 500 },
      );
    }

    let specialty:
      | { id: string; name: string; icon: string | null; description: string | null; slug: string | null }
      | null = null;
    if (doctor.specialty_id) {
      const { data: spec } = await supabase
        .from('specialties')
        .select('id, name, icon, description, slug')
        .eq('id', doctor.specialty_id)
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

    // Reshape into the legacy { profile, specialty } envelope so UI is unchanged.
    return NextResponse.json({
      data: {
        id: doctor.doctor_profile_id,
        profile_id: doctor.id,
        verified: doctor.verified,
        sacs_verified: doctor.sacs_verified,
        is_featured: doctor.is_featured,
        consultation_fee: doctor.consultation_fee,
        consultation_price: doctor.consultation_price,
        consultation_duration: doctor.consultation_duration,
        accepts_insurance: doctor.accepts_insurance,
        accepts_telemedicine: doctor.accepts_telemedicine,
        accepts_new_patients: doctor.accepts_new_patients,
        accepted_insurances: doctor.accepted_insurances,
        clinic_address: doctor.clinic_address,
        website: doctor.website,
        social_media: doctor.social_media,
        years_experience: doctor.years_experience,
        biography: doctor.biography,
        slug: doctor.slug,
        average_rating: doctor.average_rating,
        total_reviews: doctor.total_reviews,
        total_consultations: doctor.total_consultations,
        languages: doctor.languages,
        certifications: doctor.certifications,
        subspecialties: doctor.subspecialties,
        specialization_areas: doctor.specialization_areas,
        conditions_treated: doctor.conditions_treated,
        age_groups: doctor.age_groups,
        awards: doctor.awards,
        publications: doctor.publications,
        associations: doctor.associations,
        work_experience: doctor.work_experience,
        university: doctor.university,
        graduation_year: doctor.graduation_year,
        professional_type: doctor.professional_type,
        verified_at: doctor.verified_at,
        profile: {
          id: doctor.id,
          full_name: doctor.full_name,
          avatar_url: doctor.avatar_url,
          city: doctor.city,
          state: doctor.state,
        },
        specialty,
        avg_rating: doctor.average_rating ?? null,
        review_count: doctor.total_reviews ?? 0,
      },
    });
  } catch (error) {
    console.error('[Doctor Profile] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
