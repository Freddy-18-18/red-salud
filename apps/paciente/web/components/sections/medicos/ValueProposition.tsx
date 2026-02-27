"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Globe, Wallet, Star, Heart } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const values = [
    {
        icon: TrendingUp,
        title: "Aumenta tus ingresos",
        description: "Atiende más pacientes sin límites geográficos. Muchos médicos reportan hasta 40% más ingresos.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: Clock,
        title: "Recupera tu tiempo",
        description: "Automatiza tareas repetitivas. Recordatorios, confirmaciones y seguimiento—todo automático.",
        gradient: "from-blue-500 to-indigo-500",
    },
    {
        icon: Globe,
        title: "Alcance nacional",
        description: "Atiende pacientes de todo el país. Venezolanos en el exterior también pueden consultarte.",
        gradient: "from-violet-500 to-purple-500",
    },
    {
        icon: Wallet,
        title: "Cero inversión inicial",
        description: "Sin costos de consultorio físico. Comienza gratis y paga solo cuando generes ingresos.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: Star,
        title: "Prestigio profesional",
        description: "Perfil verificado con tu información del SACS. Los pacientes confían en médicos verificados.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Heart,
        title: "Mejor calidad de vida",
        description: "Trabaja desde casa, el consultorio, o viajando. Horarios flexibles que tú controlas.",
        gradient: "from-cyan-500 to-sky-500",
    },
];

export function ValueProposition() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                            <span>¿Por qué Red-Salud?</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Más que una plataforma,{" "}
                            <span className="gradient-text">un socio en tu éxito</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Diseñada por y para médicos venezolanos. Entendemos los retos
                            de la práctica médica moderna en nuestro país.
                        </p>
                    </motion.div>

                    {/* Values Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="group"
                            >
                                <div className="h-full p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} p-0.5 mb-5`}>
                                        <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                                            <value.icon className={`h-6 w-6 bg-gradient-to-br ${value.gradient} bg-clip-text text-transparent group-hover:text-white transition-colors duration-300`}
                                                style={{
                                                    stroke: `url(#gradient-${index})`,
                                                }}
                                            />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor={value.gradient.includes('emerald') ? '#10b981' : value.gradient.includes('blue') ? '#3b82f6' : value.gradient.includes('violet') ? '#8b5cf6' : value.gradient.includes('amber') ? '#f59e0b' : value.gradient.includes('pink') ? '#ec4899' : '#06b6d4'} />
                                                        <stop offset="100%" stopColor={value.gradient.includes('teal') ? '#14b8a6' : value.gradient.includes('indigo') ? '#6366f1' : value.gradient.includes('purple') ? '#a855f7' : value.gradient.includes('orange') ? '#f97316' : value.gradient.includes('rose') ? '#f43f5e' : '#0ea5e9'} />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-foreground mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Stats */}
                    <motion.div
                        variants={fadeInUp}
                        className="mt-16 pt-16 border-t border-border/50"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                            {[
                                { value: "24/7", label: "Soporte disponible" },
                                { value: "500+", label: "Farmacias afiliadas" },
                                { value: "48h", label: "Verificación SACS" },
                                { value: "0%", label: "Comisión en Plan Premium" },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
