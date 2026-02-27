import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

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

export async function getUserRoles(supabase: ReturnType<typeof createMiddlewareClient>, userId: string): Promise<string[]> {
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('user_id', userId);

    if (!error && userRoles) {
      const roles = userRoles
        .map((ur: any) => ur.roles?.name)
        .filter(Boolean);

      if (roles.length > 0) {
        return roles;
      }
    }
  } catch (err) {
    console.error('❌ [ROLES] Error consultando user_roles:', err);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role) {
      return [user.user_metadata.role];
    }
  } catch (err) {
    console.error('❌ [ROLES] Fallback error:', err);
  }

  return [];
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error && error.message.includes('refresh_token_not_found')) {
    console.warn('⚠️ [Middleware] Refresh token no encontrado. Limpiando sesión...');
  }

  return response
}

export default updateSession
