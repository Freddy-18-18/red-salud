import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { submitRatingSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Ratings — BFF API Route
// -------------------------------------------------------------------
// POST: Submit a rating for a completed appointment.
// Requires authentication. Prevents duplicate ratings.
// -------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const supabase = await createClient();

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

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const validation = validateBody(submitRatingSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    // --- Verify appointment belongs to patient and is completed ---
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, status, patient_id')
      .eq('id', data.appointment_id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }

    if (appointment.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para valorar esta cita.' },
        { status: 403 },
      );
    }

    if (appointment.status !== 'completed' && appointment.status !== 'completada') {
      return NextResponse.json(
        { error: 'Solo puedes valorar citas completadas.' },
        { status: 400 },
      );
    }

    // --- Prevent duplicate ratings ---
    const { data: existingRating } = await supabase
      .from('appointment_ratings')
      .select('id')
      .eq('appointment_id', data.appointment_id)
      .eq('patient_id', user.id)
      .limit(1);

    if (existingRating && existingRating.length > 0) {
      return NextResponse.json(
        { error: 'Ya valoraste esta cita.' },
        { status: 409 },
      );
    }

    // --- Insert rating ---
    const { data: rating, error: insertError } = await supabase
      .from('appointment_ratings')
      .insert({
        appointment_id: data.appointment_id,
        doctor_id: data.doctor_id,
        patient_id: user.id,
        rating: data.rating,
        comment: data.comment?.trim() || null,
        would_recommend: data.would_recommend,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Ratings POST] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al enviar la valoracion.' },
        { status: 500 },
      );
    }

    // --- Log activity (best-effort) ---
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'rating_submitted',
        details: {
          appointment_id: data.appointment_id,
          doctor_id: data.doctor_id,
          rating: data.rating,
        },
      })
      .then(({ error: logError }) => {
        if (logError) {
          console.error('[Ratings POST] Activity log error:', logError);
        }
      });

    return NextResponse.json({ data: rating }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Solicitud invalida. Verifica los datos enviados.' },
        { status: 400 },
      );
    }
    console.error('[Ratings POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
