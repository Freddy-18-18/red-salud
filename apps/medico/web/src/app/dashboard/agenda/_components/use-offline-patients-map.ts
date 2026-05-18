'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface OfflinePatientMini {
  id: string;
  full_name: string;
  phone: string | null;
  cedula: string;
  nacionalidad: string;
}

/**
 * Carga todos los offline_patients del doctor logueado y los devuelve indexados
 * por id. Usado por la agenda para resolver el nombre del paciente cuando una
 * cita tiene `offline_patient_id` en lugar de `patient_id`.
 *
 * Se re-fetchea cuando cambia el doctorId. El roster offline crece despacio
 * (lo escribe el doctor manualmente), no requiere realtime aggressive.
 */
export function useOfflinePatientsMap(doctorId: string | null) {
  const [map, setMap] = useState<Map<string, OfflinePatientMini>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      setMap(new Map());
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('offline_patients')
        .select('id, full_name, phone, cedula, nacionalidad')
        .eq('doctor_id', doctorId);

      if (cancelled) return;
      if (error || !data) {
        setMap(new Map());
        setLoading(false);
        return;
      }

      const next = new Map<string, OfflinePatientMini>();
      for (const row of data as OfflinePatientMini[]) {
        next.set(row.id, row);
      }
      setMap(next);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  return { map, loading };
}
