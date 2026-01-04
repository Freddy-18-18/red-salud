/**
 * @file FeaturesSection.tsx
 * @description Sección principal de Características con diseño minimalista premium.
 * Grid responsive de cards con animaciones de entrada y hover expandible.
 * @module FeaturesSection
 * 
 * @example
 * <FeaturesSection />
 */

"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { features } from "./features-section.data";
import { FeatureCard } from "./FeatureCard";
import type { FeaturesSectionProps } from "./features-section.types";

/**
 * Sección de características del ecosistema Red-Salud.
 * Presenta 6 características clave en un grid responsive con animaciones premium.
 * 
 * @param id - ID personalizado para la sección
 * @param className - Clases adicionales
 * @returns Sección con header animado y grid de FeatureCards
 */
export function FeaturesSection({ id, className }: FeaturesSectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "py-24 lg:py-32 bg-background relative overflow-hidden",
                className
            )}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(to right, hsl(var(--primary)/0.3) 1px, transparent 1px), 
                              linear-gradient(to bottom, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />

                {/* Radial gradient glow */}
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold mb-6 border border-primary/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        Características
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
                    >
                        Todo lo que necesitas para{" "}
                        <span className="bg-gradient-to-r from-primary via-blue-500 to-teal-400 bg-clip-text text-transparent">
                            cuidar tu salud
                        </span>
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
                    >
                        Una plataforma completa diseñada para facilitar el acceso a servicios
                        de salud de calidad, seguridad y profesionalismo.
                    </motion.p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.id}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* Bottom CTA Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-center mt-16 lg:mt-20"
                >
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Pasa el cursor</span>{" "}
                        sobre cada característica para conocer más detalles
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
