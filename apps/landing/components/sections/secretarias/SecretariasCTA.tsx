"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@red-salud/design-system";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function SecretariasCTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700" />

            {/* Animated elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
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
                                Moderniza tu oficina médica
                            </span>
                        </div>
                    </motion.div>

                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
                    >
                        El asistente digital que{" "}
                        <span className="text-amber-300">tu consulta necesita</span>
                    </motion.h2>

                    <motion.p
                        variants={fadeInUp}
                        className="text-xl text-amber-100 mb-12 max-w-2xl mx-auto"
                    >
                        Únete a la red y simplifica la gestión administrativa de tus médicos
                        mientras brindas una mejor atención.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-16 px-10 text-lg font-bold bg-white text-amber-700 hover:bg-orange-50 shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <Link href="/register/secretaria">
                                Registrarse Gratis
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
                                Solicitar Demo
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="mt-12 flex items-center justify-center gap-4 text-amber-100/70"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span className="text-sm font-medium italic">Empoderando a los profesionales administrativos de la salud</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
