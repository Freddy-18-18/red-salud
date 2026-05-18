import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

// -------------------------------------------------------------------
// Gemini-powered symptom orientation (server-only).
// -------------------------------------------------------------------
// Strategy:
//   - Caller passes free-text the user wrote ("me duele el pecho desde ayer").
//   - We pass it to gemini-2.5-flash with structured-output schema and a
//     strict system prompt: only suggest specialty mappings, NEVER diagnose,
//     keep tone calm and informative (not alarmist).
//   - The model returns a typed JSON we validate before returning.
// -------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const MODEL = process.env.GOOGLE_GEMINI_MODEL ?? "gemini-2.5-flash";

export interface OrientationSpecialty {
  /** Spanish display name as the user knows it (e.g. "Cardiología"). */
  name: string;
  /** Optional URL slug as stored in our `specialties` table. */
  slug?: string | null;
  /** Confidence 1..10 (10 = very likely). */
  weight: number;
  /** One sentence explaining WHY this specialty fits, calm tone. */
  reason: string;
}

export interface OrientationResult {
  /** Calm, single-paragraph summary. NEVER diagnoses. */
  summary: string;
  /** Up to 4 specialty suggestions, ordered by weight desc. */
  specialties: OrientationSpecialty[];
  /** Plain advice: when to consult, NOT alarmist. */
  advice: string;
  /** True only if input contains text strongly associated with red-flag
   *  symptoms (chest crushing pain, paralysis, severe bleeding, etc). The
   *  UI shows a calm informative banner — never a 911 button. */
  needs_urgent_attention: boolean;
}

const SYSTEM_PROMPT = `Eres un asistente del portal de salud Red-Salud (Venezuela). Tu única tarea es leer una descripción libre que escribe un paciente sobre lo que siente y orientarlo a la especialidad médica adecuada.

REGLAS ESTRICTAS:
1. NUNCA diagnostiques. Tu salida orienta hacia un especialista, no etiqueta enfermedades.
2. Tono calmo, profesional, breve. Sin alarmismos. Sin emojis.
3. Si el texto es trivial, ambiguo o no-médico, sugiere "Medicina General" como única opción y un summary corto.
4. Para cada especialidad, da una razón en una frase de máximo 20 palabras.
5. El campo "needs_urgent_attention" SOLO se marca true si la descripción incluye términos asociados a riesgo crítico inmediato (dolor de pecho opresivo que irradia, dificultad respiratoria severa, parálisis, sangrado abundante, pérdida de conciencia, convulsiones, sospecha de ACV, etc). Cuando es true, "advice" debe sugerir consultar urgencia médica YA — pero sin pánico.
6. Idioma: español rioplatense/venezolano neutro. "Tú" mejor que "vos".
7. Si la descripción tiene menos de 4 palabras útiles, devuelve summary "Necesitamos un poco más de detalle para orientarte mejor", sin specialties.

ESPECIALIDADES VÁLIDAS (usa estos nombres exactos):
Medicina General, Medicina Interna, Cardiología, Pediatría, Ginecología, Dermatología, Oftalmología, Neurología, Psiquiatría, Traumatología y Ortopedia, Endocrinología, Urología, Otorrinolaringología, Gastroenterología, Neumología, Reumatología, Nutrición.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ["summary", "specialties", "advice", "needs_urgent_attention"],
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "Resumen calmo de 1-2 frases sobre lo que el paciente describió.",
    },
    specialties: {
      type: Type.ARRAY,
      maxItems: 4,
      items: {
        type: Type.OBJECT,
        required: ["name", "weight", "reason"],
        properties: {
          name: { type: Type.STRING },
          weight: {
            type: Type.INTEGER,
            description: "Confianza 1..10",
            minimum: 1,
            maximum: 10,
          },
          reason: { type: Type.STRING, maxLength: 240 },
        },
      },
    },
    advice: {
      type: Type.STRING,
      description: "Recomendación breve y calma, máximo 220 caracteres.",
    },
    needs_urgent_attention: { type: Type.BOOLEAN },
  },
};

let cachedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY no está configurada en el entorno servidor.",
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: API_KEY });
  }
  return cachedClient;
}

export class GeminiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiUnavailableError";
  }
}

export async function orientPatient(
  rawText: string,
): Promise<OrientationResult> {
  if (!API_KEY) {
    throw new GeminiUnavailableError("API key no configurada");
  }

  const ai = getClient();
  const text = rawText.trim().slice(0, 800); // hard cap input

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        topP: 0.9,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
  } catch (e) {
    throw new GeminiUnavailableError(
      e instanceof Error ? e.message : "Error contactando Gemini",
    );
  }

  const raw = response.text;
  if (!raw) {
    throw new GeminiUnavailableError("Respuesta vacía de Gemini");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GeminiUnavailableError("Respuesta no JSON de Gemini");
  }

  return validateOrientation(parsed);
}

function validateOrientation(input: unknown): OrientationResult {
  if (!input || typeof input !== "object") {
    throw new GeminiUnavailableError("Forma inesperada en respuesta");
  }
  const o = input as Record<string, unknown>;
  const specialties = Array.isArray(o.specialties) ? o.specialties : [];
  return {
    summary: String(o.summary ?? "").slice(0, 600),
    advice: String(o.advice ?? "").slice(0, 400),
    needs_urgent_attention: o.needs_urgent_attention === true,
    specialties: specialties
      .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
      .map((s) => ({
        name: String(s.name ?? "").trim(),
        weight: Math.max(1, Math.min(10, Number(s.weight) || 1)),
        reason: String(s.reason ?? "").slice(0, 240),
      }))
      .filter((s) => s.name.length > 0)
      .slice(0, 4),
  };
}
