import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// iCalendar (.ics) export — BFF API Route
// -------------------------------------------------------------------
// GET: Returns an .ics file for the patient to import into Google Calendar,
// Apple Calendar, Outlook, etc. The patient can only download .ics for their
// OWN appointments — same ownership check as the appointment GET route.
// -------------------------------------------------------------------

const APP_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3003';

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  in_person: 'Presencial',
  telemedicine: 'Video consulta',
  emergency: 'Emergencia',
  follow_up: 'Control',
  first_visit: 'Primera visita',
};

/**
 * Format a Date as `YYYYMMDDTHHMMSSZ` — the iCalendar UTC form. Ignoring
 * timezones at this layer is deliberate: `DTSTART:...Z` is portable and
 * Google/Apple/Outlook all render it in the user's local TZ on import.
 */
function toICSDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Escape per RFC 5545 §3.3.11: commas, semicolons, backslashes need a leading
 * backslash; newlines become `\n`. Skipping this breaks Outlook silently.
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * Wrap long lines at 75 octets per RFC 5545 §3.1. Importers tolerate
 * unwrapped lines but some (older Outlook, Lotus) truncate at 75 — wrap to
 * stay safe across the spectrum of clients people actually use.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunkLen = i === 0 ? 75 : 74;
    parts.push(i === 0 ? line.slice(i, i + chunkLen) : ' ' + line.slice(i, i + chunkLen));
    i += chunkLen;
  }
  return parts.join('\r\n');
}

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
        { error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 },
      );
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
        doctor_id,
        scheduled_at,
        duration_minutes,
        status,
        appointment_type,
        reason,
        notes,
        doctor:profiles!appointments_medico_id_fkey (
          full_name
        ),
        location:organization_locations (
          name,
          address_line,
          city,
          state
        )
        `,
      )
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (error || !appointment) {
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

    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No puedes exportar una cita cancelada.' },
        { status: 400 },
      );
    }

    const doctorRow = Array.isArray(appointment.doctor)
      ? appointment.doctor[0]
      : appointment.doctor;
    const doctorName = doctorRow?.full_name ?? 'Médico';
    const start = new Date(appointment.scheduled_at as string);
    const end = new Date(
      start.getTime() + ((appointment.duration_minutes as number) ?? 30) * 60_000,
    );
    const typeLabel =
      APPOINTMENT_TYPE_LABEL[appointment.appointment_type as string] ?? 'Consulta';

    const summary = `Cita con Dr. ${doctorName}`;
    const descriptionParts = [`Tipo: ${typeLabel}`];
    if (appointment.reason) descriptionParts.push(`Motivo: ${appointment.reason}`);
    if (appointment.notes) descriptionParts.push(`Notas: ${appointment.notes}`);
    const description = descriptionParts.join('\n');

    const locationRow = Array.isArray(appointment.location)
      ? appointment.location[0]
      : appointment.location;
    const locationStr =
      appointment.appointment_type === 'telemedicine'
        ? 'Video consulta (Red Salud)'
        : locationRow
          ? [
              locationRow.name,
              locationRow.address_line,
              locationRow.city,
              locationRow.state,
            ]
              .filter(Boolean)
              .join(', ')
          : 'Por confirmar';

    const url = `${APP_DOMAIN}/dashboard/citas/${appointmentId}`;
    const now = new Date();

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Red Salud//Paciente//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:apt-${appointmentId}@redsalud.app`,
      `DTSTAMP:${toICSDate(now)}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `LOCATION:${escapeICS(locationStr)}`,
      `URL:${url}`,
      `STATUS:${appointment.status === 'completed' ? 'CONFIRMED' : 'CONFIRMED'}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio: tu cita inicia en 1 hora',
      'TRIGGER:-PT1H',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].map(foldLine);

    const body = lines.join('\r\n') + '\r\n';

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="cita-${appointmentId}.ics"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Appointment ICS] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error al generar el calendario.' },
      { status: 500 },
    );
  }
}
