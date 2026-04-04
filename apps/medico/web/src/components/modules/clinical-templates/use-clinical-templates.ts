'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ClinicalTemplate {
  id: string;
  doctor_id: string | null;
  specialty_slug: string | null;
  title: string;
  description: string | null;
  category: 'soap' | 'progress_note' | 'referral' | 'discharge' | 'custom';
  /** SOAP sections */
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  /** Default vital signs checklist */
  vital_signs_checklist: string[];
  /** Default ICD code suggestions */
  default_icd_codes: string[];
  /** Searchable tags */
  tags: string[];
  /** Is this a system template (not editable by doctor) */
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClinicalTemplate {
  title: string;
  description?: string | null;
  category?: ClinicalTemplate['category'];
  specialty_slug?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  vital_signs_checklist?: string[];
  default_icd_codes?: string[];
  tags?: string[];
}

interface UseTemplatesOptions {
  category?: string;
  includeSystem?: boolean;
}

interface UseTemplatesReturn {
  templates: ClinicalTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: CreateClinicalTemplate) => Promise<ClinicalTemplate | null>;
  updateTemplate: (id: string, data: Partial<CreateClinicalTemplate>) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useClinicalTemplates(
  doctorId: string,
  specialtySlug: string,
  options?: UseTemplatesOptions,
): UseTemplatesReturn {
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch templates
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchTemplates() {
      // Fetch doctor's custom templates + system templates for this specialty
      let query = supabase
        .from('clinical_templates')
        .select('*')
        .order('title', { ascending: true });

      if (options?.includeSystem !== false) {
        // Get both doctor's templates and system templates
        query = query.or(
          `doctor_id.eq.${doctorId},and(is_system.eq.true,or(specialty_slug.eq.${specialtySlug},specialty_slug.is.null))`,
        );
      } else {
        query = query.eq('doctor_id', doctorId);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setTemplates([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setTemplates([]);
      } else {
        const mapped: ClinicalTemplate[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          specialty_slug: row.specialty_slug,
          title: row.title ?? 'Sin título',
          description: row.description,
          category: row.category ?? 'custom',
          subjective: row.subjective,
          objective: row.objective,
          assessment: row.assessment,
          plan: row.plan,
          vital_signs_checklist: row.vital_signs_checklist ?? [],
          default_icd_codes: row.default_icd_codes ?? [],
          tags: row.tags ?? [],
          is_system: row.is_system ?? false,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setTemplates(mapped);
      }
      setLoading(false);
    }

    fetchTemplates();
    return () => { cancelled = true; };
  }, [doctorId, specialtySlug, options?.category, options?.includeSystem, refreshKey]);

  // Create template
  const createTemplate = useCallback(
    async (data: CreateClinicalTemplate): Promise<ClinicalTemplate | null> => {
      const { data: row, error: insertError } = await supabase
        .from('clinical_templates')
        .insert({
          doctor_id: doctorId,
          specialty_slug: data.specialty_slug ?? specialtySlug,
          ...data,
          is_system: false,
          vital_signs_checklist: data.vital_signs_checklist ?? [],
          default_icd_codes: data.default_icd_codes ?? [],
          tags: data.tags ?? [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as ClinicalTemplate;
    },
    [doctorId, specialtySlug, refresh],
  );

  // Update template
  const updateTemplate = useCallback(
    async (id: string, data: Partial<CreateClinicalTemplate>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('clinical_templates')
        .update(data)
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .eq('is_system', false);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  // Delete template (only custom ones)
  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('clinical_templates')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .eq('is_system', false);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  return { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, refresh };
}
