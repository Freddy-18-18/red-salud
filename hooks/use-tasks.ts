/**
 * @file use-tasks.ts
 * @description Hook dedicado para gestión de tareas del médico.
 * Proporciona CRUD optimista, filtrado, ordenamiento y estadísticas.
 * 
 * @module Hooks
 * 
 * @example
 * const { tasks, filteredTasks, stats, createTask, updateTask, deleteTask } = useTasks(doctorId);
 */

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
    getTasks,
    createTask as createTaskService,
    updateTask as updateTaskService,
    toggleTaskComplete,
    deleteTask as deleteTaskService,
} from "@/lib/supabase/services/dashboard-preferences-service";
import type { DoctorTask, TaskPriority, TaskCategory } from "@/lib/types/dashboard-types";

// ============================================================================
// TIPOS
// ============================================================================

/** Opciones de filtro */
export interface TaskFilters {
    /** Texto de búsqueda */
    search: string;
    /** Filtrar por prioridad */
    priority: TaskPriority | 'all';
    /** Filtrar por estado */
    status: 'pending' | 'completed' | 'all';
    /** Filtrar por fecha */
    dateRange: 'all' | 'today' | 'week' | 'overdue';
}

/** Estadísticas de tareas */
export interface TaskStats {
    /** Total de tareas */
    total: number;
    /** Tareas pendientes */
    pending: number;
    /** Tareas completadas */
    completed: number;
    /** Tareas vencidas */
    overdue: number;
    /** Tareas urgentes/altas pendientes */
    urgent: number;
    /** Tareas para hoy */
    dueToday: number;
    /** Tareas completadas hoy */
    completedToday: number;
}

/** Datos para crear/editar tarea */
export interface TaskInput {
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_date?: string;
    patient_id?: string;
    appointment_id?: string;
    category?: TaskCategory;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Orden de prioridades */
const PRIORITY_ORDER: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
};

/**
 * Parsea una fecha string (YYYY-MM-DD) como hora LOCAL, no UTC.
 * Esto evita el bug donde "2025-12-30" se interpreta como UTC y
 * resulta en "2025-12-29" en zonas horarias negativas.
 */
function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Verifica si una tarea está vencida
 */
export function isTaskOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseLocalDate(dueDate);
    return due < today;
}

/**
 * Verifica si la fecha límite es hoy
 */
export function isTaskDueToday(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = parseLocalDate(dueDate);
    return today.toDateString() === due.toDateString();
}

/**
 * Verifica si la fecha límite es esta semana
 */
export function isTaskDueThisWeek(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = parseLocalDate(dueDate);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (7 - today.getDay()));
    return due <= weekEnd && due >= today;
}

/**
 * Verifica si una tarea fue completada hoy
 * Nota: completed_at es timestamp ISO con hora, así que new Date() está bien
 */
