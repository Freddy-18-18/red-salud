"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Landmark, Layers, ShieldCheck, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: CheckCircle2,
        title: "APS Digital",
        description: "Gestión automatizada de Atención Primaria de Salud con validación inmediata de elegibilidad.",
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        icon: Clock,
        title: "Cartas Avales 24/7",
        description: "Emisión y procesamiento de cartas avales de forma digital, eliminando esperas telefónicas.",
        gradient: "from-blue-500 to-sky-600",
    },
    {
        icon: Landmark,
        title: "Control de Fraude",
        description: "Algoritmos de IA para detectar patrones atípicos y asegurar el uso correcto de pólizas.",
        gradient: "from-sky-500 to-cyan-600",
    },
    {
        icon: Layers,
        title: "Interconexión Total",
        description: "Canal único de comunicación entre aseguradora, red de clínicas y farmacias aliadas.",
        gradient: "from-blue-600 to-sky-700",
    },
    {
        icon: Zap,
        title: "Liquidación Express",
        description: "Proceso de pago a proveedores optimizado mediante conciliación digital automática.",
        gradient: "from-cyan-600 to-blue-700",
    },
    {
        icon: ShieldCheck,
        title: "Data Master Sanitaria",
        description: "Acceso a analitica descriptiva sobre morbilidad y costos medios de siniestralidad.",
        gradient: "from-sky-600 to-cyan-800",
    },
];

export function SegurosFeatures() {
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
                            Eficiencia operativa para{" "}
                            <span className="gradient-text">el sector asegurador</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Reducimos costos y mejoramos la experiencia del asegurado mediante
                            la transformación digital de los procesos médicos.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-600 transition-colors">
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
