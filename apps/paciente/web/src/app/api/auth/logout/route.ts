import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { PACIENTE_AUTH_COOKIE_NAME } from '@/lib/supabase/cookie-name';

// -----------------------------------------------------------------------------
// POST /api/auth/logout
// -----------------------------------------------------------------------------
// Server-side logout. Calls supabase.auth.signOut({ scope: 'global' }) so the
// refresh token is revoked across every device, not just the current cookie.
// Logs the event to user_activity_log so support can audit suspicious sign-outs.
// Returns 204 with the auth cookie cleared.
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, 'mutation');
  if (limited) return limited;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    void supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: 'logout',
        details: { source: 'paciente_web' },
      })
      .then(({ error }) => {
        if (error) console.error('[Logout] Activity log error:', error);
      });
  }

  // scope: 'global' invalidates the refresh token on the auth server so every
  // active session for this user is killed, not just the cookie on this tab.
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) {
    console.error('[Logout] signOut error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesion.' },
      { status: 500 },
    );
  }

  const response = new NextResponse(null, { status: 204 });

  // Defense in depth: clear the namespaced cookie. signOut() should already
  // do this via the cookies setter, but a stale cookie left behind would let
  // the client appear logged-in until the next page nav.
  response.cookies.set(PACIENTE_AUTH_COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
