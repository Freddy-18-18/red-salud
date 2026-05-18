'use client';

import { useEffect, useState } from 'react';
import { listSedes } from '@/lib/sedes/service';
import type { DoctorPracticeLocation } from '@/lib/sedes/types';

/**
 * Carga las sedes activas del doctor (ordenadas: primary first, luego por
 * antigüedad). Usado por el form de nueva cita para mostrar selector
 * cuando hay más de una sede, o readonly cuando solo hay una.
 */
export function usePracticeLocations(doctorId: string | null) {
  const [sedes, setSedes] = useState<DoctorPracticeLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setSedes([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    listSedes(doctorId)
      .then((rows) => {
        if (!cancelled) setSedes(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const primary = sedes.find((s) => s.is_primary) ?? sedes[0] ?? null;

  return { sedes, primary, loading, error };
}
