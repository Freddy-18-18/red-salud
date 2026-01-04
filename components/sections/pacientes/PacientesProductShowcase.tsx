"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Calendar,
    Video,
    FileText,
    FlaskConical,
    Heart,
    Check,
    ChevronRight
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

const features = [
    {
        id: "buscar",
        icon: Search,
        name: "Buscar Médicos",
        description: "Encuentra al especialista ideal",
        color: "from-blue-500 to-indigo-500",
        benefits: [
            "Filtros por especialidad y ubicación",
            "Perfil completo del médico",
            "Verificación SACS visible",
            "Calificaciones de otros pacientes",
            "Disponibilidad en tiempo real"
        ],
        preview: (
            <div className="space-y-3">
                {[
                    { name: "Dr. José López", specialty: "Cardiología", rating: "4.9", available: true },
                    { name: "Dra. María Pérez", specialty: "Dermatología", rating: "4.8", available: true },
                    { name: "Dr. Carlos Ruiz", specialty: "Pediatría", rating: "4.7", available: false },
                ].map((doc, i) => (
                    <div key={i} className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        doc.available
                            ? "bg-card border-border/50 hover:border-primary/30"
                            : "bg-muted/30 border-border/30 opacity-60"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-white font-semibold text-sm">
                                {doc.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{doc.name}</div>
                                <div className="text-xs text-muted-foreground">{doc.specialty}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-amber-500">★ {doc.rating}</div>
                            <div className={cn("text-xs", doc.available ? "text-secondary" : "text-muted-foreground")}>
                                {doc.available ? "Disponible" : "Sin horarios"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        id: "agendar",
        icon: Calendar,
        name: "Agendar Citas",
        description: "Reserva en segundos",
        color: "from-emerald-500 to-teal-500",
        benefits: [
            "Selecciona fecha y hora",
            "Presencial o telemedicina",
            "Confirmación instantánea",
            "Recordatorios automáticos",
            "Cancelación fácil"
        ],
        preview: (
            <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                        <div key={i} className="text-muted-foreground py-1">{d}</div>
                    ))}
                    {[16, 17, 18, 19, 20, 21, 22].map((d, i) => (
                        <div key={i} className={cn(
                            "py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                            d === 19 ? "bg-secondary text-white" : "hover:bg-muted"
                        )}>
                            {d}
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Horarios disponibles:</div>
                    <div className="flex flex-wrap gap-2">
                        {['9:00', '10:30', '11:00', '15:00', '16:30'].map((time, i) => (
                            <div key={i} className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                                i === 1 ? "bg-secondary text-white border-secondary" : "border-border hover:border-secondary"
                            )}>
                                {time}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "videoconsulta",
        icon: Video,
        name: "Videoconsultas",
        description: "Consulta desde tu casa",
        color: "from-violet-500 to-purple-500",
        benefits: [
            "Video en HD",
            "Chat integrado",
            "Compartir documentos",
            "Desde cualquier dispositivo",
            "Conexión segura"
        ],
        preview: (
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-violet-900 to-violet-950 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center mb-3 animate-pulse">
                        <Video className="h-8 w-8 text-violet-300" />
                    </div>
                    <div className="text-sm text-violet-200">En consulta</div>
                    <div className="text-xs text-violet-400 mt-1">Dr. López • HD</div>
                </div>
                <div className="absolute bottom-2 right-2 w-14 h-10 rounded-lg bg-violet-800/80 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-xs text-violet-200">Tú</span>
                </div>
            </div>
        )
    },
    {
        id: "recetas",
        icon: FileText,
        name: "Recetas Digitales",
        description: "Válidas en +500 farmacias",
        color: "from-amber-500 to-orange-500",
        benefits: [
            "Firma electrónica válida",
            "Directo a tu celular",
            "Historial de recetas",
            "500+ farmacias afiliadas",
            "Fácil de mostrar"
        ],
        preview: (
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold text-sm">Receta Médica</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Válida
                    </span>
                </div>
                <div className="p-2 rounded bg-muted/50">
                    <div className="font-medium text-sm">Amoxicilina 500mg</div>
                    <div className="text-xs text-muted-foreground">1 cápsula cada 8 horas - 7 días</div>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
                    <span className="text-muted-foreground">Dr. José López</span>
                    <span className="text-amber-500">SACS #12345</span>
                </div>
            </div>
        )
    },
    {
        id: "historial",
        icon: Heart,
        name: "Tu Historial Médico",
        description: "Todo en un solo lugar",
        color: "from-pink-500 to-rose-500",
        benefits: [
            "Consultas anteriores",
            "Diagnósticos y tratamientos",
            "Resultados de exámenes",
            "Medicamentos activos",
            "Siempre accesible"
        ],
        preview: (
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">Consulta General</div>
                        <div className="text-xs text-muted-foreground">15 Nov 2024 • Dr. López</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <FlaskConical className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-sm">Perfil Lipídico</div>
                        <div className="text-xs text-muted-foreground">10 Nov 2024 • Resultados normales</div>
                    </div>
                </div>
            </div>
        )
    },
];

export function PacientesProductShowcase() {
    const [activeFeature, setActiveFeature] = useState("buscar");
    const currentFeature = features.find(f => f.id === activeFeature) || features[0];

    return (
        <section id="demo" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

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
                            <span>Tu dashboard personal</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Todo tu cuidado de salud,{" "}
                            <span className="gradient-text">en un solo lugar</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Desde buscar médicos hasta recibir tus recetas.
                            Así de fácil es cuidar tu salud con Red-Salud.
                        </p>
                    </motion.div>

                    {/* Interactive Showcase */}
                    <motion.div
                        variants={fadeInUp}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
                            {/* Feature Selector */}
                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    const isActive = activeFeature === feature.id;

                                    return (
                                        <button
                                            key={feature.id}
                                            onClick={() => setActiveFeature(feature.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink",
                                                isActive
                                                    ? "bg-card border-2 border-secondary/30 shadow-lg shadow-secondary/10"
                                                    : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                isActive
                                                    ? `bg-gradient-to-br ${feature.color} text-white`
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="hidden lg:block">
                                                <div className={cn(
                                                    "font-medium transition-colors",
                                                    isActive ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {feature.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {feature.description}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="h-5 w-5 text-secondary ml-auto hidden lg:block" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Preview Panel */}
                            <div className="relative">
                                <div className="absolute -inset-3 bg-gradient-to-r from-secondary/10 via-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-50" />
                                <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                                                currentFeature.color
                                            )}>
                                                <currentFeature.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{currentFeature.name}</h3>
                                                <p className="text-sm text-muted-foreground">{currentFeature.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="grid md:grid-cols-2 gap-6 p-6">
                                        {/* Features List */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                Incluye
                                            </h4>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeFeature}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-2"
                                                >
                                                    {currentFeature.benefits.map((benefit, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                                <Check className="h-3 w-3 text-secondary" />
                                                            </div>
                                                            <span className="text-sm text-foreground">{benefit}</span>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>

                                        {/* Preview */}
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                                Vista Previa
                                            </h4>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeFeature}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {currentFeature.preview}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
