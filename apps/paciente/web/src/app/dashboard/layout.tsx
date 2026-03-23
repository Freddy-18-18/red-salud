import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <nav className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">Mi Salud</h2>
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Inicio</a>
          <a href="/dashboard/buscar-medico" className="block px-3 py-2 rounded hover:bg-gray-100">Buscar Médico</a>
          <a href="/dashboard/citas" className="block px-3 py-2 rounded hover:bg-gray-100">Mis Citas</a>
          <a href="/dashboard/historial" className="block px-3 py-2 rounded hover:bg-gray-100">Historial Médico</a>
          <a href="/dashboard/mensajes" className="block px-3 py-2 rounded hover:bg-gray-100">Mensajes</a>
          <a href="/dashboard/perfil" className="block px-3 py-2 rounded hover:bg-gray-100">Mi Perfil</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
