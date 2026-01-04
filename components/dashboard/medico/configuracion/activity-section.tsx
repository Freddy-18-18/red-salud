/**
 * @file activity-section.tsx
 * @description Sección de actividad de cuenta para la página de configuración.
 * Muestra historial de accesos, sesiones activas y opciones de gestión.
 * @module Configuracion
 * 
 * @example
 * <ActivitySection />
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Monitor,
    Smartphone,
    MapPin,
    Clock,
    Check,
    Activity as ActivityIcon,
    LogOut,
    Loader2,
    AlertTriangle,
    Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Representa una sesión activa del usuario
 */
interface Session {
    id: string;
    device: string;
    location: string;
    last_active_at: string;
    is_current: boolean;
}

/**
 * Representa una actividad del usuario
 */
interface ActivityItem {
    id: string;
    activity_type: string;
    description: string;
    status: "success" | "failed";
    created_at: string;
}

/**
 * Componente de sección de actividad para la página de configuración.
 * Muestra sesiones activas y historial de actividad de la cuenta.
 */
export function ActivitySection() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    /** Carga datos de actividad y sesiones */
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar sesiones (simulado - en producción vendría de la API)
            setSessions([
                {
                    id: "current",
                    device: "Windows • Chrome",
                    location: "Caracas, Venezuela",
                    last_active_at: new Date().toISOString(),
                    is_current: true,
                },
            ]);

            // Cargar historial de actividad
            const { data: activityData, error } = await supabase
                .from("user_activity_log")
                .select("id, activity_type, description, status, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (!error && activityData) {
                setActivities(activityData);
            }
        } catch (error) {
            console.error("Error loading activity data:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Formatea fecha para mostrar */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("es-VE", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Actividad de la Cuenta
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Revisa el historial de accesos y gestiona las sesiones activas
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sesiones Activas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Sesiones Activas
                            </h3>
                        </div>
                        <Button variant="outline" size="sm">
                            Cerrar Todas
                        </Button>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                            No hay sesiones activas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <article
                                    key={session.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                {session.device?.toLowerCase().includes("mobile") ? (
                                                    <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {session.device || "Dispositivo desconocido"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {session.location || "Ubicación desconocida"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {session.is_current
                                                        ? "Ahora"
                                                        : formatDate(session.last_active_at)}
                                                </p>
                                                {session.is_current && (
                                                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Sesión Actual
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {!session.is_current && (
                                            <button
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
                                                aria-label="Cerrar sesión"
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Consejo de seguridad */}
                    <aside className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>Consejo de Seguridad:</strong> Si ves una sesión que no reconoces,
                                ciérrala inmediatamente y cambia tu contraseña.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Historial de Actividad */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <ActivityIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Historial de Actividad
                        </h3>
                    </div>

                    {activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                            No hay actividad reciente registrada
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <article
                                    key={activity.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${activity.status === "success"
                                                    ? "bg-green-100 dark:bg-green-900/30"
                                                    : "bg-red-100 dark:bg-red-900/30"
                                                }`}
                                        >
                                            {activity.status === "success" ? (
                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {activity.description || activity.activity_type}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(activity.created_at)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                activity.status === "success"
                                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                            }
                                        >
                                            {activity.status === "success" ? "Éxito" : "Fallido"}
                                        </Badge>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <Button variant="outline" className="w-full">
                        Ver Historial Completo
                    </Button>
                </div>
            </div>
        </div>
    );
}
