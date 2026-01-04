/**
 * @file LessonNode.tsx
 * @description Nodo interactivo que representa una lección en el Skill Tree
 * 
 * @example
 * <LessonNode lesson={lessonData} accentColor="#0ea5e9" isActive={true} />
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Lock, Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonNodeProps } from './SkillTree.types';

/**
 * Componente LessonNode
 * Renderiza un botón circular animado que representa una lección.
 * Utiliza Framer Motion para el efecto de "floating" y hover.
 */
export const LessonNode: React.FC<LessonNodeProps> = ({
    lesson,
    accentColor,
    offset = 0,
    isActive = false
}) => {
    const isCompleted = lesson.status === 'completed' || lesson.status === 'mastered';
    const isLocked = lesson.isLocked;

    // Variantes de animación para el contenedor
    const containerVariants = {
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        whileHover: isLocked ? {} : { scale: 1.1 },
        whileTap: isLocked ? {} : { scale: 0.95 }
    };

    // Animación de pulso para la lección activa
    const pulseVariants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <div
            className="flex flex-col items-center relative py-4 w-full"
            style={{ transform: `translateX(${offset}px)` }}
        >
            {/* Efecto de pulso para la lección activa */}
            {isActive && !isLocked && (
                <motion.div
                    className="absolute w-20 h-20 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    variants={pulseVariants}
                    animate="animate"
                />
            )}

            {/* El Nodo de la Lección */}
            <Link
                href={isLocked ? '#' : `/academy/lesson/${lesson.id}`}
                onClick={(e) => isLocked && e.preventDefault()}
                className="relative group z-10"
            >
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="whileHover"
                    whileTap="whileTap"
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-b-4 transition-all",
                        isLocked
                            ? "bg-slate-800 border-slate-900 text-slate-500 cursor-not-allowed"
                            : isCompleted
                                ? "bg-amber-400 border-amber-600 text-amber-900 shadow-amber-900/20"
                                : "bg-primary border-primary-dark text-white shadow-primary/20",
                        isActive && !isLocked && "w-18 h-18 ring-4 ring-offset-4 ring-offset-background ring-primary"
                    )}
                    style={{
                        backgroundColor: !isLocked && !isCompleted ? accentColor : undefined,
                        borderColor: !isLocked && !isCompleted ? `${accentColor}99` : undefined // Color más oscuro para el borde inferior
                    }}
                >
                    {isLocked ? (
                        <Lock className="w-8 h-8" />
                    ) : isCompleted ? (
                        <Check className="w-10 h-10 stroke-[3]" />
                    ) : (
                        <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                </motion.div>

                {/* Etiqueta flotante del título - Aparece en hover */}
                {!isLocked && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-xl shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap z-20 border border-border">
                        <span className="text-sm font-bold">{lesson.title}</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
                    </div>
                )}
            </Link>

            {/* Estrellas obtenidas */}
            {isCompleted && (
                <div className="flex gap-0.5 mt-2 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {[1, 2, 3].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "w-3.5 h-3.5",
                                star <= (lesson.stars || 0) ? "fill-amber-400 text-amber-400" : "text-slate-600"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Título de la lección (visible si no está completada) */}
            {!isCompleted && (
                <span className={cn(
                    "mt-3 text-sm font-semibold tracking-tight text-center max-w-[120px]",
                    isLocked ? "text-slate-500" : "text-foreground"
                )}>
                    {lesson.title}
                </span>
            )}
        </div>
    );
};
