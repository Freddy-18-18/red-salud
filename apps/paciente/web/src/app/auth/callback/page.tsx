"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Heart, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

type CallbackStatus = "processing" | "success" | "error";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [message, setMessage] = useState("Procesando...");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const type = searchParams.get("type");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle error from provider
        if (errorParam) {
          setStatus("error");
          setMessage("Error de autenticacion");
          setErrorDetail(
            errorDescription || "Ocurrio un error durante la autenticacion."
          );
          return;
        }

        // Exchange code for session (handles email confirmation + OAuth)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (type === "recovery") {
          // Password reset flow -- redirect to reset page
          setStatus("success");
          setMessage("Enlace verificado. Redirigiendo...");
          setTimeout(() => {
            router.push("/auth/reset-password");
          }, 1500);
          return;
        }

        if (type === "signup" || type === "email") {
          // Email verification
          if (session) {
            setStatus("success");
            setMessage("Email verificado correctamente. Redirigiendo...");
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 2000);
          } else {
            setStatus("success");
            setMessage("Email verificado. Inicia sesion para continuar.");
            setTimeout(() => {
              router.push("/auth/login");
            }, 2500);
          }
          return;
        }

        // Generic callback (OAuth, magic link, etc.)
        if (session) {
          setStatus("success");
          setMessage("Sesion iniciada correctamente. Redirigiendo...");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1500);
        } else {
          // Try to extract session from URL hash (Supabase PKCE flow)
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const accessToken = hashParams.get("access_token");

          if (accessToken) {
            setStatus("success");
            setMessage("Sesion iniciada. Redirigiendo...");
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 1500);
          } else {
            setStatus("error");
            setMessage("No se pudo verificar la sesion");
            setErrorDetail(
              "El enlace puede haber expirado. Intenta de nuevo."
            );
          }
        }
      } catch (err) {
        setStatus("error");
        setMessage("Error al procesar la solicitud");
        setErrorDetail(
          err instanceof Error
            ? err.message
            : "Ocurrio un error inesperado."
        );
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {status === "processing" && (
        <>
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {message}
          </h1>
          <p className="text-gray-500">
            Estamos verificando tu solicitud. Un momento por favor.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {message}
          </h1>
          <p className="text-gray-500">
            Seras redirigido automaticamente.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {message}
          </h1>
          {errorDetail && (
            <p className="text-gray-600 mb-6">{errorDetail}</p>
          )}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-center"
            >
              Ir a Iniciar Sesion
            </Link>
            <Link
              href="/auth/register"
              className="block w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-center"
            >
              Crear una cuenta
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function CallbackLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
        Procesando...
      </h1>
      <p className="text-gray-500 text-center">
        Estamos verificando tu solicitud. Un momento por favor.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="h-8 w-8 text-emerald-600 fill-emerald-600" />
          <span className="text-2xl font-bold text-gray-900">Red Salud</span>
        </div>

        <Suspense fallback={<CallbackLoading />}>
          <CallbackHandler />
        </Suspense>
      </div>
    </main>
  );
}
