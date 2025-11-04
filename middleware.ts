import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de autenticación y protección de rutas
 * 
 * Funcionalidad:
 * 1. Protege rutas del dashboard
 * 2. Redirecciona según el rol del usuario
 * 3. Mantiene sesión actualizada con Supabase
 */

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ============================================================================
  // SI NO HAY USUARIO Y INTENTA ACCEDER A DASHBOARD → LOGIN
  // ============================================================================
  if (!user && pathname.startsWith('/dashboard/')) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ============================================================================
  // SI HAY USUARIO AUTENTICADO
  // ============================================================================
  if (user) {
    // Obtener perfil del usuario para verificar rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Si intenta acceder a dashboard pero no tiene rol → redirigir a completar perfil
    if (pathname.startsWith('/dashboard/') && !profile?.role) {
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url))
    }

    // ============================================================================
    // PROTECCIÓN POR ROL: Redirigir al dashboard correcto
    // ============================================================================
    if (profile && pathname === '/dashboard') {
      // Redirigir a dashboard específico del rol
      return NextResponse.redirect(
        new URL(`/dashboard/${profile.role}`, request.url)
      )
    }

    // Verificar que el usuario accede a su dashboard correcto
    if (pathname.startsWith('/dashboard/') && profile) {
      const dashboardRole = pathname.split('/')[2] // /dashboard/[role]/...
      
      // Si intenta acceder a dashboard de otro rol → redirigir al suyo
      if (dashboardRole && dashboardRole !== profile.role && dashboardRole !== 'shared') {
        return NextResponse.redirect(
          new URL(`/dashboard/${profile.role}`, request.url)
        )
      }
    }

    // Si usuario autenticado intenta ir a login/register → redirigir a su dashboard
    if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && profile) {
      return NextResponse.redirect(
        new URL(`/dashboard/${profile.role}`, request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
