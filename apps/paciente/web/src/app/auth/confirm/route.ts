import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Server-side auth confirmation handler.
 *
 * Supabase PKCE flow redirects here with `?code=...` after the user
 * authenticates with a provider (Google, etc.) or confirms their email.
 * This route exchanges the authorization code for a session on the server,
 * sets the session cookies, then redirects to the appropriate page.
 *
 * Without this server-side code exchange, the `?code=` parameter is never
 * processed and the user remains unauthenticated.
 *
 * MUST use the shared `createClient()` so the cookie name (and therefore the
 * PKCE `code_verifier` cookie) matches the one written by the browser client.
 * Using `createServerClient` directly without `cookieOptions.name` would read
 * from the default Supabase cookie and the verifier lookup would silently fail.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/dashboard';

  // If the provider returned an error, show it on the callback page
  if (error) {
    const callbackUrl = new URL('/auth/callback', origin);
    callbackUrl.searchParams.set('error', error);
    if (errorDescription) {
      callbackUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(callbackUrl);
  }

  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Password recovery — send to reset page
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', origin));
      }

      // Email verification
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(new URL('/dashboard', origin));
      }

      // Default (OAuth, magic link) — go to next or dashboard
      const forwardUrl = next.startsWith('/') ? next : '/dashboard';
      return NextResponse.redirect(new URL(forwardUrl, origin));
    }

    // Code exchange failed — surface the actual error to the callback page
    const callbackUrl = new URL('/auth/callback', origin);
    callbackUrl.searchParams.set('error', 'auth_exchange_failed');
    callbackUrl.searchParams.set(
      'error_description',
      exchangeError.message ||
        'No se pudo completar la autenticacion. Intenta de nuevo.',
    );
    return NextResponse.redirect(callbackUrl);
  }

  // No code provided
  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('error', 'auth_exchange_failed');
  callbackUrl.searchParams.set(
    'error_description',
    'No se recibio un codigo de autenticacion. Intenta de nuevo.',
  );
  return NextResponse.redirect(callbackUrl);
}
