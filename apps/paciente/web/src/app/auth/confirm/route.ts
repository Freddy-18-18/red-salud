import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

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
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }[],
          ) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Can fail when called from a Server Component context
            }
          },
        },
      },
    );

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
  }

  // No code or exchange failed — redirect to callback page with error
  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('error', 'auth_exchange_failed');
  callbackUrl.searchParams.set(
    'error_description',
    'No se pudo completar la autenticacion. Intenta de nuevo.',
  );
  return NextResponse.redirect(callbackUrl);
}
