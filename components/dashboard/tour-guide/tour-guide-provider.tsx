/**
 * Tour Guide Provider
 * Context provider para gestionar el estado del tour guide
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { TourGuideOverlay } from './tour-guide-overlay';
import { TOURS, TOUR_STORAGE_KEYS, DEFAULT_TOUR_SETTINGS, getTourById, getTourForRoute } from '@/lib/tour-guide/tours';
import type { TourDefinition, TourGuideContextValue } from '@/lib/tour-guide/types';

export const TourGuideContext = createContext<TourGuideContextValue | null>(null);

interface TourGuideProviderProps {
  children: React.ReactNode;
}

export function TourGuideProvider({ children }: TourGuideProviderProps) {
  // Inicializar tour desde localStorage si existe progreso guardado
  const [currentTour, setCurrentTour] = useState<TourDefinition | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedProgress = localStorage.getItem(TOUR_STORAGE_KEYS.PROGRESS);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        return getTourById(progress.tourId) || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const savedProgress = localStorage.getItem(TOUR_STORAGE_KEYS.PROGRESS);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        return progress.stepIndex || 0;
      }
    } catch {
      return 0;
    }
    return 0;
  });

  // Inicializar completedTours desde localStorage
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(TOUR_STORAGE_KEYS.COMPLETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Inicializar settings desde localStorage
  const [settings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_TOUR_SETTINGS;
    try {
      const saved = localStorage.getItem(TOUR_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_TOUR_SETTINGS;
    } catch {
      return DEFAULT_TOUR_SETTINGS;
    }
  });

  const pathname = usePathname();

  // Funciones del tour (declaradas antes de los useEffects que las usan)
  const closeTour = useCallback(() => {
    setCurrentTour(null);
    setCurrentStep(0);
    localStorage.removeItem(TOUR_STORAGE_KEYS.PROGRESS);
  }, []);

  const completeTour = useCallback(() => {
    if (!currentTour) return;

    // Guardar como completado
    const updated = [...completedTours, currentTour.id];
    setCompletedTours(updated);
    localStorage.setItem(TOUR_STORAGE_KEYS.COMPLETED, JSON.stringify(updated));

    // Callback onComplete
    currentTour.onComplete?.();

    closeTour();
  }, [currentTour, completedTours, closeTour]);

  const startTour = useCallback((tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) {
      console.error(`Tour no encontrado: ${tourId}`);
      return;
    }

    setCurrentTour(tour);
    setCurrentStep(0);

    // Callback onStart
    tour.onStart?.();
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    // Callback onLeave del paso actual
    currentTour.steps[currentStep]?.onLeave?.();

    if (currentStep < currentTour.steps.length - 1) {
      setCurrentStep((prev: number) => prev + 1);
    } else {
      // Completar tour
      completeTour();
    }
  }, [currentTour, currentStep, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev: number) => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    if (!currentTour) return;

    // Guardar como saltado
    try {
      const skipped = JSON.parse(
        localStorage.getItem(TOUR_STORAGE_KEYS.SKIPPED) || '[]'
      );
      if (!skipped.includes(currentTour.id)) {
        skipped.push(currentTour.id);
        localStorage.setItem(TOUR_STORAGE_KEYS.SKIPPED, JSON.stringify(skipped));
      }
    } catch (error) {
      console.error('Error guardando tour saltado:', error);
    }

    // Callback onSkip
    currentTour.onSkip?.();

    closeTour();
  }, [currentTour, closeTour]);

  // Auto-start tour para nuevos usuarios
  useEffect(() => {
    if (!settings.autoStartTours) return;

    const isFirstVisit = !localStorage.getItem(TOUR_STORAGE_KEYS.VISITED);

    if (isFirstVisit) {
      // Marcar como visitado
      localStorage.setItem(TOUR_STORAGE_KEYS.VISITED, 'true');

      // Buscar tour con autoStart que no esté completado
      const autoTour = TOURS.find(
        t => t.autoStart && !completedTours.includes(t.id)
      );

      if (autoTour) {
        // Delay para que la UI esté lista
        setTimeout(() => {
          startTour(autoTour.id);
        }, 1500);
      }
    }
  }, [settings.autoStartTours, completedTours, startTour]);

  // Listen for custom start-tour events
  useEffect(() => {
    const handleStartTour = () => {
      // Try to find a tour for the current route
      const tour = getTourForRoute(pathname);
      if (tour) {
        startTour(tour.id);
      }
    };

    document.addEventListener('start-tour', handleStartTour);
    return () => document.removeEventListener('start-tour', handleStartTour);
  }, [pathname, startTour]);

  // Guardar progreso cuando cambia
  useEffect(() => {
    if (currentTour) {
      const progress = {
        tourId: currentTour.id,
        stepIndex: currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(TOUR_STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } else {
      localStorage.removeItem(TOUR_STORAGE_KEYS.PROGRESS);
    }
  }, [currentTour, currentStep]);

  const value: TourGuideContextValue = {
    currentTour,
    currentStep,
    completedTours,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    closeTour,
    isTourActive: currentTour !== null,
    canGoNext: currentTour ? currentStep < currentTour.steps.length - 1 : false,
    canGoPrev: currentStep > 0,
    progress: currentTour
      ? ((currentStep + 1) / currentTour.steps.length) * 100
      : 0,
  };

  return (
    <TourGuideContext.Provider value={value}>
      {children}

      {/* Renderizar overlay si hay tour activo */}
      {currentTour && (
        <TourGuideOverlay
          tour={currentTour}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onClose={closeTour}
        />
      )}
    </TourGuideContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del Tour Guide
 * @returns El contexto del Tour Guide con todas las funciones y estado
 * @throws Error si se usa fuera del TourGuideProvider
 */
export function useTourGuide() {
  const context = useContext(TourGuideContext);
  if (!context) {
    throw new Error('useTourGuide must be used within a TourGuideProvider');
  }
  return context;
}
