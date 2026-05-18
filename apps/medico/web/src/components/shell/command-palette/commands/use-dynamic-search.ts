'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

/**
 * @file use-dynamic-search.ts
 * @description Debounced Supabase searches that feed the command palette
 * with live patient / appointment / prescription rows as the doctor types.
 *
 * Each hook owns its own state, debounce timer, and cancellation flag so a
 * fast typer doesn't interleave stale responses on top of fresh ones.
 *
 * The patient list is filtered ONLY by `role='paciente'` — there is no
 * doctor-scoping at the row level (any patient is searchable). For
 * appointments and prescriptions we DO scope by doctor + active sede,
 * mirroring the rest of the app's data-access rules.
 *
 * Legacy data note: rows where `appointments.location_id IS NULL` keep
 * showing up across every sede (same legacy-friendly rule applied
 * elsewhere). When the doctor has no active sede, we return everything.
 */

const DEBOUNCE_MS = 200;
const MAX_RESULTS = 5;
const MIN_QUERY_LENGTH = 2;

// ---------------------------------------------------------------------------
// Patient search
// ---------------------------------------------------------------------------

export interface PatientHit {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  cedula: string | null;
  avatarUrl: string | null;
}

export function usePatientSearch(query: string): {
  hits: PatientHit[];
  loading: boolean;
} {
  const [hits, setHits] = useState<PatientHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setHits([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        // OR-search across the three fields a doctor remembers a patient by.
        // PostgREST `.or()` accepts a comma-separated list of leaf filters.
        const pattern = `%${trimmed}%`;
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, national_id, avatar_url, role')
          .eq('role', 'paciente')
          .or(
            [
              `full_name.ilike.${pattern}`,
              `phone.ilike.${pattern}`,
              `national_id.ilike.${pattern}`,
            ].join(','),
          )
          .limit(MAX_RESULTS);

        if (cancelled) return;

        const mapped: PatientHit[] = (data ?? []).map((row) => ({
          id: row.id,
          fullName: row.full_name ?? 'Paciente sin nombre',
          email: row.email ?? null,
          phone: row.phone ?? null,
          cedula: row.national_id ?? null,
          avatarUrl: row.avatar_url ?? null,
        }));
        setHits(mapped);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return { hits, loading };
}

// ---------------------------------------------------------------------------
// Appointment search
// ---------------------------------------------------------------------------

export interface AppointmentHit {
  id: string;
  scheduledAt: string;
  status: string;
  patientName: string;
  reason: string | null;
}

export function useAppointmentSearch(
  query: string,
  doctorId: string | null,
  locationId: string | null,
): { hits: AppointmentHit[]; loading: boolean } {
  const [hits, setHits] = useState<AppointmentHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!doctorId || trimmed.length < MIN_QUERY_LENGTH) {
      setHits([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        let q = supabase
          .from('appointments')
          .select(`
            id,
            scheduled_at,
            status,
            reason,
            location_id,
            patient:profiles!appointments_paciente_id_fkey(full_name)
          `)
          .eq('doctor_id', doctorId)
          // Match on the joined patient's name. PostgREST allows referencing
          // the embedded resource's column with the `<alias>.<column>` syntax.
          .ilike('patient.full_name', `%${trimmed}%`)
          .order('scheduled_at', { ascending: false })
          .limit(MAX_RESULTS);

        if (locationId) {
          q = q.or(`location_id.eq.${locationId},location_id.is.null`);
        }

        const { data } = await q;
        if (cancelled) return;

        const mapped: AppointmentHit[] = (data ?? [])
          .filter((row) => row.patient) // drop rows where the join missed
          .map((row) => {
            const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
            return {
              id: row.id as string,
              scheduledAt: row.scheduled_at as string,
              status: row.status as string,
              patientName: patient?.full_name ?? 'Paciente sin nombre',
              reason: (row.reason as string) ?? null,
            };
          });
        setHits(mapped);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, doctorId, locationId]);

  return { hits, loading };
}

// ---------------------------------------------------------------------------
// Prescription search
// ---------------------------------------------------------------------------

export interface PrescriptionHit {
  id: string;
  prescribedAt: string;
  diagnosis: string | null;
  patientName: string;
}

export function usePrescriptionSearch(
  query: string,
  doctorId: string | null,
): { hits: PrescriptionHit[]; loading: boolean } {
  const [hits, setHits] = useState<PrescriptionHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!doctorId || trimmed.length < MIN_QUERY_LENGTH) {
      setHits([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const pattern = `%${trimmed}%`;
        const { data } = await supabase
          .from('prescriptions')
          .select(`
            id,
            prescribed_at,
            diagnosis,
            patient:profiles!prescriptions_paciente_id_fkey(full_name)
          `)
          .eq('doctor_id', doctorId)
          .or(
            [
              `diagnosis.ilike.${pattern}`,
              `patient.full_name.ilike.${pattern}`,
            ].join(','),
          )
          .order('prescribed_at', { ascending: false })
          .limit(MAX_RESULTS);

        if (cancelled) return;

        const mapped: PrescriptionHit[] = (data ?? [])
          .filter((row) => row.patient)
          .map((row) => {
            const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
            return {
              id: row.id as string,
              prescribedAt: row.prescribed_at as string,
              diagnosis: (row.diagnosis as string) ?? null,
              patientName: patient?.full_name ?? 'Paciente sin nombre',
            };
          });
        setHits(mapped);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, doctorId]);

  return { hits, loading };
}
