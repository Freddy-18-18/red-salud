import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

/**
 * Crea un cliente Supabase para middleware con manejo automático de cookies
 * 
 * Esto asegura que:
 * 1. Las cookies de sesión se sincronicen correctamente entre cliente y servidor
 * 2. Los datos de user_metadata estén disponibles inmediatamente después de signin
 * 3. El rol del usuario se persista en la sesión
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

/**
 * Obtiene el rol del usuario desde su sesión
 * Intenta múltiples fuentes:
 * 1. Tabla `profiles`
 * 2. `user.user_metadata.role`
 * 3. `user.user_metadata.full_name` (fallback)
 */
export async function getUserRole(supabase: ReturnType<typeof createMiddlewareClient>, userId: string) {
  // Intentar obtener de la tabla profiles
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!error && profile?.role) {
      console.log(`✅ [ROL] Encontrado en profiles: ${profile.role}`)
      return profile.role
    }
  } catch (err) {
    console.error('❌ [ROL] Error consultando profiles:', err)
  }

  // Si no existe en profiles, obtener del usuario actual
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!error && user?.user_metadata?.role) {
      console.log(`✅ [ROL] Encontrado en user_metadata: ${user.user_metadata.role}`)
      return user.user_metadata.role
    }

    // Log detallado si no hay rol
    if (!error && user) {
      console.log(`⚠️ [ROL] Usuario ${user.id} no tiene rol. user_metadata:`, user.user_metadata)
    }
  } catch (err) {
    console.error('❌ [ROL] Error obteniendo usuario:', err)
  }

  return undefined
}
