"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salio mal
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          Estamos trabajando para solucionarlo. Intenta de nuevo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            Codigo de error: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
