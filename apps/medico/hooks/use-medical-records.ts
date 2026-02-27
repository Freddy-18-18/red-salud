import { useMemo, useCallback, useState, useEffect } from "react";
import {
  useMedicalRecords as useSdkMedicalRecords,
  createMedicoSdk
} from "@red-salud/sdk-medico";
import { supabase } from "@/lib/supabase/client";
import type {
  MedicalRecord,
  MedicalRecordFilters,
  MedicalHistorySummary
} from "@red-salud/contracts";

/**
 * Hook to get patient medical history
 */
export function usePatientMedicalRecords(
  patientId: string | undefined,
  filters?: MedicalRecordFilters
) {
  const { records, loading, error, refreshRecords } = useSdkMedicalRecords(supabase, patientId, filters);

  return {
    records: records as any[], // Casting to match local expectations if needed, but ideally should use unified types
    loading,
    error,
    refreshRecords
  };
}

/**
 * Hook to get a specific medical record
 */
export function useMedicalRecord(recordId: string | undefined) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  const loadRecord = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const data = await sdk.records.getRecord(recordId);
      setRecord(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading record');
    } finally {
      setLoading(false);
    }
  }, [recordId, sdk]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  return { record, loading, error };
}

/**
 * Hook to get medical history summary
 */
export function useMedicalHistorySummary(patientId: string | undefined) {
  const [summary, setSummary] = useState<MedicalHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  const loadSummary = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const data = await sdk.records.getHistorySummary(patientId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading summary');
    } finally {
      setLoading(false);
    }
  }, [patientId, sdk]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refreshSummary = useCallback(() => loadSummary(), [loadSummary]);

  return { summary, loading, error, refreshSummary };
}

/**
 * Hook to search medical records
 */
export function useSearchMedicalRecords(patientId: string | undefined) {
  const [results, setResults] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  const search = async (searchTerm: string) => {
    if (!patientId || !searchTerm) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await sdk.records.getPatientRecords(patientId, { searchTerm });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching records');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearSearch };
}

/**
 * Hook to get medical record by appointment
 */
export function useMedicalRecordByAppointment(appointmentId: string | undefined) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  useEffect(() => {
    if (!appointmentId) return;

    const loadRecord = async () => {
      setLoading(true);
      try {
        const { data, error: pError } = await supabase
          .from('medical_records')
          .select('*')
          .eq('appointment_id', appointmentId)
          .single();

        if (pError) throw pError;
        setRecord(data as MedicalRecord);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading record');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [appointmentId]);

  return { record, loading, error };
}
