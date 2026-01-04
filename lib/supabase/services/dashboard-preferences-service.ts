/**
 * @file dashboard-preferences-service.ts
 * @description Servicio para gestionar las preferencias del dashboard del médico.
 * Incluye CRUD completo para preferencias, widgets, acciones rápidas, temas y tareas.
 * 
 * @module Dashboard
 */

import { supabase } from "../client";
import type {
    DashboardPreferences,
    DashboardState,
    WidgetPosition,
    WidgetId,
    DashboardMode,
    DoctorQuickAction,
    DashboardTheme,
    DoctorTask,
    TaskPriority,
    TaskCategory,
    DoctorNotification,
    DEFAULT_LAYOUTS,
} from "@/lib/types/dashboard-types";
import { DEFAULT_LAYOUTS as DEFAULTS } from "@/lib/types/dashboard-types";

// ============================================================================
// PREFERENCIAS DEL DASHBOARD
// ============================================================================

/**
 * Obtiene las preferencias del dashboard de un médico.
 * Si no existen, crea un registro con valores por defecto.
 * 
 * @param doctorId - UUID del médico
 * @returns Preferencias del dashboard
 */
export async function getDashboardPreferences(
    doctorId: string
): Promise<{ success: boolean; data: DashboardPreferences | null; error?: string }> {
    try {
        // Intentar obtener preferencias existentes
        const { data, error } = await supabase
            .from("dashboard_preferences")
            .select("*")
            .eq("doctor_id", doctorId)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows returned (es esperado si no hay registro)
            throw error;
        }

        if (data) {
            return { success: true, data: data as DashboardPreferences };
        }

        // No existe, crear con valores por defecto
        const newPrefs = await createDefaultPreferences(doctorId);
        return { success: true, data: newPrefs };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting preferences:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: null, error: String(error) };
    }
}

/**
 * Crea preferencias por defecto para un nuevo médico.
 */
async function createDefaultPreferences(
    doctorId: string
): Promise<DashboardPreferences | null> {
    try {
        const { data, error } = await supabase
            .from("dashboard_preferences")
            .insert({
                doctor_id: doctorId,
                current_mode: "simple",
                layout_simple: DEFAULTS.simple,
                layout_pro: DEFAULTS.pro,
                hidden_widgets: [],
            })
            .select()
            .single();

        if (error) throw error;
        return data as DashboardPreferences;

    } catch (error) {
        console.error("[DashboardPreferencesService] Error creating default preferences:", error instanceof Error ? error.message : JSON.stringify(error));
        return null;
    }
}

/**
 * Guarda las preferencias del dashboard.
 * 
 * @param doctorId - UUID del médico
 * @param preferences - Preferencias parciales a actualizar
 */
export async function saveDashboardPreferences(
    doctorId: string,
    preferences: Partial<{
        current_mode: DashboardMode;
        layout_simple: WidgetPosition[];
        layout_pro: WidgetPosition[];
        hidden_widgets: WidgetId[];
        active_theme_id: string | null;
    }>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("dashboard_preferences")
            .upsert({
                doctor_id: doctorId,
                ...preferences,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "doctor_id",
            });

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error saving preferences:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

/**
 * Convierte preferencias de Supabase a estado del dashboard.
 */
export function preferencesToState(prefs: DashboardPreferences): DashboardState {
    return {
        currentMode: prefs.current_mode,
        layouts: {
            simple: prefs.layout_simple || DEFAULTS.simple,
            pro: prefs.layout_pro || DEFAULTS.pro,
        },
        hiddenWidgets: (prefs.hidden_widgets || []) as WidgetId[],
    };
}

// ============================================================================
// ACCIONES RÁPIDAS
// ============================================================================

/**
 * Obtiene las acciones rápidas configuradas de un médico.
 */
export async function getQuickActions(
    doctorId: string
): Promise<{ success: boolean; data: DoctorQuickAction[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from("doctor_quick_actions")
            .select("*")
            .eq("doctor_id", doctorId)
            .order("position", { ascending: true });

        if (error) throw error;
        return { success: true, data: (data || []) as DoctorQuickAction[] };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting quick actions:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: [], error: String(error) };
    }
}

