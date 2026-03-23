'use client';

/**
 * Schedule management page.
 * Displays the doctor's agenda with appointments, available slots,
 * and integration with Google Calendar.
 */
export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-gray-600 mt-1">
          Gestión de citas y horarios disponibles
        </p>
      </div>

      {/* TODO: Integrate appointment calendar component */}
      {/* TODO: Use useGoogleCalendar hook for Google Calendar sync */}
      {/* TODO: Use appointments service for CRUD operations */}

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-400">
        <p>Calendario de citas</p>
        <p className="text-sm mt-2">
          Componente de agenda pendiente de migración
        </p>
      </div>
    </div>
  );
}
