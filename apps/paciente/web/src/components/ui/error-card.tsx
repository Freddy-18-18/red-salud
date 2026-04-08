import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Small inline error display for embedding within pages/grids.
 *
 * Usage:
 * ```tsx
 * {error && <ErrorCard title="Error al cargar citas" onRetry={refetch} />}
 * ```
 */
export function ErrorCard({
  title = "Error al cargar",
  message = "No se pudo cargar esta informacion",
  onRetry,
  className = "",
}: ErrorCardProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-white border border-red-100 rounded-xl ${className}`}
    >
      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