/**
 * Guarda las acciones rápidas de un médico.
 * Reemplaza todas las acciones existentes.
 */
export async function saveQuickActions(
    doctorId: string,
    actions: Array<{
        action_id: string;
        position: number;
        is_visible: boolean;
        custom_label?: string | null;
    }>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Eliminar acciones existentes
        await supabase
            .from("doctor_quick_actions")
            .delete()
            .eq("doctor_id", doctorId);

        // Insertar nuevas acciones
        if (actions.length > 0) {
            const { error } = await supabase
                .from("doctor_quick_actions")
                .insert(
                    actions.map((action) => ({
                        doctor_id: doctorId,
                        ...action,
                    }))
                );

            if (error) throw error;
        }

        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error saving quick actions:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// TEMAS
// ============================================================================

/**
 * Obtiene los temas de un médico.
 */
export async function getThemes(
    doctorId: string
): Promise<{ success: boolean; data: DashboardTheme[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from("doctor_themes")
            .select("*")
            .eq("doctor_id", doctorId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data: (data || []) as DashboardTheme[] };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting themes:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: [], error: String(error) };
    }
}

/**
 * Obtiene el tema activo de un médico.
 */
export async function getActiveTheme(
    doctorId: string
): Promise<{ success: boolean; data: DashboardTheme | null; error?: string }> {
    try {
        const { data, error } = await supabase
            .from("doctor_themes")
            .select("*")
            .eq("doctor_id", doctorId)
            .eq("is_active", true)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        return { success: true, data: data as DashboardTheme | null };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting active theme:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: null, error: String(error) };
    }
}

/**
 * Guarda un tema (crea nuevo o actualiza existente).
 */
export async function saveTheme(
    doctorId: string,
    theme: Omit<DashboardTheme, "id" | "doctor_id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data: DashboardTheme | null; error?: string }> {
    try {
        // Si es activo, desactivar otros temas
        if (theme.is_active) {
            await supabase
                .from("doctor_themes")
                .update({ is_active: false })
                .eq("doctor_id", doctorId);
        }

        const { data, error } = await supabase
            .from("doctor_themes")
            .insert({
                doctor_id: doctorId,
                ...theme,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as DashboardTheme };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error saving theme:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: null, error: String(error) };
    }
}

/**
 * Activa un tema específico.
 */
export async function activateTheme(
    doctorId: string,
    themeId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Desactivar todos los temas
        await supabase
            .from("doctor_themes")
            .update({ is_active: false })
            .eq("doctor_id", doctorId);

        // Activar el tema seleccionado
        const { error } = await supabase
            .from("doctor_themes")
            .update({ is_active: true })
            .eq("id", themeId)
            .eq("doctor_id", doctorId);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error activating theme:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

/**
 * Elimina un tema.
 */
export async function deleteTheme(
    themeId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("doctor_themes")
            .delete()
            .eq("id", themeId);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error deleting theme:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// TAREAS
// ============================================================================

/**
 * Obtiene las tareas de un médico.
 */
export async function getTasks(
    doctorId: string,
    options?: {
        includeCompleted?: boolean;
        limit?: number;
    }
): Promise<{ success: boolean; data: DoctorTask[]; error?: string }> {
    try {
        let query = supabase
            .from("doctor_tasks")
            .select("*")
            .eq("doctor_id", doctorId)
            .order("priority", { ascending: false })
            .order("due_date", { ascending: true, nullsFirst: false });

        if (!options?.includeCompleted) {
            query = query.eq("is_completed", false);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: (data || []) as DoctorTask[] };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting tasks:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: [], error: String(error) };
    }
}

/**
 * Crea una nueva tarea.
 */
export async function createTask(
    doctorId: string,
    task: {
        title: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
        // Estos campos requieren ejecutar la migración 20251230000001_extend_doctor_tasks.sql
        // patient_id?: string;
        // appointment_id?: string;
        // category?: TaskCategory;
    }
): Promise<{ success: boolean; data: DoctorTask | null; error?: string }> {
    try {
        const { data, error } = await supabase
            .from("doctor_tasks")
            .insert({
                doctor_id: doctorId,
                title: task.title,
                description: task.description || null,
                priority: task.priority || "medium",
                due_date: task.due_date || null,
                // Descomentar después de ejecutar la migración:
                // patient_id: task.patient_id || null,
                // appointment_id: task.appointment_id || null,
                // category: task.category || "general",
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as DoctorTask };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error creating task:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: null, error: String(error) };
    }
}

/**
 * Actualiza una tarea existente.
 * 
 * @param taskId - UUID de la tarea
 * @param updates - Campos a actualizar
 */
export async function updateTask(
    taskId: string,
    updates: {
        title?: string;
        description?: string | null;
        priority?: TaskPriority;
        due_date?: string | null;
        // Estos campos requieren ejecutar la migración 20251230000001_extend_doctor_tasks.sql
        // patient_id?: string | null;
        // appointment_id?: string | null;
        // category?: TaskCategory;
    }
): Promise<{ success: boolean; data: DoctorTask | null; error?: string }> {
    try {
        // Filtrar solo los campos que existen en la BD actualmente
        const safeUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) safeUpdates.title = updates.title;
        if (updates.description !== undefined) safeUpdates.description = updates.description;
        if (updates.priority !== undefined) safeUpdates.priority = updates.priority;
        if (updates.due_date !== undefined) safeUpdates.due_date = updates.due_date;
        safeUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("doctor_tasks")
            .update(safeUpdates)
            .eq("id", taskId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as DoctorTask };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error updating task:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: null, error: String(error) };
    }
}

