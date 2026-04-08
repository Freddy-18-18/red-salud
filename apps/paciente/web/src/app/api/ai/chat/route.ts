import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// AI Health Assistant — Chat API Route (Gemini Integration)
// -------------------------------------------------------------------
// Server-side proxy for the AI assistant. Uses Gemini 2.0 Flash
// via REST API. Falls back gracefully when API key is not configured.
// -------------------------------------------------------------------

// --- Constants ---

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 2000;

// --- Types ---

interface ChatRequestBody {
  message: string;
  conversation_id?: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  error?: {
    message?: string;
    code?: number;
  };
}

// --- Patient Context Builder ---

interface PatientContextData {
  conditions: string[];
  medications: string[];
  readings: string[];
  allergies: string | null;
  bloodType: string | null;
}

async function fetchPatientContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<PatientContextData> {
  const context: PatientContextData = {
    conditions: [],
    medications: [],
    readings: [],
    allergies: null,
    bloodType: null,
  };

  try {
    // Fetch in parallel for performance
    const [conditionsRes, prescriptionsRes, readingsRes, detailsRes] =
      await Promise.allSettled([
        supabase
          .from("patient_chronic_conditions")
          .select("condition_name")
          .eq("patient_id", userId)
          .eq("status", "active"),
        supabase
          .from("prescriptions")
          .select("medication_name, dosage")
          .eq("patient_id", userId)
          .eq("status", "active"),
        supabase
          .from("chronic_readings")
          .select("reading_type, value, unit, recorded_at")
          .eq("patient_id", userId)
          .order("recorded_at", { ascending: false })
          .limit(5),
        supabase
          .from("patient_details")
          .select("allergies, blood_type")
          .eq("patient_id", userId)
          .single(),
      ]);

    if (conditionsRes.status === "fulfilled" && conditionsRes.value.data) {
      context.conditions = conditionsRes.value.data.map(
        (c) => c.condition_name
      );
    }

    if (prescriptionsRes.status === "fulfilled" && prescriptionsRes.value.data) {
      context.medications = prescriptionsRes.value.data.map(
        (p) => `${p.medication_name} (${p.dosage})`
      );
    }

    if (readingsRes.status === "fulfilled" && readingsRes.value.data) {
      context.readings = readingsRes.value.data.map(
        (r) => `${r.reading_type}: ${r.value} ${r.unit}`
      );
    }

    if (detailsRes.status === "fulfilled" && detailsRes.value.data) {
      context.allergies = detailsRes.value.data.allergies;
      context.bloodType = detailsRes.value.data.blood_type;
    }
  } catch {
    // Non-critical — assistant works without context
  }

  return context;
}

function buildPatientContextString(ctx: PatientContextData): string {
  const parts: string[] = [];

  if (ctx.conditions.length > 0) {
    parts.push(`Condiciones crónicas: ${ctx.conditions.join(", ")}`);
  }
  if (ctx.medications.length > 0) {
    parts.push(`Medicamentos activos: ${ctx.medications.join(", ")}`);
  }
  if (ctx.readings.length > 0) {
    parts.push(`Lecturas recientes: ${ctx.readings.join("; ")}`);
  }
  if (ctx.allergies) {
    parts.push(`Alergias: ${ctx.allergies}`);
  }
  if (ctx.bloodType) {
    parts.push(`Tipo de sangre: ${ctx.bloodType}`);
  }

  return parts.length > 0
    ? parts.join("\n")
    : "No hay datos clínicos disponibles para este paciente.";
}

// --- System Prompt ---

function buildSystemPrompt(patientContext: string): string {
  return `Eres un asistente de salud virtual de Red Salud, una plataforma de salud venezolana.

REGLAS ESTRICTAS:
- NUNCA diagnostiques. Siempre recomienda consultar con un médico.
- NO prescribas medicamentos.
- Puedes dar información general de salud, explicar términos médicos, y ayudar a prepararse para consultas.
- Si detectas una emergencia (dolor de pecho, dificultad para respirar, sangrado severo), instruye al paciente a llamar al 911 o ir a emergencias INMEDIATAMENTE.
- Responde en español venezolano, de forma clara y empática.
- Sé conciso pero completo.

CONTEXTO DEL PACIENTE (si disponible):
${patientContext}

Usa este contexto para personalizar tus respuestas, pero NUNCA reveles información médica del paciente que él no haya mencionado primero.`;
}

