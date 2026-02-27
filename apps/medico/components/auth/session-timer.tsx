"use client";

import { useState, useEffect } from "react";
import { sessionManager } from "@/lib/security/session-manager";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@red-salud/design-system";

interface SessionTimerProps {
  className?: string;
  showWarning?: boolean; // Mostrar warning cuando queden menos de 5 minutos
}

/**
 * Componente que muestra el tiempo restante de sesión
 * Se actualiza cada minuto y muestra advertencia cuando queda poco tiempo
 */
export function SessionTimer({ className, showWarning = true }: SessionTimerProps) {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const time = sessionManager.getRemainingTime();
      setRemainingTime(time);

      // Advertencia si quedan menos de 5 minutos
      const fiveMinutes = 5 * 60 * 1000;
      setIsWarning(showWarning && time > 0 && time < fiveMinutes);
    };

    // Actualizar inmediatamente
    updateTime();

    // Actualizar cada 30 segundos
    const interval = setInterval(updateTime, 30 * 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  // Formatear tiempo en minutos
  const formatTime = (ms: number): string => {
    if (ms <= 0) return "0 min";

    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes} min`;
  };

  // No mostrar si no hay tiempo restante
  if (remainingTime <= 0) return null;

  const handleExtendSession = async () => {
    await sessionManager.extendSession();
    setRemainingTime(sessionManager.getRemainingTime());
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-help",
              isWarning
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              className
            )}
          >
            {isWarning ? (
              <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            <span>{formatTime(remainingTime)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="text-xs font-medium">
              {isWarning
                ? "⚠️ Tu sesión está por expirar"
                : "⏱️ Tiempo restante de sesión"}
            </p>
            <p className="text-xs text-muted-foreground">
              Tu sesión se cerrará automáticamente por inactividad en{" "}
              <strong>{formatTime(remainingTime)}</strong>
            </p>
            {isWarning && (
              <button
                onClick={handleExtendSession}
                className="text-xs text-primary hover:underline font-medium"
              >
                Extender sesión
              </button>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t">
              💡 Cualquier actividad reiniciará el contador
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
