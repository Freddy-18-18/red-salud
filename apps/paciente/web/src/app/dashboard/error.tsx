"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error al cargar la seccion
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Ocurrio un problema inesperado. Intenta recargar esta seccion.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>

          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al dashboard
          </a>
        </div>

        {error.digest && (
          <p className="mt-5 text-xs text-gray-400">
            Referencia: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
