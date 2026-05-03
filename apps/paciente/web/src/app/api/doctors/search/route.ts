import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Search — BFF API Route
// -------------------------------------------------------------------
// Searches verified doctors by specialty, city, insurance acceptance, etc.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------
//
// Schema notes (post Phase A5.5):
// - Table is `doctor_profiles` (FK constraint name kept as the legacy
//   `doctor_details_profile_id_fkey` because it was renamed by ALTER TABLE).
// - Specialty FK constraint is `fk_doctor_specialty` and points at
//   `specialties` (NOT `medical_specialties`).
// - Doctor's clinic location lives in `clinic_address` (text); the patient
//   profile's city/state come from `profiles` via the embedded join.

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request, 'search');
    if (limited) return limited;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const specialtyId = searchParams.get('specialty_id');
    const city = searchParams.get('city');
    const acceptsInsurance = searchParams.get('accepts_insurance');
    const sortBy = searchParams.get('sort_by') ?? 'rating'; // rating | name | price
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') ?? '10', 10)));

    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('doctor_profiles')
      .select(
        `
        id,
        profile_id,
        verified,
        consultation_fee,
        consultation_price,
        consultation_duration,
        accepts_insurance,
        accepts_telemedicine,
        accepts_new_patients,
        clinic_address,
        years_experience,
        biography,
        slug,
        average_rating,
        total_reviews,
        languages,
        profile:profiles!doctor_details_profile_id_fkey (
          id,
          first_name,
          last_name,
          full_name,
          avatar_url,
          phone,
          city,
          state
        ),
        specialty:specialties!fk_doctor_specialty (
          id,
          name,
          icon
        )
        `,
        { count: 'exact' },
      )
      .eq('verified', true);

    // doctor_reviews has FK to profiles(id), not doctor_profiles, so we can't
    // embed it through PostgREST. The denormalized average_rating /
    // total_reviews columns on doctor_profiles are kept in sync via trigger
    // and are good enough for list views.

    if (specialtyId) {
      query = query.eq('specialty_id', specialtyId);
    }

    // City filter targets the doctor's clinic_address as a text search.
    // (Patient-side profile.city is also available but filtering on an
    // embedded resource requires the URL syntax which the JS client
    // doesn't expose ergonomically — this is good enough for v1.)
    if (city) {
      query = query.ilike('clinic_address', `%${city}%`);
    }

    if (acceptsInsurance === 'true') {
      query = query.eq('accepts_insurance', true);
    }

    if (sortBy === 'name') {
      query = query.order('profile_id', { ascending: true });
    } else if (sortBy === 'price') {
      query = query.order('consultation_fee', { ascending: true });
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: doctors, error, count } = await query;

    if (error) {
      console.error('[Doctor Search] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al buscar médicos.' },
        { status: 500 },
      );
    }

    const results = (doctors ?? []).map((doctor) => ({
      ...doctor,
      avg_rating: doctor.average_rating ?? null,
      review_count: doctor.total_reviews ?? 0,
    }));

    if (sortBy === 'rating') {
      results.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    }

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error('[Doctor Search] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
