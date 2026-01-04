/**
 * @file satisfaction-metrics-widget.tsx
 * @description Widget de métricas de satisfacción del paciente.
 * Muestra calificación promedio, tendencias y reviews recientes.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Star,
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Loader2,
    Minus,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetWrapper } from "../widget-wrapper";
import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TIPOS
// ============================================================================

interface SatisfactionMetricsWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface ReviewData {
    /** ID de la review */
    id: string;
    /** Calificación 1-5 */
    rating: number;
    /** Comentario opcional */
    comment?: string;
    /** Fecha de la review */
    created_at: string;
    /** Nombre del paciente */
    patient_name?: string;
}

interface SatisfactionStats {
    /** Promedio de calificaciones */
    average: number;
    /** Total de reviews */
    total: number;
    /** Distribución por estrellas */
    distribution: { stars: number; count: number; percentage: number }[];
    /** Tendencia vs mes anterior */
    trend: number;
    /** Reviews recientes */
    recentReviews: ReviewData[];
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Renderiza estrellas de calificación.
 */
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
    const sizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5"
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        sizes[size],
                        star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : star - 0.5 <= rating
                                ? "fill-amber-400/50 text-amber-400"
                                : "fill-muted text-muted"
                    )}
                />
            ))}
        </div>
    );
}

/**
 * Indicador de tendencia.
 */
function TrendIndicator({ value }: { value: number }) {
    if (value === 0) {
        return (
            <Badge variant="secondary" className="text-[10px] gap-0.5">
                <Minus className="h-2.5 w-2.5" />
                Sin cambios
            </Badge>
        );
    }

    if (value > 0) {
        return (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" />
                +{value.toFixed(1)}%
            </Badge>
        );
    }

    return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] gap-0.5">
            <TrendingDown className="h-2.5 w-2.5" />
            {value.toFixed(1)}%
        </Badge>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de métricas de satisfacción del paciente.
 * Muestra calificación promedio, distribución y tendencias.
 * 
 * @example
 * <SatisfactionMetricsWidget doctorId="uuid-del-doctor" />
 */
export function SatisfactionMetricsWidget({
    doctorId,
    isDragging
}: SatisfactionMetricsWidgetProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<SatisfactionStats | null>(null);

    // Cargar datos de reviews
    useEffect(() => {
        const loadReviews = async () => {
            if (!doctorId) {
                setIsLoading(false);
                return;
            }

            try {
                // Intentar cargar reviews reales desde la tabla ratings
                // Filtramos por doctor_id a través de la tabla consultations
                const { data: ratingsData, error } = await supabase
                    .from("ratings")
                    .select(`
                        id, 
                        rating, 
                        comment, 
                        created_at, 
                        patient:patients(full_name),
                        consultation:consultations!inner(doctor_id)
                    `)
                    .eq("consultation.doctor_id", doctorId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) {
                    console.error("[SatisfactionMetrics] Error loading ratings:", error.message);
                    setStats(generateEmptyStats());
                } else if (ratingsData && ratingsData.length > 0) {
                    // Procesar datos reales
                    const processed = processRatings(ratingsData);
                    setStats(processed);
                } else {
                    setStats(generateEmptyStats());
                }
            } catch (err) {
                console.error("[SatisfactionMetrics] Error:", err);
                setStats(generateEmptyStats());
            } finally {
                setIsLoading(false);
            }
        };

        loadReviews();
    }, [doctorId]);

    return (
        <WidgetWrapper
            id="satisfaction-metrics"
            title="Satisfacción"
            icon={<Star className="h-4 w-4 text-amber-500" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : stats ? (
                    <>
                        {/* Score principal */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="text-2xl font-bold text-foreground"
                                >
                                    {stats.average.toFixed(1)}
                                </motion.div>
                                <div className="flex flex-col">
                                    <StarRating rating={stats.average} size="sm" />
                                    <span className="text-[10px] text-muted-foreground">
                                        {stats.total} {stats.total === 1 ? "review" : "reviews"}
                                    </span>
                                </div>
                            </div>
                            <TrendIndicator value={stats.trend} />
                        </div>

                        {/* Distribución de estrellas */}
                        <div className="space-y-1.5">
                            {stats.distribution.map((item, index) => (
                                <motion.div
                                    key={item.stars}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-2 group"
                                >
                                    <span className="text-[10px] w-3 text-muted-foreground">
                                        {item.stars}
                                    </span>
                                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                    <Progress
                                        value={item.percentage}
                                        className="h-1.5 flex-1"
                                    />
                                    <span className="text-[10px] w-6 text-right text-muted-foreground">
                                        {item.count}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Reviews recientes */}
                        {stats.recentReviews.length > 0 && (
                            <div className="pt-2 border-t border-border/30 space-y-2">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>Comentarios recientes</span>
                                </div>
                                {stats.recentReviews.slice(0, 2).map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className={cn(
                                            "p-2 rounded-lg bg-muted/30",
                                            "border-l-2",
                                            review.rating >= 4 ? "border-l-emerald-500" :
                                                review.rating >= 3 ? "border-l-amber-500" : "border-l-red-500"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <StarRating rating={review.rating} size="sm" />
                                            {review.rating >= 4 ? (
                                                <ThumbsUp className="h-2.5 w-2.5 text-emerald-500" />
                                            ) : review.rating <= 2 ? (
                                                <ThumbsDown className="h-2.5 w-2.5 text-red-500" />
                                            ) : null}
                                        </div>
                                        {review.comment && (
                                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                                                "{review.comment}"
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Sin datos de satisfacción</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Procesa ratings reales de Supabase.
 */
function processRatings(ratings: any[]): SatisfactionStats {
    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = total > 0 ? sum / total : 0;

    // Distribución por estrellas
    const distribution = [5, 4, 3, 2, 1].map(stars => {
        const count = ratings.filter(r => Math.round(r.rating) === stars).length;
        return {
            stars,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        };
    });

    // Calcular tendencia (últimos 30 días vs anteriores)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentRatings = ratings.filter(r =>
        new Date(r.created_at) >= thirtyDaysAgo
    );
    const olderRatings = ratings.filter(r => {
        const date = new Date(r.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const recentAvg = recentRatings.length > 0
        ? recentRatings.reduce((acc, r) => acc + (r.rating || 0), 0) / recentRatings.length
        : average;
    const olderAvg = olderRatings.length > 0
        ? olderRatings.reduce((acc, r) => acc + (r.rating || 0), 0) / olderRatings.length
        : recentAvg;

    const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    // Reviews recientes con comentarios
    const recentReviews = ratings
        .filter(r => r.comment && r.comment.trim().length > 0)
        .slice(0, 3)
        .map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            patient_name: r.patient?.full_name || "Paciente Anónimo"
        }));

    return {
        average,
        total,
        distribution,
        trend,
        recentReviews
    };
}

/**
 * Genera estadísticas vacías cuando no hay datos.
 */
function generateEmptyStats(): SatisfactionStats {
    return {
        average: 0,
        total: 0,
        distribution: [
            { stars: 5, count: 0, percentage: 0 },
            { stars: 4, count: 0, percentage: 0 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 }
        ],
        trend: 0,
        recentReviews: []
    };
}
