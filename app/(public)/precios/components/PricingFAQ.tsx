/**
 * @file PricingFAQ.tsx
 * @description Sección de preguntas frecuentes
 * Diseño minimalista con acordeones limpios, sin tarjetas de contacto
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { faqs } from "../data/precios-data";
import { cn } from "@/lib/utils";

interface PricingFAQProps {
    /** Índice del FAQ abierto, null si ninguno está abierto */
    openFAQ: number | null;
    /** Callback para cambiar el FAQ abierto */
    onToggle: (index: number | null) => void;
}

/**
 * Sección de preguntas frecuentes con acordeones
 */
export function PricingFAQ({ openFAQ, onToggle }: PricingFAQProps) {
    return (
        <section className="py-20 px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Título */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                        Preguntas frecuentes
                    </h2>
                    <p className="text-muted-foreground">
                        Resolvemos tus dudas sobre nuestros planes
                    </p>
                </motion.div>

                {/* Lista de preguntas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="divide-y divide-border"
                >
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.q}
                            answer={faq.a}
                            isOpen={openFAQ === index}
                            onToggle={() => onToggle(openFAQ === index ? null : index)}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// =============================================================================
// SUBCOMPONENTES
// =============================================================================

interface FAQItemProps {
    /** La pregunta */
    question: string;
    /** La respuesta */
    answer: string;
    /** Si está abierto */
    isOpen: boolean;
    /** Callback para toggle */
    onToggle: () => void;
}

/**
 * Item individual de FAQ con animación de acordeón
 */
function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="py-5">
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between gap-4 text-left group"
            >
                <span
                    className={cn(
                        "font-medium transition-colors",
                        isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                    )}
                >
                    {question}
                </span>

                <span
                    className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors mt-0.5",
                        isOpen
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}
                >
                    {isOpen ? (
                        <Minus className="w-3 h-3" />
                    ) : (
                        <Plus className="w-3 h-3" />
                    )}
                </span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-3 pr-10 text-muted-foreground leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
