import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side auth callback handler for Supabase PKCE flow.
 *
 * Supabase redirects here with `?code=...` after:
 * - Email confirmation (signup)
 * - Password recovery
 *
 * This route exchanges the authorization code for a session on the server,
 * sets the session cookies, then redirects to the appropriate page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/dashboard';

  // If the provider returned an error, redirect to login with error info
  if (error) {
    const loginUrl = new URL('/auth/login', origin);
    loginUrl.searchParams.set(
      'error',
      errorDescription || 'confirmation_failed'
    );
    return NextResponse.redirect(loginUrl);
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
            }[]
          ) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Can fail when called from a Server Component context
            }
          },
        },
      }
    );

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Password recovery — redirect to reset password page (if implemented)
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/login', origin));
      }

      // Email verification or default — go to dashboard
      const forwardUrl = next.startsWith('/') ? next : '/dashboard';
      return NextResponse.redirect(new URL(forwardUrl, origin));
    }
  }

  // No code or exchange failed — redirect to login with error
  const loginUrl = new URL('/auth/login', origin);
  loginUrl.searchParams.set('error', 'confirmation_failed');
  return NextResponse.redirect(loginUrl);
}
