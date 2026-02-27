import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { disconnectGoogleCalendar } from '@/lib/services/google-calendar-service';

/**
 * POST /api/calendar/google/disconnect
 * Disconnect Google Calendar integration
 */
export async function POST() {
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

    // Disconnect
    const result = await disconnectGoogleCalendar(user.id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Error al desconectar Google Calendar' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
