"use client";

/**
 * @file ImpactSection.tsx
 * @description Sección de Impacto rediseñada con Timeline robusto y responsive.
 * 
 * Características:
 * - Diseño responsive: Vertical en móvil, Zigzag en desktop
 * - Animaciones estables con Framer Motion (variants)
 * - Línea de conexión animada
 * - Datos dinámicos de cobertura
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { Counter } from "@/components/ui/counter";
import { useImpactData } from "./useImpactData";
import { IMPACT_SECTION_CONTENT } from "./impact-section.data";
import { StatItem } from "./impact-section.types";

/**
 * Componente de tarjeta individual del timeline
 */
function TimelineCard({
    stat,
    index,
    isLeft
}: {
    stat: StatItem;
    index: number;
    isLeft: boolean;
}) {
    // Parsear valores para efectos visuales
    const isPercentage = stat.value.toString().includes("%");
    const isRatio = stat.value.toString().includes("/") && !stat.value.toString().includes("24/7");
    const isNumeric = !isNaN(Number(stat.value));
    const numericValue = isPercentage
        ? parseInt(stat.value.replace("%", ""))
        : isNumeric
            ? parseInt(stat.value)
            : null;
    const ratioParts = isRatio ? stat.value.toString().split("/") : null;

    const Icon = stat.icon;

    return (
        <div className={`relative flex items-center lg:w-1/2 ${isLeft ? 'lg:pr-12 lg:ml-auto lg:flex-row-reverse' : 'lg:pl-12 lg:mr-auto'}`}>

            {/* Contenedor del contenido */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative w-full p-6 sm:p-8 rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden ${stat.cardBgColor ?? 'bg-white dark:bg-slate-900'} ${stat.cardBorderColor ?? 'border-border/50'}`}
            >
                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Icono con background */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`flex-shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                    >
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                        {/* Valor principal */}
                        <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                            {numericValue !== null && !isRatio ? (
                                <div className="flex items-baseline gap-1">
                                    <Counter value={numericValue} />
                                    {isPercentage && <span className="text-2xl sm:text-3xl">%</span>}
                                </div>
                            ) : isRatio && ratioParts ? (
                                <div className="flex items-baseline gap-1">
                                    <Counter value={parseInt(ratioParts[0])} />
                                    <span className="text-2xl sm:text-3xl text-muted-foreground/60">
                                        /{ratioParts[1]}
                                    </span>
                                </div>
                            ) : (
                                stat.value
                            )}
                        </div>

                        {/* Etiqueta */}
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                            {stat.label}
                        </h3>

                        {/* Descripción */}
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {stat.description}
                        </p>
                    </div>
                </div>

                {/* Línea decorativa inferior */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} w-0 group-hover:w-full transition-all duration-700 ease-out`} />
            </motion.div>

            {/* Punto de conexión (Desktop y Mobile) */}
            {/* En Desktop: Absoluto al centro */}
            {/* En Mobile: Absoluto a la izquierda */}
            <div className={`
                absolute top-1/2 -translate-y-1/2
                w-4 h-4 rounded-full bg-background border-4 border-primary shadow-[0_0_0_4px_rgba(59,130,246,0.1)]
                z-20
                
                // Posicionamiento Mobile (Línea a la izquierda)
                -left-6
                
                // Posicionamiento Desktop (Línea central)
                lg:left-auto lg:right-auto
                ${isLeft
                    ? 'lg:-left-[calc(3rem+2px)]' // Ajuste fino para centrar en el gap de 12 (3rem)
                    : 'lg:-right-[calc(3rem+2px)]'
                }
            `}>
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-2 h-2 rounded-full bg-primary
                `} />
            </div>

            {/* Línea horizontal conectora (Solo Desktop) */}
            <div className={`
                hidden lg:block absolute top-1/2 -translate-y-1/2 h-0.5 bg-border/40 z-0
                ${isLeft ? '-left-12 w-12' : '-right-12 w-12'}
            `} />
        </div>
    );
}

export function ImpactSectionTimeline() {
    const { stats } = useImpactData();
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 20%", "end 80%"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section
            ref={containerRef}
            className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
        >
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {IMPACT_SECTION_CONTENT.badge}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
                    >
                        <span className="block text-foreground">{IMPACT_SECTION_CONTENT.title.line1}</span>
                        <span className="block bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent">
                            {IMPACT_SECTION_CONTENT.title.highlight}
                        </span>
                        <span className="block text-foreground">{IMPACT_SECTION_CONTENT.title.line2}</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
                    >
                        {IMPACT_SECTION_CONTENT.subtitle}
                    </motion.p>
                </div>

                {/* Timeline Container */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Línea Central (Desktop) / Línea Lateral (Mobile) */}
                    <div className="absolute top-0 bottom-0 
                        left-[23px] lg:left-1/2 
                        w-1 bg-border/30 
                        -translate-x-1/2
                        rounded-full"
                    >
                        {/* Línea de progreso animada */}
                        <motion.div
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-blue-500 to-primary rounded-full origin-top shadow-[0_0_12px_2px_rgba(59,130,246,0.5)]"
                            style={{ scaleY, height: "100%" }}
                        />
                    </div>

                    {/* Items */}
                    <div className="space-y-12 lg:space-y-0 relative pl-12 lg:pl-0">
                        {stats.map((stat, index) => (
                            <div key={stat.label} className="lg:min-h-[200px] flex flex-col justify-center">
                                <TimelineCard
                                    stat={stat}
                                    index={index}
                                    isLeft={index % 2 !== 0} // Alternar lados en desktop: Primer item (0) a la derecha (isLeft=false porque 0%2===0 y queremos derecha primero? No, TimelineCard logic: isLeft ? reverse : normal. Si 0%2!=0 es false, entonces 0 es derecha.
                                // 0 % 2 = 0 -> False -> Derecha (lg:mr-auto) -> Espera, queremos Zigzag.
                                // TimelineCard logic:
                                // className={`... ${isLeft ? 'lg:pr-12 lg:ml-auto lg:flex-row-reverse' : 'lg:pl-12 lg:mr-auto'}`}
                                // Si isLeft es true -> ml-auto (DERECHA del contenedor, o sea lado derecho de la pantalla)
                                // Si isLeft es false -> mr-auto (IZQUIERDA del contenedor, o sea lado izquierdo de la pantalla)
                                // Queremos:
                                // Index 0: Izquierda -> isLeft = false
                                // Index 1: Derecha -> isLeft = true
                                // Index 2: Izquierda -> isLeft = false
                                // Por tanto:
                                // index % 2 !== 0 
                                // 0 % 2 = 0 -> false (Izquierda) // Correct
                                // 1 % 2 = 1 -> true (Derecha) // Correct
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visión Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-24 lg:mt-32 max-w-4xl mx-auto"
                >
                    <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-primary text-primary-foreground text-center">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:24px_24px] opacity-10" />

                        <div className="relative z-10">
                            <div className="text-primary-foreground/80 font-semibold tracking-wider uppercase text-sm mb-4">
                                {IMPACT_SECTION_CONTENT.vision.label}
                            </div>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                                {IMPACT_SECTION_CONTENT.vision.title}
                            </h3>
                            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                                {IMPACT_SECTION_CONTENT.vision.description}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
