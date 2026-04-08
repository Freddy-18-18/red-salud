import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Profile — BFF API Route
// -------------------------------------------------------------------
// Returns a single doctor's full profile with specialty, ratings, etc.
// Public endpoint — no authentication required.
// -------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(_request, 'public');
    if (limited) return limited;
    const { id } = await params;
    const supabase = await createClient();

    const { data: doctor, error } = await supabase
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
        education,
        languages,
        profile:profiles!doctor_details_user_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          email
        ),
        specialty:medical_specialties!doctor_details_specialty_id_fkey (
          id,
          name,
          icon,
          description
        ),
        reviews:doctor_reviews (
          rating
        )
        `,
      )
      .eq('id', id)
      .eq('is_active', true)
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

    // --- Compute ratings ---
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

    return NextResponse.json({
      data: {
        ...rest,
        avg_rating: avgRating,
        review_count: reviewCount,
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
