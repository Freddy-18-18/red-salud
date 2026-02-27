/**
 * @file UnitSection.tsx
 * @description Sección que agrupa lecciones por unidad en el Skill Tree
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen } from 'lucide-react';
import { cn } from "@red-salud/core/utils";
import { UnitSectionProps } from './SkillTree.types';
import { LessonNode } from './LessonNode';

/**
 * Componente UnitSection
 * Renderiza el encabezado de la unidad y el camino de lecciones.
 */
export const UnitSection: React.FC<UnitSectionProps> = ({
    unit,
    accentColor
}) => {
    // Patrón de zig-zag para los nodos de lecciones
    const getOffset = (index: number) => {
        const sequence = [0, 45, 75, 45, 0, -45, -75, -45];
        return sequence[index % sequence.length];
    };

    return (
        <div className="w-full flex flex-col items-center mb-16 relative">
            {/* Header de la Unidad */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                    "w-full max-w-md px-6 py-8 rounded-3xl mb-12 relative overflow-hidden",
                    "bg-gradient-to-br from-slate-900/90 to-slate-950 border border-white/10 shadow-2xl backdrop-blur-md"
                )}
            >
                {/* Decoración de fondo */}
                <div
                    className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-20"
                    style={{ backgroundColor: accentColor }}
                />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                            Unidad {unit.orderIndex}
                        </span>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                            {unit.isCheckpoint ? (
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                                <BookOpen className="w-3.5 h-3.5 text-white/60" />
                            )}
                            <span className="text-xs font-medium text-white/80">
                                {unit.estimatedMinutes} min
                            </span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {unit.name}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 italic">
                        &ldquo;{unit.description}&rdquo;
                    </p>

                    {/* Guía visual del camino si la unidad no está bloqueada */}
                    {!unit.isLocked && (
                        <button className="w-full py-3 bg-white text-slate-950 font-bold rounded-xl active:scale-95 transition-transform">
                            CONTINUAR
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Lista de Lecciones en camino */}
            <div className="flex flex-col items-center gap-8 w-full">
                {unit.lessons.map((lesson, index) => (
                    <React.Fragment key={lesson.id}>
                        <LessonNode
                            lesson={lesson}
                            accentColor={accentColor}
                            offset={getOffset(index)}
                            isActive={!unit.isLocked && lesson.status === 'in_progress'}
                        />
                        {/* Conector visual (opcional: podrías añadir un SVG curvo aquí en el futuro) */}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
