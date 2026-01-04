/**
 * @file SpecialtyPreparation.tsx
 * @description Sección "Cómo prepararte" para páginas de especialidades.
 * Muestra una lista visual de pasos de preparación antes de la consulta.
 *
 * @example
 * <SpecialtyPreparation preparation={['Ayuna 8 horas', 'Trae tu carné']} />
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialtyPreparationProps {
    /** Lista de pasos de preparación */
    preparation: string[];
    /** Nombre de la especialidad */
    specialtyName?: string;
}

/**
 * Sección que muestra cómo prepararse para una consulta médica.
 * Incluye una lista animada de pasos a seguir.
 */
export function SpecialtyPreparation({
    preparation,
    specialtyName,
}: SpecialtyPreparationProps) {
    if (!preparation || preparation.length === 0) return null;

    return (
        <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
                            <ClipboardList className="w-4 h-4" />
                            Preparación
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            Cómo prepararte para tu consulta
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                            Sigue estos pasos para aprovechar al máximo tu cita con el
                            especialista en {specialtyName}
                        </p>
                    </div>

                    {/* Lista de preparación */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {preparation.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "flex items-start gap-4 p-5 rounded-xl",
                                    "bg-white dark:bg-slate-900",
                                    "border border-border/50 hover:border-purple-300 dark:hover:border-purple-700",
                                    "hover:shadow-md transition-all duration-300"
                                )}
                            >
                                {/* Número del paso */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                                    {index + 1}
                                </div>

                                {/* Contenido */}
                                <div className="flex-1">
                                    <p className="text-foreground font-medium">{item}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Nota adicional */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8 p-5 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                <strong>Consejo:</strong> Si tienes dudas adicionales sobre la
                                preparación, no dudes en contactar al consultorio antes de tu
                                cita para recibir instrucciones específicas.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default SpecialtyPreparation;
