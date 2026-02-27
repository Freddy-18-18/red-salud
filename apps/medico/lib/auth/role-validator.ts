import { type UserRole } from "@/lib/supabase/auth";
import { getAppUrl } from "@/lib/app-urls";

export interface RoleValidationResult {
  isValid: boolean;
  errorMessage?: string;
  redirectUrl?: string;
}

/**
 * Valida que el rol del usuario coincida con "medico".
 * Si no es médico, sugiere el redirect a la app correcta.
 */
export function validateUserRole(
  userRole: string,
  expectedRole: UserRole
): RoleValidationResult {
  if (userRole === expectedRole) {
    return { isValid: true };
  }

  // Sugerir la app correcta según el rol
  if (userRole === "paciente") {
    return {
      isValid: false,
      errorMessage: "Tu cuenta es de Paciente. Serás redirigido a la app correcta.",
      redirectUrl: getAppUrl("paciente", "/login"),
    };
  }

  return {
    isValid: false,
    errorMessage: `Tu cuenta tiene el rol "${userRole}". Esta app es exclusiva para médicos. Por favor, inicia sesión en el portal.`,
    redirectUrl: getAppUrl("portal", "/login"),
  };
}

/**
 * Obtiene el label en español de un rol
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    medico: "Médico",
    paciente: "Paciente",
  };
  return labels[role] || role;
}
