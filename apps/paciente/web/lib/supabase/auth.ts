import { supabase } from "./client";
import type { RegisterFormData, LoginFormData } from "@red-salud/core/validations";
import { APP_URL } from "@/lib/constants";

export type UserRole =
  | "paciente"
  | "medico"
  | "clinica"
  | "farmacia"
  | "laboratorio"
  | "ambulancia"
  | "seguro"
  | "secretaria";

interface SignUpData extends RegisterFormData {
  role: UserRole;
}

/**
 * Registra un nuevo usuario con Supabase Auth
 * El rol se guarda automáticamente en user.user_metadata
 */
export async function signUp(data: SignUpData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: translateAuthError(authError.message),
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "No se pudo crear el usuario",
      };
    }

    // El rol está guardado en authData.user.user_metadata.role
    // Se sincronizará con el servidor cuando llame a /auth/sync-session
    console.log(`✅ [SIGNUP] Usuario registrado con rol: ${data.role}`);

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("Error en signUp:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Detectar errores de red
    if (errorMessage?.includes("fetch") || errorMessage?.includes("network")) {
      return {
        success: false,
        error: "Error de conexión. Verifica tu internet e intenta de nuevo.",
      };
    }

    return {
      success: false,
      error: "Error inesperado al registrar usuario. Intenta de nuevo.",
    };
  }
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signIn(data: LoginFormData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return {
        success: false,
        error: translateAuthError(authError.message),
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "No se pudo iniciar sesión",
      };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("Error en signIn:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Detectar errores de red
    if (errorMessage?.includes("fetch") || errorMessage?.includes("network")) {
      return {
        success: false,
        error: "Error de conexión. Verifica tu internet e intenta de nuevo.",
      };
    }

    return {
      success: false,
      error: "Error inesperado al iniciar sesión. Intenta de nuevo.",
    };
  }
}

/**
 * Inicia sesión con OAuth (Google)
 * @param provider - Proveedor OAuth (google, github, etc.)
 * @param role - Rol del usuario (solo para registro)
 * @param action - "login" o "register" para diferenciar el flujo
 * @param rememberMe - Si debe mantener la sesión iniciada
 */
export async function signInWithOAuth(
  provider: "google",
  role?: string,
  action: "login" | "register" = "login",
  rememberMe: boolean = false
) {
  try {
    // Detectar la URL base de forma robusta
    let finalBaseUrl: string;

    if (typeof window !== 'undefined') {
      // En el cliente, usamos el origin actual, con un caso especial para localhost
      finalBaseUrl = window.location.origin;

      // EXTREMO: Si es localhost o subdominios (paciente.localhost, medico.localhost, etc.)
      if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.localhost')) {
        finalBaseUrl = `${window.location.protocol}//${window.location.host}`;
        console.log("🛠️ DEBUG LOCALHOST:", finalBaseUrl);
        // Descomenta la siguiente línea solo si el log es muy rápido y no lo ves
        // alert("Redirecting to: " + finalBaseUrl + "/callback");
      }
    } else {
      // En el servidor, usamos APP_URL como fallback
      finalBaseUrl = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;
    }

    // Construir la URL de callback
    let callbackUrl = `${finalBaseUrl}/callback?action=${action}`;
    if (role && action === "register") {
      callbackUrl += `&role=${role}`;
    }
    callbackUrl += `&rememberMe=${rememberMe}`;

    console.log("➡️ OAuth Redirect Debug:", {
      origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      appUrl: APP_URL,
      finalBaseUrl,
      callbackUrl
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        data: {
          role: role || 'paciente',
          action: action,
        }
      } as any,
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error en signInWithOAuth:", error);
    return {
      success: false,
      error: "Error inesperado al iniciar sesión con Google",
    };
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error en signOut:", error);
    return {
      success: false,
      error: "Error inesperado al cerrar sesión",
    };
  }
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    return {
      success: true,
      user: null, // Don't crash if no user
    };
  }
}

/**
 * Asegura que el perfil del usuario existe en la base de datos.
 * Útil para flujos de OAuth donde el perfil podría no haberse creado aún.
 */
export async function ensureProfileExists(user: any) {
  if (!user) return null;

  try {
    const role = user.user_metadata?.role || "paciente";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];

    console.log(`🔍 [AUTH] Verificando perfil para ${user.email} (${user.id})...`);

    // Intentar obtener el perfil
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // Error que no sea "no se encontró"
      console.error("❌ [AUTH] Error al consultar perfil:", error);
      throw error;
    }

    if (!profile) {
      console.log(`➕ [AUTH] Perfil no encontrado. Creando para ${user.email} con rol ${role}...`);

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          nombre_completo: fullName,
          role: role,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ [AUTH] Error al crear perfil:", createError);
        throw createError;
      }

      return newProfile;
    }

    // Si ya existe, asegurar que el rol coincida con el de los metadatos si está en flujo de registro
    return profile;
  } catch (error) {
    console.error("❌ [AUTH] Error crítico en ensureProfileExists:", error);
    return null;
  }
}

/**
 * Traduce mensajes de error de Supabase al español
 */
function translateAuthError(error: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Credenciales de inicio de sesión inválidas",
    "Email not confirmed": "El correo electrónico no ha sido confirmado",
    "User already registered": "El usuario ya está registrado",
    "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres",
    "Unable to validate email address: invalid format": "Formato de correo electrónico inválido",
    "Signup requires a valid password": "El registro requiere una contraseña válida",
    "User not found": "Usuario no encontrado",
    "Invalid email or password": "Correo electrónico o contraseña inválidos",
    "Email rate limit exceeded": "Límite de correos excedido, intenta más tarde",
    "Signups not allowed for this instance": "Los registros no están permitidos",
    "Password is too weak": "La contraseña es muy débil",
    "Email link is invalid or has expired": "El enlace de email es inválido o ha expirado",
    "Token has expired or is invalid": "El token ha expirado o es inválido",
    "New password should be different from the old password": "La nueva contraseña debe ser diferente a la anterior",
    "Database error saving new user": "Error de base de datos al guardar el usuario",
    "Unable to process request": "No se pudo procesar la solicitud",
  };

  return errorMap[error] || error;
}
