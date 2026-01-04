"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Shield, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const badges = [
    { icon: Shield, text: "Médicos Verificados" },
    { icon: Clock, text: "Atención 24/7" },
    { icon: CheckCircle2, text: "100% Gratis" },
];

export function PacientesHeroSection() {
    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5 dark:to-secondary/10" />

            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 blur-[100px] animate-blob" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 blur-[80px] animate-blob animation-delay-4000" />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="container relative z-10 px-4 md:px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="max-w-2xl"
                    >
                        {/* Free Badge */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                                </span>
                                <span className="text-sm font-medium text-secondary">
                                    100% Gratis para pacientes, siempre
                                </span>
                                <Sparkles className="h-4 w-4 text-secondary" />
                            </div>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
                        >
                            Tu salud,{" "}
                            <span className="relative">
                                <span className="gradient-text">simplificada</span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient-pacientes)" strokeWidth="3" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="gradient-pacientes" x1="0" y1="0" x2="300" y2="0">
                                            <stop stopColor="hsl(var(--secondary))" />
                                            <stop offset="1" stopColor="hsl(var(--primary))" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl"
                        >
                            Conecta con los mejores médicos verificados de Venezuela.
                            Agenda citas, accede a tu historial médico, recibe recetas digitales
                            y consulta por video—todo desde tu celular.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 mb-10"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base font-semibold bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Link href="/register/paciente">
                                    Registrarme Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-300 group"
                            >
                                <Link href="#como-funciona">
                                    Ver cómo funciona
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-wrap gap-6"
                        >
                            {badges.map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                                        <badge.icon className="h-4 w-4 text-secondary" />
                                    </div>
                                    <span className="text-sm font-medium">{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - App Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, rotateY: -5 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        {/* Floating Phone/Dashboard Preview */}
                        <div className="relative">
                            {/* Glow Effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 via-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-60" />

                            {/* Main Preview Card */}
                            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                                {/* App Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                                            <Heart className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">Mi Salud</div>
                                            <div className="text-xs text-muted-foreground">Dashboard</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-secondary/10 text-xs font-medium text-secondary">
                                        Activo
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* Next Appointment */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/5 border border-secondary/20"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próxima Cita</span>
                                            <span className="text-xs text-secondary">Hoy</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                JL
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">Dr. José López</div>
                                                <div className="text-sm text-muted-foreground">Cardiología • 3:00 PM</div>
                                            </div>
                                            <Button size="sm" variant="secondary" className="h-8 text-xs">
                                                Unirse
                                            </Button>
                                        </div>
                                    </motion.div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Consultas", value: "12", color: "text-blue-500" },
                                            { label: "Recetas", value: "8", color: "text-emerald-500" },
                                            { label: "Exámenes", value: "5", color: "text-violet-500" },
                                        ].map((stat, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 + i * 0.1 }}
                                                className="p-3 rounded-xl bg-muted/50 border border-border/30 text-center"
                                            >
                                                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Recent Activity */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="space-y-2"
                                    >
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actividad Reciente</div>
                                        <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">Receta recibida</div>
                                                <div className="text-xs text-muted-foreground">Hace 2 horas</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Floating Notification */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.1, type: "spring" }}
                                className="absolute -right-4 top-1/3 p-3 rounded-xl bg-card/90 backdrop-blur-lg border border-border/50 shadow-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <Heart className="h-4 w-4 text-secondary" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium">Cita confirmada</div>
                                        <div className="text-[10px] text-muted-foreground">Dr. López</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
