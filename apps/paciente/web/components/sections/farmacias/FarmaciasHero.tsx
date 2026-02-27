"use client";

import { motion } from "framer-motion";
import { ArrowRight, Pill, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@red-salud/design-system";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const stats = [
    { label: "Farmacias en Red", value: "+450", icon: ShoppingBag },
    { label: "Recetas Digitales", value: "+100k", icon: Pill },
    { label: "Entregas Locales", value: "30min", icon: Truck },
    { label: "Garantía de Origen", value: "BIO-SAFE", icon: ShieldCheck },
];

export function FarmaciasHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 md:pt-0">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-800" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-size-[40px_40px]" />

            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-[120px] animate-blob" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div variants={fadeInUp} className="mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-violet-100 text-sm font-medium">
                                <Pill className="h-4 w-4" />
                                Red de Dispensación Inteligente
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Conecta tu farmacia con el{" "}
                            <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                                futuro digital
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-violet-100/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            Acepta recetas digitales, gestiona inventarios y ofrece delivery
                            prioritario a través de la integración nativa con la red de médicos
                            y pacientes más grande de Venezuela.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base font-semibold bg-white text-violet-900 hover:bg-purple-50 shadow-xl"
                            >
                                <Link href="/register/farmacia">
                                    Afiliar mi Farmacia
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-medium border-2 border-white/30 text-white bg-transparent hover:bg-white/10"
                            >
                                <Link href="/servicios/farmacias#ventajas">Conocer más</Link>
                            </Button>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-violet-200/70 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
