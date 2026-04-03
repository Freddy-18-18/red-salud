import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import {
  type AIResponse,
  type Message,
  type PatientContext,
  clearConversationHistory,
  createAssistantMessage,
  createUserMessage,
  getConversationHistory,
  getSuggestedQuestions,
  saveMessageToHistory,
  sendMessage as sendMessageToAPI,
} from "@/lib/services/ai-assistant-service";

// --- Types ---

interface UseAIAssistantReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  suggestedQuestions: string[];
}

// --- Hook ---

/**
 * Hook to manage the AI health assistant chat.
 *
 * Handles message state, conversation persistence, patient context
 * loading from Supabase, and API communication.
 */
export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const patientContextRef = useRef<PatientContext | null>(null);
  const initializedRef = useRef(false);

  // Load user session and conversation history on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setPatientId(user.id);

      // Load existing conversation from localStorage
      const history = getConversationHistory(user.id);
      if (history.length > 0) {
        setMessages(history);
      }

      // Load patient context from Supabase (best-effort, non-blocking)
      loadPatientContext(user.id);
    }

    initialize();
  }, []);

  // Load patient context from profile data
  async function loadPatientContext(userId: string) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("conditions, medications, allergies")
        .eq("id", userId)
        .single();

      if (profile) {
        patientContextRef.current = {
          conditions: Array.isArray(profile.conditions)
            ? profile.conditions
            : [],
          medications: Array.isArray(profile.medications)
            ? profile.medications
            : [],
          recentLabs: [], // No lab results table linked yet
        };
      }
    } catch {
      // Non-critical — assistant works without context
    }
  }

  // Send a message and process the AI response
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      setError(null);

      // Add user message immediately
      const userMessage = createUserMessage(trimmed);
      setMessages((prev) => [...prev, userMessage]);

      // Persist user message
      if (patientId) {
        saveMessageToHistory(patientId, userMessage);
      }

      setLoading(true);

      try {
        const aiResponse: AIResponse = await sendMessageToAPI(
          trimmed,
          patientContextRef.current ?? undefined,
        );

        const assistantMessage = createAssistantMessage(aiResponse);
        setMessages((prev) => [...prev, assistantMessage]);

        // Persist assistant message
        if (patientId) {
          saveMessageToHistory(patientId, assistantMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al comunicarse con el asistente. Intenta nuevamente.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loading, patientId],
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    if (patientId) {
      clearConversationHistory(patientId);
    }
  }, [patientId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    suggestedQuestions: getSuggestedQuestions(),
  };
}
