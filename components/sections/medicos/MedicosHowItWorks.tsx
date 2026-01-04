"use client";

import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Settings, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const steps = [
    {
        number: "01",
        icon: UserPlus,
        title: "Regístrate en 2 minutos",
        description: "Crea tu cuenta con email o Google. Solo necesitas tu cédula venezolana para comenzar.",
        color: "from-blue-500 to-indigo-500",
    },
    {
        number: "02",
        icon: ShieldCheck,
        title: "Verificación automática",
        description: "Verificamos tu registro en el SACS automáticamente. En 24-48 horas estás activo.",
        color: "from-emerald-500 to-teal-500",
    },
    {
        number: "03",
        icon: Settings,
        title: "Configura tu consultorio",
        description: "Establece horarios, precios y servicios. Personaliza tu perfil profesional.",
        color: "from-violet-500 to-purple-500",
    },
    {
        number: "04",
        icon: Rocket,
        title: "¡Comienza a atender!",
        description: "Recibe pacientes, gestiona citas y cobra online. Todo listo para crecer.",
        color: "from-amber-500 to-orange-500",
    },
];

export function MedicosHowItWorks() {
    return (
        <section className="py-24 relative overflow-hidden">
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <span>Proceso simple</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Activo en{" "}
                            <span className="gradient-text">menos de 48 horas</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Sin papeleos complicados. Sin trámites eternos.
                            Nuestro proceso de verificación es el más rápido del mercado.
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="relative"
                                >
                                    {/* Connector Line (hidden on mobile) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px]">
                                            <div className="w-full h-full bg-gradient-to-r from-border to-transparent" />
                                            <ArrowRight className="absolute -right-2 -top-2 h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    <div className="relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
                                        {/* Step Number */}
                                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                            <span className="text-xs font-bold text-muted-foreground">{step.number}</span>
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                                            <step.icon className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
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
                                className="h-14 px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Link href="/register/medico">
                                    Comenzar ahora
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                                Sin tarjeta de crédito • 30 días gratis • Cancela cuando quieras
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
