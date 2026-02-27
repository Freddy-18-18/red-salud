"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@red-salud/identity";
import { Loader2 } from "lucide-react";
import { sessionManager } from "@/lib/security/session-manager";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Procesando inicio de sesión...</p>
      </div>
    </div>
  );
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading: isAuthLoading } = useSupabaseAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const hasProcessed = useRef(false);

  const handleSession = useCallback(async (currentSession: any) => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    setProcessing(true);

    try {
      const action = searchParams.get("action");
      const roleFromUrl = searchParams.get("role");
      const rememberMe = searchParams.get("rememberMe") === "true";

      const user = currentSession.user;

      // PRIORIDAD DE ROL
      let userRole: string;
      if (action === "register" && roleFromUrl) {
        userRole = roleFromUrl;
      } else {
        userRole = user.user_metadata?.role || "paciente";
      }

      console.log("🎯 Callback - Procesando sesión:", { userRole, action, roleFromUrl });

      // Sincronización con el servidor
      console.log("🎯 Callback - Sincronizando sesión con el servidor...");
      const syncResponse = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: currentSession.access_token,
          refreshToken: currentSession.refresh_token,
          role: roleFromUrl,
          action: action,
        }),
      });

      if (!syncResponse.ok) {
        console.warn("⚠️ Callback - Sincronización fallida, pero continuando...");
      } else {
        const syncData = await syncResponse.json();
        if (syncData.user?.role) {
          userRole = syncData.user.role;
        }
      }

      // IMPORTANTE: Configurar SessionManager para evitar el error "no_config"
      // Esto guarda el rol y las preferencias de sesión en el almacenamiento local
      const deviceFingerprint = btoa([
        navigator.userAgent,
        navigator.language,
        window.screen.width,
        window.screen.height,
        new Date().getTimezoneOffset(),
      ].join("|"));

      await sessionManager.setupSession({
        rememberMe,
        role: userRole,
        deviceFingerprint,
      });

      // Redirigir
      console.log(`🎯 Callback - Redirigiendo a /dashboard/${userRole}`);
      router.push(`/dashboard/${userRole}`);
    } catch (err) {
      console.error("❌ Callback - Error procesando sesión:", err);
      setError("Error al configurar tu perfil. Por favor intenta de nuevo.");
      setProcessing(false);
      hasProcessed.current = false;
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (!isAuthLoading && session && !hasProcessed.current) {
      handleSession(session);
    } else if (!isAuthLoading && !session && !hasProcessed.current) {
      const timer = setTimeout(() => {
        if (!session && !hasProcessed.current) {
          setError("No se pudo obtener la sesión de inicio de sesión.");
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [session, isAuthLoading, handleSession]);

  if (isAuthLoading || processing) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
