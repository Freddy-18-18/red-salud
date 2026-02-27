"use client";

import { motion } from "framer-motion";
import { Navigation, HeartPulse, ShieldAlert, MonitorCheck, ShieldCheck, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: Navigation,
        title: "Geolocalización Real",
        description: "Seguimiento en tiempo real de cada unidad y cálculo de rutas óptimas evitando el tráfico.",
        gradient: "from-red-500 to-rose-600",
    },
    {
        icon: HeartPulse,
        title: "Telemetría Médica",
        description: "Envío de signos vitales en vivo desde la ambulancia al centro de trauma receptor.",
        gradient: "from-rose-500 to-red-600",
    },
    {
        icon: ShieldAlert,
        title: "Despacho Inteligente",
        description: "Asignación automática de la unidad más cercana y capacitada según el tipo de emergencia.",
        gradient: "from-red-600 to-rose-700",
    },
    {
        icon: MonitorCheck,
        title: "Control de Flota",
        description: "Monitoreo de combustible, mantenimiento preventivo y desempeño de tripulación.",
        gradient: "from-rose-600 to-red-800",
    },
    {
        icon: Zap,
        title: "Botón de Pánico",
        description: "Integración con sistemas de seguridad ciudadana para respuesta inmediata en situaciones críticas.",
        gradient: "from-red-400 to-rose-500",
    },
    {
        icon: ShieldCheck,
        title: "Protocolos Internacionales",
        description: "Digitalización de protocolos AHA y ERC para guiar la atención pre-hospitalaria.",
        gradient: "from-rose-700 to-red-900",
    },
];

export function AmbulanciasFeatures() {
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
                            Respuesta crítica con{" "}
                            <span className="gradient-text">precisión digital</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Transformamos la logística de emergencias para salvar más vidas
                            gracias a la tecnología de punta.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-red-600 transition-colors">
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
