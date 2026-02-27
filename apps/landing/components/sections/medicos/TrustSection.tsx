"use client";

import { motion } from "framer-motion";
import {
    Shield,
    Lock,
    BadgeCheck,
    Headphones,
    Server,
    FileCheck,
    Scale,
    RefreshCw
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const trustItems = [
    {
        icon: BadgeCheck,
        title: "Verificación SACS",
        description: "Verificamos automáticamente tu registro en el Sistema de Atención al Ciudadano en Salud.",
    },
    {
        icon: Scale,
        title: "Cumple Normativas",
        description: "Recetas y firma electrónica válidas según la Ley de Mensajes de Datos de Venezuela.",
    },
    {
        icon: Lock,
        title: "Datos Encriptados",
        description: "Encriptación de grado bancario (AES-256) para toda tu información y la de tus pacientes.",
    },
    {
        icon: Server,
        title: "Servidores Seguros",
        description: "Infraestructura en la nube con respaldos automáticos y 99.9% de disponibilidad.",
    },
    {
        icon: Headphones,
        title: "Soporte 24/7",
        description: "Equipo de soporte dedicado disponible por chat, email o teléfono en todo momento.",
    },
    {
        icon: RefreshCw,
        title: "Actualizaciones Constantes",
        description: "Mejoramos la plataforma continuamente basándonos en feedback de médicos reales.",
    },
];

const certifications = [
    { name: "HIPAA Compliant", description: "Estándares internacionales" },
    { name: "SSL/TLS", description: "Conexión segura" },
    { name: "ISO 27001", description: "Seguridad de datos" },
];

export function TrustSection() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
                            <Shield className="h-4 w-4" />
                            <span>Seguridad garantizada</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Tu información está{" "}
                            <span className="gradient-text">protegida</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Cumplimos con los más altos estándares de seguridad y normativas
                            venezolanas para proteger a ti y a tus pacientes.
                        </p>
                    </motion.div>

                    {/* Trust Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-16">
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

                    {/* Certifications */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-border/50"
                    >
                        {certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border/50">
                                <FileCheck className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <div className="font-medium text-sm">{cert.name}</div>
                                    <div className="text-xs text-muted-foreground">{cert.description}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
