/**
 * @file SpecialtyFAQ.tsx
 * @description Sección de preguntas frecuentes para páginas de especialidades.
 * Usa un acordeón animado para mostrar las FAQs de forma interactiva.
 *
 * @example
 * <SpecialtyFAQ faqs={[{q: 'Pregunta', a: 'Respuesta'}]} />
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
    /** La pregunta */
    q: string;
    /** La respuesta */
    a: string;
}

interface SpecialtyFAQProps {
    /** Lista de preguntas frecuentes */
    faqs: FAQ[];
    /** Nombre de la especialidad para el título */
    specialtyName?: string;
}

/**
 * Componente de preguntas frecuentes con acordeón animado.
 * Muestra las FAQs de una especialidad médica.
 */
export function SpecialtyFAQ({ faqs, specialtyName }: SpecialtyFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-4">
                        <HelpCircle className="w-4 h-4" />
                        Preguntas Frecuentes
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Lo que más preguntan sobre{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            {specialtyName}
                        </span>
                    </h2>
                </div>

                {/* Acordeón */}
                <div className="max-w-3xl mx-auto space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={cn(
                                "rounded-2xl border transition-all duration-300 overflow-hidden",
                                openIndex === index
                                    ? "bg-white dark:bg-slate-900 border-primary/30 shadow-lg shadow-primary/5"
                                    : "bg-white/50 dark:bg-slate-900/50 border-border/50 hover:border-primary/20"
                            )}
                        >
                            {/* Pregunta (clickeable) */}
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left"
                                aria-expanded={openIndex === index}
                            >
                                <span
                                    className={cn(
                                        "font-semibold transition-colors pr-4",
                                        openIndex === index
                                            ? "text-primary"
                                            : "text-foreground"
                                    )}
                                >
                                    {faq.q}
                                </span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                        openIndex === index
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.div>
                            </button>

                            {/* Respuesta (animada) */}
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-5 pb-5 pt-0 border-t border-border/30">
                                            <p className="text-muted-foreground leading-relaxed pt-4">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default SpecialtyFAQ;
