// TODO: Implement Gemini AI integration for ICD-11 code suggestions
// This is a stub to allow the app to compile. Replace with real Gemini API logic.

export interface ICD11Suggestion {
  code: string;
  title: string;
  confidence: number;
}

/**
 * Use Gemini AI to suggest ICD-11 codes based on clinical text.
 */
export async function suggestICD11Codes(
  text: string
): Promise<ICD11Suggestion[]> {
  console.warn(
    'Gemini service not configured yet. Returning empty suggestions.'
  );
  return [];
}
