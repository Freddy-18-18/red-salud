/**
 * @file LessonFooter.tsx
 * @description Pie de página interactivo para comprobación de respuestas
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonFooterProps {
    status: 'idle' | 'checking' | 'correct' | 'wrong';
    onCheck: () => void;
    onContinue: () => void;
    canCheck: boolean;
    explanation?: string;
}

export const LessonFooter: React.FC<LessonFooterProps> = ({
    status,
    onCheck,
    onContinue,
    canCheck,
    explanation
}) => {
    const isFeedback = status === 'correct' || status === 'wrong';

    return (
        <footer className={cn(
            "fixed bottom-0 left-0 right-0 py-6 px-6 transition-colors duration-300 z-50",
            status === 'correct' ? "bg-green-600/20 border-t border-green-500/30" :
                status === 'wrong' ? "bg-rose-600/20 border-t border-rose-500/30" :
                    "bg-black border-t border-white/5"
        )}>
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                <AnimatePresence>
                    {isFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-4"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                                status === 'correct' ? "bg-green-500" : "bg-rose-500"
                            )}>
                                {status === 'correct' ? (
                                    <Check className="w-8 h-8 text-white stroke-[3]" />
                                ) : (
                                    <X className="w-8 h-8 text-white stroke-[3]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={cn(
                                    "text-xl font-black italic uppercase tracking-wider mb-1",
                                    status === 'correct' ? "text-green-400" : "text-rose-400"
                                )}>
                                    {status === 'correct' ? "¡Excelente!" : "¡Sigue intentando!"}
                                </h4>
                                {explanation && (
                                    <p className="text-white/80 text-sm font-medium line-clamp-2">
                                        {explanation}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-end items-center">
                    {!isFeedback ? (
                        <button
                            onClick={onCheck}
                            disabled={!canCheck || status === 'checking'}
                            className={cn(
                                "w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95",
                                canCheck
                                    ? "bg-primary text-white shadow-[0_8px_0_#0284c7] hover:translate-y-[-2px] hover:shadow-[0_10px_0_#0284c7]"
                                    : "bg-white/10 text-white/20 border-white/5 cursor-not-allowed"
                            )}
                        >
                            COMPROBAR
                        </button>
                    ) : (
                        <button
                            onClick={onContinue}
                            className={cn(
                                "w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95",
                                "flex items-center justify-center gap-2",
                                status === 'correct'
                                    ? "bg-green-500 text-white shadow-[0_8px_0_#166534]"
                                    : "bg-rose-500 text-white shadow-[0_8px_0_#9f1239]"
                            )}
                        >
                            CONTINUAR <ArrowRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
};
