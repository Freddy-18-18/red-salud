/**
 * @file SkillTree.tsx
 * @description Componente principal de la ruta de aprendizaje de la Academia
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Info, BookOpen, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SkillTreeProps } from './SkillTree.types';
import { UnitSection } from './UnitSection';

/**
 * Componente SkillTree
 * Orquesta la visualización de niveles y unidades.
 */
export const SkillTree: React.FC<SkillTreeProps> = ({
    specialtyId,
    specialtyName,
    color,
    units,
    className
}) => {
    return (
        <div className={cn("min-h-screen bg-black text-white selection:bg-primary/30", className)}>
            {/* Header Sticky Persistente */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/academy" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold leading-none">{specialtyName}</h1>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-wider font-semibold">Mapa de Aprendizaje</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <Info className="w-5 h-5 text-white/60" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <Settings className="w-5 h-5 text-white/60" />
                    </button>
                </div>
            </header>

            {/* Contenedor del Mapa */}
            <main className="max-w-2xl mx-auto pt-10 pb-32 px-4 relative">
                {/* Decoraciones de fondo */}
                <div
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.08] pointer-events-none"
                    style={{ backgroundColor: color }}
                />

                {/* Renderizado de Secciones por Unidad */}
                <div className="relative z-10 flex flex-col items-center">
                    {units.length > 0 ? (
                        units.map((unit) => (
                            <UnitSection
                                key={unit.id}
                                unit={unit}
                                accentColor={color}
                            />
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-white/40 italic">Cargando material educativo...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Navigation Bar Inferior (Mockup para Dashboard) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4">
                <div className="max-w-md mx-auto flex items-center justify-around">
                    {/* Aquí irían iconos de Home, Ligas, Shop, Perfil */}
                    <div className="flex flex-col items-center gap-1 text-primary">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-white/40">
                        <div className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-white/40">
                        <div className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <Star className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};
