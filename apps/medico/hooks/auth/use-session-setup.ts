"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { sessionManager } from "@/lib/security/session-manager";
import { supabase } from "@/lib/supabase/client";

/**
 * Hook que configura la sesión después del login (especialmente OAuth)
 * Lee el parámetro rememberMe de la URL y configura la sesión
 */
export function useSessionSetup() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const setupSessionFromParams = async () => {
      const rememberMeParam = searchParams.get("rememberMe");
      
      // Solo configurar si hay un parámetro rememberMe en la URL
      if (rememberMeParam === null) return;

      const rememberMe = rememberMeParam === "true";

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const role = user.user_metadata?.role;
      
      if (!role) {
        console.warn("⚠️ Usuario sin rol en metadata");
        return;
      }

      // Configurar sesión con sessionManager
      await sessionManager.setupSession({
        rememberMe,
        role,
        deviceFingerprint: await getDeviceFingerprint(),
      });

      console.log(`✅ Sesión configurada con rememberMe=${rememberMe} para rol ${role}`);

      // Limpiar el parámetro de la URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("rememberMe");
      router.replace(newUrl.pathname + newUrl.search);
    };

    setupSessionFromParams();
  }, [searchParams, router]);
}

// Helper para generar fingerprint del dispositivo
async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  return btoa(data);
}
