/**
 * Appointments Calendar Tour
 * Tour específico del sistema de calendario y citas
 */

import type { TourDefinition } from '@/lib/tour-guide/types';

export const appointmentsTour: TourDefinition = {
  id: 'appointments-tour',
  name: 'Sistema de Citas',
  description: 'Aprende a gestionar citas eficientemente',
  category: 'feature',
  route: '/dashboard/medico/citas', // Ruta específica del calendario
  
  steps: [
    {
      id: 'calendar-intro',
      title: 'Calendario de Citas Inteligente',
      description: 'Este calendario está diseñado para ser más eficiente que Google Calendar. Tiene funcionalidades específicas para médicos.',
      placement: 'center',
    },
    
    {
      id: 'view-selector',
      target: '[data-tour="calendar-view-buttons"]',
      title: 'Seleccionar Vista',
      description: 'Cambia entre diferentes vistas según tu flujo de trabajo. La vista Semana es ideal para planificación, mientras que Día es perfecta para el trabajo diario.',
      placement: 'bottom',
      highlight: 'glow',
    },
    
    {
      id: 'date-navigation',
      target: '[data-tour="date-navigation"]',
      title: 'Navegación de Fechas',
      description: 'Usa las flechas o los atajos ← → para navegar. El botón "Hoy" (atajo: T) te lleva rápidamente a la fecha actual.',
      placement: 'bottom',
    },
    
    {
      id: 'appointment-card',
      target: '[data-tour="appointment-card"]:first-of-type',
      title: 'Tarjeta de Cita',
      description: 'Cada cita muestra información clave: paciente, hora, duración, tipo y estado. Los colores indican el estado: verde (confirmada), amarillo (pendiente), azul (completada).',
      placement: 'right',
      condition: () => {
        // Solo mostrar si hay citas en la vista
        return document.querySelectorAll('[data-tour="appointment-card"]').length > 0;
      },
    },
    
    {
      id: 'click-appointment',
      target: '[data-tour="appointment-card"]:first-of-type',
      title: 'Ver Detalles',
      description: 'Haz clic en cualquier cita para ver detalles completos, iniciar videoconsulta, enviar mensaje o ver expediente médico.',
      placement: 'right',
      highlight: 'pulse',
    },
    
    {
      id: 'drag-drop-intro',
      target: '[data-tour="calendar-grid"]',
      title: 'Reprogramar con Drag & Drop',
      description: 'Una de las mejores funcionalidades: arrastra cualquier cita a un nuevo horario para reprogramarla instantáneamente.',
      placement: 'top',
    },
    
    {
      id: 'drag-drop-demo',
      target: '[data-tour="appointment-card"]:first-of-type',
      title: 'Intenta Arrastrarlo',
      description: 'Arrastra esta cita a otro horario. El sistema validará automáticamente si hay conflictos y no permitirá fechas pasadas.',
      placement: 'right',
      highlight: 'bounce',
    },
    
    {
      id: 'conflict-detection',
      target: '[data-tour="calendar-grid"]',
      title: 'Detección de Conflictos',
      description: 'Si intentas programar una cita que se superpone con otra, el sistema te alertará. Esto evita dobles reservas accidentales.',
      placement: 'top',
    },
    
    {
      id: 'time-slot-click',
      target: '[data-tour="time-slot"]',
      title: 'Agendar Rápido',
      description: 'Haz clic en cualquier espacio vacío para crear una cita nueva en ese horario. El formulario se pre-llenará con la fecha y hora seleccionadas.',
      placement: 'right',
    },
    
    {
      id: 'new-appointment-btn',
      target: '[data-tour="new-appointment-btn"]',
      title: 'Nueva Cita (Avanzado)',
      description: 'O usa este botón para abrir el formulario completo. También puedes presionar "N" en cualquier momento.',
      placement: 'bottom',
      highlight: 'pulse',
    },
    
    {
      id: 'appointment-types',
      title: 'Tipos de Cita',
      description: `El sistema soporta diferentes tipos:

• Presencial - Cita en consultorio
• Telemedicina - Videoconsulta
• Urgencia - Atención prioritaria
• Seguimiento - Control de tratamiento
• Primera Vez - Nuevo paciente

Cada tipo tiene un color distintivo.`,
      placement: 'center',
    },
    
    {
      id: 'appointment-status',
      title: 'Estados de Cita',
      description: `Las citas pasan por diferentes estados:

📅 Pendiente - Agendada pero no confirmada
✅ Confirmada - Paciente confirmó asistencia
⏱️ En Espera - Paciente llegó y espera
🩺 En Consulta - Atención en progreso
✔️ Completada - Consulta finalizada
❌ Cancelada - No se realizó
⚠️ No Asistió - Paciente no llegó

Puedes cambiar el estado desde el modal de detalles.`,
      placement: 'center',
    },
    
    {
      id: 'realtime-sync',
      target: '[data-tour="calendar-grid"]',
      title: 'Sincronización en Tiempo Real',
      description: 'Todas las citas se sincronizan automáticamente. Si un paciente agenda desde su app, verás la actualización instantánea sin recargar la página.',
      placement: 'top',
    },
    
    {
      id: 'filters',
      target: '[data-tour="calendar-filters"]',
      title: 'Filtros (Próximamente)',
      description: 'Pronto podrás filtrar citas por estado, tipo, paciente o especialidad para enfocarte en lo que necesitas.',
      placement: 'bottom',
      condition: () => document.querySelector('[data-tour="calendar-filters"]') !== null,
    },
    
    {
      id: 'keyboard-shortcuts',
      title: 'Atajos de Teclado del Calendario',
      description: `Domina estos atajos para ser más eficiente:

Navegación:
• T - Ir a hoy
• ← - Semana anterior
• → - Semana siguiente

Vistas:
• D - Vista día
• W - Vista semana
• M - Vista mes
• L - Vista lista

Acciones:
• N - Nueva cita
• ESC - Cerrar modal

¿Ves? Es más rápido que Google Calendar 😉`,
      placement: 'center',
    },
    
    {
      id: 'offline-patients',
      title: 'Pacientes Sin Cuenta',
      description: 'Puedes agendar citas para pacientes que no tienen cuenta en el sistema (modo offline). Solo necesitas nombre y teléfono. Útil para pacientes mayores.',
      placement: 'center',
    },
    
    {
      id: 'telemedicine',
      target: '[data-tour="appointment-card"][data-type="telemedicina"]',
      title: 'Videoconsultas',
      description: 'Las citas de telemedicina tienen un botón para iniciar la videollamada 15 minutos antes de la hora programada.',
      placement: 'right',
      condition: () => {
        return document.querySelector('[data-tour="appointment-card"][data-type="telemedicina"]') !== null;
      },
    },
    
    {
      id: 'messaging',
      title: 'Comunicación con Pacientes',
      description: 'Desde el modal de una cita, puedes enviar mensajes al paciente, recordatorios o instrucciones pre-consulta.',
      placement: 'center',
    },
    
    {
      id: 'medical-records',
      title: 'Expedientes Médicos',
      description: 'Al completar una cita, puedes crear o actualizar el expediente médico del paciente directamente desde el modal.',
      placement: 'center',
    },
    
    {
      id: 'analytics-hint',
      title: 'Estadísticas de Citas',
      description: 'En la sección de Analíticas puedes ver métricas detalladas: tasa de asistencia, duración promedio, ingresos por tipo de cita y más.',
      placement: 'center',
    },
    
    {
      id: 'complete',
      title: '¡Dominas el Calendario! 🎉',
      description: 'Ahora conoces todas las funcionalidades del sistema de citas. Practica arrastrando citas y explorando los diferentes estados. Si necesitas ayuda, pregunta al asistente con "/ayuda citas".',
      placement: 'center',
    }
  ],
};
