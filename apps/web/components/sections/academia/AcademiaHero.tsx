"use client";

import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Video, Award, Users } from "lucide-react";
import { Button } from "@red-salud/ui";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const stats = [
    { label: "Cursos Activos", value: "+120", icon: Video },
    { label: "Estudiantes", value: "+5k", icon: Users },
    { label: "Certificaciones", value: "Avaladas", icon: Award },
    { label: "Instructores", value: "Expertos", icon: GraduationCap },
];

export function AcademiaHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 md:pt-0">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800" />
            <div className="absolute inset-0 opacity-20 bg-[url('/patterns/circuit.svg')] bg-repeat" />

            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px] animate-blob" />
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
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-sm font-medium">
                                <GraduationCap className="h-4 w-4" />
                                Centro de Formación Continua
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Eleva tu carrera médica con{" "}
                            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                conocimiento experto
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-indigo-100/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            Accede a la mayor red de educación médica en Venezuela.
                            Cursos certificados, webinars en vivo y recursos actualizados
                            para profesionales de la salud.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base font-semibold bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl"
                            >
                                <Link href="/academia/cursos">
                                    Explorar Cursos
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-medium border-2 border-white/30 text-white bg-transparent hover:bg-white/10"
                            >
                                <Link href="/academia/webinars">Webinars Gratuitos</Link>
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
                                    <div className="text-sm text-indigo-200/70 font-medium">{stat.label}</div>
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
