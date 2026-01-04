/**
 * @file PricingHero.tsx
 * @description Hero section para la página de precios
 * Diseño minimalista inspirado en Supabase con toggle mensual/anual
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PricingHeroProps {
    /** Estado del toggle: true = anual, false = mensual */
    isAnnual: boolean;
    /** Callback para cambiar el estado del toggle */
    onToggle: (value: boolean) => void;
}

/**
 * Hero section minimalista para la página de precios
 * Incluye título, subtítulo y toggle de facturación
 */
export function PricingHero({ isAnnual, onToggle }: PricingHeroProps) {
    return (
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent" />
            </div>

            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Título principal */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
                        Precios simples y transparentes
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Gratis para pacientes. Herramientas profesionales para médicos.
                        <br className="hidden sm:block" />
                        Soluciones escalables para organizaciones.
                    </p>

                    {/* Toggle Mensual/Anual */}
                    <div className="inline-flex items-center gap-3 p-1 rounded-full bg-muted/50 border border-border">
                        <button
                            onClick={() => onToggle(false)}
                            className={cn(
                                "px-5 py-2 text-sm font-medium rounded-full transition-all duration-200",
                                !isAnnual
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => onToggle(true)}
                            className={cn(
                                "px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2",
                                isAnnual
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Anual
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full transition-colors",
                                isAnnual
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                -33%
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
