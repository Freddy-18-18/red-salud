export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-emerald-600">Red Salud</h1>
            <p className="text-sm text-gray-500">Secretaria</p>
          </div>
          <nav className="p-4 space-y-2">
            <a href="/dashboard/secretaria/agenda" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              📅 Agenda
            </a>
            <a href="/dashboard/secretaria/pacientes" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              👥 Pacientes
            </a>
            <a href="/dashboard/secretaria/mensajes" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              💬 Mensajes
            </a>
            <a href="/dashboard/secretaria/configuracion" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              ⚙️ Configuración
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
