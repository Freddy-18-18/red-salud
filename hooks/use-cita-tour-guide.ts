/**
 * Hook para manejar el tour interactivo de la página de nueva cita
 * Maneja la inicialización, navegación y limpieza del tour
 */

import { useCallback, useEffect, useRef } from "react";
import { citaTourSteps } from "@/components/citas/nueva/tour-guide";

type TourInstance = {
  start: () => void;
  complete: () => void;
  cancel: () => void;
  next: () => void;
  back: () => void;
} | null;

export function useCitaTourGuide() {
  const tourInstanceRef = useRef<TourInstance>(null);
  const tourStartedRef = useRef(false);

  // Mostrar un tutorial simple sin dependencias externas
  const showSimpleTutorial = useCallback(() => {
    const message = `
Tutorial de Nueva Cita:
1. Selecciona un paciente
2. Establece la fecha y hora
3. Define el tipo de cita y motivo
4. Ingresa el precio (opcional)
5. Activa "Modo Avanzado" para más opciones
6. Haz clic en "Crear Cita"
    `.trim();

    alert(message);
  }, []);

  // Inicializar el tour (lazy loading de Shepherd)
  const initializeTour = useCallback(async () => {
    // Solo cargar si no está ya inicializado
    if (tourInstanceRef.current) {
      return;
    }

    try {
      // Intentar cargar Shepherd dinámicamente
      // @ts-ignore - shepherd.js types might be tricky with dynamic import
      const { default: Shepherd } = await import("shepherd.js");

      // Crear instancia del tour
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          scrollTo: { behavior: "smooth", block: "center" },
          cancelIcon: {
            enabled: true,
          },
        },
      });

      // Agregar pasos
      citaTourSteps.forEach((step) => {
        tour.addStep({
          ...step,
          buttons: step.buttons.map((btn) => ({
            text: btn.text,
            action: () => {
              if (btn.action === "next") tour.next();
              else if (btn.action === "back") tour.back();
              else if (btn.action === "cancel" || btn.action === "complete")
                tour.complete();
            },
          })),
        });
      });

      tourInstanceRef.current = tour;
    } catch (error) {
      console.warn(
        "Shepherd.js no está disponible. Usando tutorial simple.",
        error
      );
      // Fallback: mostrar un tutorial alternativo simple
      showSimpleTutorial();
    }
  }, [showSimpleTutorial]);

  // Iniciar el tour
  const startTour = useCallback(async () => {
    if (!tourInstanceRef.current) {
      await initializeTour();
    }

    if (tourInstanceRef.current && !tourStartedRef.current) {
      tourInstanceRef.current.start();
      tourStartedRef.current = true;
    } else if (!tourInstanceRef.current) {
      // Si no se pudo cargar Shepherd, mostrar tutorial simple
      showSimpleTutorial();
    }
  }, [initializeTour, showSimpleTutorial]);

  // Cancelar el tour
  const cancelTour = useCallback(() => {
    if (tourInstanceRef.current) {
      tourInstanceRef.current.cancel();
      tourStartedRef.current = false;
    }
  }, []);

  // Limpiar el tour al desmontar
  useEffect(() => {
    return () => {
      if (tourInstanceRef.current) {
        tourInstanceRef.current.complete();
      }
    };
  }, []);

  return {
    startTour,
    cancelTour,
    isInitialized: !!tourInstanceRef.current,
  };
}
