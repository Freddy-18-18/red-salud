'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { EndoscopyProcedureType, EndoscopyReportData } from './endoscopy-procedures-data';

// ============================================================================
// TYPES
// ============================================================================

export type EndoscopyStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed';

export interface EndoscopyRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  procedure_type: EndoscopyProcedureType;
  status: EndoscopyStatus;
  report_data: EndoscopyReportData;
  created_at: string;
  updated_at: string;
}

export interface CreateEndoscopyRecord {
  patient_id?: string | null;
  procedure_type: EndoscopyProcedureType;
  status?: EndoscopyStatus;
  report_data: EndoscopyReportData;
}

interface UseEndoscopyOptions {
  patientId?: string;
  procedureType?: EndoscopyProcedureType;
  status?: EndoscopyStatus;
  limit?: number;
}

interface UseEndoscopyReturn {
  records: EndoscopyRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateEndoscopyRecord) => Promise<EndoscopyRecord | null>;
  update: (id: string, data: Partial<CreateEndoscopyRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEndoscopy(
  doctorId: string,
  options?: UseEndoscopyOptions,
): UseEndoscopyReturn {
  const [records, setRecords] = useState<EndoscopyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Fetch records ──────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRecords() {
      // Use diagnostic_imaging table with study_type matching the procedure
      let query = supabase
        .from('diagnostic_imaging')
        .select('*, profiles!diagnostic_imaging_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .like('study_type', 'endoscopy_%')
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.procedureType) {
        query = query.eq('study_type', `endoscopy_${options.procedureType}`);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setRecords([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setRecords([]);
      } else {
        const mapped: EndoscopyRecord[] = (data ?? []).map((row: any) => {
          const studyType = (row.study_type ?? '').replace('endoscopy_', '') as EndoscopyProcedureType;

          // Report data is stored in the findings JSONB column
          let reportData: EndoscopyReportData;
          try {
            reportData = typeof row.findings === 'object' && row.findings !== null
              ? row.findings as EndoscopyReportData
              : { procedureType: studyType } as EndoscopyReportData;
          } catch {
            reportData = { procedureType: studyType } as EndoscopyReportData;
          }

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            procedure_type: studyType,
            status: (row.status ?? 'draft') as EndoscopyStatus,
            report_data: reportData,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });
        setRecords(mapped);
      }
      setLoading(false);
    }

    fetchRecords();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.procedureType, options?.status, options?.limit, refreshKey]);

  // ── Create record ──────────────────────────────────────────────
  const create = useCallback(
    async (data: CreateEndoscopyRecord): Promise<EndoscopyRecord | null> => {
      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: `endoscopy_${data.procedure_type}`,
          body_region: data.procedure_type,
          status: data.status ?? 'draft',
          clinical_indication: data.report_data.indication || null,
          findings: data.report_data as unknown as Record<string, unknown>,
          conclusion: data.report_data.recommendations || null,
          equipment: data.report_data.scopeModel || null,
          technique: data.report_data.sedationType || null,
          image_urls: data.report_data.photoUrls ?? [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return {
        id: row.id,
        doctor_id: row.doctor_id,
        patient_id: row.patient_id,
        procedure_type: data.procedure_type,
        status: row.status as EndoscopyStatus,
        report_data: data.report_data,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    },
    [doctorId, refresh],
  );

  // ── Update record ──────────────────────────────────────────────
  const update = useCallback(
    async (id: string, data: Partial<CreateEndoscopyRecord>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = {};

      if (data.status) {
        updatePayload.status = data.status;
      }
      if (data.report_data) {
        updatePayload.findings = data.report_data as unknown as Record<string, unknown>;
        updatePayload.clinical_indication = data.report_data.indication || null;
        updatePayload.conclusion = data.report_data.recommendations || null;
        updatePayload.equipment = data.report_data.scopeModel || null;
        updatePayload.technique = data.report_data.sedationType || null;
        updatePayload.image_urls = data.report_data.photoUrls ?? [];
      }

      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
        .update(updatePayload)
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

  // ── Delete record ──────────────────────────────────────────────
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('diagnostic_imaging')
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

  return { records, loading, error, create, update, remove, refresh };
}
