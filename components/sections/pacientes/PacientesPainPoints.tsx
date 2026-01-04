"use client";

import { motion } from "framer-motion";
import {
    Clock,
    FolderX,
    Search,
    HelpCircle,
    Bell,
    FileX,
    ArrowRight,
    Check
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const painPoints = [
    {
        icon: Clock,
        problem: "Colas interminables en clínicas",
        solution: "Agenda citas online y llega justo a tu hora",
        stat: "0 min de espera"
    },
    {
        icon: FolderX,
        problem: "Expedientes en papel que se pierden",
        solution: "Tu historial médico digital, siempre disponible",
        stat: "100% accesible"
    },
    {
        icon: Search,
        problem: "Difícil encontrar especialistas",
        solution: "Busca por especialidad, ubicación y disponibilidad",
        stat: "1000+ médicos"
    },
    {
        icon: HelpCircle,
        problem: "¿Cómo sé si el médico es bueno?",
        solution: "Todos los médicos verificados con SACS + calificaciones",
        stat: "100% verificados"
    },
    {
        icon: Bell,
        problem: "Olvido citas y medicamentos",
        solution: "Recordatorios automáticos por SMS y notificación",
        stat: "Nunca más olvides"
    },
    {
        icon: FileX,
        problem: "Resultados de laboratorio perdidos",
        solution: "Todo centralizado en tu cuenta, siempre disponible",
        stat: "Historial completo"
    },
];

export function PacientesPainPoints() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
                            <span>El problema</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            La atención médica tradicional{" "}
                            <span className="gradient-text">es complicada</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Sabemos lo frustrante que es. Por eso creamos Red-Salud:
                            para que cuidar tu salud sea simple.
                        </p>
                    </motion.div>

                    {/* Pain Points Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {painPoints.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="group relative"
                            >
                                <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
                                    {/* Icon */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-secondary/10 transition-colors duration-300">
                                            <item.icon className="h-6 w-6 text-destructive group-hover:text-secondary transition-colors duration-300" />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-5 w-5 text-secondary" />
                                        </div>
                                    </div>

                                    {/* Problem */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-foreground mb-2 line-through decoration-destructive/50 group-hover:no-underline transition-all">
                                            {item.problem}
                                        </h3>
                                    </div>

                                    {/* Solution */}
                                    <div className="flex items-start gap-2 mb-4">
                                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-secondary" />
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.solution}
                                        </p>
                                    </div>

                                    {/* Stat */}
                                    <div className="pt-4 border-t border-border/50">
                                        <span className="text-sm font-semibold text-secondary">
                                            {item.stat}
                                        </span>
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
