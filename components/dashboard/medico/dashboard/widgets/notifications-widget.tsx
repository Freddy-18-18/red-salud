/**
 * @file notifications-widget.tsx
 * @description Widget de notificaciones con datos reales de Supabase.
 * Muestra notificaciones en tiempo real con soporte para diferentes tipos.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Clock,
    X,
    UserPlus,
    Star,
    Settings,
    ShieldCheck,
    Loader2,
    CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/supabase/services/dashboard-preferences-service";
import type { DoctorNotification, NotificationType } from "@/lib/types/dashboard-types";

// ============================================================================
// MAPAS DE CONFIGURACIÓN
// ============================================================================

/** Mapeo de tipos de notificación a iconos */
const iconMap: Record<NotificationType, typeof Bell> = {
    appointment_new: Calendar,
    appointment_cancelled: X,
    appointment_reminder: Clock,
    message_new: MessageSquare,
    patient_new: UserPlus,
    review_new: Star,
    system_update: Settings,
    verification_status: ShieldCheck,
};

/** Mapeo de tipos de notificación a colores */
const colorMap: Record<NotificationType, string> = {
    appointment_new: "bg-blue-500/10 text-blue-500",
    appointment_cancelled: "bg-red-500/10 text-red-500",
    appointment_reminder: "bg-yellow-500/10 text-yellow-500",
    message_new: "bg-purple-500/10 text-purple-500",
    patient_new: "bg-green-500/10 text-green-500",
    review_new: "bg-amber-500/10 text-amber-500",
    system_update: "bg-gray-500/10 text-gray-500",
    verification_status: "bg-teal-500/10 text-teal-500",
};

/** Tipos que se consideran urgentes */
const urgentTypes: NotificationType[] = ["appointment_cancelled"];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea la fecha relativa de una notificación.
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

// ============================================================================
// TIPOS
// ============================================================================

interface NotificationsWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de notificaciones.
 * Muestra las notificaciones recientes del médico con soporte para
 * diferentes tipos y estados de lectura.
 * 
 * @example
 * <NotificationsWidget doctorId="uuid-del-doctor" />
 */
export function NotificationsWidget({
    doctorId,
    isDragging
}: NotificationsWidgetProps) {
    // Obtener datos reales del dashboard
    const { notifications, stats, isLoading, refreshNotifications } = useDashboardData(doctorId);

    // Conteo de notificaciones no leídas
    const unreadCount = stats.unreadNotifications;

    // Handler para marcar una notificación como leída
    const handleMarkAsRead = useCallback(async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        refreshNotifications();
    }, [refreshNotifications]);

    // Handler para marcar todas como leídas
    const handleMarkAllAsRead = useCallback(async () => {
        if (!doctorId) return;
        await markAllNotificationsAsRead(doctorId);
        refreshNotifications();
    }, [doctorId, refreshNotifications]);

    return (
        <WidgetWrapper
            id="notifications"
            title="Notificaciones"
            icon={
                <div className="relative">
                    <Bell className="h-4 w-4 text-primary" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </div>
            }
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
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px]">
                                {unreadCount} sin leer
                            </Badge>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 gap-1"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="h-3 w-3" />
                                    Marcar leídas
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => {
                                    const Icon = iconMap[notification.type] || Bell;
                                    const isUrgent = urgentTypes.includes(notification.type);

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "flex items-start gap-2 p-2 rounded-lg",
                                                "hover:bg-muted/50 transition-colors cursor-pointer",
                                                !notification.is_read && "bg-primary/5",
                                                isUrgent && !notification.is_read && "ring-1 ring-red-500/30"
                                            )}
                                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                        >
                                            {/* Icon */}
                                            <div className={cn(
                                                "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
                                                colorMap[notification.type] || "bg-gray-500/10 text-gray-500"
                                            )}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <p className={cn(
                                                        "text-xs font-medium truncate",
                                                        !notification.is_read && "text-foreground",
                                                        notification.is_read && "text-muted-foreground"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    {isUrgent && !notification.is_read && (
                                                        <Badge variant="destructive" className="text-[8px] px-1 py-0">
                                                            Urgente
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                                    {formatRelativeTime(notification.created_at)}
                                                </p>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                            )}
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-6 text-muted-foreground"
                                >
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay notificaciones</p>
                                </motion.div>
                            )}
                        </div>

                        {/* View All */}
                        {notifications.length > 0 && (
                            <Button variant="outline" className="w-full text-xs h-7" asChild>
                                <a href="/dashboard/medico/notificaciones">
                                    Ver todas las notificaciones
                                </a>
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
