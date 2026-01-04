/**
 * @file RelatedSpecialties.tsx
 * @description Sección de especialidades relacionadas para navegación cruzada.
 * Muestra links a otras especialidades que pueden ser de interés.
 *
 * @example
 * <RelatedSpecialties relatedSlugs={['neurologia', 'medicina-interna']} />
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { MASTER_SPECIALTIES } from "./master-list";

interface RelatedSpecialtiesProps {
    /** Slugs de las especialidades relacionadas */
    relatedSlugs: string[];
    /** Nombre de la especialidad actual (para excluirla) */
    currentSpecialty?: string;
}

/**
 * Componente que muestra especialidades relacionadas para navegación.
 * Facilita el descubrimiento de otras áreas médicas relevantes.
 */
export function RelatedSpecialties({
    relatedSlugs,
    currentSpecialty,
}: RelatedSpecialtiesProps) {
    if (!relatedSlugs || relatedSlugs.length === 0) return null;

    // Buscar los nombres de las especialidades relacionadas
    const relatedItems = relatedSlugs
        .map((slug) => {
            const found = MASTER_SPECIALTIES.find(
                (s) => slugify(s.name) === slug || s.id === slug
            );
            return found ? { ...found, slug: slugify(found.name) } : null;
        })
        .filter(Boolean) as { id: string; name: string; slug: string }[];

    if (relatedItems.length === 0) return null;

    return (
        <section className="py-12 bg-muted/20 border-t border-border/50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">
                                Especialidades Relacionadas
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Otras áreas médicas que podrían interesarte
                            </p>
                        </div>
                    </div>

                    {/* Grid de especialidades relacionadas */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {relatedItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/especialidades/${item.slug}`}
                                    className={cn(
                                        "group flex items-center justify-between p-4 rounded-xl",
                                        "bg-white dark:bg-slate-900",
                                        "border border-border/50 hover:border-primary/40",
                                        "hover:shadow-md transition-all duration-300"
                                    )}
                                >
                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                        {item.name}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RelatedSpecialties;
