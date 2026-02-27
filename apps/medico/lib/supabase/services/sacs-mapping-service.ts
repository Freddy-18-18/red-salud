// ============================================
// SACS SPECIALTY MAPPING SERVICE
// Auto-resolves SACS specialty names to system slugs
// Uses DB function + client-side cache for performance
// ============================================

import { createClient } from "@/lib/supabase/client";

interface SacsMapping {
  id: string;
  sacs_code: string | null;
  sacs_name_pattern: string;
  specialty_slug: string;
  confidence: "exact" | "keyword" | "manual";
}

interface SacsResolutionResult {
  slug: string | null;
  confidence: "exact" | "keyword" | "manual" | "none";
  matchedPattern: string | null;
}

// In-memory cache for mappings (loaded once per session)
let cachedMappings: SacsMapping[] | null = null;

/**
 * Load all SACS mappings from DB (cached)
 */
async function loadMappings(): Promise<SacsMapping[]> {
  if (cachedMappings) return cachedMappings;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("sacs_specialty_mapping")
    .select("*")
    .order("confidence", { ascending: true }); // exact first

  if (error) {
    console.error("[SACS Mapping] Error loading mappings:", error);
    return [];
  }

  cachedMappings = (data as SacsMapping[]) || [];
  return cachedMappings;
}

/**
 * Resolve a SACS specialty name to a system slug
 * Uses client-side matching with cached mappings
 *
 * @param sacsEspecialidad - Free-text specialty from SACS (e.g., "CARDIOLOGÍA")
 * @returns Resolution result with slug, confidence, and matched pattern
 */
export async function resolveSacsToSlug(
  sacsEspecialidad: string
): Promise<SacsResolutionResult> {
  if (!sacsEspecialidad?.trim()) {
    return { slug: null, confidence: "none", matchedPattern: null };
  }

  const normalized = sacsEspecialidad
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  const mappings = await loadMappings();

  // 1. Try exact match
  const exactMatch = mappings.find((m) => {
    const pattern = m.sacs_name_pattern
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
    return m.confidence === "exact" && pattern === normalized;
  });

  if (exactMatch) {
    return {
      slug: exactMatch.specialty_slug,
      confidence: "exact",
      matchedPattern: exactMatch.sacs_name_pattern,
    };
  }

  // 2. Try keyword match (pattern contained in input)
  const keywordMatches = mappings
    .filter((m) => {
      if (m.confidence !== "keyword") return false;
      const pattern = m.sacs_name_pattern
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
      return normalized.includes(pattern);
    })
    .sort(
      (a, b) => b.sacs_name_pattern.length - a.sacs_name_pattern.length
    ); // longest match first

  const kwMatch = keywordMatches[0];
  if (kwMatch) {
    return {
      slug: kwMatch.specialty_slug,
      confidence: "keyword",
      matchedPattern: kwMatch.sacs_name_pattern,
    };
  }

  // 3. Try fuzzy: input contains any exact pattern
  const fuzzyMatch = mappings
    .filter((m) => {
      if (m.confidence !== "exact") return false;
      const pattern = m.sacs_name_pattern
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
      return normalized.includes(pattern);
    })
    .sort(
      (a, b) => b.sacs_name_pattern.length - a.sacs_name_pattern.length
    );

  const fuzMatch = fuzzyMatch[0];
  if (fuzMatch) {
    return {
      slug: fuzMatch.specialty_slug,
      confidence: "exact",
      matchedPattern: fuzMatch.sacs_name_pattern,
    };
  }

  return { slug: null, confidence: "none", matchedPattern: null };
}

/**
 * Resolve via DB function (server-side, for use in edge functions / API routes)
 * This uses the PostgreSQL function directly
 */
export async function resolveSacsToSlugServer(
  sacsEspecialidad: string
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("resolve_sacs_to_slug", {
    sacs_specialty: sacsEspecialidad,
  });

  if (error) {
    console.error("[SACS Mapping] RPC error:", error);
    return null;
  }

  return data as string | null;
}

/**
 * Clear the cached mappings (use when mappings are updated)
 */
export function clearSacsMappingCache(): void {
  cachedMappings = null;
}
