import { useState } from "react";
// TODO: Import from auth-sdk client
type UserRole = "paciente" | "medico" | "secretaria" | "admin";
declare function signInWithOAuth(provider: string, role: UserRole): Promise<any>;

interface UseOAuthSignInProps {
  role: UserRole;
  mode: "login" | "register";
  onError: (error: string) => void;
  rememberMe?: boolean;
}

export function useOAuthSignIn({ role, mode, onError, rememberMe = false }: UseOAuthSignInProps) {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    onError("");

    const result = await signInWithOAuth("google", role, mode, rememberMe);

    if (!result.success) {
      const errorMessage = mode === "login" 
        ? "Error al iniciar sesión con Google"
        : "Error al registrarse con Google";
      onError(result.error || errorMessage);
      setIsLoading(false);
      return;
    }

    // Si es exitoso, el usuario será redirigido automáticamente
  };

  return {
    signInWithGoogle,
    isLoading,
  };
}