// --- Gemini API Call ---

async function callGemini(
  systemPrompt: string,
  conversationHistory: GeminiContent[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "El asistente de IA no está configurado. Contacta a soporte.";
  }

  const contents: GeminiContent[] = [
    ...conversationHistory,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[AI Chat] Gemini API error:", response.status, errorBody);
    throw new Error("Error al comunicarse con el servicio de IA.");
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.error) {
    console.error("[AI Chat] Gemini error response:", data.error);
    throw new Error("Error al procesar la respuesta de IA.");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("El asistente no pudo generar una respuesta. Intenta reformular tu pregunta.");
  }

  return text;
}

// --- Conversation Persistence ---

async function getOrCreateConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  conversationId: string | undefined,
  firstMessage: string
): Promise<string> {
  // If conversation_id provided, verify it belongs to the user
  if (conversationId) {
    const { data: existing } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("patient_id", userId)
      .single();

    if (existing) {
      return existing.id;
    }
    // If not found or doesn't belong to user, create new
  }

  // Create new conversation with title from first message
  const title = firstMessage.length > 50
    ? firstMessage.slice(0, 47) + "..."
    : firstMessage;

  const { data: newConversation, error } = await supabase
    .from("ai_conversations")
    .insert({ patient_id: userId, title })
    .select("id")
    .single();

  if (error || !newConversation) {
    console.error("[AI Chat] Failed to create conversation:", error);
    throw new Error("Error al crear la conversación.");
  }

  return newConversation.id;
}

async function fetchConversationHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string
): Promise<GeminiContent[]> {
  const { data: messages } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_MESSAGES);

  if (!messages || messages.length === 0) return [];

  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}

async function saveMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  const { error } = await supabase.from("ai_messages").insert([
    {
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    },
    {
      conversation_id: conversationId,
      role: "assistant",
      content: assistantMessage,
    },
  ]);

  if (error) {
    console.error("[AI Chat] Failed to save messages:", error);
    // Non-critical — don't throw, the response was already generated
  }
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit check
    const limited = checkRateLimit(request, "mutation");
    if (limited) return limited;

    // 2. Validate authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }

    // 3. Validate request body
    const body = (await request.json()) as ChatRequestBody;

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: true, message: "El mensaje es requerido." },
        { status: 400 }
      );
    }

    const trimmedMessage = body.message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: true, message: "El mensaje no puede estar vacío." },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: true,
          message: `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres.`,
        },
        { status: 400 }
      );
    }

    // 4. Fetch patient context from Supabase
    const patientContext = await fetchPatientContext(supabase, user.id);
    const patientContextString = buildPatientContextString(patientContext);
    const systemPrompt = buildSystemPrompt(patientContextString);

    // 5. Get or create conversation
    const conversationId = await getOrCreateConversation(
      supabase,
      user.id,
      body.conversation_id,
      trimmedMessage
    );

    // 6. Fetch conversation history if existing conversation
    const conversationHistory = body.conversation_id
      ? await fetchConversationHistory(supabase, conversationId)
      : [];

    // 7. Call Gemini API
    const aiMessage = await callGemini(
      systemPrompt,
      conversationHistory,
      trimmedMessage
    );

    // 8. Save messages to database (non-blocking for response)
    await saveMessages(supabase, conversationId, trimmedMessage, aiMessage);

    // 9. Return response
    return NextResponse.json({
      data: {
        message: aiMessage,
        conversation_id: conversationId,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: true, message: "Solicitud inválida. Verifica los datos enviados." },
        { status: 400 }
      );
    }

    console.error("[AI Chat] Unexpected error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error interno del servidor. Intenta nuevamente.";

    return NextResponse.json(
      { error: true, message },
      { status: 500 }
    );
  }
}
