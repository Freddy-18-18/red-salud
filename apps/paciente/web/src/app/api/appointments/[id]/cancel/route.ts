import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { cancelAppointmentSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Cancel Appointment — BFF API Route
// -------------------------------------------------------------------
// PATCH: Marks an appointment as cancelled.
// Patients may only cancel their own appointments. Status values follow
// the English `appointment_status` enum (pending, confirmed, completed,
// cancelled, waiting, in_progress, no_show).
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

    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, patient_id')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cita no encontrada.' }, { status: 404 });
      }
      console.error('[Cancel Appointment] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Error al obtener la cita.' }, { status: 500 });
    }

    if (existing.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para cancelar esta cita.' },
        { status: 403 },
      );
    }

    if (existing.status === 'cancelled') {
      return NextResponse.json({ error: 'La cita ya fue cancelada.' }, { status: 400 });
    }

    if (existing.status === 'completed') {
      return NextResponse.json(
        { error: 'No se puede cancelar una cita completada.' },
        { status: 400 },
      );
    }

    let reason: string | null = null;
    try {
      const body = await request.json();
      const validation = validateBody(cancelAppointmentSchema, body);
      if (validation.success) {
        reason = validation.data.reason ?? null;
      }
    } catch {
      // PATCH body is optional
    }

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        ...(reason ? { cancellation_reason: reason } : {}),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error('[Cancel Appointment] Update error:', updateError);
      return NextResponse.json({ error: 'Error al cancelar la cita.' }, { status: 500 });
    }

    void supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_cancelled',
        details: { appointment_id: appointmentId, reason },
      })
      .then(({ error: logError }) => {
        if (logError) console.error('[Cancel Appointment] Activity log error:', logError);
      });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[Cancel Appointment] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
