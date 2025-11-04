import { supabase } from "./client";
import type { RegisterFormData, LoginFormData } from "@/lib/validations/auth";

export type UserRole = 
  | "paciente" 
  | "medico" 
  | "clinica" 
  | "farmacia" 
  | "laboratorio" 
  | "ambulancia" 
  | "seguro";

interface SignUpData extends RegisterFormData {
  role: UserRole;
}

/**
 * Registra un nuevo usuario con Supabase Auth
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

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("Error en signUp:", error);
    return {
      success: false,
      error: "Error inesperado al registrar usuario",
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
    return {
      success: false,
      error: "Error inesperado al iniciar sesión",
    };
  }
}

/**
 * Inicia sesión con OAuth (Google)
 */
export async function signInWithOAuth(provider: "google") {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
  };

  return errorMap[error] || error;
}
