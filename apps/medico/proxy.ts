import { createMiddlewareClient, getUserRoles } from './lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de la App Médico
 * 
 * Solo el rol "medico" está permitido.
 * Si el usuario tiene otro rol, se le redirige a la app correspondiente.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/callback']
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith(path + '/')
  )

  // URLs de otras apps
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000'
  const pacienteUrl = process.env.NEXT_PUBLIC_PACIENTE_URL || 'http://localhost:3002'

  // Sin usuario → login (redirigir ANTES de verificar rutas específicas)
  if (!user) {
    // Si es ruta de consultorio o dashboard → login directo
    if (request.nextUrl.pathname.startsWith('/consultorio') || request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Raíz → login
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Ruta pública → permitir acceso
  if (isPublicPath) {
    return response
  }

  // Si hay usuario pero va a raíz → consultorio
  if (request.nextUrl.pathname === '/' && user) {
    return NextResponse.redirect(new URL('/consultorio', request.url))
  }

  // ─── Validación de rol para rutas /consultorio/* ───
  if (request.nextUrl.pathname.startsWith('/consultorio')) {
    const roles = await getUserRoles(supabase, user.id)

    // Verificar que el usuario tenga rol de médico
    if (!roles.includes('medico')) {
      console.warn(`⚠️ [Middleware] Usuario ${user.id} sin rol medico. Roles: ${roles.join(', ')}`)

      if (roles.includes('paciente')) {
        return NextResponse.redirect(new URL(`${pacienteUrl}/dashboard/paciente`))
      }

      // Sin rol válido → login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // /dashboard/* → /consultorio/* (redirección legacy)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const newPath = request.nextUrl.pathname.replace('/dashboard', '/consultorio')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
