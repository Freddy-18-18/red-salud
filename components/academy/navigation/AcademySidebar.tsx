/**
 * @file AcademySidebar.tsx
 * @description Sidebar especializado para la navegación interna de la academia (Profesional).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    Users,
    Settings,
    LogOut,
    Library,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AcademySidebarProps {
    className?: string;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/academy/dashboard' },
    { icon: BookOpen, label: 'Mis Cursos', href: '/academy/mis-cursos' },
    { icon: Library, label: 'Catálogo', href: '/academy/cursos' },
    { icon: Award, label: 'Certificaciones', href: '/academy/mis-certificaciones' },
    { icon: Users, label: 'Comunidad', href: '/academy/comunidad' },
];

export const AcademySidebar: React.FC<AcademySidebarProps> = ({ className }) => {
    const pathname = usePathname();

    const isInternalLink = (href: string) => pathname.startsWith(href) && href !== '/academy/cursos';

    return (
        <aside className={cn("bg-slate-950 border-r border-slate-800 flex flex-col h-full", className)}>
            {/* Brand / Logo Area */}
            <div className="p-6">
                <Link href="/academy/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight leading-none">
                            Academy
                        </span>
                        <span className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">
                            By Red-Salud
                        </span>
                    </div>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-4 space-y-1 py-4">
                <div className="px-4 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Menu
                    </span>
                </div>
                {navItems.map((item) => {
                    const isActive = isInternalLink(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group duration-200",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-105",
                                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white"
                            )} />
                            <span className="font-medium tracking-tight text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Area */}
            <div className="p-4 border-t border-slate-800 space-y-1">
                <Link
                    href="/academy/configuracion"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all group"
                >
                    <Settings className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    <span className="font-medium text-sm">Configuración</span>
                </Link>
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-medium text-sm group"
                >
                    <LogOut className="w-5 h-5 text-rose-500/80 group-hover:text-rose-400" />
                    Cerrar Sesión
                </button>
            </div>

            {/* User Mini Profile */}
            <div className="p-4 bg-slate-900/50 mx-4 mb-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                    RS
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">Dr. Usuario</p>
                    <p className="text-xs text-slate-500 truncate">Medicina General</p>
                </div>
            </div>
        </aside>
    );
};
