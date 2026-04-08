import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { cancelAppointmentSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Cancel Appointment — BFF API Route
// -------------------------------------------------------------------
// PATCH: Updates an appointment status to 'cancelada'.
// Requires authentication. Patients can only cancel their own
// appointments. Optionally accepts a cancellation reason (motivo).
// -------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'mutation');
    if (limited) return limited;

    const { id: appointmentId } = await params;
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    // --- Verify the appointment belongs to this patient ---
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, patient_id')
      .eq('id', appointmentId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cita no encontrada.' },
          { status: 404 },
        );
      }
      console.error('[Cancel Appointment] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Error al obtener la cita.' },
        { status: 500 },
      );
    }

    if (existing.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para cancelar esta cita.' },
        { status: 403 },
      );
    }

    if (existing.status === 'cancelada') {
      return NextResponse.json(
        { error: 'La cita ya fue cancelada.' },
        { status: 400 },
      );
    }

    if (existing.status === 'completada') {
      return NextResponse.json(
        { error: 'No se puede cancelar una cita completada.' },
        { status: 400 },
      );
    }

    // --- Parse optional body ---
    let motivo: string | null = null;
    try {
      const body = await request.json();
      const validation = validateBody(cancelAppointmentSchema, body);
      if (validation.success) {
        motivo = validation.data.motivo ?? null;
      }
    } catch {
      // Body is optional for PATCH — if absent or invalid, continue without motivo
    }

    // --- Update appointment ---
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelada',
        ...(motivo ? { cancellation_reason: motivo } : {}),
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error('[Cancel Appointment] Update error:', updateError);
      return NextResponse.json(
        { error: 'Error al cancelar la cita.' },
        { status: 500 },
      );
    }

    // --- Log activity (best-effort) ---
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_cancelled',
        details: {
          appointment_id: appointmentId,
          motivo,
        },
      })
      .then(({ error: logError }) => {
        if (logError) {
          console.error('[Cancel Appointment] Activity log error:', logError);
        }
      });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[Cancel Appointment] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
