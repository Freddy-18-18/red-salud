// -------------------------------------------------------------------
// AI Assistant Service
// -------------------------------------------------------------------
// Client-side service for the AI health assistant. Handles API calls
// and localStorage-based conversation persistence.
// -------------------------------------------------------------------

// --- Types ---

export interface PatientContext {
  conditions: string[];
  medications: string[];
  recentLabs: string[];
}

export interface AIResponse {
  response: string;
  suggestions: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface StoredConversation {
  patientId: string;
  messages: Message[];
  updatedAt: string;
}

// --- Constants ---

const STORAGE_KEY_PREFIX = "red-salud:ai-chat";
const MAX_STORED_MESSAGES = 100;

// --- Helper Functions ---

function getStorageKey(patientId: string): string {
  return `${STORAGE_KEY_PREFIX}:${patientId}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// --- Service Functions ---

/**
 * Send a message to the AI assistant and get a response.
 */
export async function sendMessage(
  message: string,
  patientContext?: PatientContext,
): Promise<AIResponse> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context: patientContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.message || `Error del servidor (${response.status})`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<AIResponse>;
}

/**
 * Get conversation history from localStorage for a patient.
 */
export function getConversationHistory(patientId: string): Message[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(getStorageKey(patientId));
    if (!stored) return [];

    const conversation = JSON.parse(stored) as StoredConversation;
    return conversation.messages || [];
  } catch {
    return [];
  }
}

/**
 * Save a message to localStorage conversation history.
 */
export function saveMessageToHistory(
  patientId: string,
  message: Message,
): void {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey(patientId);
    const existing = localStorage.getItem(key);
    let messages: Message[] = [];

    if (existing) {
      const conversation = JSON.parse(existing) as StoredConversation;
      messages = conversation.messages || [];
    }

    messages.push(message);

    // Trim to max stored messages
    if (messages.length > MAX_STORED_MESSAGES) {
      messages = messages.slice(-MAX_STORED_MESSAGES);
    }

    const conversation: StoredConversation = {
      patientId,
      messages,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(conversation));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

/**
 * Clear conversation history for a patient.
 */
export function clearConversationHistory(patientId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getStorageKey(patientId));
  } catch {
    // fail silently
  }
}

/**
 * Create a user message object.
 */
export function createUserMessage(content: string): Message {
  return {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an assistant message object from an AI response.
 */
export function createAssistantMessage(aiResponse: AIResponse): Message {
  return {
    id: generateMessageId(),
    role: "assistant",
    content: aiResponse.response,
    timestamp: new Date().toISOString(),
    suggestions: aiResponse.suggestions,
  };
}

/**
 * Get a list of suggested questions to start a conversation.
 */
export function getSuggestedQuestions(): string[] {
  return [
    "¿Qué significa mi resultado de glucosa?",
    "¿Puedo tomar ibuprofeno y acetaminofén juntos?",
    "Tengo dolor de cabeza frecuente, ¿qué puede ser?",
    "¿Cuáles son los valores normales de presión arterial?",
    "¿Qué debo hacer si tengo fiebre?",
    "¿Cómo puedo mejorar mi calidad de sueño?",
    "¿Qué especialista necesito para dolor de espalda?",
    "¿Cada cuánto debo hacerme exámenes de sangre?",
  ];
}
