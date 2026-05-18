'use client';

import { useEffect, useState } from 'react';

export interface InsuranceProvider {
  id: string;
  name: string;
  slug: string | null;
  website: string | null;
  hcm_supported: boolean;
}

/**
 * Carga el catálogo de aseguradoras activas (vía /api/insurance/providers).
 * Cache simple in-component — el catálogo cambia raramente, no es crítico.
 */
export function useInsuranceProviders() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/insurance/providers');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json.error) {
          setError(json?.message ?? 'No pudimos cargar las aseguradoras.');
          return;
        }
        setProviders(json.data ?? []);
      } catch {
        if (!cancelled) setError('Error de red al cargar aseguradoras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { providers, loading, error };
}