/**
 * Completa o descompleta una tarea.
 */
export async function toggleTaskComplete(
    taskId: string,
    isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("doctor_tasks")
            .update({
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
            })
            .eq("id", taskId);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error toggling task:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

/**
 * Elimina una tarea.
 */
export async function deleteTask(
    taskId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("doctor_tasks")
            .delete()
            .eq("id", taskId);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error deleting task:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Obtiene las notificaciones de un médico.
 */
export async function getNotifications(
    doctorId: string,
    options?: {
        unreadOnly?: boolean;
        limit?: number;
    }
): Promise<{ success: boolean; data: DoctorNotification[]; error?: string }> {
    try {
        let query = supabase
            .from("doctor_notifications")
            .select("*")
            .eq("doctor_id", doctorId)
            .order("created_at", { ascending: false });

        if (options?.unreadOnly) {
            query = query.eq("is_read", false);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: (data || []) as DoctorNotification[] };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting notifications:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, data: [], error: String(error) };
    }
}

/**
 * Obtiene el conteo de notificaciones no leídas.
 */
export async function getUnreadNotificationsCount(
    doctorId: string
): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const { count, error } = await supabase
            .from("doctor_notifications")
            .select("*", { count: "exact", head: true })
            .eq("doctor_id", doctorId)
            .eq("is_read", false);

        if (error) throw error;
        return { success: true, count: count || 0 };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error getting unread count:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, count: 0, error: String(error) };
    }
}

/**
 * Marca una notificación como leída.
 */
export async function markNotificationAsRead(
    notificationId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("doctor_notifications")
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq("id", notificationId);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error marking notification as read:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

/**
 * Marca todas las notificaciones como leídas.
 */
export async function markAllNotificationsAsRead(
    doctorId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("doctor_notifications")
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq("doctor_id", doctorId)
            .eq("is_read", false);

        if (error) throw error;
        return { success: true };

    } catch (error) {
        console.error("[DashboardPreferencesService] Error marking all notifications as read:", error instanceof Error ? error.message : JSON.stringify(error));
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// SUSCRIPCIONES EN TIEMPO REAL
// ============================================================================

/**
 * Suscribirse a cambios de notificaciones en tiempo real.
 */
export function subscribeToNotifications(
    doctorId: string,
    onNotification: (notification: DoctorNotification) => void
) {
    return supabase
        .channel(`doctor_notifications:${doctorId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "doctor_notifications",
                filter: `doctor_id=eq.${doctorId}`,
            },
            (payload) => {
                onNotification(payload.new as DoctorNotification);
            }
        )
        .subscribe();
}
