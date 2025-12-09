/**
 * Dashboard Overview Tour
 * Tour introductorio del dashboard para nuevos médicos
 */

import type { TourDefinition } from '@/lib/tour-guide/types';

export const dashboardOverviewTour: TourDefinition = {
  id: 'dashboard-overview',
  name: 'Introducción al Dashboard',
  description: 'Conoce las funcionalidades principales de tu dashboard médico',
  category: 'onboarding',
  autoStart: true, // Se inicia automáticamente para nuevos usuarios
  route: '/dashboard/medico', // Ruta donde está disponible este tour
  
  steps: [
    {
      id: 'welcome',
      title: '¡Bienvenido a Red Salud! 👋',
      description: 'Te guiaremos por las funcionalidades principales del dashboard. Este tour tomará aproximadamente 2 minutos. Puedes saltarlo en cualquier momento presionando ESC.',
      placement: 'center',
    },
    
    {
      id: 'calendar-intro',
      target: '[data-tour="calendar-section"]',
      title: 'Calendario de Citas',
      description: 'Tu calendario principal con vistas Día, Semana y Mes. Aquí gestionas todas tus citas de forma eficiente.',
      placement: 'top',
      condition: () => {
        // Solo mostrar si ya estamos en la página de citas
        return window.location.pathname.includes('/citas');
      }
    },
    
    {
      id: 'calendar-views',
      target: '[data-tour="calendar-view-buttons"]',
      title: 'Vistas del Calendario',
      description: 'Cambia entre vista Día, Semana, Mes y Lista según tu preferencia. También puedes usar atajos de teclado: D, W, M, L.',
      placement: 'bottom',
    },
    
    {
      id: 'new-appointment',
      target: '[data-tour="new-appointment-btn"]',
      title: 'Crear Nueva Cita',
      description: 'Haz clic aquí para agendar una nueva cita. También puedes presionar la tecla "N" desde cualquier lugar del calendario.',
      placement: 'bottom',
      highlight: 'bounce',
    },
    
    {
      id: 'drag-drop',
      target: '[data-tour="calendar-grid"]',
      title: 'Reprogramar con Drag & Drop',
      description: 'Puedes arrastrar y soltar citas para reprogramarlas rápidamente. El sistema validará automáticamente conflictos.',
      placement: 'top',
    },
    
    {
      id: 'realtime-updates',
      target: '[data-tour="realtime-indicator"]',
      title: 'Actualizaciones en Tiempo Real',
      description: 'Las citas se sincronizan automáticamente. Si un paciente agenda desde la app, verás el cambio instantáneamente sin recargar.',
      placement: 'bottom',
    },
    
    {
      id: 'keyboard-shortcuts',
      title: 'Atajos de Teclado ⌨️',
      description: `Usa estos atajos para trabajar más rápido:

• N - Nueva cita
• T - Ir a hoy
• ← → - Navegar semanas
• D / W / M / L - Cambiar vistas
• ESC - Cerrar modales

Presiona ? en cualquier momento para ver todos los atajos.`,
      placement: 'center',
    },
    
    {
      id: 'complete',
      title: '¡Tour Completado! 🎉',
      description: 'Ya conoces lo básico del calendario. Explora libremente y practica arrastrando citas para reprogramarlas. ¡Disfruta de tu dashboard!',
      placement: 'center',
    }
  ],
  
  onStart: () => {
    console.log('Dashboard overview tour started');
    // Analytics: track tour start
  },
  
  onComplete: () => {
    console.log('Dashboard overview tour completed');
    // Analytics: track completion
    // Mostrar mensaje de felicitación
  },
  
  onSkip: () => {
    console.log('Dashboard overview tour skipped');
    // Analytics: track skip
  },
};
