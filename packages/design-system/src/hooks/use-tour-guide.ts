/**
 * Tour Guide Hook
 * Hook personalizado para acceder al contexto del Tour Guide
 */

'use client';

import { useContext } from 'react';
// TODO: Import TourGuideContext from the app's provider when available
// import { TourGuideContext } from '../components/dashboard/shared/tour-guide/tour-guide-provider';
// TODO: Import TourGuideContextValue from @red-salud/types when available
type TourGuideContextValue = any;
import { createContext } from 'react';
const TourGuideContext = createContext<TourGuideContextValue>(null);

export function useTourGuide(): TourGuideContextValue {
  const context = useContext(TourGuideContext);

  if (!context) {
    // En lugar de lanzar error, devolvemos un contexto vacío para evitar romper componentes
    // durante la carga inicial
    console.warn('useTourGuide debe usarse dentro de TourGuideProvider');

    return {
      currentTour: null,
      currentStep: 0,
      completedTours: [],
      startTour: () => { },
      nextStep: () => { },
      prevStep: () => { },
      skipTour: () => { },
      closeTour: () => { },
      isTourActive: false,
      canGoNext: false,
      canGoPrev: false,
      progress: 0,
    } as TourGuideContextValue;
  }

  return context;
}
