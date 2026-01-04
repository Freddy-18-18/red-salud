"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Regístrate gratis",
        description: "Solo necesitas tu email o cuenta de Google. En menos de 1 minuto tendrás tu cuenta lista.",
        color: "from-blue-500 to-indigo-500",
    },
    {
        number: "02",
        icon: Search,
        title: "Busca tu especialista",
        description: "Filtra por especialidad, ubicación y disponibilidad. Todos los médicos están verificados.",
        color: "from-emerald-500 to-teal-500",
    },
    {
        number: "03",
        icon: Calendar,
        title: "Agenda tu cita",
        description: "Elige el horario que te convenga. Presencial o por video. Recibirás confirmación inmediata.",
        color: "from-violet-500 to-purple-500",
    },
];

export function PacientesHowItWorks() {
    return (
        <section id="como-funciona" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span>Súper simple</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            3 pasos para{" "}
                            <span className="gradient-text">cuidar tu salud</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Sin complicaciones. Sin colas. Sin estrés.
                            Así de fácil es usar Red-Salud.
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="relative"
                                >
                                    {/* Connector Line (hidden on mobile) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px]">
                                            <div className="w-full h-full bg-gradient-to-r from-border to-transparent" />
                                            <ArrowRight className="absolute -right-2 -top-2 h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    <div className="relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-secondary/20 hover:shadow-lg transition-all duration-300 text-center h-full">
                                        {/* Step Number */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                            Paso {step.number}
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 mt-4`}>
                                            <step.icon className="h-8 w-8 text-white" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-semibold text-foreground mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            variants={fadeInUp}
                            className="text-center mt-12"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-10 text-base font-semibold bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Link href="/register/paciente">
                                    Registrarme Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                                Sin tarjeta de crédito • 100% gratis • Siempre
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
