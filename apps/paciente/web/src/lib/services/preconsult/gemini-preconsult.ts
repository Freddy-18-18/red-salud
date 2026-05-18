import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

// -------------------------------------------------------------------
// Gemini-powered pre-consultation summarization (server-only).
// -------------------------------------------------------------------
// The patient writes their symptoms in free text. We hand the text to
// gemini-2.5-flash with a strict schema and a prompt that:
//   - Extracts a clinical brief structured for the doctor
//   - NEVER diagnoses (orientation only)
//   - Stays calm and informative
//   - Surfaces "red-flag" patterns separately so the UI can warn the patient
//
// The structured output goes into `appointments.notes` (with a `[Pre-consulta IA]`
// prefix) so the doctor sees it on the medical side without us touching their
// schema.
// -------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const MODEL = process.env.GOOGLE_GEMINI_MODEL ?? "gemini-2.5-flash";

export type PreconsultSeverity = "leve" | "moderada" | "severa" | "no_clara";

export interface PreconsultBrief {
  chief_complaint: string;
  duration: string;
  severity: PreconsultSeverity;
  associated_symptoms: string[];
  self_medication: string | null;
  questions_for_doctor: string[];
  red_flags: string[];
  needs_urgent_attention: boolean;
}

const SYSTEM_PROMPT = `Eres un asistente de pre-consulta del portal Red-Salud (Venezuela). Lees lo que un paciente escribió sobre sus síntomas y devuelves un resumen ESTRUCTURADO listo para que su médico lo revise antes de la consulta.

REGLAS ESTRICTAS:
1. NUNCA diagnostiques. Solo organizas y resumes lo que el paciente dijo.
2. Tono calmo, breve, profesional. Sin emojis, sin alarmismo.
3. Si la descripción es vaga, pide implícitamente más detalle dejando campos vacíos. NO INVENTES síntomas.
4. "severity" se basa en lo que escribe el paciente: usa "leve" si dice "molesto/leve/poco", "moderada" si dice "incómodo/medio/notorio", "severa" si dice "fuerte/intenso/insoportable", "no_clara" si no se puede inferir.
5. "red_flags" son síntomas que requieren urgencia médica: dolor torácico opresivo, dificultad respiratoria severa, parálisis, sangrado abundante, pérdida de conciencia, convulsiones, signos de ACV. Sólo incluye los que el paciente mencionó.
6. "needs_urgent_attention" es true SOLO si red_flags.length > 0 con riesgo crítico inmediato.
7. "questions_for_doctor" son 1-3 preguntas que el paciente debería plantear en la consulta — útiles, prácticas, NO diagnósticos.
8. Idioma: español neutro de Venezuela. Tutea al paciente con "tú" o no lo trates a él directamente.
9. Cap absoluto: cada string máximo 240 caracteres, listas máximo 5 items.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    "chief_complaint",
    "duration",
    "severity",
    "associated_symptoms",
    "self_medication",
    "questions_for_doctor",
    "red_flags",
    "needs_urgent_attention",
  ],
  properties: {
    chief_complaint: {
      type: Type.STRING,
      description: "Síntoma principal en 1 frase, máximo 200 caracteres.",
    },
    duration: {
      type: Type.STRING,
      description:
        'Cuánto tiempo lleva el síntoma. Ejemplo: "3 días", "desde hace 1 mes". Vacío si no se sabe.',
    },
    severity: {
      type: Type.STRING,
      enum: ["leve", "moderada", "severa", "no_clara"],
    },
    associated_symptoms: {
      type: Type.ARRAY,
      maxItems: 5,
      items: { type: Type.STRING, maxLength: 200 },
    },
    self_medication: {
      type: Type.STRING,
      description:
        "Medicamentos que el paciente dijo haber tomado por su cuenta. Null si no mencionó nada.",
    },
    questions_for_doctor: {
      type: Type.ARRAY,
      maxItems: 3,
      items: { type: Type.STRING, maxLength: 240 },
    },
    red_flags: {
      type: Type.ARRAY,
      maxItems: 5,
      items: { type: Type.STRING, maxLength: 200 },
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

export class PreconsultUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreconsultUnavailableError";
  }
}

export async function summarizePreconsult(
  rawText: string,
): Promise<PreconsultBrief> {
  if (!API_KEY) {
    throw new PreconsultUnavailableError("API key no configurada");
  }

  const ai = getClient();
  const text = rawText.trim().slice(0, 2000); // hard cap on user input

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
        temperature: 0.2,
        topP: 0.9,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
  } catch (e) {
    throw new PreconsultUnavailableError(
      e instanceof Error ? e.message : "Error contactando Gemini",
    );
  }

  const raw = response.text;
  if (!raw) {
    throw new PreconsultUnavailableError("Respuesta vacía de Gemini");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new PreconsultUnavailableError("Respuesta no JSON de Gemini");
  }

  return validateBrief(parsed);
}

function validateBrief(input: unknown): PreconsultBrief {
  if (!input || typeof input !== "object") {
    throw new PreconsultUnavailableError("Forma inesperada en respuesta");
  }
  const o = input as Record<string, unknown>;
  const severity = (() => {
    const s = String(o.severity ?? "no_clara");
    return (
      ["leve", "moderada", "severa", "no_clara"].includes(s) ? s : "no_clara"
    ) as PreconsultSeverity;
  })();

  const arr = (key: string, max: number): string[] => {
    const v = o[key];
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, max);
  };

  return {
    chief_complaint: String(o.chief_complaint ?? "").slice(0, 240),
    duration: String(o.duration ?? "").slice(0, 240),
    severity,
    associated_symptoms: arr("associated_symptoms", 5),
    self_medication:
      typeof o.self_medication === "string" && o.self_medication.trim()
        ? o.self_medication.trim().slice(0, 240)
        : null,
    questions_for_doctor: arr("questions_for_doctor", 3),
    red_flags: arr("red_flags", 5),
    needs_urgent_attention: o.needs_urgent_attention === true,
  };
}

/**
 * Format a brief into the plain-text block that goes into `appointments.notes`.
 * Markdown-ish so the doctor app can render it nicely without parsing JSON.
 */
export function briefToNotes(brief: PreconsultBrief): string {
  const lines: string[] = [];
  lines.push("[Pre-consulta IA]");
  if (brief.chief_complaint) lines.push(`Motivo principal: ${brief.chief_complaint}`);
  if (brief.duration) lines.push(`Duración: ${brief.duration}`);
  lines.push(`Severidad reportada: ${brief.severity}`);
  if (brief.associated_symptoms.length > 0) {
    lines.push(`Síntomas asociados: ${brief.associated_symptoms.join(", ")}`);
  }
  if (brief.self_medication) {
    lines.push(`Auto-medicación: ${brief.self_medication}`);
  }
  if (brief.red_flags.length > 0) {
    lines.push(`Señales de alarma reportadas: ${brief.red_flags.join(", ")}`);
  }
  if (brief.questions_for_doctor.length > 0) {
    lines.push("Preguntas del paciente:");
    for (const q of brief.questions_for_doctor) {
      lines.push(`- ${q}`);
    }
  }
  return lines.join("\n");
}
