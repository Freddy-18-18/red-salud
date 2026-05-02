import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { cancelAppointmentSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { createDoctorNotificationDriver } from '@/lib/services/notifications';

// -------------------------------------------------------------------
// Cancel Appointment — BFF API Route
// -------------------------------------------------------------------
// PATCH: Marks an appointment as cancelled.
// Patients may only cancel their own appointments. The cancellation must
// land at least `doctor_settings.cancellation_window_hours` ahead of the
// scheduled time (default 24h). On success we write a doctor_notifications
// row so the medic sees it in real time on their dashboard.
// -------------------------------------------------------------------

const DEFAULT_CANCELLATION_WINDOW_HOURS = 24;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'mutation');
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
      .select('id, status, patient_id, doctor_id, scheduled_at')
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

    // --- Cancellation policy check ---
    // Look up the doctor's configured window. Missing row = use the platform
    // default. We deliberately do NOT join in the appointments fetch above
    // because that is the hot path for unrelated reads.
    const { data: settingsRow } = await supabase
      .from('doctor_settings')
      .select('cancellation_window_hours')
      .eq('doctor_id', existing.doctor_id)
      .maybeSingle();

    const windowHours =
      settingsRow?.cancellation_window_hours ?? DEFAULT_CANCELLATION_WINDOW_HOURS;
    const minLeadMs = windowHours * 60 * 60 * 1000;
    const scheduledMs = new Date(existing.scheduled_at as string).getTime();
    const now = Date.now();
    const leadMs = scheduledMs - now;

    if (leadMs < minLeadMs) {
      return NextResponse.json(
        {
          error: `Las cancelaciones deben hacerse al menos ${windowHours}h antes de la cita.`,
          code: 'cancellation_window',
          window_hours: windowHours,
        },
        { status: 422 },
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

    // --- Notify the doctor (best-effort) ---
    void createDoctorNotificationDriver(supabase).notify({
      recipientId: existing.doctor_id as string,
      type: 'appointment_cancelled',
      title: 'Cita cancelada por el paciente',
      message: reason
        ? `Motivo: ${reason}`
        : 'El paciente canceló sin especificar motivo.',
      actionUrl: `/dashboard/citas/${appointmentId}`,
    });

    void supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_cancelled',
        details: {
          appointment_id: appointmentId,
          reason,
          cancellation_window_hours: windowHours,
        },
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
