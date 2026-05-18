'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Returns the top-N most-recent unique non-empty reasons used by this doctor.
 * Used as autocomplete suggestions in the "motivo de consulta" field.
 *
 * Pulls from the last 200 appointments (any status) and dedupes case-insensitive,
 * preserving the most recent capitalization. Cap at `limit` (default 10).
 */
export function useFrequentReasons(
  doctorId: string | null,
  limit: number = 10,
) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      setReasons([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('reason, scheduled_at')
        .eq('doctor_id', doctorId)
        .not('reason', 'is', null)
        .order('scheduled_at', { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (error || !data) {
        setReasons([]);
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const unique: string[] = [];
      for (const row of data) {
        const r = (row.reason ?? '').toString().trim();
        if (r.length === 0) continue;
        const key = r.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(r);
        if (unique.length >= limit) break;
      }

      setReasons(unique);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId, limit]);

  return { reasons, loading };
}
