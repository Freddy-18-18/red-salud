/**
 * @file normalize-postgrado.ts
 * @description Normalize raw SACS postgrado strings to lowercase kebab-case slugs.
 *
 * Spec R4 (doctor-capabilities):
 *   - Mapped postgrado MUST resolve to the row's slug + confidence.
 *   - Unmapped postgrado MUST NOT block resolution; logger MUST be called.
 *
 * Reads `sacs_postgrado_mapping` rows (passed in by the caller — pure function,
 * no DB access here).
 */

export interface PostgradoMappingRow {
  sacs_name_pattern: string;
  postgrado_slug: string;
  confidence: 'exact' | 'keyword' | 'fuzzy';
}

export interface NormalizeResult {
  slug: string;
  raw: string;
  confidence: 'exact' | 'keyword' | 'fuzzy';
}

const UNMAPPED_LOG_PREFIX = '[normalize-postgrado] unmapped postgrado:';

/**
 * Normalize raw postgrado strings from SACS via the mapping table.
 *
 * @param raw     Raw postgrado strings from `sacs_data.data.postgrados[].postgrado`.
 * @param mapping Rows from `sacs_postgrado_mapping`.
 * @param logger  Optional callback invoked once per unmapped string for ops review.
 * @returns       NormalizeResult[] (mapped only; unmapped are skipped + logged).
 */
export function normalizePostgrados(
  raw: string[],
  mapping: PostgradoMappingRow[],
  logger?: (msg: string) => void,
): NormalizeResult[] {
  const lookup = new Map(mapping.map((m) => [m.sacs_name_pattern, m]));
  const out: NormalizeResult[] = [];
  for (const r of raw) {
    const trimmed = r.trim();
    const row = lookup.get(trimmed);
    if (row) {
      out.push({
        slug: row.postgrado_slug,
        raw: trimmed,
        confidence: row.confidence,
      });
      continue;
    }
    logger?.(`${UNMAPPED_LOG_PREFIX} ${trimmed}`);
  }
  return out;
}
