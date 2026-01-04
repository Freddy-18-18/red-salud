"use client";

/**
 * @file ArchitectVariantC.tsx
 * @description Variante C: Minimalist Card
 * Diseño ultra-limpio y minimalista estilo Apple con mucho whitespace.
 * 
 * @example
 * <ArchitectVariantC />
 */

import { motion } from "framer-motion";
import { Target, Rocket, ArrowRight } from "lucide-react";

/** Información del fundador */
const FOUNDER = {
    name: "Freddy Ramírez",
    role: "Fundador & CEO",
    initials: "FR",
    quote: "En un país donde muchos ven limitaciones, yo veo la oportunidad perfecta para demostrar de qué somos capaces.",
    fullQuote: "Red-Salud es la prueba de que Venezuela puede crear tecnología de clase mundial.",
    attributes: [
        { icon: Target, label: "Enfoque Total" },
        { icon: Rocket, label: "Validación Constante" },
    ]
};

/**
 * Componente Minimalist Card
 * Ultra-limpio con whitespace generoso y micro-interacciones
 */
export function ArchitectVariantC() {
    return (
        <section className="py-32 md:py-40 relative bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

                {/* Card principal ultra-minimalista */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Línea decorativa superior */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                    <div className="pt-16 pb-12">
                        {/* Header horizontal con avatar y nombre */}
                        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 mb-16">

                            {/* Avatar minimalista */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative group shrink-0"
                            >
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-muted flex items-center justify-center text-3xl md:text-4xl font-light text-muted-foreground border border-border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg">
                                    {FOUNDER.initials}
                                </div>
                            </motion.div>

                            {/* Nombre y rol con tipografía light */}
                            <div className="flex-1">
                                <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                    {FOUNDER.role}
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-foreground">
                                    {FOUNDER.name}
                                </h2>
                            </div>

                            {/* Atributos en píldoras sutiles */}
                            <div className="flex flex-wrap gap-3">
                                {FOUNDER.attributes.map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 text-muted-foreground text-sm hover:border-primary/30 hover:text-foreground transition-colors cursor-default"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quote con tipografía muy light */}
                        <div className="max-w-4xl">
                            <p className="text-2xl md:text-3xl lg:text-4xl font-extralight text-foreground/80 leading-relaxed mb-6">
                                &ldquo;{FOUNDER.quote}&rdquo;
                            </p>
                            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                                {FOUNDER.fullQuote}
                            </p>
                        </div>

                        {/* Link sutil */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 pt-8 border-t border-border/50"
                        >
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <span className="text-sm">Conoce más sobre el proyecto</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </motion.div>
                    </div>

                    {/* Línea decorativa inferior */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
