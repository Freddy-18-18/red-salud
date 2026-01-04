import { type UserRole } from "@/lib/supabase/auth";

const ROLE_LABELS: Record<string, string> = {
  paciente: "Paciente",
  medico: "Médico",
  clinica: "Clínica",
  farmacia: "Farmacia",
  laboratorio: "Laboratorio",
  ambulancia: "Ambulancia",
  seguro: "Seguro",
};

export interface RoleValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Valida que el rol del usuario coincida con el rol esperado
 * @param userRole - Rol del usuario autenticado
 * @param expectedRole - Rol esperado para la página/acción
 * @returns Resultado de la validación con mensaje de error si aplica
 */
export function validateUserRole(
  userRole: string,
  expectedRole: UserRole
): RoleValidationResult {
  if (userRole === expectedRole) {
    return { isValid: true };
  }

  const userRoleLabel = ROLE_LABELS[userRole] || userRole;
  const errorMessage = `Esta cuenta está registrada como ${userRoleLabel}. Por favor, inicia sesión en la página correcta.`;

  return {
    isValid: false,
    errorMessage,
  };
}

/**
 * Obtiene el label en español de un rol
 * @param role - Rol a traducir
 * @returns Label en español del rol
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}
