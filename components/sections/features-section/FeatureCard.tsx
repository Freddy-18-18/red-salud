/**
 * @file FeatureCard.tsx
 * @description Card individual de característica con estado normal y expandido en hover.
 * Implementa diseño minimalista con micro-interacciones premium.
 * @module FeaturesSection
 * 
 * @example
 * <FeatureCard feature={features[0]} index={0} />
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureCardProps } from "./features-section.types";

/**
 * Card de característica con animación de expansión al hover.
 * 
 * @param feature - Datos de la característica a mostrar
 * @param index - Índice para animación escalonada
 * @returns Card minimalista que se expande mostrando más detalles en hover
 */
export function FeatureCard({ feature, index }: FeatureCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative group cursor-pointer",
                "rounded-3xl overflow-hidden",
                "bg-card/60 dark:bg-card/40 backdrop-blur-xl",
                "border border-border/50 dark:border-white/10",
                "shadow-lg shadow-black/5 dark:shadow-black/20",
                "transition-all duration-500 ease-out",
                "hover:shadow-2xl hover:shadow-primary/10",
                "hover:border-primary/30"
            )}
        >
            {/* Glow Effect Background */}
            <motion.div
                className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
                    feature.glowColor
                )}
                animate={{ opacity: isHovered ? 0.6 : 0 }}
            />

            {/* Gradient Overlay on Hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Card Content */}
            <div className="relative z-10 p-6 md:p-8">
                {/* Header: Icon + Title + Badge */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Icon Container */}
                    <motion.div
                        className={cn(
                            "relative flex-shrink-0 w-14 h-14 rounded-2xl",
                            "flex items-center justify-center",
                            "bg-gradient-to-br shadow-lg",
                            feature.gradient
                        )}
                        animate={{
                            scale: isHovered ? 1.05 : 1,
                            rotate: isHovered ? 5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-foreground leading-tight">
                                {feature.title}
                            </h3>
                            {feature.badge && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {feature.badge}
                                </span>
                            )}
                        </div>

                        {/* Short Description (always visible) */}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {feature.description}
                        </p>
                    </div>
                </div>

                {/* Expandable Content on Hover */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                        >
                            {/* Extended Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 pt-2 border-t border-border/50">
                                {feature.extendedDescription}
                            </p>

                            {/* Benefits List */}
                            <div className="space-y-2">
                                {feature.benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2
                                            className={cn(
                                                "w-4 h-4 flex-shrink-0",
                                                `text-${feature.gradient.split("-")[1]}-500`
                                            )}
                                        />
                                        <span className="text-xs font-medium text-foreground/80">
                                            {benefit}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Gradient Line on Hover */}
            <motion.div
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                    feature.gradient
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
            />
        </motion.div>
    );
}
