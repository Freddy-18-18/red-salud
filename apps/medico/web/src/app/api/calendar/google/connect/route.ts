import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthorizationUrl,
  isGoogleCalendarConfigured,
} from '@/lib/services/google-calendar-service';

/**
 * GET /api/calendar/google/connect
 * Initiates OAuth2 flow to connect Google Calendar
 */
export async function GET() {
  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: 'Google Calendar no está configurado en el servidor.' },
        { status: 503 },
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Generate authorization URL and redirect
    const authUrl = getAuthorizationUrl(user.id);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google Calendar OAuth:', error);
    return NextResponse.json(
      { error: 'Error al iniciar conexión con Google Calendar' },
      { status: 500 },
    );
  }
}
