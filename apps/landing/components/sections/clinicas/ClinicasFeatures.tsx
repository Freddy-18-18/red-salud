"use client";

import { motion } from "framer-motion";
import { UserCheck, Building2, BarChart3, Clock, Settings, Shield } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: UserCheck,
        title: "Gestión de Personal",
        description: "Administra médicos, enfermeros y personal administrativo con roles jerárquicos y permisos avanzados.",
        gradient: "from-blue-500 to-indigo-600",
    },
    {
        icon: Building2,
        title: "Multi-sucursal Centralizado",
        description: "Controla múltiples sedes desde un solo tablero. Consolida datos financieros y operativos en tiempo real.",
        gradient: "from-indigo-500 to-purple-600",
    },
    {
        icon: BarChart3,
        title: "Business Intelligence",
        description: "Reportes automatizados sobre productividad, flujo de pacientes y rentabilidad por especialidad.",
        gradient: "from-purple-500 to-pink-600",
    },
    {
        icon: Clock,
        title: "Agenda Inteligente",
        description: "Sistema de triaje digital y gestión de turnos que reduce el ausentismo y optimiza quirófanos.",
        gradient: "from-pink-500 to-rose-600",
    },
    {
        icon: Settings,
        title: "Ecosistema Integrado",
        description: "Conexión nativa con laboratorios, farmacias de la red y sistemas de seguros nacionales e internacionales.",
        gradient: "from-rose-500 to-orange-600",
    },
    {
        icon: Shield,
        title: "Seguridad Institucional",
        description: "Encriptación de grado militar para expedientes clínicos y cumplimiento estricto de normativas de salud.",
        gradient: "from-orange-500 to-amber-600",
    },
];

export function ClinicasFeatures() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Potencia cada área de tu <span className="gradient-text">centro médico</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Herramientas de nivel empresarial adaptadas a la realidad
                            del sector salud en Venezuela.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
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
