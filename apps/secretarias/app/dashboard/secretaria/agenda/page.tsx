export default function AgendaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 Agenda de Citas</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Cargando calendario de citas...</p>
        {/* Aquí irá el componente de calendario de la app medico */}
      </div>
    </div>
  );
}
