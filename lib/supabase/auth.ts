import { supabase } from "./client";
import type { RegisterFormData, LoginFormData } from "@/lib/validations/auth";

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
  } catch (error: any) {
    console.error("Error en signUp:", error);

    // Detectar errores de red
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
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
  } catch (error: any) {
    console.error("Error en signIn:", error);

    // Detectar errores de red
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
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
    // Construir URL de callback con action, rol y rememberMe
    let callbackUrl = `${window.location.origin}/callback?action=${action}`;

    if (role && action === "register") {
      callbackUrl += `&role=${role}`;
    }
    
    // Agregar rememberMe a la URL
    callbackUrl += `&rememberMe=${rememberMe}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
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
      success: false,
      error: "Error inesperado al obtener usuario",
    };
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
