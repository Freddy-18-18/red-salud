import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith('/auth/'));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Multi-tenant onboarding gate: a logged-in user without a pharmacy_details row
  // cannot enter /dashboard, and a user that already has one shouldn't see /onboarding.
  if (user) {
    const isDashboardPath = pathname.startsWith('/dashboard');
    const isOnboardingPath = pathname === '/onboarding';

    if (isDashboardPath || isOnboardingPath) {
      const { data: pharmacy } = await supabase
        .from('pharmacy_details')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (isDashboardPath && !pharmacy) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
      if (isOnboardingPath && pharmacy) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
