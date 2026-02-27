"use client";

import { useState, useEffect, useCallback } from "react";
import { tauriApiService } from "@/lib/services/tauri-api-service";
import { supabase } from "@/lib/supabase/client";

export interface Appointment {
    id: string;
    doctor_id: string;
    patient_id: string;
    date: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
    type: string;
    notes?: string;
    [key: string]: unknown;
}

export function useTauriAppointments(doctorId: string) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAppointments = useCallback(async () => {
        if (!doctorId) return;
        try {
            setLoading(true);
            // Use getOfflineData first for immediate display, then sync
            const cached = await tauriApiService.getOfflineData<Appointment[]>(`appointments_${doctorId}`);
            if (cached) {
                setAppointments(cached);
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const data = await tauriApiService.supabaseGet<Appointment[]>(
                `/rest/v1/appointments?doctor_id=eq.${doctorId}&select=*`,
                token,
                `appointments_${doctorId}`
            );
            setAppointments(data);
            setError(null);
        } catch (err: unknown) {
            console.error("Error loading appointments:", err);
            // If network fails, we rely on cache which might have been set above
            if (!appointments.length) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError(errorMessage || "Failed to load appointments");
            }
        } finally {
            setLoading(false);
        }
    }, [doctorId, appointments.length]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            // For Supabase REST API
            const newAppointment = await tauriApiService.supabasePost<Appointment>(
                "/rest/v1/appointments",
                appointmentData,
                token
            );
            setAppointments((prev) => [...prev, newAppointment]);
            return newAppointment;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const updated = await tauriApiService.supabasePatch<Appointment>(
                `/rest/v1/appointments?id=eq.${id}`,
                updates,
                token
            );
            setAppointments((prev) =>
                prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
            );
            return updated;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    const deleteAppointment = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            await tauriApiService.supabaseDelete(
                `/rest/v1/appointments?id=eq.${id}`,
                token
            );
            setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    return {
        appointments,
        loading,
        error,
        refresh: loadAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
    };
}
