import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Callback de OAuth (Google, GitHub, etc.)
 * Maneja el intercambio de código por sesión y redirección
 * 
 * IMPORTANTE: Diferencia entre LOGIN y REGISTRO
 * - action=login → Solo permite si la cuenta ya existe
 * - action=register → Crea nueva cuenta con el rol especificado
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const action = requestUrl.searchParams.get("action"); // "login" o "register"
  const pendingRole = requestUrl.searchParams.get("role");

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options || {})
              );
            } catch {
              // Ignore - puede fallar en Server Components
            }
          },
        },
      }
    );
    
    // Intercambiar código por sesión
    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Verificar si el usuario ya tiene perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, created_at")
        .eq("id", user.id)
        .single();
      
      console.log("🔍 [CALLBACK] User ID:", user.id);
      console.log("🔍 [CALLBACK] Profile:", profile);
      console.log("🔍 [CALLBACK] Profile Error:", profileError);
      console.log("🔍 [CALLBACK] Action:", action);
      console.log("🔍 [CALLBACK] Pending Role:", pendingRole);
      
      // Verificar si el usuario fue creado recientemente (últimos 30 segundos)
      // Esto indica que es un registro nuevo, incluso si el trigger ya creó el perfil
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const secondsSinceCreation = (now.getTime() - userCreatedAt.getTime()) / 1000;
      const isRecentlyCreated = secondsSinceCreation < 30;
      
      console.log("🔍 [CALLBACK] User created at:", userCreatedAt);
      console.log("🔍 [CALLBACK] Seconds since creation:", secondsSinceCreation);
      console.log("🔍 [CALLBACK] Is recently created:", isRecentlyCreated);
      
      // ============================================================================
      // CASO 1: LOGIN - Usuario debe existir
      // ============================================================================
      if (action === "login") {
        if (!profile) {
          // Usuario NO existe → Cerrar sesión y mostrar error
          await supabase.auth.signOut();
          const errorUrl = new URL("/auth/login", requestUrl.origin);
          errorUrl.searchParams.set("error", "account_not_found");
          errorUrl.searchParams.set("email", user.email || "");
          return NextResponse.redirect(errorUrl);
        }
        
        // Usuario existe → Redirigir a su dashboard
        return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, requestUrl.origin));
      }
      
      // ============================================================================
      // CASO 2: REGISTRO - Crear o actualizar cuenta
      // ============================================================================
      if (action === "register") {
        // Si el usuario NO fue creado recientemente, es un usuario antiguo intentando registrarse
        if (!isRecentlyCreated && profile) {
          await supabase.auth.signOut();
          const errorUrl = new URL("/auth/login", requestUrl.origin);
          errorUrl.searchParams.set("error", "account_exists");
          errorUrl.searchParams.set("email", user.email || "");
          return NextResponse.redirect(errorUrl);
        }
        
        if (!pendingRole) {
          // No hay rol especificado → Error
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/auth/register?error=missing_role", requestUrl.origin));
        }
        
        // Si el perfil ya existe (creado por trigger), actualizarlo con el rol correcto
        if (profile) {
          console.log("🔄 [CALLBACK] Perfil existe (creado por trigger), actualizando rol...");
          
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              role: pendingRole,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
          
          if (updateError) {
            console.error("❌ [CALLBACK] Error al actualizar perfil:", updateError);
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL("/auth/register?error=profile_update_failed", requestUrl.origin));
          }
          
          console.log("✅ [CALLBACK] Perfil actualizado con rol:", pendingRole);
        } else {
          // Si no existe perfil, crearlo
          console.log("➕ [CALLBACK] Creando nuevo perfil...");
          
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            role: pendingRole,
            email: user.email,
            nombre_completo: user.user_metadata?.full_name || user.email?.split("@")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
          if (insertError) {
            console.error("❌ [CALLBACK] Error al crear perfil:", insertError);
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL("/auth/register?error=profile_creation_failed", requestUrl.origin));
          }
          
          console.log("✅ [CALLBACK] Perfil creado con rol:", pendingRole);
        }
        
        // Actualizar user_metadata con el rol
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: pendingRole }
        });
        
        if (metadataError) {
          console.error("❌ [CALLBACK] Error al actualizar user_metadata:", metadataError);
        } else {
          console.log("✅ [CALLBACK] user_metadata actualizado con rol:", pendingRole);
        }
        
        return NextResponse.redirect(new URL(`/dashboard/${pendingRole}`, requestUrl.origin));
      }
      
      // ============================================================================
      // CASO 3: Sin action especificada (fallback legacy)
      // ============================================================================
      // Si llegamos aquí, verificar si el usuario tiene perfil
      if (profile?.role) {
        // Usuario existe con rol → Redirigir al dashboard
        console.log("✅ [CALLBACK] Usuario con perfil encontrado, redirigiendo a dashboard");
        return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, requestUrl.origin));
      } else {
        // Usuario sin perfil → NO PERMITIR ACCESO
        // Cerrar sesión y redirigir a login con error
        console.log("❌ [CALLBACK] Usuario sin perfil, cerrando sesión");
        await supabase.auth.signOut();
        
        const loginUrl = new URL("/auth/login", requestUrl.origin);
        loginUrl.searchParams.set("error", "no_role");
        loginUrl.searchParams.set("message", "Debes registrarte con un rol específico");
        
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Si algo sale mal, redirigir al login
  console.log("❌ [CALLBACK] No se pudo procesar el callback");
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}

