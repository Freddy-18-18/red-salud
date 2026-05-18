'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SelectedPatient } from '../_components/patient-picker';

/**
 * Resuelve la fecha de nacimiento del paciente seleccionado.
 *   - registered / platform → profiles.date_of_birth
 *   - offline               → offline_patients.date_of_birth
 *
 * Necesario para decidir si el paciente es menor de edad (CompanionField).
 * Retorna null mientras carga o si no se sabe.
 */
export function usePatientBirthDate(patient: SelectedPatient | null) {
  const [birthDate, setBirthDate] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) {
      setBirthDate(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (patient.kind === 'registered' || patient.kind === 'platform') {
          const { data } = await supabase
            .from('profiles')
            .select('date_of_birth')
            .eq('id', patient.patient_id)
            .maybeSingle();
          if (!cancelled) setBirthDate(data?.date_of_birth ?? null);
        } else if (patient.kind === 'offline') {
          const { data } = await supabase
            .from('offline_patients')
            .select('date_of_birth')
            .eq('id', patient.offline_patient_id)
            .maybeSingle();
          if (!cancelled) setBirthDate(data?.date_of_birth ?? null);
        }
      } catch {
        if (!cancelled) setBirthDate(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [patient]);

  return birthDate;
}
