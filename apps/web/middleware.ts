import { createMiddlewareClient, getUserRoles } from './lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  // Rutas de la app medico separada
  const medicoAppPaths = [
    '/dashboard/medico',
  ]

  const isMedicoPath = medicoAppPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirigir rutas de medico a la app separada (puerto 3001)
  if (isMedicoPath) {
    const medicoUrl = process.env.MEDICO_APP_URL || 'http://localhost:3001'
    const newUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, medicoUrl)
    return NextResponse.redirect(newUrl)
  }

  // Rutas de la app secretarias separada
  const secretariaAppPaths = [
    '/dashboard/secretaria',
  ]

  const isSecretariaPath = secretariaAppPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirigir rutas de secretarias a la app separada (puerto 3004)
  if (isSecretariaPath) {
    const secretariaUrl = process.env.SECRETARIA_APP_URL || 'http://localhost:3004'
    const newUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, secretariaUrl)
    return NextResponse.redirect(newUrl)
  }

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/callback',
    '/nosotros',
    '/servicios',
    '/precios',
    '/blog',
    '/soporte',
    '/terminos',
    '/privacidad',
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith(path + '/')
  )

  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return response
  }

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Lógica de Redirección Inteligente (Multi-Role)
  if (user) {
    const roles = await getUserRoles(supabase, user.id)
    const activeRole = request.cookies.get('active_role')?.value

    // 1. Si está en /dashboard/redirect, mandarlo a su único rol o al selector
    if (request.nextUrl.pathname === '/dashboard/redirect') {
      if (roles.length === 1) {
        return NextResponse.redirect(new URL(`/dashboard/${roles[0]}`, request.url))
      }
      if (roles.length > 1) {
        // Si ya tiene un rol activo en cookies, usarlo
        if (activeRole && roles.includes(activeRole)) {
          return NextResponse.redirect(new URL(`/dashboard/${activeRole}`, request.url))
        }
        // Si no, mandarlo a una página de selección (o al primero por defecto)
        return NextResponse.redirect(new URL(`/dashboard/${roles[0]}`, request.url))
      }
    }

    // 2. Seguridad: Si intenta entrar a un dashboard que no tiene
    const pathParts = request.nextUrl.pathname.split('/')
    if (pathParts[1] === 'dashboard' && pathParts[2] && pathParts[2] !== 'redirect') {
      const requestedRole = pathParts[2]
      if (!roles.includes(requestedRole)) {
        // Si tiene otros roles, mandarlo al suyo principal. Si no, a login.
        return roles.length > 0
          ? NextResponse.redirect(new URL(`/dashboard/${roles[0]}`, request.url))
          : NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
