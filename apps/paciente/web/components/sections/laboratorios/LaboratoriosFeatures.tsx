"use client";

import { motion } from "framer-motion";
import { FileText, Smartphone, Calendar, Database, ShieldCheck, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: FileText,
        title: "Entrega Digital",
        description: "Envío automatizado de resultados firmados digitalmente por email y WhatsApp a pacientes y médicos.",
        gradient: "from-teal-500 to-emerald-600",
    },
    {
        icon: Smartphone,
        title: "App del Paciente",
        description: "Los pacientes acceden a su historial de análisis completo desde su celular en cualquier momento.",
        gradient: "from-emerald-500 to-green-600",
    },
    {
        icon: Calendar,
        title: "Gestión de Citas",
        description: "Sistema para programar tomas de muestra a domicilio o en sede, optimizando el flujo de trabajo.",
        gradient: "from-green-500 to-teal-600",
    },
    {
        icon: Database,
        title: "Integración LIS",
        description: "Sincronización bidireccional con los principales sistemas de información de laboratorio del mercado.",
        gradient: "from-cyan-500 to-teal-600",
    },
    {
        icon: Zap,
        title: "Alertas Críticas",
        description: "Notificación inmediata a médicos tratantes ante valores de pánico o resultados urgentes.",
        gradient: "from-teal-600 to-emerald-700",
    },
    {
        icon: ShieldCheck,
        title: "Validez Legal",
        description: "Cumplimiento total con normativas del MPPS y protección de datos sensibles de salud.",
        gradient: "from-emerald-600 to-teal-800",
    },
];

export function LaboratoriosFeatures() {
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
                            Tecnología aplicada al{" "}
                            <span className="gradient-text">diagnóstico</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Modernizamos los procesos de tu laboratorio para ofrecer un servicio
                            más rápido, seguro y eficiente.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors">
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
