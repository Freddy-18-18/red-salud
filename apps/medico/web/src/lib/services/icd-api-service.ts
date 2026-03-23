// TODO: Implement WHO ICD-11 API integration
// This is a stub to allow the app to compile. Replace with real ICD-11 API logic.

export interface ICD11Result {
  code: string;
  title: string;
  score?: number;
}

/**
 * Search the WHO ICD-11 API for diagnosis codes matching the given query.
 */
export async function searchICD11(query: string): Promise<ICD11Result[]> {
  console.warn('ICD-11 API service not configured yet. Returning empty results.');
  return [];
}
