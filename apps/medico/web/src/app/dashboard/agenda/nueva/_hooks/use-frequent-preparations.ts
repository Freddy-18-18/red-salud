'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Devuelve las preparaciones que el doctor usó más recientemente en sus
 * citas — sirven como sugerencias para el autocomplete inline del campo
 * "Otra preparación".
 *
 * Lee de `appointments.preparation_items` (text[]). Trae las últimas 200
 * citas con preparation_items no vacío, aplana, dedupe case-insensitive
 * conservando la capitalización del más reciente, y devuelve top-N.
 *
 * Si el doctor nunca usó preparaciones, devuelve []. El input sigue
 * funcionando sin autocomplete (solo escritura libre).
 */
export function useFrequentPreparations(
  doctorId: string | null,
  limit: number = 20,
) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('preparation_items, scheduled_at')
        .eq('doctor_id', doctorId)
        .not('preparation_items', 'is', null)
        .order('scheduled_at', { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (error || !data) {
        setItems([]);
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const unique: string[] = [];

      for (const row of data) {
        const prep = (row as { preparation_items?: string[] | null }).preparation_items;
        if (!prep || !Array.isArray(prep)) continue;

        for (const raw of prep) {
          const cleaned = (raw ?? '').toString().trim();
          if (cleaned.length === 0) continue;
          const key = cleaned.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(cleaned);
          if (unique.length >= limit) break;
        }
        if (unique.length >= limit) break;
      }

      setItems(unique);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId, limit]);

  return { items, loading };
}
