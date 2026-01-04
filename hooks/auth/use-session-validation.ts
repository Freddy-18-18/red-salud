"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { sessionManager } from "@/lib/security/session-manager";

/**
 * Hook que valida automáticamente la sesión del usuario
 * Se ejecuta en cada cambio de ruta o mount del componente
 * 
 * Uso: Agregar en layouts de áreas protegidas
 */
export function useSessionValidation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const validateCurrentSession = async () => {
      // Solo validar en rutas protegidas (dashboard)
      if (!pathname.startsWith("/dashboard")) return;

      const validation = await sessionManager.validateSession();

      if (!validation.valid) {
        console.log(`⚠️ Sesión inválida: ${validation.reason}`);
        
        // Mapear razones a mensajes de usuario
        const reasonMessages: Record<string, string> = {
          no_session: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
          no_config: "Configuración de sesión inválida. Por favor inicia sesión nuevamente.",
          expired: "Tu sesión ha expirado por tiempo. Por favor inicia sesión nuevamente.",
          device_changed: "Se detectó un cambio de dispositivo. Por favor inicia sesión nuevamente.",
        };

        const message = reasonMessages[validation.reason || ""] || "Sesión inválida";

        // Redirigir a login con mensaje
        const loginUrl = new URL("/login", window.location.origin);
        loginUrl.searchParams.set("error", "session_invalid");
        loginUrl.searchParams.set("message", message);
        
        router.push(loginUrl.pathname + loginUrl.search);
      }
    };

    validateCurrentSession();

    // Validar cada 5 minutos
    const interval = setInterval(validateCurrentSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pathname, router]);
}
