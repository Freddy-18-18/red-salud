import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* TODO: Add DashboardSidebar with specialty-aware menu groups */}
      {/* Use getSpecialtyMenuGroups() from @/lib/specialties to build navigation */}
      <aside className="w-64 border-r bg-gray-50 p-4">
        <nav className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">Consultorio</h2>
          <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">
            Inicio
          </a>
          <a href="/dashboard/agenda" className="block px-3 py-2 rounded hover:bg-gray-100">
            Agenda
          </a>
          <a href="/dashboard/pacientes" className="block px-3 py-2 rounded hover:bg-gray-100">
            Pacientes
          </a>
          <a href="/dashboard/consulta" className="block px-3 py-2 rounded hover:bg-gray-100">
            Consulta
          </a>
          <a href="/dashboard/recetas" className="block px-3 py-2 rounded hover:bg-gray-100">
            Recetas
          </a>
          <a href="/dashboard/estadisticas" className="block px-3 py-2 rounded hover:bg-gray-100">
            Estadísticas
          </a>
          <a href="/dashboard/verificacion" className="block px-3 py-2 rounded hover:bg-gray-100">
            Verificación SACS
          </a>
          <a href="/dashboard/configuracion" className="block px-3 py-2 rounded hover:bg-gray-100">
            Configuración
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
