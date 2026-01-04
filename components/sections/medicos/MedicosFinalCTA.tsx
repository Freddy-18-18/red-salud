"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const benefits = [
    "30 días gratis sin compromiso",
    "Sin tarjeta de crédito requerida",
    "Soporte personalizado para empezar",
    "Cancela cuando quieras",
];

export function MedicosFinalCTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

            {/* Animated Orbs */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                                Oferta especial de lanzamiento
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        variants={fadeInUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
                    >
                        Únete a la nueva generación de{" "}
                        <span className="gradient-text">médicos digitales</span>
                    </motion.h2>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                    >
                        Transforma tu práctica médica hoy. Miles de pacientes buscan
                        profesionales verificados como tú.
                    </motion.p>

                    {/* Benefits */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center gap-4 mb-10"
                    >
                        {benefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50"
                            >
                                <CheckCircle2 className="h-4 w-4 text-secondary" />
                                <span className="text-sm text-foreground">{benefit}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-14 px-10 text-base font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            <Link href="/register/medico">
                                Comenzar 30 días gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-300"
                        >
                            <Link href="/pricing">
                                Ver planes y precios
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Trust Note */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-sm text-muted-foreground mt-8"
                    >
                        ¿Tienes preguntas? Agenda una{" "}
                        <Link href="/contacto" className="text-primary hover:underline">
                            demo personalizada
                        </Link>{" "}
                        con nuestro equipo.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
