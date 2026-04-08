import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { checkCsrf } from '@/lib/utils/csrf';

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

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/auth/')) return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
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

  // API routes handle their own auth — skip redirect logic
  // (logging + CSRF already applied above)
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
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
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
