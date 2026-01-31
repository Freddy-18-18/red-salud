import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useOAuthErrors(setError: (error: string | null) => void) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const emailParam = searchParams.get("email");
    const messageParam = searchParams.get("message");
    const userRoleParam = searchParams.get("user_role");

    if (errorParam === "account_not_found") {
      setError(
        `No existe una cuenta con el email ${emailParam || "proporcionado"}. Por favor, regístrate primero.`
      );
    } else if (errorParam === "account_exists") {
      setError(
        `Ya existe una cuenta con el email ${emailParam || "proporcionado"}. Usa el login en lugar de registro.`
      );
    } else if (errorParam === "wrong_role") {
      const roleLabels: Record<string, string> = {
        paciente: "Paciente",
        medico: "Médico",
        clinica: "Clínica",
        farmacia: "Farmacia",
        laboratorio: "Laboratorio",
        ambulancia: "Ambulancia",
        seguro: "Seguro"
      };
      const userRoleLabel = userRoleParam ? roleLabels[userRoleParam] || userRoleParam : "otro rol";
      setError(
        `Esta cuenta está registrada como ${userRoleLabel}. Por favor, inicia sesión en la página correcta.`
      );
    } else if (errorParam === "no_role") {
      setError(
        messageParam ||
          "Debes registrarte con un rol específico. No puedes acceder sin un rol asignado."
      );
    } else if (errorParam === "no_profile") {
      setError(
        messageParam || "No tienes un perfil registrado. Por favor, regístrate primero."
      );
    } else if (errorParam === "incomplete_registration") {
      setError(
        messageParam || "Debes registrarte con un rol específico para acceder"
      );
    }
  }, [searchParams, setError]);
}
