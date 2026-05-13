/**
 * @file canonical-tags.ts
 * @description Canonical chronic-condition tags for `patient_details.enfermedades_cronicas[]`.
 *
 * Spec R2 (doctor-capabilities). Soft-match resolves legacy free-text values to
 * the canonical form on read; canonical writes go through the typeahead.
 */

export const CHRONIC_TAGS = [
  'HTA',
  'DM2',
  'DM1',
  'DISLIPIDEMIA',
  'OBESIDAD',
  'ERC',
  'EPOC',
  'HIPOTIROIDISMO',
  'HIPERTIROIDISMO',
] as const;

export type ChronicTag = (typeof CHRONIC_TAGS)[number];

const STRIP_ACCENTS_RE = /[̀-ͯ]/g;

function normalize(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(STRIP_ACCENTS_RE, '')
    .trim()
    .toUpperCase();
}

const CANONICAL_NORMALIZED = new Set<string>(CHRONIC_TAGS.map(normalize));

/**
 * Legacy variants → canonical mapping. Keys are pre-normalized (NFD strip accents + upper).
 * Add entries here when a doctor's free-text matches a known canonical condition.
 */
const LEGACY_MAP: Record<string, ChronicTag> = {
  // HTA
  HIPERTENSION: 'HTA',
  'HIPERTENSION ARTERIAL': 'HTA',
  // DM2
  DIABETES: 'DM2',
  'DIABETES MELLITUS': 'DM2',
  'DIABETES TIPO 2': 'DM2',
  'DM TIPO 2': 'DM2',
  // DM1
  'DIABETES TIPO 1': 'DM1',
  'DM TIPO 1': 'DM1',
  // Dislipidemia
  HIPERCOLESTEROLEMIA: 'DISLIPIDEMIA',
  'COLESTEROL ALTO': 'DISLIPIDEMIA',
  // Obesidad
  SOBREPESO: 'OBESIDAD',
  // ERC
  'ENFERMEDAD RENAL CRONICA': 'ERC',
  'INSUFICIENCIA RENAL': 'ERC',
  // EPOC
  'ENFERMEDAD PULMONAR OBSTRUCTIVA': 'EPOC',
  'ENFERMEDAD PULMONAR OBSTRUCTIVA CRONICA': 'EPOC',
};

/**
 * Normalize a raw chronic-condition string to a canonical tag.
 * Returns `null` when the input is empty, whitespace, or unrecognized.
 */
export function softMatchTag(raw: string): ChronicTag | null {
  if (!raw || !raw.trim()) return null;
  const key = normalize(raw);
  if (CANONICAL_NORMALIZED.has(key)) return key as ChronicTag;
  return LEGACY_MAP[key] ?? null;
}
