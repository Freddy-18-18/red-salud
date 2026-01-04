/**
 * @file monthly-goals-widget.tsx
 * @description Widget de metas mensuales del médico.
 * Permite configurar objetivos y visualizar el progreso.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    ChevronRight,
    Loader2,
    CheckCircle,
    Plus,
    Edit,
    Calendar,
    Users,
    DollarSign,
    Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TIPOS
// ============================================================================

interface MonthlyGoalsWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface Goal {
    /** ID de la meta */
    id: string;
    /** Tipo de meta */
    type: "appointments" | "patients" | "revenue" | "rating";
    /** Etiqueta personalizada */
    label: string;
    /** Valor objetivo */
    target: number;
    /** Valor actual */
    current: number;
    /** Porcentaje completado */
    percentage: number;
    /** Ícono */
    icon: React.ReactNode;
    /** Color de la barra de progreso */
    color: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const goalTypeConfig = {
    appointments: {
        label: "Citas del mes",
        icon: <Calendar className="h-3 w-3" />,
        color: "bg-blue-500",
        progressColor: "bg-blue-500"
    },
    patients: {
        label: "Nuevos pacientes",
        icon: <Users className="h-3 w-3" />,
        color: "bg-emerald-500",
        progressColor: "bg-emerald-500"
    },
    revenue: {
        label: "Ingresos",
        icon: <DollarSign className="h-3 w-3" />,
        color: "bg-amber-500",
        progressColor: "bg-amber-500"
    },
    rating: {
        label: "Calificación promedio",
        icon: <Star className="h-3 w-3" />,
        color: "bg-purple-500",
        progressColor: "bg-purple-500"
    }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de metas mensuales.
 * Permite configurar y visualizar objetivos del mes.
 * 
 * @example
 * <MonthlyGoalsWidget doctorId="uuid-del-doctor" />
 */
export function MonthlyGoalsWidget({
    doctorId,
    isDragging
}: MonthlyGoalsWidgetProps) {
    const { stats, appointments, isLoading } = useDashboardData(doctorId);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [targetValue, setTargetValue] = useState("");

    // Cargar metas guardadas
    useEffect(() => {
        const loadGoals = async () => {
            if (!doctorId) return;

            try {
                // Intentar cargar metas de Supabase para el mes actual
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                const { data, error } = await supabase
                    .from("doctor_goals")
                    .select("*")
                    .eq("doctor_id", doctorId)
                    .eq("year", year)
                    .eq("month", month)
                    .single();

                if (!error && data) {
                    // Mapear el registro único a nuestro array de metas
                    const loadedGoals: Goal[] = [
                        {
                            id: "appointments",
                            type: "appointments",
                            target: data.target_appointments || 0,
                            current: 0,
                            percentage: 0,
                            ...goalTypeConfig.appointments
                        },
                        {
                            id: "patients",
                            type: "patients",
                            target: data.target_new_patients || 0,
                            current: 0,
                            percentage: 0,
                            ...goalTypeConfig.patients
                        },
                        {
                            id: "revenue",
                            type: "revenue",
                            target: data.target_revenue || 0,
                            current: 0,
                            percentage: 0,
                            ...goalTypeConfig.revenue
                        },
                        {
                            id: "rating",
                            type: "rating",
                            target: data.target_rating || 0,
                            current: 0,
                            percentage: 0,
                            ...goalTypeConfig.rating
                        }
                    ];
                    setGoals(loadedGoals);
                }
            } catch (err) {
                console.error("[MonthlyGoals] Error loading goals:", err);
            }
        };

        loadGoals();
    }, [doctorId]);

    // Calcular valores actuales de las metas
    useEffect(() => {
        if (isLoading || !stats) return;

        // Calcular métricas del mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthAppointments = appointments?.filter((apt: any) => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= startOfMonth && apt.status === "completed";
        }).length || 0;

        // Valor de muestra para ingresos (se puede conectar a billing real)
        const monthRevenue = monthAppointments * 50; // Estimación básica

        // Generar metas por defecto (0 si no hay guardadas)
        const defaultGoals: Goal[] = [
            {
                id: "appointments",
                type: "appointments",
                label: goalTypeConfig.appointments.label,
                target: 0,
                current: monthAppointments,
                percentage: 0,
                icon: goalTypeConfig.appointments.icon,
                color: goalTypeConfig.appointments.progressColor
            },
            {
                id: "patients",
                type: "patients",
                label: goalTypeConfig.patients.label,
                target: 0,
                current: 0, // TODO: Calcular nuevos pacientes reales
                percentage: 0,
                icon: goalTypeConfig.patients.icon,
                color: goalTypeConfig.patients.progressColor
            },
            {
                id: "revenue",
                type: "revenue",
                label: goalTypeConfig.revenue.label,
                target: 0,
                current: 0, // Revenue en 0 por defecto
                percentage: 0,
                icon: goalTypeConfig.revenue.icon,
                color: goalTypeConfig.revenue.progressColor
            },
            {
                id: "rating",
                type: "rating",
                label: goalTypeConfig.rating.label,
                target: 0,
                current: stats.averageRating || 0,
                percentage: 0,
                icon: goalTypeConfig.rating.icon,
                color: goalTypeConfig.rating.progressColor
            }
        ];

        // Si ya cargamos metas de Supabase, combinar con los valores actuales calculados
        setGoals(prev => {
            if (prev.length === 0) return defaultGoals;

            // Mantener targets cargados de Supabase, actualizar currents calculados
            return prev.map(savedGoal => {
                const calculated = defaultGoals.find(dg => dg.type === savedGoal.type);
                if (calculated) {
                    const percentage = savedGoal.target > 0
                        ? Math.min(100, Math.round((calculated.current / savedGoal.target) * 100))
                        : 0;
                    return { ...savedGoal, current: calculated.current, percentage };
                }
                return savedGoal;
            });
        });

    }, [stats, appointments, isLoading]);

    // Handler para guardar meta
    const handleSaveGoal = async () => {
        if (!editingGoal || !targetValue || !doctorId) return;

        const newTarget = parseFloat(targetValue);
        if (isNaN(newTarget) || newTarget < 0) return;

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            // Mapear tipo de meta a columna de base de datos
            const columnMap: Record<string, string> = {
                appointments: 'target_appointments',
                patients: 'target_new_patients',
                revenue: 'target_revenue',
                rating: 'target_rating'
            };

            const columnName = columnMap[editingGoal.type];

            // 1. Obtener registro actual si existe
            const { data: existing } = await supabase
                .from('doctor_goals')
                .select('*')
                .eq('doctor_id', doctorId)
                .eq('year', year)
                .eq('month', month)
                .single();

            const upsertData = {
                doctor_id: doctorId,
                year,
                month,
                [columnName]: newTarget,
                // Mantener otros valores si existen
                ...(existing ? {} : {
                    target_appointments: 0,
                    target_new_patients: 0,
                    target_revenue: 0,
                    target_rating: 0
                })
            };

            // 2. Guardar en Supabase
            const { error } = await supabase
                .from('doctor_goals')
                .upsert(upsertData, { onConflict: 'doctor_id,year,month' });

            if (error) throw error;

            // 3. Actualizar estado local
            setGoals(prev => prev.map(g => {
                if (g.id === editingGoal.id) {
                    const newPercentage = newTarget > 0
                        ? Math.min(100, Math.round((g.current / newTarget) * 100))
                        : 0;
                    return { ...g, target: newTarget, percentage: newPercentage };
                }
                return g;
            }));

            setIsDialogOpen(false);
            setEditingGoal(null);
            setTargetValue("");

        } catch (error) {
            console.error('[MonthlyGoals] Error saving goal:', error);
            // Aquí podrías mostrar un toast de error
        }
    };

    // Calcular progreso general
    const overallProgress = useMemo(() => {
        if (goals.length === 0) return 0;
        return Math.round(goals.reduce((acc, g) => acc + g.percentage, 0) / goals.length);
    }, [goals]);

    // Metas completadas
    const completedGoals = goals.filter(g => g.percentage >= 100).length;

    // Obtener nombre del mes actual
    const currentMonth = new Date().toLocaleDateString("es-ES", { month: "long" });

    return (
        <WidgetWrapper
            id="monthly-goals"
            title={`Metas de ${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}`}
            icon={<Target className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header con progreso general */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-[10px] gap-1",
                                        overallProgress >= 100 && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    )}
                                >
                                    <TrendingUp className="h-2.5 w-2.5" />
                                    {overallProgress}% completado
                                </Badge>
                            </div>
                            {completedGoals > 0 && (
                                <Badge
                                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-1"
                                >
                                    <CheckCircle className="h-2.5 w-2.5" />
                                    {completedGoals}/{goals.length}
                                </Badge>
                            )}
                        </div>

                        {/* Lista de metas */}
                        <div className="space-y-2">
                            {goals.map((goal, index) => {
                                const isComplete = goal.percentage >= 100;

                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "p-2 rounded-lg",
                                            "bg-muted/30 hover:bg-muted/50 transition-colors",
                                            isComplete && "bg-emerald-500/5 ring-1 ring-emerald-500/20"
                                        )}
                                    >
                                        {/* Encabezado de la meta */}
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn(
                                                    "p-1 rounded",
                                                    isComplete ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {goal.icon}
                                                </div>
                                                <span className="text-xs font-medium">{goal.label}</span>
                                            </div>
                                            <Dialog open={isDialogOpen && editingGoal?.id === goal.id} onOpenChange={(open) => {
                                                setIsDialogOpen(open);
                                                if (!open) setEditingGoal(null);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                                        onClick={() => {
                                                            setEditingGoal(goal);
                                                            setTargetValue(goal.target.toString());
                                                        }}
                                                    >
                                                        <Edit className="h-2.5 w-2.5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Editar meta: {goal.label}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="target">Valor objetivo</Label>
                                                            <Input
                                                                id="target"
                                                                type="number"
                                                                value={targetValue}
                                                                onChange={(e) => setTargetValue(e.target.value)}
                                                                placeholder={goal.target.toString()}
                                                            />
                                                        </div>
                                                        <Button onClick={handleSaveGoal}>
                                                            Guardar
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Barra de progreso */}
                                        <div className="space-y-1">
                                            <Progress
                                                value={goal.percentage}
                                                className={cn(
                                                    "h-1.5",
                                                    isComplete && "[&>div]:bg-emerald-500"
                                                )}
                                            />
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>
                                                    {goal.type === "revenue"
                                                        ? `$${goal.current.toLocaleString()}`
                                                        : goal.type === "rating"
                                                            ? goal.current.toFixed(1)
                                                            : goal.current
                                                    }
                                                </span>
                                                <span className={cn(
                                                    "font-medium",
                                                    isComplete && "text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                    {goal.percentage}%
                                                </span>
                                                <span>
                                                    {goal.type === "revenue"
                                                        ? `$${goal.target.toLocaleString()}`
                                                        : goal.type === "rating"
                                                            ? goal.target.toFixed(1)
                                                            : goal.target
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Mensaje motivacional */}
                        {overallProgress >= 100 ? (
                            <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    🎉 ¡Felicidades! Has completado todas tus metas
                                </p>
                            </div>
                        ) : overallProgress >= 75 ? (
                            <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    ¡Casi lo logras! Sigue así 💪
                                </p>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
