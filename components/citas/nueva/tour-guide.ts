/**
 * Definiciones del tour interactivo para la página de nueva cita
 * Utiliza Shepherd.js para guiar al usuario a través del formulario
 */

export const citaTourSteps = [
  {
    id: "welcome",
    title: "Bienvenida al Formulario de Nueva Cita",
    text: "Este tour te guiará paso a paso para crear una nueva cita médica. Haz clic en 'Siguiente' para continuar.",
    attachTo: { element: ".page-title", on: "bottom" as const },
    buttons: [
      {
        text: "Saltar",
        action: "cancel",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "paciente-selection",
    title: "Selecciona el Paciente",
    text: "Aquí es donde seleccionas el paciente para la cita. Puedes elegir entre pacientes registrados o crear una cita para un paciente sin registro (offline).",
    attachTo: { element: "[data-tour='paciente-select']", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "programming",
    title: "Programación de la Cita",
    text: "Define la fecha, hora y duración de la cita. El sistema verificará automáticamente que no haya conflictos de horario.",
    attachTo: { element: "[data-tour='programming-section']", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "cita-details",
    title: "Detalles de la Cita",
    text: "Selecciona el tipo de cita (consulta, seguimiento, etc.) y especifica el motivo. Esto es importante para el historial médico.",
    attachTo: { element: "[data-tour='cita-details']", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "price-payment",
    title: "Precio y Método de Pago",
    text: "Ingresa el precio de la consulta y selecciona el método de pago. Esto es opcional si la cita es sin costo.",
    attachTo: { element: "[data-tour='price-section']", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "advanced-mode",
    title: "Modo Avanzado",
    text: "Activa el 'Modo Avanzado' para acceder a opciones adicionales como ubicación de clínica, género preferido del paciente, y más campos especializados.",
    attachTo: { element: "[data-tour='advanced-toggle']", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "submit",
    title: "Crear la Cita",
    text: "Cuando hayas completado los datos requeridos, haz clic en 'Crear Cita'. Se abrirá un modal de confirmación antes de guardar.",
    attachTo: { element: "[data-tour='submit-button']", on: "top" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Finalizar",
        action: "complete",
      },
    ],
  },
];

export const citasCalendarTourSteps = [
  {
    id: "calendar-welcome",
    title: "Bienvenida al Calendario de Citas",
    text: "Aquí puedes ver todas las citas programadas en un calendario visual. Haz clic en cualquier cita para ver sus detalles.",
    attachTo: { element: ".calendar-container", on: "bottom" as const },
    buttons: [
      {
        text: "Saltar",
        action: "cancel",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "calendar-interaction",
    title: "Interactúa con el Calendario",
    text: "Puedes hacer clic en una fecha para crear una nueva cita rápidamente, o seleccionar una cita existente para editarla.",
    attachTo: { element: ".calendar-container", on: "bottom" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Siguiente",
        action: "next",
      },
    ],
  },
  {
    id: "chatbot-button",
    title: "Asistente de Chat",
    text: "Haz clic en el botón de chat para obtener ayuda rápida. Nuestro asistente puede resolver dudas sobre horarios, pacientes y más.",
    attachTo: { element: "[data-tour='chatbot-button']", on: "left" as const },
    buttons: [
      {
        text: "Anterior",
        action: "back",
      },
      {
        text: "Finalizar",
        action: "complete",
      },
    ],
  },
];
