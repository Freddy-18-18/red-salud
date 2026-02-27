"use client";

import { motion } from "framer-motion";
import { QrCode, ClipboardCheck, Truck, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: QrCode,
        title: "Receta Digital",
        description: "Validación instantánea de recetas médicas digitales mediante código QR, evitando errores y fraudes.",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        icon: Truck,
        title: "Logística Inteligente",
        description: "Integración con servicios de última milla para ofrecer entregas ultra-rápidas a tus pacientes.",
        gradient: "from-purple-500 to-indigo-600",
    },
    {
        icon: ClipboardCheck,
        title: "Control de Inventario",
        description: "Actualización automática de stock y sugerencias de reposición basadas en demanda real.",
        gradient: "from-indigo-500 to-violet-600",
    },
    {
        icon: BarChart3,
        title: "Analítica de Ventas",
        description: "Dashboards detallados sobre los medicamentos más solicitados y tendencias de consumo local.",
        gradient: "from-fuchsia-500 to-purple-600",
    },
    {
        icon: Zap,
        title: "Conexión Directa",
        description: "Chat directo con médicos para aclarar dudas sobre prescripciones de forma instantánea.",
        gradient: "from-violet-600 to-indigo-700",
    },
    {
        icon: ShieldCheck,
        title: "Cumplimiento Legal",
        description: "Gestión automatizada de libros de registro y normativas de la industria farmacéutica nacional.",
        gradient: "from-purple-600 to-violet-900",
    },
];

export function FarmaciasFeatures() {
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
                            Gestión farmacéutica de{" "}
                            <span className="gradient-text">alto rendimiento</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Herramientas diseñadas para maximizar la eficiencia de tu dispensario
                            y la satisfacción del cliente.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-violet-600 transition-colors">
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
