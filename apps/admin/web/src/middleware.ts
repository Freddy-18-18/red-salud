import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME } from '@/lib/supabase/cookie-name';

const PUBLIC_PATHS = new Set<string>([
  '/auth/login',
  '/auth/mfa',
  '/auth/callback',
  '/auth/forgot-password',
  '/unauthorized',
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/auth/')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isPublic(pathname)) {
    if (user && (pathname === '/auth/login' || pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('[admin-middleware] SUPABASE_SERVICE_ROLE_KEY not configured');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: rows, error } = await adminClient
    .from('admin_roles')
    .select('id')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .limit(1);

  if (error || !rows || rows.length === 0) {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
};
