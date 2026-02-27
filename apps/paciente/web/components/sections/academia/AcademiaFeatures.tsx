"use client";

import { motion } from "framer-motion";
import { BookOpen, MonitorPlay, Award, Users, Globe, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        icon: BookOpen,
        title: "Cursos Certificados",
        description: "Programas de formación con aval institucional y académico nacional e internacional.",
        gradient: "from-indigo-500 to-purple-600",
    },
    {
        icon: MonitorPlay,
        title: "Webinars en Vivo",
        description: "Sesiones interactivas con especialistas en tiempo real sobre las últimas tendencias médicas.",
        gradient: "from-purple-500 to-pink-600",
    },
    {
        icon: Award,
        title: "Puntos de Recertificación",
        description: "Muchos de nuestros cursos otorgan créditos para la educación médica continua.",
        gradient: "from-indigo-600 to-indigo-800",
    },
    {
        icon: Users,
        title: "Comunidad Médica",
        description: "Foros de discusión y networking con colegas de todo el país y el mundo.",
        gradient: "from-purple-600 to-purple-800",
    },
    {
        icon: Globe,
        title: "Acceso Multiplataforma",
        description: "Estudia a tu ritmo desde cualquier lugar, disponible en PC, tablets y smartphones.",
        gradient: "from-indigo-400 to-purple-500",
    },
    {
        icon: Zap,
        title: "Contenido de Vanguardia",
        description: "Nuevos módulos agregados mensualmente con lo último en investigación y tecnología.",
        gradient: "from-purple-400 to-indigo-600",
    },
];

export function AcademiaFeatures() {
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
                            Tu crecimiento profesional{" "}
                            <span className="gradient-text">no se detiene</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Ofrecemos las mejores herramientas académicas diseñadas por y para
                            expertos del sector salud.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity`} />

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
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
