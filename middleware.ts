import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de Next.js para protección de rutas
 * 
 * Este middleware se ejecutará en rutas que coincidan con el matcher.
 * Actualmente configurado para rutas públicas, pero preparado para
 * futuras rutas privadas/protegidas cuando se implemente autenticación.
 */

export function middleware(request: NextRequest) {
  // Rutas protegidas (para futuro uso con autenticación)
  const protectedRoutes = [
    "/dashboard",
    "/perfil",
    "/citas",
    "/historial",
  ];

  const { pathname } = request.nextUrl;

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // TODO: Implementar lógica de autenticación
    // Por ahora, permitir acceso (cuando implementes auth, verifica el token aquí)
    
    // Ejemplo de redirección (descomentar cuando implementes auth):
    // const token = request.cookies.get('auth-token');
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // Agregar headers de seguridad
  const response = NextResponse.next();
  
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
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
