"use client";

/**
 * @file CapacidadesVariantD.tsx
 * @description Variante D: Statement Minimalista
 * Diseño ultra-limpio con texto grande y lista sutil.
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FACTS = [
    "Infraestructura lista para escala nacional",
    "50+ especialidades médicas desde el día uno",
    "Seguridad de datos de clase mundial",
    "5 meses de ingeniería sin atajos",
];

export function CapacidadesVariantD() {
    return (
        <section className="py-32 md:py-40 relative bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    {/* Badge */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Transparencia Radical
                        </div>
                    </div>

                    {/* Statement */}
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-center tracking-tight mb-8 leading-tight">
                        No te vamos a mentir
                        <span className="block font-bold mt-2">con cifras infladas.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-muted-foreground text-center font-light leading-relaxed mb-16 max-w-2xl mx-auto">
                        Estamos en etapa de validación. Lo que ves hoy es el resultado de 5 meses de ingeniería pura.
                    </p>

                    {/* Facts List */}
                    <div className="space-y-4 max-w-xl mx-auto">
                        {FACTS.map((fact, i) => (
                            <motion.div
                                key={fact}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                <span className="text-foreground font-medium">{fact}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="mt-16 text-center"
                    >
                        <a href="#contacto" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                            <span>Conoce más sobre nuestro proceso</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
