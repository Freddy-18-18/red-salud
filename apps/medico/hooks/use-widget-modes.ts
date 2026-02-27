"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { WidgetId } from "@red-salud/types";

export type WidgetMode = "compact" | "expanded";

interface WidgetModesState {
  modes: Record<WidgetId, WidgetMode>;
  loading: boolean;
  error: string | null;
}

interface UseWidgetModesProps {
  doctorId?: string;
}

export function useWidgetModes({ doctorId }: UseWidgetModesProps = {}) {
  const [state, setState] = useState<WidgetModesState>({
    modes: {} as Record<WidgetId, WidgetMode>,
    loading: true,
    error: null,
  });

  // Cargar modos desde Supabase
  const loadWidgetModes = useCallback(async () => {
    if (!doctorId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from("doctor_widget_modes")
        .select("widget_id, mode")
        .eq("doctor_id", doctorId);

      if (error) throw error;

      const modes = (data || []).reduce(
        (acc, item) => ({
          ...acc,
          [item.widget_id]: item.mode as WidgetMode,
        }),
        {} as Record<WidgetId, WidgetMode>,
      );

      setState({
        modes,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error loading widget modes:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar configuración de widgets";
      console.error("Widget modes error details:", {
        error: err,
        doctorId,
        errorMessage,
      });
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [doctorId]);

  // Guardar modo de un widget
  const saveWidgetMode = useCallback(
    async (widgetId: WidgetId, mode: WidgetMode) => {
      if (!doctorId) return;

      try {
        const { error } = await supabase.from("doctor_widget_modes").upsert(
          {
            doctor_id: doctorId,
            widget_id: widgetId,
            mode,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "doctor_id,widget_id",
          },
        );

        if (error) throw error;

        // Actualizar estado local
        setState((prev) => ({
          ...prev,
          modes: {
            ...prev.modes,
            [widgetId]: mode,
          },
        }));
      } catch (err) {
        console.error("Error saving widget mode:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al guardar configuración del widget";
        console.error("Widget mode save error details:", {
          error: err,
          doctorId,
          widgetId,
          mode,
          errorMessage,
        });
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [doctorId],
  );

  // Toggle entre compacto y expandido
  const toggleWidgetMode = useCallback(
    (widgetId: WidgetId) => {
      const currentMode = state.modes[widgetId] || "compact";
      const newMode: WidgetMode =
        currentMode === "compact" ? "expanded" : "compact";
      saveWidgetMode(widgetId, newMode);
    },
    [state.modes, saveWidgetMode],
  );

  // Obtener modo de un widget específico
  const getWidgetMode = useCallback(
    (widgetId: WidgetId): WidgetMode => {
      return state.modes[widgetId] || "compact";
    },
    [state.modes],
  );

  // Resetear todos los modos
  const resetWidgetModes = useCallback(async () => {
    if (!doctorId) return;

    try {
      const { error } = await supabase
        .from("doctor_widget_modes")
        .delete()
        .eq("doctor_id", doctorId);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        modes: {} as Record<WidgetId, WidgetMode>,
      }));
    } catch (err) {
      console.error("Error resetting widget modes:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al resetear configuración de widgets";
      console.error("Widget modes reset error details:", {
        error: err,
        doctorId,
        errorMessage,
      });
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [doctorId]);

  // Cargar datos iniciales
  useEffect(() => {
    loadWidgetModes();
  }, [loadWidgetModes]);

  return {
    modes: state.modes,
    loading: state.loading,
    error: state.error,
    getWidgetMode,
    saveWidgetMode,
    toggleWidgetMode,
    resetWidgetModes,
    reload: loadWidgetModes,
  };
}
