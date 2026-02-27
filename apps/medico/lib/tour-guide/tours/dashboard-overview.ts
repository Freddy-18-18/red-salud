/**
 * @file dashboard-overview.ts
 * @description Tour introductorio completo del dashboard para nuevos médicos.
 * Incluye explicación de modos, widgets arrastrables y todas las funcionalidades.
 * 
 * @module Tour/Dashboard
 */

import type { TourDefinition } from '@/lib/tour-guide/types';

export const dashboardOverviewTour: TourDefinition = {
  id: 'dashboard-overview',
  name: 'Introducción al Dashboard',
  description: 'Conoce todas las funcionalidades de tu dashboard médico',
  category: 'onboarding',
  autoStart: true, // Se inicia automáticamente la primera vez
  route: '/dashboard/medico',

  steps: [
    // =========================================================================
    // BIENVENIDA
    // =========================================================================
    {
      id: 'welcome',
      title: '¡Bienvenido a Red-Salud! 👋',
      description: 'Este es tu centro de control médico personalizable. Aquí gestionarás citas, pacientes, tareas y mucho más. Te guiaremos por todas las funcionalidades.',
      placement: 'center',
    },

    // =========================================================================
    // HEADER
    // =========================================================================
    {
      id: 'header-info',
      target: '[data-tour="dashboard-header"]',
      title: 'Tu Panel de Información',
      description: 'Aquí verás tu nombre, especialidad, fecha actual y tu estado de verificación SACS. Todo actualizado en tiempo real.',
      placement: 'bottom',
    },

    // =========================================================================
    // MODOS
    // =========================================================================
    {
      id: 'mode-indicator',
      target: '[data-tour="mode-indicator"]',
      title: 'Modo Simple vs Profesional',
      description: '**Haz clic aquí para cambiar de modo:**\n\n• **Simple**: Vista rápida con lo esencial\n• **Pro**: Más widgets y análisis detallados\n\n¡Pruébalo ahora!',
      placement: 'left',
    },

    // =========================================================================
    // WIDGETS PERSONALIZABLES
    // =========================================================================
    {
      id: 'widgets-button',
      target: '[data-tour="dashboard-actions"]',
      title: 'Personaliza tu Dashboard',
      description: 'Desde aquí puedes:\n\n• **Activar/desactivar** widgets\n• **Restablecer** el diseño original\n\nTus preferencias se guardan automáticamente en la nube.',
      placement: 'left',
    },

    {
      id: 'dashboard-grid',
      target: '[data-tour="dashboard-grid"]',
      title: '¡Widgets Arrastrables! 🖱️',
      description: 'Cada tarjeta es **un widget interactivo**. Puedes:\n\n• **Arrastrar y soltar** para reorganizar\n• **Click** para ver más detalles\n\nPrueba arrastrar las tarjetas para personalizar tu vista.',
      placement: 'top',
      highlight: 'pulse',
    },

    // =========================================================================
    // WIDGETS INDIVIDUALES
    // =========================================================================
    {
      id: 'stats-widget',
      target: '[data-widget="stats-overview"]',
      title: 'Widget de Estadísticas',
      description: 'Métricas clave de tu práctica:\n\n• Citas del día\n• Total de pacientes\n• Consultas del mes\n• Tu calificación promedio',
      placement: 'bottom',
    },

    {
      id: 'appointments-widget',
      target: '[data-widget="today-timeline"]',
      title: 'Timeline de Citas',
      description: 'Tu agenda del día en tiempo real:\n\n• Próximas citas\n• Estado de cada consulta\n• Acceso rápido al paciente',
      placement: 'right',
    },

    {
      id: 'tasks-widget',
      target: '[data-widget="tasks"]',
      title: 'Gestor de Tareas',
      description: 'Tu lista de pendientes:\n\n• Crear tareas con prioridad\n• Fechas límite\n• Marcar como completadas\n\nPuedes vincular tareas a pacientes específicos.',
      placement: 'left',
    },

    {
      id: 'quick-actions-widget',
      target: '[data-widget="quick-actions"]',
      title: 'Acciones Rápidas',
      description: 'Accesos directos a las funciones más usadas:\n\n• Nueva cita\n• Buscar paciente\n• Crear receta\n• Iniciar videollamada',
      placement: 'top',
    },

    // =========================================================================
    // CIERRE
    // =========================================================================
    {
      id: 'help-button',
      target: '[data-tour="help-button"]',
      title: 'Ayuda Siempre Disponible',
      description: 'Si necesitas volver a ver este tour, haz clic en el ícono de ayuda (?). También puedes acceder al chat de soporte.',
      placement: 'bottom',
    },

    {
      id: 'complete',
      title: '¡Estás Listo! 🚀',
      description: 'Ya conoces tu dashboard médico. Explora los widgets, personaliza tu vista y comienza a gestionar tu práctica.\n\n**Consejos finales:**\n• Arrastra widgets para organizarlos\n• El modo Pro tiene más funciones\n• Tus preferencias se guardan automáticamente',
      placement: 'center',
    }
  ],

  onStart: () => {
    console.log('[Tour] Dashboard overview started');
  },

  onComplete: () => {
    console.log('[Tour] Dashboard overview completed');
  },

  onSkip: () => {
    console.log('[Tour] Dashboard overview skipped');
  },
};
