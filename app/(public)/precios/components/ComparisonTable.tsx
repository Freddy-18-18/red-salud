/**
 * @file ComparisonTable.tsx
 * @description Tabla comparativa de features por plan
 * Diseño inspirado en Supabase con headers sticky y categorías expandibles
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown } from "lucide-react";
import { comparisonCategories } from "../data/precios-data";
import { cn } from "@/lib/utils";

/**
 * Tabla comparativa de features organizados por categorías
 * Headers de planes sticky, categorías colapsables
 */
export function ComparisonTable() {
    // Estado para controlar qué categorías están expandidas
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(comparisonCategories.map(c => c.name))
    );

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryName)) {
                next.delete(categoryName);
            } else {
                next.add(categoryName);
            }
            return next;
        });
    };

    return (
        <section className="py-16 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Título de sección */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                        Compara los planes
                    </h2>
                    <p className="text-muted-foreground">
                        Encuentra el plan perfecto para tus necesidades
                    </p>
                </motion.div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        {/* Header con nombres de planes - Sticky */}
                        <thead className="sticky top-16 z-20 bg-background">
                            <tr className="border-b border-border">
                                <th className="text-left py-4 px-4 w-[280px]">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Características
                                    </span>
                                </th>
                                <th className="text-center py-4 px-4">
                                    <span className="text-sm font-semibold text-foreground">
                                        Paciente
                                    </span>
                                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                        Gratis
                                    </p>
                                </th>
                                <th className="text-center py-4 px-4 bg-muted/30 rounded-t-lg">
                                    <span className="text-sm font-semibold text-foreground">
                                        Médico Pro
                                    </span>
                                    <p className="text-xs text-primary font-normal mt-0.5">
                                        Más Popular
                                    </p>
                                </th>
                                <th className="text-center py-4 px-4">
                                    <span className="text-sm font-semibold text-foreground">
                                        Organizaciones
                                    </span>
                                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                        Personalizado
                                    </p>
                                </th>
                                <th className="text-center py-4 px-4">
                                    <span className="text-sm font-semibold text-foreground">
                                        Enterprise
                                    </span>
                                    <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                        Contactar
                                    </p>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {comparisonCategories.map((category) => (
                                <CategoryRows
                                    key={category.name}
                                    category={category}
                                    isExpanded={expandedCategories.has(category.name)}
                                    onToggle={() => toggleCategory(category.name)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// SUBCOMPONENTES
// =============================================================================

interface CategoryRowsProps {
    category: typeof comparisonCategories[0];
    isExpanded: boolean;
    onToggle: () => void;
}

/**
 * Filas de una categoría con header colapsable
 */
function CategoryRows({ category, isExpanded, onToggle }: CategoryRowsProps) {
    return (
        <>
            {/* Header de categoría - Clickeable */}
            <tr
                className="border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={onToggle}
            >
                <td colSpan={5} className="py-4 px-4">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-semibold text-foreground">
                            {category.name}
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    </div>
                </td>
            </tr>

            {/* Filas de features */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <>
                        {category.features.map((feature, idx) => (
                            <motion.tr
                                key={feature.name}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                className="border-b border-border/50"
                            >
                                <td className="py-3 px-4 pl-12">
                                    <span className="text-sm text-foreground/80">
                                        {feature.name}
                                    </span>
                                </td>
                                <FeatureCell value={feature.paciente} />
                                <FeatureCell value={feature.medico} highlight />
                                <FeatureCell value={feature.organizacion} />
                                <FeatureCell value={feature.enterprise} />
                            </motion.tr>
                        ))}
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

interface FeatureCellProps {
    /** Valor: true (incluido), false (no incluido), o string (texto específico) */
    value: boolean | string;
    /** Si es la columna destacada (Médico Pro) */
    highlight?: boolean;
}

/**
 * Celda de la tabla que muestra check, X, o texto
 */
function FeatureCell({ value, highlight }: FeatureCellProps) {
    return (
        <td className={cn("py-3 px-4 text-center", highlight && "bg-muted/20")}>
            {typeof value === "boolean" ? (
                value ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                )
            ) : (
                <span className="text-sm text-foreground/80">{value}</span>
            )}
        </td>
    );
}
