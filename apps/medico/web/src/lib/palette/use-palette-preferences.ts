'use client';

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

import {
  getPaletteConfig,
  resetPaletteConfig,
  savePaletteConfig,
} from './service';
import { EMPTY_PALETTE_CONFIG, type PaletteConfig } from './types';

/**
 * @file use-palette-preferences.ts
 * @description Read + mutate the doctor's palette personalisation with an
 * optimistic local mirror so the UI doesn't flash while saves round-trip.
 *
 * Strategy:
 *   1. On mount, fetch the doctor's id, then their config row.
 *   2. Hold the config in component state.
 *   3. Updates mutate state first (optimistic) and fire a `savePaletteConfig`
 *      in the background. On failure we revert and surface the error so the
 *      settings page can show a toast.
 *
 * Consumers:
 *   - The palette itself (`useCommandContents`) to apply overrides at render
 *     time.
 *   - The settings page at `/dashboard/configuracion/atajos` to edit.
 */

export interface UsePalettePreferencesResult {
  /** Doctor's effective palette config — never null, defaults to empty. */
  config: PaletteConfig;
  /** True until we've finished the initial fetch (or failed). */
  loading: boolean;
  /** True while a save is in flight. */
  saving: boolean;
  /** Error from the latest save, cleared on next mutation. */
  error: string | null;
  /** Replace the entire config. Optimistic + persisted. */
  setConfig: (next: PaletteConfig) => Promise<void>;
  /** Wipe the row — equivalent to restoring defaults. */
  reset: () => Promise<void>;
}

export function usePalettePreferences(): UsePalettePreferencesResult {
  const [config, setConfigState] = useState<PaletteConfig>(EMPTY_PALETTE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setLoading(false);
          return;
        }
        const fetched = await getPaletteConfig(user.id);
        if (!cancelled) setConfigState(fetched);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setConfig = useCallback(async (next: PaletteConfig) => {
    setError(null);
    // Optimistic update first so the UI feels instant.
    const previous = config;
    setConfigState(next);
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      await savePaletteConfig(user.id, next);
    } catch (err) {
      // Revert and surface the error.
      setConfigState(previous);
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [config]);

  const reset = useCallback(async () => {
    setError(null);
    const previous = config;
    setConfigState(EMPTY_PALETTE_CONFIG);
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      await resetPaletteConfig(user.id);
    } catch (err) {
      setConfigState(previous);
      setError(err instanceof Error ? err.message : 'Error al restaurar');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [config]);

  return { config, loading, saving, error, setConfig, reset };
}
