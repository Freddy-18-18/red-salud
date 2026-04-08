import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Follow-Ups — BFF API Route
// -------------------------------------------------------------------
// GET: List pending follow-up items for the authenticated patient.
// Returns incomplete items joined with appointment and doctor data.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
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

    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('include_completed') === 'true';

    let query = supabase
      .from('appointment_follow_ups')
      .select(
        `
        id,
        appointment_id,
        doctor_id,
        patient_id,
        type,
        description,
        due_date,
        completed,
        completed_at,
        notes,
        suggested_weeks,
        created_at,
        appointment:appointments!appointment_follow_ups_appointment_id_fkey (
          id,
          start_time,
          end_time,
          status,
          type,
          motivo,
          doctor:doctor_details!appointments_doctor_id_fkey (
            id,
            profile:profiles!doctor_details_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            ),
            specialty:medical_specialties!doctor_details_specialty_id_fkey (
              id,
              name
            )
          )
        )
        `,
        { count: 'exact' },
      )
      .eq('patient_id', user.id)
      .order('due_date', { ascending: true });

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    const { data: followUps, error, count } = await query;

    if (error) {
      console.error('[Follow-Ups GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener seguimientos.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: followUps ?? [],
      total: count ?? 0,
    });
  } catch (error) {
    console.error('[Follow-Ups GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
