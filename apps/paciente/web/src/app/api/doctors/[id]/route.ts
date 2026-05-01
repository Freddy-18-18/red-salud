import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Doctor Profile — BFF API Route
// -------------------------------------------------------------------
// Returns a single verified doctor's full profile with specialty, ratings,
// languages, etc. Public endpoint — no authentication required.
// -------------------------------------------------------------------
//
// Schema notes (post Phase A5.5):
// - Source of truth is `doctor_profiles`. FK names preserved from the
//   original `doctor_details` table when it was renamed.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(_request, 'public');
    if (limited) return limited;
    const { id } = await params;
    const supabase = await createClient();

    const { data: doctor, error } = await supabase
      .from('doctor_profiles')
      .select(
        `
        id,
        profile_id,
        verified,
        consultation_fee,
        consultation_price,
        accepts_insurance,
        clinic_address,
        clinic_phone,
        years_experience,
        biography,
        slug,
        average_rating,
        total_reviews,
        languages,
        university,
        graduation_year,
        college_number,
        accepts_telemedicine,
        is_featured,
        profile:profiles!doctor_details_profile_id_fkey (
          id,
          first_name,
          last_name,
          full_name,
          avatar_url,
          phone,
          email,
          city,
          state
        ),
        specialty:specialties!fk_doctor_specialty (
          id,
          name,
          icon,
          description
        )
        `,
      )
      .eq('id', id)
      .eq('verified', true)
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

    return NextResponse.json({
      data: {
        ...doctor,
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
