/**
 * @file tasks-widget.tsx
 * @description Widget de tareas pendientes del médico con datos de Supabase.
 * Permite crear tareas con prioridad y fecha límite, completar, filtrar y eliminar.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckSquare,
    Plus,
    Check,
    Trash2,
    Clock,
    AlertCircle,
    AlertTriangle,
    Zap,
    Loader2,
    X,
    Calendar,
    ChevronRight,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
    createTask,
    toggleTaskComplete,
    deleteTask,
} from "@/lib/supabase/services/dashboard-preferences-service";
import type { DoctorTask, TaskPriority } from "@/lib/types/dashboard-types";

// ============================================================================
// TIPOS
// ============================================================================

interface TasksWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

/** Tipo de filtro rápido */
type QuickFilter = 'all' | 'today' | 'week' | 'urgent';

// ============================================================================
// CONSTANTES Y HELPERS
// ============================================================================

/** Configuración de prioridades con iconos distintivos */
const PRIORITY_CONFIG: Record<TaskPriority, {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    hoverBg: string;
    icon: typeof Clock;
    description: string;
}> = {
    low: {
        label: "Baja",
        shortLabel: "Baja",
        color: "text-slate-500",
        bgColor: "bg-slate-100 dark:bg-slate-800",
        hoverBg: "hover:bg-slate-200 dark:hover:bg-slate-700",
        icon: Clock,
        description: "Sin prisa",
    },
    medium: {
        label: "Media",
        shortLabel: "Media",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/50",
        hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-800",
        icon: AlertCircle,
        description: "Normal",
    },
    high: {
        label: "Alta",
        shortLabel: "Alta",
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/50",
        hoverBg: "hover:bg-orange-200 dark:hover:bg-orange-800",
        icon: AlertTriangle,
        description: "Importante",
    },
    urgent: {
        label: "Urgente",
        shortLabel: "Urgente",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/50",
        hoverBg: "hover:bg-red-200 dark:hover:bg-red-800",
        icon: Zap,
        description: "¡Ahora!",
    },
};

/** Orden de prioridades para ordenamiento */
const PRIORITY_ORDER: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
};

