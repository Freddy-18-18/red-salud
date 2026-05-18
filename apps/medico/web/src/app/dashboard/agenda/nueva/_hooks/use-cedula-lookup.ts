'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Resultado del lookup de cédula combinando 3 fuentes (en orden):
 *   1. `registered` — paciente ya en el roster del doctor (doctor_patients → profiles)
 *   2. `platform`   — paciente registrado en la plataforma pero NO en el roster
 *                     (el doctor puede atacharlo sin re-registrar)
 *   3. `offline`    — paciente offline previamente registrado por el doctor
 *   4. `cne`        — encontrado solo en el CNE (no registrado en sistema)
 *   5. `not_found`  — no existe en ninguna fuente
 */

export type CedulaLookupKind =
  | 'idle'
  | 'loading'
  | 'registered'
  | 'platform'
  | 'offline'
  | 'cne'
  | 'not_found'
  | 'error';

export interface CedulaLookupResult {
  kind: CedulaLookupKind;
  message?: string;
  /** Para `registered` y `platform`. */
  patient_id?: string;
  /** Para `offline`. */
  offline_patient_id?: string;
  /** Para todos los success: nombre completo del paciente. */
  full_name?: string;
  /** Para `cne`: campos separados. */
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  /** Para todos: cedula normalizada. */
  national_id?: string;
  nacionalidad?: 'V' | 'E';
  phone?: string | null;
  avatar_url?: string | null;
  cne_estado?: string | null;
  cne_municipio?: string | null;
  cne_parroquia?: string | null;
  /** RIF derivado de la cédula (útil para facturación). */
  rif?: string | null;
  /** Dirección del centro electoral — referencia aproximada de domicilio. */
  cne_centro_electoral?: string | null;
}

interface LookupOptions {
  nacionalidad: 'V' | 'E';
  cedula: string;
  /** Si false, NO consulta CNE (solo plataforma). Default true. */
  fallbackToCne?: boolean;
}

/**
 * Hook con debounce que busca un paciente por cédula. Aborta requests
 * previos al cambiar inputs. Retorna `result` + `lookup` manual.
 */
export function useCedulaLookup() {
  const [result, setResult] = useState<CedulaLookupResult>({ kind: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const lookup = useCallback(async (opts: LookupOptions) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const cedulaClean = opts.cedula.replace(/\D/g, '');
    if (!cedulaClean || cedulaClean.length < 6) {
      setResult({ kind: 'idle' });
      return;
    }

    setResult({ kind: 'loading' });

    try {
      // Step 1: lookup local + plataforma.
      const lookupUrl = `/api/patients/lookup?cedula=${encodeURIComponent(
        cedulaClean,
      )}&nacionalidad=${opts.nacionalidad}`;
      const lookupRes = await fetch(lookupUrl, { signal: ctrl.signal });
      const lookupJson = await lookupRes.json();

      if (!lookupRes.ok) {
        setResult({
          kind: 'error',
          message: lookupJson?.message ?? 'Error al consultar el sistema.',
        });
        return;
      }

      const data = lookupJson?.data as
        | { kind: 'registered' | 'platform' | 'offline' | 'not_found'; [k: string]: unknown }
        | undefined;

      if (data?.kind === 'registered') {
        setResult({
          kind: 'registered',
          patient_id: data.patient_id as string,
          full_name: data.full_name as string,
          national_id: data.national_id as string,
          phone: (data.phone as string | null) ?? null,
          avatar_url: (data.avatar_url as string | null) ?? null,
          nacionalidad: opts.nacionalidad,
        });
        return;
      }

      if (data?.kind === 'platform') {
        setResult({
          kind: 'platform',
          patient_id: data.patient_id as string,
          full_name: data.full_name as string,
          national_id: data.national_id as string,
          phone: (data.phone as string | null) ?? null,
          avatar_url: (data.avatar_url as string | null) ?? null,
          nacionalidad: opts.nacionalidad,
        });
        return;
      }

      if (data?.kind === 'offline') {
        setResult({
          kind: 'offline',
          offline_patient_id: data.offline_patient_id as string,
          full_name: data.full_name as string,
          national_id: data.national_id as string,
          phone: (data.phone as string | null) ?? null,
          nacionalidad:
            (data.nacionalidad as 'V' | 'E' | undefined) ?? opts.nacionalidad,
          rif: (data.rif as string | null) ?? null,
          cne_estado: (data.cne_estado as string | null) ?? null,
          cne_municipio: (data.cne_municipio as string | null) ?? null,
          cne_parroquia: (data.cne_parroquia as string | null) ?? null,
          cne_centro_electoral: (data.cne_centro_electoral as string | null) ?? null,
        });
        return;
      }

      // Step 2: CNE fallback.
      if (opts.fallbackToCne === false) {
        setResult({
          kind: 'not_found',
          national_id: cedulaClean,
          nacionalidad: opts.nacionalidad,
        });
        return;
      }

      const cneRes = await fetch('/api/cne/verify-cedula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nacionalidad: opts.nacionalidad,
          cedula: cedulaClean,
        }),
        signal: ctrl.signal,
      });
      const cneJson = await cneRes.json();

      if (cneRes.status === 404 || cneJson?.error) {
        setResult({
          kind: 'not_found',
          national_id: cedulaClean,
          nacionalidad: opts.nacionalidad,
          message: cneJson?.message,
        });
        return;
      }

      if (!cneRes.ok) {
        setResult({
          kind: 'error',
          message: cneJson?.message ?? 'CNE no disponible.',
        });
        return;
      }

      const cne = cneJson.data;
      setResult({
        kind: 'cne',
        full_name: cne.full_name as string,
        primer_nombre: cne.primer_nombre,
        segundo_nombre: cne.segundo_nombre,
        primer_apellido: cne.primer_apellido,
        segundo_apellido: cne.segundo_apellido,
        national_id: cne.cedula,
        nacionalidad: (cne.nacionalidad as 'V' | 'E') ?? opts.nacionalidad,
        cne_estado: cne.cne_estado ?? null,
        cne_municipio: cne.cne_municipio ?? null,
        cne_parroquia: cne.cne_parroquia ?? null,
        rif: cne.rif ?? null,
        cne_centro_electoral: cne.cne_centro_electoral ?? null,
      });
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setResult({
        kind: 'error',
        message: 'No pudimos consultar la cédula. Reintentá.',
      });
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResult({ kind: 'idle' });
  }, []);

  return { result, lookup, reset };
}
