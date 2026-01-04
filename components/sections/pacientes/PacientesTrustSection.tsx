"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    BadgeCheck,
    Headphones,
    UserCheck,
    Eye
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const trustItems = [
    {
        icon: BadgeCheck,
        title: "Médicos Verificados",
        description: "Todos los médicos son verificados con el SACS (Sistema de Autorización del Consejo de Salud).",
    },
    {
        icon: UserCheck,
        title: "Calificaciones Reales",
        description: "Las calificaciones vienen de pacientes reales que tuvieron consultas verificadas.",
    },
    {
        icon: Lock,
        title: "Datos Encriptados",
        description: "Tu información de salud está protegida con encriptación de grado bancario.",
    },
    {
        icon: Eye,
        title: "Tú Controlas",
        description: "Decides qué información compartir con cada médico. Tu privacidad es prioridad.",
    },
    {
        icon: Headphones,
        title: "Soporte Humano",
        description: "Equipo de soporte disponible por chat y teléfono para ayudarte.",
    },
    {
        icon: ShieldCheck,
        title: "Plataforma Segura",
        description: "Cumplimos con normativas de protección de datos y buenas prácticas médicas.",
    },
];

export function PacientesTrustSection() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Tu seguridad primero</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Confía en{" "}
                            <span className="gradient-text">Red-Salud</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tu salud es lo más importante. Por eso nos tomamos muy en serio
                            la seguridad y la calidad de los profesionales en nuestra plataforma.
                        </p>
                    </motion.div>

                    {/* Trust Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {trustItems.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-emerald-500/20 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
