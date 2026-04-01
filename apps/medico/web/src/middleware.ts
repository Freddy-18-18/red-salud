import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const publicPaths = [
  '/',
  '/funcionalidades',
  '/especialidades',
  '/precios',
  '/terminos',
  '/privacidad',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the callback route handler do the PKCE exchange without interference
  if (pathname === '/auth/callback') {
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

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
