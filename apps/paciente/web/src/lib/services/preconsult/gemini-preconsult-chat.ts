import "server-only";
import { GoogleGenAI } from "@google/genai";

// -------------------------------------------------------------------
// Gemini-powered pre-consultation CHAT (multi-turn, server-only).
// -------------------------------------------------------------------
// The single-turn `summarizePreconsult` is good for a one-shot rapid brief,
// but it forces the patient to write everything in one block. The chat flow
// asks clarifying questions ("¿Desde cuándo?", "¿En reposo o en esfuerzo?")
// so the brief that lands in front of the doctor is much higher quality.
//
// We keep the chat history client-side (cheaper, no DB write per turn) and
// hand the whole list to Gemini each turn. Hard caps on history length and
// per-message size keep the request bounded.
// -------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const MODEL = process.env.GOOGLE_GEMINI_MODEL ?? "gemini-2.5-flash";

const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_LEN = 1500;

export type PreconsultChatRole = "user" | "assistant";

export interface PreconsultChatMessage {
  role: PreconsultChatRole;
  text: string;
}

const SYSTEM_PROMPT = `Eres un asistente conversacional de pre-consulta del portal Red-Salud (Venezuela). El paciente está hablando con vos antes de su cita médica. Tu tarea es ayudar a que cuente sus síntomas con detalle clínico útil — para que el médico llegue mejor preparado.

REGLAS ESTRICTAS:
1. NUNCA diagnostiques. NUNCA recomiendes medicamentos.
2. Tono calmo, breve, profesional. Sin emojis. Sin alarmismo.
3. Hace UNA pregunta por turno. Corta, concreta. No interrogues con listas largas.
4. Tus preguntas deben sumar info clínica útil: cuándo empezó, dónde duele, qué lo empeora/mejora, intensidad 1-10, síntomas asociados, antecedentes relevantes, medicamentos tomados, alergias.
5. Si el paciente describe una EMERGENCIA real (dolor torácico opresivo, dificultad respiratoria severa, parálisis, sangrado abundante, pérdida de conciencia, convulsiones, sospecha de ACV, dolor abdominal severo súbito) tu respuesta debe sugerir IR A URGENCIAS YA — sin pánico — y luego ofrecer seguir si los síntomas son leves o si ya está siendo atendido.
6. Cuando creas que ya tenés suficiente info útil, decílo en una sola línea: "Creo que ya tenemos lo necesario para que el médico llegue preparado. ¿Querés revisar y enviar el resumen?"
7. Idioma: español neutro venezolano. Tutea con "tú".
8. Responde SIEMPRE con texto plano. NO uses markdown, NO uses listas, NO formatees. Solo prosa breve.
9. Mantené la respuesta debajo de 280 caracteres. Si es estrictamente necesario explayar, máximo 2 frases cortas.`;

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

export class PreconsultChatUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreconsultChatUnavailableError";
  }
}

/**
 * Send a chat turn. Returns the assistant's reply as a single text string.
 *
 * `history` contains both user and assistant messages in order (excluding the
 * latest user message, which is passed separately as `userMessage`).
 */
export async function preconsultChatTurn(
  history: PreconsultChatMessage[],
  userMessage: string,
): Promise<string> {
  if (!API_KEY) {
    throw new PreconsultChatUnavailableError("API key no configurada");
  }

  const trimmedUser = userMessage.trim().slice(0, MAX_MESSAGE_LEN);
  if (trimmedUser.length === 0) {
    throw new PreconsultChatUnavailableError("Mensaje vacío");
  }

  // Bound the history to avoid runaway prompts. We keep the LAST N turns —
  // the model still benefits from continuity, and the system prompt holds
  // the role anchor.
  const trimmedHistory = history
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: (m.role === "assistant" ? "model" : "user") as "model" | "user",
      parts: [{ text: m.text.slice(0, MAX_MESSAGE_LEN) }],
    }));

  const contents = [
    ...trimmedHistory,
    { role: "user" as const, parts: [{ text: trimmedUser }] },
  ];

  let response;
  try {
    const ai = getClient();
    response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 256,
      },
    });
  } catch (e) {
    throw new PreconsultChatUnavailableError(
      e instanceof Error ? e.message : "Error contactando Gemini",
    );
  }

  const text = response.text?.trim();
  if (!text) {
    throw new PreconsultChatUnavailableError("Respuesta vacía de Gemini");
  }
  return text.slice(0, 600);
}

/**
 * Combine a full chat transcript into a single prompt that the existing
 * `summarizePreconsult` (structured-output) can digest. We tag turns clearly
 * so the synthesis prompt doesn't blur them.
 */
export function chatToSymptomsBlob(history: PreconsultChatMessage[]): string {
  const lines: string[] = [];
  for (const m of history) {
    if (m.role === "user") lines.push(`Paciente: ${m.text}`);
    else lines.push(`Asistente: ${m.text}`);
  }
  return lines.join("\n");
}
