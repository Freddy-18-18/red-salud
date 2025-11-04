import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware de Next.js para protección de rutas
 * 
 * Este middleware se ejecutará en rutas que coincidan con el matcher.
 * Verifica autenticación con Supabase y protege rutas del dashboard.
 */

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session si existe
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ["/dashboard"];

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si es una ruta protegida y no hay sesión, redirigir a login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si hay sesión y el usuario intenta acceder a auth, redirigir a su dashboard
  if (session && pathname.startsWith("/auth")) {
    const role = session.user.user_metadata?.role || "paciente";
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  // Agregar headers de seguridad
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return res;
}

// Configurar qué rutas ejecutarán el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - public folder (archivos públicos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|videos).*)",
  ],
};
