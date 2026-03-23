import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  syncAppointmentToGoogle,
  importEventsFromGoogle,
} from '@/lib/services/google-calendar-service';

/**
 * POST /api/calendar/google/sync
 * Trigger manual sync with Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { direction = 'bidirectional', appointmentIds } = body;

    const results = {
      success: true,
      to_google: { synced: 0, errors: [] as string[] },
      from_google: { imported: 0, error: null as string | null },
    };

    // Sync TO Google Calendar
    if (direction === 'to_google' || direction === 'bidirectional') {
      // Get appointments to sync
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .not('status', 'in', '(borrador,cancelada,rechazada)');

      if (appointmentIds && Array.isArray(appointmentIds)) {
        appointmentsQuery = appointmentsQuery.in('id', appointmentIds);
      }

      const { data: appointments, error: apptError } = await appointmentsQuery;

      if (apptError) {
        results.to_google.errors.push(`Error al obtener citas: ${apptError.message}`);
      } else if (appointments) {
        for (const appointment of appointments) {
          const result = await syncAppointmentToGoogle(user.id, appointment as any);
          if (result.success) {
            results.to_google.synced++;
          } else {
            results.to_google.errors.push(
              `Cita ${appointment.id}: ${result.error}`
            );
          }
        }
      }
    }

    // Import FROM Google Calendar
    if (direction === 'from_google' || direction === 'bidirectional') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Next 3 months

      const importResult = await importEventsFromGoogle(user.id, startDate, endDate);

      if (importResult.success) {
        results.from_google.imported = importResult.imported;
      } else {
        results.from_google.error = importResult.error || 'Unknown error';
        results.success = false;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/google/sync
 * Get sync status
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get token info
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokenData) {
      return NextResponse.json({
        connected: false,
      });
    }

    // Get sync stats
    const [mappingsCount, importedCount, pendingCount] = await Promise.all([
      supabase
        .from('google_calendar_event_mappings')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('google_calendar_imported_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('google_calendar_event_mappings')
        .select('id', { count: 'exact', head: true })
        .eq('sync_status', 'pending'),
    ]);

    return NextResponse.json({
      connected: true,
      calendar_id: tokenData.calendar_id,
      sync_enabled: tokenData.sync_enabled,
      last_sync_at: tokenData.last_sync_at,
      stats: {
        synced_appointments: mappingsCount.count || 0,
        imported_events: importedCount.count || 0,
        pending_syncs: pendingCount.count || 0,
      },
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de sincronización' },
      { status: 500 }
    );
  }
}
