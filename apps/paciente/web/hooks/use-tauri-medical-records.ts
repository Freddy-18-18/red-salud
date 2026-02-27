"use client";

import { useState, useEffect, useCallback } from "react";
import { tauriApiService } from "@/lib/services/tauri-api-service";
import { supabase } from "@/lib/supabase/client";

export interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    treatment: string;
    created_at: string;
    [key: string]: unknown;
}

export function useTauriMedicalRecords(patientId: string) {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRecords = useCallback(async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            const cached = await tauriApiService.getOfflineData<MedicalRecord[]>(`records_${patientId}`);
            if (cached) setRecords(cached);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const data = await tauriApiService.supabaseGet<MedicalRecord[]>(
                `/rest/v1/medical_records?patient_id=eq.${patientId}&select=*&order=created_at.desc`,
                token,
                `records_${patientId}`
            );
            setRecords(data);
            setError(null);
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (!records.length) setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [patientId, records.length]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const createRecord = async (recordData: Omit<MedicalRecord, 'id' | 'created_at'>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const newRecord = await tauriApiService.supabasePost<MedicalRecord>(
                "/rest/v1/medical_records",
                recordData,
                token
            );
            setRecords((prev) => [newRecord, ...prev]);
            return newRecord;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    const updateRecord = async (id: string, updates: Partial<MedicalRecord>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            const updated = await tauriApiService.supabasePatch<MedicalRecord>(
                `/rest/v1/medical_records?id=eq.${id}`,
                updates,
                token
            );
            setRecords((prev) =>
                prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
            );
            return updated;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            throw new Error(errorMessage);
        }
    };

    return {
        records,
        loading,
        error,
        refresh: loadRecords,
        createRecord,
        updateRecord,
    };
}
