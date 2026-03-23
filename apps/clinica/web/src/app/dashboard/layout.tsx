'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  MapPin,
  Users,
  Box,
  Package,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';

const sidebarNav = [
  { href: '/dashboard', label: 'Inicio', icon: Building2 },
  { href: '/dashboard/sedes', label: 'Sedes', icon: MapPin },
  { href: '/dashboard/personal', label: 'Personal', icon: Users },
  { href: '/dashboard/recursos', label: 'Recursos', icon: Box },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Package },
  { href: '/dashboard/metricas', label: 'Metricas', icon: BarChart3 },
  { href: '/dashboard/configuracion', label: 'Configuracion', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-gray-900">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Gestion Clinica
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
