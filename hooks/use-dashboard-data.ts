/**
 * @file use-dashboard-data.ts
 * @description Hook principal para obtener datos reales del dashboard del médico.
 * Centraliza todas las queries y suscripciones de tiempo real para los widgets.
 * 
 * @module Dashboard
 * 
 * @example
 * const { appointments, messages, notifications, stats, isLoading } = useDashboardData(doctorId);
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { getDoctorAppointments } from "@/lib/supabase/services/appointments/appointments.queries";
import { getUserConversations, getUnreadMessagesCount } from "@/lib/supabase/services/messaging-service";
import {
    getNotifications,
    getUnreadNotificationsCount,
    getTasks,
    subscribeToNotifications,
} from "@/lib/supabase/services/dashboard-preferences-service";
import type { DoctorNotification, DoctorTask } from "@/lib/types/dashboard-types";

// ============================================================================
// TIPOS
// ============================================================================

/** Cita del día para el widget timeline */
export interface TodayAppointment {
    id: string;
    time: string;
    patient: string;
    patientId: string;
    patientAvatar?: string;
    type: "presencial" | "telemedicina";
    status: "pending" | "in-progress" | "completed" | "cancelled";
    duration: number;
    motivo?: string;
}

/** Mensaje/conversación reciente */
export interface RecentConversation {
    id: string;
    patientName: string;
    patientAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

/** Estadísticas del dashboard */
export interface DashboardStats {
    todayAppointments: number;
    weekAppointments: number;
    totalPatients: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    averageRating: number;
    unreadMessages: number;
    unreadNotifications: number;
    pendingTasks: number;
}

/** Datos completos del dashboard */
export interface DashboardData {
    /** Citas crudas */
    appointments: any[];
    /** Citas del día */
    todayAppointments: TodayAppointment[];
    /** Citas de la semana */
    weekAppointments: TodayAppointment[];
    /** Conversaciones recientes */
    conversations: RecentConversation[];
    /** Notificaciones */
    notifications: DoctorNotification[];
    /** Tareas */
    tasks: DoctorTask[];
    /** Estadísticas */
    stats: DashboardStats;
    /** Estado de carga */
    isLoading: boolean;
    /** Error si existe */
    error: string | null;
    /** Refrescar todos los datos */
    refresh: () => Promise<void>;
    /** Refrescar solo citas */
    refreshAppointments: () => Promise<void>;
    /** Refrescar solo notificaciones */
    refreshNotifications: () => Promise<void>;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el inicio y fin del día actual.
 */
function getTodayRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return { start, end };
}

/**
 * Obtiene el rango de la semana actual.
 */
function getWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

/**
 * Formatea hora de una fecha ISO.
 */
function formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para obtener todos los datos del dashboard del médico.
 * Incluye suscripciones de tiempo real para notificaciones.
 * 
 * @param doctorId - UUID del médico
 * @returns Datos del dashboard
 */
export function useDashboardData(doctorId: string | undefined): DashboardData {
    // Estados
    const [appointments, setAppointments] = useState<any[]>([]); // Raw appointments
    const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
    const [weekAppointments, setWeekAppointments] = useState<TodayAppointment[]>([]);
    const [conversations, setConversations] = useState<RecentConversation[]>([]);
    const [notifications, setNotifications] = useState<DoctorNotification[]>([]);
    const [tasks, setTasks] = useState<DoctorTask[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        weekAppointments: 0,
        totalPatients: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        pendingAppointments: 0,
        averageRating: 0,
        unreadMessages: 0,
        unreadNotifications: 0,
        pendingTasks: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // =========================================================================
    // FUNCIONES DE CARGA
    // =========================================================================

    /**
     * Carga las citas del médico.
     */
    const loadAppointments = useCallback(async () => {
        if (!doctorId) return;

        try {
            const result = await getDoctorAppointments(doctorId);

            if (result.success && result.data) {
                const allAppointments = result.data;
                setAppointments(allAppointments); // Store raw appointments

                const { start: todayStart, end: todayEnd } = getTodayRange();
                const { start: weekStart, end: weekEnd } = getWeekRange();

                // Helper para obtener fecha completa de una cita
                const getAppointmentDate = (apt: typeof allAppointments[0]) => {
                    return new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                };

                // Filtrar citas del día
                const today = allAppointments
                    .filter((apt) => {
                        const aptDate = getAppointmentDate(apt);
                        return aptDate >= todayStart && aptDate <= todayEnd;
                    })
                    .map((apt) => ({
                        id: apt.id,
                        time: apt.appointment_time.slice(0, 5), // HH:mm
                        patient: apt.patient?.nombre_completo || "Paciente",
                        patientId: apt.patient_id,
                        patientAvatar: apt.patient?.avatar_url || undefined,
                        type: (apt.consultation_type === "video" ? "telemedicina" : "presencial") as "presencial" | "telemedicina",
                        status: apt.status as TodayAppointment["status"],
                        duration: apt.duration || 30,
                        motivo: apt.reason,
                    }))
                    .sort((a, b) => a.time.localeCompare(b.time));

                // Filtrar citas de la semana
                const week = allAppointments
                    .filter((apt) => {
                        const aptDate = getAppointmentDate(apt);
                        return aptDate >= weekStart && aptDate <= weekEnd;
                    })
                    .map((apt) => ({
                        id: apt.id,
                        time: apt.appointment_time.slice(0, 5),
                        patient: apt.patient?.nombre_completo || "Paciente",
                        patientId: apt.patient_id,
                        patientAvatar: apt.patient?.avatar_url || undefined,
                        type: (apt.consultation_type === "video" ? "telemedicina" : "presencial") as "presencial" | "telemedicina",
                        status: apt.status as TodayAppointment["status"],
                        duration: apt.duration || 30,
                        motivo: apt.reason,
                    }));

                setTodayAppointments(today);
                setWeekAppointments(week);

                // Actualizar estadísticas de citas
                setStats((prev) => ({
                    ...prev,
                    todayAppointments: today.length,
                    weekAppointments: week.length,
                    pendingAppointments: today.filter((a) => a.status === "pending").length,
                    completedAppointments: allAppointments.filter((a) => a.status === "completed").length,
                    cancelledAppointments: allAppointments.filter((a) => a.status === "cancelled").length,
                }));
            }
        } catch (err) {
            console.error("[useDashboardData] Error loading appointments:", err);
        }
    }, [doctorId]);

    /**
     * Carga las conversaciones recientes.
     */
    const loadConversations = useCallback(async () => {
        if (!doctorId) return;

        try {
            const result = await getUserConversations(doctorId);

            if (result.success && result.data) {
                const recent = result.data.slice(0, 5).map((conv) => {
                    // last_message puede ser un objeto Message o undefined
                    const lastMsgContent = typeof conv.last_message === 'object' && conv.last_message
                        ? (conv.last_message as any).content || "Sin mensajes"
                        : "Sin mensajes";

                    return {
                        id: conv.id,
                        patientName: conv.patient?.nombre_completo || "Paciente",
                        patientAvatar: conv.patient?.avatar_url || undefined,
                        lastMessage: lastMsgContent,
                        lastMessageTime: conv.last_message_at || conv.created_at,
                        unreadCount: conv.unread_count || 0,
                    };
                });

                setConversations(recent);
            }

            // Obtener conteo de no leídos
            const unreadResult = await getUnreadMessagesCount(doctorId);
            if (unreadResult.success) {
                setStats((prev) => ({
                    ...prev,
                    unreadMessages: unreadResult.data || 0,
                }));
            }
        } catch (err) {
            console.error("[useDashboardData] Error loading conversations:", err);
        }
    }, [doctorId]);

    /**
     * Carga las notificaciones.
     */
    const loadNotifications = useCallback(async () => {
        if (!doctorId) return;

        try {
            const result = await getNotifications(doctorId, { limit: 10 });

            if (result.success) {
                setNotifications(result.data);
            }

            // Obtener conteo de no leídas
            const unreadResult = await getUnreadNotificationsCount(doctorId);
            if (unreadResult.success) {
                setStats((prev) => ({
                    ...prev,
                    unreadNotifications: unreadResult.count,
                }));
            }
        } catch (err) {
            console.error("[useDashboardData] Error loading notifications:", err);
        }
    }, [doctorId]);

    /**
     * Carga las tareas.
     */
    const loadTasks = useCallback(async () => {
        if (!doctorId) return;

        try {
            const result = await getTasks(doctorId, { limit: 10 });

            if (result.success) {
                setTasks(result.data);
                setStats((prev) => ({
                    ...prev,
                    pendingTasks: result.data.filter((t) => !t.is_completed).length,
                }));
            }
        } catch (err) {
            console.error("[useDashboardData] Error loading tasks:", err);
        }
    }, [doctorId]);

    /**
     * Carga estadísticas adicionales.
     */
    const loadStats = useCallback(async () => {
        if (!doctorId) return;

        try {
            // Obtener total de pacientes únicos
            const { count: patientsCount } = await supabase
                .from("appointments")
                .select("paciente_id", { count: "exact", head: true })
                .eq("medico_id", doctorId);

            // Obtener rating promedio desde la tabla ratings
            let averageRating = 0;
            try {
                const { data: ratingData } = await supabase
                    .from("ratings")
                    .select(`
                        rating,
                        consultation:consultations!inner(doctor_id)
                    `)
                    .eq("consultation.doctor_id", doctorId);

                if (ratingData && ratingData.length > 0) {
                    const total = ratingData.reduce((sum, r) => sum + (r.rating || 0), 0);
                    averageRating = total / ratingData.length;
                }
            } catch (err) {
                console.warn("[useDashboardData] Error loading average rating:", err);
                averageRating = 0;
            }

            setStats((prev) => ({
                ...prev,
                totalPatients: patientsCount || 0,
                averageRating,
            }));
        } catch (err) {
            console.error("[useDashboardData] Error loading stats:", err);
        }
    }, [doctorId]);

    // =========================================================================
    // FUNCIONES PÚBLICAS
    // =========================================================================

    /**
     * Refrescar todos los datos.
     */
    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await Promise.all([
                loadAppointments(),
                loadConversations(),
                loadNotifications(),
                loadTasks(),
                loadStats(),
            ]);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    }, [loadAppointments, loadConversations, loadNotifications, loadTasks, loadStats]);

