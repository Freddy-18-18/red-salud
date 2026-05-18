import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validation/validate';
import { rescheduleAppointmentSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { createDoctorNotificationDriver } from '@/lib/services/notifications';

// -------------------------------------------------------------------
// Reschedule Appointment — BFF API Route
// -------------------------------------------------------------------
// PATCH: Move an appointment to a new (date, time) without cancelling it.
// Patients may only reschedule their own non-completed/non-cancelled
// appointments. The new slot must clear `check_slot_available` (with the
// current row excluded) and `check_time_block_conflict`. The partial unique
// index `appointments_no_double_book` is the ultimate race guard.
// -------------------------------------------------------------------

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

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const validation = validateBody(rescheduleAppointmentSchema, body);
    if (!validation.success) return validation.response;

    const { scheduled_at: newScheduledAt, duration_minutes: requestedDuration } =
      validation.data;

    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, patient_id, doctor_id, scheduled_at, duration_minutes, location_id')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cita no encontrada.' }, { status: 404 });
      }
      console.error('[Reschedule] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Error al obtener la cita.' },
        { status: 500 },
      );
    }

    if (existing.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para reagendar esta cita.' },
        { status: 403 },
      );
    }

    if (existing.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No puedes reagendar una cita cancelada. Agendá una nueva.' },
        { status: 400 },
      );
    }

    if (existing.status === 'completed') {
      return NextResponse.json(
        { error: 'No puedes reagendar una cita que ya ocurrió.' },
        { status: 400 },
      );
    }

    if (existing.status === 'in_progress') {
      return NextResponse.json(
        { error: 'No puedes reagendar una cita que está en curso.' },
        { status: 400 },
      );
    }

    const durationMinutes =
      requestedDuration ?? (existing.duration_minutes as number) ?? 30;

    // Slot availability — exclude the row being moved so it doesn't conflict
    // with itself.
    const { data: slotCheck, error: slotErr } = await supabase.rpc(
      'check_slot_available',
      {
        p_doctor_id: existing.doctor_id,
        p_location_id: existing.location_id ?? null,
        p_start: newScheduledAt,
        p_duration_min: durationMinutes,
        p_buffer_before: 0,
        p_buffer_after: 0,
        p_exclude_id: appointmentId,
      },
    );

    if (slotErr) {
      console.error('[Reschedule] check_slot_available error:', slotErr);
      return NextResponse.json(
        { error: 'No pudimos validar el horario. Intentá de nuevo.' },
        { status: 500 },
      );
    }

    const slotResult = (slotCheck ?? {}) as {
      is_available?: boolean;
      conflicts?: unknown;
    };

    if (slotResult.is_available !== true) {
      return NextResponse.json(
        {
          error: 'El horario seleccionado ya no está disponible.',
          code: 'slot_taken',
          conflicts: slotResult.conflicts ?? undefined,
        },
        { status: 409 },
      );
    }

    const newEnd = new Date(
      new Date(newScheduledAt).getTime() + durationMinutes * 60_000,
    ).toISOString();

    const { data: blockOk, error: blockErr } = await supabase.rpc(
      'check_time_block_conflict',
      {
        p_doctor_id: existing.doctor_id,
        p_start: newScheduledAt,
        p_end: newEnd,
        p_exclude_id: appointmentId,
      },
    );

    if (blockErr) {
      console.error('[Reschedule] check_time_block_conflict error:', blockErr);
      return NextResponse.json(
        { error: 'No pudimos validar el horario. Intentá de nuevo.' },
        { status: 500 },
      );
    }

    if (blockOk !== true) {
      return NextResponse.json(
        {
          error: 'El médico no atiende en ese rango (bloqueo de agenda).',
          code: 'time_block_conflict',
        },
        { status: 409 },
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        scheduled_at: newScheduledAt,
        duration_minutes: durationMinutes,
        // Reschedule resets a 'confirmed' booking back to 'pending' so the
        // doctor explicitly re-confirms the new slot. Mirrors the medico flow.
        status: existing.status === 'confirmed' ? 'pending' : existing.status,
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      // PG 23505 = unique violation from appointments_no_double_book index.
      // A concurrent request grabbed the same slot between our check and
      // update — surface the same friendly message as `slot_taken`.
      if ((updateError as { code?: string }).code === '23505') {
        return NextResponse.json(
          {
            error: 'El horario seleccionado ya no está disponible.',
            code: 'slot_taken',
          },
          { status: 409 },
        );
      }
      console.error('[Reschedule] Update error:', updateError);
      return NextResponse.json(
        { error: 'Error al reagendar la cita.' },
        { status: 500 },
      );
    }

    // Notify the doctor (best-effort).
    void createDoctorNotificationDriver(supabase).notify({
      recipientId: existing.doctor_id as string,
      type: 'appointment_rescheduled',
      title: 'Cita reagendada por el paciente',
      message: `Nueva fecha: ${new Date(newScheduledAt).toLocaleString('es-VE')}`,
      actionUrl: `/dashboard/citas/${appointmentId}`,
    });

    void supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'appointment_rescheduled',
        details: {
          appointment_id: appointmentId,
          previous_scheduled_at: existing.scheduled_at,
          new_scheduled_at: newScheduledAt,
        },
      })
      .then(({ error: logError }) => {
        if (logError) console.error('[Reschedule] Activity log error:', logError);
      });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[Reschedule] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
