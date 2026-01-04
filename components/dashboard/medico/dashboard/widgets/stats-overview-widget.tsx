/**
 * @file stats-overview-widget.tsx
 * @description Widget de estadísticas con datos reales del dashboard.
 * Muestra métricas clave como citas del día, pacientes totales, y calificación.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Users,
    CheckCircle2,
    Star,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface StatCardProps {
    /** Título de la métrica */
    title: string;
    /** Valor a mostrar */
    value: number | string;
    /** Ícono del stat */
    icon: React.ReactNode;
    /** Tendencia respecto al período anterior (porcentaje) */
    trend?: number;
    /** Sufijo del valor (ej: "/5") */
    suffix?: string;
    /** Color del ícono y glow (clases de Tailwind) */
    color: string;
    /** Delay de animación */
    delay?: number;
    /** Si está cargando */
    isLoading?: boolean;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Contador animado para valores numéricos.
 */
function AnimatedCounter({
    value,
    duration = 1500
}: {
    value: number;
    duration?: number
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{count}</span>;
}

/**
 * Tarjeta individual de estadística.
 */
function StatCard({
    title,
    value,
    icon,
    trend,
    suffix,
    color,
    delay = 0,
    isLoading = false
}: StatCardProps) {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const displayValue = typeof value === 'string' && value.includes('.') ? value : undefined;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delay * 0.1, duration: 0.4, type: "spring" }}
            className={cn(
                "relative overflow-hidden rounded-xl p-4",
                "bg-gradient-to-br from-muted/50 to-muted/20 dark:from-white/15 dark:to-white/8", // Mejor contraste dark
                "border border-border/30 dark:border-white/15", // Borde sutil pero visible
                "hover:shadow-lg transition-all duration-300",
                "group"
            )}
        >
            {/* Background Gradient Glow */}
            <div
                className={cn(
                    "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity",
                    "dark:opacity-40 dark:group-hover:opacity-60",
                    color
                )}
            />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-1">
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <span className="text-2xl font-bold text-foreground dark:text-white">
                                    {displayValue ?? <AnimatedCounter value={numericValue} />}
                                </span>
                                {suffix && (
                                    <span className="text-sm text-muted-foreground">{suffix}</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Trend indicator */}
                    {trend !== undefined && !isLoading && (
                        <div className="flex items-center gap-1">
                            {trend > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : trend < 0 ? (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            ) : (
                                <Minus className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    trend > 0 && "text-green-500",
                                    trend < 0 && "text-red-500",
                                    trend === 0 && "text-muted-foreground"
                                )}
                            >
                                {trend > 0 ? '+' : ''}{trend}% vs ayer
                            </span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl",
                    "bg-gradient-to-br",
                    color
                )}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// TIPOS DEL COMPONENTE PRINCIPAL
// ============================================================================

interface StatsOverviewWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Stats externos (opcional, para compatibilidad) */
    stats?: {
        todayAppointments?: number;
        totalPatients?: number;
        completedAppointments?: number;
        averageRating?: number;
    };
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de estadísticas generales.
 * Muestra métricas clave del médico en cards animadas.
 * 
 * @example
 * <StatsOverviewWidget doctorId="uuid-del-doctor" />
 */
export function StatsOverviewWidget({
    doctorId,
    stats: externalStats,
    isDragging
}: StatsOverviewWidgetProps) {
    // Obtener datos reales del dashboard
    const { stats, isLoading } = useDashboardData(doctorId);

    // Usar stats externos si se proporcionan, sino usar los del hook
    const displayStats = externalStats || stats;

    // TODO: Calcular tendencias reales comparando con datos históricos
    // Por ahora usamos valores placeholder que se pueden actualizar
    const statCards = [
        {
            title: "Citas Hoy",
            value: displayStats?.todayAppointments || 0,
            icon: <Calendar className="h-5 w-5 text-white" />,
            trend: undefined, // Se puede calcular comparando con ayer
            color: "from-blue-500 to-blue-600",
        },
        {
            title: "Pacientes Totales",
            value: displayStats?.totalPatients || 0,
            icon: <Users className="h-5 w-5 text-white" />,
            trend: undefined,
            color: "from-emerald-500 to-emerald-600",
        },
        {
            title: "Consultas Mes",
            value: displayStats?.completedAppointments || 0,
            icon: <CheckCircle2 className="h-5 w-5 text-white" />,
            trend: undefined,
            color: "from-violet-500 to-violet-600",
        },
        {
            title: "Calificación",
            value: displayStats?.averageRating?.toFixed(1) || "0.0",
            icon: <Star className="h-5 w-5 text-white" />,
            suffix: "/5",
            color: "from-amber-500 to-amber-600",
        },
    ];

    return (
        <WidgetWrapper
            id="stats-overview"
            title="Estadísticas"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, index) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                        delay={index}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </WidgetWrapper>
    );
}
