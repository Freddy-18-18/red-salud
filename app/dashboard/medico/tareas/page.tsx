/**
 * @file page.tsx
 * @description Página completa de gestión de tareas del médico.
 * Permite crear, editar, filtrar y completar tareas con vista expandida.
 * 
 * @module Dashboard/Tareas
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckSquare,
    Plus,
    Search,
    Filter,
    Check,
    Trash2,
    Calendar,
    Clock,
    AlertCircle,
    AlertTriangle,
    Loader2,
    X,
    ChevronDown,
    MoreHorizontal,
    Edit2,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks, isTaskOverdue, isTaskDueToday, type TaskFilters } from "@/hooks/use-tasks";
import type { DoctorTask, TaskPriority } from "@/lib/types/dashboard-types";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

// ============================================================================
// CONSTANTES
// ============================================================================

/** Configuración de prioridades */
const PRIORITY_CONFIG: Record<TaskPriority, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Clock;
}> = {
    low: {
        label: "Baja",
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        icon: Clock,
    },
    medium: {
        label: "Media",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        icon: Clock,
    },
    high: {
        label: "Alta",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        icon: AlertCircle,
    },
    urgent: {
        label: "Urgente",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        icon: AlertTriangle,
    },
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Selector de prioridad
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
        <div className="flex gap-2">
            {priorities.map((p) => {
                const config = PRIORITY_CONFIG[p];
                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
                            value === p
                                ? `${config.bgColor} ${config.borderColor} ${config.color}`
                                : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <config.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Formatea fecha para mostrar
 */
function formatDueDate(dueDate: string | null): string {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return "Hoy";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return "Mañana";
    }

    return date.toLocaleDateString("es", { weekday: 'short', day: "numeric", month: "short" });
}

/**
 * Card de estadísticas
 */
function StatCard({
    label,
    value,
    icon: Icon,
    color = "text-primary",
}: {
    label: string;
    value: number;
    icon: typeof CheckSquare;
    color?: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className={cn("p-2 rounded-lg", color.replace('text-', 'bg-') + '/10')}>
                <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

/**
 * Item de tarea
 */
function TaskCard({
    task,
    onComplete,
    onDelete,
    onEdit,
}: {
    task: DoctorTask;
    onComplete: (taskId: string, completed: boolean) => void;
    onDelete: (taskId: string) => void;
    onEdit: (task: DoctorTask) => void;
}) {
    const config = PRIORITY_CONFIG[task.priority];
    const overdue = isTaskOverdue(task.due_date) && !task.is_completed;
    const dueToday = isTaskDueToday(task.due_date);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
                "group flex items-start gap-4 p-4 rounded-xl border transition-all",
                "hover:shadow-md hover:border-primary/30",
                task.is_completed
                    ? "bg-muted/20 border-muted"
                    : overdue
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-card border-border"
            )}
        >
            {/* Checkbox */}
            <button
                onClick={() => onComplete(task.id, !task.is_completed)}
                className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all mt-0.5 flex-shrink-0",
                    task.is_completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                )}
            >
                {task.is_completed && (
                    <Check className="h-4 w-4 text-primary-foreground" />
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3
                            className={cn(
                                "font-medium",
                                task.is_completed && "line-through text-muted-foreground"
                            )}
                        >
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                            </p>
                        )}
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(task.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-3">
                    {/* Priority badge */}
                    <Badge
                        variant="secondary"
                        className={cn("text-xs", config.bgColor, config.color)}
                    >
                        <config.icon className="h-3 w-3 mr-1" />
                        {config.label}
                    </Badge>

                    {/* Due date */}
                    {task.due_date && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs",
                                overdue
                                    ? "text-red-500 font-medium"
                                    : dueToday
                                        ? "text-orange-500"
                                        : "text-muted-foreground"
                            )}
                        >
                            <Calendar className="h-3 w-3" />
                            {overdue ? "Vencida: " : ""}
                            {formatDueDate(task.due_date)}
                        </div>
                    )}

                    {/* Completed date */}
                    {task.is_completed && task.completed_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="h-3 w-3" />
                            Completada {formatDueDate(task.completed_at)}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TareasPage() {
    // Estado de autenticación
    const [doctorId, setDoctorId] = useState<string | undefined>(undefined);
    const [authLoading, setAuthLoading] = useState(true);

    // Modal de tarea
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<DoctorTask | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hook de tareas
    const {
        filteredTasks,
        stats,
        filters,
        isLoading,
        createTask,
        updateTask,
        completeTask,
        deleteTask,
        updateFilters,
    } = useTasks(doctorId);

    // Cargar usuario
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setDoctorId(user?.id);
            setAuthLoading(false);
        };
        loadUser();
    }, []);

    // Abrir modal para nueva tarea
    const handleNewTask = useCallback(() => {
        setEditingTask(null);
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskDueDate("");
        setIsModalOpen(true);
    }, []);

    // Abrir modal para editar
    const handleEditTask = useCallback((task: DoctorTask) => {
        setEditingTask(task);
        setTaskTitle(task.title);
        setTaskDescription(task.description || "");
        setTaskPriority(task.priority);
        setTaskDueDate(task.due_date || "");
        setIsModalOpen(true);
    }, []);

    // Guardar tarea (crear o editar)
    const handleSaveTask = useCallback(async () => {
        if (!taskTitle.trim()) return;

        setIsSubmitting(true);
        try {
            let success = false;

            if (editingTask) {
                // Editar tarea existente
                success = await updateTask(editingTask.id, {
                    title: taskTitle.trim(),
                    description: taskDescription.trim() || undefined,
                    priority: taskPriority,
                    due_date: taskDueDate || undefined,
                });
            } else {
                // Crear nueva tarea
                success = await createTask({
                    title: taskTitle.trim(),
                    description: taskDescription.trim() || undefined,
                    priority: taskPriority,
                    due_date: taskDueDate || undefined,
                });
            }

            if (success) {
                setIsModalOpen(false);
                setEditingTask(null);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [taskTitle, taskDescription, taskPriority, taskDueDate, createTask, updateTask, editingTask]);

    // Tabs de estado
    const statusTabs = [
        { id: 'pending' as const, label: 'Pendientes', count: stats.pending },
        { id: 'completed' as const, label: 'Completadas', count: stats.completed },
        { id: 'all' as const, label: 'Todas', count: stats.total },
    ];

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/dashboard/medico">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <CheckSquare className="h-8 w-8 text-primary" />
                                Mis Tareas
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gestiona tus pendientes y mantén el control de tu día
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <StatCard
                            label="Pendientes"
                            value={stats.pending}
                            icon={Clock}
                            color="text-blue-500"
                        />
                        <StatCard
                            label="Para hoy"
                            value={stats.dueToday}
                            icon={Calendar}
                            color="text-orange-500"
                        />
                        <StatCard
                            label="Vencidas"
                            value={stats.overdue}
                            icon={AlertTriangle}
                            color="text-red-500"
                        />
                        <StatCard
                            label="Completadas hoy"
                            value={stats.completedToday}
                            icon={Check}
                            color="text-green-500"
                        />
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tareas..."
                            value={filters.search}
                            onChange={(e) => updateFilters({ search: e.target.value })}
                            className="pl-10"
                        />
                    </div>

                    {/* Priority filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Prioridad
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => updateFilters({ priority: 'all' })}>
                                Todas
                            </DropdownMenuItem>
                            {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                                <DropdownMenuItem
                                    key={p}
                                    onClick={() => updateFilters({ priority: p })}
                                >
                                    {PRIORITY_CONFIG[p].label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* New task button */}
                    <Button onClick={handleNewTask} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Tarea
                    </Button>
                </div>

                {/* Status tabs */}
                <div className="flex gap-2 mb-6 border-b border-border pb-2">
                    {statusTabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={filters.status === tab.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => updateFilters({ status: tab.id })}
                            className="gap-2"
                        >
                            {tab.label}
                            <Badge
                                variant={filters.status === tab.id ? "secondary" : "outline"}
                                className="text-xs"
                            >
                                {tab.count}
                            </Badge>
                        </Button>
                    ))}
                </div>

                {/* Task list */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onComplete={completeTask}
                                    onDelete={deleteTask}
                                    onEdit={handleEditTask}
                                />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <CheckSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                {filters.status === 'completed'
                                    ? "Sin tareas completadas"
                                    : filters.search
                                        ? "Sin resultados"
                                        : "¡Todo al día!"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {filters.status === 'pending' && !filters.search
                                    ? "No tienes tareas pendientes. ¡Buen trabajo!"
                                    : "Prueba con otros filtros o crea una nueva tarea"}
                            </p>
                            {filters.status === 'pending' && !filters.search && (
                                <Button onClick={handleNewTask} variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar tarea
                                </Button>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Task Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTask ? "Editar Tarea" : "Nueva Tarea"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Título *
                                </label>
                                <Input
                                    placeholder="¿Qué necesitas hacer?"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Descripción
                                </label>
                                <Textarea
                                    placeholder="Añade más detalles..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Prioridad
                                </label>
                                <PrioritySelector
                                    value={taskPriority}
                                    onChange={setTaskPriority}
                                />
                            </div>

                            {/* Due date */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Fecha límite
                                </label>
                                <Input
                                    type="date"
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveTask}
                                disabled={!taskTitle.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {editingTask ? "Guardar cambios" : "Crear tarea"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
