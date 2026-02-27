"use client";

import { useState, useEffect, useCallback } from "react";
import { tauriApiService } from "@/lib/services/tauri-api-service";
import { supabase } from "@/lib/supabase/client";

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
}

export function useTauriPatients(doctorId: string) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPatients = useCallback(async () => {
        if (!doctorId) return;
        try {
            setLoading(true);
            const cached = await tauriApiService.getOfflineData<Patient[]>(`patients_${doctorId}`);
            if (cached) setPatients(cached);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const data = await tauriApiService.supabaseGet<Patient[]>(
                `/rest/v1/patients?doctor_id=eq.${doctorId}&select=*`,
                token,
                `patients_${doctorId}`
            );
            setPatients(data);
            setError(null);
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (!patients.length) setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [doctorId, patients.length]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const getPatient = async (patientId: string) => {
        try {
            // Check cache first
            if (patients.length) {
                const found = patients.find(p => p.id === patientId);
                if (found) return found;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            return await tauriApiService.supabaseGet<Patient>(
                `/rest/v1/patients?id=eq.${patientId}&select=*`,
                token,
                `patient_${patientId}`
            );
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    return {
        patients,
        loading,
        error,
        refresh: loadPatients,
        getPatient,
    };
}
