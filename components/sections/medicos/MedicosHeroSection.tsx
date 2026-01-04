"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/lib/animations";

import { DashboardPreview, badges } from "./medicos-hero";

export function MedicosHeroSection() {
    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10" />

            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-[100px] animate-blob" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/15 to-primary/15 blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-[80px] animate-blob animation-delay-4000" />
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
                        {/* Announcement Badge */}
                        <motion.div variants={fadeInUp} className="mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                                </span>
                                <span className="text-sm font-medium text-primary">
                                    Nuevo: Firma electrónica válida en Venezuela
                                </span>
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
                        >
                            Tu consultorio digital,{" "}
                            <span className="relative">
                                <span className="gradient-text">sin límites</span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                                            <stop stopColor="hsl(var(--primary))" />
                                            <stop offset="1" stopColor="hsl(var(--secondary))" />
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
                            La plataforma integral que transforma cómo atiendes pacientes.
                            Agenda inteligente, expedientes digitales, telemedicina HD y recetas
                            con firma electrónica—todo en un solo lugar.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 mb-10"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Link href="/register/medico">
                                    Comenzar 30 días gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-300 group"
                            >
                                <Link href="#demo">
                                    <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                                    Ver demo interactiva
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
                                        <badge.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, rotateY: -5 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        <DashboardPreview />
                    </motion.div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
