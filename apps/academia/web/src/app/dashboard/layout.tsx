'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, BookOpen, TrendingUp, Award, Trophy, User } from 'lucide-react';
import { cn } from '@red-salud/core/utils';

const sidebarNav = [
  { href: '/dashboard', label: 'Inicio', icon: GraduationCap },
  { href: '/dashboard/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/dashboard/progreso', label: 'Mi Progreso', icon: TrendingUp },
  { href: '/dashboard/certificaciones', label: 'Certificaciones', icon: Award },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <GraduationCap className="h-5 w-5 text-emerald-500" />
            Academy
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
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
