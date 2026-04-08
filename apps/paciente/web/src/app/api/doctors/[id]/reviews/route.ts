import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Reviews — BFF API Route
// -------------------------------------------------------------------
// Paginated reviews for a specific doctor, including the patient's
// first name for display. Public endpoint.
// -------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'public');
    if (limited) return limited;

    const { id: doctorId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('page_size') ?? '10', 10)));
    const offset = (page - 1) * pageSize;

    const { data: reviews, error, count } = await supabase
      .from('doctor_reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        patient:profiles!doctor_reviews_patient_id_fkey (
          first_name,
          last_name,
          avatar_url
        )
        `,
        { count: 'exact' },
      )
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('[Doctor Reviews] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener reseñas.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: reviews ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (error) {
    console.error('[Doctor Reviews] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
