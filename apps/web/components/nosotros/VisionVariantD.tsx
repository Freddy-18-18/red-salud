"use client";

/**
 * @file VisionVariantD.tsx
 * @description Variante D: Manifiesto Minimalista
 * Texto grande y centrado con diseño ultra-limpio.
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Pilares de la visión */
const PILLARS = ["Confianza", "Dignidad", "Simplicidad"];

export function VisionVariantD() {
    return (
        <section className="py-32 md:py-40 relative overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    {/* Statement principal */}
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-extralight text-white leading-tight tracking-tight mb-12">
                        No estamos construyendo
                        <span className="block font-bold mt-2">para hoy.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
                        Estamos sentando las bases del estándar de salud de los próximos cinco años. Una visión audaz para una Venezuela que merece más.
                    </p>

                    {/* Pilares */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-6 mb-16"
                    >
                        {PILLARS.map((pillar, i) => (
                            <motion.span
                                key={pillar}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="px-6 py-3 rounded-full border border-white/20 text-white/80 font-medium hover:bg-white/5 transition-colors"
                            >
                                {pillar}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Año target */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
                            <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                                2030
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30" />
                        </div>
                        <p className="mt-4 text-slate-500 text-sm uppercase tracking-widest">
                            El año que definirá todo
                        </p>
                    </motion.div>

                    {/* CTA sutil */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="mt-16"
                    >
                        <a href="#contacto" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                            <span>Sé parte del cambio</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
