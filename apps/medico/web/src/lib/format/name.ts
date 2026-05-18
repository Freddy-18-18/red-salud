/**
 * @file lib/format/name.ts
 * @description Display helpers for human names.
 *
 * Why this exists: SACS and several legacy import paths persist full names in
 * ALL CAPS (e.g. "MARIANELLA SUAREZ CRESPO"). Rendering that raw screams at
 * the doctor in every breadcrumb, greeting, and email. We never mutate the
 * source — we only normalize at the presentation layer.
 *
 * Locale: es-VE. Connectors stay lowercase except when they're the first word.
 */

const SPANISH_LOWERCASE_CONNECTORS = new Set([
  'de',
  'del',
  'la',
  'las',
  'los',
  'y',
  'e',
  'da',
  'do',
  'das',
  'dos',
]);

/**
 * Convert a human name to Title Case while preserving:
 *  - Spanish connectors ("de", "la", "del", etc.) lowercase except at start
 *  - Compound hyphenated names (e.g. "Suárez-García")
 *  - Apostrophe names (e.g. "D'Angelo")
 *
 * Idempotent: re-running on an already Title-Cased string is a no-op.
 * Safe on empty / whitespace-only input — returns the trimmed input verbatim.
 */
export function toTitleCaseName(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  return trimmed
    .toLocaleLowerCase('es-VE')
    .split(/(\s+)/) // keep whitespace tokens so multi-space input round-trips cleanly
    .map((token, idx) => {
      if (/^\s+$/.test(token)) return token;
      // Connectors stay lowercase unless they're the leading word.
      if (idx > 0 && SPANISH_LOWERCASE_CONNECTORS.has(token)) return token;
      // Split on internal punctuation that should capitalize the next char.
      return token
        .split(/([-'])/)
        .map((part) => {
          if (part === '-' || part === "'") return part;
          if (!part) return part;
          return part.charAt(0).toLocaleUpperCase('es-VE') + part.slice(1);
        })
        .join('');
    })
    .join('');
}

/**
 * Returns the first token of a Title-Cased name, falling back to a default.
 * Used by the greeting layer to render "Hola, Dr. Marianella" without leaking
 * the full surname into the heading.
 */
export function firstNameOf(
  raw: string | null | undefined,
  fallback = 'Doctor',
): string {
  const titled = toTitleCaseName(raw);
  if (!titled) return fallback;
  const [first] = titled.split(/\s+/);
  return first || fallback;
}
