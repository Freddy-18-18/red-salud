/**
 * Tour Definitions Registry
 * Registro centralizado de todos los tours disponibles
 */

import { dashboardOverviewTour } from './tours/dashboard-overview';
import { appointmentsTour } from './tours/appointments-tour';
import type { TourDefinition } from './types';

// Registry de todos los tours
export const TOURS: TourDefinition[] = [
  dashboardOverviewTour,
  appointmentsTour,
  // Agregar más tours aquí según se implementen
];

// Helpers para buscar tours
export const getTourById = (id: string): TourDefinition | undefined => {
  return TOURS.find(tour => tour.id === id);
};

export const getToursByCategory = (category: string): TourDefinition[] => {
  return TOURS.filter(tour => tour.category === category);
};

export const getTourForRoute = (pathname: string): TourDefinition | undefined => {
  return TOURS.find(tour => {
    if (!tour.route) return false;
    if (typeof tour.route === 'string') {
      return pathname === tour.route || pathname.startsWith(tour.route);
    }
    return tour.route.test(pathname);
  });
};

export const getAutoStartTours = (): TourDefinition[] => {
  return TOURS.filter(tour => tour.autoStart);
};

// Constantes de localStorage
export const TOUR_STORAGE_KEYS = {
  COMPLETED: 'red-salud:tour:completed',
  SKIPPED: 'red-salud:tour:skipped',
  PROGRESS: 'red-salud:tour:progress',
  SETTINGS: 'red-salud:tour:settings',
  VISITED: 'red-salud:dashboard-visited',
} as const;

// Configuración por defecto
export const DEFAULT_TOUR_SETTINGS = {
  autoStartTours: true,
  showTooltips: true,
  animationsEnabled: true,
};
