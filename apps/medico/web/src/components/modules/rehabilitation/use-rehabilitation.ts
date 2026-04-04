'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ScaleType } from './rehab-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface RomEntry {
  joint_id: string;
  movement_id: string;
  active_left: number | null;
  active_right: number | null;
  passive_left: number | null;
  passive_right: number | null;
}

export interface MmtEntry {
  muscle_id: string;
  grade_left: number;
  grade_right: number;
}

export interface ScaleScore {
  scale_id: ScaleType;
  scores: Record<string, number>;
  total: number;
}

export interface RehabSession {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  date: string;
  rom_entries: RomEntry[];
  mmt_entries: MmtEntry[];
  scale_scores: ScaleScore[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRehabSession {
  patient_id?: string | null;
  date?: string;
  rom_entries?: RomEntry[];
  mmt_entries?: MmtEntry[];
  scale_scores?: ScaleScore[];
  notes?: string | null;
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseRehabilitationOptions {
  patientId?: string;
  limit?: number;
}

interface UseRehabilitationReturn {
  sessions: RehabSession[];
  loading: boolean;
  error: string | null;
  createSession: (data: CreateRehabSession) => Promise<RehabSession | null>;
  updateSession: (id: string, data: Partial<CreateRehabSession>) => Promise<boolean>;
  removeSession: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useRehabilitation(
  doctorId: string,
  options?: UseRehabilitationOptions,
): UseRehabilitationReturn {
  const [sessions, setSessions] = useState<RehabSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Fetch sessions ──────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchSessions() {
      let query = supabase
        .from('clinical_templates')
        .select('*, profiles!clinical_templates_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .eq('type', 'rehabilitation')
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setSessions([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setSessions([]);
      } else {
        const mapped: RehabSession[] = (data ?? []).map((row: any) => {
          const content = typeof row.content === 'object' && row.content !== null
            ? row.content
            : {};

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            date: content.date ?? row.created_at,
            rom_entries: Array.isArray(content.rom_entries) ? content.rom_entries : [],
            mmt_entries: Array.isArray(content.mmt_entries) ? content.mmt_entries : [],
            scale_scores: Array.isArray(content.scale_scores) ? content.scale_scores : [],
            notes: content.notes ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });

        setSessions(mapped);
      }
      setLoading(false);
    }

    fetchSessions();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // ── Create session ──────────────────────────────────────────
  const createSession = useCallback(
    async (data: CreateRehabSession): Promise<RehabSession | null> => {
      const content = {
        date: data.date ?? new Date().toISOString(),
        rom_entries: data.rom_entries ?? [],
        mmt_entries: data.mmt_entries ?? [],
        scale_scores: data.scale_scores ?? [],
        notes: data.notes ?? null,
      };

      const { data: row, error: insertError } = await supabase
        .from('clinical_templates')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          type: 'rehabilitation',
          name: `Sesion de rehabilitacion — ${new Date(content.date).toLocaleDateString('es-VE')}`,
          content,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as RehabSession;
    },
    [doctorId, refresh],
  );

  // ── Update session ──────────────────────────────────────────
  const updateSession = useCallback(
    async (id: string, data: Partial<CreateRehabSession>): Promise<boolean> => {
      const { data: current, error: readError } = await supabase
        .from('clinical_templates')
        .select('content')
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .single();

      if (readError) {
        setError(readError.message);
        return false;
      }

      const currentContent = typeof current.content === 'object' && current.content !== null
        ? { ...current.content as Record<string, unknown> }
        : {};

      if (data.date !== undefined) currentContent.date = data.date;
      if (data.rom_entries !== undefined) currentContent.rom_entries = data.rom_entries;
      if (data.mmt_entries !== undefined) currentContent.mmt_entries = data.mmt_entries;
      if (data.scale_scores !== undefined) currentContent.scale_scores = data.scale_scores;
      if (data.notes !== undefined) currentContent.notes = data.notes;

      const { error: updateError } = await supabase
        .from('clinical_templates')
        .update({ content: currentContent })
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

  // ── Remove session ──────────────────────────────────────────
  const removeSession = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('clinical_templates')
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

  return { sessions, loading, error, createSession, updateSession, removeSession, refresh };
}
