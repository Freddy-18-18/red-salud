/**
 * Tour Guide System - Type Definitions
 * Sistema de tours guiados para onboarding y tutoriales
 */

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TourHighlight = 'none' | 'pulse' | 'bounce' | 'glow';

export interface TourStep {
  id: string;
  
  // Elemento a destacar (selector CSS o HTMLElement)
  target?: string | HTMLElement;
  
  // Contenido del tooltip
  title: string;
  description: string;
  
  // Posicionamiento
  placement?: TourPlacement;
  
  // Efectos visuales
  highlight?: TourHighlight;
  
  // Acción al llegar a este paso (ej: navegar a otra página)
  action?: () => void | Promise<void>;
  
  // Callback al salir del paso
  onLeave?: () => void;
  
  // Condición para mostrar este paso
  condition?: () => boolean;
  
  // Esperar antes de continuar (ms)
  delay?: number;
}

export interface TourDefinition {
  id: string;
  name: string;
  description: string;
  
  // Steps del tour
  steps: TourStep[];
  
  // Auto-iniciar para nuevos usuarios
  autoStart?: boolean;
  
  // Ruta donde debe estar activo (opcional)
  route?: string | RegExp;
  
  // Categoría para agrupar tours
  category?: 'onboarding' | 'feature' | 'workflow' | 'advanced';
  
  // Callbacks
  onStart?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export interface TourPersistence {
  completedTours: string[];
  skippedTours: string[];
  currentProgress: {
    tourId: string;
    stepIndex: number;
    timestamp: string;
  } | null;
  settings: {
    autoStartTours: boolean;
    showTooltips: boolean;
    animationsEnabled: boolean;
  };
}

export interface TourGuideContextValue {
  currentTour: TourDefinition | null;
  currentStep: number;
  completedTours: string[];
  
  // Actions
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  closeTour: () => void;
  
  // Utilities
  isTourActive: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  progress: number; // 0-100
}
