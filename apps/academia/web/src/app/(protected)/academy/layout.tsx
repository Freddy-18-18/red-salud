/**
 * @file layout.tsx
 * @description Layout dedicado para la sección académica de Red Salud.
 */

import React from 'react';
import { AcademyHeader } from '@/components/academy/navigation/AcademyHeader';
import { AcademySidebar } from '@/components/academy/navigation/AcademySidebar';

/**
 * Layout de la Academia (Protegido)
 * Este layout se aplica a todas las rutas protegidas bajo /academy
 */
export default function AcademyProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="academy-theme flex h-screen bg-slate-950 overflow-hidden font-sans">
            {/* Sidebar persistente para navegación académica */}
            <AcademySidebar className="hidden md:flex w-72" />

            <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
                {/* Header con estadísticas profesionales */}
                <AcademyHeader className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl z-10" />

                {/* Área de Contenido Principal */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
