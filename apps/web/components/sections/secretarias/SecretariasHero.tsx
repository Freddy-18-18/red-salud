"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Users, Briefcase, ShieldCheck } from "lucide-react";
import { Button } from "@red-salud/ui";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const stats = [
    { label: "Agendas Gestionadas", value: "+2k", icon: Calendar },
    { label: "Asistentes Activos", value: "+800", icon: Users },
    { label: "Eficiencia Administrativa", value: "+40%", icon: Briefcase },
    { label: "Soporte", value: "24/7", icon: ShieldCheck },
];

export function SecretariasHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 md:pt-0">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-800" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-size-[40px_40px]" />

            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/20 blur-[120px] animate-blob" />
                <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-orange-500/20 blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div variants={fadeInUp} className="mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-100 text-sm font-medium">
                                <Users className="h-4 w-4" />
                                Gestión Médica Profesional
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Optimiza la gestión de tu{" "}
                            <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                                consulta médica
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-amber-100/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            Herramientas avanzadas para secretarias y asistentes médicos.
                            Organiza agendas, gestiona historias clínicas y mejora la
                            atención al paciente con un sistema intuitivo.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base font-semibold bg-white text-amber-900 hover:bg-orange-50 shadow-xl"
                            >
                                <Link href="/register/secretaria">
                                    Registrar Asistente
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-medium border-2 border-white/30 text-white bg-transparent hover:bg-white/10"
                            >
                                <Link href="/servicios/secretarias#ventajas">Explorar Funciones</Link>
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
                                    <div className="text-sm text-amber-200/70 font-medium">{stat.label}</div>
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
