/**
 * @file SpecialtyTreatments.tsx
 * @description Sección de tratamientos disponibles para páginas de especialidades.
 * Muestra una lista visual de procedimientos y tratamientos que ofrece el especialista.
 *
 * @example
 * <SpecialtyTreatments treatments={['Endoscopia', 'Colonoscopia']} specialtyName="Gastroenterología" />
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialtyTreatmentsProps {
    /** Lista de tratamientos disponibles */
    treatments: string[];
    /** Nombre de la especialidad */
    specialtyName?: string;
}

/**
 * Sección que muestra los tratamientos y procedimientos disponibles.
 * Diseño con cards visuales y animaciones de entrada.
 */
export function SpecialtyTreatments({
    treatments,
    specialtyName,
}: SpecialtyTreatmentsProps) {
    if (!treatments || treatments.length === 0) return null;

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold mb-4">
                        <Stethoscope className="w-4 h-4" />
                        Tratamientos
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Procedimientos y tratamientos disponibles
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                        Servicios que ofrecen los especialistas en {specialtyName} de
                        nuestra red
                    </p>
                </div>

                {/* Grid de tratamientos */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {treatments.map((treatment, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "group relative p-4 rounded-xl",
                                    "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800",
                                    "border border-border/50 hover:border-teal-300 dark:hover:border-teal-700",
                                    "hover:shadow-lg hover:shadow-teal-500/10",
                                    "transition-all duration-300 hover:-translate-y-1"
                                )}
                            >
                                {/* Indicador visual */}
                                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-teal-500 group-hover:scale-150 transition-transform" />

                                {/* Contenido */}
                                <p className="text-foreground font-medium pl-4 pr-2 text-sm">
                                    {treatment}
                                </p>

                                {/* Flecha hover */}
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-4 h-4 text-teal-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Los tratamientos disponibles pueden variar según el profesional y
                            centro médico. Consulta directamente para confirmar
                            disponibilidad.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SpecialtyTreatments;
