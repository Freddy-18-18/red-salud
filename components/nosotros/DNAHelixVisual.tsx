"use client";

/**
 * @file DNAHelixVisual.tsx
 * @description Componente visual premium que muestra una doble hélice de ADN 3D
 * con iconos de salud rotando suavemente. Representa "La salud está en nuestro código".
 * 
 * @example
 * <DNAHelixVisual />
 */

import { motion } from "framer-motion";
import {
    Heart,
    Shield,
    Users,
    Stethoscope,
    Pill,
    Activity,
    Brain,
    Sparkles,
    Zap,
    Calendar,
    Clock,
    FileText
} from "lucide-react";
import { LucideIcon } from "lucide-react";

/** Configuración de la hélice */
const HELIX_CONFIG = {
    /** Número de nodos por cadena */
    nodeCount: 10,
    /** Radio horizontal de la hélice - aumentado para mayor impacto visual */
    radius: 110,
    /** Altura total de la hélice */
    height: 500,
    /** Velocidad de rotación en segundos */
    rotationDuration: 8,
    /** Número de vueltas completas */
    turns: 1.5,
};

/** Iconos que forman los "eslabones" del ADN con sus colores */
interface DNAIcon {
    Icon: LucideIcon;
    color: string;
    bgColor: string;
}

const dnaIcons: DNAIcon[] = [
    { Icon: Heart, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
    { Icon: Shield, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { Icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
    { Icon: Stethoscope, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    { Icon: Pill, color: "text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
    { Icon: Activity, color: "text-pink-500", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
    { Icon: Brain, color: "text-indigo-500", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
    { Icon: Calendar, color: "text-teal-500", bgColor: "bg-teal-100 dark:bg-teal-900/30" },
    { Icon: FileText, color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
    { Icon: Clock, color: "text-cyan-500", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
];

/**
 * Calcula la posición 3D de un nodo en la hélice
 */
function getHelixPosition(index: number, totalNodes: number, isRightStrand: boolean) {
    const progress = index / totalNodes;
    const angle = progress * Math.PI * 2 * HELIX_CONFIG.turns;
    const strandOffset = isRightStrand ? Math.PI : 0; // Las cadenas están en lados opuestos

    return {
        /** Posición vertical como porcentaje */
        y: progress * 100,
        /** Ángulo inicial para la animación */
        startAngle: angle + strandOffset,
    };
}

/**
 * Componente de un nodo de la hélice con efecto 3D real
 */
function HelixNode({
    index,
    isRightStrand,
    iconData,
}: {
    index: number;
    isRightStrand: boolean;
    iconData: DNAIcon;
}) {
    const { Icon, color, bgColor } = iconData;
    const { y, startAngle } = getHelixPosition(index, HELIX_CONFIG.nodeCount, isRightStrand);
    const baseDelay = index * 0.1;

    // Animación de rotación 3D usando keyframes
    const xKeyframes: number[] = [];
    const scaleKeyframes: number[] = [];
    const opacityKeyframes: number[] = [];

    // Genera 60 frames para una animación más suave
    for (let i = 0; i <= 60; i++) {
        const frame = i / 60;
        const angle = startAngle + frame * Math.PI * 2;
        const x = Math.sin(angle) * HELIX_CONFIG.radius;
        const z = Math.cos(angle); // -1 a 1 para simular profundidad

        xKeyframes.push(x);
        // Escala basada en profundidad (más pequeño cuando está "atrás")
        scaleKeyframes.push(0.7 + (z + 1) * 0.25);
        // Opacidad basada en profundidad (más tenue cuando está "atrás")
        opacityKeyframes.push(0.5 + (z + 1) * 0.25);
    }

    return (
        <motion.div
            className="absolute flex items-center justify-center"
            style={{
                top: `${y}%`,
                left: "50%",
                marginLeft: "-24px", // Centrar el nodo
                marginTop: "-24px",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: opacityKeyframes,
                scale: scaleKeyframes,
                x: xKeyframes,
            }}
            transition={{
                opacity: {
                    delay: baseDelay,
                    duration: HELIX_CONFIG.rotationDuration,
                    repeat: Infinity,
                    ease: "linear"
                },
                scale: {
                    delay: baseDelay,
                    duration: HELIX_CONFIG.rotationDuration,
                    repeat: Infinity,
                    ease: "linear"
                },
                x: {
                    delay: baseDelay,
                    duration: HELIX_CONFIG.rotationDuration,
                    repeat: Infinity,
                    ease: "linear"
                },
            }}
        >
            <div className={`
        p-3 md:p-4 rounded-2xl 
        ${bgColor}
        shadow-lg shadow-black/10 dark:shadow-black/30
        border border-white/50 dark:border-white/10
        backdrop-blur-sm
        transform-gpu
        transition-transform hover:scale-110
      `}>
                <Icon className={`h-6 w-6 md:h-7 md:w-7 ${color}`} />
            </div>
        </motion.div>
    );
}

/**
 * Línea conectora entre las dos cadenas de la hélice
 * Diseño premium con centrado perfecto y efecto de profundidad
 */
function HelixConnector({ index }: { index: number }) {
    const progress = index / HELIX_CONFIG.nodeCount;
    const y = progress * 100;
    const baseDelay = index * 0.1;

    // La línea pulsa con la hélice para simular profundidad
    const opacityKeyframes: number[] = [];
    const scaleXKeyframes: number[] = [];

    for (let i = 0; i <= 60; i++) {
        const frame = i / 60;
        const angle = (progress * Math.PI * 2 * HELIX_CONFIG.turns) + frame * Math.PI * 2;
        const z = Math.cos(angle);

        // Opacidad y escala basada en profundidad (más visible cuando está "al frente")
        opacityKeyframes.push(0.3 + (z + 1) * 0.35);
        scaleXKeyframes.push(0.7 + (z + 1) * 0.15);
    }

    return (
        <motion.div
            className="absolute left-1/2 h-[3px] md:h-[4px] rounded-full origin-center"
            style={{
                top: `${y}%`,
                marginLeft: "-110px",
                width: "220px",
                background: `linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(14, 165, 233, 0.5) 20%, 
                    rgba(139, 92, 246, 0.8) 50%,
                    rgba(14, 165, 233, 0.5) 80%, 
                    transparent 100%)`,
                boxShadow: `0 0 8px rgba(139, 92, 246, 0.3)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
                scaleX: scaleXKeyframes,
                opacity: opacityKeyframes,
            }}
            transition={{
                scaleX: { delay: baseDelay, duration: HELIX_CONFIG.rotationDuration, repeat: Infinity, ease: "linear" },
                opacity: { delay: baseDelay, duration: HELIX_CONFIG.rotationDuration, repeat: Infinity, ease: "linear" },
            }}
        />
    );
}

/**
 * Partícula flotante decorativa
 */
function FloatingParticle({ index }: { index: number }) {
    // Posiciones aleatorias pero consistentes
    const positions = [
        { x: 15, y: 20 },
        { x: 85, y: 35 },
        { x: 25, y: 55 },
        { x: 75, y: 70 },
        { x: 50, y: 85 },
        { x: 10, y: 45 },
        { x: 90, y: 60 },
    ];

    const pos = positions[index % positions.length];
    const size = 4 + (index % 3) * 2;

    return (
        <motion.div
            className="absolute rounded-full bg-primary/40"
            style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: size,
                height: size,
            }}
            animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.3, 0.8],
            }}
            transition={{
                duration: 4 + index * 0.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
            }}
        />
    );
}

/**
 * Visual principal: Doble Hélice de ADN Premium con iconos de salud
 */
export function DNAHelixVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Glow background principal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="w-[420px] h-[580px] bg-gradient-to-b from-indigo-500/25 via-purple-500/20 to-pink-500/25 rounded-full blur-[80px]"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    }}
                />
            </div>

            {/* Secondary glow orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px]"
                animate={{
                    x: [-20, 20, -20],
                    y: [-10, 10, -10],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-[50px]"
                animate={{
                    x: [20, -20, 20],
                    y: [10, -10, 10],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* DNA Helix Container - Ancho aumentado para mayor impacto visual */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative w-[320px] md:w-[400px] lg:w-[440px] h-[500px] md:h-[580px] transform-gpu"
                style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                }}
            >
                {/* Vertical backbone lines with glow */}
                <motion.div
                    className="absolute left-[20%] top-[2%] bottom-[2%] w-[3px] rounded-full bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute right-[20%] top-[2%] bottom-[2%] w-[3px] rounded-full bg-gradient-to-b from-transparent via-secondary/50 to-transparent shadow-[0_0_10px_rgba(var(--secondary),0.3)]"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />

                {/* Horizontal connectors */}
                {Array.from({ length: HELIX_CONFIG.nodeCount }).map((_, i) => (
                    <HelixConnector key={`conn-${i}`} index={i} />
                ))}

                {/* Left strand nodes */}
                {dnaIcons.slice(0, HELIX_CONFIG.nodeCount).map((icon, i) => (
                    <HelixNode
                        key={`left-${i}`}
                        index={i}
                        isRightStrand={false}
                        iconData={icon}
                    />
                ))}

                {/* Right strand nodes (offset by half) */}
                {dnaIcons.slice(0, HELIX_CONFIG.nodeCount).map((icon, i) => (
                    <HelixNode
                        key={`right-${i}`}
                        index={i}
                        isRightStrand={true}
                        iconData={dnaIcons[(i + 5) % dnaIcons.length]}
                    />
                ))}

                {/* Floating particles */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <FloatingParticle key={`particle-${i}`} index={i} />
                ))}
            </motion.div>

            {/* Bottom Label - Reposicionada fuera del área del ADN para mejor visibilidad */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-center z-20"
            >
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
                        La Salud en Nuestro Código
                    </span>
                </div>
            </motion.div>

            {/* Floating stat cards */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-4 md:right-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-foreground">ADN Digital</div>
                        <div className="text-xs text-muted-foreground">Tecnología Humana</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-24 left-4 md:left-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-border/50 backdrop-blur-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                        <Zap className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-foreground">Innovación</div>
                        <div className="text-xs text-muted-foreground">Hecha en 🇻🇪</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
