/**
 * @file AcademyHeader.tsx
 * @description Header especializado para la academia con estadísticas profesionales (Créditos CME, Constancia).
 */

'use client';

import React from 'react';
import { Activity, Award, Bell, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AcademyHeaderProps {
    className?: string;
}

export const AcademyHeader: React.FC<AcademyHeaderProps> = ({ className }) => {
    return (
        <header className={cn("flex items-center justify-between px-6 py-4 gap-6", className)}>

            {/* Search (opcional) */}
            <div className="hidden md:flex items-center relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar lecciones, guías o recursos..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors Placeholder:text-slate-600"
                />
            </div>

            <div className="flex-1 md:flex-none flex items-center justify-end gap-6">

                {/* Métricas Profesionales */}
                <div className="flex items-center gap-4 mr-2">
                    {/* Constancia (Streak) */}
                    <div className="flex items-center gap-2 group cursor-help" title="Días de estudio consecutivos">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-200">12</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase leading-none">Días</span>
                        </div>
                    </div>

                    {/* Créditos / Puntos */}
                    <div className="flex items-center gap-2 group cursor-help" title="Créditos CME acumulados">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Award className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-200">240</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase leading-none">CME</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-800 hidden md:block" />

                {/* Nivel / Experiencia */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-300">Nivel Especialista</span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[65%]" />
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-inner">
                        <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-slate-950" />
                </Button>
            </div>
        </header>
    );
};
