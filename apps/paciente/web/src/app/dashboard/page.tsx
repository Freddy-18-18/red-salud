export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bienvenido</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium text-gray-500">Próxima Cita</h3>
          <p className="mt-2 text-lg">Sin citas programadas</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium text-gray-500">Mensajes</h3>
          <p className="mt-2 text-lg">0 nuevos</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium text-gray-500">Recetas Activas</h3>
          <p className="mt-2 text-lg">0 recetas</p>
        </div>
      </div>
    </div>
  );
}
