'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Obtiene el precio de consulta del doctor para pre-fill del campo de pago.
 * Sin doctorId → null + loading false.
 *
 * Usa la columna `consultation_fee` de doctor_profiles (numeric, nullable).
 * La lectura usa `maybeSingle` porque no todos los doctores tienen un precio
 * configurado.
 */
export function useDoctorPrice(doctorId: string | null) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) {
      setPrice(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('consultation_fee')
        .eq('profile_id', doctorId)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setPrice(null);
        setLoading(false);
        return;
      }

      const raw = (data as { consultation_fee?: string | number | null })
        .consultation_fee;
      const num = raw == null ? null : Number(raw);
      setPrice(Number.isFinite(num) ? num : null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  return { price, loading };
}
