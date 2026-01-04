"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

export function CTASection() {
    return (
        <section className="relative py-24 sm:py-32 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000 mix-blend-screen" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shadow-lg shadow-primary/10">
                            <Sparkles className="w-4 h-4" />
                            <span>Transforma tu experiencia de salud</span>
                        </span>
                    </motion.div>

                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 mb-6 tracking-tight"
                    >
                        Empieza tu viaje hacia una <br />
                        <span className="text-primary">mejor salud hoy</span>
                    </motion.h2>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Descubre una nueva forma de cuidar tu bienestar. Plataforma integral diseñada en Venezuela, para conectar profesionales de salud y pacientes en un ecosistema digital seguro y moderno.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                        >
                            <a href={AUTH_ROUTES.REGISTER}>
                                Crear cuenta gratis
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50 transition-all duration-300"
                        >
                            <a href={AUTH_ROUTES.LOGIN}>
                                Ya tengo cuenta
                            </a>
                        </Button>
                    </motion.div>

                    {/* Trust text */}
                    <motion.p
                        variants={fadeInUp}
                        className="mt-8 text-sm text-muted-foreground"
                    >
                        No se requiere tarjeta de crédito • Cancelación en cualquier momento
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
