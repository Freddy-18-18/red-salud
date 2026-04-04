import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  syncAppointmentToGoogle,
  importEventsFromGoogle,
  isGoogleCalendarConfigured,
} from '@/lib/services/google-calendar-service';

/**
 * POST /api/calendar/google/sync
 * Trigger manual sync with Google Calendar.
 *
 * Body:
 *   direction: 'to_google' | 'from_google' | 'bidirectional' (default)
 *   appointmentIds?: string[]  — optional subset of appointments to sync
 */
export async function POST(request: NextRequest) {
  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: 'Google Calendar no está configurado en el servidor.' },
        { status: 503 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { direction = 'bidirectional', appointmentIds } = body;

    const results = {
      success: true,
      to_google: { synced: 0, errors: [] as string[] },
      from_google: { imported: 0, error: null as string | null },
    };

    // ── Sync TO Google Calendar ────────────────────────────────────────
    if (direction === 'to_google' || direction === 'bidirectional') {
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .not('status', 'in', '(borrador,cancelada,rechazada)');

      if (appointmentIds && Array.isArray(appointmentIds)) {
        appointmentsQuery = appointmentsQuery.in('id', appointmentIds);
      }

      const { data: appointments, error: apptError } =
        await appointmentsQuery;

      if (apptError) {
        results.to_google.errors.push(
          `Error al obtener citas: ${apptError.message}`,
        );
      } else if (appointments) {
        for (const appointment of appointments) {
          const result = await syncAppointmentToGoogle(
            user.id,
            appointment as Record<string, unknown>,
          );
          if (result.success) {
            results.to_google.synced++;
          } else {
            results.to_google.errors.push(
              `Cita ${appointment.id}: ${result.error}`,
            );
          }
        }
      }
    }

    // ── Import FROM Google Calendar ────────────────────────────────────
    if (direction === 'from_google' || direction === 'bidirectional') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Next 3 months

      const importResult = await importEventsFromGoogle(
        user.id,
        startDate,
        endDate,
      );

      if (importResult.success) {
        results.from_google.imported = importResult.imported;
      } else {
        results.from_google.error = importResult.error ?? 'Error desconocido';
        results.success = false;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/calendar/google/sync
 * Returns connection status and sync statistics.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // If Google Calendar is not configured, return disconnected gracefully
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json({
        connected: false,
        configured: false,
      });
    }

    // Get token info
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokenData) {
      return NextResponse.json({ connected: false, configured: true });
    }

    // Get this doctor's appointment IDs to query mappings
    // (google_calendar_event_mappings has no user_id — it references appointments)
    const { data: doctorAppts } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', user.id);

    const apptIds = doctorAppts?.map((a) => a.id) ?? [];

    // Get sync stats
    const mappingsQuery =
      apptIds.length > 0
        ? supabase
            .from('google_calendar_event_mappings')
            .select('id', { count: 'exact', head: true })
            .in('appointment_id', apptIds)
        : Promise.resolve({ count: 0 });

    const pendingQuery =
      apptIds.length > 0
        ? supabase
            .from('google_calendar_event_mappings')
            .select('id', { count: 'exact', head: true })
            .in('appointment_id', apptIds)
            .eq('sync_status', 'pending')
        : Promise.resolve({ count: 0 });

    const [mappingsCount, importedCount, pendingCount] = await Promise.all([
      mappingsQuery,
      supabase
        .from('google_calendar_imported_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      pendingQuery,
    ]);

    return NextResponse.json({
      connected: true,
      configured: true,
      calendar_id: tokenData.calendar_id,
      sync_enabled: tokenData.sync_enabled,
      last_sync_at: tokenData.last_sync_at,
      stats: {
        synced_appointments: mappingsCount.count ?? 0,
        imported_events: importedCount.count ?? 0,
        pending_syncs: pendingCount.count ?? 0,
      },
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de sincronización' },
      { status: 500 },
    );
  }
}
