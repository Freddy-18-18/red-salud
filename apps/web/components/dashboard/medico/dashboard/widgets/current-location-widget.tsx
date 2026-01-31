/**
 * @file current-location-widget.tsx
 * @description Widget que muestra dónde está el médico hoy basado en sus horarios configurados.
 * Detecta automáticamente el consultorio activo según el día y hora actual.
 * @module Dashboard/Medico/Widgets
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Clock, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

/** Interfaz para consultorio */
interface Office {
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
}

/** Interfaz para horario */
interface TimeSlot {
    inicio: string;
    fin: string;
}

/** Interfaz para horario del día */
interface TodaySchedule {
    office: Office;
    slots: TimeSlot[];
    isCurrentlyActive: boolean;
}

/** Días de la semana en español */
const DAYS_MAP = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/**
 * Widget que muestra la ubicación actual del médico
 */
export function CurrentLocationWidget() {
    const [loading, setLoading] = useState(true);
    const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadTodaySchedules();

        // Actualizar cada minuto para mantener el estado activo correcto
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, [loadTodaySchedules]);

    /**
     * Verifica si algún horario está activo en este momento
     */
    const checkIfCurrentlyActive = useCallback((slots: TimeSlot[], now: Date): boolean => {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        return slots.some(slot => {
            const [startH, startM] = slot.inicio.split(':').map(Number);
            const [endH, endM] = slot.fin.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;

            return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        });
    }, []);

    /**
     * Carga los horarios de hoy del médico
     */
    const loadTodaySchedules = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date();
            const dayKey = DAYS_MAP[today.getDay()];

            // Cargar todos los consultorios con horarios
            const { data: schedulesData, error: schedulesError } = await supabase
                .from("doctor_schedules")
                .select(`
          *,
          doctor_offices (
            id,
            nombre,
            direccion,
            ciudad
          )
        `)
                .eq("doctor_id", user.id);

            if (schedulesError) throw schedulesError;

            // Filtrar horarios de hoy
            const todayData: TodaySchedule[] = [];

            schedulesData?.forEach((schedule) => {
                const daySchedule = schedule.horarios?.[dayKey];
                if (daySchedule?.activo && daySchedule.horarios?.length > 0) {
                    const isActive = checkIfCurrentlyActive(daySchedule.horarios, today);
                    todayData.push({
                        office: schedule.doctor_offices,
                        slots: daySchedule.horarios,
                        isCurrentlyActive: isActive,
                    });
                }
            });

            setTodaySchedules(todayData);
        } catch (error) {
            console.error("[CurrentLocationWidget] Error:", error);
        } finally {
            setLoading(false);
        }
    }, [checkIfCurrentlyActive]);

    /**
     * Formatea la hora para mostrar
     */
    const formatTime = (time: string) => {
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        return `${hour}:${m}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
        );
    }

    if (todaySchedules.length === 0) {
        return (
            <div className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tienes consultorios activos hoy
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Descansa o configura tus horarios
                </p>
            </div>
        );
    }

    const activeSchedule = todaySchedules.find(s => s.isCurrentlyActive);
    const displaySchedule = activeSchedule || todaySchedules[0];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Dónde estás hoy
                </h3>
            </div>

            {/* Current Office Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
          p-4 rounded-xl border-2 transition-all
          ${activeSchedule
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                    }
        `}
            >
                {/* Office Name */}
                <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {displaySchedule.office.nombre}
                        </h4>
                        {displaySchedule.office.direccion && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {displaySchedule.office.direccion}
                                {displaySchedule.office.ciudad && `, ${displaySchedule.office.ciudad}`}
                            </p>
                        )}
                    </div>
                    {activeSchedule && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-semibold">Activo</span>
                        </div>
                    )}
                </div>

                {/* Today's Schedule */}
                <div className="space-y-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">Horarios de hoy:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {displaySchedule.slots.map((slot, idx) => {
                            const isMorning = parseInt(slot.inicio.split(':')[0]) < 14;
                            const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                            const [startH, startM] = slot.inicio.split(':').map(Number);
                            const [endH, endM] = slot.fin.split(':').map(Number);
                            const startMinutes = startH * 60 + startM;
                            const endMinutes = endH * 60 + endM;
                            const isNowActive = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

                            return (
                                <div
                                    key={idx}
                                    className={`
                    text-xs px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-all
                    ${isNowActive
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold ring-2 ring-green-300 dark:ring-green-700'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }
                  `}
                                >
                                    <span>{isMorning ? '🌅' : '🌆'}</span>
                                    <span>{formatTime(slot.inicio)} - {formatTime(slot.fin)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Additional Offices Today */}
            {todaySchedules.length > 1 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        También trabajas en:
                    </p>
                    <div className="space-y-1">
                        {todaySchedules
                            .filter(s => s.office.id !== displaySchedule.office.id)
                            .map((schedule, idx) => (
                                <div
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900/30 rounded text-gray-600 dark:text-gray-400"
                                >
                                    {schedule.office.nombre}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
