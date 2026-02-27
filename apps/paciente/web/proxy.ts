import { createMiddlewareClient } from './lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de la App Paciente
 * 
 * App independiente - solo verifica que el usuario esté autenticado como paciente
 * No redirige a otras apps - muestra mensaje de acceso denegado si no es paciente
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/callback'];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith(path + '/')
  )

  // Si no hay usuario, redirigir al login
  if (!user) {
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/citas')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Rutas públicas permiten acceso
    if (isPublicPath) {
      return response
    }
    return response
  }

  // Si hay usuario y accede a "/", ir al dashboard
  if (request.nextUrl.pathname === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard/paciente', request.url))
  }

  // Si hay usuario pero intenta acceder a login/register, ir al dashboard
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard/paciente', request.url))
  }

  // Verificar rol de paciente para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/citas')) {
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)

    const roles = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || []
    
    // Fallback a metadata
    if (roles.length === 0 && user.user_metadata?.role) {
      roles.push(user.user_metadata.role)
    }

    // Si no tiene rol paciente, mostrar página de acceso denegado (no redirigir a otras apps)
    if (!roles.includes('paciente')) {
      return NextResponse.redirect(new URL('/acceso-denegado?razón=no_paciente', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
