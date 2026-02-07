"use client";

import { motion } from "framer-motion";
import { ClipboardList, UserCheck, LayoutDashboard, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@red-salud/ui";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const steps = [
    {
        icon: ClipboardList,
        title: "Diagnóstico Inicial",
        description: "Evaluamos las necesidades específicas de tu centro médico y volumen de operaciones.",
    },
    {
        icon: LayoutDashboard,
        title: "Configuración y Carga",
        description: "Migramos tus datos y configuramos los módulos de personal, consultorios y servicios.",
    },
    {
        icon: UserCheck,
        title: "Capacitación de Staff",
        description: "Entrenamos a tu equipo médico y administrativo en el uso eficiente de la plataforma.",
    },
    {
        icon: Rocket,
        title: "Despliegue Total",
        description: "Tu clínica comienza a operar digitalmente con soporte técnico prioritario 24/7.",
    },
];

export function ClinicasHowItWorks() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Implementación <span className="gradient-text">sin fricciones</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Acompañamos a tu institución en cada paso de su transformación digital.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />

                        {steps.map((step, i) => (
                            <motion.div key={i} variants={fadeInUp} className="relative z-10 text-center">
                                <div className="w-20 h-20 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center mx-auto mb-6 shadow-xl group hover:border-primary/30 transition-all duration-500">
                                    <step.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div variants={fadeInUp} className="text-center mt-16">
                        <Button
                            asChild
                            size="lg"
                            className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/40 px-10"
                        >
                            <Link href="/register/clinica">
                                Iniciar Proceso de Afiliación
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
