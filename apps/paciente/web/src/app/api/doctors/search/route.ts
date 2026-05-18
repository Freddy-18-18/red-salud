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
// Security note (2026-05-08):
// - Public surface reads from `public_doctor_directory` view (safe projection).
//   The previous direct `from('doctor_profiles')...select('*, profile:profiles!fkey(...)')`
//   pattern leaked email/phone via the policy `public_read_verified_doctor_profiles`,
//   which has been removed. The view exposes ONLY non-PII columns.
// - Specialty join still uses the `specialties` table directly (safe).

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

    // Fetch from the safe public view (no PII columns). doctor_profile_id is the
    // doctor_profiles.id (FK target for favorites/comparator/booking).
    let query = supabase
      .from('public_doctor_directory')
      .select(
        `
        doctor_profile_id,
        id,
        sacs_verified,
        verified,
        consultation_fee,
        consultation_price,
        consultation_duration,
        accepts_insurance,
        accepts_telemedicine,
        accepts_new_patients,
        accepted_insurances,
        clinic_address,
        years_experience,
        biography,
        slug,
        average_rating,
        total_reviews,
        total_consultations,
        languages,
        subspecialties,
        conditions_treated,
        is_featured,
        full_name,
        avatar_url,
        city,
        state,
        specialty_id
        `,
        { count: 'exact' },
      );

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
      query = query.order('full_name', { ascending: true });
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

    // Fetch specialty data for the results in a single round-trip and stitch.
    // The view exposes specialty_id; the catalog row is needed for the UI badge.
    const specialtyIds = Array.from(
      new Set(
        (doctors ?? [])
          .map((d) => d.specialty_id)
          .filter((id): id is string => typeof id === 'string'),
      ),
    );
    const specialtyMap = new Map<
      string,
      { id: string; name: string; icon: string | null; slug: string | null }
    >();
    if (specialtyIds.length > 0) {
      const { data: specs } = await supabase
        .from('specialties')
        .select('id, name, icon, slug')
        .in('id', specialtyIds);
      for (const s of specs ?? []) {
        specialtyMap.set(s.id, {
          id: s.id,
          name: s.name,
          icon: s.icon ?? null,
          slug: s.slug ?? null,
        });
      }
    }

    // Reshape into the legacy { profile, specialty } envelope that callers expect,
    // so UI components don't need to change.
    const results = (doctors ?? []).map((doctor) => ({
      // Map doctor_profile_id back to the legacy `id` key for compat
      id: doctor.doctor_profile_id,
      profile_id: doctor.id,
      verified: doctor.verified,
      sacs_verified: doctor.sacs_verified,
      consultation_fee: doctor.consultation_fee,
      consultation_price: doctor.consultation_price,
      consultation_duration: doctor.consultation_duration,
      accepts_insurance: doctor.accepts_insurance,
      accepts_telemedicine: doctor.accepts_telemedicine,
      accepts_new_patients: doctor.accepts_new_patients,
      accepted_insurances: doctor.accepted_insurances,
      clinic_address: doctor.clinic_address,
      years_experience: doctor.years_experience,
      biography: doctor.biography,
      slug: doctor.slug,
      average_rating: doctor.average_rating,
      total_reviews: doctor.total_reviews,
      total_consultations: doctor.total_consultations,
      languages: doctor.languages,
      subspecialties: doctor.subspecialties,
      conditions_treated: doctor.conditions_treated,
      is_featured: doctor.is_featured,
      profile: {
        id: doctor.id,
        full_name: doctor.full_name,
        avatar_url: doctor.avatar_url,
        city: doctor.city,
        state: doctor.state,
      },
      specialty: doctor.specialty_id
        ? specialtyMap.get(doctor.specialty_id) ?? null
        : null,
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
