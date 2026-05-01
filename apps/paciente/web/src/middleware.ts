import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { checkCsrf } from '@/lib/utils/csrf';
import { PACIENTE_AUTH_COOKIE_NAME } from '@/lib/supabase/cookie-name';

const PUBLIC_PATHS = [
  '/',
  '/especialidades',
  '/buscar',
  '/medicos',
  '/nosotros',
  '/soporte',
  '/seguridad',
  '/para-profesionales',
  '/descargar',
];

const PACIENTE_ROLE = 'paciente';

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/auth/')) return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirectToLogin(request: NextRequest, error?: 'role_mismatch' | 'profile_missing') {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = '';
  if (error) {
    url.searchParams.set('error', error);
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API request logging
  if (pathname.startsWith('/api/')) {
    console.log(`[API] ${request.method} ${pathname}`);
  }

  // CSRF protection for mutation endpoints
  if (pathname.startsWith('/api/') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfResult = checkCsrf(request);
    if (csrfResult) return csrfResult;
  }

  // API routes handle their own auth + role checks — skip page-level role gating
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public paths skip auth entirely — no Supabase call
  if (isPublicPath(pathname)) {
    const response = NextResponse.next();

    // Set geo cookie if not present
    if (!request.cookies.get('rs-country')) {
      const country = request.headers.get('x-vercel-ip-country') ?? 'VE';
      const validCountry = ['VE', 'CO', 'MX'].includes(country) ? country : 'VE';
      response.cookies.set('rs-country', validCountry, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: PACIENTE_AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request);
  }

  // Role gating: only profiles.role === 'paciente' may enter the dashboard.
  // The Supabase project hosts every Red Salud app, so without this check a
  // doctor or admin token would happily browse the patient portal.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return redirectToLogin(request, 'profile_missing');
  }

  if (profile.role !== PACIENTE_ROLE) {
    return redirectToLogin(request, 'role_mismatch');
  }

  // Set geo cookie on authenticated responses too
  if (!request.cookies.get('rs-country')) {
    const country = request.headers.get('x-vercel-ip-country') ?? 'VE';
    const validCountry = ['VE', 'CO', 'MX'].includes(country) ? country : 'VE';
    supabaseResponse.cookies.set('rs-country', validCountry, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.json|icons/).*)'],
};
