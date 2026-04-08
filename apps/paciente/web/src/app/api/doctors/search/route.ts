import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Search — BFF API Route
// -------------------------------------------------------------------
// Searches doctors by specialty, city, insurance acceptance, etc.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'search');
    if (limited) return limited;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // --- Parse query params ---
    const specialtyId = searchParams.get('specialty_id');
    const city = searchParams.get('city');
    const acceptsInsurance = searchParams.get('accepts_insurance');
    const sortBy = searchParams.get('sort_by') ?? 'rating'; // rating | name | price
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') ?? '10', 10)));

    const offset = (page - 1) * pageSize;

    // --- Build query ---
    let query = supabase
      .from('doctor_details')
      .select(
        `
        id,
        user_id,
        is_active,
        consultation_fee,
        accepts_insurance,
        city,
        address,
        years_experience,
        biography,
        profile:profiles!doctor_details_user_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          phone
        ),
        specialty:medical_specialties!doctor_details_specialty_id_fkey (
          id,
          name,
          icon
        ),
        reviews:doctor_reviews (
          rating
        )
        `,
        { count: 'exact' },
      )
      .eq('is_active', true);

    // --- Apply filters ---
    if (specialtyId) {
      query = query.eq('specialty_id', specialtyId);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (acceptsInsurance === 'true') {
      query = query.eq('accepts_insurance', true);
    }

    // --- Sorting ---
    // Note: rating sort is applied post-query since it's computed.
    // For name/price we can sort at the DB level.
    if (sortBy === 'name') {
      query = query.order('user_id', { ascending: true });
    } else if (sortBy === 'price') {
      query = query.order('consultation_fee', { ascending: true });
    }

    // --- Pagination ---
    query = query.range(offset, offset + pageSize - 1);

    const { data: doctors, error, count } = await query;

    if (error) {
      console.error('[Doctor Search] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al buscar médicos.' },
        { status: 500 },
      );
    }

    // --- Compute ratings and shape response ---
    const results = (doctors ?? []).map((doctor) => {
      const reviews = (doctor.reviews as { rating: number }[]) ?? [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10,
            ) / 10
          : null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reviews: _reviews, ...rest } = doctor;

      return {
        ...rest,
        avg_rating: avgRating,
        review_count: reviewCount,
      };
    });

    // --- Sort by rating post-query if needed ---
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
