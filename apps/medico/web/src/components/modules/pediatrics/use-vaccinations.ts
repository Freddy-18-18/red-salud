'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  type VaccineRoute,
  type VaccineSite,
  type VaccineStatus,
  VACCINATION_SCHEDULE,
  getApplicableDoses,
  computeVaccineStatus,
  getDaysUntilDue,
} from './vaccination-schedule';

// ============================================================================
// TYPES
// ============================================================================

export interface VaccinationRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  vaccine_id: string;
  vaccine_name: string;
  dose_number: number;
  date_administered: string;
  lot_number: string | null;
  site: VaccineSite | null;
  route: VaccineRoute | null;
  adverse_reactions: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateVaccinationRecord {
  patient_id: string;
  vaccine_id: string;
  vaccine_name: string;
  dose_number: number;
  date_administered: string;
  lot_number?: string | null;
  site?: VaccineSite | null;
  route?: VaccineRoute | null;
  adverse_reactions?: string | null;
  notes?: string | null;
}

export interface VaccineScheduleStatus {
  vaccineId: string;
  vaccineName: string;
  doseNumber: number;
  doseLabel: string;
  recommendedAgeMonths: number;
  status: VaccineStatus;
  dateAdministered?: string;
  daysUntilDue: number;
  record?: VaccinationRecord;
}

interface UseVaccinationsOptions {
  patientId?: string;
  patientDob?: string;
  patientSex?: 'male' | 'female';
}

interface UseVaccinationsReturn {
  records: VaccinationRecord[];
  scheduleStatus: VaccineScheduleStatus[];
  loading: boolean;
  error: string | null;
  addRecord: (data: CreateVaccinationRecord) => Promise<VaccinationRecord | null>;
  updateRecord: (id: string, data: Partial<CreateVaccinationRecord>) => Promise<boolean>;
  deleteRecord: (id: string) => Promise<boolean>;
  /** Counts by status */
  stats: {
    administered: number;
    pending: number;
    overdue: number;
    upcoming: number;
    total: number;
  };
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useVaccinations(
  doctorId: string,
  options?: UseVaccinationsOptions,
): UseVaccinationsReturn {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Fetch ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRecords() {
      let query = supabase
        .from('pediatrics_vaccines')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date_administered', { ascending: true });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setRecords([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setRecords([]);
      } else {
        const mapped: VaccinationRecord[] = (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          patient_id: row.patient_id as string,
          doctor_id: row.doctor_id as string,
          vaccine_id: row.vaccine_id as string,
          vaccine_name: row.vaccine_name as string,
          dose_number: (row.dose_number as number) ?? 1,
          date_administered: row.date_administered as string,
          lot_number: (row.lot_number as string) ?? null,
          site: (row.site as VaccineSite) ?? null,
          route: (row.route as VaccineRoute) ?? null,
          adverse_reactions: (row.adverse_reactions as string) ?? null,
          notes: (row.notes as string) ?? null,
          created_at: row.created_at as string,
        }));
        setRecords(mapped);
      }
      setLoading(false);
    }

    fetchRecords();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, refreshKey]);

  // ── Create ──────────────────────────────────────────────────────────────

  const addRecord = useCallback(
    async (data: CreateVaccinationRecord): Promise<VaccinationRecord | null> => {
      const { data: row, error: insertError } = await supabase
        .from('pediatrics_vaccines')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id,
          vaccine_id: data.vaccine_id,
          vaccine_name: data.vaccine_name,
          dose_number: data.dose_number,
          date_administered: data.date_administered,
          lot_number: data.lot_number ?? null,
          site: data.site ?? null,
          route: data.route ?? null,
          adverse_reactions: data.adverse_reactions ?? null,
          notes: data.notes ?? null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as VaccinationRecord;
    },
    [doctorId, refresh],
  );

  // ── Update ──────────────────────────────────────────────────────────────

  const updateRecord = useCallback(
    async (id: string, data: Partial<CreateVaccinationRecord>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('pediatrics_vaccines')
        .update(data)
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  // ── Delete ──────────────────────────────────────────────────────────────

  const deleteRecord = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('pediatrics_vaccines')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  // ── Schedule status ─────────────────────────────────────────────────────

  const scheduleStatus = useMemo<VaccineScheduleStatus[]>(() => {
    if (!options?.patientDob || !options?.patientSex) return [];

    const dob = new Date(options.patientDob);
    const sex = options.patientSex;
    const applicableDoses = getApplicableDoses(sex);

    return applicableDoses.map(({ entry, dose }) => {
      // Check if this dose has been administered
      const matchingRecord = records.find(
        (r) => r.vaccine_id === entry.id && r.dose_number === dose.doseNumber,
      );

      const isAdministered = !!matchingRecord;
      const status = computeVaccineStatus(dob, dose, isAdministered);
      const daysUntilDue = getDaysUntilDue(dob, dose.ageMonths);

      return {
        vaccineId: entry.id,
        vaccineName: entry.vaccine,
        doseNumber: dose.doseNumber,
        doseLabel: dose.label,
        recommendedAgeMonths: dose.ageMonths,
        status,
        dateAdministered: matchingRecord?.date_administered,
        daysUntilDue,
        record: matchingRecord,
      };
    });
  }, [records, options?.patientDob, options?.patientSex]);

  // ── Stats ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const counts = {
      administered: 0,
      pending: 0,
      overdue: 0,
      upcoming: 0,
      total: scheduleStatus.length,
    };

    for (const s of scheduleStatus) {
      switch (s.status) {
        case 'administered':
          counts.administered++;
          break;
        case 'pending':
          counts.pending++;
          break;
        case 'overdue':
          counts.overdue++;
          break;
        case 'upcoming':
          counts.upcoming++;
          break;
      }
    }

    return counts;
  }, [scheduleStatus]);

  return {
    records,
    scheduleStatus,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    stats,
    refresh,
  };
}
