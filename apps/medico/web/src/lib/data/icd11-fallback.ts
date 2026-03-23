// TODO: Populate with a curated local ICD-11 dataset for offline/fallback search
// This is a stub to allow the app to compile.

export interface ICD11FallbackResult {
  code: string;
  title: string;
}

/**
 * Search a local ICD-11 dataset as fallback when the WHO API is unavailable.
 */
export function searchLocalICD11(query: string): ICD11FallbackResult[] {
  console.warn(
    `ICD-11 local fallback not populated yet. No results for "${query}".`
  );
  return [];
}
