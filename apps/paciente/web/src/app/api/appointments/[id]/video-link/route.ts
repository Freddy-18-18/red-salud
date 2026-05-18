import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Video meeting link — BFF API Route
// -------------------------------------------------------------------
// GET: Returns the telemedicine meeting URL for an appointment, or 503 with
// a friendly message if the doctor hasn't configured it yet. Patients may
// only fetch links for THEIR own telemedicine appointments.
//
// We deliberately read the link from `telemedicine_sessions` (not from the
// appointment row) so the patient never sees a link that the doctor hasn't
// committed to yet — sessions are created when the doctor sets up the room.
// -------------------------------------------------------------------

const VIDEO_JOIN_WINDOW_MIN = 15;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = await checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const { id: appointmentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado.' },
        { status: 401 },
      );
    }

    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, scheduled_at, duration_minutes, status, appointment_type')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }

    if (appointment.patient_id !== user.id) {
      return NextResponse.json(
        { error: 'Cita no encontrada.' },
        { status: 404 },
      );
    }

    if (appointment.appointment_type !== 'telemedicine') {
      return NextResponse.json(
        { error: 'Esta cita no es de videollamada.' },
        { status: 400 },
      );
    }

    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'La cita fue cancelada.' },
        { status: 400 },
      );
    }

    // Time window guard — opens VIDEO_JOIN_WINDOW_MIN before, closes
    // duration_minutes + 30 min after so a slightly late patient can still
    // re-join if the doctor's still in the room.
    const now = Date.now();
    const start = new Date(appointment.scheduled_at as string).getTime();
    const minutesToStart = (start - now) / 60_000;
    const durationMin = (appointment.duration_minutes as number) ?? 30;
    const windowEndMs = start + (durationMin + 30) * 60_000;

    if (minutesToStart > VIDEO_JOIN_WINDOW_MIN) {
      return NextResponse.json(
        {
          error: `La videollamada se habilita ${VIDEO_JOIN_WINDOW_MIN} minutos antes de la cita.`,
          code: 'too_early',
          minutes_until_join: Math.ceil(minutesToStart - VIDEO_JOIN_WINDOW_MIN),
        },
        { status: 400 },
      );
    }

    if (now > windowEndMs) {
      return NextResponse.json(
        { error: 'La cita ya finalizó.', code: 'too_late' },
        { status: 400 },
      );
    }

    const { data: session } = await supabase
      .from('telemedicine_sessions')
      .select('id, meeting_url, status')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (!session?.meeting_url) {
      return NextResponse.json(
        {
          error:
            'Tu médico aún no ha configurado el enlace de la videollamada. Intenta de nuevo en unos minutos.',
          code: 'meeting_not_ready',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      data: {
        session_id: session.id,
        meeting_url: session.meeting_url,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('[Video Link] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
