/**
 * @file QuestionRenderer.tsx
 * @description Renderiza dinámicamente el tipo de pregunta correspondiente
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademyQuestion } from '@/lib/academy/types/lesson.types';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
    question: AcademyQuestion;
    selectedOptionId: string | null;
    onOptionSelect: (optionId: string) => void;
    disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
    question,
    selectedOptionId,
    onOptionSelect,
    disabled = false
}) => {
    // Animación para entrada de preguntas
    const variants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-6 py-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                >
                    {/* Enunciado de la pregunta */}
                    <h2 className="text-2xl font-bold text-white mb-8 text-center leading-tight">
                        {(question.question as any).text || "Pregunta sin texto"}
                    </h2>

                    {/* Opciones (Estilo Multiple Choice) */}
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {question.options?.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => !disabled && onOptionSelect(option.id)}
                                disabled={disabled}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200",
                                    "bg-slate-900/50 backdrop-blur-sm",
                                    selectedOptionId === option.id
                                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                                        : "border-white/5 hover:border-white/20 hover:bg-white/5",
                                    disabled && selectedOptionId !== option.id && "opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border",
                                        selectedOptionId === option.id
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white/5 text-white/40 border-white/10"
                                    )}>
                                        {/* Podríamos asignar letras A, B, C, D aquí */}
                                        {String.fromCharCode(65 + (question.options?.indexOf(option) || 0))}
                                    </div>
                                    <span className="text-lg font-medium text-white/90">
                                        {option.text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Pista (opcional) */}
                    {question.hint && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-200 text-sm italic text-center"
                        >
                            💡 Pista: {question.hint}
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