/** Opciones rápidas de fecha */
const QUICK_DATES = [
    { label: "Hoy", getValue: () => new Date() },
    { label: "Mañana", getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { label: "Esta semana", getValue: () => { const d = new Date(); d.setDate(d.getDate() + (5 - d.getDay())); return d; } },
    { label: "Próxima semana", getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
];

/**
 * Parsea una fecha string (YYYY-MM-DD) como hora LOCAL, no UTC.
 * Esto evita el bug donde "2025-12-30" se interpreta como UTC y
 * resulta en "2025-12-29" en zonas horarias negativas.
 */
function parseLocalDate(dateString: string): Date {
    // Forzar interpretación local agregando T00:00:00 sin Z
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Verifica si una tarea está vencida
 */
function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseLocalDate(dueDate);
    return due < today;
}

/**
 * Verifica si la fecha límite es hoy
 */
function isDueToday(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = parseLocalDate(dueDate);
    return today.toDateString() === due.toDateString();
}

/**
 * Verifica si la fecha límite es esta semana
 */
function isDueThisWeek(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = parseLocalDate(dueDate);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (7 - today.getDay()));
    return due <= weekEnd && due >= today;
}

/**
 * Formatea una fecha para mostrar
 */
function formatDueDate(dueDate: string | null): string {
    if (!dueDate) return "";
    const date = parseLocalDate(dueDate);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return "Hoy";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return "Mañana";
    }

    return date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

/**
 * Formatea fecha para input type="date"
 */
function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Selector de prioridad mejorado con iconos grandes y labels
 */
function PrioritySelector({
    value,
    onChange,
}: {
    value: TaskPriority;
    onChange: (priority: TaskPriority) => void;
}) {
    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

    return (
        <div className="grid grid-cols-4 gap-1.5">
            {priorities.map((p) => {
                const config = PRIORITY_CONFIG[p];
                const isSelected = value === p;
                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all border-2",
                            isSelected
                                ? `${config.bgColor} ${config.color} border-current`
                                : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                        )}
                        title={config.description}
                    >
                        <config.icon className="h-4 w-4" />
                        <span className="text-[10px] font-medium">{config.shortLabel}</span>
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Selector de fecha mejorado con opciones rápidas
 */
function DateSelector({
    value,
    onChange,
}: {
    value: string;
    onChange: (date: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleQuickDate = (date: Date) => {
        onChange(formatDateForInput(date));
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setIsOpen(false);
    };

    const displayValue = value ? formatDueDate(value) : null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                        value
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/30 border-muted text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <Calendar className="h-4 w-4" />
                    <span>{displayValue || "Fecha límite"}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-2">
                    {/* Opciones rápidas */}
                    <div className="space-y-1">
                        {QUICK_DATES.map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => handleQuickDate(option.getValue())}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
                            >
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="border-t pt-2">
                        {/* Selector de fecha manual */}
                        <Input
                            type="date"
                            value={value}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-sm"
                        />
                    </div>

                    {value && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground"
                            onClick={handleClear}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Sin fecha límite
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Formulario mejorado para nueva tarea
 */
function NewTaskForm({
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    onSubmit: (title: string, priority: TaskPriority, dueDate: string) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit(title.trim(), priority, dueDate);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
        >
            {/* Título */}
            <Input
                ref={inputRef}
                placeholder="¿Qué necesitas hacer?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-10 text-sm bg-background"
                autoFocus
                disabled={isSubmitting}
            />

            {/* Prioridad */}
            <div>
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 block font-medium">
                    Prioridad
                </label>
                <PrioritySelector value={priority} onChange={setPriority} />
            </div>

            {/* Fecha y acciones */}
            <div className="flex items-center justify-between gap-2">
                <DateSelector value={dueDate} onChange={setDueDate} />

                <div className="flex gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="h-9 px-3"
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!title.trim() || isSubmitting}
                        className="h-9 px-4 gap-1.5"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Agregar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Item de tarea individual
 */
function TaskItem({
    task,
    onToggle,
    onDelete,
    index
}: {
    task: DoctorTask;
    onToggle: (taskId: string, currentState: boolean) => void;
    onDelete: (taskId: string) => void;
    index: number;
}) {
    const config = PRIORITY_CONFIG[task.priority];
    const overdue = isOverdue(task.due_date);
    const dueToday = isDueToday(task.due_date);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, height: 0 }}
            transition={{ delay: index * 0.02 }}
            className={cn(
                "flex items-center gap-2 p-2 rounded-lg group",
                "bg-muted/30 hover:bg-muted/50 transition-colors",
                overdue && !task.is_completed && "bg-red-500/5 border border-red-500/20"
            )}
        >
            {/* Checkbox */}
            <button
                className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all flex-shrink-0",
                    task.is_completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                )}
                onClick={() => onToggle(task.id, task.is_completed)}
            >
                {task.is_completed && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        "text-xs truncate",
                        task.is_completed && "line-through text-muted-foreground"
                    )}
                >
                    {task.title}
                </p>
                {task.due_date && !task.is_completed && (
                    <div className={cn(
                        "flex items-center gap-1 mt-0.5",
                        overdue ? "text-red-500" : dueToday ? "text-orange-500" : "text-muted-foreground"
                    )}>
                        <Calendar className="h-2.5 w-2.5" />
                        <span className="text-[10px]">
                            {overdue ? "Vencida" : formatDueDate(task.due_date)}
                        </span>
                    </div>
                )}
            </div>

            {/* Priority indicator */}
            <div
                className={cn(
                    "flex items-center justify-center w-5 h-5 rounded flex-shrink-0",
                    config.bgColor,
                    config.color
                )}
                title={config.label}
            >
                <config.icon className="h-3 w-3" />
            </div>

            {/* Delete button */}
            <button
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => onDelete(task.id)}
            >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
            </button>
        </motion.div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de tareas pendientes mejorado.
 * Permite crear tareas con prioridad y fecha límite, filtrar y gestionar.
 * 
 * @example
 * <TasksWidget doctorId="uuid-del-doctor" />
 */
export function TasksWidget({
    doctorId,
    isDragging,
}: TasksWidgetProps) {
    const router = useRouter();

    // Estado local
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeFilter, setActiveFilter] = useState<QuickFilter>("all");

    // Datos del dashboard
    const { tasks, isLoading, refresh } = useDashboardData(doctorId);

    // Filtrar y ordenar tareas
    const filteredTasks = useMemo(() => {
        let filtered = tasks.filter((t) => !t.is_completed);

        // Aplicar filtro activo
        switch (activeFilter) {
            case 'today':
                filtered = filtered.filter((t) => isDueToday(t.due_date));
                break;
            case 'week':
                filtered = filtered.filter((t) => isDueThisWeek(t.due_date));
                break;
            case 'urgent':
                filtered = filtered.filter((t) => t.priority === 'urgent' || t.priority === 'high');
                break;
        }

        // Ordenar: vencidas primero, luego por prioridad, luego por fecha
        return filtered.sort((a, b) => {
            // Vencidas primero
            const aOverdue = isOverdue(a.due_date);
            const bOverdue = isOverdue(b.due_date);
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            // Luego por prioridad
            const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Luego por fecha límite
            if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date) return -1;
            if (b.due_date) return 1;

            return 0;
        });
    }, [tasks, activeFilter]);

    // Estadísticas rápidas
    const stats = useMemo(() => {
        const pending = tasks.filter((t) => !t.is_completed);
        return {
            total: pending.length,
            overdue: pending.filter((t) => isOverdue(t.due_date)).length,
            urgent: pending.filter((t) => t.priority === 'urgent' || t.priority === 'high').length,
        };
    }, [tasks]);

    // Handler para agregar tarea
    const handleAddTask = useCallback(async (title: string, priority: TaskPriority, dueDate: string) => {
        if (!doctorId) return;

        setIsSubmitting(true);
        try {
            await createTask(doctorId, {
                title,
                priority,
                due_date: dueDate || undefined,
            });
            setIsAdding(false);
            refresh();
        } catch (error) {
            console.error("[TasksWidget] Error creating task:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [doctorId, refresh]);

    // Handler para completar tarea
    const handleToggleComplete = useCallback(
        async (taskId: string, currentState: boolean) => {
            try {
                await toggleTaskComplete(taskId, !currentState);
                refresh();
            } catch (error) {
                console.error("[TasksWidget] Error toggling task:", error);
            }
        },
        [refresh]
    );

    // Handler para eliminar tarea
    const handleDelete = useCallback(
        async (taskId: string) => {
            try {
                await deleteTask(taskId);
                refresh();
            } catch (error) {
                console.error("[TasksWidget] Error deleting task:", error);
            }
        },
        [refresh]
    );

    // Navegar a página de tareas
    const handleViewAll = useCallback(() => {
        router.push("/dashboard/medico/tareas");
    }, [router]);

    return (
        <WidgetWrapper
            id="tasks"
            title="Tareas"
            icon={<CheckSquare className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {/* Estado de carga */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header con estadísticas y acciones */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">
                                    {stats.total} pendientes
                                </Badge>
                                {stats.overdue > 0 && (
                                    <Badge variant="destructive" className="text-[10px]">
                                        {stats.overdue} vencidas
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={handleViewAll}
                                    title="Ver todas las tareas"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs gap-1"
                                    onClick={() => setIsAdding(true)}
                                >
                                    <Plus className="h-3 w-3" />
                                    Nueva
                                </Button>
                            </div>
                        </div>

                        {/* Filtros rápidos */}
                        <div className="flex gap-1">
                            {[
                                { id: 'all' as QuickFilter, label: 'Todas' },
                                { id: 'today' as QuickFilter, label: 'Hoy' },
                                { id: 'week' as QuickFilter, label: 'Semana' },
                                { id: 'urgent' as QuickFilter, label: 'Urgentes' },
                            ].map((filter) => (
                                <Button
                                    key={filter.id}
                                    variant={activeFilter === filter.id ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "h-6 text-[10px] px-2",
                                        activeFilter === filter.id && "bg-primary/90"
                                    )}
                                    onClick={() => setActiveFilter(filter.id)}
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </div>

                        {/* Formulario para nueva tarea */}
                        <AnimatePresence>
                            {isAdding && (
                                <NewTaskForm
                                    onSubmit={handleAddTask}
                                    onCancel={() => setIsAdding(false)}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </AnimatePresence>

                        {/* Lista de tareas */}
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                            <AnimatePresence mode="popLayout">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.slice(0, 6).map((task, index) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onToggle={handleToggleComplete}
                                            onDelete={handleDelete}
                                            index={index}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">
                                            {activeFilter !== 'all'
                                                ? "Sin tareas en este filtro"
                                                : "No hay tareas pendientes"}
                                        </p>
                                        {activeFilter === 'all' && (
                                            <Button
                                                variant="link"
                                                className="text-xs mt-1"
                                                onClick={() => setIsAdding(true)}
                                            >
                                                Agregar una tarea
                                            </Button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Botón para ver todas */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5 mt-2"
                            onClick={handleViewAll}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver todas las tareas
                            {stats.total > 0 && (
                                <Badge variant="secondary" className="ml-1 text-[10px]">
                                    {stats.total}
                                </Badge>
                            )}
                        </Button>
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
