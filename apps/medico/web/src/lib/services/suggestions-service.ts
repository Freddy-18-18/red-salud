// TODO: Implement smart consultation-reason suggestions
// This is a stub to allow the app to compile. Replace with real suggestion logic.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface Suggestion {
  reason: string;
  score?: number;
  source?: string;
}

export interface SmartSuggestionsResult {
  suggestions: Suggestion[];
}

export interface SmartSuggestionsParams {
  doctorId: string;
  specialty: string;
  query: string;
  limit: number;
}

/**
 * Get smart consultation-reason suggestions based on the doctor's history and specialty.
 */
export async function getSmartSuggestions(
  _supabase: SupabaseClient,
  _params: SmartSuggestionsParams
): Promise<SmartSuggestionsResult> {
  console.warn('Suggestions service not configured yet. Returning empty results.');
  return { suggestions: [] };
}

/**
 * Get initial suggestions when no search query has been typed yet.
 */
export async function getInitialSuggestions(
  _supabase: SupabaseClient,
  _doctorId: string,
  _specialty: string,
  _limit: number
): Promise<Suggestion[]> {
  console.warn('Suggestions service not configured yet. Returning empty results.');
  return [];
}