    /**
     * Refrescar solo citas.
     */
    const refreshAppointments = useCallback(async () => {
        await loadAppointments();
    }, [loadAppointments]);

    /**
     * Refrescar solo notificaciones.
     */
    const refreshNotifications = useCallback(async () => {
        await loadNotifications();
    }, [loadNotifications]);

    // =========================================================================
    // EFECTOS
    // =========================================================================

    // Carga inicial
    useEffect(() => {
        if (doctorId) {
            refresh();
        }
    }, [doctorId, refresh]);

    // Suscripción a notificaciones en tiempo real
    useEffect(() => {
        if (!doctorId) return;

        const subscription = subscribeToNotifications(doctorId, (newNotification) => {
            // Agregar nueva notificación al inicio
            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);

            // Actualizar conteo
            setStats((prev) => ({
                ...prev,
                unreadNotifications: prev.unreadNotifications + 1,
            }));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [doctorId]);

    // Refrescar citas cada 5 minutos
    useEffect(() => {
        if (!doctorId) return;

        const interval = setInterval(() => {
            loadAppointments();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [doctorId, loadAppointments]);

    // =========================================================================
    // RETORNO
    // =========================================================================

    return useMemo(
        () => ({
            appointments, // Exposed raw appointments
            todayAppointments,
            weekAppointments,
            conversations,
            notifications,
            tasks,
            stats,
            isLoading,
            error,
            refresh,
            refreshAppointments,
            refreshNotifications,
        }),
        [
            appointments,
            todayAppointments,
            weekAppointments,
            conversations,
            notifications,
            tasks,
            stats,
            isLoading,
            error,
            refresh,
            refreshAppointments,
            refreshNotifications,
        ]
    );
}
