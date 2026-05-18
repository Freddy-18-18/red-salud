'use client';

import { supabase } from '@/lib/supabase/client';

import {
  EMPTY_PALETTE_CONFIG,
  parsePaletteConfig,
  type PaletteConfig,
} from './types';

/**
 * @file lib/palette/service.ts
 * @description Read/write the doctor's command-palette personalisation.
 *
 * One row per doctor in `doctor_palette_preferences`. The row may not exist
 * yet — we treat "no row" and "empty config" as equivalent, so the caller
 * never has to handle a null case.
 *
 * RLS enforces ownership, so every query is implicitly scoped to the calling
 * doctor's row. We pass `doctorId` to keep call sites explicit (testing +
 * server-component compat) instead of trusting the session globally.
 */

const TABLE = 'doctor_palette_preferences';

export async function getPaletteConfig(doctorId: string): Promise<PaletteConfig> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('config')
    .eq('doctor_id', doctorId)
    .maybeSingle();

  if (error) {
    // Table missing or RLS denied — degrade to the empty config so the
    // palette still works.
    return EMPTY_PALETTE_CONFIG;
  }
  if (!data) return EMPTY_PALETTE_CONFIG;
  return parsePaletteConfig(data.config);
}

/**
 * Upsert the doctor's full config. Uses `upsert` so we never need a separate
 * insert/update branch in the UI. The trigger `dpp_touch_updated_at` keeps
 * `updated_at` accurate.
 */
export async function savePaletteConfig(
  doctorId: string,
  config: PaletteConfig,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { doctor_id: doctorId, config },
      { onConflict: 'doctor_id' },
    );
  if (error) throw error;
}

/**
 * Delete the row — equivalent to "restore defaults" because reads of a
 * missing row degrade to `EMPTY_PALETTE_CONFIG`.
 */
export async function resetPaletteConfig(doctorId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('doctor_id', doctorId);
  if (error) throw error;
}
