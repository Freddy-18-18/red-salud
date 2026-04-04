import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  isGoogleCalendarConfigured,
} from '@/lib/services/google-calendar-service';

/**
 * GET /api/calendar/google/callback
 * OAuth2 callback endpoint — Google redirects here after the user authorizes.
 */
export async function GET(request: NextRequest) {
  const settingsUrl = (path: string) =>
    new URL(`/dashboard/medico/configuracion${path}`, request.url);

  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.redirect(
        settingsUrl('?gcal_error=not_configured'),
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    // Handle OAuth errors (e.g. user denied access)
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        settingsUrl('?gcal_error=access_denied'),
      );
    }

    // Validate parameters
    if (!code || !state) {
      return NextResponse.redirect(
        settingsUrl('?gcal_error=invalid_request'),
      );
    }

    const userId = state;

    // Exchange authorization code for tokens and persist them
    await exchangeCodeForTokens(code, userId);

    // Redirect back to settings with success indicator
    return NextResponse.redirect(settingsUrl('?gcal_connected=true'));
  } catch (error) {
    console.error('Error in Google Calendar OAuth callback:', error);
    return NextResponse.redirect(
      settingsUrl('?gcal_error=connection_failed'),
    );
  }
}
