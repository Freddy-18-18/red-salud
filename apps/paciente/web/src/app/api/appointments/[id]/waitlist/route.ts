import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Patient Appointment Waitlist — opt-in / opt-out
// -------------------------------------------------------------------
// POST   → opt-in to be notified if a slot opens earlier than this cita.
// DELETE → opt-out (removes the row).
//
// The matching/notification side (when ANOTHER patient cancels and a slot
// opens) lives in the notifications worker — this route only manages the
// patient's own opt-in row. RLS scopes everything to auth.uid().
// -------------------------------------------------------------------

async function loadAppointment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  appointmentId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, doctor_id, patient_id, scheduled_at, status')
    .eq('id', appointmentId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return { error: 'not_found' as const };
  }
  if (data.patient_id !== userId) {
    return { error: 'forbidden' as const };
  }
  if (data.status === 'cancelled' || data.status === 'completed') {
    return { error: 'invalid_status' as const };
  }
  return { appointment: data };
}

export async function POST(
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
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const result = await loadAppointment(supabase, appointmentId, user.id);
    if ('error' in result) {
      if (result.error === 'not_found')
        return NextResponse.json({ error: 'Cita no encontrada.' }, { status: 404 });
      if (result.error === 'forbidden')
        return NextResponse.json({ error: 'Cita no encontrada.' }, { status: 404 });
      return NextResponse.json(
        {
          error:
            'No puedes anotarte en lista de espera para una cita cancelada o completada.',
        },
        { status: 400 },
      );
    }
    const { appointment } = result;

    // Upsert — reuse the existing row if present (toggling back from cancelled
    // to active is allowed via PATCH; here we always create-or-promote-active).
    const { data: existing } = await supabase
      .from('patient_appointment_waitlist')
      .select('id, status')
      .eq('patient_id', user.id)
      .eq('doctor_id', appointment.doctor_id)
      .eq('current_appointment_id', appointmentId)
      .maybeSingle();

    let row;
    if (existing) {
      const { data, error } = await supabase
        .from('patient_appointment_waitlist')
        .update({ status: 'active', notified_at: null })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) {
        console.error('[Waitlist POST] update error:', error);
        return NextResponse.json(
          { error: 'No pudimos activar la lista de espera.' },
          { status: 500 },
        );
      }
      row = data;
    } else {
      const { data, error } = await supabase
        .from('patient_appointment_waitlist')
        .insert({
          patient_id: user.id,
          doctor_id: appointment.doctor_id,
          current_appointment_id: appointmentId,
          before_at: appointment.scheduled_at,
        })
        .select()
        .single();
      if (error) {
        console.error('[Waitlist POST] insert error:', error);
        return NextResponse.json(
          { error: 'No pudimos sumarte a la lista de espera.' },
          { status: 500 },
        );
      }
      row = data;
    }

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    console.error('[Waitlist POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('patient_appointment_waitlist')
      .delete()
      .eq('patient_id', user.id)
      .eq('current_appointment_id', appointmentId);

    if (error) {
      console.error('[Waitlist DELETE] error:', error);
      return NextResponse.json(
        { error: 'No pudimos quitarte de la lista de espera.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error('[Waitlist DELETE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
