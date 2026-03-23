"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Stethoscope, Users, Award } from "lucide-react";
import { StudentPathVisuals } from "@/components/academy/visuals/StudentPathVisuals";

const STEPS = [
    {
        title: "Inmersión Total",
        description: "Accede a una biblioteca viva de conocimiento médico. No son simples videos, son experiencias inmersivas diseñadas para reprogramar tu entendimiento clínico.",
        icon: BookOpen,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        visual: <StudentPathVisuals.Inmersion />
    },
    {
        title: "Práctica Clínica",
        description: "La teoría sin práctica es ciega. Enfrenta casos clínicos simulados y toma decisiones en tiempo real sin riesgo para pacientes reales.",
        icon: Stethoscope,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        visual: <StudentPathVisuals.Practica />
    },
    {
        title: "Mentoria Global",
        description: "No estás solo. Conecta con especialistas de talla mundial y una comunidad de pares que elevan tu estándar profesional.",
        icon: Users,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        visual: <StudentPathVisuals.Mentoria />
    },
    {
        title: "Certificación Blockchain",
        description: "Tu esfuerzo merece ser reconocido globalmente. Obtén certificados inmutables verificables instantáneamente por cualquier institución.",
        icon: Award,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        visual: <StudentPathVisuals.Certificacion />
    }
];

export function StudentPathSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-950" ref={containerRef}>
            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
                    >
                        Tu Ruta a la <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Excelencia Médica</span>
                    </motion.h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Un camino estructurado para transformar tu curiosidad en maestría clínica.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 md:-ml-[2px] h-full bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div style={{ height: lineHeight }} className="w-full bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                    </div>

                    <div className="space-y-12 md:space-y-24">
                        {STEPS.map((step, index) => (
                            <div key={step.title} className={`relative flex flex-col md:flex-row items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="absolute left-[20px] md:left-1/2 w-4 h-4 -ml-[6px] md:-ml-2 rounded-full bg-slate-950 border-2 border-white/20 z-10">
                                    <motion.div initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1.5, opacity: 1 }} className={`w-full h-full rounded-full ${step.bg}`} />
                                </div>
                                <div className={`ml-12 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:text-right' : 'md:text-left order-2'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ margin: "-100px" }}
                                        className="relative group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-500 shadow-2xl"
                                    >
                                        <div className={`absolute -top-6 ${index % 2 === 0 ? 'md:-right-6 right-auto left-6 md:left-auto' : '-left-6'} w-12 h-12 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shadow-[0_0_15px_currentColor] text-white z-20`}>
                                            <step.icon className={`w-6 h-6 ${step.color}`} />
                                        </div>
                                        <h3 className={`text-2xl font-bold text-white mb-4 ${step.color}`}>{step.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{step.description}</p>
                                    </motion.div>
                                </div>
                                <div className={`hidden md:flex md:w-[45%] items-center justify-center ${index % 2 === 0 ? 'order-2' : 'order-1'} pointer-events-none`}>
                                    <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} className="w-full">
                                        {step.visual}
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
