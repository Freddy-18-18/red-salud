import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const publicPaths = [
  '/',
  '/funcionalidades',
  '/especialidades',
  '/precios',
  '/nosotros',
  '/seguridad',
  '/contacto',
  '/legal',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Let the callback route handler do the PKCE exchange without interference
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Dev-only UI preview bypass for onboarding wizard (visual QA, no real submits).
  if (
    process.env.NODE_ENV !== 'production' &&
    pathname.startsWith('/onboarding') &&
    searchParams.get('preview') === '1'
  ) {
    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/')) || pathname.startsWith('/auth/');

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Onboarding gate: doctors must complete the wizard before accessing /dashboard.
  // Conversely, doctors who already onboarded should not see /onboarding again.
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding'))) {
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles')
      .select('specialty_id, dashboard_config')
      .eq('profile_id', user.id)
      .maybeSingle();

    const config = doctorProfile?.dashboard_config as { onboarding_completed?: boolean } | null;
    const isOnboarded = !!doctorProfile?.specialty_id && config?.onboarding_completed === true;

    if (!isOnboarded && pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/complete-profile';
      return NextResponse.redirect(url);
    }

    if (isOnboarded && pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
