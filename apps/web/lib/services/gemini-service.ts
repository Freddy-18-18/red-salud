// Servicio de integración con Google Gemini AI
// Documentación: https://ai.google.dev/gemini-api/docs

import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar el cliente de Gemini
let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY no está configurada. Por favor, agrega tu API key de Google Gemini en el archivo .env.local. " +
        "Obtén tu API key gratis en: https://aistudio.google.com/app/apikey"
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface MedicalNoteInput {
  motivoConsulta?: string;
  sintomas?: string;
  duracion?: string;
  intensidad?: string;
  factoresAgravantes?: string;
  factoresAliviantes?: string;
  antecedentesMedicos?: string[];
  alergias?: string[];
  medicamentosActuales?: string[];
}

export interface GeneratedMedicalNote {
  notaCompleta: string;
  diagnosticosSugeridos: string[];
  codigosICD11Sugeridos: Array<{
    codigo: string;
    descripcion: string;
    probabilidad: "alta" | "media" | "baja";
  }>;
  planTratamiento?: string;
  examenesSugeridos?: string[];
}

/**
 * Genera una nota médica estructurada usando Gemini AI
 */
export async function generateMedicalNote(
  input: MedicalNoteInput
): Promise<GeneratedMedicalNote> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Eres un asistente médico experto. Genera una nota médica profesional en español basada en la siguiente información del paciente:

${input.motivoConsulta ? `Motivo de consulta: ${input.motivoConsulta}` : ""}
${input.sintomas ? `Síntomas: ${input.sintomas}` : ""}
${input.duracion ? `Duración: ${input.duracion}` : ""}
${input.intensidad ? `Intensidad: ${input.intensidad}` : ""}
${input.factoresAgravantes ? `Factores agravantes: ${input.factoresAgravantes}` : ""}
${input.factoresAliviantes ? `Factores aliviantes: ${input.factoresAliviantes}` : ""}
${input.antecedentesMedicos && input.antecedentesMedicos.length > 0 ? `Antecedentes médicos: ${input.antecedentesMedicos.join(", ")}` : ""}
${input.alergias && input.alergias.length > 0 ? `Alergias: ${input.alergias.join(", ")}` : ""}
${input.medicamentosActuales && input.medicamentosActuales.length > 0 ? `Medicamentos actuales: ${input.medicamentosActuales.join(", ")}` : ""}

Genera una respuesta en formato JSON con la siguiente estructura:
{
  "notaCompleta": "Nota médica completa y profesional con secciones: Motivo de consulta, Historia de la enfermedad actual, Examen físico sugerido, Impresión diagnóstica, Plan de tratamiento",
  "diagnosticosSugeridos": ["diagnóstico 1", "diagnóstico 2"],
  "codigosICD11Sugeridos": [
    {
      "codigo": "código ICD-11 (ej: 5A11)",
      "descripcion": "descripción del diagnóstico",
      "probabilidad": "alta|media|baja"
    }
  ],
  "planTratamiento": "Plan de tratamiento sugerido",
  "examenesSugeridos": ["examen 1", "examen 2"]
}

IMPORTANTE:
- La nota debe ser profesional y seguir el formato SOAP (Subjetivo, Objetivo, Análisis, Plan)
- Los códigos ICD-11 deben ser reales y precisos
- Usa terminología médica apropiada en español
- Sé conservador con los diagnósticos (incluye diagnósticos diferenciales)
- El plan de tratamiento debe ser general (el médico lo ajustará)`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extraer JSON de la respuesta (puede venir con markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) {
      throw new Error("No se pudo extraer JSON de la respuesta de Gemini");
    }

    const parsedResponse: GeneratedMedicalNote = JSON.parse(jsonMatch[0]);
    return parsedResponse;
  } catch (error) {
    console.error("Error generando nota médica con Gemini:", error);
    throw new Error("Error al generar la nota médica con IA");
  }
}

/**
 * Sugiere códigos ICD-11 basados en texto libre
 */
export async function suggestICD11Codes(
  diagnosticoTexto: string
): Promise<Array<{ codigo: string; descripcion: string; confianza: number }>> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres un experto en codificación médica ICD-11. Basándote en el siguiente diagnóstico o descripción médica, sugiere los códigos ICD-11 más apropiados:

"${diagnosticoTexto}"

Responde SOLO con un JSON array con este formato:
[
  {
    "codigo": "código ICD-11 exacto (ej: 5A11, BA00)",
    "descripcion": "descripción del código en español",
    "confianza": 0.95
  }
]

IMPORTANTE:
- Usa SOLO códigos ICD-11 reales y válidos
- Ordena por relevancia (confianza de 0 a 1)
- Máximo 5 sugerencias
- Si no estás seguro, usa confianza baja (< 0.5)`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch || !jsonMatch[0]) {
      return [];
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions;
  } catch (error) {
    console.error("Error sugiriendo códigos ICD-11:", error);
    return [];
  }
}

/**
 * Mejora y estructura una nota médica existente
 */
export async function improveMedicalNote(
  notaActual: string
): Promise<string> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres un asistente médico experto. Mejora y estructura la siguiente nota médica manteniendo toda la información original pero organizándola profesionalmente:

"${notaActual}"

Estructura la nota siguiendo el formato SOAP:
- Subjetivo (S): Motivo de consulta, síntomas reportados por el paciente
- Objetivo (O): Hallazgos del examen físico, signos vitales
- Análisis (A): Impresión diagnóstica, diagnósticos diferenciales
- Plan (P): Plan de tratamiento, medicamentos, seguimiento

Mantén toda la información original pero hazla más clara y profesional. Responde SOLO con la nota mejorada, sin explicaciones adicionales.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error mejorando nota médica:", error);
    throw new Error("Error al mejorar la nota médica");
  }
}

/**
 * Extrae información estructurada de una nota médica en texto libre
 */
export async function extractMedicalInfo(
  notaTexto: string
): Promise<{
  motivoConsulta?: string;
  sintomas?: string[];
  diagnosticos?: string[];
  medicamentos?: string[];
  examenes?: string[];
}> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extrae información estructurada de la siguiente nota médica:

"${notaTexto}"

Responde SOLO con un JSON con este formato:
{
  "motivoConsulta": "motivo principal",
  "sintomas": ["síntoma 1", "síntoma 2"],
  "diagnosticos": ["diagnóstico 1"],
  "medicamentos": ["medicamento 1"],
  "examenes": ["examen 1"]
}

Si algún campo no está presente, omítelo del JSON.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {};
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error extrayendo información médica:", error);
    return {};
  }
}

/**
 * Genera un embedding vectorial para un texto
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error generando embedding:", error);
    throw new Error("Error al generar embedding vectorial");
  }
}
