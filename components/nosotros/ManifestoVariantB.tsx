"use client";

/**
 * @file ManifestoVariantB.tsx
 * @description Variante B: Split Screen Interactivo
 * Pantalla dividida 50/50 con efecto visual de contraste entre caos y solución.
 * 
 * @example
 * <ManifestoVariantB />
 */

import { motion } from "framer-motion";
import {
    Heart,
    Shield,
    BrainCircuit,
    AlertTriangle,
    Clock,
    HelpCircle,
    CheckCircle2,
    Zap,
    Users
} from "lucide-react";

/** Puntos del lado "Caos" */
const CHAOS_POINTS = [
    { Icon: AlertTriangle, text: "Incertidumbre total al buscar ayuda" },
    { Icon: Clock, text: "Horas perdidas en salas de espera" },
    { Icon: HelpCircle, text: "Información dispersa e inaccesible" },
];

/** Puntos del lado "Solución" */
const SOLUTION_POINTS = [
    { Icon: BrainCircuit, text: "Conexión humana inmediata" },
    { Icon: Shield, text: "Información clara y transparente" },
    { Icon: Heart, text: "Empatía digital real" },
];

/** Animaciones */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const itemVariantsRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

/**
 * Componente Split Screen Interactivo
 * Muestra comparación directa entre el antes y después con diseño moderno
 */
export function ManifestoVariantB() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-background">
            {/* Background consistente con Hero */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.08),rgba(255,255,255,0))]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08] z-0" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                {/* Header centrado */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        El momento que lo <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-emerald-500">
                            cambió todo
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        De la frustración a la solución. Una visión que transformó el caos en claridad.
                    </p>
                </motion.div>

                {/* Split Screen Container */}
                <div className="grid lg:grid-cols-2 gap-0 lg:gap-0 relative">

                    {/* Línea divisora central */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-purple-500 to-emerald-500/50 z-20"
                    />

                    {/* LADO IZQUIERDO: El Caos */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative p-8 md:p-12 lg:p-16 bg-gradient-to-br from-red-950/10 via-background to-background border-r-0 lg:border-r border-border/30"
                    >
                        {/* Glow decorativo */}
                        <div className="absolute top-10 left-10 w-40 h-40 bg-red-500/10 rounded-full blur-[80px]" />

                        <motion.div variants={itemVariants} className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-6">
                                <AlertTriangle className="h-4 w-4" />
                                Antes
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                El Caos
                            </h3>

                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Todo comenzó en una sala de espera. Veía rostros de angustia, personas vulnerables perdiendo horas valiosas...
                            </p>
                        </motion.div>

                        {/* Lista de problemas */}
                        <div className="space-y-4 relative z-10">
                            {CHAOS_POINTS.map(({ Icon, text }, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/20 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-foreground/80 font-medium">{text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quote flotante */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.8 }}
                            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-red-500/20 relative z-10"
                        >
                            <p className="text-lg italic text-foreground/90 leading-relaxed">
                                &quot;El sistema estaba desconectado, y en medio de ese caos, las personas sufrían.&quot;
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* LADO DERECHO: La Solución */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative p-8 md:p-12 lg:p-16 bg-gradient-to-bl from-emerald-950/10 via-background to-background"
                    >
                        {/* Glow decorativo */}
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />

                        <motion.div variants={itemVariantsRight} className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6">
                                <Zap className="h-4 w-4" />
                                Ahora
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                La Solución
                            </h3>

                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Red-Salud nació como el estándar de salud moderna que Venezuela merece.
                            </p>
                        </motion.div>

                        {/* Lista de soluciones */}
                        <div className="space-y-4 relative z-10">
                            {SOLUTION_POINTS.map(({ Icon, text }, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariantsRight}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/20 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-foreground/80 font-medium">{text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quote flotante */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.8 }}
                            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-emerald-500/20 relative z-10"
                        >
                            <p className="text-lg italic text-foreground/90 leading-relaxed">
                                &quot;No fue una idea de negocio, fue un mandato moral.&quot;
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer con estadísticas */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
                >
                    {[
                        { Icon: Users, value: "1", label: "Fundador apasionado" },
                        { Icon: CheckCircle2, value: "5", label: "Meses de desarrollo" },
                        { Icon: Heart, value: "∞", label: "Compromiso con Venezuela" },
                    ].map(({ Icon, value, label }) => (
                        <div key={label} className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Icon className="h-5 w-5 text-primary" />
                                <span className="text-3xl md:text-4xl font-bold text-foreground">{value}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
