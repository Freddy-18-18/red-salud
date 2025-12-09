/**
 * Tour Guide Hook
 * Hook personalizado para acceder al contexto del Tour Guide
 */

'use client';

import { useContext } from 'react';
import { TourGuideContext } from '../components/dashboard/tour-guide/tour-guide-provider';
import type { TourGuideContextValue } from '@/lib/tour-guide/types';

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
      startTour: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipTour: () => {},
      closeTour: () => {},
      isTourActive: false,
      canGoNext: false,
      canGoPrev: false,
      progress: 0,
    } as TourGuideContextValue;
  }
  
  return context;
}
