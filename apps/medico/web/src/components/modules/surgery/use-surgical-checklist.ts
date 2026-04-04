'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ChecklistPhaseId, ChecklistDefinition } from './surgical-checklists-data';
import { getChecklistById, getTotalItems } from './surgical-checklists-data';

// ============================================================================
// TYPES
// ============================================================================

export type ChecklistStatus = 'in_progress' | 'completed' | 'cancelled';

export interface ChecklistItemCompletion {
  item_id: string;
  checked: boolean;
  notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
}

export interface ChecklistPhaseCompletion {
  phase_id: string;
  items: ChecklistItemCompletion[];
  started_at: string | null;
  completed_at: string | null;
}

export interface SurgicalChecklistRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  checklist_type: string;
  status: ChecklistStatus;
  phases: ChecklistPhaseCompletion[];
  completion_pct: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSurgicalChecklist {
  patient_id?: string | null;
  checklist_type: string;
  notes?: string | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate overall completion percentage from phase completions.
 */
export function calculateCompletionPct(
  phases: ChecklistPhaseCompletion[],
): number {
  const total = phases.reduce((sum, p) => sum + p.items.length, 0);
  if (total === 0) return 0;
  const checked = phases.reduce(
    (sum, p) => sum + p.items.filter((i) => i.checked).length,
    0,
  );
  return Math.round((checked / total) * 100);
}

/**
 * Calculate completion percentage for a single phase.
 */
export function phaseCompletionPct(phase: ChecklistPhaseCompletion): number {
  if (phase.items.length === 0) return 0;
  const checked = phase.items.filter((i) => i.checked).length;
  return Math.round((checked / phase.items.length) * 100);
}

/**
 * Check if all mandatory items in a phase are completed.
 */
export function phaseMandatoryComplete(
  phase: ChecklistPhaseCompletion,
  definition: ChecklistDefinition,
): boolean {
  const phaseDef = definition.phases.find((p) => p.id === phase.phase_id);
  if (!phaseDef) return true;

  return phaseDef.items
    .filter((item) => item.mandatory)
    .every((item) => {
      const completion = phase.items.find((i) => i.item_id === item.id);
      return completion?.checked ?? false;
    });
}

/**
 * Initialize empty phase completions from a checklist definition.
 */
function initPhaseCompletions(
  definition: ChecklistDefinition,
): ChecklistPhaseCompletion[] {
  return definition.phases.map((phase) => ({
    phase_id: phase.id,
    items: phase.items.map((item) => ({
      item_id: item.id,
      checked: false,
      notes: null,
      completed_at: null,
      completed_by: null,
    })),
    started_at: null,
    completed_at: null,
  }));
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseSurgicalChecklistOptions {
  patientId?: string;
  status?: ChecklistStatus;
  checklistType?: string;
  limit?: number;
}

interface UseSurgicalChecklistReturn {
  checklists: SurgicalChecklistRecord[];
  loading: boolean;
  error: string | null;
  createChecklist: (data: CreateSurgicalChecklist) => Promise<SurgicalChecklistRecord | null>;
  updateItem: (
    checklistId: string,
    phaseId: string,
    itemId: string,
    checked: boolean,
    notes?: string | null,
  ) => Promise<boolean>;
  completeChecklist: (id: string) => Promise<boolean>;
  removeChecklist: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSurgicalChecklist(
  doctorId: string,
  options?: UseSurgicalChecklistOptions,
): UseSurgicalChecklistReturn {
  const [checklists, setChecklists] = useState<SurgicalChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Fetch checklists ────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchChecklists() {
      let query = supabase
        .from('clinical_templates')
        .select('*, profiles!clinical_templates_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .eq('type', 'procedure')
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
          setChecklists([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setChecklists([]);
      } else {
        const mapped: SurgicalChecklistRecord[] = (data ?? []).map((row: any) => {
          const content = typeof row.content === 'object' && row.content !== null
            ? row.content
            : {};

          const phases: ChecklistPhaseCompletion[] = Array.isArray(content.phases)
            ? content.phases
            : [];

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            checklist_type: content.checklist_type ?? 'who-safe-surgery',
            status: content.status ?? 'in_progress',
            phases,
            completion_pct: calculateCompletionPct(phases),
            notes: content.notes ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });

        let filtered = mapped;
        if (options?.status) {
          filtered = filtered.filter((c) => c.status === options.status);
        }
        if (options?.checklistType) {
          filtered = filtered.filter((c) => c.checklist_type === options.checklistType);
        }

        setChecklists(filtered);
      }
      setLoading(false);
    }

    fetchChecklists();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.status, options?.checklistType, options?.limit, refreshKey]);

  // ── Create checklist ──────────────────────────────────────────
  const createChecklist = useCallback(
    async (data: CreateSurgicalChecklist): Promise<SurgicalChecklistRecord | null> => {
      const definition = getChecklistById(data.checklist_type);
      if (!definition) {
        setError(`Tipo de checklist no encontrado: ${data.checklist_type}`);
        return null;
      }

      const phases = initPhaseCompletions(definition);
      const content = {
        checklist_type: data.checklist_type,
        status: 'in_progress' as ChecklistStatus,
        phases,
        notes: data.notes ?? null,
      };

      const { data: row, error: insertError } = await supabase
        .from('clinical_templates')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          type: 'procedure',
          name: definition.name,
          content,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as SurgicalChecklistRecord;
    },
    [doctorId, refresh],
  );

  // ── Update item ─────────────────────────────────────────────
  const updateItem = useCallback(
    async (
      checklistId: string,
      phaseId: string,
      itemId: string,
      checked: boolean,
      notes?: string | null,
    ): Promise<boolean> => {
      const { data: current, error: readError } = await supabase
        .from('clinical_templates')
        .select('content')
        .eq('id', checklistId)
        .eq('doctor_id', doctorId)
        .single();

      if (readError) {
        setError(readError.message);
        return false;
      }

      const content = typeof current.content === 'object' && current.content !== null
        ? { ...current.content as Record<string, unknown> }
        : {};

      const phases: ChecklistPhaseCompletion[] = Array.isArray(content.phases)
        ? JSON.parse(JSON.stringify(content.phases))
        : [];

      const phase = phases.find((p) => p.phase_id === phaseId);
      if (!phase) {
        setError(`Fase no encontrada: ${phaseId}`);
        return false;
      }

      const item = phase.items.find((i) => i.item_id === itemId);
      if (!item) {
        setError(`Item no encontrado: ${itemId}`);
        return false;
      }

      item.checked = checked;
      item.completed_at = checked ? new Date().toISOString() : null;
      if (notes !== undefined) item.notes = notes;

      // Track phase timestamps
      if (!phase.started_at && checked) {
        phase.started_at = new Date().toISOString();
      }
      const allChecked = phase.items.every((i) => i.checked);
      phase.completed_at = allChecked ? new Date().toISOString() : null;

      content.phases = phases;

      // Auto-complete if all phases done
      const allPhasesComplete = phases.every((p) => p.completed_at !== null);
      if (allPhasesComplete) {
        content.status = 'completed';
      }

      const { error: updateError } = await supabase
        .from('clinical_templates')
        .update({ content })
        .eq('id', checklistId)
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

  // ── Complete checklist ──────────────────────────────────────
  const completeChecklist = useCallback(
    async (id: string): Promise<boolean> => {
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

      const content = typeof current.content === 'object' && current.content !== null
        ? { ...current.content as Record<string, unknown> }
        : {};

      content.status = 'completed';

      const { error: updateError } = await supabase
        .from('clinical_templates')
        .update({ content })
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

  // ── Remove checklist ──────────────────────────────────────
  const removeChecklist = useCallback(
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

  return {
    checklists,
    loading,
    error,
    createChecklist,
    updateItem,
    completeChecklist,
    removeChecklist,
    refresh,
  };
}
