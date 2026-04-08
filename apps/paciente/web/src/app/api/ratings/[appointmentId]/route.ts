import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Ratings by Appointment — BFF API Route
// -------------------------------------------------------------------
// GET: Retrieve the existing rating for a specific appointment.
// Requires authentication.
// -------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const limited = checkRateLimit(_request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();
    const { appointmentId } = await params;

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesion para continuar.' },
        { status: 401 },
      );
    }

    // Fetch rating for this appointment by this patient
    const { data: rating, error } = await supabase
      .from('appointment_ratings')
      .select(`
        id,
        appointment_id,
        doctor_id,
        patient_id,
        rating,
        comment,
        would_recommend,
        created_at
      `)
      .eq('appointment_id', appointmentId)
      .eq('patient_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[Ratings GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener la valoracion.' },
        { status: 500 },
      );
    }

    // Return null data if no rating exists (not an error)
    return NextResponse.json({ data: rating });
  } catch (error) {
    console.error('[Ratings GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
