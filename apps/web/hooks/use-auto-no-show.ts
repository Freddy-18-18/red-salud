"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  autoUpdateAppointmentStatus,
  NO_SHOW_GRACE_MINUTES,
} from "@/lib/services/appointment-status";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";

/** Intervalo de revisión en milisegundos (5 minutos) */
const CHECK_INTERVAL_MS = 5 * 60_000;

interface UseAutoNoShowOptions {
  /** Lista actual de citas visibles */
  appointments: CalendarAppointment[];
  /** Callback cuando alguna cita fue actualizada automáticamente */
  onUpdated?: (updatedIds: string[]) => void;
  /** Desactivar el auto-check (e.g., no hay doctorId todavía) */
  enabled?: boolean;
}

/**
 * Hook que revisa periódicamente si hay citas pasadas sin atender
 * y las marca como `no_asistio` tras el período de gracia.
 *
 * Ejecuta tanto la RPC del servidor como un fallback client-side.
 */
export function useAutoNoShow({
  appointments,
  onUpdated,
  enabled = true,
}: UseAutoNoShowOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;

  const checkNoShows = useCallback(async () => {
    if (!enabled) return;

    // Detección local rápida: ¿hay citas vencidas en la lista actual?
    const now = Date.now();
    const cutoff = now - NO_SHOW_GRACE_MINUTES * 60_000;
    const overdueLocal = appointments.filter(
      (a) =>
        (a.status === "pendiente" || a.status === "confirmada") &&
        new Date(a.fecha_hora).getTime() < cutoff
    );

    if (overdueLocal.length === 0) return;

    // Ejecutar la actualización (RPC → fallback)
    const result = await autoUpdateAppointmentStatus();

    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      onUpdatedRef.current?.(result.data as string[]);
    } else if (result.success && overdueLocal.length > 0) {
      // La actualización fue exitosa pero no devolvió IDs – notificar con los IDs locales
      onUpdatedRef.current?.(overdueLocal.map((a) => a.id));
    }
  }, [appointments, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Ejecutar inmediatamente al montar
    checkNoShows();

    // Programar intervalo
    timerRef.current = setInterval(checkNoShows, CHECK_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [checkNoShows, enabled]);
}
