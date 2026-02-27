import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/services/google-calendar-service';

/**
 * GET /api/calendar/google/callback
 * OAuth2 callback endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL('/consultorio/configuracion?gcal_error=access_denied', request.url)
      );
    }

    // Validate parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/consultorio/configuracion?gcal_error=invalid_request', request.url)
      );
    }

    const userId = state;

    // Exchange code for tokens
    await exchangeCodeForTokens(code, userId);

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL('/consultorio/configuracion?gcal_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error in Google Calendar OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/consultorio/configuracion?gcal_error=connection_failed', request.url)
    );
  }
}
