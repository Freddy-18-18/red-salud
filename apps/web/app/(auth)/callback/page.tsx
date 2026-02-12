"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthCallback = useCallback(async () => {
    try {
      const action = searchParams.get("action");
      const role = searchParams.get("role");
      const rememberMe = searchParams.get("rememberMe") === "true";

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Esperar a que Supabase procese el callback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtener la sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setError("No se pudo obtener la sesión de OAuth. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      const user = session.user;
      const userRole = user.user_metadata?.role || role || "paciente";

      // Si es registro y el rol no coincide, actualizar
      if (action === "register" && role && userRole !== role) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role },
        });

        if (updateError) {
          console.error("Error actualizando rol:", updateError);
        }
      }

      // Configurar rememberMe
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // Redirigir al dashboard correspondiente
      router.push(`/dashboard/${userRole}`);
    } catch (err) {
      console.error("Error en callback OAuth:", err);
      setError("Error al procesar el inicio de sesión con Google. Intenta nuevamente.");
      setLoading(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  if (loading) {
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