function isCompletedToday(completedAt: string | null): boolean {
    if (!completedAt) return false;
    const today = new Date();
    const completed = new Date(completedAt);
    return today.toDateString() === completed.toDateString();
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para gestionar tareas del médico
 */
export function useTasks(doctorId: string | undefined) {
    // Estado
    const [tasks, setTasks] = useState<DoctorTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({
        search: '',
        priority: 'all',
        status: 'pending',
        dateRange: 'all',
    });

    // Cargar tareas
    const loadTasks = useCallback(async () => {
        if (!doctorId) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await getTasks(doctorId, { includeCompleted: true });
            if (result.success) {
                setTasks(result.data);
            } else {
                setError(result.error || 'Error al cargar tareas');
            }
        } catch (err) {
            setError('Error al cargar tareas');
            console.error('[useTasks] Error loading tasks:', err);
        } finally {
            setIsLoading(false);
        }
    }, [doctorId]);

    // Cargar al montar
    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Filtrar tareas
    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Filtrar por estado
        if (filters.status === 'pending') {
            result = result.filter((t) => !t.is_completed);
        } else if (filters.status === 'completed') {
            result = result.filter((t) => t.is_completed);
        }

        // Filtrar por prioridad
        if (filters.priority !== 'all') {
            result = result.filter((t) => t.priority === filters.priority);
        }

        // Filtrar por fecha
        if (filters.dateRange === 'today') {
            result = result.filter((t) => isTaskDueToday(t.due_date));
        } else if (filters.dateRange === 'week') {
            result = result.filter((t) => isTaskDueThisWeek(t.due_date));
        } else if (filters.dateRange === 'overdue') {
            result = result.filter((t) => isTaskOverdue(t.due_date) && !t.is_completed);
        }

        // Filtrar por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter((t) =>
                t.title.toLowerCase().includes(searchLower) ||
                t.description?.toLowerCase().includes(searchLower)
            );
        }

        // Ordenar
        return result.sort((a, b) => {
            // Completadas al final
            if (a.is_completed !== b.is_completed) {
                return a.is_completed ? 1 : -1;
            }

            // Vencidas primero (solo para pendientes)
            if (!a.is_completed && !b.is_completed) {
                const aOverdue = isTaskOverdue(a.due_date);
                const bOverdue = isTaskOverdue(b.due_date);
                if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
            }

            // Por prioridad
            const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Por fecha límite
            if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date) return -1;
            if (b.due_date) return 1;

            // Por fecha de creación
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [tasks, filters]);

    // Estadísticas
    const stats = useMemo<TaskStats>(() => {
        const pending = tasks.filter((t) => !t.is_completed);
        const completed = tasks.filter((t) => t.is_completed);

        return {
            total: tasks.length,
            pending: pending.length,
            completed: completed.length,
            overdue: pending.filter((t) => isTaskOverdue(t.due_date)).length,
            urgent: pending.filter((t) => t.priority === 'urgent' || t.priority === 'high').length,
            dueToday: pending.filter((t) => isTaskDueToday(t.due_date)).length,
            completedToday: completed.filter((t) => isCompletedToday(t.completed_at)).length,
        };
    }, [tasks]);

    // Crear tarea
    const createTask = useCallback(async (input: TaskInput): Promise<boolean> => {
        if (!doctorId) return false;

        try {
            const result = await createTaskService(doctorId, input);
            if (result.success && result.data) {
                setTasks((prev) => [result.data!, ...prev]);
                return true;
            }
            return false;
        } catch (err) {
            console.error('[useTasks] Error creating task:', err);
            return false;
        }
    }, [doctorId]);

    // Completar/descompletar tarea
    const completeTask = useCallback(async (taskId: string, completed: boolean): Promise<boolean> => {
        try {
            // Actualización optimista
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId
                        ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
                        : t
                )
            );

            const result = await toggleTaskComplete(taskId, completed);
            if (!result.success) {
                // Revertir si falla
                loadTasks();
                return false;
            }
            return true;
        } catch (err) {
            console.error('[useTasks] Error completing task:', err);
            loadTasks();
            return false;
        }
    }, [loadTasks]);

    // Eliminar tarea
    const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
        try {
            // Actualización optimista
            setTasks((prev) => prev.filter((t) => t.id !== taskId));

            const result = await deleteTaskService(taskId);
            if (!result.success) {
                loadTasks();
                return false;
            }
            return true;
        } catch (err) {
            console.error('[useTasks] Error deleting task:', err);
            loadTasks();
            return false;
        }
    }, [loadTasks]);

    // Actualizar tarea
    const updateTask = useCallback(async (taskId: string, updates: Partial<TaskInput>): Promise<boolean> => {
        try {
            // Actualización optimista
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId ? { ...t, ...updates } : t
                )
            );

            const result = await updateTaskService(taskId, updates);
            if (!result.success) {
                loadTasks();
                return false;
            }
            return true;
        } catch (err) {
            console.error('[useTasks] Error updating task:', err);
            loadTasks();
            return false;
        }
    }, [loadTasks]);

    // Actualizar filtros
    const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    // Resetear filtros
    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            priority: 'all',
            status: 'pending',
            dateRange: 'all',
        });
    }, []);

    return {
        // Datos
        tasks,
        filteredTasks,
        stats,
        filters,

        // Estado
        isLoading,
        error,

        // Acciones
        createTask,
        updateTask,
        completeTask,
        deleteTask,
        updateFilters,
        resetFilters,
        refresh: loadTasks,
    };
}
