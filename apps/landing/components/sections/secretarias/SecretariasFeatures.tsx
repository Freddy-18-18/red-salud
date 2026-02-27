"use client";

import { motion } from "framer-motion";
import { CalendarRange, ClipboardList, MessageSquare, PieChart, ShieldCheck, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: CalendarRange,
        title: "Agenda Inteligente",
        description: "Control total de citas médicas con recordatorios automáticos y gestión de sobrecupos.",
        gradient: "from-amber-500 to-orange-600",
    },
    {
        icon: ClipboardList,
        title: "Triage y Recepción",
        description: "Flujo simplificado para la recepción de pacientes y registro inicial de signos vitales.",
        gradient: "from-orange-500 to-yellow-600",
    },
    {
        icon: MessageSquare,
        title: "Comunicación Multicanal",
        description: "Envío de recordatorios y confirmaciones vía WhatsApp, SMS y correo electrónico.",
        gradient: "from-yellow-500 to-amber-600",
    },
    {
        icon: PieChart,
        title: "Reportes de Gestión",
        description: "Estadísticas de asistencia, tiempos de espera y productividad de la consulta.",
        gradient: "from-amber-600 to-orange-700",
    },
    {
        icon: Zap,
        title: "Acceso Rápido",
        description: "Búsqueda instantánea de expedientes y documentos adjuntos del paciente.",
        gradient: "from-orange-600 to-yellow-700",
    },
    {
        icon: ShieldCheck,
        title: "Privacidad de Datos",
        description: "Niveles de acceso configurables para proteger la confidencialidad de la información médica.",
        gradient: "from-yellow-600 to-amber-800",
    },
];

export function SecretariasFeatures() {
    return (
        <section id="ventajas" className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Administración médica{" "}
                            <span className="gradient-text">sin fricciones</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Potenciamos el rol de la secretaria con herramientas que simplifican
                            el día a día y elevan la calidad del servicio.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
