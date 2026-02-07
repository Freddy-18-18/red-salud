"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";
import { Button } from "@red-salud/ui";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function FarmaciasCTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700" />

            {/* Animated elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div variants={fadeInUp} className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <Sparkles className="h-4 w-4 text-white" />
                            <span className="text-sm font-medium text-white">
                                Impulsa tus ventas hoy
                            </span>
                        </div>
                    </motion.div>

                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
                    >
                        Haz que tu farmacia sea la{" "}
                        <span className="text-violet-300">preferida de la red</span>
                    </motion.h2>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-violet-100 mb-12 max-w-2xl mx-auto"
                    >
                        Recibe órdenes digitales e incrementa tu base de clientes con la tecnología
                        más avanzada en dispensación de medicamentos.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-16 px-10 text-lg font-bold bg-white text-violet-700 hover:bg-purple-50 shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <Link href="/register/farmacia">
                                Afiliar mi Farmacia
                                <ArrowRight className="ml-2 h-6 w-6" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 text-lg font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-white/10"
                        >
                            <Link href="/contacto">
                                Hablar con un Ejecutivo
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="mt-12 flex items-center justify-center gap-4 text-violet-100/70"
                    >
                        <Building2 className="h-5 w-5" />
                        <span className="text-sm font-medium italic">Conectando a las farmacias líderes de Venezuela</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
