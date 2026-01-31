import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

/**
 * Endpoint para sincronizar la sesión de Supabase después de signin/signup
 * 
 * Esto asegura que:
 * 1. Las cookies de sesión se actualicen en el servidor
 * 2. El user_metadata esté disponible para el proxy
 * 3. La redirección al dashboard sea inmediata
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Obtener el usuario actual
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('❌ [SYNC] Error obteniendo usuario:', error)
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener el rol del usuario
    const role = user.user_metadata?.role

    if (!role) {
      console.warn('⚠️ [SYNC] Usuario sin rol en user_metadata')
      return NextResponse.json(
        {
          success: true,
          user: user.id,
          email: user.email,
          role: null,
          message: 'Sesión sincronizada pero sin rol asignado',
        },
        { status: 200 }
      )
    }

    console.log(`✅ [SYNC] Sesión sincronizada para ${user.email} con rol: ${role}`)

    return NextResponse.json(
      {
        success: true,
        user: user.id,
        email: user.email,
        role: role,
        message: 'Sesión sincronizada correctamente',
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ [SYNC] Error en endpoint:', err)
    return NextResponse.json(
      { error: 'Error sincronizando sesión' },
      { status: 500 }
    )
  }
}
